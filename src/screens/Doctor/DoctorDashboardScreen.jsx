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
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Eye,
  IndianRupee,
  Inbox,
  Pencil,
  Power,
  ShieldCheck,
  Star,
  Stethoscope,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero, {
  CareGlassButton,
  CareStat,
} from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareBottomBar,
  CareButton,
  CareCard,
  CareEmpty,
  CareLoading,
  CareSectionTitle,
} from '../../components/doctor/CareBits';
import {
  CARE as C,
  CARE_SHADOW,
  DOCTOR_BANNER,
} from '../../components/doctor/careTheme';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import {
  fetchMyDoctorProfile,
  setMyDoctorActive,
  setMyDoctorAvailability,
} from '../../redux/slices/doctorSlice';
import {
  AVAILABILITY_META,
  DOCTOR_TYPE_META,
  feeLabel,
} from '../../utils/doctorFormat';

const JOIN_STEPS = [
  {
    title: 'Create your profile',
    text: 'Type, specialities, fee and languages',
  },
  { title: 'Farmers find you', text: 'In search for vets and crop doctors' },
  { title: 'Accept requests', text: 'Phone numbers are shared on accept' },
  {
    title: 'Visit & advise',
    text: 'Write diagnosis and prescription in the app',
  },
];

const BENEFITS = [
  {
    icon: IndianRupee,
    title: 'Set your own fee',
    text: 'Or offer free consultations',
  },
  {
    icon: BellRing,
    title: 'Requests come to you',
    text: 'With photos of the problem',
  },
  {
    icon: CalendarDays,
    title: 'No double booking',
    text: 'Your booked slots are blocked',
  },
  {
    icon: Star,
    title: 'Build your rating',
    text: 'Farmers review after each visit',
  },
];

const AVAILABILITY_ORDER = ['available', 'busy', 'unavailable'];

