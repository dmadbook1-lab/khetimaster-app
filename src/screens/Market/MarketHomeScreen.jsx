import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  Handshake,
  LayoutGrid,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Wallet,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  TopInset,
} from '../../components/market/MarketHero';
import ListingGridCard from '../../components/market/ListingGridCard';
import {
  ChipRow,
  EmptyState,
  LoadingState,
} from '../../components/market/MarketBits';
import useMarketMeta from '../../components/market/useMarketMeta';
import { KIND_META, KIND_ORDER } from '../../components/market/kinds';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
  MARKET_SHADOW_STRONG,
} from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  fetchMarketListings,
  toggleSaveMarketListing,
} from '../../redux/slices/marketSlice';

const { width } = Dimensions.get('window');
const GUTTER = 16;
const CARD_WIDTH = (width - GUTTER * 2 - 12) / 2;

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
];

const PAGE_SIZE = 20;

const TRUST_POINTS = [
  { icon: Wallet, label: 'No commission' },
  { icon: Handshake, label: 'Negotiate price' },
  { icon: ShieldCheck, label: 'Pay on handover' },
];

function ToggleChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.toggleChip, active && styles.toggleChipActive]}
    >
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function KindTile({
  label,
  tagline,
  image,
  imageMode,
  color,
  bg,
  selected,
  onPress,
  icon,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.kindTile,
        selected && { borderColor: color, backgroundColor: bg },
      ]}
    >
      <View style={[styles.kindImageBox, { backgroundColor: bg }]}>
        {image ? (
          <Image
            source={image}
            style={[
              styles.kindImage,
              imageMode === 'contain' && styles.kindImageContain,
            ]}
            resizeMode={imageMode}
          />
        ) : (
          icon
        )}
      </View>
      <Text style={[styles.kindLabel, selected && { color }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.kindTagline} numberOfLines={1}>
        {tagline}
      </Text>
    </TouchableOpacity>
  );
}

