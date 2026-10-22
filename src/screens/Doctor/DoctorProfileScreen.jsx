import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Lock,
  MapPin,
  Pencil,
  Star,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { CareTopBar } from '../../components/doctor/CareHero';
import {
  CareBottomBar,
  CareButton,
  CareCard,
  CareCardTitle,
  CareEmpty,
  CareLoading,
  CarePill,
  CareSectionTitle,
} from '../../components/doctor/CareBits';
import {
  CARE as C,
  CARE_GRADIENTS,
  CARE_SHADOW_STRONG,
} from '../../components/doctor/careTheme';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { fetchDoctorById } from '../../redux/slices/doctorSlice';
import {
  dayKeyOf,
  formatDay,
  formatTime,
  todayInIndiaKey,
} from '../../utils/indiaSchedule';
import { timeAgo } from '../../utils/marketFormat';
import {
  AVAILABILITY_META,
  DOCTOR_TYPE_META,
  STATUS_META,
  doctorPlace,
  feeLabel,
} from '../../utils/doctorFormat';

/*
 * Booked times grouped by day: [{day, times: ['10:00 AM', ...]}]
 */
const groupBookedSlots = slots => {
  const days = new Map();

  for (const slot of slots || []) {
    const day = dayKeyOf(slot.consultationDate);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(formatTime(slot.startTime));
  }

  return [...days.entries()].map(([day, times]) => ({ day, times }));
};

