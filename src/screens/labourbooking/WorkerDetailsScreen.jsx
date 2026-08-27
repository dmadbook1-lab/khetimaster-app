import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  BadgeCheck,
  Sparkles,
  Briefcase,
  Clock3,
  Phone,
  MessageCircle,
  MapPin,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';

import {
  getLabourerById,
} from '../../redux/slices/labourerSlice';

import {
  setLabourFormData,
} from '../../redux/slices/labourSlice';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size,
    Math.min(size * scale, size + 3),
  );
};

const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const ORANGE = '#F97316';

export default function WorkerDetailsScreen({
  navigation,
  route,
}) {
  const dispatch = useDispatch();

  const routeWorker =
    route?.params?.worker;

  const selectedWorker =
    useSelector(
      state =>
        state.labourer?.selectedLabourer,
    );

  const worker =
    selectedWorker || routeWorker;

  const [favourite, setFavourite] =
    useState(
      routeWorker?.favourite || false,
    );

  const workerId =
    routeWorker?._id ||
    routeWorker?.id;

  useEffect(() => {
    if (workerId) {
      dispatch(
        getLabourerById(workerId),
      );
    }
  }, [dispatch, workerId]);

  const workerName =
    worker?.fullName ||
    worker?.name ||
    'Unnamed Worker';

  const rating =
    Number(worker?.rating ?? 0);

  const reviews =
    Number(worker?.totalReviews ?? 0);

  const wage =
    Number(worker?.expectedWage ?? 0);

  const wageType =
    worker?.wageType || 'daily';

  const skills =
    Array.isArray(worker?.skills) &&
    worker.skills.length
      ? worker.skills
      : Array.isArray(
          worker?.preferredWork,
        )
      ? worker.preferredWork
      : worker?.labourType
      ? [worker.labourType]
      : [];

  const experience =
    worker?.experience
      ? `${worker.experience} ${
          worker?.experienceUnit || 'years'
        }`
      : 'Experience not specified';

  const location = [
    worker?.village,
    worker?.district,
    worker?.state,
  ]
    .filter(Boolean)
    .join(', ');

  const handleBookWorker = () => {
    if (!worker?._id) {
      Alert.alert(
        'Worker unavailable',
        'Worker information is still loading. Please try again.',
      );
      return;
    }

    dispatch(
      setLabourFormData({
        gender:
          worker?.gender || '',
        preferredWork:
          skills,
        fullName:
          workerName,
        phoneNumber:
          worker?.phoneNumber || '',
        village:
          worker?.village || '',
        profileImage:
          worker?.profileImage || '',
        expectedWage:
          String(wage),
        wageType:
          wageType === 'hourly'
            ? 'hourly'
            : 'daily',
        experience:
          worker?.experience
            ? String(worker.experience)
            : '',
        experienceUnit:
          worker?.experienceUnit ||
          'years',
      }),
    );

    navigation.navigate(
      'LabourBookingDetails',
      {
        worker,
      },
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.iconBtn}>
          <ArrowLeft
            size={rf(22)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Worker Details
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 8,
          }}>
          <TouchableOpacity
            onPress={() =>
              setFavourite(!favourite)
            }
            style={styles.iconBtn}>
            <Heart
              size={rf(18)}
              color={
                favourite ? '#EF4444' : DARK
              }
              fill={
                favourite
                  ? '#EF4444'
                  : 'transparent'
              }
              strokeWidth={2.2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}>
            <Share2
              size={rf(18)}
              color={DARK}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}>

        <View style={styles.heroWrap}>
          {worker?.profileImage ? (
            <Image
              source={{
                uri: worker.profileImage,
              }}
              style={styles.hero}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text
                style={
                  styles.heroPlaceholderText
                }>
                {workerName
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.availablePill}>
            <View style={styles.dot} />

            <Text style={styles.availableText}>
              {worker?.isActive === false
                ? 'Unavailable'
                : worker?.availability ===
                  'available'
                ? 'Available Today'
                : worker?.availability ||
                  'Available'}
            </Text>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.workerName}>
              {workerName}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 6,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}>
                <Star
                  size={rf(12)}
                  color="#FACC15"
                  fill="#FACC15"
                />

                <Text
                  style={
                    styles.ratingWhite
                  }>
                  {rating.toFixed(1)} (
                  {reviews} Reviews)
                </Text>
              </View>

              {worker?.isVerified && (
                <View
                  style={
                    styles.verifiedPill
                  }>
                  <BadgeCheck
                    size={rf(10)}
                    color={GREEN}
                    strokeWidth={2.5}
                  />

                  <Text
                    style={
                      styles.verifiedText
                    }>
                    Verified
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.expPill}>
              <Briefcase
                size={rf(11)}
                color="#FFFFFF"
              />

              <Text style={styles.expText}>
                {experience}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            padding: width * 0.037,
          }}>

          <Text style={styles.sectionTitle}>
            About Worker
          </Text>

          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Experienced farm worker
              specializing in agricultural
              activities and seasonal farm
              work. Known for reliability,
              punctuality, and quality work
              output.
            </Text>

            <View style={styles.jobsPill}>
              <Sparkles
                size={rf(14)}
                color={GREEN}
              />

              <Text style={styles.jobsText}>
                {worker?.totalJobsCompleted
                  ? `Completed over ${worker.totalJobsCompleted} successful farming jobs`
                  : 'Experienced agricultural worker'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Skills
          </Text>

          <View style={styles.skillsRow}>
            {skills.length > 0 ? (
              skills.map(skill => (
                <View
                  key={String(skill)}
                  style={styles.skillPill}>
                  <Text
                    style={
                      styles.skillText
                    }>
                    {skill}
                  </Text>
                </View>
              ))
            ) : (
              <View
                style={styles.skillPill}>
                <Text
                  style={styles.skillText}>
                  Farm Labour
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>
            AI Recommendation
          </Text>

          <LinearGradient
            colors={[
              '#158B3D',
              '#18A84A',
            ]}
            style={styles.aiCard}>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <View
                style={styles.aiIconBox}>
                <Briefcase
                  size={rf(18)}
                  color="#FFFFFF"
                />
              </View>

              <View style={{flex: 1}}>
                <Text style={styles.aiTitle}>
                  AI Recommendation
                </Text>

                <Text
                  style={styles.aiSub}>
                  Based on your farm &
                  crop data
                </Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text
                  style={
                    styles.scorePercent
                  }>
                  96%
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                }}>
                <Text
                  style={
                    styles.scoreLabel
                  }>
                  COMPATIBILITY SCORE
                </Text>

                <Text
                  style={styles.scoreText}>
                  Highly Suitable for Your
                  Farm
                </Text>
              </View>
            </View>

            <View style={styles.aiGrid}>
              <View style={styles.aiStat}>
                <Text
                  style={
                    styles.aiStatLabel
                  }>
                  WORK TYPE
                </Text>

                <Text
                  style={
                    styles.aiStatValue
                  }>
                  {skills[0] ||
                    'Farm Labour'}
                </Text>
              </View>

              <View style={styles.aiStat}>
                <Text
                  style={
                    styles.aiStatLabel
                  }>
                  LOCATION
                </Text>

                <Text
                  style={
                    styles.aiStatValue
                  }>
                  {worker?.district ||
                    'Nearby'}
                </Text>
              </View>

              <View style={styles.aiStat}>
                <Text
                  style={
                    styles.aiStatLabel
                  }>
                  EXPERIENCE
                </Text>

                <Text
                  style={
                    styles.aiStatValue
                  }>
                  {experience}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>
            Experience
          </Text>

          <View style={styles.expGrid}>
            <ExpCard
              label="Jobs Completed"
              value={
                worker?.totalJobsCompleted
                  ? `${worker.totalJobsCompleted}+`
                  : '—'
              }
              bg="#DCFCE7"
            />

            <ExpCard
              label="Average Rating"
              value={rating.toFixed(1)}
              bg="#FEF3C7"
            />

            <ExpCard
              label="Experience"
              value={
                worker?.experience
                  ? `${worker.experience} ${
                      worker?.experienceUnit ||
                      'Yrs'
                    }`
                  : '—'
              }
              bg="#DBEAFE"
            />

            <ExpCard
              label="Reviews"
              value={`${reviews}`}
              bg="#E0F2FE"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Pricing
          </Text>

          <View style={styles.priceRow}>
            <View style={styles.priceCard}>
              <Text
                style={
                  styles.priceValue
                }>
                ₹{wage}
              </Text>

              <Text
                style={
                  styles.priceLabel
                }>
                {wageType === 'hourly'
                  ? 'Per Hour'
                  : 'Per Day'}
              </Text>
            </View>
          </View>

          <View style={styles.minBooking}>
            <Clock3
              size={rf(14)}
              color={ORANGE}
            />

            <Text style={styles.minText}>
              Minimum Booking: 1 Day
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Contact & Location
          </Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() =>
                Alert.alert(
                  'Call',
                  worker?.phoneNumber
                    ? `Calling ${worker.phoneNumber}`
                    : 'Worker phone number is unavailable',
                )
              }>
              <Phone
                size={rf(15)}
                color={GREEN}
              />

              <Text
                style={
                  styles.contactText
                }>
                Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() =>
                Alert.alert(
                  'Chat',
                  'Opening chat...',
                )
              }>
              <MessageCircle
                size={rf(15)}
                color={GREEN}
              />

              <Text
                style={
                  styles.contactText
                }>
                Chat
              </Text>
            </TouchableOpacity>

            <View style={styles.contactBtn}>
              <MapPin
                size={rf(15)}
                color={GREEN}
              />

              <Text
                style={
                  styles.contactText
                }
                numberOfLines={1}>
                {location || 'Nearby'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text
            style={styles.bottomLabel}>
            {wageType === 'hourly'
              ? 'Hourly Wage'
              : 'Daily Wage'}
          </Text>

          <Text
            style={styles.bottomValue}>
            ₹{wage}

            <Text style={styles.perDay}>
              {' '}
              /{' '}
              {wageType === 'hourly'
                ? 'Hour'
                : 'Day'}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleBookWorker}
          style={styles.bookBtn}>
          <Briefcase
            size={rf(16)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />

          <Text style={styles.bookText}>
            Book Worker
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ExpCard({
  label,
  value,
  bg,
}) {
  return (
    <View
      style={[
        styles.expCard,
        {backgroundColor: bg},
      ]}>
      <Text style={styles.expValue}>
        {value}
      </Text>

      <Text style={styles.expLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.037,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },

  heroWrap: {
    position: 'relative',
  },

  hero: {
    width: '100%',
    height: 280,
  },

  heroPlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroPlaceholderText: {
    fontSize: 80,
    fontWeight: '900',
    color: GREEN,
  },

  availablePill: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.96)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },

  availableText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },

  heroInfo: {
    position: 'absolute',
    bottom: 18,
    left: 16,
    right: 16,
  },

  workerName: {
    fontSize: rf(26),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  ratingWhite: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  verifiedPill: {
    paddingHorizontal: 9,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  verifiedText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },

  expPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 7,
    backgroundColor:
      'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  expText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },

  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
  },

  aboutText: {
    fontSize: rf(13),
    lineHeight: rf(19),
    color: MUTED,
    fontWeight: '500',
  },

  jobsPill: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  jobsText: {
    flex: 1,
    fontSize: rf(12),
    fontWeight: '800',
    color: GREEN,
  },

  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skillPill: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  skillText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: GREEN,
  },

  aiCard: {
    borderRadius: 14,
    padding: 16,
  },

  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiSub: {
    marginTop: 2,
    fontSize: rf(12),
    color: '#DCFCE7',
  },

  scoreRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scoreBox: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor:
      'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scorePercent: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  scoreLabel: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#DCFCE7',
  },

  scoreText: {
    marginTop: 3,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiGrid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },

  aiStat: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
  },

  aiStatLabel: {
    fontSize: rf(10),
    fontWeight: '700',
    color: '#DCFCE7',
  },

  aiStatValue: {
    marginTop: 4,
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  expGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  expCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    flexGrow: 1,
  },

  expValue: {
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
  },

  expLabel: {
    marginTop: 4,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },

  priceRow: {
    flexDirection: 'row',
    gap: 10,
  },

  priceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },

  priceValue: {
    fontSize: rf(22),
    fontWeight: '900',
    color: GREEN,
  },

  priceLabel: {
    marginTop: 4,
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '600',
  },

  minBooking: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  minText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: ORANGE,
  },

  contactRow: {
    flexDirection: 'row',
    gap: 8,
  },

  contactBtn: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  contactText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 78,
    paddingHorizontal: width * 0.037,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomLabel: {
    fontSize: rf(11),
    color: '#94A3B8',
    fontWeight: '600',
  },

  bottomValue: {
    marginTop: 3,
    fontSize: rf(20),
    color: GREEN,
    fontWeight: '900',
  },

  perDay: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },

  bookBtn: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  bookText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});