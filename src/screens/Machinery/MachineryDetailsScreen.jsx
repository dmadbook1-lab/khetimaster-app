import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CalendarX,
  Cog,
  Fuel,
  Gauge,
  Inbox,
  MapPin,
  Pencil,
  Power,
  Star,
  Wrench,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { GlassButton, TopInset } from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import {
  EmptyState,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_GRADIENTS,
  MARKET_SHADOW,
} from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import PersonAvatar from '../../components/labour/PersonAvatar';
import { getMachineryCategoryImage } from '../../components/machinery/machineryImages';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import {
  fetchMachineryById,
  setMachineryActive,
} from '../../redux/slices/machinerySlice';
import {
  AVAILABILITY_META,
  BOOKING_STATUS_META,
  FUEL_LABELS,
  getRateOptions,
  startingPrice,
} from '../../utils/machineryFormat';
import {
  dayKeyOf,
  formatDateRange,
  formatDay,
  formatTime,
  formatTimeRange,
} from '../../utils/indiaSchedule';
import { timeAgo } from '../../utils/marketFormat';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 340;

const STEPS = [
  { title: 'Send request', text: 'Pick date, time and rate' },
  { title: 'Owner confirms', text: 'Phone numbers are shared' },
  { title: 'Pay after work', text: 'Then rate the machine' },
];

const RATE_UNIT_TEXT = {
  hour: 'per hour',
  day: 'per day',
  acre: 'per acre',
  job: 'per job',
  custom: 'per booking',
};

const slotDays = slot => {
  const start = dayKeyOf(slot.bookingDate);
  const end = dayKeyOf(slot.endDate) || start;
  if (!start) return '';
  if (end === start) return formatDay(start, { year: false });

  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  return formatDateRange(start, days);
};

