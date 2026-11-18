import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Banknote,
  CircleCheck,
  MapPin,
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useLiveRegionPrefill } from '../../context/LocationContext';
import MarketHero, { TopInset } from '../../components/market/MarketHero';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  MarketButton,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import {
  Field,
  FormCard,
  FormInput,
  SectionHeading,
} from '../../components/labour/FormBits';
import { PlantImage } from '../../components/nursery/NurseryBits';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  fetchNurseryCart,
  syncAdjustedCartItems,
} from '../../redux/slices/nurseryCartSlice';
import { placeNurseryOrder } from '../../redux/slices/nurseryOrderSlice';
import { formatRupees } from '../../utils/marketFormat';
import { validateAddress } from '../../utils/nurseryFormat';
import {useTranslation} from 'react-i18next';

const initialAddress = user => ({
  fullName: user?.fullName || user?.name || '',
  phoneNumber: user?.phoneNumber || user?.phone || '',
  address: user?.address || '',
  village: user?.village || '',
  taluka: user?.taluka || '',
  district: '',
  state: '',
  pincode: user?.pincode || '',
});

/*
 * Cart items grouped by seller, for the summary.
 */
const groupCartBySeller = items => {
  const groups = new Map();

  for (const item of items) {
    const seller = item.plant?.seller || {};
    const key = String(seller.userId || 'seller');

    if (!groups.has(key)) {
      groups.set(key, { key, name: seller.name || 'Nursery', items: [] });
    }
    groups.get(key).items.push(item);
  }

  return [...groups.values()];
};

