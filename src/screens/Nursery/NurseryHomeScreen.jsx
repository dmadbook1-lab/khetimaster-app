import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  ArrowUpDown,
  Banknote,
  LayoutGrid,
  Package,
  Search,
  ShoppingCart,
  Sprout,
  Store,
  Truck,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from '../../context/LocationContext';
import MarketHero, {
  GlassButton,
  TopInset,
} from '../../components/market/MarketHero';
import { EmptyState, LoadingState } from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
  MARKET_SHADOW_STRONG,
} from '../../components/market/theme';
import PlantGridCard from '../../components/nursery/PlantGridCard';
import useNurseryMeta from '../../components/nursery/useNurseryMeta';
import {
  NURSERY_BANNER,
  categoryVisual,
} from '../../components/nursery/nurseryVisuals';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  fetchMyNurseryListings,
  fetchNurseryCategories,
  fetchNurseryPlants,
} from '../../redux/slices/nurserySlice';
import { fetchNurseryCart } from '../../redux/slices/nurseryCartSlice';
import { formatRupees } from '../../utils/marketFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {tOpt} from '../../utils/tOpt';
import VoiceActionButton from '../../components/voice/VoiceActionButton';
import VoiceFlowOverlay from '../../components/voice/VoiceFlowOverlay';
import { useNurseryVoiceFlow } from '../../components/voice/flows/useFindVoiceFlows';

const { width } = Dimensions.get('window');
const GUTTER = 16;
const CARD_WIDTH = (width - GUTTER * 2 - 12) / 2;
const PAGE_SIZE = 20;

const SORTS = [
  { key: 'newest', get label() {
    return i18n.t('nurseryHome.newest');
  } },
  { key: 'popular', get label() {
    return i18n.t('nurseryHome.bestSelling');
  } },
  { key: 'rating', get label() {
    return i18n.t('nurseryHome.topRated');
  } },
  { key: 'price_asc', get label() {
    return i18n.t('nurseryHome.priceLowToHigh');
  } },
  { key: 'price_desc', get label() {
    return i18n.t('nurseryHome.priceHighToLow');
  } },
];

/*
 * Case-insensitive merge of the suggested categories and the ones that
 * have plants right now; live ones first.
 */
const mergeCategories = (live, suggested) => {
  const seen = new Map();

  for (const category of [...live, ...suggested]) {
    const key = String(category || '')
      .trim()
      .toLowerCase();
    if (key && !seen.has(key)) seen.set(key, category.trim());
  }

  return [...seen.values()];
};