export default function MachineryDetailsScreen({ navigation, route }) {
  const { machineryId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { selected, selectedLoading, selectedError, togglingActive } =
    useSelector(state => state.machinery);

  const [imageIndex, setImageIndex] = useState(0);

  const machine = selected?._id === machineryId ? selected : null;

  const load = useCallback(
    () => dispatch(fetchMachineryById(machineryId)),
    [dispatch, machineryId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!machine) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Machinery" onBack={() => navigation.goBack()} />
        {selectedError && !selectedLoading ? (
          <EmptyState
            title="Machine not available"
            message={selectedError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const images = machine.images || [];
  const rates = getRateOptions(machine);
  const ownerName = machine.owner?.fullName || machine.ownerName || 'Owner';
  const location = [machine.village, machine.district, machine.state]
    .filter(Boolean)
    .join(', ');
  const activeBooking = machine.myActiveBooking;
  const canBook =
    machine.isActive !== false && machine.availability === 'available';
  const bookedSlots = machine.bookedSlots || [];
  const reviews = machine.recentReviews || [];

  const specs = [
    machine.enginePower?.value
      ? {
          icon: Gauge,
          label: 'Power',
          value: `${machine.enginePower.value} ${
            machine.enginePower.unit || 'HP'
          }`,
        }
      : null,
    machine.fuelType
      ? { icon: Fuel, label: 'Fuel', value: FUEL_LABELS[machine.fuelType] }
      : null,
    machine.driveType
      ? { icon: Cog, label: 'Drive', value: machine.driveType }
      : null,
    machine.modelYear
      ? { icon: CalendarCheck, label: 'Year', value: String(machine.modelYear) }
      : null,
  ].filter(Boolean);

  const toggleActive = () => {
    if (machine.isActive) {
      feedback.confirm({
        title: 'Stop renting this machine?',
        message:
          'It will be hidden from farmers and its new requests will be cancelled. You can turn it back on any time.',
        confirmLabel: 'Deactivate',
        destructive: true,
        onConfirm: async () => {
          try {
            await dispatch(
              setMachineryActive({ machineryId, active: false }),
            ).unwrap();
            toast.show('Machine hidden from farmers');
          } catch (error) {
            feedback.error('Could not deactivate', String(error), {
              primaryLabel: 'View Requests',
              secondaryLabel: 'Close',
              onPrimary: () =>
                navigation.navigate(MACHINERY_ROUTES.REQUESTS, { machineryId }),
            });
          }
        },
      });
      return;
    }

    feedback.confirm({
      title: 'Start renting again?',
      message: 'Farmers will be able to find and book this machine.',
      confirmLabel: 'Activate',
      onConfirm: async () => {
        try {
          await dispatch(
            setMachineryActive({ machineryId, active: true }),
          ).unwrap();
          toast.show('Machine is live again');
        } catch (error) {
          feedback.error('Could not activate', String(error));
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={selectedLoading}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
      >
        {/* PHOTO HERO */}
        <View style={styles.hero}>
          {images.length ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={event =>
                setImageIndex(
                  Math.round(event.nativeEvent.contentOffset.x / width),
                )
              }
            >
              {images.map(uri => (
                <Image key={uri} source={{ uri }} style={styles.heroImage} />
              ))}
            </ScrollView>
          ) : (
            <Image
              source={getMachineryCategoryImage(machine.category)}
              style={styles.heroImage}
            />
          )}

          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
            style={styles.topShade}
          />

          <View style={styles.heroButtons}>
            <GlassButton
              style={styles.darkGlass}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={20} color={C.white} />
            </GlassButton>
            <StatusPill
              meta={
                machine.isActive === false
                  ? { label: 'Hidden', color: C.text, bg: '#EEF0F2' }
                  : AVAILABILITY_META[machine.availability]
              }
            />
          </View>

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((uri, index) => (
                <View
                  key={uri}
                  style={[styles.dot, index === imageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.sheet}>
          <Text style={styles.categoryTag}>{machine.category}</Text>
          <Text style={styles.title}>{machine.name}</Text>
          {!!(machine.brand || machine.model) && (
            <Text style={styles.subtitle}>
              {[machine.brand, machine.model].filter(Boolean).join(' ')}
            </Text>
          )}

          <View style={styles.ratingRow}>
            <Star size={14} color={C.gold} fill={C.gold} />
            <Text style={styles.ratingText}>
              {machine.totalReviews
                ? `${machine.rating} · ${machine.totalReviews} reviews`
                : 'No reviews yet'}
            </Text>
            <BadgeCheck size={14} color={C.green} />
            <Text style={styles.ratingText}>
              {machine.totalJobsCompleted || 0} jobs done
            </Text>
          </View>

          {/* RATES */}
          <Text style={styles.blockTitle}>Rent rates</Text>
          <View style={styles.rates}>
            {rates.map(rate => (
              <View key={rate.key} style={styles.rate}>
                <Text style={styles.rateLabel} numberOfLines={1}>
                  {rate.label}
                </Text>
                <Text style={styles.rateAmount}>₹{rate.amount}</Text>
                <Text style={styles.rateUnit}>
                  {RATE_UNIT_TEXT[rate.unit] || rate.unit}
                </Text>
              </View>
            ))}
          </View>

          {/* ACTIVE BOOKING */}
          {!!activeBooking && (
            <LinearGradient
              colors={['#EAF1FF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, styles.activeCard]}
            >
              <CalendarCheck size={20} color={C.blue} />
              <View style={styles.flex}>
                <Text style={styles.activeTitle}>
                  You have a booking for this machine
                </Text>
                <Text style={styles.activeText}>
                  {formatDay(activeBooking.bookingDate)} ·{' '}
                  {formatTime(activeBooking.startTime)}
                </Text>
              </View>
              <StatusPill meta={BOOKING_STATUS_META[activeBooking.status]} />
            </LinearGradient>
          )}

          {/* SPECS */}
          {specs.length > 0 && (
            <View style={styles.specGrid}>
              {specs.map(({ icon: Icon, label, value }) => (
                <View key={label} style={styles.spec}>
                  <Icon size={17} color={C.blue} />
                  <Text style={styles.specValue} numberOfLines={1}>
                    {value}
                  </Text>
                  <Text style={styles.specLabel}>{label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* IMPLEMENTS + DESCRIPTION */}
          {(machine.supportsImplements || !!machine.description) && (
            <View style={styles.card}>
              {machine.supportsImplements &&
                (machine.supportedImplements || []).length > 0 && (
                  <>
                    <View style={styles.cardTitleRow}>
                      <Wrench size={16} color={C.orange} />
                      <Text style={styles.cardTitle}>Implements available</Text>
                    </View>
                    <View style={styles.chips}>
                      {machine.supportedImplements.map(item => (
                        <Text key={item} style={styles.chip}>
                          {item}
                        </Text>
                      ))}
                    </View>
                  </>
                )}
              {!!machine.description && (
                <Text
                  style={[
                    styles.paragraph,
                    machine.supportsImplements && styles.paragraphGap,
                  ]}
                >
                  {machine.description}
                </Text>
              )}
            </View>
          )}

          {/* BOOKED DATES */}
          {bookedSlots.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <CalendarX size={16} color={C.red} />
                <Text style={styles.cardTitle}>Already booked</Text>
              </View>
              <Text style={styles.cardText}>
                Pick a different time for these days.
              </Text>
              {bookedSlots.slice(0, 6).map((slot, index) => (
                <View
                  key={`${slot.bookingDate}-${index}`}
                  style={styles.slotRow}
                >
                  <Text style={styles.slotDay}>{slotDays(slot)}</Text>
                  <Text style={styles.slotTime}>
                    {slot.endTime
                      ? formatTimeRange(slot.startTime, slot.endTime)
                      : 'Whole day'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* OWNER */}
          <View style={[styles.card, styles.ownerRow]}>
            <PersonAvatar name={ownerName} size={50} />
            <View style={styles.flex}>
              <Text style={styles.cardLabel}>Owner</Text>
              <Text style={styles.ownerName}>{ownerName}</Text>
              {!!location && (
                <View style={styles.inline}>
                  <MapPin size={11} color={C.muted} />
                  <Text style={styles.cardText} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* REVIEWS */}
          {reviews.length > 0 && (
            <>
              <Text style={styles.blockTitle}>Reviews</Text>
              {reviews.map((review, index) => (
                <View
                  key={`${review.createdAt}-${index}`}
                  style={styles.reviewCard}
                >
                  <View style={styles.reviewHeader}>
                    <PersonAvatar
                      name={review.farmer?.fullName}
                      size={36}
                      gradient="blue"
                    />
                    <View style={styles.flex}>
                      <Text style={styles.reviewer}>
                        {review.farmer?.fullName || 'Farmer'}
                      </Text>
                      <Text style={styles.reviewMeta}>
                        {review.workType} · {timeAgo(review.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.reviewStars}>
                      <Star size={12} color={C.gold} fill={C.gold} />
                      <Text style={styles.reviewRating}>{review.rating}</Text>
                    </View>
                  </View>
                  {!!review.comment && (
                    <Text style={styles.paragraph}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </>
          )}

          {/* HOW IT WORKS */}
          {!machine.isOwner && (
            <>
              <Text style={styles.blockTitle}>How renting works</Text>
              <View style={styles.steps}>
                {STEPS.map((step, index) => (
                  <View key={step.title} style={styles.step}>
                    <LinearGradient
                      colors={MARKET_GRADIENTS.green}
                      style={styles.stepNumber}
                    >
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </LinearGradient>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {machine.isOwner ? (
          <>
            <MarketButton
              variant={machine.isActive ? 'danger' : 'outline'}
              label={machine.isActive ? 'Pause' : 'Activate'}
              icon={
                <Power size={16} color={machine.isActive ? C.red : C.green} />
              }
              loading={togglingActive}
              onPress={toggleActive}
              style={styles.flex}
            />
            <MarketButton
              variant="outline"
              label="Edit"
              icon={<Pencil size={16} color={C.green} />}
              onPress={() =>
                navigation.navigate(MACHINERY_ROUTES.FORM, {
                  machinery: machine,
                })
              }
              style={styles.flex}
            />
            <MarketButton
              label="Requests"
              icon={<Inbox size={16} color={C.white} />}
              onPress={() =>
                navigation.navigate(MACHINERY_ROUTES.REQUESTS, { machineryId })
              }
              style={styles.flex}
            />
          </>
        ) : (
          <>
            <View style={styles.flex}>
              <Text style={styles.bottomLabel}>Starting from</Text>
              <Text style={styles.bottomPrice} numberOfLines={1}>
                {startingPrice(machine)}
              </Text>
            </View>
            {activeBooking ? (
              <MarketButton
                label="View Booking"
                icon={<CalendarCheck size={17} color={C.white} />}
                onPress={() =>
                  navigation.navigate(MACHINERY_ROUTES.BOOKING_DETAILS, {
                    bookingId: activeBooking._id,
                  })
                }
                style={styles.flexWide}
              />
            ) : (
              <MarketButton
                label={canBook ? 'Book Now' : 'Not available'}
                icon={
                  canBook ? <CalendarCheck size={17} color={C.white} /> : null
                }
                disabled={!canBook || !rates.length}
                onPress={() =>
                  navigation.navigate(MACHINERY_ROUTES.BOOK, { machineryId })
                }
                style={styles.flexWide}
              />
            )}
          </>
        )}
      </View>

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },

  hero: { height: HERO_HEIGHT, backgroundColor: '#DDE8E1' },
  heroImage: { width, height: HERO_HEIGHT },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  heroButtons: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkGlass: {
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dots: {
    position: 'absolute',
    bottom: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: { width: 18, backgroundColor: C.white },

  sheet: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    fontSize: 10.5,
    fontWeight: '900',
    color: C.blue,
    backgroundColor: C.lightBlue,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: C.dark,
    marginTop: 10,
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 13, color: C.muted, fontWeight: '700', marginTop: 3 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
    marginRight: 8,
  },

  blockTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.dark,
    marginTop: 22,
    marginBottom: 10,
  },
  rates: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rate: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.green,
    ...MARKET_SHADOW,
  },
  rateLabel: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  rateAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: C.dark,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  rateUnit: { fontSize: 11, fontWeight: '700', color: C.green },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  activeCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activeTitle: { fontSize: 13, fontWeight: '900', color: C.dark },
  activeText: {
    fontSize: 11.5,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
  },

  specGrid: { flexDirection: 'row', gap: 8, marginTop: 14 },
  spec: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 11,
    ...MARKET_SHADOW,
  },
  specValue: { fontSize: 13, fontWeight: '900', color: C.dark, marginTop: 7 },
  specLabel: { fontSize: 10, fontWeight: '700', color: C.muted, marginTop: 1 },

  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: C.dark },
  cardLabel: { fontSize: 11, fontWeight: '800', color: C.muted },
  cardText: { fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  chip: {
    fontSize: 11.5,
    fontWeight: '800',
    color: C.orange,
    backgroundColor: C.lightOrange,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    overflow: 'hidden',
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 19,
    color: C.text,
    fontWeight: '500',
    marginTop: 8,
  },
  paragraphGap: { marginTop: 14 },

  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F1',
  },
  slotDay: { fontSize: 12.5, fontWeight: '800', color: C.dark },
  slotTime: { fontSize: 12, fontWeight: '700', color: C.red },

  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerName: { fontSize: 15.5, fontWeight: '900', color: C.dark, marginTop: 1 },

  reviewCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...MARKET_SHADOW,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewer: { fontSize: 13, fontWeight: '900', color: C.dark },
  reviewMeta: { fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 1 },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: C.lightAmber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewRating: { fontSize: 12, fontWeight: '900', color: C.amber },

  steps: { flexDirection: 'row', gap: 8 },
  step: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 11,
    ...MARKET_SHADOW,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: C.white, fontSize: 12, fontWeight: '900' },
  stepTitle: { fontSize: 12, fontWeight: '900', color: C.dark, marginTop: 8 },
  stepText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },

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
    fontSize: 17,
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});
