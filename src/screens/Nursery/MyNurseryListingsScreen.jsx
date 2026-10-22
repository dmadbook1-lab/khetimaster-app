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
import { NURSERY_HERO_IMAGE } from '../../components/nursery/nurseryVisuals';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  fetchMyNurseryListings,
  setNurseryPlantActive,
} from '../../redux/slices/nurserySlice';
import { formatRupees } from '../../utils/marketFormat';

const SELL_STEPS = [
  { title: 'Add your plant', text: 'Name, category and a few photos' },
  { title: 'Set price & stock', text: 'Price per plant and how many you have' },
  { title: 'Get orders', text: 'Buyers order with cash on delivery' },
  { title: 'Confirm & deliver', text: 'Collect cash when you hand over' },
];

const BENEFITS = [
  {
    icon: IndianRupee,
    title: 'Free to list',
    text: 'No fee to list or sell plants',
  },
  {
    icon: BellRing,
    title: 'Orders come to you',
    text: 'Buyers nearby find your nursery',
  },
  {
    icon: ShieldCheck,
    title: 'Stock stays right',
    text: 'Sold plants are taken off stock',
  },
  {
    icon: Star,
    title: 'Build your rating',
    text: 'Good plants bring repeat buyers',
  },
];

const PAUSED_META = { label: 'Paused', color: C.text, bg: '#EEF0F2' };
const SOLD_OUT_META = { label: 'Sold out', color: C.red, bg: C.lightRed };
const LIVE_META = { label: 'Live', color: C.green, bg: C.lightGreen };

const statusMetaFor = plant => {
  if (plant.isActive === false) return PAUSED_META;
  if (plant.quantity <= 0) return SOLD_OUT_META;
  return LIVE_META;
};

export default function MyNurseryListingsScreen({ navigation }) {
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
      title: active ? 'Show this plant again?' : 'Pause this listing?',
      message: active
        ? 'Buyers will be able to find and order it again.'
        : 'Buyers will not see it. Orders already placed still need to be delivered.',
      confirmLabel: active ? 'Show Again' : 'Pause',
      destructive: !active,
      onConfirm: async () => {
        try {
          await dispatch(
            setNurseryPlantActive({ plantId: plant._id, active }),
          ).unwrap();
          toast.show(active ? 'Plant is live again' : 'Listing paused');
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
            image={NURSERY_HERO_IMAGE}
            onBack={() => navigation.goBack()}
            eyebrow="For nurseries & growers"
            title={'Sell your plants\nto farmers nearby'}
            subtitle="List saplings, seedlings and grafted plants for free. Buyers pay cash on delivery."
          >
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.heroCta}
              onPress={addPlant}
            >
              <Plus size={18} color="#3A2400" strokeWidth={2.8} />
              <Text style={styles.heroCtaText}>List your first plant</Text>
              <ArrowRight size={17} color="#3A2400" strokeWidth={2.6} />
            </TouchableOpacity>
            <Text style={styles.heroCtaNote}>Free · takes about 2 minutes</Text>
          </MarketHero>

          <View style={styles.body}>
            {mineStatus === 'error' ? (
              <EmptyState
                title="Couldn't load your plants"
                message={mineError}
                actionLabel="Try Again"
                onAction={load}
              />
            ) : !empty ? (
              <LoadingState />
            ) : (
              <>
                <Text style={styles.blockTitle}>How selling works</Text>
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

                <Text style={styles.blockTitle}>Why sell on KhetiMaster</Text>
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
                        Ready to start selling?
                      </Text>
                      <Text style={styles.finalCtaText}>
                        Add your first plant and start getting orders.
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
                    <Text style={styles.actionTitle}>Orders received</Text>
                    <Text style={styles.actionText}>
                      Orders for plants you sold before
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
              label="Start Selling"
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
          eyebrow="Seller"
          title="My Nursery"
          subtitle={`${live} of ${mine.length} plants live for buyers`}
          right={
            <GlassButton onPress={addPlant}>
              <Plus size={20} color={C.white} />
            </GlassButton>
          }
        >
          <View style={styles.statsRow}>
            <HeroStat
              value={toSend}
              label="Plants to send"
              highlight={toSend > 0}
            />
            <HeroStat value={mine.length} label="Listings" />
            <HeroStat value={sold} label="Sold" />
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
              <Text style={styles.actionTitle}>Orders received</Text>
              <Text style={styles.actionText}>
                {toSend
                  ? `${toSend} plants waiting to be confirmed or sent`
                  : 'Confirm, dispatch and deliver orders'}
              </Text>
            </View>
            <ChevronRight size={19} color={C.muted} />
          </TouchableOpacity>

          <Text style={styles.blockTitle}>Your plants</Text>

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
                      {plant.category} · {plant.quantity} in stock
                    </Text>
                    <Text style={styles.plantPrice}>
                      {formatRupees(plant.price)}
                      <Text style={styles.plantPer}> /plant</Text>
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
                      {plant.pendingOrders} ordered · waiting for you
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
                      {plant.quantity <= 0 ? 'Add stock' : 'Edit'}
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
                        ? 'Saving…'
                        : paused
                        ? 'Show again'
                        : 'Pause'}
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
            <Text style={styles.addText}>Add another plant</Text>
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
