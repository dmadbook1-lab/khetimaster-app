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
  Inbox,
  IndianRupee,
  Pencil,
  Plus,
  ShieldCheck,
  Sprout,
  Star,
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
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import { PlantImage } from '../../components/nursery/NurseryBits';
import { NURSERY_BANNER } from '../../components/nursery/nurseryVisuals';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  fetchMyNurseryListings,
  setNurseryPlantActive,
} from '../../redux/slices/nurserySlice';
import { formatRupees } from '../../utils/marketFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const SELL_STEPS = [
  { get title() {
    return i18n.t('myNurseryListings.addYourPlant');
  }, get text() {
    return i18n.t('myNurseryListings.nameCategoryAndAFew');
  } },
  { get title() {
    return i18n.t('myNurseryListings.setPriceStock');
  }, get text() {
    return i18n.t('myNurseryListings.pricePerPlantAndHow');
  } },
  { get title() {
    return i18n.t('myNurseryListings.getOrders');
  }, get text() {
    return i18n.t('myNurseryListings.buyersOrderWithCashOn');
  } },
  { get title() {
    return i18n.t('myNurseryListings.confirmDeliver');
  }, get text() {
    return i18n.t('myNurseryListings.collectCashWhenYouHand');
  } },
];

const BENEFITS = [
  {
    icon: IndianRupee,
    get title() {
    return i18n.t('myNurseryListings.freeToList');
  },
    get text() {
    return i18n.t('myNurseryListings.noFeeToListOr');
  },
  },
  {
    icon: BellRing,
    get title() {
    return i18n.t('myNurseryListings.ordersComeToYou');
  },
    get text() {
    return i18n.t('myNurseryListings.buyersNearbyFindYourNursery');
  },
  },
  {
    icon: ShieldCheck,
    get title() {
    return i18n.t('myNurseryListings.stockStaysRight');
  },
    get text() {
    return i18n.t('myNurseryListings.soldPlantsAreTakenOff');
  },
  },
  {
    icon: Star,
    get title() {
    return i18n.t('myNurseryListings.buildYourRating');
  },
    get text() {
    return i18n.t('myNurseryListings.goodPlantsBringRepeatBuyers');
  },
  },
];

const PAUSED_META = { get label() {
    return i18n.t('myNurseryListings.paused');
  }, color: C.text, bg: '#EEF0F2' };
const SOLD_OUT_META = { get label() {
    return i18n.t('myNurseryListings.soldOut');
  }, color: C.red, bg: C.lightRed };
const LIVE_META = { get label() {
    return i18n.t('myNurseryListings.live');
  }, color: C.green, bg: C.lightGreen };

const statusMetaFor = plant => {
  if (plant.isActive === false) return PAUSED_META;
  if (plant.quantity <= 0) return SOLD_OUT_META;
  return LIVE_META;
};

