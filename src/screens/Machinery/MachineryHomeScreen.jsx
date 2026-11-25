import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowRight,
  ArrowUpDown,
  BookUser,
  CalendarCheck,
  Check,
  LayoutGrid,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Tractor,
  Wallet,
  Warehouse,
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
import MachineryGridCard from '../../components/machinery/MachineryGridCard';
import useMachineryMeta from '../../components/machinery/useMachineryMeta';
import {
  MACHINERY_BANNER,
  getMachineryCategoryImage,
} from '../../components/machinery/machineryImages';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import {
  fetchMachineryList,
  fetchMyMachinery,
} from '../../redux/slices/machinerySlice';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import VoiceActionButton from '../../components/voice/VoiceActionButton';
import VoiceFlowOverlay from '../../components/voice/VoiceFlowOverlay';
import useMachineryVoiceFlow from '../../components/voice/flows/useMachineryVoiceFlow';
import { tOpt } from '../../utils/tOpt';

const { width } = Dimensions.get('window');
const GUTTER = 16;
const CARD_WIDTH = (width - GUTTER * 2 - 12) / 2;

const SORTS = [
  { key: 'newest', get label() {
    return i18n.t('machineryHome.newest');
  } },
  { key: 'rating', get label() {
    return i18n.t('machineryHome.topRated');
  } },
  { key: 'hourly_asc', get label() {
    return i18n.t('machineryHome.lowestHourly');
  } },
  { key: 'daily_asc', get label() {
    return i18n.t('machineryHome.lowestDaily');
  } },
];

const TRUST_POINTS = [
  { icon: Wallet, get label() {
    return i18n.t('machineryHome.payAfterWork');
  } },
  { icon: Phone, get label() {
    return i18n.t('machineryHome.numberSharedOnConfirm');
  } },
  { icon: ShieldCheck, get label() {
    return i18n.t('machineryHome.ratedByFarmers');
  } },
];

const PAGE_SIZE = 20;

