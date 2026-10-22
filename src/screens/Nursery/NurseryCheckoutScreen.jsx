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

const initialAddress = user => ({
  fullName: user?.fullName || user?.name || '',
  phoneNumber: user?.phoneNumber || user?.phone || '',
  address: user?.address || '',
  village: user?.village || '',
  taluka: user?.taluka || '',
  district: user?.district || '',
  state: user?.state || '',
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
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();

  const user = useSelector(state => state.auth.user);
  const { cart, loaded } = useSelector(state => state.nurseryCart);
  const placing = useSelector(state => state.nurseryOrder.placing);

  const [form, setForm] = useState(() => initialAddress(user));
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
        'Order placed!',
        `Pay ${formatRupees(
          order?.total,
        )} in cash when your plants arrive. Sellers will confirm soon.`,
        {
          primaryLabel: 'Track Order',
          secondaryLabel: 'Keep Shopping',
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
        primaryLabel: 'Review Cart',
        secondaryLabel: 'Close',
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
          title="Checkout"
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
            eyebrow="Checkout"
            title="Where should we deliver?"
            subtitle="Cash on delivery. Pay only when the plants reach you."
          >
            <View style={styles.heroSteps}>
              {['Cart', 'Address', 'Place order'].map((label, index) => (
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
                title="Your cart is empty"
                message="Add some plants before checking out."
                actionLabel="Browse Plants"
                onAction={() => navigation.navigate(NURSERY_ROUTES.HOME)}
              />
            ) : (
              <>
                {/* ADDRESS */}
                <SectionHeading
                  icon={<UserRound size={16} color={C.green} />}
                  title="Receiver"
                  subtitle="Who will receive the plants"
                />
                <FormCard>
                  <Field label="Full name *">
                    <FormInput
                      value={form.fullName}
                      onChangeText={value => setField('fullName', value)}
                      placeholder="Receiver name"
                      maxLength={100}
                      style={inputStyle('fullName')}
                    />
                  </Field>
                  <Field
                    label="Phone number *"
                    hint="The seller calls this number for delivery."
                  >
                    <FormInput
                      value={form.phoneNumber}
                      onChangeText={value => setField('phoneNumber', value)}
                      placeholder="10 digit mobile number"
                      keyboardType="phone-pad"
                      maxLength={15}
                      style={inputStyle('phoneNumber')}
                    />
                  </Field>
                </FormCard>

                <SectionHeading
                  icon={<MapPin size={16} color={C.blue} />}
                  color={C.blue}
                  title="Delivery address"
                />
                <FormCard>
                  <Field label="House / street / landmark *">
                    <FormInput
                      value={form.address}
                      onChangeText={value => setField('address', value)}
                      placeholder="e.g. Near Hanuman temple, Shivaji Nagar"
                      maxLength={300}
                      multiline
                      textAlignVertical="top"
                      style={[styles.textArea, inputStyle('address')]}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Village">
                        <FormInput
                          value={form.village}
                          onChangeText={value => setField('village', value)}
                          placeholder="Village"
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="Taluka">
                        <FormInput
                          value={form.taluka}
                          onChangeText={value => setField('taluka', value)}
                          placeholder="Taluka"
                        />
                      </Field>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="District">
                        <FormInput
                          value={form.district}
                          onChangeText={value => setField('district', value)}
                          placeholder="District"
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="State">
                        <FormInput
                          value={form.state}
                          onChangeText={value => setField('state', value)}
                          placeholder="State"
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label="Pincode *">
                    <FormInput
                      value={form.pincode}
                      onChangeText={value =>
                        setField('pincode', value.replace(/\D/g, ''))
                      }
                      placeholder="6 digit pincode"
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
                  title="Order summary"
                  subtitle={
                    sellers.length > 1
                      ? `From ${sellers.length} nurseries · each sends their own plants`
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
                    label={`Plants (${cart.totalItems})`}
                    value={formatRupees(cart.subtotal)}
                  />
                  <InfoRow
                    label="Delivery"
                    value={
                      cart.deliveryFee ? formatRupees(cart.deliveryFee) : 'FREE'
                    }
                  />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>To pay on delivery</Text>
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
                    <Text style={styles.payTitle}>Cash on delivery</Text>
                    <Text style={styles.payText}>
                      Pay the delivery person in cash or UPI when your plants
                      arrive.
                    </Text>
                  </View>
                  <CircleCheck size={20} color={C.green} />
                </View>

                <View style={styles.safeRow}>
                  <ShieldCheck size={14} color={C.muted} />
                  <Text style={styles.safeText}>
                    You can cancel free of charge until the plants are
                    dispatched.
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
            <Text style={styles.bottomLabel}>Pay on delivery</Text>
            <Text style={styles.bottomPrice}>{formatRupees(cart.total)}</Text>
          </View>
          <MarketButton
            label="Place Order"
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