export default function MyNurseryListingsScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();
  const { mine, mineStatus, mineError, togglingId } = useSelector(
    state => state.nursery,
  );

  const load = useCallback(
    () => dispatch(fetchMyNurseryListings()),
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const addPlant = () => navigation.navigate(NURSERY_ROUTES.FORM);
  const openOrders = () => navigation.navigate(NURSERY_ROUTES.SELLER_ORDERS);

  const togglePaused = plant => {
    const active = plant.isActive === false;

    feedback.confirm({
      title: active ? t('myNurseryListings.showThisPlantAgain') : t('myNurseryListings.pauseThisListing'),
      message: active
        ? t('myNurseryListings.buyersWillBeAbleTo')
        : t('myNurseryListings.buyersWillNotSeeIt'),
      confirmLabel: active ? t('myNurseryListings.showAgain') : t('myNurseryListings.pause'),
      destructive: !active,
      onConfirm: async () => {
        try {
          await dispatch(
            setNurseryPlantActive({ plantId: plant._id, active }),
          ).unwrap();
          toast.show(active ? t('myNurseryListings.plantIsLiveAgain') : t('myNurseryListings.listingPaused'));
        } catch (error) {
          feedback.error('Could not update', String(error));
        }
      },
    });
  };

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
            banner={NURSERY_BANNER}
            onBack={() => navigation.goBack()}
            eyebrow={t('myNurseryListings.forNurseriesGrowers')}
            title={t('myNurseryListings.sellYourPlantsToFarmers')}
            subtitle={t('myNurseryListings.listSaplingsSeedlingsAndGrafted')}
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.heroCta}
              onPress={addPlant}
            >
              <Plus size={18} color="#3A2400" strokeWidth={2.8} />
              <Text style={styles.heroCtaText}>{t('myNurseryListings.listYourFirstPlant')}</Text>
              <ArrowRight size={17} color="#3A2400" strokeWidth={2.6} />
            </TouchableOpacity>
            <Text style={styles.heroCtaNote}>{t('myNurseryListings.freeTakesAbout2Minutes')}</Text>
          </MarketHero>

          <View style={styles.body}>
            {mineStatus === 'error' ? (
              <EmptyState
                title={t('myNurseryListings.couldntLoadYourPlants')}
                message={mineError}
                actionLabel={t('myNurseryListings.tryAgain')}
                onAction={load}
              />
            ) : !empty ? (
              <LoadingState />
            ) : (
              <>
                <Text style={styles.blockTitle}>{t('myNurseryListings.howSellingWorks')}</Text>
                <View style={styles.card}>
                  {SELL_STEPS.map((item, index) => (
                    <View key={item.title} style={styles.regStep}>
                      <View style={styles.regTimeline}>
                        <View style={styles.regNumber}>
                          <Text style={styles.regNumberText}>{index + 1}</Text>
                        </View>
                        {index < SELL_STEPS.length - 1 && (
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

                <Text style={styles.blockTitle}>{t('myNurseryListings.whySellOnKhetimaster')}</Text>
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

                <TouchableOpacity activeOpacity={0.9} onPress={addPlant}>
                  <LinearGradient
                    colors={['#F7B733', '#E8890C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.finalCta}
                  >
                    <View style={styles.flex}>
                      <Text style={styles.finalCtaTitle}>
                        {t('myNurseryListings.readyToStartSelling')}
                      </Text>
                      <Text style={styles.finalCtaText}>
                        {t('myNurseryListings.addYourFirstPlantAnd')}
                      </Text>
                    </View>
                    <View style={styles.finalCtaButton}>
                      <ArrowRight size={20} color="#A25200" strokeWidth={2.8} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.card, styles.actionRow]}
                  onPress={openOrders}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: C.lightBlue },
                    ]}
                  >
                    <Inbox size={20} color={C.blue} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.actionTitle}>{t('myNurseryListings.ordersReceived')}</Text>
                    <Text style={styles.actionText}>
                      {t('myNurseryListings.ordersForPlantsYouSold')}
                    </Text>
                  </View>
                  <ChevronRight size={19} color={C.muted} />
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
              label={t('myNurseryListings.startSelling')}
              icon={<Plus size={17} color={C.white} />}
              onPress={addPlant}
              style={styles.flex}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  /* SELLER HUB */

  const toSend = mine.reduce(
    (sum, plant) => sum + (plant.pendingOrders || 0),
    0,
  );
  const sold = mine.reduce((sum, plant) => sum + (plant.totalSold || 0), 0);
  const live = mine.filter(
    plant => plant.isActive !== false && plant.quantity > 0,
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
          eyebrow={t('myNurseryListings.seller')}
          title={t('myNurseryListings.myNursery')}
          subtitle={t('myNurseryListings.ofPlantsLiveForBuyers', {live, length: mine.length})}
          right={
            <GlassButton onPress={addPlant}>
              <Plus size={20} color={C.white} />
            </GlassButton>
          }
        >
          <View style={styles.statsRow}>
            <HeroStat
              value={toSend}
              label={t('myNurseryListings.plantsToSend')}
              highlight={toSend > 0}
            />
            <HeroStat value={mine.length} label={t('myNurseryListings.listings')} />
            <HeroStat value={sold} label={t('myNurseryListings.sold')} />
          </View>
        </MarketHero>

        <View style={styles.body}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.card, styles.actionRow]}
            onPress={openOrders}
          >
            <View
              style={[styles.actionIcon, { backgroundColor: C.lightAmber }]}
            >
              <Inbox size={20} color={C.amber} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.actionTitle}>{t('myNurseryListings.ordersReceived')}</Text>
              <Text style={styles.actionText}>
                {toSend
                  ? t('myNurseryListings.plantsWaitingToBeConfirmed', {toSend})
                  : t('myNurseryListings.confirmDispatchAndDeliverOrders')}
              </Text>
            </View>
            <ChevronRight size={19} color={C.muted} />
          </TouchableOpacity>

          <Text style={styles.blockTitle}>{t('myNurseryListings.yourPlants')}</Text>

          {mine.map(plant => {
            const paused = plant.isActive === false;

            return (
              <TouchableOpacity
                key={plant._id}
                activeOpacity={0.9}
                style={[styles.plantCard, paused && styles.plantCardPaused]}
                onPress={() =>
                  paused
                    ? navigation.navigate(NURSERY_ROUTES.FORM, { plant })
                    : navigation.navigate(NURSERY_ROUTES.PLANT, {
                        plantId: plant._id,
                      })
                }
              >
                <View style={styles.plantTop}>
                  <PlantImage plant={plant} style={styles.plantImage} />
                  <View style={styles.flex}>
                    <Text style={styles.plantName} numberOfLines={1}>
                      {plant.name}
                    </Text>
                    <Text style={styles.plantMeta} numberOfLines={1}>
                      {t('myNurseryListings.inStock', {category: plant.category, quantity: plant.quantity})}
                    </Text>
                    <Text style={styles.plantPrice}>
                      {formatRupees(plant.price)}
                      <Text style={styles.plantPer}> {t('myNurseryListings.plant')}</Text>
                    </Text>
                  </View>
                  <StatusPill meta={statusMetaFor(plant)} />
                </View>

                {plant.pendingOrders > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.pendingStrip}
                    onPress={openOrders}
                  >
                    <Inbox size={15} color={C.amber} />
                    <Text style={styles.pendingText}>
                      {t('myNurseryListings.orderedWaitingForYou', {pendingOrders: plant.pendingOrders})}
                    </Text>
                    <ChevronRight size={16} color={C.amber} />
                  </TouchableOpacity>
                )}

                <View style={styles.plantActions}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.plantAction}
                    onPress={() =>
                      navigation.navigate(NURSERY_ROUTES.FORM, { plant })
                    }
                  >
                    <Pencil size={14} color={C.green} />
                    <Text style={styles.plantActionText}>
                      {plant.quantity <= 0 ? t('myNurseryListings.addStock') : t('myNurseryListings.edit')}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.plantAction}
                    disabled={togglingId === plant._id}
                    onPress={() => togglePaused(plant)}
                  >
                    <Text
                      style={[
                        styles.plantActionText,
                        !paused && styles.plantActionMuted,
                      ]}
                    >
                      {togglingId === plant._id
                        ? t('myNurseryListings.saving')
                        : paused
                        ? t('myNurseryListings.showAgain2')
                        : t('myNurseryListings.pause')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.addCard}
            onPress={addPlant}
          >
            <Sprout size={22} color={C.green} />
            <Text style={styles.addText}>{t('myNurseryListings.addAnotherPlant')}</Text>
          </TouchableOpacity>
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

  plantCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  plantCardPaused: { opacity: 0.75 },
  plantTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  plantImage: { width: 72, height: 72, borderRadius: 16 },
  plantName: { fontSize: 15, fontWeight: '900', color: C.dark },
  plantMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  plantPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: C.green,
    marginTop: 4,
  },
  plantPer: { fontSize: 11, fontWeight: '700', color: C.muted },
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
  plantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F1',
    paddingTop: 10,
  },
  plantAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  plantActionText: { fontSize: 12.5, fontWeight: '900', color: C.green },
  plantActionMuted: { color: C.muted },
  actionDivider: { width: 1, height: 18, backgroundColor: '#E6EBE8' },
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
