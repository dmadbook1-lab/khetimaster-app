import React, {useCallback} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect} from '@react-navigation/native';
import {
  CalendarClock,
  Hourglass,
  Languages,
  Lock,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Pencil,
  Star,
  Weight,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {useLocation} from '../../context/LocationContext';
import MarketHero, {TopInset} from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import {
  EmptyState,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {MARKET_COLORS as C, MARKET_GRADIENTS, MARKET_SHADOW} from '../../components/market/theme';
import PersonAvatar from '../../components/labour/PersonAvatar';
import VehicleBadge from '../../components/delivery/VehicleBadge';
import {vehicleLabel} from '../../components/delivery/vehicles';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {fetchDeliveryPartner} from '../../redux/slices/deliverySlice';
import {
  DRIVER_STATE_META,
  TRIP_STATUS_META,
  busyMinutesLeft,
  describeBusy,
  formatClock,
  formatKm,
  formatMinutes,
  formatWeight,
  formatWhen,
} from '../../utils/deliveryFormat';
import {formatRupees, timeAgo} from '../../utils/marketFormat';
import {tOpt} from '../../utils/tOpt';

const STEPS = ['stepRequest', 'stepAccept', 'stepOtp'];

export default function DeliveryPartnerDetailsScreen({navigation, route}) {
  const {t} = useTranslation();
  const {partnerId, pickupDistrict} = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {location: live} = useLocation();

  const {selectedPartner, partnerLoading, partnerError} = useSelector(
    state => state.delivery,
  );
  const partner = selectedPartner?._id === partnerId ? selectedPartner : null;

  const load = useCallback(
    () =>
      dispatch(
        fetchDeliveryPartner({
          partnerId,
          params: {
            district: pickupDistrict || undefined,
            lat: live?.latitude,
            lng: live?.longitude,
          },
        }),
      ),
    [dispatch, partnerId, pickupDistrict, live?.latitude, live?.longitude],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!partner) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title={t('delivery.driver')} onBack={() => navigation.goBack()} />
        {partnerError && !partnerLoading ? (
          <EmptyState
            title={t('delivery.details.notAvailable')}
            message={partnerError}
            actionLabel={t('delivery.goBack')}
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const busy = partner.tripState === 'on_trip';
  const activeBooking = partner.myActiveBooking;
  const reviews = partner.recentReviews || [];
  const place = [partner.village, partner.taluka, partner.district, partner.state]
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={partnerLoading}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.white}
          />
        }>
        <MarketHero
          gradient={partner.canBook || partner.isOwner ? 'steel' : 'slate'}
          onBack={() => navigation.goBack()}
          right={<StatusPill meta={DRIVER_STATE_META[partner.tripState]} />}>
          <View style={styles.heroProfile}>
            <View>
              <PersonAvatar
                name={partner.fullName}
                image={partner.profileImage}
                size={84}
                style={styles.heroAvatar}
              />
              <VehicleBadge type={partner.vehicleType} size={32} style={styles.heroVehicle} />
            </View>
            <Text style={styles.heroName}>{partner.fullName}</Text>
            <Text style={styles.heroVehicleText}>
              {vehicleLabel(partner.vehicleType)}
              {partner.vehicleName ? ` · ${partner.vehicleName}` : ''}
            </Text>
            <Text style={styles.plate}>{partner.vehicleNumber}</Text>
            {!!place && (
              <View style={styles.inline}>
                <MapPin size={12} color="#BFE3FF" />
                <Text style={styles.heroLocation}>{place}</Text>
              </View>
            )}
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Star size={17} color={C.gold} fill={C.gold} />
              <Text style={styles.statValue}>
                {partner.totalReviews ? partner.rating : t('delivery.new')}
              </Text>
              <Text style={styles.statLabel}>
                {t('delivery.details.reviews', {count: partner.totalReviews || 0})}
              </Text>
            </View>
            <View style={styles.statBox}>
              <PackageCheck size={17} color={C.green} />
              <Text style={styles.statValue}>{partner.totalTrips || 0}</Text>
              <Text style={styles.statLabel}>{t('delivery.details.tripsDone')}</Text>
            </View>
            <View style={styles.statBox}>
              <Weight size={17} color={C.blue} />
              <Text style={styles.statValue}>{formatWeight(partner.capacityKg)}</Text>
              <Text style={styles.statLabel}>{t('delivery.details.capacity')}</Text>
            </View>
          </View>

          {/* DISTRICT RULE */}
          {!partner.isOwner && !partner.canBook && (
            <View style={[styles.card, styles.lockCard]}>
              <Lock size={18} color={C.amber} />
              <View style={styles.flex}>
                <Text style={styles.lockTitle}>{t('delivery.details.lockedTitle')}</Text>
                <Text style={styles.lockText}>
                  {t('delivery.details.lockedText', {
                    district: partner.district,
                    yours: pickupDistrict || '—',
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* BUSY: WHY + HOW LONG */}
          {busy && (
            <View style={[styles.card, styles.busyCard]}>
              <View style={styles.busyHeader}>
                <Hourglass size={18} color={C.orange} />
                <Text style={styles.busyTitle}>
                  {t('delivery.details.onDelivery')}
                </Text>
                <Text style={styles.busyLeft}>
                  {t('delivery.details.minutesLeft', {
                    time: formatMinutes(busyMinutesLeft(partner)),
                  })}
                </Text>
              </View>
              <Text style={styles.busyText}>{describeBusy(partner)}</Text>
              <View style={styles.busyTimes}>
                <Text style={styles.busyTime}>
                  {t('delivery.details.started', {
                    time: formatClock(partner.currentTrip.pickupAt),
                  })}
                </Text>
                <Text style={styles.busyTime}>
                  {t('delivery.details.freeAround', {
                    time: formatClock(partner.currentTrip.busyUntil),
                  })}
                </Text>
              </View>
            </View>
          )}

          {partner.upcomingTrips > 0 && (
            <View style={[styles.card, styles.row]}>
              <CalendarClock size={18} color={C.blue} />
              <Text style={[styles.value, styles.flex]}>
                {t('delivery.nextBooked', {
                  count: partner.upcomingTrips,
                  when: formatWhen(partner.nextPickupAt),
                })}
              </Text>
            </View>
          )}

          {/* ACTIVE BOOKING WITH ME */}
          {!!activeBooking && (
            <LinearGradient
              colors={['#EAF1FF', '#FFFFFF']}
              style={[styles.card, styles.row]}>
              <Package size={20} color={C.blue} />
              <View style={styles.flex}>
                <Text style={styles.activeTitle}>{t('delivery.details.youHaveTrip')}</Text>
                <Text style={styles.activeText}>
                  {tOpt(activeBooking.goodsType)} · {formatWhen(activeBooking.pickupAt)}
                </Text>
              </View>
              <StatusPill meta={TRIP_STATUS_META[activeBooking.status]} />
            </LinearGradient>
          )}

          {/* RATES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('delivery.details.rates')}</Text>
            <View style={styles.rateRow}>
              <View style={styles.rateBox}>
                <Text style={styles.rateValue}>{formatRupees(partner.baseFare)}</Text>
                <Text style={styles.rateLabel}>{t('delivery.details.baseFare')}</Text>
              </View>
              <View style={styles.rateBox}>
                <Text style={styles.rateValue}>{formatRupees(partner.perKmRate)}</Text>
                <Text style={styles.rateLabel}>{t('delivery.details.perKm')}</Text>
              </View>
              <View style={styles.rateBox}>
                <Text style={styles.rateValue}>{formatRupees(partner.minFare)}</Text>
                <Text style={styles.rateLabel}>{t('delivery.details.minimum')}</Text>
              </View>
            </View>
            <Text style={styles.hint}>{t('delivery.details.fareFormula')}</Text>
            {partner.distanceKm !== null && partner.distanceKm !== undefined && (
              <View style={[styles.inline, styles.distanceRow]}>
                <Navigation size={13} color={C.orange} />
                <Text style={styles.value}>
                  {t('delivery.away', {distance: formatKm(partner.distanceKm)})}
                </Text>
              </View>
            )}
          </View>

          {(!!partner.about || partner.languages?.length > 0) && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('delivery.details.about')}</Text>
              {!!partner.about && <Text style={[styles.value, styles.aboutText]}>{partner.about}</Text>}
              {partner.languages?.length > 0 && (
                <View style={[styles.inline, styles.distanceRow]}>
                  <Languages size={13} color={C.muted} />
                  <Text style={styles.value}>{partner.languages.map(tOpt).join(', ')}</Text>
                </View>
              )}
            </View>
          )}

          {/* REVIEWS */}
          <Text style={styles.blockTitle}>{t('delivery.details.ratingsTitle')}</Text>
          {reviews.length ? (
            reviews.map((review, index) => (
              <View key={`${review.createdAt}-${index}`} style={styles.reviewCard}>
                <View style={styles.row}>
                  <PersonAvatar name={review.customer?.fullName} size={34} gradient="blue" />
                  <View style={styles.flex}>
                    <Text style={styles.reviewer}>
                      {review.customer?.fullName || t('delivery.customer')}
                    </Text>
                    <Text style={styles.reviewMeta}>
                      {tOpt(review.goodsType)} · {timeAgo(review.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.reviewStars}>
                    <Star size={12} color={C.gold} fill={C.gold} />
                    <Text style={styles.reviewRating}>{review.rating}</Text>
                  </View>
                </View>
                {!!review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </View>
            ))
          ) : (
            <View style={styles.card}>
              <Text style={styles.hint}>{t('delivery.details.noReviews')}</Text>
            </View>
          )}

          {/* HOW IT WORKS */}
          <Text style={styles.blockTitle}>{t('delivery.details.howItWorks')}</Text>
          <View style={styles.steps}>
            {STEPS.map((step, index) => (
              <View key={step} style={styles.step}>
                <LinearGradient colors={MARKET_GRADIENTS.steel} style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </LinearGradient>
                <Text style={styles.stepTitle}>{t(`delivery.details.${step}`)}</Text>
                <Text style={styles.stepText}>{t(`delivery.details.${step}Text`)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={[styles.bottomBar, {paddingBottom: Math.max(insets.bottom, 14) + 6}]}>
        {partner.isOwner ? (
          <MarketButton
            label={t('delivery.details.editProfile')}
            icon={<Pencil size={16} color={C.white} />}
            onPress={() => navigation.navigate(DELIVERY_ROUTES.DRIVER_FORM)}
            style={styles.flex}
          />
        ) : activeBooking ? (
          <MarketButton
            label={t('delivery.details.viewTrip')}
            icon={<Package size={17} color={C.white} />}
            onPress={() =>
              navigation.navigate(DELIVERY_ROUTES.TRIP, {bookingId: activeBooking._id})
            }
            style={styles.flex}
          />
        ) : (
          <>
            <View style={styles.flex}>
              <Text style={styles.bottomLabel}>{t('delivery.details.startsAt')}</Text>
              <Text style={styles.bottomPrice}>{formatRupees(partner.minFare)}</Text>
            </View>
            <MarketButton
              label={
                !partner.canBook
                  ? t('delivery.details.outsideDistrictBtn')
                  : busy || partner.tripState === 'offline'
                  ? t('delivery.details.scheduleBtn')
                  : t('delivery.details.bookNowBtn')
              }
              disabled={!partner.canBook}
              onPress={() =>
                navigation.navigate(DELIVERY_ROUTES.BOOK, {partner, pickupDistrict})
              }
              style={styles.flexWide}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scrollContent: {paddingBottom: 30},
  flex: {flex: 1},
  flexWide: {flex: 1.5},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  inline: {flexDirection: 'row', alignItems: 'center', gap: 5},

  heroProfile: {alignItems: 'center', paddingTop: 6},
  heroAvatar: {borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)'},
  heroVehicle: {
    position: 'absolute',
    right: -8,
    bottom: -6,
    borderWidth: 2,
    borderColor: C.white,
  },
  heroName: {
    marginTop: 12,
    color: C.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroVehicleText: {color: '#BFE3FF', fontSize: 12.5, fontWeight: '800', marginTop: 3},
  plate: {
    marginTop: 8,
    color: C.dark,
    backgroundColor: '#FFE68A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  heroLocation: {color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '600', marginTop: 8},

  body: {paddingHorizontal: 16, paddingTop: 16},
  statsRow: {flexDirection: 'row', gap: 10},
  statBox: {flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 13, ...MARKET_SHADOW},
  statValue: {fontSize: 15, fontWeight: '900', color: C.dark, marginTop: 8},
  statLabel: {fontSize: 10.5, color: C.muted, fontWeight: '600', marginTop: 2},

  card: {backgroundColor: C.white, borderRadius: 20, padding: 16, marginTop: 14, ...MARKET_SHADOW},
  lockCard: {flexDirection: 'row', gap: 12, backgroundColor: C.lightAmber},
  lockTitle: {fontSize: 13.5, fontWeight: '900', color: C.amber},
  lockText: {fontSize: 12, fontWeight: '600', color: C.text, marginTop: 3, lineHeight: 17},

  busyCard: {backgroundColor: C.lightOrange},
  busyHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  busyTitle: {flex: 1, fontSize: 14, fontWeight: '900', color: C.orange},
  busyLeft: {fontSize: 12, fontWeight: '900', color: C.dark},
  busyText: {fontSize: 12.5, fontWeight: '700', color: C.text, marginTop: 8, lineHeight: 18},
  busyTimes: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  busyTime: {fontSize: 11, fontWeight: '800', color: C.muted},

  activeTitle: {fontSize: 13, fontWeight: '900', color: C.dark},
  activeText: {fontSize: 11.5, color: C.muted, fontWeight: '600', marginTop: 2},

  sectionTitle: {fontSize: 16, fontWeight: '900', color: C.dark},
  rateRow: {flexDirection: 'row', gap: 8, marginTop: 12},
  rateBox: {flex: 1, backgroundColor: C.bg, borderRadius: 14, padding: 10, alignItems: 'center'},
  rateValue: {fontSize: 15, fontWeight: '900', color: C.dark},
  rateLabel: {fontSize: 10.5, fontWeight: '700', color: C.muted, marginTop: 2},
  hint: {fontSize: 11.5, color: C.muted, fontWeight: '600', marginTop: 10, lineHeight: 16},
  distanceRow: {marginTop: 10},
  value: {fontSize: 13, fontWeight: '700', color: C.text, lineHeight: 19},
  aboutText: {marginTop: 8},

  blockTitle: {fontSize: 17, fontWeight: '900', color: C.dark, marginTop: 24, marginBottom: 2},
  reviewCard: {backgroundColor: C.white, borderRadius: 18, padding: 14, marginTop: 10, ...MARKET_SHADOW},
  reviewer: {fontSize: 13, fontWeight: '900', color: C.dark},
  reviewMeta: {fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 1},
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.lightAmber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewRating: {fontSize: 12, fontWeight: '900', color: C.amber},
  reviewComment: {fontSize: 12.5, color: C.text, marginTop: 10, lineHeight: 18},

  steps: {flexDirection: 'row', gap: 8, marginTop: 10},
  step: {flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 11, ...MARKET_SHADOW},
  stepNumber: {width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center'},
  stepNumberText: {color: C.white, fontSize: 12, fontWeight: '900'},
  stepTitle: {fontSize: 12, fontWeight: '900', color: C.dark, marginTop: 8},
  stepText: {fontSize: 10, color: C.muted, fontWeight: '600', marginTop: 2, lineHeight: 14},

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
  bottomPrice: {fontSize: 18, color: C.dark, fontWeight: '900', letterSpacing: -0.3},
});
