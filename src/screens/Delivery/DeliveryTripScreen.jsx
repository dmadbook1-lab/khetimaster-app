import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {
  Banknote,
  CircleCheck,
  KeyRound,
  Navigation,
  Package,
  Phone,
  PhoneCall,
  Smartphone,
  Star,
  Timer,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import MarketHero, {TopInset} from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import {EmptyState, LoadingState, MarketButton, StatusPill} from '../../components/market/MarketBits';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../../components/market/theme';
import FeedbackModal, {useFeedbackModal} from '../../components/common/FeedbackModal';
import PersonAvatar from '../../components/labour/PersonAvatar';
import VehicleBadge from '../../components/delivery/VehicleBadge';
import RouteStops from '../../components/delivery/RouteStops';
import TripTimeline from '../../components/delivery/TripTimeline';
import {vehicleLabel} from '../../components/delivery/vehicles';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {updateDeliveryLocationApi} from '../../api/deliveryApi';
import {
  fetchDeliveryBooking,
  reviewDeliveryBooking,
  updateDeliveryBooking,
} from '../../redux/slices/deliverySlice';
import getCurrentCoordinates from '../../utils/getCurrentCoordinates';
import {
  ACTIVE_TRIP_STATUSES,
  ON_TRIP_STATUSES,
  TRIP_STATUS_META,
  describeTripState,
  formatClock,
  formatKm,
  formatMinutes,
  formatWeight,
  formatWhen,
  hasPoint,
  haversineKm,
  minutesUntil,
  stopLabel,
} from '../../utils/deliveryFormat';
import {formatRupees, timeAgo} from '../../utils/marketFormat';
import {tOpt} from '../../utils/tOpt';

const POLL_MS = 15000;
const DRIVER_LOCATION_MS = 30000;

const HERO_GRADIENT = {
  requested: 'amber',
  accepted: 'blue',
  arrived: 'steel',
  picked_up: 'green',
  delivered: 'forest',
  rejected: 'red',
  cancelled: 'slate',
};

const mapsUrl = stop => {
  const destination = hasPoint(stop)
    ? `${stop.lat},${stop.lng}`
    : [stop?.address, stopLabel(stop), stop?.state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}&travelmode=driving`;
};

const call = phone => phone && Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() => {});

export default function DeliveryTripScreen({navigation, route}) {
  const {t} = useTranslation();
  const {bookingId} = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();

  const {currentBooking, bookingLoading, bookingError, updating} = useSelector(
    state => state.delivery,
  );
  const booking = currentBooking?._id === bookingId ? currentBooking : null;

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [, setTick] = useState(0);

  const load = useCallback(() => dispatch(fetchDeliveryBooking(bookingId)), [dispatch, bookingId]);

  const isActive = !!booking && ACTIVE_TRIP_STATUSES.includes(booking.status);
  const isPartner = booking?.myRole === 'partner';
  const onTrip = !!booking && ON_TRIP_STATUSES.includes(booking.status);

  /*
   * Live updates: poll while the trip is active, and re-render every
   * 30s so countdowns stay fresh.
   */
  useFocusEffect(
    useCallback(() => {
      load();
      const tick = setInterval(() => setTick(value => value + 1), 30000);
      return () => clearInterval(tick);
    }, [load]),
  );

  const activeRef = useRef(isActive);
  activeRef.current = isActive;

  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => {
        if (activeRef.current) load();
      }, POLL_MS);
      return () => clearInterval(timer);
    }, [load]),
  );

  /*
   * Driver's phone shares its location while on this trip, so the
   * customer can track it.
   */
  useEffect(() => {
    if (!isPartner || !onTrip) return undefined;

    let stopped = false;
    const push = async () => {
      const coords = await getCurrentCoordinates();
      if (!stopped && coords) {
        updateDeliveryLocationApi({lat: coords.latitude, lng: coords.longitude}).catch(() => {});
      }
    };

    push();
    const timer = setInterval(push, DRIVER_LOCATION_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [isPartner, onTrip]);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title={t('delivery.trip.title')} onBack={() => navigation.goBack()} />
        {bookingError && !bookingLoading ? (
          <EmptyState
            title={t('delivery.trip.notFound')}
            message={bookingError}
            actionLabel={t('delivery.tryAgain')}
            onAction={load}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const partner = booking.partner || {};
  const customer = booking.customer || {};
  const other = isPartner ? customer : partner;
  const otherPhone = other.phoneNumber;

  /* ETA */
  const etaTarget =
    booking.status === 'accepted' || booking.status === 'arrived'
      ? booking.pickupAt
      : booking.estimatedDeliveryAt;
  const etaMinutes = minutesUntil(etaTarget);
  const etaLabel =
    booking.status === 'picked_up'
      ? t('delivery.trip.etaDrop')
      : booking.status === 'accepted'
      ? t('delivery.trip.etaPickup')
      : null;

  /* LIVE DRIVER LOCATION (customer) */
  const driverLoc = booking.partnerLocation;
  const towards = booking.status === 'picked_up' ? booking.drop : booking.pickup;
  const driverDistance =
    driverLoc && hasPoint(towards)
      ? haversineKm(
          {lat: driverLoc.lat, lng: driverLoc.lng},
          {lat: Number(towards.lat), lng: Number(towards.lng)},
        )
      : null;

  const runAction = async (action, body, successTitle) => {
    try {
      const result = await dispatch(updateDeliveryBooking({bookingId, action, body})).unwrap();
      if (successTitle) feedback.success(successTitle, result.message);
      return true;
    } catch (message) {
      feedback.error(t('delivery.trip.actionFailed'), message);
      return false;
    }
  };

  const confirmAction = action => {
    const config = {
      accept: {
        title: t('delivery.trip.acceptTitle'),
        message: t('delivery.trip.acceptText', {
          when: booking.scheduleType === 'now' ? t('delivery.book.rightNow') : formatWhen(booking.pickupAt),
          amount: formatRupees(booking.totalAmount),
        }),
        label: t('delivery.trip.accept'),
      },
      reject: {
        title: t('delivery.trip.rejectTitle'),
        message: t('delivery.trip.rejectText'),
        label: t('delivery.trip.reject'),
        destructive: true,
      },
      cancel: {
        title: t('delivery.trip.cancelTitle'),
        message: isPartner ? t('delivery.trip.cancelTextDriver') : t('delivery.trip.cancelText'),
        label: t('delivery.trip.cancel'),
        destructive: true,
      },
      arrived: {
        title: t('delivery.trip.arrivedTitle'),
        message: t('delivery.trip.arrivedText'),
        label: t('delivery.trip.arrived'),
      },
      picked_up: {
        title: t('delivery.trip.pickedTitle'),
        message: t('delivery.trip.pickedText'),
        label: t('delivery.trip.picked'),
      },
    }[action];

    feedback.confirm({
      title: config.title,
      message: config.message,
      confirmLabel: config.label,
      destructive: config.destructive,
      onConfirm: () => runAction(action),
    });
  };

  const submitOtp = async () => {
    const ok = await runAction('deliver', {otp: otp.trim()}, t('delivery.trip.deliveredTitle'));
    if (ok) {
      setOtpOpen(false);
      setOtp('');
    }
  };

  const submitReview = async () => {
    try {
      await dispatch(reviewDeliveryBooking({bookingId, rating, comment})).unwrap();
      setReviewOpen(false);
      feedback.success(t('delivery.trip.thanks'), t('delivery.trip.thanksText'));
    } catch (message) {
      feedback.error(t('delivery.trip.actionFailed'), message);
    }
  };

  const actions = booking.actions || [];
  const primary = ['accept', 'arrived', 'picked_up', 'deliver', 'review'].find(a =>
    actions.includes(a),
  );
  const secondary = ['reject', 'cancel'].find(a => actions.includes(a));

  const primaryLabel = {
    accept: t('delivery.trip.accept'),
    arrived: t('delivery.trip.arrived'),
    picked_up: t('delivery.trip.picked'),
    deliver: t('delivery.trip.enterOtp'),
    review: t('delivery.trip.rate'),
  }[primary];

  const onPrimary = () => {
    if (primary === 'deliver') setOtpOpen(true);
    else if (primary === 'review') setReviewOpen(true);
    else confirmAction(primary);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={bookingLoading && !!booking}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.white}
          />
        }>
        <MarketHero
          gradient={HERO_GRADIENT[booking.status] || 'steel'}
          onBack={() => navigation.goBack()}
          eyebrow={isPartner ? t('delivery.trip.eyebrowDriver') : t('delivery.trip.eyebrowCustomer')}
          title={TRIP_STATUS_META[booking.status]?.label}
          subtitle={describeTripState(booking)}>
          {isActive && etaLabel && etaMinutes !== null && (
            <View style={styles.etaPill}>
              <Timer size={15} color={C.white} />
              <Text style={styles.etaText}>
                {etaMinutes > 0
                  ? `${etaLabel} ${formatMinutes(etaMinutes)} · ${formatClock(etaTarget)}`
                  : t('delivery.trip.anyMinute')}
              </Text>
            </View>
          )}
          {booking.status === 'requested' && booking.scheduleType === 'scheduled' && (
            <View style={styles.etaPill}>
              <Timer size={15} color={C.white} />
              <Text style={styles.etaText}>
                {t('delivery.trip.scheduledFor', {when: formatWhen(booking.pickupAt)})}
              </Text>
            </View>
          )}
        </MarketHero>

        <View style={styles.body}>
          {/* OTP (customer) */}
          {!isPartner && !!booking.deliveryOtp && (
            <View style={[styles.card, styles.otpCard]}>
              <KeyRound size={20} color={C.green} />
              <View style={styles.flex}>
                <Text style={styles.otpLabel}>{t('delivery.trip.otpLabel')}</Text>
                <Text style={styles.otpHint}>{t('delivery.trip.otpHint')}</Text>
              </View>
              <Text style={styles.otp}>{booking.deliveryOtp.split('').join(' ')}</Text>
            </View>
          )}

          {/* OTHER PARTY */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <PersonAvatar
                  name={other.fullName}
                  image={isPartner ? null : partner.profileImage}
                  gradient={isPartner ? 'blue' : 'green'}
                  size={54}
                />
                {!isPartner && (
                  <VehicleBadge type={partner.vehicleType} size={24} style={styles.vehicleDot} />
                )}
              </View>
              <View style={styles.flex}>
                <Text style={styles.label}>
                  {isPartner ? t('delivery.customer') : t('delivery.driver')}
                </Text>
                <Text style={styles.name} numberOfLines={1}>
                  {other.fullName || '—'}
                </Text>
                {isPartner ? (
                  <Text style={styles.sub} numberOfLines={1}>
                    {[customer.village, customer.district].filter(Boolean).join(', ')}
                  </Text>
                ) : (
                  <View style={styles.inline}>
                    <Text style={styles.sub}>{vehicleLabel(partner.vehicleType)}</Text>
                    <Text style={styles.plate}>{partner.vehicleNumber}</Text>
                    {partner.totalReviews > 0 && (
                      <>
                        <Star size={11} color={C.gold} fill={C.gold} />
                        <Text style={styles.sub}>{partner.rating}</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
              {otherPhone ? (
                <TouchableOpacity style={styles.callButton} onPress={() => call(otherPhone)}>
                  <PhoneCall size={19} color={C.white} />
                </TouchableOpacity>
              ) : null}
            </View>
            {!otherPhone && booking.status === 'requested' && (
              <Text style={styles.hint}>{t('delivery.trip.phoneAfterAccept')}</Text>
            )}
            {!isPartner && !!partner._id && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() =>
                  navigation.navigate(DELIVERY_ROUTES.PARTNER_DETAILS, {
                    partnerId: partner._id,
                    pickupDistrict: booking.pickup?.district,
                  })
                }>
                <Text style={styles.link}>{t('delivery.trip.viewDriver')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* LIVE TRACKING (customer) */}
          {!isPartner && onTrip && (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.liveDot, driverLoc && styles.liveDotOn]} />
                <Text style={[styles.sectionTitle, styles.flex]}>{t('delivery.trip.live')}</Text>
                {driverLoc && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/search/?api=1&query=${driverLoc.lat},${driverLoc.lng}`,
                      ).catch(() => {})
                    }>
                    <Text style={styles.link}>{t('delivery.trip.seeOnMap')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.value}>
                {driverLoc
                  ? driverDistance !== null
                    ? t(
                        booking.status === 'picked_up'
                          ? 'delivery.trip.kmFromDrop'
                          : 'delivery.trip.kmFromPickup',
                        {distance: formatKm(driverDistance)},
                      )
                    : t('delivery.trip.locationShared')
                  : t('delivery.trip.noLocation')}
              </Text>
              {driverLoc?.updatedAt && (
                <Text style={styles.hint}>
                  {t('delivery.trip.updated', {ago: timeAgo(driverLoc.updatedAt)})}
                </Text>
              )}
            </View>
          )}

          {/* ROUTE */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={[styles.sectionTitle, styles.flex]}>{t('delivery.trip.route')}</Text>
              <Text style={styles.distance}>{formatKm(booking.distanceKm)}</Text>
            </View>
            <View style={styles.routeBox}>
              <RouteStops pickup={booking.pickup} drop={booking.drop} detailed />
            </View>

            {/* contacts + navigation */}
            {[
              ['pickup', booking.pickup],
              ['drop', booking.drop],
            ].map(([kind, stop]) => (
              <View key={kind} style={styles.stopActions}>
                <Text style={styles.stopKind}>
                  {kind === 'pickup' ? t('delivery.pickup') : t('delivery.drop')}
                  {stop.contactName ? ` · ${stop.contactName}` : ''}
                </Text>
                {!!stop.contactPhone && (
                  <TouchableOpacity style={styles.smallBtn} onPress={() => call(stop.contactPhone)}>
                    <Phone size={13} color={C.green} />
                    <Text style={styles.smallBtnText}>{t('delivery.trip.call')}</Text>
                  </TouchableOpacity>
                )}
                {isPartner && onTrip && (
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.smallBtnBlue]}
                    onPress={() => Linking.openURL(mapsUrl(stop)).catch(() => {})}>
                    <Navigation size={13} color={C.blue} />
                    <Text style={[styles.smallBtnText, styles.blueText]}>
                      {t('delivery.trip.navigate')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* GOODS */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Package size={18} color={C.orange} />
              <Text style={[styles.sectionTitle, styles.flex]}>{tOpt(booking.goodsType)}</Text>
              {!!booking.weightKg && <Text style={styles.distance}>{formatWeight(booking.weightKg)}</Text>}
            </View>
            {!!booking.description && <Text style={[styles.value, styles.mt]}>{booking.description}</Text>}
            {!!booking.customerNotes && (
              <Text style={[styles.hint, styles.mt]}>
                {t('delivery.trip.note', {note: booking.customerNotes})}
              </Text>
            )}
            <Text style={[styles.hint, styles.mt]}>
              {t('delivery.trip.pickupTime', {when: formatWhen(booking.pickupAt)})} ·{' '}
              {t('delivery.trip.duration', {time: formatMinutes(booking.estimatedDurationMinutes)})}
            </Text>
          </View>

          {/* TIMELINE */}
          <View style={styles.card}>
            <View style={[styles.row, styles.mb]}>
              <Text style={[styles.sectionTitle, styles.flex]}>{t('delivery.trip.progress')}</Text>
              <StatusPill meta={TRIP_STATUS_META[booking.status]} />
            </View>
            <TripTimeline booking={booking} />
            {['rejected', 'cancelled'].includes(booking.status) && (
              <Text style={styles.hint}>{describeTripState(booking)}</Text>
            )}
          </View>

          {/* FARE */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('delivery.book.fare')}</Text>
            <View style={styles.fareLine}>
              <Text style={styles.fareLabel}>{t('delivery.details.baseFare')}</Text>
              <Text style={styles.fareValue}>{formatRupees(booking.baseFare)}</Text>
            </View>
            <View style={styles.fareLine}>
              <Text style={styles.fareLabel}>
                {t('delivery.book.distanceFare', {
                  km: formatKm(booking.distanceKm),
                  rate: booking.perKmRate,
                })}
              </Text>
              <Text style={styles.fareValue}>{formatRupees(booking.distanceFare)}</Text>
            </View>
            {booking.totalAmount > booking.baseFare + booking.distanceFare && (
              <View style={styles.fareLine}>
                <Text style={styles.fareLabel}>{t('delivery.book.minFareApplied')}</Text>
                <Text style={styles.fareValue}>{formatRupees(booking.minFare)}</Text>
              </View>
            )}
            <View style={[styles.fareLine, styles.fareTotalLine]}>
              <View style={styles.inline}>
                {booking.paymentMethod === 'upi' ? (
                  <Smartphone size={15} color={C.green} />
                ) : (
                  <Banknote size={15} color={C.green} />
                )}
                <Text style={styles.fareTotalLabel}>
                  {t(`delivery.pay.${booking.paymentMethod}`)}
                </Text>
              </View>
              <Text style={styles.fareTotal}>{formatRupees(booking.totalAmount)}</Text>
            </View>
          </View>

          {booking.review?.rating ? (
            <View style={[styles.card, styles.row]}>
              <CircleCheck size={18} color={C.green} />
              <Text style={[styles.value, styles.flex]}>
                {t('delivery.trip.rated', {rating: booking.review.rating})}
                {booking.review.comment ? ` · “${booking.review.comment}”` : ''}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* ACTIONS */}
      {(primary || secondary) && (
        <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 14) + 6}]}>
          {secondary && (
            <MarketButton
              label={secondary === 'reject' ? t('delivery.trip.reject') : t('delivery.trip.cancel')}
              variant="danger"
              onPress={() => confirmAction(secondary)}
              disabled={updating}
              style={primary ? styles.flex : styles.flexWide}
            />
          )}
          {primary && (
            <MarketButton
              label={primaryLabel}
              loading={updating}
              onPress={onPrimary}
              style={styles.flexWide}
            />
          )}
        </View>
      )}

      {/* OTP MODAL (driver) */}
      <Modal visible={otpOpen} transparent animationType="fade" onRequestClose={() => setOtpOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOtpOpen(false)} />
          <View style={styles.sheet}>
            <KeyRound size={26} color={C.green} />
            <Text style={styles.sheetTitle}>{t('delivery.trip.otpTitle')}</Text>
            <Text style={styles.sheetText}>{t('delivery.trip.otpText')}</Text>
            <TextInput
              value={otp}
              onChangeText={value => setOtp(value.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              style={styles.otpInput}
              placeholder="• • • •"
              placeholderTextColor={C.placeholder}
            />
            <MarketButton
              label={t('delivery.trip.confirmDelivery')}
              loading={updating}
              disabled={otp.length !== 4}
              onPress={submitOtp}
              style={styles.sheetButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* REVIEW MODAL (customer) */}
      <Modal
        visible={reviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setReviewOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {t('delivery.trip.rateTitle', {name: partner.fullName || t('delivery.driver')})}
            </Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(value => (
                <TouchableOpacity key={value} hitSlop={6} onPress={() => setRating(value)}>
                  <Star
                    size={34}
                    color={C.gold}
                    fill={value <= rating ? C.gold : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('delivery.trip.commentPh')}
              placeholderTextColor={C.placeholder}
              maxLength={500}
              multiline
              style={styles.commentInput}
            />
            <MarketButton
              label={t('delivery.trip.submitRating')}
              loading={updating}
              onPress={submitReview}
              style={styles.sheetButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scrollContent: {paddingBottom: 30},
  body: {paddingHorizontal: 16, paddingTop: 2},
  flex: {flex: 1},
  flexWide: {flex: 1.5},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  inline: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap'},
  mt: {marginTop: 8},
  mb: {marginBottom: 12},

  etaPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  etaText: {color: C.white, fontSize: 12.5, fontWeight: '900'},

  card: {backgroundColor: C.white, borderRadius: 20, padding: 16, marginTop: 14, ...MARKET_SHADOW},
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.green,
    backgroundColor: C.lightGreen,
  },
  otpLabel: {fontSize: 13, fontWeight: '900', color: C.dark},
  otpHint: {fontSize: 11, fontWeight: '600', color: C.text, marginTop: 2},
  otp: {fontSize: 24, fontWeight: '900', color: C.green, letterSpacing: 2},

  vehicleDot: {position: 'absolute', right: -6, bottom: -6, borderWidth: 2, borderColor: C.white},
  label: {fontSize: 10.5, fontWeight: '800', color: C.muted, letterSpacing: 0.3},
  name: {fontSize: 16, fontWeight: '900', color: C.dark, marginTop: 1},
  sub: {fontSize: 11.5, fontWeight: '700', color: C.muted},
  plate: {
    fontSize: 10.5,
    fontWeight: '900',
    color: C.dark,
    backgroundColor: '#FFE68A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 0.8,
  },
  callButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 8, lineHeight: 16},
  linkRow: {marginTop: 12},
  link: {fontSize: 12, fontWeight: '900', color: C.blue},

  liveDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: '#C3CDC7'},
  liveDotOn: {backgroundColor: C.green},
  sectionTitle: {fontSize: 15, fontWeight: '900', color: C.dark},
  value: {fontSize: 13, fontWeight: '700', color: C.text, lineHeight: 19, marginTop: 6},
  distance: {fontSize: 12.5, fontWeight: '900', color: C.blue},

  routeBox: {marginTop: 12, padding: 12, borderRadius: 16, backgroundColor: C.bg},
  stopActions: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10},
  stopKind: {flex: 1, fontSize: 11.5, fontWeight: '800', color: C.text},
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.lightGreen,
  },
  smallBtnBlue: {backgroundColor: C.lightBlue},
  smallBtnText: {fontSize: 11.5, fontWeight: '900', color: C.green},
  blueText: {color: C.blue},

  fareLine: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
  fareLabel: {fontSize: 12.5, fontWeight: '700', color: C.text},
  fareValue: {fontSize: 12.5, fontWeight: '800', color: C.dark},
  fareTotalLine: {marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border},
  fareTotalLabel: {fontSize: 13, fontWeight: '900', color: C.dark},
  fareTotal: {fontSize: 18, fontWeight: '900', color: C.green},

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

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,20,15,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {backgroundColor: C.white, borderRadius: 24, padding: 22, alignItems: 'center'},
  sheetTitle: {fontSize: 18, fontWeight: '900', color: C.dark, marginTop: 10, textAlign: 'center'},
  sheetText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  otpInput: {
    marginTop: 18,
    width: 180,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.green,
    backgroundColor: C.lightGreen,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 10,
    color: C.dark,
  },
  sheetButton: {alignSelf: 'stretch', marginTop: 18},
  stars: {flexDirection: 'row', gap: 8, marginTop: 16},
  commentInput: {
    alignSelf: 'stretch',
    marginTop: 16,
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
    padding: 12,
    fontSize: 13.5,
    color: C.dark,
    textAlignVertical: 'top',
  },
});
