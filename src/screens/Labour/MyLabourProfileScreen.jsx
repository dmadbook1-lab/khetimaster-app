import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowRight,
  BellRing,
  ChevronRight,
  Eye,
  IndianRupee,
  Inbox,
  MapPin,
  Pencil,
  Phone,
  Power,
  ShieldCheck,
  Star,
  UserPlus,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
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
import Toast, { useToast } from '../../components/common/Toast';
import PersonAvatar from '../../components/labour/PersonAvatar';
import { WORKER_HERO_IMAGE } from '../../components/labour/labourTypes';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import {
  fetchMyLabourerProfile,
  saveMyLabourerProfile,
  setMyLabourerActive,
} from '../../redux/slices/labourerSlice';
import {
  AVAILABILITY_META,
  formatDay,
  formatExperience,
  formatLabourLocation,
  formatWage,
} from '../../utils/labourFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import { tOpt } from '../../utils/tOpt';

const BENEFITS = [
  {
    icon: BellRing,
    get title() {
    return i18n.t('myLabourProfile.getWorkRequests');
  },
    get text() {
    return i18n.t('myLabourProfile.farmersNearYouBookYou');
  },
  },
  {
    icon: IndianRupee,
    get title() {
    return i18n.t('myLabourProfile.setYourOwnWage');
  },
    get text() {
    return i18n.t('myLabourProfile.dailyHourlyOrMonthly');
  },
  },
  {
    icon: ShieldCheck,
    get title() {
    return i18n.t('myLabourProfile.yourNumberStaysPrivate');
  },
    get text() {
    return i18n.t('myLabourProfile.sharedOnlyAfterYouAccept');
  },
  },
  {
    icon: Star,
    get title() {
    return i18n.t('myLabourProfile.buildYourRating');
  },
    get text() {
    return i18n.t('myLabourProfile.goodReviewsBringMoreWork');
  },
  },
];

const REGISTER_STEPS = [
  { get title() {
    return i18n.t('myLabourProfile.aboutYou');
  }, get text() {
    return i18n.t('myLabourProfile.namePhoneAndAPhoto');
  } },
  { get title() {
    return i18n.t('myLabourProfile.yourWork');
  }, get text() {
    return i18n.t('myLabourProfile.workYouDoAndYour');
  } },
  { get title() {
    return i18n.t('myLabourProfile.wageDates');
  }, get text() {
    return i18n.t('myLabourProfile.whatYouChargeAndWhen');
  } },
  { get title() {
    return i18n.t('myLabourProfile.yourVillage');
  }, get text() {
    return i18n.t('myLabourProfile.soNearbyFarmersCanFind');
  } },
];

const AVAILABILITY_CHOICES = ['available', 'busy', 'unavailable'];

