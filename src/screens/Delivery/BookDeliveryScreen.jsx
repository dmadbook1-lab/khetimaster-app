import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  Clock,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Package,
  Route,
  Send,
  Smartphone,
  Star,
  Zap,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {useLocation} from '../../context/LocationContext';
import MarketHero, {TopInset} from '../../components/market/MarketHero';
import {MarketButton} from '../../components/market/MarketBits';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../../components/market/theme';
import FeedbackModal, {useFeedbackModal} from '../../components/common/FeedbackModal';
import PersonAvatar from '../../components/labour/PersonAvatar';
import {
  Field,
  FormCard,
  FormInput,
  PickerField,
  SectionHeading,
  SelectChips,
} from '../../components/labour/FormBits';
import VehicleBadge from '../../components/delivery/VehicleBadge';
import {vehicleLabel} from '../../components/delivery/vehicles';
import useDeliveryMeta from '../../components/delivery/useDeliveryMeta';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {getDeliveryQuoteApi} from '../../api/deliveryApi';
import {createDeliveryBooking} from '../../redux/slices/deliverySlice';
import getCurrentCoordinates from '../../utils/getCurrentCoordinates';
import getAddressFromCoordinates from '../../utils/getAddressFromCoordinates';
import {
  buildDeliveryPayload,
  estimateDistanceKm,
  estimateFare,
  formatClock,
  formatKm,
  formatMinutes,
  formatRate,
  formatWeight,
  formatWhen,
  hasPoint,
  stopLabel,
} from '../../utils/deliveryFormat';
import {formatRupees} from '../../utils/marketFormat';
import {tOpt} from '../../utils/tOpt';

const QUICK_KM = [5, 10, 20, 50];
const QUICK_KG = [50, 200, 500, 1000];

const emptyStop = () => ({
  address: '',
  village: '',
  district: '',
  state: '',
  lat: null,
  lng: null,
  contactName: '',
  contactPhone: '',
});

// Next quarter hour at least `minutes` from `from`.
const roundedLater = (minutes, from = Date.now()) => {
  const date = new Date(from + minutes * 60000);
  date.setSeconds(0, 0);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15);
  return date;
};

