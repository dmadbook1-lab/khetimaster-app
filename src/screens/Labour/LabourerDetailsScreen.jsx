import React, { useCallback } from 'react';
import {
  ImageBackground,
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
  Briefcase,
  CalendarCheck,
  CalendarRange,
  Languages,
  MapPin,
  Pencil,
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
import PersonAvatar from '../../components/labour/PersonAvatar';
import { getLabourTypeImage } from '../../components/labour/labourTypes';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import { fetchLabourerById } from '../../redux/slices/labourerSlice';
import {
  AVAILABILITY_META,
  BOOKING_STATUS_META,
  WAGE_TYPE_LABELS,
  formatDateRange,
  formatDay,
  formatExperience,
  formatLabourLocation,
} from '../../utils/labourFormat';
import { timeAgo } from '../../utils/marketFormat';

const STEPS = [
  { title: 'Send request', text: 'Pick the date, time and wage' },
  { title: 'Worker accepts', text: 'Phone numbers are shared' },
  { title: 'Pay after work', text: 'Then rate the worker' },
];

function ChipList({ items }) {
  return (
    <View style={styles.chips}>
      {items.map(item => (
        <Text key={item} style={styles.chip}>
          {item}
        </Text>
      ))}
    </View>
  );
}

export default function LabourerDetailsScreen({ navigation, route }) {
  const { labourerId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { selectedLabourer, labourerLoading, labourerError } = useSelector(
    state => state.labourer,
  );

  const labourer =
    selectedLabourer?._id === labourerId ? selectedLabourer : null;

  // refetch on focus so myActiveBooking is fresh after booking
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchLabourerById(labourerId));
    }, [dispatch, labourerId]),
  );

  if (!labourer) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Worker" onBack={() => navigation.goBack()} />
        {labourerError && !labourerLoading ? (
          <EmptyState
            title="Worker not available"
            message={labourerError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const work = [...new Set([...(labourer.preferredWork || [])])];
  const skills = [...new Set(labourer.skills || [])];
  const languages = labourer.languages || [];
  const reviews = labourer.recentReviews || [];
  const activeBooking = labourer.myActiveBooking;
  const isAvailable = labourer.availability === 'available';
  const location = formatLabourLocation(labourer);

  const availabilityWindow =
    labourer.availableFrom || labourer.availableUntil
      ? [
          labourer.availableFrom
            ? `From ${formatDay(labourer.availableFrom, { weekday: false })}`
            : null,
          labourer.availableUntil
            ? `until ${formatDay(labourer.availableUntil, { weekday: false })}`
            : null,
        ]
          .filter(Boolean)
          .join(' ')
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={labourerLoading}
            onRefresh={() => dispatch(fetchLabourerById(labourerId))}
            colors={[C.green]}
            tintColor={C.white}
          />
        }
      >
        {/* PHOTO HERO */}
        <ImageBackground
          source={getLabourTypeImage(labourer.labourType)}
          resizeMode="cover"
          style={styles.hero}
        >
          <LinearGradient
            colors={[
              'rgba(4,32,16,0.55)',
              'rgba(4,32,16,0.35)',
              'rgba(4,32,16,0.95)',
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroTop}>
            <GlassButton onPress={() => navigation.goBack()}>
              <ArrowLeft size={20} color={C.white} />
            </GlassButton>
            <StatusPill
              meta={AVAILABILITY_META[labourer.availability]}
              style={styles.whitePill}
            />
          </View>

          <View style={styles.heroProfile}>
            <PersonAvatar
              name={labourer.fullName}
              image={labourer.profileImage}
              size={86}
              style={styles.heroAvatar}
            />
            <Text style={styles.heroName}>{labourer.fullName}</Text>
            <Text style={styles.heroType}>{labourer.labourType}</Text>
            {!!location && (
              <View style={styles.inline}>
                <MapPin size={12} color="#BFF0D2" />
                <Text style={styles.heroLocation}>{location}</Text>
              </View>
            )}
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Star size={17} color={C.gold} fill={C.gold} />
              <Text style={styles.statValue}>
                {labourer.totalReviews ? labourer.rating : 'New'}
              </Text>
              <Text style={styles.statLabel}>
                {labourer.totalReviews || 0} reviews
              </Text>
            </View>
            <View style={styles.statBox}>
              <Briefcase size={17} color={C.blue} />
              <Text style={styles.statValue}>
                {formatExperience(labourer.experience, labourer.experienceUnit)}
              </Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statBox}>
              <BadgeCheck size={17} color={C.green} />
              <Text style={styles.statValue}>
                {labourer.totalJobsCompleted || 0}
              </Text>
              <Text style={styles.statLabel}>Jobs done</Text>
            </View>
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
                  You have a booking with this worker
                </Text>
                <Text style={styles.activeText}>
                  {activeBooking.workType} ·{' '}
                  {formatDateRange(
                    activeBooking.bookingDate,
                    activeBooking.numberOfDays,
                  )}
                </Text>
              </View>
              <StatusPill meta={BOOKING_STATUS_META[activeBooking.status]} />
            </LinearGradient>
          )}

          {/* ABOUT */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Work & skills</Text>

            {work.length > 0 && (
              <>
                <Text style={styles.label}>Preferred work</Text>
                <ChipList items={work} />
              </>
            )}

            {skills.length > 0 && (
              <>
                <View style={[styles.inline, styles.labelRow]}>
                  <Wrench size={13} color={C.muted} />
                  <Text style={styles.labelInline}>Skills</Text>
                </View>
                <ChipList items={skills} />
              </>
            )}

            {languages.length > 0 && (
              <>
                <View style={[styles.inline, styles.labelRow]}>
                  <Languages size={13} color={C.muted} />
                  <Text style={styles.labelInline}>Speaks</Text>
                </View>
                <Text style={styles.value}>{languages.join(', ')}</Text>
              </>
            )}

            {!!availabilityWindow && (
              <>
                <View style={[styles.inline, styles.labelRow]}>
                  <CalendarRange size={13} color={C.muted} />
                  <Text style={styles.labelInline}>Available</Text>
                </View>
                <Text style={styles.value}>{availabilityWindow}</Text>
              </>
            )}

            {!work.length && !skills.length && !languages.length && (
              <Text style={styles.value}>{labourer.labourType}</Text>
            )}
          </View>

          {/* REVIEWS */}
          <Text style={styles.blockTitle}>
            Reviews {labourer.totalReviews ? `(${labourer.totalReviews})` : ''}
          </Text>
          {reviews.length ? (
            reviews.map((review, index) => (
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
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noReviews}>
              <Text style={styles.noReviewsText}>
                No reviews yet. Farmers can rate a worker after the job is done.
              </Text>
            </View>
          )}

          {/* HOW IT WORKS */}
          <Text style={styles.blockTitle}>How hiring works</Text>
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
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        {labourer.isOwner ? (
          <MarketButton
            label="Edit My Profile"
            icon={<Pencil size={16} color={C.white} />}
            onPress={() => navigation.navigate(LABOUR_ROUTES.PROFILE_FORM)}
            style={styles.flex}
          />
        ) : (
          <>
            <View style={styles.flex}>
              <Text style={styles.bottomLabel}>Expected wage</Text>
              <Text style={styles.bottomWage}>
                ₹{Number(labourer.expectedWage || 0)}
                <Text style={styles.bottomUnit}>
                  {' '}
                  {WAGE_TYPE_LABELS[labourer.wageType]}
                </Text>
              </Text>
            </View>
            {activeBooking ? (
              <MarketButton
                label="View Booking"
                icon={<CalendarCheck size={17} color={C.white} />}
                onPress={() =>
                  navigation.navigate(LABOUR_ROUTES.BOOKING_DETAILS, {
                    bookingId: activeBooking._id,
                  })
                }
                style={styles.flexWide}
              />
            ) : (
              <MarketButton
                label={isAvailable ? 'Book Worker' : 'Not available'}
                icon={
                  isAvailable ? (
                    <CalendarCheck size={17} color={C.white} />
                  ) : null
                }
                disabled={!isAvailable}
                onPress={() =>
                  navigation.navigate(LABOUR_ROUTES.BOOK, { labourer })
                }
                style={styles.flexWide}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  hero: { minHeight: 360, justifyContent: 'space-between' },
  heroTop: {
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whitePill: { alignSelf: 'center' },
  heroProfile: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 52,
    paddingTop: 20,
  },
  heroAvatar: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  heroName: {
    marginTop: 12,
    color: C.white,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  heroType: {
    marginTop: 6,
    color: '#073F20',
    backgroundColor: '#BFF0D2',
    fontSize: 11.5,
    fontWeight: '900',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroLocation: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },

  sheet: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 13,
    ...MARKET_SHADOW,
  },
  statValue: { fontSize: 15, fontWeight: '900', color: C.dark, marginTop: 8 },
  statLabel: {
    fontSize: 10.5,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
  },

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

  sectionTitle: { fontSize: 16, fontWeight: '900', color: C.dark },
  label: {
    fontSize: 11.5,
    fontWeight: '800',
    color: C.muted,
    marginTop: 12,
    marginBottom: 7,
  },
  labelRow: { marginTop: 14, marginBottom: 7 },
  labelInline: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  value: { fontSize: 13, fontWeight: '700', color: C.text, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    fontSize: 11.5,
    fontWeight: '800',
    color: C.green,
    backgroundColor: C.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    overflow: 'hidden',
  },

  blockTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.dark,
    marginTop: 24,
    marginBottom: 10,
  },
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
  reviewComment: {
    fontSize: 12.5,
    color: C.text,
    marginTop: 10,
    lineHeight: 18,
  },
  noReviews: { backgroundColor: C.white, borderRadius: 18, padding: 16 },
  noReviewsText: {
    fontSize: 12.5,
    color: C.muted,
    fontWeight: '600',
    lineHeight: 18,
  },

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
  bottomWage: {
    fontSize: 18,
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  bottomUnit: { fontSize: 11.5, color: C.muted, fontWeight: '700' },
});