export default function DoctorDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { myProfile, myProfileStatus, myProfileError, updating } = useSelector(
    state => state.doctor,
  );

  const load = useCallback(() => dispatch(fetchMyDoctorProfile()), [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const join = () => navigation.navigate(DOCTOR_ROUTES.FORM);

  /* LANDING / LOADING */

  if (myProfileStatus !== 'loaded' || !myProfile) {
    const missing = myProfileStatus === 'missing';

    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <CareHero
            banner={DOCTOR_BANNER}
            onBack={() => navigation.goBack()}
            eyebrow="For doctors & vets"
            title={'Help farmers.\nGrow your practice.'}
            subtitle="Vets and crop doctors get consultation requests from farmers nearby."
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.heroCta}
              onPress={join}
            >
              <Stethoscope size={18} color={C.navy} />
              <Text style={styles.heroCtaText}>Join as a doctor</Text>
              <ArrowRight size={17} color={C.navy} />
            </TouchableOpacity>
            <Text style={styles.heroCtaNote}>Free · takes about 3 minutes</Text>
          </CareHero>

          <View style={styles.body}>
            {myProfileStatus === 'error' ? (
              <CareEmpty
                title="Couldn't load your profile"
                message={myProfileError}
                actionLabel="Try Again"
                onAction={load}
              />
            ) : !missing ? (
              <CareLoading />
            ) : (
              <>
                <CareSectionTitle title="How it works" />
                <CareCard>
                  {JOIN_STEPS.map((step, index) => (
                    <View key={step.title} style={styles.joinStep}>
                      <View style={styles.joinTimeline}>
                        <View style={styles.joinNumber}>
                          <Text style={styles.joinNumberText}>{index + 1}</Text>
                        </View>
                        {index < JOIN_STEPS.length - 1 && (
                          <View style={styles.joinLine} />
                        )}
                      </View>
                      <View style={styles.joinBody}>
                        <Text style={styles.joinTitle}>{step.title}</Text>
                        <Text style={styles.joinText}>{step.text}</Text>
                      </View>
                    </View>
                  ))}
                </CareCard>

                <CareSectionTitle title="Why join" />
                <View style={styles.benefits}>
                  {BENEFITS.map(({ icon: Icon, title, text }) => (
                    <View key={title} style={styles.benefit}>
                      <View style={styles.benefitIcon}>
                        <Icon size={18} color={C.teal} />
                      </View>
                      <Text style={styles.benefitTitle}>{title}</Text>
                      <Text style={styles.benefitText}>{text}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.privacy}>
                  <ShieldCheck size={16} color={C.teal} />
                  <Text style={styles.privacyText}>
                    Your phone number and email are never shown publicly. A
                    farmer sees your number only after you accept their request.
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {missing && (
          <CareBottomBar>
            <CareButton
              label="Create Doctor Profile"
              icon={<Stethoscope size={17} color={C.white} />}
              onPress={join}
              style={styles.flex}
            />
          </CareBottomBar>
        )}
      </SafeAreaView>
    );
  }

  /* DASHBOARD */

  const doctor = myProfile;
  const type = DOCTOR_TYPE_META[doctor.doctorType];
  const hidden = doctor.isActive === false;

  const changeAvailability = async availability => {
    if (availability === doctor.availability || updating) return;

    try {
      await dispatch(setMyDoctorAvailability(availability)).unwrap();
      toast.show(
        availability === 'available'
          ? 'Farmers can book you again'
          : `You are now shown as ${AVAILABILITY_META[
              availability
            ].label.toLowerCase()}`,
      );
    } catch (error) {
      feedback.error('Could not update', String(error));
    }
  };

  const toggleActive = () => {
    if (hidden) {
      feedback.confirm({
        title: 'Start taking consultations?',
        message: 'Your profile will be visible to farmers again.',
        confirmLabel: 'Activate',
        onConfirm: async () => {
          try {
            await dispatch(setMyDoctorActive(true)).unwrap();
            toast.show('Your profile is live again');
          } catch (error) {
            feedback.error('Could not activate', String(error));
          }
        },
      });
      return;
    }

    feedback.confirm({
      title: 'Stop taking consultations?',
      message:
        'Your profile will be hidden and new requests will be cancelled. You can turn it back on any time.',
      confirmLabel: 'Deactivate',
      destructive: true,
      onConfirm: async () => {
        try {
          await dispatch(setMyDoctorActive(false)).unwrap();
          toast.show('Profile hidden from farmers');
        } catch (error) {
          feedback.error('Could not deactivate', String(error), {
            primaryLabel: 'View Accepted',
            secondaryLabel: 'Close',
            onPrimary: () =>
              navigation.navigate(DOCTOR_ROUTES.REQUESTS, {
                status: 'accepted',
              }),
          });
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
            refreshing={false}
            onRefresh={load}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
      >
        <CareHero
          onBack={() => navigation.goBack()}
          right={
            <CareGlassButton
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.FORM, { doctor })
              }
            >
              <Pencil size={18} color={C.white} />
            </CareGlassButton>
          }
          gradient={
            hidden
              ? 'slate'
              : doctor.doctorType === 'agriculturalDoctor'
              ? 'crop'
              : 'care'
          }
          eyebrow={hidden ? 'Profile hidden' : type?.label}
          title={doctor.fullName}
          subtitle={`${feeLabel(doctor)} per consultation · ${
            doctor.totalReviews ? `★ ${doctor.rating}` : 'No reviews yet'
          }`}
          aside={
            <DoctorAvatar
              name={doctor.fullName}
              image={doctor.profileImage}
              doctorType={doctor.doctorType}
              size={74}
            />
          }
        >
          <View style={styles.statsRow}>
            <CareStat
              value={doctor.pendingRequests || 0}
              label="New requests"
              highlight={doctor.pendingRequests > 0}
            />
            <CareStat
              value={doctor.upcomingConsultations || 0}
              label="Upcoming"
            />
            <CareStat
              value={doctor.totalConsultations || 0}
              label="Completed"
            />
          </View>
        </CareHero>

        <View style={styles.body}>
          {hidden ? (
            <CareCard style={styles.hiddenCard}>
              <Text style={styles.hiddenTitle}>Farmers can't see you</Text>
              <Text style={styles.hiddenText}>
                Activate your profile to start getting consultation requests
                again.
              </Text>
              <CareButton
                label="Activate Profile"
                icon={<Power size={16} color={C.white} />}
                loading={updating}
                onPress={toggleActive}
                style={styles.hiddenButton}
              />
            </CareCard>
          ) : (
            <>
              <CareSectionTitle title="Your status" />
              <View style={styles.availability}>
                {AVAILABILITY_ORDER.map(key => {
                  const meta = AVAILABILITY_META[key];
                  const selected = doctor.availability === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.85}
                      disabled={updating}
                      onPress={() => changeAvailability(key)}
                      style={[
                        styles.availabilityItem,
                        selected && {
                          backgroundColor: meta.bg,
                          borderColor: meta.color,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.availabilityDot,
                          { backgroundColor: meta.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.availabilityText,
                          selected && { color: meta.color },
                        ]}
                      >
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.availabilityHint}>
                Only "Available" doctors can be booked.
              </Text>
            </>
          )}

          <CareSectionTitle title="Work" />
          {[
            {
              icon: Inbox,
              color: C.coral,
              title: 'New requests',
              text: doctor.pendingRequests
                ? `${doctor.pendingRequests} farmers are waiting for your reply`
                : 'No new requests right now',
              params: { status: 'pending' },
            },
            {
              icon: CalendarCheck,
              color: C.teal,
              title: "Today's schedule",
              text: 'Accepted consultations for today',
              params: { status: 'accepted', day: 'today' },
            },
            {
              icon: CalendarDays,
              color: C.blue,
              title: 'All consultations',
              text: `${doctor.upcomingConsultations || 0} upcoming`,
              params: { status: 'all' },
            },
          ].map(({ icon: Icon, color, title, text, params }) => (
            <TouchableOpacity
              key={title}
              activeOpacity={0.88}
              style={styles.actionRow}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.REQUESTS, params)
              }
            >
              <View
                style={[styles.actionIcon, { backgroundColor: `${color}1A` }]}
              >
                <Icon size={20} color={color} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.actionTitle}>{title}</Text>
                <Text style={styles.actionText}>{text}</Text>
              </View>
              <ChevronRight size={19} color={C.muted} />
            </TouchableOpacity>
          ))}

          <CareSectionTitle title="Profile" />
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.actionRow}
            disabled={hidden}
            onPress={() =>
              navigation.navigate(DOCTOR_ROUTES.PROFILE, {
                doctorId: doctor._id,
              })
            }
          >
            <View style={[styles.actionIcon, { backgroundColor: C.tealSoft }]}>
              <Eye size={20} color={C.teal} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.actionTitle}>See your public profile</Text>
              <Text style={styles.actionText}>
                {hidden ? 'Hidden while deactivated' : 'What farmers see'}
              </Text>
            </View>
            <ChevronRight size={19} color={C.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.actionRow}
            onPress={() => navigation.navigate(DOCTOR_ROUTES.FORM, { doctor })}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.blueSoft }]}>
              <Pencil size={20} color={C.blue} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.actionTitle}>Edit profile</Text>
              <Text style={styles.actionText}>
                Fee, specialities, languages, availability dates
              </Text>
            </View>
            <ChevronRight size={19} color={C.muted} />
          </TouchableOpacity>

          {!hidden && (
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={updating}
              style={styles.deactivate}
              onPress={toggleActive}
            >
              <Power size={15} color={C.red} />
              <Text style={styles.deactivateText}>
                Stop taking consultations
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 40 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },

  heroCta: {
    marginTop: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.white,
  },
  heroCtaText: { color: C.navy, fontSize: 14.5, fontWeight: '900' },
  heroCtaNote: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11.5,
    fontWeight: '700',
  },

  joinStep: { flexDirection: 'row', gap: 12 },
  joinTimeline: { alignItems: 'center', width: 30 },
  joinNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinNumberText: { color: C.white, fontSize: 13, fontWeight: '900' },
  joinLine: { flex: 1, width: 2, backgroundColor: C.mint, marginVertical: 3 },
  joinBody: { flex: 1, paddingBottom: 16, paddingTop: 4 },
  joinTitle: { fontSize: 14, fontWeight: '900', color: C.ink },
  joinText: { fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 2 },

  benefits: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  benefit: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF3F2',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: C.ink,
    marginTop: 10,
  },
  benefitText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
    lineHeight: 16,
  },
  privacy: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.tealSoft,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: C.tealDeep,
    lineHeight: 18,
  },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },

  hiddenCard: { marginTop: 18, borderColor: '#F4C7C3' },
  hiddenTitle: { fontSize: 15, fontWeight: '900', color: C.ink },
  hiddenText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 4,
  },
  hiddenButton: { marginTop: 14 },

  availability: { flexDirection: 'row', gap: 8, marginTop: 12 },
  availabilityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  availabilityDot: { width: 8, height: 8, borderRadius: 4 },
  availabilityText: { fontSize: 12, fontWeight: '900', color: C.muted },
  availabilityHint: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 8,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#EDF3F2',
    ...CARE_SHADOW,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: '900', color: C.ink },
  actionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  deactivate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 26,
    paddingVertical: 12,
  },
  deactivateText: { fontSize: 13, fontWeight: '900', color: C.red },
});