export default function MachineryHomeScreen({ navigation }) {
  const {t} = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  // 4 tiles per row inside the 16px side padding, 8px gaps.
  const tileWidth = Math.floor((screenWidth - 32 - 24) / 4);
  // Exact square photo: tile width minus 5px padding and 1.5px border each side.
  const tileImageSize = tileWidth - 13;
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Jump down to the results list when a category is picked.
  const listRef = useRef(null);
  const resultsY = useRef(0);
  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: Math.max(0, resultsY.current - 8),
        animated: true,
      });
    }, 60);
  }, []);
  const voiceFlow = useMachineryVoiceFlow(navigation);
  const dispatch = useDispatch();
  const { categories } = useMachineryMeta();

  // "near me" uses where the phone is now, not the profile address
  const { location: liveLocation } = useLocation();
  const nearDistrict = liveLocation?.district || '';
  const { list, pagination, listLoading, listLoadingMore, listError, mine } =
    useSelector(state => state.machinery);

  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [nearMe, setNearMe] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sort = SORTS[sortIndex];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // owner machines decide the "rent out" card
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyMachinery());
    }, [dispatch]),
  );

  const params = useMemo(
    () => ({
      search,
      category,
      sort: sort.key,
      district: nearMe ? nearDistrict : '',
      excludeMine: 'true',
      limit: PAGE_SIZE,
    }),
    [search, category, sort.key, nearMe, nearDistrict],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchMachineryList({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFirstPage(), dispatch(fetchMyMachinery())]);
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
      fetchMachineryList({
        params: { ...params, page: pagination.page + 1 },
        append: true,
      }),
    );
  }, [dispatch, params, pagination, listLoading, listLoadingMore]);

  const isOwner = mine.length > 0;
  const pendingRequests = mine.reduce(
    (sum, item) => sum + (item.pendingRequests || 0),
    0,
  );

  const renderItem = useCallback(
    ({ item }) => (
      <MachineryGridCard
        machinery={item}
        width={CARD_WIDTH}
        onPress={() =>
          navigation.navigate(MACHINERY_ROUTES.DETAILS, {
            machineryId: item._id,
          })
        }
      />
    ),
    [navigation],
  );

  const header = (
    <View>
      <MarketHero
        banner={MACHINERY_BANNER}
        onBack={() => navigation.goBack()}
        eyebrow={t('machineryHome.machineryOnRent')}
        title={t('machineryHome.rentMachinery')}
        subtitle={t('machineryHome.tractorsRotavatorsHarvestersAndMore')}
        right={
          <>
            <GlassButton
              onPress={() => navigation.navigate(MACHINERY_ROUTES.MY_BOOKINGS)}
            >
              <CalendarCheck size={19} color={C.white} />
            </GlassButton>
            <GlassButton
              badge={pendingRequests}
              onPress={() => navigation.navigate(MACHINERY_ROUTES.MY_MACHINERY)}
            >
              <Warehouse size={19} color={C.white} />
            </GlassButton>
          </>
        }
      >
        <View style={styles.trustRow}>
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <View key={label} style={styles.trustPill}>
              <Icon size={12} color="#BFF0D2" />
              <Text style={styles.trustText}>{label}</Text>
            </View>
          ))}
        </View>
      </MarketHero>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={19} color={C.green} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('machineryHome.searchTractorRotavatorBrand')}
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
        {/* QUICK ACTIONS */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => {
              setCategory('');
              scrollToResults();
            }}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: C.lightGreen }]}
            >
              <BookUser size={19} color={C.green} />
            </View>
            <Text style={styles.shortcutTitle}>{t('machineryHome.rentMachinery')}</Text>
            <Text style={styles.shortcutText}>{t('machineryHome.browseAllMachines')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => navigation.navigate(MACHINERY_ROUTES.MY_BOOKINGS)}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: C.lightBlue }]}
            >
              <CalendarCheck size={19} color={C.blue} />
            </View>
            <Text style={styles.shortcutTitle}>{t('machineryHome.myRentals')}</Text>
            <Text style={styles.shortcutText}>{t('machineryHome.machinesYouBooked')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => {
              if (nearDistrict) setNearMe(true);
              scrollToResults();
            }}
          >
            <View style={[styles.shortcutIcon, styles.nearIcon]}>
              <MapPin size={19} color="#DC2626" />
            </View>
            <Text style={styles.shortcutTitle}>{t('machineryHome.machinesNearYou')}</Text>
            <Text style={styles.shortcutText} numberOfLines={1}>
              {nearDistrict
                ? t('machineryHome.inDistrict', { district: nearDistrict })
                : t('machineryHome.inYourDistrict')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.ownerCtaWrap}
            onPress={() => navigation.navigate(MACHINERY_ROUTES.MY_MACHINERY)}
          >
            <LinearGradient
              colors={['#F7B733', '#E8890C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ownerCta}
            >
              <View style={styles.ownerIcon}>
                <Tractor size={19} color="#A25200" />
              </View>
              <Text style={styles.ownerTitle}>
                {isOwner ? t('machineryHome.myMachines') : t('machineryHome.ownAMachine')}
              </Text>
              <View style={styles.ownerLink}>
                <Text style={styles.ownerLinkText}>
                  {isOwner
                    ? pendingRequests
                      ? t('machineryHome.newRequests', {pendingRequests})
                      : t('machineryHome.listed', {length: mine.length})
                    : t('machineryHome.earnByRenting')}
                </Text>
                <ArrowRight size={13} color="#3A2400" strokeWidth={2.8} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <VoiceActionButton
          label={t('voiceFlow.button.machinery')}
          onPress={() => setVoiceOpen(true)}
        />

        <View style={styles.typeHeader}>
          <Text style={[styles.sectionTitle, styles.typeHeaderTitle]}>
            {t('machineryHome.whatDoYouNeed')}
          </Text>
          {!!category && (
            <TouchableOpacity
              activeOpacity={0.85}
              hitSlop={8}
              onPress={() => setCategory('')}
              style={styles.typeAllChip}
            >
              <LayoutGrid size={13} color={C.green} strokeWidth={2.6} />
              <Text style={styles.typeAllText}>{t('machineryHome.allMachines')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORIES: all visible at once, 4 per row */}
        <View style={styles.typeGrid}>
          {categories.map(item => {
            const selected = category === item;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.88}
                onPress={() => {
                  setCategory(selected ? '' : item);
                  if (!selected) scrollToResults();
                }}
                style={[
                  styles.typeTile,
                  { width: tileWidth },
                  selected && styles.typeTileSelected,
                ]}
              >
                <View>
                  <Image source={getMachineryCategoryImage(item)} style={[styles.typeImage, { width: tileImageSize, height: tileImageSize }]}
                    resizeMode="cover"
                  />
                  {selected && (
                    <View style={styles.typeCheck}>
                      <Check size={10} color={C.white} strokeWidth={3.5} />
                    </View>
                  )}
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
        </View>
      </View>

      <View
        style={styles.section}
        onLayout={event => {
          resultsY.current = event.nativeEvent.layout.y;
        }}
      >
        <View style={styles.resultsHeader}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitleFlat}>
              {tOpt(category) || t('machineryHome.availableNearYou')}
            </Text>
            <Text style={styles.resultCount}>
              {listLoading
                ? t('machineryHome.searching')
                : t('machineryHome.machinesFound', {total: pagination.total})}
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
              {t('machineryHome.onlyNear', {nearDistrict})}
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
        ref={listRef}
        data={listLoading && !refreshing ? [] : list}
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
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          listLoading ? (
            <LoadingState />
          ) : listError ? (
            <EmptyState
              icon={<Tractor size={30} color={C.green} />}
              title={t('machineryHome.couldntLoadMachinery')}
              message={listError}
              actionLabel={t('machineryHome.tryAgain')}
              onAction={loadFirstPage}
            />
          ) : (
            <EmptyState
              icon={<Tractor size={30} color={C.green} />}
              title={t('machineryHome.noMachinesFound')}
              message={t('machineryHome.tryAnotherCategoryOrTurn')}
            />
          )
        }
        ListFooterComponent={
          listLoadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />

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

  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  shortcut: {
    width: '47.8%',
    flexGrow: 1,
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
  ownerCtaWrap: { width: '47.8%', flexGrow: 1, borderRadius: 22, ...MARKET_SHADOW },
  nearIcon: { backgroundColor: '#FDECEC' },
  ownerCta: { flex: 1, borderRadius: 22, padding: 15, minHeight: 132 },
  ownerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerTitle: {
    marginTop: 'auto',
    color: '#2E1C00',
    fontSize: 15,
    fontWeight: '900',
  },
  ownerLink: {
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
  ownerLinkText: { color: '#3A2400', fontSize: 11, fontWeight: '900' },

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

  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeHeaderTitle: { flexShrink: 1 },
  typeAllChip: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
  },
  typeAllText: { fontSize: 12, fontWeight: '900', color: C.green },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 6 },
  typeTile: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 5,
    paddingBottom: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  typeTileSelected: { borderColor: C.green, backgroundColor: C.lightGreen },
  typeImage: {
    borderRadius: 11,
    backgroundColor: '#E3EEE7',
  },
  typeCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
    marginTop: 6,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
    minHeight: 26,
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
});