export default function NurseryCheckoutScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();

  const user = useSelector(state => state.auth.user);
  const { cart, loaded } = useSelector(state => state.nurseryCart);
  const placing = useSelector(state => state.nurseryOrder.placing);

  const [form, setForm] = useState(() => initialAddress(user));
  useLiveRegionPrefill(setForm);
  const [errorField, setErrorField] = useState(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchNurseryCart());
    }, [dispatch]),
  );

  const setField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    if (errorField === key) setErrorField(null);
  };

  const items = cart.items || [];
  const sellers = groupCartBySeller(items);

  const handlePlace = async () => {
    const { address, error, field } = validateAddress(form);

    if (error) {
      setErrorField(field);
      feedback.error('Check delivery details', error);
      return;
    }

    try {
      await dispatch(syncAdjustedCartItems()).unwrap();
      const result = await dispatch(placeNurseryOrder(address)).unwrap();
      const order = result?.data;

      feedback.success(
        t('nurseryCheckout.orderPlaced'),
        t('nurseryCheckout.payInCashWhenYour', {v1: formatRupees(
          order?.total,
        )}),
        {
          primaryLabel: t('nurseryCheckout.trackOrder'),
          secondaryLabel: t('nurseryCheckout.keepShopping'),
          dismissable: false,
          onPrimary: () =>
            navigation.replace(NURSERY_ROUTES.ORDER_DETAILS, {
              orderId: order?._id,
            }),
          onSecondary: () => navigation.navigate(NURSERY_ROUTES.HOME),
        },
      );
    } catch (failure) {
      dispatch(fetchNurseryCart());
      feedback.error('Could not place order', String(failure), {
        primaryLabel: t('nurseryCheckout.reviewCart'),
        secondaryLabel: t('common.close'),
        onPrimary: () => navigation.navigate(NURSERY_ROUTES.CART),
      });
    }
  };

  const inputStyle = key => errorField === key && styles.inputError;

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <MarketHero
          compact
          gradient="forest"
          onBack={() => navigation.goBack()}
          title={t('nurseryCheckout.checkout')}
        />
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <MarketHero
            compact
            gradient="forest"
            onBack={() => navigation.goBack()}
            eyebrow={t('nurseryCheckout.checkout')}
            title={t('nurseryCheckout.whereShouldWeDeliver')}
            subtitle={t('nurseryCheckout.cashOnDeliveryPayOnly')}
          >
            <View style={styles.heroSteps}>
              {['Cart', 'Address', t('nurseryCheckout.placeOrder2')].map((label, index) => (
                <View key={label} style={styles.heroStep}>
                  <View
                    style={[
                      styles.heroStepDot,
                      index <= 1 && styles.heroStepDotDone,
                    ]}
                  >
                    {index === 0 ? (
                      <CircleCheck size={13} color={C.greenDark} />
                    ) : (
                      <Text
                        style={[
                          styles.heroStepNumber,
                          index === 1 && styles.heroStepNumberDone,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.heroStepLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </MarketHero>

          <View style={styles.body}>
            {!items.length ? (
              <EmptyState
                title={t('nurseryCheckout.yourCartIsEmpty')}
                message={t('nurseryCheckout.addSomePlantsBeforeChecking')}
                actionLabel={t('nurseryCheckout.browsePlants')}
                onAction={() => navigation.navigate(NURSERY_ROUTES.HOME)}
              />
            ) : (
              <>
                {/* ADDRESS */}
                <SectionHeading
                  icon={<UserRound size={16} color={C.green} />}
                  title={t('nurseryCheckout.receiver')}
                  subtitle={t('nurseryCheckout.whoWillReceiveThePlants')}
                />
                <FormCard>
                  <Field label={t('nurseryCheckout.fullName')}>
                    <FormInput
                      value={form.fullName}
                      onChangeText={value => setField('fullName', value)}
                      placeholder={t('nurseryCheckout.receiverName')}
                      maxLength={100}
                      style={inputStyle('fullName')}
                    />
                  </Field>
                  <Field
                    label={t('nurseryCheckout.phoneNumber')}
                    hint={t('nurseryCheckout.theSellerCallsThisNumber')}
                  >
                    <FormInput
                      value={form.phoneNumber}
                      onChangeText={value => setField('phoneNumber', value)}
                      placeholder={t('nurseryCheckout.10DigitMobileNumber')}
                      keyboardType="phone-pad"
                      maxLength={15}
                      style={inputStyle('phoneNumber')}
                    />
                  </Field>
                </FormCard>

                <SectionHeading
                  icon={<MapPin size={16} color={C.blue} />}
                  color={C.blue}
                  title={t('nurseryCheckout.deliveryAddress')}
                />
                <FormCard>
                  <Field label={t('nurseryCheckout.houseStreetLandmark')}>
                    <FormInput
                      value={form.address}
                      onChangeText={value => setField('address', value)}
                      placeholder={t('nurseryCheckout.eGNearHanumanTemple')}
                      maxLength={300}
                      multiline
                      textAlignVertical="top"
                      style={[styles.textArea, inputStyle('address')]}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label={t('nurseryCheckout.village')}>
                        <FormInput
                          value={form.village}
                          onChangeText={value => setField('village', value)}
                          placeholder={t('nurseryCheckout.village')}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label={t('nurseryCheckout.taluka')}>
                        <FormInput
                          value={form.taluka}
                          onChangeText={value => setField('taluka', value)}
                          placeholder={t('nurseryCheckout.taluka')}
                        />
                      </Field>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label={t('nurseryCheckout.district')}>
                        <FormInput
                          value={form.district}
                          onChangeText={value => setField('district', value)}
                          placeholder={t('nurseryCheckout.district')}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label={t('nurseryCheckout.state')}>
                        <FormInput
                          value={form.state}
                          onChangeText={value => setField('state', value)}
                          placeholder={t('nurseryCheckout.state')}
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label={t('nurseryCheckout.pincode')}>
                    <FormInput
                      value={form.pincode}
                      onChangeText={value =>
                        setField('pincode', value.replace(/\D/g, ''))
                      }
                      placeholder={t('nurseryCheckout.6DigitPincode')}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={inputStyle('pincode')}
                    />
                  </Field>
                </FormCard>

                {/* SUMMARY */}
                <SectionHeading
                  icon={<Store size={16} color={C.orange} />}
                  color={C.orange}
                  title={t('nurseryCheckout.orderSummary')}
                  subtitle={
                    sellers.length > 1
                      ? t('nurseryCheckout.fromNurseriesEachSendsTheir', {length: sellers.length})
                      : `From ${sellers[0]?.name}`
                  }
                />
                <View style={styles.card}>
                  {sellers.map((group, groupIndex) => (
                    <View
                      key={group.key}
                      style={groupIndex > 0 && styles.sellerGap}
                    >
                      {sellers.length > 1 && (
                        <Text style={styles.sellerName}>{group.name}</Text>
                      )}
                      {group.items.map(item => (
                        <View key={item._id} style={styles.summaryRow}>
                          <PlantImage
                            plant={item.plant}
                            style={styles.summaryImage}
                            iconSize={18}
                          />
                          <View style={styles.flex}>
                            <Text style={styles.summaryName} numberOfLines={1}>
                              {item.plant?.name}
                            </Text>
                            <Text style={styles.summaryMeta}>
                              {item.quantity} ×{' '}
                              {formatRupees(item.plant?.price)}
                            </Text>
                          </View>
                          <Text style={styles.summaryTotal}>
                            {formatRupees(item.itemTotal)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  <View style={styles.divider} />
                  <InfoRow
                    label={t('nurseryCheckout.plants', {totalItems: cart.totalItems})}
                    value={formatRupees(cart.subtotal)}
                  />
                  <InfoRow
                    label={t('nurseryCheckout.delivery')}
                    value={
                      cart.deliveryFee ? formatRupees(cart.deliveryFee) : 'FREE'
                    }
                  />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('nurseryCheckout.toPayOnDelivery')}</Text>
                    <Text style={styles.totalValue}>
                      {formatRupees(cart.total)}
                    </Text>
                  </View>
                </View>

                {/* PAYMENT */}
                <View style={[styles.card, styles.payCard]}>
                  <View style={styles.payIcon}>
                    <Banknote size={20} color={C.green} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.payTitle}>{t('nurseryCheckout.cashOnDelivery')}</Text>
                    <Text style={styles.payText}>
                      {t('nurseryCheckout.payTheDeliveryPersonIn')}
                    </Text>
                  </View>
                  <CircleCheck size={20} color={C.green} />
                </View>

                <View style={styles.safeRow}>
                  <ShieldCheck size={14} color={C.muted} />
                  <Text style={styles.safeText}>
                    {t('nurseryCheckout.youCanCancelFreeOf')}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {items.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          <View style={styles.flex}>
            <Text style={styles.bottomLabel}>{t('nurseryCheckout.payOnDelivery')}</Text>
            <Text style={styles.bottomPrice}>{formatRupees(cart.total)}</Text>
          </View>
          <MarketButton
            label={t('nurseryCheckout.placeOrder')}
            icon={<CircleCheck size={17} color={C.white} />}
            loading={placing}
            onPress={handlePlace}
            style={styles.flexWide}
          />
        </View>
      )}

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12 },

  heroSteps: { flexDirection: 'row', gap: 14, marginTop: 16 },
  heroStep: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroStepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStepDotDone: { backgroundColor: C.white, borderColor: C.white },
  heroStepNumber: { color: C.white, fontSize: 11, fontWeight: '900' },
  heroStepNumberDone: { color: C.greenDark },
  heroStepLabel: { color: C.white, fontSize: 11.5, fontWeight: '800' },

  inputError: { borderColor: C.red, backgroundColor: '#FFF8F7' },
  textArea: { height: 76, paddingTop: 12 },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    ...MARKET_SHADOW,
  },
  sellerGap: { marginTop: 12 },
  sellerName: {
    fontSize: 11.5,
    fontWeight: '900',
    color: C.orange,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  summaryImage: { width: 42, height: 42, borderRadius: 12 },
  summaryName: { fontSize: 13, fontWeight: '800', color: C.dark },
  summaryMeta: { fontSize: 11.5, fontWeight: '600', color: C.muted },
  summaryTotal: { fontSize: 13.5, fontWeight: '900', color: C.dark },
  divider: { height: 1, backgroundColor: '#F0F2F1', marginVertical: 6 },
  totalRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, fontWeight: '800', color: C.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: C.green },

  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.green,
  },
  payIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitle: { fontSize: 14, fontWeight: '900', color: C.dark },
  payText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  safeText: { flex: 1, fontSize: 11.5, fontWeight: '600', color: C.muted },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bottomLabel: { fontSize: 11, color: C.muted, fontWeight: '700' },
  bottomPrice: {
    fontSize: 19,
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});