export default function DoctorProfileScreen({ navigation, route }) {
  const { doctorId } = route.params;
  const dispatch = useDispatch();
  const todayKey = todayInIndiaKey();

  const { selected, selectedLoading, selectedError } = useSelector(
    state => state.doctor,
  );

  const doctor = selected?._id === doctorId ? selected : null;

  const load = useCallback(
    () => dispatch(fetchDoctorById(doctorId)),
    [dispatch, doctorId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!doctor) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <CareTopBar title="Doctor" onBack={() => navigation.goBack()} />
        {selectedError && !selectedLoading ? (
          <CareEmpty
            title="Doctor not available"
            message={selectedError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <CareLoading />
        )}
      </SafeAreaView>
    );
  }

  const type = DOCTOR_TYPE_META[doctor.doctorType];
  const isCrop = doctor.doctorType === 'agriculturalDoctor';
  const place = doctorPlace(doctor);
  const active = doctor.myActiveConsultation;
  const canBook = doctor.availability === 'available';
  const booked = groupBookedSlots(doctor.bookedSlots);
  const reviews = doctor.recentReviews || [];
  const until = dayKeyOf(doctor.availableUntil);
  const from = dayKeyOf(doctor.availableFrom);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <CareTopBar
        title={type?.label || 'Doctor'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={selectedLoading}
            onRefresh={load}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
      >
        {/* PROFILE HERO */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={isCrop ? CARE_GRADIENTS.crop : CARE_GRADIENTS.vet}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBand}
          >
            <Text style={styles.heroCross}>+</Text>
          </LinearGradient>

          <View style={styles.profileCard}>
            <DoctorAvatar
              name={doctor.fullName}
              image={doctor.profileImage}
              doctorType={doctor.doctorType}
              size={96}
              style={styles.avatar}
            />
            <Text style={styles.name}>{doctor.fullName}</Text>
            <Text style={[styles.type, isCrop && styles.typeCrop]}>
              {type?.label} · {type?.for}
            </Text>
            <CarePill
              meta={AVAILABILITY_META[doctor.availability]}
              style={styles.availability}
            />

            <View style={styles.stats}>
              <View style={styles.stat}>
                <View style={styles.statRow}>
                  <Star size={14} color={C.gold} fill={C.gold} />
                  <Text style={styles.statValue}>
                    {doctor.totalReviews ? doctor.rating : '–'}
                  </Text>
                </View>
                <Text style={styles.statLabel}>
                  {doctor.totalReviews || 0} reviews
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {doctor.totalConsultations || 0}
                </Text>
                <Text style={styles.statLabel}>Consultations</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, styles.feeValue]}>
                  {feeLabel(doctor)}
                </Text>
                <Text style={styles.statLabel}>Per visit</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* ACTIVE CONSULTATION */}
          {!!active && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.activeCard}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.CONSULTATION, {
                  consultationId: active._id,
                })
              }
            >
              <CalendarCheck size={20} color={C.teal} />
              <View style={styles.flex}>
                <Text style={styles.activeTitle}>
                  You have a consultation with this doctor
                </Text>
                <Text style={styles.activeText}>
                  {formatDay(active.consultationDate, { year: false })} ·{' '}
                  {formatTime(active.startTime)}
                </Text>
              </View>
              <CarePill meta={STATUS_META[active.status]} />
            </TouchableOpacity>
          )}

          {/* EXPERTISE */}
          {!!(doctor.specialization || []).length && (
            <>
              <CareSectionTitle title="Treats" />
              <View style={styles.tags}>
                {doctor.specialization.map(item => (
                  <Text
                    key={item}
                    style={[styles.tag, isCrop && styles.tagCrop]}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            </>
          )}

          {!!doctor.about && (
            <CareCard>
              <Text style={styles.paragraph}>{doctor.about}</Text>
            </CareCard>
          )}

          <CareCard>
            {!!(doctor.qualification || []).length && (
              <View style={styles.infoLine}>
                <GraduationCap size={17} color={C.teal} />
                <Text style={styles.infoText}>
                  {doctor.qualification.join(', ')}
                </Text>
              </View>
            )}
            {!!(doctor.languages || []).length && (
              <View style={styles.infoLine}>
                <Languages size={17} color={C.teal} />
                <Text style={styles.infoText}>
                  Speaks {doctor.languages.join(', ')}
                </Text>
              </View>
            )}
            {!!place && (
              <View style={styles.infoLine}>
                <MapPin size={17} color={C.teal} />
                <Text style={styles.infoText}>{place}</Text>
              </View>
            )}
            {!!(from || until) && (
              <View style={styles.infoLine}>
                <CalendarClock size={17} color={C.teal} />
                <Text style={styles.infoText}>
                  Taking consultations
                  {from && from > todayKey ? ` from ${formatDay(from)}` : ''}
                  {until ? ` until ${formatDay(until)}` : ''}
                </Text>
              </View>
            )}
            <View style={styles.infoLine}>
              <Lock size={17} color={C.muted} />
              <Text style={[styles.infoText, styles.mutedText]}>
                Phone number is shared once the doctor accepts your request
              </Text>
            </View>
          </CareCard>

          {/* BOOKED TIMES */}
          {booked.length > 0 && (
            <CareCard>
              <CareCardTitle
                icon={<CalendarClock size={16} color={C.coral} />}
                color={C.coral}
                title="Already booked"
              />
              <Text style={styles.cardHint}>
                Pick a different time on these days.
              </Text>
              {booked.slice(0, 6).map(({ day, times }) => (
                <View key={day} style={styles.slotRow}>
                  <Text style={styles.slotDay}>
                    {day === todayKey
                      ? 'Today'
                      : formatDay(day, { year: false })}
                  </Text>
                  <Text style={styles.slotTimes} numberOfLines={2}>
                    {times.join(', ')}
                  </Text>
                </View>
              ))}
            </CareCard>
          )}

          {/* REVIEWS */}
          <CareSectionTitle title="What farmers say" />
          {reviews.length === 0 ? (
            <CareCard>
              <Text style={styles.mutedText}>
                No reviews yet. Be the first to consult this doctor.
              </Text>
            </CareCard>
          ) : (
            reviews.map((review, index) => (
              <CareCard key={`${review.createdAt}-${index}`}>
                <View style={styles.reviewHead}>
                  <View style={styles.flex}>
                    <Text style={styles.reviewer}>
                      {review.farmer?.fullName || 'Farmer'}
                    </Text>
                    <Text style={styles.reviewMeta}>
                      {[review.problemType, timeAgo(review.createdAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(value => (
                      <Star
                        key={value}
                        size={12}
                        color={C.gold}
                        fill={value <= review.rating ? C.gold : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                {!!review.comment && (
                  <Text style={[styles.paragraph, styles.reviewText]}>
                    {review.comment}
                  </Text>
                )}
              </CareCard>
            ))
          )}

          <View style={styles.verified}>
            <BadgeCheck size={14} color={C.muted} />
            <Text style={styles.verifiedText}>
              Fees are set by the doctor and shown before you book.
            </Text>
          </View>
        </View>
      </ScrollView>

      <CareBottomBar>
        {doctor.isOwner ? (
          <>
            <CareButton
              variant="outline"
              label="Edit"
              icon={<Pencil size={16} color={C.tealDark} />}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.FORM, { doctor })
              }
              style={styles.flex}
            />
            <CareButton
              label="Dashboard"
              icon={<LayoutDashboard size={16} color={C.white} />}
              onPress={() => navigation.navigate(DOCTOR_ROUTES.DASHBOARD)}
              style={styles.flexWide}
            />
          </>
        ) : (
          <>
            <View style={styles.flex}>
              <Text style={styles.bottomLabel}>Consultation fee</Text>
              <Text style={styles.bottomPrice}>{feeLabel(doctor)}</Text>
            </View>
            {active ? (
              <CareButton
                label="View Booking"
                icon={<CalendarCheck size={17} color={C.white} />}
                onPress={() =>
                  navigation.navigate(DOCTOR_ROUTES.CONSULTATION, {
                    consultationId: active._id,
                  })
                }
                style={styles.flexWide}
              />
            ) : (
              <CareButton
                label={canBook ? 'Book Consultation' : 'Not available'}
                icon={
                  canBook ? <CalendarCheck size={17} color={C.white} /> : null
                }
                disabled={!canBook}
                onPress={() =>
                  navigation.navigate(DOCTOR_ROUTES.BOOK, { doctorId })
                }
                style={styles.flexWide}
              />
            )}
          </>
        )}
      </CareBottomBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  flexWide: { flex: 1.5 },

  heroWrap: { paddingHorizontal: 16, paddingTop: 4 },
  heroBand: {
    height: 120,
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroCross: {
    position: 'absolute',
    right: 20,
    top: -14,
    fontSize: 110,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.12)',
  },
  profileCard: {
    marginTop: -64,
    marginHorizontal: 12,
    backgroundColor: C.white,
    borderRadius: 26,
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    ...CARE_SHADOW_STRONG,
  },
  avatar: { marginTop: -38 },
  name: {
    fontSize: 21,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.5,
    marginTop: 10,
    textAlign: 'center',
  },
  type: { fontSize: 12.5, fontWeight: '800', color: C.tealDark, marginTop: 3 },
  typeCrop: { color: C.olive },
  availability: { alignSelf: 'center', marginTop: 8 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EFF4F3',
    alignSelf: 'stretch',
  },
  stat: { flex: 1, alignItems: 'center' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 17, fontWeight: '900', color: C.ink },
  feeValue: { color: C.teal },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: C.muted,
    marginTop: 2,
  },
  statDivider: { width: 1, height: 30, backgroundColor: '#E6EEED' },

  activeCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.tealSoft,
    borderWidth: 1,
    borderColor: C.mint,
  },
  activeTitle: { fontSize: 13, fontWeight: '900', color: C.ink },
  activeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.text,
    marginTop: 2,
  },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: {
    fontSize: 12,
    fontWeight: '800',
    color: C.tealDark,
    backgroundColor: C.tealSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tagCrop: { color: C.olive, backgroundColor: C.oliveSoft },

  paragraph: { fontSize: 13, lineHeight: 20, color: C.text, fontWeight: '500' },
  infoLine: { flexDirection: 'row', gap: 10, paddingVertical: 7 },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 19,
  },
  mutedText: { color: C.muted, fontWeight: '600', fontSize: 12.5 },
  cardHint: { fontSize: 11.5, fontWeight: '600', color: C.muted },
  slotRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4F3',
  },
  slotDay: { width: 92, fontSize: 12.5, fontWeight: '900', color: C.ink },
  slotTimes: { flex: 1, fontSize: 12, fontWeight: '700', color: C.coral },

  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewer: { fontSize: 13.5, fontWeight: '900', color: C.ink },
  reviewMeta: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 1 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { marginTop: 8 },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  verifiedText: { fontSize: 11.5, fontWeight: '600', color: C.muted },

  bottomLabel: { fontSize: 11, color: C.muted, fontWeight: '700' },
  bottomPrice: {
    fontSize: 19,
    color: C.ink,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});
