import React, { useCallback } from 'react';
import {
  Image,
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
  Inbox,
  IndianRupee,
  Plus,
  ShieldCheck,
  Star,
  Tractor,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
import {
  EmptyState,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import {
  OWNER_HERO_IMAGE,
  machineryImageSource,
} from '../../components/machinery/machineryImages';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import { fetchMyMachinery } from '../../redux/slices/machinerySlice';
import { AVAILABILITY_META, startingPrice } from '../../utils/machineryFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const LIST_STEPS = [
  { get title() {
    return i18n.t('myMachinery.addYourMachine');
  }, get text() {
    return i18n.t('myMachinery.nameTypeAndAFew');
  } },
  { get title() {
    return i18n.t('myMachinery.setYourRates');
  }, get text() {
    return i18n.t('myMachinery.perHourPerDayOr');
  } },
  { get title() {
    return i18n.t('myMachinery.getRequests');
  }, get text() {
    return i18n.t('myMachinery.farmersNearbySendBookings');
  } },
  { get title() {
    return i18n.t('myMachinery.confirmEarn');
  }, get text() {
    return i18n.t('myMachinery.doTheWorkAndGet');
  } },
];

const BENEFITS = [
  {
    icon: IndianRupee,
    get title() {
    return i18n.t('myMachinery.earnWhenIdle');
  },
    get text() {
    return i18n.t('myMachinery.rentOutWhenYouAre');
  },
  },
  {
    icon: BellRing,
    get title() {
    return i18n.t('myMachinery.requestsComeToYou');
  },
    get text() {
    return i18n.t('myMachinery.farmersNearYouBookDirectly');
  },
  },
  {
    icon: ShieldCheck,
    get title() {
    return i18n.t('myMachinery.numberStaysPrivate');
  },
    get text() {
    return i18n.t('myMachinery.sharedOnlyAfterYouConfirm');
  },
  },
  {
    icon: Star,
    get title() {
    return i18n.t('myMachinery.buildYourRating');
  },
    get text() {
    return i18n.t('myMachinery.goodReviewsBringMoreWork');
  },
  },
];

const HIDDEN_META = { get label() {
    return i18n.t('myMachinery.hidden');
  }, color: C.text, bg: '#EEF0F2' };

export default function MyMachineryScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { mine, mineStatus, mineError } = useSelector(state => state.machinery);

  const load = useCallback(() => dispatch(fetchMyMachinery()), [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const addMachine = () => navigation.navigate(MACHINERY_ROUTES.FORM);

  /* LANDING / LOADING */

  if (mineStatus !== 'loaded' || mine.length === 0) {
    const empty = mineStatus === 'loaded';

    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <MarketHero
            image={OWNER_HERO_IMAGE}
            onBack={() => navigation.goBack()}
            eyebrow={t('myMachinery.machineOwners')}
            title={t('myMachinery.earnFromYourTractorMachines')}
            subtitle={t('myMachinery.listYourMachineryForFree')}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.heroCta}
              onPress={addMachine}
            >
              <Plus size={18} color="#3A2400" strokeWidth={2.8} />
              <Text style={styles.heroCtaText}>{t('myMachinery.listYourMachine')}</Text>
              <ArrowRight size={17} color="#3A2400" strokeWidth={2.6} />
            </TouchableOpacity>
            <Text style={styles.heroCtaNote}>{t('myMachinery.freeTakesAbout3Minutes')}</Text>
          </MarketHero>

          <View style={styles.body}>
            {mineStatus === 'error' ? (
              <EmptyState
                title={t('myMachinery.couldntLoadYourMachines')}
                message={mineError}
                actionLabel={t('myMachinery.tryAgain')}
                onAction={load}
              />
            ) : !empty ? (
              <LoadingState />
            ) : (
              <>
                <Text style={styles.blockTitle}>{t('myMachinery.howItWorks')}</Text>
                <View style={styles.card}>
                  {LIST_STEPS.map((item, index) => (
                    <View key={item.title} style={styles.regStep}>
                      <View style={styles.regTimeline}>
                        <View style={styles.regNumber}>
                          <Text style={styles.regNumberText}>{index + 1}</Text>
                        </View>
                        {index < LIST_STEPS.length - 1 && (
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

                <Text style={styles.blockTitle}>{t('myMachinery.whyListOnKhetimaster')}</Text>
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

                <TouchableOpacity activeOpacity={0.9} onPress={addMachine}>
                  <LinearGradient
                    colors={['#F7B733', '#E8890C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.finalCta}
                  >
                    <View style={styles.flex}>
                      <Text style={styles.finalCtaTitle}>
                        {t('myMachinery.readyToStartEarning')}
                      </Text>
                      <Text style={styles.finalCtaText}>
                        {t('myMachinery.addYourFirstMachineAnd')}
                      </Text>
                    </View>
                    <View style={styles.finalCtaButton}>
                      <ArrowRight size={20} color="#A25200" strokeWidth={2.8} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {mineStatus !== 'loading' && (
          <View
            style={[
              styles.bottomBar,
              { paddingBottom: Math.max(insets.bottom, 14) + 6 },
            ]}
          >
            <MarketButton
              label={t('myMachinery.listYourMachine2')}
              icon={<Plus size={17} color={C.white} />}
              onPress={addMachine}
              style={styles.flex}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  /* OWNER HUB */

  const pending = mine.reduce(
    (sum, item) => sum + (item.pendingRequests || 0),
    0,
  );
  const jobs = mine.reduce(
    (sum, item) => sum + (item.totalJobsCompleted || 0),
    0,
  );
  const live = mine.filter(
    item => item.isActive && item.availability === 'available',
  ).length;

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
            colors={[C.green]}
            tintColor={C.green}
          />
        }
      >
        <MarketHero
          compact
          gradient="forest"
          onBack={() => navigation.goBack()}
          eyebrow={t('myMachinery.machineOwner')}
          title={t('myMachinery.myMachines')}
          subtitle={t('myMachinery.ofAvailableForRent', {live, length: mine.length})}
          right={
            <GlassButton onPress={addMachine}>
              <Plus size={20} color={C.white} />
            </GlassButton>
          }
        >
          <View style={styles.statsRow}>
            <HeroStat
              value={pending}
              label={t('myMachinery.newRequests')}
              highlight={pending > 0}
            />
            <HeroStat value={mine.length} label={t('myMachinery.machines')} />
            <HeroStat value={jobs} label={t('myMachinery.jobsDone')} />
          </View>
        </MarketHero>

        <View style={styles.body}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.card, styles.actionRow]}
            onPress={() => navigation.navigate(MACHINERY_ROUTES.REQUESTS)}
          >
            <View
              style={[styles.actionIcon, { backgroundColor: C.lightAmber }]}
            >
              <Inbox size={20} color={C.amber} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.actionTitle}>{t('myMachinery.rentalRequests')}</Text>
              <Text style={styles.actionText}>
                {pending
                  ? t('myMachinery.waitingForYourReply', {pending})
                  : t('myMachinery.seeAllBookingsForYour')}
              </Text>
            </View>
            <ChevronRight size={19} color={C.muted} />
          </TouchableOpacity>

          <Text style={styles.blockTitle}>{t('myMachinery.yourMachines')}</Text>

          {mine.map(machine => (
            <TouchableOpacity
              key={machine._id}
              activeOpacity={0.9}
              style={styles.machineCard}
              onPress={() =>
                navigation.navigate(MACHINERY_ROUTES.DETAILS, {
                  machineryId: machine._id,
                })
              }
            >
              <View style={styles.machineTop}>
                <Image
                  source={machineryImageSource(machine)}
                  style={styles.machineImage}
                />
                <View style={styles.flex}>
                  <Text style={styles.machineName} numberOfLines={1}>
                    {machine.name}
                  </Text>
                  <Text style={styles.machineMeta} numberOfLines={1}>
                    {[machine.category, machine.brand]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  <Text style={styles.machinePrice}>
                    {startingPrice(machine)}
                  </Text>
                </View>
                <StatusPill
                  meta={
                    machine.isActive
                      ? AVAILABILITY_META[machine.availability]
                      : HIDDEN_META
                  }
                />
              </View>

              {machine.pendingRequests > 0 && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.pendingStrip}
                  onPress={() =>
                    navigation.navigate(MACHINERY_ROUTES.REQUESTS, {
                      machineryId: machine._id,
                    })
                  }
                >
                  <Inbox size={15} color={C.amber} />
                  <Text style={styles.pendingText}>
                    {machine.pendingRequests}{' '}
                    {machine.pendingRequests === 1 ? t('plural.request') : t('plural.requests')}{' '}
                    {t('myMachinery.waitingForYourReply2')}
                  </Text>
                  <ChevronRight size={16} color={C.amber} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.addCard}
            onPress={addMachine}
          >
            <Tractor size={22} color={C.green} />
            <Text style={styles.addText}>{t('myMachinery.addAnotherMachine')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

  blockTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    marginTop: 22,
    marginBottom: 12,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
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

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
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

  machineCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  machineTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  machineImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#E3EEE7',
  },
  machineName: { fontSize: 15, fontWeight: '900', color: C.dark },
  machineMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  machinePrice: {
    fontSize: 14,
    fontWeight: '900',
    color: C.green,
    marginTop: 4,
  },
  pendingStrip: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.lightAmber,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingText: { flex: 1, fontSize: 12, fontWeight: '800', color: C.amber },
  addCard: {
    marginTop: 4,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addText: { fontSize: 14, fontWeight: '900', color: C.green },

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
