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
  NURSERY_HERO_IMAGE,
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

const { width } = Dimensions.get('window');
const GUTTER = 16;
const CARD_WIDTH = (width - GUTTER * 2 - 12) / 2;
const PAGE_SIZE = 20;

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'popular', label: 'Best selling' },
  { key: 'rating', label: 'Top rated' },
  { key: 'price_asc', label: 'Price: low to high' },
  { key: 'price_desc', label: 'Price: high to low' },
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
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const meta = useNurseryMeta();

  const user = useSelector(state => state.auth.user);
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
      district: nearMe ? user?.district : '',
      limit: PAGE_SIZE,
    }),
    [search, category, sort.key, nearMe, user?.district],
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
        image={NURSERY_HERO_IMAGE}
        onBack={() => navigation.goBack()}
        eyebrow="Plant nursery"
        title={'Healthy plants,\ndelivered home'}
        subtitle="Saplings, seedlings and grafted plants from nurseries near you."
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
        <View style={styles.searchBox}>
          <Search size={19} color={C.green} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search mango, tulsi, rose..."
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

        <View style={styles.trustRow}>
          <View style={styles.trustPill}>
            <Truck size={12} color="#BFF0D2" />
            <Text style={styles.trustText}>
              Free delivery above {formatRupees(meta.delivery.freeAbove)}
            </Text>
          </View>
          <View style={styles.trustPill}>
            <Banknote size={12} color="#BFF0D2" />
            <Text style={styles.trustText}>Cash on delivery</Text>
          </View>
        </View>
      </MarketHero>

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
            <Text style={styles.shortcutTitle}>My Orders</Text>
            <Text style={styles.shortcutText}>Track your plants</Text>
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
                {isSeller ? 'My Nursery' : 'Sell plants'}
              </Text>
              <View style={styles.sellLink}>
                <Text style={styles.sellLinkText}>
                  {isSeller
                    ? pendingOrders
                      ? `${pendingOrders} plants to send`
                      : `${mine.length} listed`
                    : 'List for free'}
                </Text>
                <ArrowRight size={13} color="#3A2400" strokeWidth={2.8} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Shop by category</Text>
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
            All plants
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
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.section}>
        <View style={styles.resultsHeader}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitleFlat}>
              {category || (search ? 'Search results' : 'Fresh from nurseries')}
            </Text>
            <Text style={styles.resultCount}>
              {listLoading ? 'Searching…' : `${pagination.total} plants found`}
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

        {!!user?.district && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setNearMe(value => !value)}
            style={[styles.toggleChip, nearMe && styles.toggleChipActive]}
          >
            <Text
              style={[styles.toggleText, nearMe && styles.toggleTextActive]}
            >
              Only near {user.district}
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
              title="Couldn't load plants"
              message={listError}
              actionLabel="Try Again"
              onAction={loadFirstPage}
            />
          ) : (
            <EmptyState
              icon={<Sprout size={30} color={C.green} />}
              title="No plants found"
              message="Try another category or search, or turn off the location filter."
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
              {cartCount} {cartCount === 1 ? 'plant' : 'plants'} in cart
            </Text>
            <Text style={styles.cartSub}>
              {formatRupees(cart.total)}
              {cart.deliveryFee ? ' incl. delivery' : ' · free delivery'}
            </Text>
          </View>
          <Text style={styles.cartAction}>View Cart</Text>
          <ArrowRight size={17} color={C.white} strokeWidth={2.6} />
        </TouchableOpacity>
      )}
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

  searchBox: {
    marginTop: 18,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.white,
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
