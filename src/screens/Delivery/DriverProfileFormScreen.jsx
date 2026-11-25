import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BadgeCheck,
  IndianRupee,
  LocateFixed,
  MapPin,
  Save,
  Truck,
  UserRound,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {useLiveRegionPrefill} from '../../context/LocationContext';
import MarketHero, {TopInset} from '../../components/market/MarketHero';
import {MarketButton} from '../../components/market/MarketBits';
import {MARKET_COLORS as C} from '../../components/market/theme';
import FeedbackModal, {useFeedbackModal} from '../../components/common/FeedbackModal';
import {
  Field,
  FormCard,
  FormInput,
  SectionHeading,
  TagInput,
} from '../../components/labour/FormBits';
import VehicleBadge from '../../components/delivery/VehicleBadge';
import {vehicleLabel} from '../../components/delivery/vehicles';
import useDeliveryMeta from '../../components/delivery/useDeliveryMeta';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {
  fetchMyDeliveryPartner,
  saveMyDeliveryPartner,
} from '../../redux/slices/deliverySlice';
import getCurrentCoordinates from '../../utils/getCurrentCoordinates';
import {buildPartnerPayload, formatWeight, hasPoint} from '../../utils/deliveryFormat';
import {formatRupees} from '../../utils/marketFormat';

const RATE_FIELDS = ['capacityKg', 'baseFare', 'perKmRate', 'minFare'];

const toText = value => (value === null || value === undefined ? '' : String(value));

/*
 * Register as a delivery partner, or edit the driver profile.
 */