export default function MarketHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { categories } = useMarketMeta();

  const user = useSelector(state => state.auth.user);
  const {
    listings,
    pagination,
    listingsLoading,
    listingsLoadingMore,
    listingsError,
  } = useSelector(state => state.market);

  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [nearMe, setNearMe] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sort = SORTS[sortIndex];

  // debounce typing
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const categoryOptions = useMemo(
    () => [
      { key: '', label: 'All categories' },
      ...categories
        .filter(item => !kind || item.kind === kind)
        .map(item => ({ key: item.key, label: item.label })),
    ],
    [categories, kind],
  );

  const params = useMemo(
    () => ({
      kind,
      category,
      search,
      sort: sort.key,
      district: nearMe ? user?.district : '',
      deliveryAvailable: deliveryOnly ? 'true' : '',
      isOrganic: organicOnly && kind === 'PRODUCE' ? 'true' : '',
      excludeMine: 'true',
      limit: PAGE_SIZE,
    }),
    [
      kind,
      category,
      search,
      sort.key,
      nearMe,
      user?.district,
      deliveryOnly,
      organicOnly,
    ],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchMarketListings({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  }, [loadFirstPage]);

  const handleLoadMore = useCallback(() => {
    if (
      listingsLoading ||
      listingsLoadingMore ||
      pagination.page >= pagination.pages
    ) {
      return;
    }

    dispatch(
      fetchMarketListings({
        params: { ...params, page: pagination.page + 1 },
        append: true,
      }),
    );
  }, [dispatch, params, pagination, listingsLoading, listingsLoadingMore]);

  const handleKindChange = useCallback(value => {
    setKind(previous => (previous === value ? '' : value));
    setCategory('');
  }, []);

  const handleToggleSave = useCallback(
    listing =>
      dispatch(
        toggleSaveMarketListing({
          listingId: listing._id,
          save: !listing.isSaved,
        }),
      ),
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ListingGridCard
        listing={item}
        width={CARD_WIDTH}
        onToggleSave={handleToggleSave}
        onPress={() =>
          navigation.navigate(MARKET_ROUTES.LISTING_DETAILS, {
            listingId: item._id,
          })
        }
      />
    ),
    [navigation, handleToggleSave],
  );

  const header = (
    <View>
      {/* HERO */}
      <MarketHero
        image={require('../../assets/bazar/bazar-hero.png')}
        onBack={() => navigation.goBack()}
        eyebrow="Farmer to farmer"
        title={'Kheti Market'}
        subtitle="Buy and sell crops, equipment and farm inputs directly. No middlemen."
        right={
          <>
            <GlassButton
              onPress={() => navigation.navigate(MARKET_ROUTES.SAVED)}
            >
              <Bookmark size={19} color={C.white} />
            </GlassButton>
            <GlassButton
              onPress={() => navigation.navigate(MARKET_ROUTES.DEALS)}
            >
              <Handshake size={19} color={C.white} />
            </GlassButton>
          </>
        }
      >
        <View style={styles.searchBox}>
          <Search size={19} color={C.green} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search soybean, rotavator, urea..."
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
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <View key={label} style={styles.trustPill}>
              <Icon size={12} color="#BFF0D2" />
              <Text style={styles.trustText}>{label}</Text>
            </View>
          ))}
        </View>
      </MarketHero>

      <View style={styles.section}>
        {/* SELL CTA + SHORTCUTS */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.sellCtaWrap}
            onPress={() => navigation.navigate(MARKET_ROUTES.SELL)}
          >
            <LinearGradient
              colors={['#F7B733', '#E8890C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sellCta}
            >
              <View style={styles.sellIcon}>
                <Plus size={20} color="#A25200" strokeWidth={3} />
              </View>
              <Text style={styles.sellTitle}>Sell on{'\n'}Kheti Market</Text>
              <View style={styles.sellLink}>
                <Text style={styles.sellLinkText}>List for free</Text>
                <ArrowRight size={13} color="#3A2400" strokeWidth={2.8} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.shortcutColumn}>
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.shortcut}
              onPress={() => navigation.navigate(MARKET_ROUTES.MY_LISTINGS)}
            >
              <View
                style={[styles.shortcutIcon, { backgroundColor: C.lightGreen }]}
              >
                <Store size={18} color={C.green} />
              </View>
              <Text style={styles.shortcutText}>My Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.shortcut}
              onPress={() => navigation.navigate(MARKET_ROUTES.DEALS)}
            >
              <View
                style={[styles.shortcutIcon, { backgroundColor: C.lightBlue }]}
              >
                <Handshake size={18} color={C.blue} />
              </View>
              <Text style={styles.shortcutText}>My Deals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SHOP BY TYPE */}
        <Text style={styles.sectionTitle}>Shop by type</Text>
        <View style={styles.kindRow}>
          <KindTile
            label="Everything"
            tagline="All listings"
            icon={<LayoutGrid size={26} color={C.dark} />}
            color={C.dark}
            bg="#EEF1EF"
            selected={!kind}
            onPress={() => handleKindChange('')}
          />
          {KIND_ORDER.map(key => {
            const meta = KIND_META[key];
            return (
              <KindTile
                key={key}
                {...meta}
                selected={kind === key}
                onPress={() => handleKindChange(key)}
              />
            );
          })}
        </View>

        {/* CATEGORIES */}
        <View style={styles.block}>
          <ChipRow
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {!!user?.district && (
            <ToggleChip
              label={`Near ${user.district}`}
              active={nearMe}
              onPress={() => setNearMe(value => !value)}
            />
          )}
          <ToggleChip
            label="Delivery"
            active={deliveryOnly}
            onPress={() => setDeliveryOnly(value => !value)}
          />
          {kind === 'PRODUCE' && (
            <ToggleChip
              label="Organic"
              active={organicOnly}
              onPress={() => setOrganicOnly(value => !value)}
            />
          )}
        </View>

        {/* RESULTS HEADER */}
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.sectionTitleFlat}>
              {kind ? KIND_META[kind].label : 'Fresh listings'}
            </Text>
            <Text style={styles.resultCount}>
              {listingsLoading
                ? 'Searching…'
                : `${pagination.total} listings found`}
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
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={listingsLoading && !refreshing ? [] : listings}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[C.green]}
            tintColor={C.white}
          />
        }
        ListEmptyComponent={
          listingsLoading ? (
            <LoadingState />
          ) : listingsError ? (
            <EmptyState
              icon={<PackageSearch size={30} color={C.green} />}
              title="Couldn't load listings"
              message={listingsError}
              actionLabel="Try Again"
              onAction={loadFirstPage}
            />
          ) : (
            <EmptyState
              icon={<PackageSearch size={30} color={C.green} />}
              title="No listings found"
              message="Try another category or clear your filters. You can also be the first to list here."
              actionLabel="Sell Something"
              onAction={() => navigation.navigate(MARKET_ROUTES.SELL)}
            />
          )
        }
        ListFooterComponent={
          listingsLoadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  columns: { justifyContent: 'space-between', paddingHorizontal: GUTTER },
  section: { paddingHorizontal: GUTTER },
  block: { marginTop: 14 },

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
  sellCtaWrap: { flex: 1.25, borderRadius: 22, ...MARKET_SHADOW },
  sellCta: {
    flex: 1,
    borderRadius: 22,
    padding: 15,
    minHeight: 138,
    justifyContent: 'space-between',
  },
  sellIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellTitle: {
    color: '#2E1C00',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  sellLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sellLinkText: { color: '#3A2400', fontSize: 11, fontWeight: '900' },
  shortcutColumn: { flex: 1, gap: 12 },
  shortcut: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: C.white,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...MARKET_SHADOW,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: { flex: 1, color: C.dark, fontSize: 12.5, fontWeight: '900' },

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

  kindRow: { flexDirection: 'row', gap: 8 },
  kindTile: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 7,
    paddingBottom: 9,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  kindImageBox: {
    height: 58,
    borderRadius: 13,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindImage: { width: '100%', height: '100%' },
  kindImageContain: { transform: [{ scale: 0.9 }] },
  kindLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    color: C.dark,
    marginTop: 7,
    textAlign: 'center',
  },
  kindTagline: {
    fontSize: 8.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 1,
    textAlign: 'center',
  },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  toggleChip: {
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

  resultsHeader: {
    marginTop: 24,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
  footerLoader: { marginVertical: 16 },
});