export default function MyLabourProfileScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { myProfile, myProfileStatus, myProfileError, saving, togglingActive } =
    useSelector(state => state.labourer);

  const load = useCallback(
    () => dispatch(fetchMyLabourerProfile()),
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const setAvailability = async availability => {
    if (availability === myProfile.availability) return;

    try {
      await dispatch(
        saveMyLabourerProfile({
          labourerData: { availability },
          isCreate: false,
        }),
      ).unwrap();
      toast.show(
        t('myLabourProfile.youAreNowShownAs', {v1: AVAILABILITY_META[
          availability
        ].label.toLowerCase()}),
      );
    } catch (error) {
      feedback.error('Could not update availability', String(error));
    }
  };

  const toggleActive = () => {
    if (myProfile.isActive) {
      feedback.confirm({
        title: t('myLabourProfile.stopTakingWork'),
        message:
          t('myLabourProfile.yourProfileWillBeHidden'),
        confirmLabel: t('myLabourProfile.deactivate'),
        destructive: true,
        onConfirm: async () => {
          try {
            await dispatch(setMyLabourerActive(false)).unwrap();
            toast.show(t('myLabourProfile.profileDeactivated'));
          } catch (error) {
            feedback.error('Could not deactivate', String(error), {
              primaryLabel: t('myLabourProfile.viewBookings'),
              secondaryLabel: t('common.close'),
              onPrimary: () => navigation.navigate(LABOUR_ROUTES.REQUESTS),
            });
          }
        },
      });
      return;
    }

    feedback.confirm({
      title: t('myLabourProfile.startTakingWorkAgain'),
      message: t('myLabourProfile.farmersWillBeAbleTo'),
      confirmLabel: t('myLabourProfile.activate'),
      onConfirm: async () => {
        try {
          await dispatch(setMyLabourerActive(true)).unwrap();
          toast.show(t('myLabourProfile.welcomeBackYourProfileIs'));
        } catch (error) {
          feedback.error('Could not activate', String(error));
        }
      },
    });
  };

  /* NOT REGISTERED / LOADING */

  if (myProfileStatus !== 'loaded' || !myProfile) {
    const missing = myProfileStatus === 'missing';
    const openRegistration = () =>
      navigation.navigate(LABOUR_ROUTES.PROFILE_FORM);

    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <MarketHero
            image={WORKER_HERO_IMAGE}
            onBack={() => navigation.goBack()}
            eyebrow={t('myLabourProfile.findWork')}
            title={t('myLabourProfile.earnByWorkingOnFarms')}
            subtitle={t('myLabourProfile.createAFreeWorkerProfile')}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.heroCta}
              onPress={openRegistration}
            >
              <UserPlus size={18} color="#3A2400" />
              <Text style={styles.heroCtaText}>{t('myLabourProfile.registerAsAWorker')}</Text>
              <ArrowRight size={17} color="#3A2400" strokeWidth={2.6} />
            </TouchableOpacity>
            <Text style={styles.heroCtaNote}>{t('myLabourProfile.freeTakesAbout2Minutes')}</Text>
          </MarketHero>

          <View style={styles.body}>
            {missing ? (
              <>
                <Text style={styles.blockTitle}>{t('myLabourProfile.howToRegister')}</Text>
                <View style={styles.card}>
                  {REGISTER_STEPS.map((item, index) => (
                    <View key={item.title} style={styles.regStep}>
                      <View style={styles.regTimeline}>
                        <View style={styles.regNumber}>
                          <Text style={styles.regNumberText}>{index + 1}</Text>
                        </View>
                        {index < REGISTER_STEPS.length - 1 && (
                          <View style={styles.regLine} />
                        )}
                      </View>
                      <View style={styles.regBody}>
                        <Text style={styles.regTitle}>{item.title}</Text>
                        <Text style={styles.regText}>{item.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Text style={styles.blockTitle}>{t('myLabourProfile.whyJoin')}</Text>
                <View style={styles.benefits}>
                  {BENEFITS.map(({ icon: Icon, title, text }) => (
                    <View key={title} style={styles.benefit}>
                      <View style={styles.benefitIcon}>
                        <Icon size={18} color={C.green} />
                      </View>
                      <Text style={styles.benefitTitle}>{title}</Text>
                      <Text style={styles.benefitText}>{text}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={openRegistration}
                >
                  <LinearGradient
                    colors={['#F7B733', '#E8890C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.finalCta}
                  >
                    <View style={styles.flex}>
                      <Text style={styles.finalCtaTitle}>
                        {t('myLabourProfile.readyToStartEarning')}
                      </Text>
                      <Text style={styles.finalCtaText}>
                        {t('myLabourProfile.createYourProfileAndStart')}
                      </Text>
                    </View>
                    <View style={styles.finalCtaButton}>
                      <ArrowRight size={20} color="#A25200" strokeWidth={2.8} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : myProfileStatus === 'error' ? (
              <EmptyState
                title={t('myLabourProfile.couldntLoadYourProfile')}
                message={myProfileError}
                actionLabel={t('myLabourProfile.tryAgain')}
                onAction={load}
              />
            ) : (
              <LoadingState />
            )}
          </View>
        </ScrollView>

        {myProfileStatus !== 'loading' && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 14) + 6 },
            ]}
          >
            <MarketButton
              label={t('myLabourProfile.registerAsAWorker2')}
              icon={<UserPlus size={17} color={C.white} />}
              onPress={openRegistration}
              style={styles.flex}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  /* PROFILE */

  const profile = myProfile;
  const pending = profile.pendingRequests || 0;
  const location = formatLabourLocation(profile);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={myProfileStatus === 'loading'}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.white}
          />
        }
      >
        <MarketHero
          gradient={profile.isActive ? 'forest' : 'slate'}
          onBack={() => navigation.goBack()}
        >
          <View style={styles.profileTop}>
            <PersonAvatar
              name={profile.fullName}
              image={profile.profileImage}
              size={74}
              style={styles.avatar}
            />
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={2}>
                {profile.fullName}
              </Text>
              <Text style={styles.type}>{tOpt(profile.labourType)}</Text>
              <Text style={styles.liveBadge}>
                {profile.isActive ? t('myLabourProfile.profileIsLive') : t('myLabourProfile.profileIsHidden')}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <HeroStat
              value={pending}
              label={t('myLabourProfile.newRequests')}
              highlight={pending > 0}
            />
            <HeroStat
              value={profile.totalReviews ? `★ ${profile.rating}` : t('myLabourProfile.new')}
              label={t('myLabourProfile.reviews', {v1: profile.totalReviews || 0})}
            />
            <HeroStat
              value={profile.totalJobsCompleted || 0}
              label={t('myLabourProfile.jobsDone')}
            />
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* QUICK ACTIONS */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.card, styles.actionRow]}
            onPress={() => navigation.navigate(LABOUR_ROUTES.REQUESTS)}
          >
            <View
              style={[styles.actionIcon, { backgroundColor: C.lightAmber }]}
            >
              <Inbox size={20} color={C.amber} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.actionTitle}>{t('myLabourProfile.workRequests')}</Text>
              <Text style={styles.actionText}>
                {pending
                  ? t('myLabourProfile.waitingForYourReply', {pending})
                  : t('myLabourProfile.seeAllYourBookings')}
              </Text>
            </View>
            <ChevronRight size={19} color={C.muted} />
          </TouchableOpacity>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.card, styles.gridItem]}
              onPress={() => navigation.navigate(LABOUR_ROUTES.PROFILE_FORM)}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: C.lightGreen }]}
              >
                <Pencil size={18} color={C.green} />
              </View>
              <Text style={styles.actionTitle}>{t('myLabourProfile.editProfile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.card, styles.gridItem]}
              onPress={() =>
                navigation.navigate(LABOUR_ROUTES.LABOURER_DETAILS, {
                  labourerId: profile._id,
                })
              }
            >
              <View
                style={[styles.actionIcon, { backgroundColor: C.lightBlue }]}
              >
                <Eye size={18} color={C.blue} />
              </View>
              <Text style={styles.actionTitle}>{t('myLabourProfile.howFarmersSeeMe')}</Text>
            </TouchableOpacity>
          </View>

          {/* AVAILABILITY */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('myLabourProfile.availability')}</Text>
            <Text style={styles.cardText}>
              {profile.isActive
                ? t('myLabourProfile.farmersCanOnlyBookYou')
                : t('myLabourProfile.activateYourProfileToChange')}
            </Text>
            <View style={styles.availabilityRow}>
              {AVAILABILITY_CHOICES.map(choice => {
                const meta = AVAILABILITY_META[choice];
                const selected = profile.availability === choice;

                return (
                  <TouchableOpacity
                    key={choice}
                    activeOpacity={0.85}
                    disabled={!profile.isActive || saving}
                    onPress={() => setAvailability(choice)}
                    style={[
                      styles.availability,
                      selected && {
                        backgroundColor: meta.bg,
                        borderColor: meta.color,
                      },
                      !profile.isActive && styles.disabled,
                    ]}
                  >
                    <View
                      style={[styles.dot, { backgroundColor: meta.color }]}
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
            {(profile.availableFrom || profile.availableUntil) && (
              <Text style={styles.cardText}>
                {t('myLabourProfile.dates')}{' '}
                {[
                  profile.availableFrom &&
                    `from ${formatDay(profile.availableFrom, {
                      weekday: false,
                    })}`,
                  profile.availableUntil &&
                    `until ${formatDay(profile.availableUntil, {
                      weekday: false,
                    })}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            )}
          </View>

          {/* DETAILS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('myLabourProfile.myDetails')}</Text>
            <InfoRow
              label={t('myLabourProfile.wage')}
              value={formatWage(profile.expectedWage, profile.wageType)}
            />
            <InfoRow
              label={t('myLabourProfile.experience')}
              value={formatExperience(
                profile.experience,
                profile.experienceUnit,
              )}
            />
            <InfoRow
              label={t('myLabourProfile.workIDo')}
              value={(profile.preferredWork || []).join(', ')}
            />
            <InfoRow label={t('myLabourProfile.skills')} value={(profile.skills || []).join(', ')} />
            <InfoRow
              label={t('myLabourProfile.languages')}
              value={(profile.languages || []).join(', ')}
            />
            {!!location && (
              <View style={styles.detailRow}>
                <MapPin size={14} color={C.green} />
                <Text style={styles.detailText}>{location}</Text>
              </View>
            )}
            {!!profile.phoneNumber && (
              <View style={styles.detailRow}>
                <Phone size={14} color={C.green} />
                <Text style={styles.detailText}>
                  {t('myLabourProfile.sharedAfterYouAccept', {phoneNumber: profile.phoneNumber})}
                </Text>
              </View>
            )}
          </View>

          {/* ACTIVATE / DEACTIVATE */}
          <MarketButton
            variant={profile.isActive ? 'danger' : 'primary'}
            label={profile.isActive ? t('myLabourProfile.stopTakingWork2') : t('myLabourProfile.startTakingWork')}
            icon={
              <Power size={16} color={profile.isActive ? C.red : C.white} />
            }
            loading={togglingActive}
            onPress={toggleActive}
            style={styles.toggle}
          />
        </View>
      </ScrollView>

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} bottomOffset={30} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 40 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },

  blockTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    marginTop: 22,
    marginBottom: 12,
  },
  heroCta: {
    marginTop: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F7B733',
  },
  heroCtaText: { color: '#3A2400', fontSize: 14.5, fontWeight: '900' },
  heroCtaNote: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11.5,
    fontWeight: '700',
  },

  regStep: { flexDirection: 'row', gap: 12 },
  regTimeline: { alignItems: 'center', width: 30 },
  regNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regNumberText: { color: C.white, fontSize: 13, fontWeight: '900' },
  regLine: { flex: 1, width: 2, backgroundColor: C.mint, marginVertical: 3 },
  regBody: { flex: 1, paddingBottom: 16, paddingTop: 4 },
  regTitle: { fontSize: 14, fontWeight: '900', color: C.dark },
  regText: { fontSize: 12, fontWeight: '600', color: C.muted, marginTop: 2 },

  finalCta: {
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  finalCtaTitle: { color: '#2E1C00', fontSize: 16, fontWeight: '900' },
  finalCtaText: {
    color: '#5C3B00',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 17,
  },
  finalCtaButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  benefits: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  benefit: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 14,
    ...MARKET_SHADOW,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: C.dark,
    marginTop: 10,
  },
  benefitText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 3,
    lineHeight: 16,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
  },
  avatar: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -0.5,
  },
  type: { fontSize: 12.5, fontWeight: '800', color: '#BFF0D2', marginTop: 2 },
  liveBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: '900', color: C.dark },
  actionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  actionGrid: { flexDirection: 'row', gap: 12 },
  gridItem: { flex: 1, gap: 12 },

  cardTitle: { fontSize: 16, fontWeight: '900', color: C.dark },
  cardText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 4,
    lineHeight: 17,
  },
  availabilityRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  availability: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  disabled: { opacity: 0.5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  availabilityText: { fontSize: 12, fontWeight: '800', color: C.text },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  detailText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: C.text },
  toggle: { marginTop: 20 },

  bottomBar: {
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
});