export default function BookDeliveryScreen({navigation, route}) {
  const {t} = useTranslation();
  const {partner, pickupDistrict} = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const {location: live} = useLocation();

  const user = useSelector(state => state.auth.user);
  const creating = useSelector(state => state.delivery.creating);
  const {goodsTypes, settings} = useDeliveryMeta();

  const canBookNow = partner.tripState === 'available';

  const [form, setForm] = useState(() => ({
    partnerId: partner._id,
    pickup: {
      ...emptyStop(),
      village: user?.village || '',
      district: pickupDistrict || partner.district || '',
      state: user?.state || partner.state || '',
      contactName: user?.fullName || '',
      contactPhone: user?.phoneNumber || '',
    },
    drop: emptyStop(),
    distanceKm: '',
    goodsType: '',
    weightKg: '',
    description: '',
    scheduleType: canBookNow ? 'now' : 'scheduled',
    pickupAt: (partner.currentTrip?.busyUntil
      ? roundedLater(15, new Date(partner.currentTrip.busyUntil).getTime())
      : roundedLater(60)
    ).toISOString(),
    paymentMethod: 'cod',
    customerNotes: '',
  }));

  const [locating, setLocating] = useState(false);
  // 'date' | 'time' | null
  const [picker, setPicker] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);

  const setField = (key, value) => setForm(prev => ({...prev, [key]: value}));
  const setStop = (which, key, value) =>
    setForm(prev => ({...prev, [which]: {...prev[which], [key]: value}}));

  /*
   * Pickup coordinates from the live location, if already known.
   */
  useEffect(() => {
    if (!live?.latitude || hasPoint(form.pickup)) return;

    setForm(prev => ({
      ...prev,
      pickup: {
        ...prev.pickup,
        lat: live.latitude,
        lng: live.longitude,
        village: prev.pickup.village || live.city || '',
        state: prev.pickup.state || live.state || '',
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.latitude, live?.longitude]);

  const fillCurrentLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoordinates();
      if (!coords) {
        feedback.error(t('delivery.book.locationTitle'), t('delivery.book.locationFailed'));
        return;
      }
      const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
      setForm(prev => ({
        ...prev,
        pickup: {
          ...prev.pickup,
          lat: coords.latitude,
          lng: coords.longitude,
          village: address?.city || prev.pickup.village,
          district: address?.district || prev.pickup.district,
          state: address?.state || prev.pickup.state,
        },
      }));
    } finally {
      setLocating(false);
    }
  };

  const gpsKm = estimateDistanceKm(form.pickup, form.drop, settings.roadFactor);
  const distanceKm = gpsKm ?? Number(form.distanceKm);
  const localEstimate = estimateFare(partner, distanceKm);
  const districtMismatch =
    !!form.pickup.district.trim() &&
    form.pickup.district.trim().toLowerCase() !== String(partner.district).trim().toLowerCase();

  const built = useMemo(
    () => buildDeliveryPayload(form, {partner, settings}),
    [form, partner, settings],
  );

  /*
   * Live quote from the server: exact fare, distance and ETA, plus any
   * reason the booking would be refused (district, busy, capacity...).
   */
  const payloadKey = built.payload ? JSON.stringify(built.payload) : '';

  useEffect(() => {
    if (!payloadKey) {
      setQuote(null);
      setQuoteError('');
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoting(true);
      try {
        const result = await getDeliveryQuoteApi(JSON.parse(payloadKey));
        if (!cancelled) {
          setQuote(result.quote);
          setQuoteError('');
        }
      } catch (error) {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(error.response?.data?.message || error.message);
        }
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [payloadKey]);

  const openMaps = () => {
    const origin = hasPoint(form.pickup)
      ? `${form.pickup.lat},${form.pickup.lng}`
      : [form.pickup.address, stopLabel(form.pickup), form.pickup.state].filter(Boolean).join(', ');
    const destination = [form.drop.address, stopLabel(form.drop), form.drop.state || form.pickup.state]
      .filter(Boolean)
      .join(', ');

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        origin,
      )}&destination=${encodeURIComponent(destination)}&travelmode=driving`,
    ).catch(() => {});
  };

  const handlePickerChange = (event, date) => {
    const target = picker;
    setPicker(null);
    if (event.type !== 'set' || !date || !target) return;

    const current = new Date(form.pickupAt);

    if (target === 'date') {
      current.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setField('pickupAt', current.toISOString());
      if (Platform.OS === 'android') setTimeout(() => setPicker('time'), 250);
    } else {
      current.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setField('pickupAt', current.toISOString());
    }
  };

  const total = quote?.totalAmount ?? localEstimate;

  const handleSubmit = () => {
    const {payload, error} = built;

    if (error) {
      feedback.error(t('delivery.book.checkTitle'), error);
      return;
    }
    if (quoteError) {
      feedback.error(t('delivery.book.cantBookTitle'), quoteError);
      return;
    }

    feedback.confirm({
      title: t('delivery.book.confirmTitle', {name: partner.fullName}),
      message: t('delivery.book.confirmText', {
        goods: tOpt(payload.goodsType),
        from: stopLabel(payload.pickup),
        to: stopLabel(payload.drop),
        when:
          payload.scheduleType === 'now'
            ? t('delivery.book.rightNow')
            : formatWhen(payload.pickupAt),
        amount: formatRupees(total),
      }),
      confirmLabel: t('delivery.book.sendRequest'),
      onConfirm: async () => {
        try {
          const result = await dispatch(createDeliveryBooking(payload)).unwrap();
          navigation.replace(DELIVERY_ROUTES.TRIP, {bookingId: result.booking._id});
        } catch (failure) {
          feedback.error(t('delivery.book.cantBookTitle'), failure?.message, {
            ...(failure?.bookingId && {
              primaryLabel: t('delivery.details.viewTrip'),
              secondaryLabel: t('common.close'),
              onPrimary: () =>
                navigation.replace(DELIVERY_ROUTES.TRIP, {bookingId: failure.bookingId}),
            }),
          });
        }
      },
    });
  };

  const renderStop = which => {
    const stop = form[which];
    const isPickup = which === 'pickup';

    return (
      <FormCard>
        {isPickup && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.locateButton}
            onPress={fillCurrentLocation}
            disabled={locating}>
            {locating ? (
              <ActivityIndicator size="small" color={C.blue} />
            ) : (
              <LocateFixed size={16} color={C.blue} />
            )}
            <Text style={styles.locateText}>
              {hasPoint(stop) ? t('delivery.book.locationSet') : t('delivery.book.useLocation')}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label={t('delivery.book.village')}>
              <FormInput
                value={stop.village}
                onChangeText={value => setStop(which, 'village', value)}
                placeholder={t('delivery.book.village')}
              />
            </Field>
          </View>
          <View style={styles.flex}>
            <Field label={isPickup ? t('delivery.book.districtRequired') : t('delivery.book.district')}>
              <FormInput
                value={stop.district}
                onChangeText={value => setStop(which, 'district', value)}
                placeholder={t('delivery.book.district')}
                style={isPickup && districtMismatch ? styles.inputError : undefined}
              />
            </Field>
          </View>
        </View>
        {isPickup && districtMismatch && (
          <Text style={styles.errorHint}>
            {t('delivery.book.districtMismatch', {district: partner.district})}
          </Text>
        )}
        <Field label={t('delivery.book.address')}>
          <FormInput
            value={stop.address}
            onChangeText={value => setStop(which, 'address', value)}
            placeholder={
              isPickup ? t('delivery.book.pickupAddressPh') : t('delivery.book.dropAddressPh')
            }
            maxLength={300}
          />
        </Field>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label={t('delivery.book.contactName')}>
              <FormInput
                value={stop.contactName}
                onChangeText={value => setStop(which, 'contactName', value)}
                placeholder={t('delivery.book.optional')}
              />
            </Field>
          </View>
          <View style={styles.flex}>
            <Field label={t('delivery.book.contactPhone')}>
              <FormInput
                value={stop.contactPhone}
                onChangeText={value => setStop(which, 'contactPhone', value)}
                placeholder={t('delivery.book.optional')}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </Field>
          </View>
        </View>
      </FormCard>
    );
  };

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
            gradient="steel"
            onBack={() => navigation.goBack()}
            eyebrow={t('delivery.book.eyebrow')}
            title={t('delivery.book.title')}>
            <View style={styles.driverCard}>
              <View>
                <PersonAvatar name={partner.fullName} image={partner.profileImage} size={52} />
                <VehicleBadge type={partner.vehicleType} size={24} style={styles.vehicleDot} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.driverName} numberOfLines={1}>
                  {partner.fullName}
                </Text>
                <Text style={styles.driverVehicle} numberOfLines={1}>
                  {vehicleLabel(partner.vehicleType)} · {partner.vehicleNumber}
                </Text>
                <View style={styles.inline}>
                  <Star size={11} color={C.gold} fill={C.gold} />
                  <Text style={styles.driverMeta}>
                    {partner.totalReviews ? `${partner.rating} · ` : ''}
                    {formatRate(partner)} · {t('delivery.home.upTo', {weight: formatWeight(partner.capacityKg)})}
                  </Text>
                </View>
              </View>
            </View>
          </MarketHero>

          <View style={styles.body}>
            {/* PICKUP */}
            <SectionHeading
              icon={<MapPin size={16} color={C.green} />}
              title={t('delivery.book.pickupFrom')}
              subtitle={t('delivery.book.pickupSub', {district: partner.district})}
            />
            {renderStop('pickup')}

            {/* DROP */}
            <SectionHeading
              icon={<MapPin size={16} color={C.red} />}
              color={C.red}
              title={t('delivery.book.dropTo')}
            />
            {renderStop('drop')}

            {/* DISTANCE */}
            <SectionHeading
              icon={<Route size={16} color={C.blue} />}
              color={C.blue}
              title={t('delivery.book.distance')}
              subtitle={
                gpsKm !== null ? t('delivery.book.distanceGps') : t('delivery.book.distanceManual')
              }
            />
            <FormCard>
              {gpsKm !== null ? (
                <Text style={styles.bigValue}>{formatKm(gpsKm)}</Text>
              ) : (
                <>
                  <Field label={t('delivery.book.approxKm')}>
                    <FormInput
                      value={form.distanceKm}
                      onChangeText={value => setField('distanceKm', value.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="12"
                    />
                  </Field>
                  <View style={styles.quickRow}>
                    {QUICK_KM.map(km => (
                      <TouchableOpacity
                        key={km}
                        style={[styles.quick, Number(form.distanceKm) === km && styles.quickOn]}
                        onPress={() => setField('distanceKm', String(km))}>
                        <Text
                          style={[styles.quickText, Number(form.distanceKm) === km && styles.quickTextOn]}>
                          {t('delivery.kmValue', { n: km })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              <TouchableOpacity style={styles.mapsLink} onPress={openMaps}>
                <MapIcon size={14} color={C.blue} />
                <Text style={styles.mapsText}>{t('delivery.book.checkMaps')}</Text>
              </TouchableOpacity>
            </FormCard>

            {/* GOODS */}
            <SectionHeading
              icon={<Package size={16} color={C.orange} />}
              color={C.orange}
              title={t('delivery.book.whatSending')}
            />
            <FormCard>
              <Field label={t('delivery.book.goodsType')}>
                <SelectChips
                  options={goodsTypes}
                  value={form.goodsType}
                  onChange={value => setField('goodsType', value)}
                />
              </Field>
              <Field
                label={t('delivery.book.weight')}
                hint={t('delivery.book.weightHint', {weight: formatWeight(partner.capacityKg)})}>
                <FormInput
                  value={form.weightKg}
                  onChangeText={value => setField('weightKg', value.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  placeholder="200"
                  style={Number(form.weightKg) > partner.capacityKg ? styles.inputError : undefined}
                />
              </Field>
              <View style={styles.quickRow}>
                {QUICK_KG.filter(kg => kg <= partner.capacityKg).map(kg => (
                  <TouchableOpacity
                    key={kg}
                    style={[styles.quick, Number(form.weightKg) === kg && styles.quickOn]}
                    onPress={() => setField('weightKg', String(kg))}>
                    <Text style={[styles.quickText, Number(form.weightKg) === kg && styles.quickTextOn]}>
                      {formatWeight(kg)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label={t('delivery.book.details')}>
                <FormInput
                  value={form.description}
                  onChangeText={value => setField('description', value)}
                  placeholder={t('delivery.book.detailsPh')}
                  maxLength={500}
                  multiline
                  textAlignVertical="top"
                  style={styles.textArea}
                />
              </Field>
            </FormCard>

            {/* WHEN */}
            <SectionHeading
              icon={<Clock size={16} color={C.blue} />}
              color={C.blue}
              title={t('delivery.book.when')}
            />
            <FormCard>
              <View style={[styles.row, styles.whenRow]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!canBookNow}
                  onPress={() => setField('scheduleType', 'now')}
                  style={[
                    styles.whenOption,
                    form.scheduleType === 'now' && styles.whenOn,
                    !canBookNow && styles.whenDisabled,
                  ]}>
                  <Zap size={18} color={form.scheduleType === 'now' ? C.white : C.green} />
                  <Text style={[styles.whenTitle, form.scheduleType === 'now' && styles.whenTextOn]}>
                    {t('delivery.book.now')}
                  </Text>
                  <Text style={[styles.whenSub, form.scheduleType === 'now' && styles.whenTextOn]}>
                    {canBookNow
                      ? t('delivery.book.nowSub', {minutes: settings.reachPickupMinutes || 15})
                      : partner.tripState === 'on_trip'
                      ? t('delivery.book.busyUntil', {time: formatClock(partner.currentTrip?.busyUntil)})
                      : t('delivery.book.driverOffline')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setField('scheduleType', 'scheduled')}
                  style={[styles.whenOption, form.scheduleType === 'scheduled' && styles.whenOn]}>
                  <CalendarClock
                    size={18}
                    color={form.scheduleType === 'scheduled' ? C.white : C.blue}
                  />
                  <Text
                    style={[styles.whenTitle, form.scheduleType === 'scheduled' && styles.whenTextOn]}>
                    {t('delivery.book.schedule')}
                  </Text>
                  <Text
                    style={[styles.whenSub, form.scheduleType === 'scheduled' && styles.whenTextOn]}>
                    {t('delivery.book.scheduleSub')}
                  </Text>
                </TouchableOpacity>
              </View>

              {form.scheduleType === 'scheduled' && (
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Field label={t('delivery.book.date')}>
                      <PickerField
                        icon={<CalendarClock size={16} color={C.green} />}
                        value={formatWhen(form.pickupAt).split(',')[0]}
                        onPress={() => setPicker('date')}
                      />
                    </Field>
                  </View>
                  <View style={styles.flex}>
                    <Field label={t('delivery.book.time')}>
                      <PickerField
                        icon={<Clock size={16} color={C.green} />}
                        value={formatClock(form.pickupAt)}
                        onPress={() => setPicker('time')}
                      />
                    </Field>
                  </View>
                </View>
              )}
            </FormCard>

            {/* PAYMENT */}
            <SectionHeading
              icon={<Banknote size={16} color={C.green} />}
              title={t('delivery.book.payment')}
              subtitle={t('delivery.book.paymentSub')}
            />
            <FormCard>
              <View style={[styles.row, styles.whenRow]}>
                {[
                  {key: 'cod', icon: Banknote, label: t('delivery.pay.cod')},
                  {key: 'upi', icon: Smartphone, label: t('delivery.pay.upi')},
                ].map(({key, icon: Icon, label}) => {
                  const on = form.paymentMethod === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.85}
                      onPress={() => setField('paymentMethod', key)}
                      style={[styles.payOption, on && styles.payOn]}>
                      <Icon size={17} color={on ? C.green : C.muted} />
                      <Text style={[styles.payText, on && styles.payTextOn]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Field label={t('delivery.book.note')}>
                <FormInput
                  value={form.customerNotes}
                  onChangeText={value => setField('customerNotes', value)}
                  placeholder={t('delivery.book.notePh')}
                  maxLength={500}
                />
              </Field>
            </FormCard>

            {/* FARE */}
            <View style={styles.fareCard}>
              <View style={styles.fareHeader}>
                <Text style={styles.fareTitle}>{t('delivery.book.fare')}</Text>
                {quoting && <ActivityIndicator size="small" color={C.green} />}
              </View>

              {quoteError ? (
                <View style={styles.quoteError}>
                  <AlertTriangle size={16} color={C.red} />
                  <Text style={styles.quoteErrorText}>{quoteError}</Text>
                </View>
              ) : quote ? (
                <>
                  <View style={styles.etaRow}>
                    <View style={styles.etaBox}>
                      <Text style={styles.etaValue}>{formatKm(quote.distanceKm)}</Text>
                      <Text style={styles.etaLabel}>{t('delivery.book.distance')}</Text>
                    </View>
                    <View style={styles.etaBox}>
                      <Text style={styles.etaValue}>
                        {formatMinutes(quote.estimatedDurationMinutes)}
                      </Text>
                      <Text style={styles.etaLabel}>{t('delivery.book.tripTime')}</Text>
                    </View>
                    <View style={styles.etaBox}>
                      <Text style={styles.etaValue}>{formatClock(quote.estimatedDeliveryAt)}</Text>
                      <Text style={styles.etaLabel}>{t('delivery.book.deliveredBy')}</Text>
                    </View>
                  </View>
                  <View style={styles.fareLine}>
                    <Text style={styles.fareLabel}>{t('delivery.details.baseFare')}</Text>
                    <Text style={styles.fareValue}>{formatRupees(quote.baseFare)}</Text>
                  </View>
                  <View style={styles.fareLine}>
                    <Text style={styles.fareLabel}>
                      {t('delivery.book.distanceFare', {
                        km: formatKm(quote.distanceKm),
                        rate: quote.perKmRate,
                      })}
                    </Text>
                    <Text style={styles.fareValue}>{formatRupees(quote.distanceFare)}</Text>
                  </View>
                  {quote.totalAmount > quote.baseFare + quote.distanceFare && (
                    <View style={styles.fareLine}>
                      <Text style={styles.fareLabel}>{t('delivery.book.minFareApplied')}</Text>
                      <Text style={styles.fareValue}>{formatRupees(quote.minFare)}</Text>
                    </View>
                  )}
                  <View style={[styles.fareLine, styles.fareTotalLine]}>
                    <Text style={styles.fareTotalLabel}>{t('delivery.book.total')}</Text>
                    <Text style={styles.fareTotal}>{formatRupees(quote.totalAmount)}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.fareHint}>{built.error || t('delivery.book.fillToSee')}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM BAR */}
      <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 14) + 6}]}>
        <View style={styles.flex}>
          <Text style={styles.bottomLabel}>
            {quote ? t('delivery.book.total') : t('delivery.estimated')}
          </Text>
          <Text style={styles.bottomTotal}>{total ? formatRupees(total) : '—'}</Text>
        </View>
        <MarketButton
          label={
            form.scheduleType === 'now' ? t('delivery.book.requestNow') : t('delivery.book.sendRequest')
          }
          icon={<Send size={16} color={C.white} />}
          loading={creating}
          disabled={!!quoteError}
          onPress={handleSubmit}
          style={styles.flexWide}
        />
      </View>

      {!!picker && (
        <DateTimePicker
          value={new Date(form.pickupAt)}
          mode={picker}
          minimumDate={picker === 'date' ? new Date() : undefined}
          display={Platform.OS === 'ios' ? (picker === 'date' ? 'inline' : 'spinner') : 'default'}
          onChange={handlePickerChange}
        />
      )}

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  flex: {flex: 1},
  flexWide: {flex: 1.4},
  scrollContent: {paddingBottom: 30},
  body: {paddingHorizontal: 16},
  row: {flexDirection: 'row', gap: 12},
  inline: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3},

  driverCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  vehicleDot: {position: 'absolute', right: -6, bottom: -6, borderWidth: 2, borderColor: C.white},
  driverName: {fontSize: 16, fontWeight: '900', color: C.white},
  driverVehicle: {fontSize: 12, fontWeight: '700', color: '#BFE3FF', marginTop: 1},
  driverMeta: {fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)'},

  locateButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.lightBlue,
  },
  locateText: {fontSize: 12, fontWeight: '900', color: C.blue},
  inputError: {borderColor: C.red, backgroundColor: C.lightRed},
  errorHint: {fontSize: 11.5, fontWeight: '700', color: C.red, marginTop: 6, lineHeight: 16},

  bigValue: {fontSize: 24, fontWeight: '900', color: C.dark, marginTop: 14},
  quickRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10},
  quick: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  quickOn: {backgroundColor: C.lightGreen, borderColor: C.green},
  quickText: {fontSize: 12, fontWeight: '800', color: C.text},
  quickTextOn: {color: C.green},
  mapsLink: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 4},
  mapsText: {fontSize: 12, fontWeight: '800', color: C.blue},
  textArea: {height: 80, paddingTop: 12},

  whenRow: {marginTop: 14},
  whenOption: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    gap: 4,
  },
  whenOn: {backgroundColor: C.green, borderColor: C.green},
  whenDisabled: {opacity: 0.55},
  whenTitle: {fontSize: 14, fontWeight: '900', color: C.dark},
  whenSub: {fontSize: 10.5, fontWeight: '700', color: C.muted},
  whenTextOn: {color: C.white},

  payOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  payOn: {borderColor: C.green, backgroundColor: C.lightGreen},
  payText: {fontSize: 13, fontWeight: '800', color: C.text},
  payTextOn: {color: C.green},

  fareCard: {
    marginTop: 20,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    ...MARKET_SHADOW,
  },
  fareHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fareTitle: {fontSize: 16, fontWeight: '900', color: C.dark},
  etaRow: {flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 6},
  etaBox: {flex: 1, backgroundColor: C.bg, borderRadius: 14, padding: 10, alignItems: 'center'},
  etaValue: {fontSize: 14, fontWeight: '900', color: C.dark},
  etaLabel: {fontSize: 10, fontWeight: '700', color: C.muted, marginTop: 2},
  fareLine: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  fareLabel: {fontSize: 12.5, fontWeight: '700', color: C.text},
  fareValue: {fontSize: 12.5, fontWeight: '800', color: C.dark},
  fareTotalLine: {marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border},
  fareTotalLabel: {fontSize: 14, fontWeight: '900', color: C.dark},
  fareTotal: {fontSize: 18, fontWeight: '900', color: C.green},
  fareHint: {fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 8, lineHeight: 17},
  quoteError: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.lightRed,
  },
  quoteErrorText: {flex: 1, fontSize: 12, fontWeight: '700', color: C.red, lineHeight: 17},

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
    shadowOffset: {width: 0, height: -4},
    elevation: 12,
  },
  bottomLabel: {fontSize: 11, color: C.muted, fontWeight: '700'},
  bottomTotal: {fontSize: 20, color: C.dark, fontWeight: '900', letterSpacing: -0.4},
});