export default function NurseryHomeScreen({ navigation }) {
  const {t} = useTranslation();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const voiceFlow = useNurseryVoiceFlow(navigation);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const meta = useNurseryMeta();

  // "near me" uses where the phone is now, not the profile address
  const { location: liveLocation } = useLocation();
  const nearDistrict = liveLocation?.district || '';
  const { list, pagination, listLoading, listLoadingMore, listError } =
    useSelector(state => state.nursery);
  const liveCategories = useSelector(state => state.nursery.liveCategories);
  const mine = useSelector(state => state.nursery.mine);
  const cart = useSelector(state => state.nurseryCart.cart);

  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [nearMe, setNearMe] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sort = SORTS[sortIndex];
  const categories = mergeCategories(liveCategories, meta.categories);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // cart badge and seller card stay fresh when coming back
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchNurseryCart());
      dispatch(fetchMyNurseryListings());
      dispatch(fetchNurseryCategories());
    }, [dispatch]),
  );

  const params = useMemo(
    () => ({
      search,
      category,
      sort: sort.key,
      district: nearMe ? nearDistrict : '',
      limit: PAGE_SIZE,
    }),
    [search, category, sort.key, nearMe, nearDistrict],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchNurseryPlants({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadFirstPage(),
      dispatch(fetchNurseryCart()),
      dispatch(fetchNurseryCategories()),
    ]);
    setRefreshing(false);
  }, [dispatch, loadFirstPage]);

  const handleLoadMore = useCallback(() => {
    if (
      listLoading ||
      listLoadingMore ||
      pagination.page >= pagination.totalPages
    ) {
      return;
    }

    dispatch(
      fetchNurseryPlants({
        params: { ...params, page: pagination.page + 1 },
        append: true,
      }),
    );
  }, [dispatch, params, pagination, listLoading, listLoadingMore]);

  const isSeller = mine.length > 0;
  const pendingOrders = mine.reduce(
    (sum, plant) => sum + (plant.pendingOrders || 0),
    0,
  );
  const cartCount = cart.totalItems || 0;

  const renderItem = useCallback(
    ({ item }) => (
      <PlantGridCard
        plant={item}
        width={CARD_WIDTH}
        onPress={() =>
          navigation.navigate(NURSERY_ROUTES.PLANT, { plantId: item._id })
        }
      />
    ),
    [navigation],
  );

  const header = (
    <View>
      <MarketHero
        banner={NURSERY_BANNER}
        onBack={() => navigation.goBack()}
        eyebrow={t('nurseryHome.plantNursery')}
        title={t('nurseryHome.healthyPlantsDeliveredHome')}
        subtitle={t('nurseryHome.saplingsSeedlingsAndGraftedPlants')}
        right={
          <>
            <GlassButton
              onPress={() => navigation.navigate(NURSERY_ROUTES.ORDERS)}
            >
              <Package size={19} color={C.white} />
            </GlassButton>
            <GlassButton
              badge={cartCount}
              onPress={() => navigation.navigate(NURSERY_ROUTES.CART)}
            >
              <ShoppingCart size={19} color={C.white} />
            </GlassButton>
          </>
        }
      >
        <View style={styles.trustRow}>
          <View style={styles.trustPill}>
            <Truck size={12} color="#BFF0D2" />
            <Text style={styles.trustText}>
              {t('nurseryHome.freeDeliveryAbove', {v1: formatRupees(meta.delivery.freeAbove)})}
            </Text>
          </View>
          <View style={styles.trustPill}>
            <Banknote size={12} color="#BFF0D2" />
            <Text style={styles.trustText}>{t('nurseryHome.cashOnDelivery')}</Text>
          </View>
        </View>
      </MarketHero>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={19} color={C.green} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('nurseryHome.searchMangoTulsiRose')}
            placeholderTextColor={C.placeholder}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {!!searchText && (
            <TouchableOpacity hitSlop={10} onPress={() => setSearchText('')}>
              <X size={17} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.ctaRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => navigation.navigate(NURSERY_ROUTES.ORDERS)}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: C.lightBlue }]}
            >
              <Package size={19} color={C.blue} />
            </View>
            <Text style={styles.shortcutTitle}>{t('nurseryHome.myOrders')}</Text>
            <Text style={styles.shortcutText}>{t('nurseryHome.trackYourPlants')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.sellCtaWrap}
            onPress={() => navigation.navigate(NURSERY_ROUTES.MY_LISTINGS)}
          >
            <LinearGradient
              colors={['#F7B733', '#E8890C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sellCta}
            >
              <View style={styles.sellIcon}>
                <Store size={19} color="#A25200" />
              </View>
              <Text style={styles.sellTitle}>
                {isSeller ? t('nurseryHome.myNursery') : t('nurseryHome.sellPlants')}
              </Text>
              <View style={styles.sellLink}>
                <Text style={styles.sellLinkText}>
                  {isSeller
                    ? pendingOrders
                      ? t('nurseryHome.plantsToSend', {pendingOrders})
                      : t('nurseryHome.listed', {length: mine.length})
                    : t('nurseryHome.listForFree')}
                </Text>
                <ArrowRight size={13} color="#3A2400" strokeWidth={2.8} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <VoiceActionButton
          label={t('voiceFlow.button.nursery')}
          onPress={() => setVoiceOpen(true)}
        />

        <Text style={styles.sectionTitle}>{t('nurseryHome.shopByCategory')}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeList}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setCategory('')}
          style={[styles.typeTile, !category && styles.typeTileSelected]}
        >
          <View style={[styles.typeIcon, styles.typeAll]}>
            <LayoutGrid size={24} color={C.dark} />
          </View>
          <Text
            style={[styles.typeLabel, !category && styles.typeLabelSelected]}
          >
            {t('nurseryHome.allPlants')}
          </Text>
        </TouchableOpacity>

        {categories.map(item => {
          const selected = category.toLowerCase() === item.toLowerCase();
          const visual = categoryVisual(item);
          const Icon = visual.icon;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.88}
              onPress={() => setCategory(selected ? '' : item)}
              style={[styles.typeTile, selected && styles.typeTileSelected]}
            >
              <View style={[styles.typeIcon, { backgroundColor: visual.bg }]}>
                <Icon size={24} color={visual.color} />
              </View>
              <Text
                style={[styles.typeLabel, selected && styles.typeLabelSelected]}
                numberOfLines={2}
              >
                {tOpt(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitleFlat}>
              {tOpt(category) || (search ? t('nurseryHome.searchResults') : t('nurseryHome.freshFromNurseries'))}
            </Text>
            <Text style={styles.resultCount}>
              {listLoading ? t('nurseryHome.searching') : t('nurseryHome.plantsFound', {total: pagination.total})}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.sortButton}
            onPress={() => setSortIndex(index => (index + 1) % SORTS.length)}
          >
            <ArrowUpDown size={14} color={C.green} />
            <Text style={styles.sortText}>{sort.label}</Text>
          </TouchableOpacity>
        </View>

        {!!nearDistrict && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setNearMe(value => !value)}
            style={[styles.toggleChip, nearMe && styles.toggleChipActive]}
          >
            <Text
              style={[styles.toggleText, nearMe && styles.toggleTextActive]}
            >
              {t('nurseryHome.onlyNear', {nearDistrict})}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerEnd} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={listLoading && !refreshing ? [] : list}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        ListHeaderComponent={header}
        contentContainerStyle={[
          styles.listContent,
          cartCount > 0 && styles.listContentWithCart,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          listLoading ? (
            <LoadingState />
          ) : listError ? (
            <EmptyState
              icon={<Sprout size={30} color={C.green} />}
              title={t('nurseryHome.couldntLoadPlants')}
              message={listError}
              actionLabel={t('nurseryHome.tryAgain')}
              onAction={loadFirstPage}
            />
          ) : (
            <EmptyState
              icon={<Sprout size={30} color={C.green} />}
              title={t('nurseryHome.noPlantsFound')}
              message={t('nurseryHome.tryAnotherCategoryOrSearch')}
            />
          )
        }
        ListFooterComponent={
          listLoadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />

      {cartCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.92}
          style={[styles.cartBar, { bottom: Math.max(insets.bottom, 12) + 4 }]}
          onPress={() => navigation.navigate(NURSERY_ROUTES.CART)}
        >
          <View style={styles.cartIcon}>
            <ShoppingCart size={18} color={C.green} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cartTitle}>
              {t('nurseryHome.inCart', {cartCount, v2: cartCount === 1 ? 'plant' : 'plants'})}
            </Text>
            <Text style={styles.cartSub}>
              {formatRupees(cart.total)}
              {cart.deliveryFee ? t('nurseryHome.inclDelivery') : t('nurseryHome.freeDelivery')}
            </Text>
          </View>
          <Text style={styles.cartAction}>{t('nurseryHome.viewCart')}</Text>
          <ArrowRight size={17} color={C.white} strokeWidth={2.6} />
        </TouchableOpacity>
      )}

      <VoiceFlowOverlay
        visible={voiceOpen}
        flow={voiceFlow}
        onClose={() => setVoiceOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  listContentWithCart: { paddingBottom: 110 },
  columns: { justifyContent: 'space-between', paddingHorizontal: GUTTER },
  section: { paddingHorizontal: GUTTER },
  flex: { flex: 1 },

  searchWrap: { paddingHorizontal: 16, marginTop: 16 },
  searchBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...MARKET_SHADOW_STRONG,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.dark,
    paddingVertical: 0,
    fontWeight: '600',
  },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  trustText: { color: C.white, fontSize: 10.5, fontWeight: '800' },

  ctaRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  shortcut: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: C.white,
    padding: 15,
    minHeight: 132,
    ...MARKET_SHADOW,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    marginTop: 'auto',
    fontSize: 15,
    fontWeight: '900',
    color: C.dark,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },
  sellCtaWrap: { flex: 1, borderRadius: 22, ...MARKET_SHADOW },
  sellCta: { flex: 1, borderRadius: 22, padding: 15, minHeight: 132 },
  sellIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellTitle: {
    marginTop: 'auto',
    color: '#2E1C00',
    fontSize: 15,
    fontWeight: '900',
  },
  sellLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sellLinkText: { color: '#3A2400', fontSize: 11, fontWeight: '900' },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.4,
  },
  sectionTitleFlat: {
    fontSize: 18,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.4,
  },

  typeList: { paddingHorizontal: GUTTER, gap: 10, paddingBottom: 6 },
  typeTile: {
    width: 92,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 8,
    paddingBottom: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  typeTileSelected: { borderColor: C.green, backgroundColor: C.lightGreen },
  typeIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeAll: { backgroundColor: '#EEF1EF' },
  typeLabel: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
    minHeight: 28,
  },
  typeLabelSelected: { color: C.green },

  resultsHeader: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  resultCount: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: '700',
    color: C.muted,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
  },
  sortText: { fontSize: 11, fontWeight: '900', color: C.green },
  toggleChip: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C3CDC7',
    backgroundColor: C.white,
  },
  toggleChipActive: {
    borderStyle: 'solid',
    borderColor: C.blue,
    backgroundColor: C.lightBlue,
  },
  toggleText: { fontSize: 11, fontWeight: '800', color: C.muted },
  toggleTextActive: { color: C.blue },
  headerEnd: { height: 14 },
  footerLoader: { marginVertical: 16 },

  cartBar: {
    position: 'absolute',
    left: GUTTER,
    right: GUTTER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    paddingRight: 16,
    borderRadius: 20,
    backgroundColor: C.greenDeep,
    ...MARKET_SHADOW_STRONG,
  },
  cartIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartTitle: { color: C.white, fontSize: 13.5, fontWeight: '900' },
  cartSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  cartAction: { color: C.white, fontSize: 13, fontWeight: '900' },
});