export default function DriverProfileFormScreen({navigation}) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const {vehicleTypes} = useDeliveryMeta();

  const user = useSelector(state => state.auth.user);
  const {myPartner, myPartnerStatus, savingPartner} = useSelector(state => state.delivery);
  const isCreate = !myPartner;

  const [form, setForm] = useState(() => ({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    vehicleType: '',
    vehicleName: '',
    vehicleNumber: '',
    capacityKg: '',
    baseFare: '',
    perKmRate: '',
    minFare: '',
    state: user?.state || '',
    district: user?.district || '',
    taluka: user?.taluka || '',
    village: user?.village || '',
    about: '',
    languages: [],
    location: null,
  }));
  const [locating, setLocating] = useState(false);
  // rate fields the driver typed themselves are kept when the vehicle changes
  const touched = useRef(new Set());

  useLiveRegionPrefill(setForm);

  useEffect(() => {
    if (myPartnerStatus === 'idle') dispatch(fetchMyDeliveryPartner());
  }, [dispatch, myPartnerStatus]);

  // Editing: fill the form from the saved profile.
  useEffect(() => {
    if (!myPartner) return;
    RATE_FIELDS.forEach(key => touched.current.add(key));
    setForm(prev => ({
      ...prev,
      fullName: myPartner.fullName || '',
      phoneNumber: myPartner.phoneNumber || '',
      vehicleType: myPartner.vehicleType || '',
      vehicleName: myPartner.vehicleName || '',
      vehicleNumber: myPartner.vehicleNumber || '',
      capacityKg: toText(myPartner.capacityKg),
      baseFare: toText(myPartner.baseFare),
      perKmRate: toText(myPartner.perKmRate),
      minFare: toText(myPartner.minFare),
      state: myPartner.state || '',
      district: myPartner.district || '',
      taluka: myPartner.taluka || '',
      village: myPartner.village || '',
      about: myPartner.about || '',
      languages: myPartner.languages || [],
      location: myPartner.location || null,
    }));
  }, [myPartner]);

  const setField = (key, value) => {
    if (RATE_FIELDS.includes(key)) touched.current.add(key);
    setForm(prev => ({...prev, [key]: value}));
  };

  // Picking a vehicle fills the suggested capacity and rates.
  const chooseVehicle = vehicle => {
    setForm(prev => {
      const next = {...prev, vehicleType: vehicle.key};
      for (const key of RATE_FIELDS) {
        if (!touched.current.has(key)) next[key] = toText(vehicle[key]);
      }
      return next;
    });
  };

  const selectedVehicle = vehicleTypes.find(item => item.key === form.vehicleType);

  const captureLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoordinates();
      if (coords) {
        setForm(prev => ({...prev, location: {lat: coords.latitude, lng: coords.longitude}}));
      } else {
        feedback.error(t('delivery.book.locationTitle'), t('delivery.book.locationFailed'));
      }
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    const {payload, error} = buildPartnerPayload(form);
    if (error) {
      feedback.error(t('delivery.form.checkTitle'), error);
      return;
    }

    try {
      await dispatch(saveMyDeliveryPartner({data: payload, isCreate})).unwrap();
      feedback.success(
        isCreate ? t('delivery.form.registered') : t('delivery.form.saved'),
        isCreate ? t('delivery.form.registeredText') : undefined,
        {
          dismissable: false,
          primaryLabel: t('delivery.form.goDashboard'),
          onPrimary: () => navigation.replace(DELIVERY_ROUTES.DRIVER_DASHBOARD),
        },
      );
    } catch (message) {
      feedback.error(t('delivery.form.saveFailed'), message);
    }
  };

  const rateInput = (key, label, hintValue) => (
    <View style={styles.flex}>
      <Field label={label} hint={hintValue}>
        <FormInput
          value={form[key]}
          onChangeText={value => setField(key, value.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          placeholder="0"
        />
      </Field>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <MarketHero
            compact
            gradient="amber"
            onBack={() => navigation.goBack()}
            eyebrow={isCreate ? t('delivery.form.eyebrowNew') : t('delivery.form.eyebrowEdit')}
            title={isCreate ? t('delivery.form.titleNew') : t('delivery.form.titleEdit')}
            subtitle={isCreate ? t('delivery.form.subtitleNew') : undefined}>
            {isCreate && (
              <View style={styles.perks}>
                {['perk1', 'perk2', 'perk3'].map(key => (
                  <View key={key} style={styles.perk}>
                    <BadgeCheck size={13} color="#FFE3B0" />
                    <Text style={styles.perkText}>{t(`delivery.form.${key}`)}</Text>
                  </View>
                ))}
              </View>
            )}
          </MarketHero>

          <View style={styles.body}>
            {/* YOU */}
            <SectionHeading
              icon={<UserRound size={16} color={C.green} />}
              title={t('delivery.form.aboutYou')}
            />
            <FormCard>
              <Field label={t('delivery.form.fullName')}>
                <FormInput
                  value={form.fullName}
                  onChangeText={value => setField('fullName', value)}
                  placeholder={t('delivery.form.fullName')}
                  maxLength={100}
                />
              </Field>
              <Field label={t('delivery.form.phone')} hint={t('delivery.form.phoneHint')}>
                <FormInput
                  value={form.phoneNumber}
                  onChangeText={value => setField('phoneNumber', value)}
                  placeholder="98XXXXXXXX"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </Field>
              <Field label={t('delivery.form.languages')}>
                <TagInput
                  value={form.languages}
                  onChange={value => setField('languages', value)}
                  placeholder={t('delivery.form.languagesPh')}
                  max={10}
                />
              </Field>
              <Field label={t('delivery.form.about')}>
                <FormInput
                  value={form.about}
                  onChangeText={value => setField('about', value)}
                  placeholder={t('delivery.form.aboutPh')}
                  maxLength={300}
                  multiline
                  textAlignVertical="top"
                  style={styles.textArea}
                />
              </Field>
            </FormCard>

            {/* VEHICLE */}
            <SectionHeading
              icon={<Truck size={16} color={C.blue} />}
              color={C.blue}
              title={t('delivery.form.vehicle')}
            />
            <View style={styles.vehicleGrid}>
              {vehicleTypes.map(vehicle => {
                const selected = form.vehicleType === vehicle.key;
                return (
                  <TouchableOpacity
                    key={vehicle.key}
                    activeOpacity={0.85}
                    onPress={() => chooseVehicle(vehicle)}
                    style={[styles.vehicleTile, selected && styles.vehicleTileOn]}>
                    <VehicleBadge type={vehicle.key} size={40} />
                    <Text style={[styles.vehicleName, selected && styles.vehicleNameOn]} numberOfLines={1}>
                      {vehicleLabel(vehicle.key)}
                    </Text>
                    <Text style={styles.vehicleSub}>
                      {t('delivery.home.upTo', {weight: formatWeight(vehicle.capacityKg)})}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FormCard>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label={t('delivery.form.vehicleNumber')}>
                    <FormInput
                      value={form.vehicleNumber}
                      onChangeText={value => setField('vehicleNumber', value.toUpperCase())}
                      placeholder="MH 12 AB 1234"
                      autoCapitalize="characters"
                      maxLength={20}
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label={t('delivery.form.vehicleName')}>
                    <FormInput
                      value={form.vehicleName}
                      onChangeText={value => setField('vehicleName', value)}
                      placeholder={t('delivery.form.vehicleNamePh')}
                      maxLength={80}
                    />
                  </Field>
                </View>
              </View>
              <View style={styles.row}>
                {rateInput(
                  'capacityKg',
                  t('delivery.form.capacity'),
                  selectedVehicle
                    ? t('delivery.form.suggested', {value: formatWeight(selectedVehicle.capacityKg)})
                    : undefined,
                )}
              </View>
            </FormCard>

            {/* RATES */}
            <SectionHeading
              icon={<IndianRupee size={16} color={C.green} />}
              title={t('delivery.form.rates')}
              subtitle={t('delivery.form.ratesSub')}
            />
            <FormCard>
              <View style={styles.row}>
                {rateInput(
                  'baseFare',
                  t('delivery.details.baseFare'),
                  selectedVehicle && t('delivery.form.suggested', {value: formatRupees(selectedVehicle.baseFare)}),
                )}
                {rateInput(
                  'perKmRate',
                  t('delivery.details.perKm'),
                  selectedVehicle && t('delivery.form.suggested', {value: formatRupees(selectedVehicle.perKmRate)}),
                )}
              </View>
              <View style={styles.row}>
                {rateInput(
                  'minFare',
                  t('delivery.details.minimum'),
                  selectedVehicle && t('delivery.form.suggested', {value: formatRupees(selectedVehicle.minFare)}),
                )}
                <View style={styles.flex}>
                  <View style={styles.example}>
                    <Text style={styles.exampleLabel}>{t('delivery.form.example')}</Text>
                    <Text style={styles.exampleValue}>
                      {formatRupees(
                        Math.max(
                          Number(form.minFare) || 0,
                          (Number(form.baseFare) || 0) + (Number(form.perKmRate) || 0) * 10,
                        ),
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </FormCard>

            {/* AREA */}
            <SectionHeading
              icon={<MapPin size={16} color={C.red} />}
              color={C.red}
              title={t('delivery.form.area')}
              subtitle={t('delivery.form.areaSub')}
            />
            <FormCard>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label={t('delivery.form.districtRequired')}>
                    <FormInput
                      value={form.district}
                      onChangeText={value => setField('district', value)}
                      placeholder={t('delivery.book.district')}
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label={t('delivery.form.state')}>
                    <FormInput
                      value={form.state}
                      onChangeText={value => setField('state', value)}
                      placeholder={t('delivery.form.state')}
                    />
                  </Field>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label={t('delivery.form.taluka')}>
                    <FormInput
                      value={form.taluka}
                      onChangeText={value => setField('taluka', value)}
                      placeholder={t('delivery.form.taluka')}
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label={t('delivery.book.village')}>
                    <FormInput
                      value={form.village}
                      onChangeText={value => setField('village', value)}
                      placeholder={t('delivery.book.village')}
                    />
                  </Field>
                </View>
              </View>
              <TouchableOpacity style={styles.locate} onPress={captureLocation} disabled={locating}>
                {locating ? (
                  <ActivityIndicator size="small" color={C.blue} />
                ) : (
                  <LocateFixed size={16} color={C.blue} />
                )}
                <Text style={styles.locateText}>
                  {hasPoint(form.location)
                    ? t('delivery.form.baseSet')
                    : t('delivery.form.setBase')}
                </Text>
              </TouchableOpacity>
            </FormCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 14) + 6}]}>
        <MarketButton
          label={isCreate ? t('delivery.form.register') : t('delivery.form.save')}
          icon={<Save size={16} color={C.white} />}
          loading={savingPartner}
          onPress={handleSave}
          style={styles.flex}
        />
      </View>

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  flex: {flex: 1},
  scrollContent: {paddingBottom: 30},
  body: {paddingHorizontal: 16},
  row: {flexDirection: 'row', gap: 12},
  textArea: {height: 80, paddingTop: 12},

  perks: {marginTop: 14, gap: 6},
  perk: {flexDirection: 'row', alignItems: 'center', gap: 6},
  perkText: {color: C.white, fontSize: 12, fontWeight: '800'},

  vehicleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12},
  vehicleTile: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  vehicleTileOn: {borderColor: C.green, backgroundColor: C.lightGreen},
  vehicleName: {fontSize: 11.5, fontWeight: '900', color: C.dark, marginTop: 6},
  vehicleNameOn: {color: C.green},
  vehicleSub: {fontSize: 10, fontWeight: '700', color: C.muted, marginTop: 1},

  example: {
    marginTop: 14,
    height: 70,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  exampleLabel: {fontSize: 10.5, fontWeight: '800', color: C.muted, textAlign: 'center'},
  exampleValue: {fontSize: 17, fontWeight: '900', color: C.green, marginTop: 2},

  locate: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 4},
  locateText: {fontSize: 12.5, fontWeight: '900', color: C.blue},

  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -4},
    elevation: 12,
  },
});
