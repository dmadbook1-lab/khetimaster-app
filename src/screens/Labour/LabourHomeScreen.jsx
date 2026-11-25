import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  Inbox,
  Check,
  LayoutGrid,
  MapPin,
  Phone,
  Search,
  Star,
  UserRound,
  Users,
  Wallet,
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
import LabourerCard from '../../components/labour/LabourerCard';
import VoiceActionButton from '../../components/voice/VoiceActionButton';
import VoiceFlowOverlay from '../../components/voice/VoiceFlowOverlay';
import useLabourVoiceFlow from '../../components/voice/flows/useLabourVoiceFlow';
import useLabourMeta from '../../components/labour/useLabourMeta';
import {
  LABOUR_BANNER,
  getLabourTypeImage,
} from '../../components/labour/labourTypes';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import {
  fetchLabourers,
  fetchMyLabourerProfile,
} from '../../redux/slices/labourerSlice';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import { tOpt } from '../../utils/tOpt';

const SORTS = [
  { key: 'rating', get label() {
    return i18n.t('labourHome.topRated');
  } },
  { key: 'wage_asc', get label() {
    return i18n.t('labourHome.lowestWage');
  } },
  { key: 'experience', get label() {
    return i18n.t('labourHome.mostExperienced');
  } },
  { key: 'newest', get label() {
    return i18n.t('labourHome.newest');
  } },
];

const TRUST_POINTS = [
  { icon: Wallet, get label() {
    return i18n.t('labourHome.payAfterWork');
  } },
  { icon: Phone, get label() {
    return i18n.t('labourHome.numberSharedOnConfirm');
  } },
  { icon: Star, get label() {
    return i18n.t('labourHome.ratedByFarmers');
  } },
];

const PAGE_SIZE = 20;

export default function LabourHomeScreen({ navigation }) {
  const {t} = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  // 4 tiles per row inside the 16px side padding, 8px gaps.
  const tileWidth = Math.floor((screenWidth - 32 - 24) / 4);
  // Exact square photo: tile width minus 5px padding and 1.5px border each side.
  const tileImageSize = tileWidth - 13;
  const dispatch = useDispatch();
  const { labourTypes } = useLabourMeta();

  // "near me" uses where the phone is now, not the profile address
  const { location: liveLocation } = useLocation();
  const nearDistrict = liveLocation?.district || '';
  const {
    labourers,
    pagination,
    listLoading,
    listLoadingMore,
    listError,
    myProfile,
    myProfileStatus,
  } = useSelector(state => state.labourer);

  const [labourType, setLabourType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const [nearMe, setNearMe] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
  const voiceFlow = useLabourVoiceFlow(navigation);

  const sort = SORTS[sortIndex];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // worker profile decides the "find work" card
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyLabourerProfile());
    }, [dispatch]),
  );

  const params = useMemo(
    () => ({
      search,
      labourType,
      sort: sort.key,
      district: nearMe ? nearDistrict : '',
      limit: PAGE_SIZE,
    }),
    [search, labourType, sort.key, nearMe, nearDistrict],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchLabourers({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useFocusEffect(
    useCallback(() => {
      loadFirstPage();
    }, [loadFirstPage]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFirstPage(), dispatch(fetchMyLabourerProfile())]);
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
      fetchLabourers({
        params: { ...params, page: pagination.page + 1 },
        append: true,
      }),
    );
  }, [dispatch, params, pagination, listLoading, listLoadingMore]);

  const hasWorkerProfile = myProfileStatus === 'loaded' && !!myProfile;
  const pendingRequests = myProfile?.pendingRequests || 0;

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <LabourerCard
          labourer={item}
          onPress={() =>
            navigation.navigate(LABOUR_ROUTES.LABOURER_DETAILS, {
              labourerId: item._id,
            })
          }
          onBook={() =>
            navigation.navigate(LABOUR_ROUTES.BOOK, { labourer: item })
          }
        />
      </View>
    ),
    [navigation],
  );

  const header = (
    <View>
      <MarketHero
        banner={LABOUR_BANNER}
        onBack={() => navigation.goBack()}
        eyebrow={t('labourHome.farmWorkersNearYou')}
        title={t('labourHome.hireLabour')}
        subtitle={t('labourHome.bookSkilledWorkersForHarvesting')}
        right={
          <>
            <GlassButton
              onPress={() => navigation.navigate(LABOUR_ROUTES.MY_BOOKINGS)}
            >
              <CalendarCheck size={19} color={C.white} />
            </GlassButton>
            <GlassButton
              badge={pendingRequests}
              onPress={() => navigation.navigate(LABOUR_ROUTES.MY_PROFILE)}
            >
              <UserRound size={19} color={C.white} />
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
            placeholder={t('labourHome.searchByNameSkillOr')}
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
        <View style={styles.ctaGrid}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => navigation.navigate(LABOUR_ROUTES.ALL)}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: C.lightGreen }]}
            >
              <BookUser size={19} color={C.green} />
            </View>
            <Text style={styles.shortcutTitle}>{t('labourHome.bookLabour')}</Text>
            <Text style={styles.shortcutText}>{t('labourHome.browseAllWorkers')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => navigation.navigate(LABOUR_ROUTES.MY_BOOKINGS)}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: C.lightBlue }]}
            >
              <CalendarCheck size={19} color={C.blue} />
            </View>
            <Text style={styles.shortcutTitle}>{t('labourHome.myBookings')}</Text>
            <Text style={styles.shortcutText}>{t('labourHome.workersYouHired')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.shortcut}
            onPress={() => navigation.navigate(LABOUR_ROUTES.NEARBY)}
          >
            <View
              style={[styles.shortcutIcon, { backgroundColor: '#FDECEC' }]}
            >
              <MapPin size={19} color="#DC2626" />
            </View>
            <Text style={styles.shortcutTitle}>{t('labourHome.findNearbyLabour')}</Text>
            <Text style={styles.shortcutText}>
              {nearDistrict
                ? t('labourHome.inYourDistrict', { nearDistrict })
                : t('labourHome.inYourDistrictGeneric')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.workCtaWrap}
            onPress={() =>
              navigation.navigate(
                hasWorkerProfile
                  ? LABOUR_ROUTES.REQUESTS
                  : LABOUR_ROUTES.MY_PROFILE,
              )
            }
          >
            <LinearGradient
              colors={['#F7B733', '#E8890C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.workCta}
            >
              <View style={styles.workIcon}>
                {hasWorkerProfile ? (
                  <Inbox size={19} color="#A25200" />
                ) : (
                  <Users size={19} color="#A25200" />
                )}
              </View>
              <Text style={styles.workTitle}>
                {hasWorkerProfile ? t('labourHome.workRequests') : t('labourHome.lookingForWork')}
              </Text>
              <View style={styles.workLink}>
                <Text style={styles.workLinkText}>
                  {hasWorkerProfile
                    ? pendingRequests
                      ? t('labourHome.new', {pendingRequests})
                      : t('labourHome.viewAll')
                    : t('labourHome.registerFree')}
                </Text>
                <ArrowRight size={13} color="#3A2400" strokeWidth={2.8} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <VoiceActionButton
          label={t('labourHome.useVoiceToBook')}
          onPress={() => setVoiceOpen(true)}
        />

        {/* WORK TYPES */}
        <View style={styles.typeHeader}>
          <Text style={[styles.sectionTitle, styles.typeHeaderTitle]}>
            {t('labourHome.whatWorkDoYouNeed')}
          </Text>
          {!!labourType && (
            <TouchableOpacity
              activeOpacity={0.85}
              hitSlop={8}
              onPress={() => setLabourType('')}
              style={styles.typeAllChip}
            >
              <LayoutGrid size={13} color={C.green} strokeWidth={2.6} />
              <Text style={styles.typeAllText}>{t('labourHome.allWork')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORIES: all visible at once, 4 per row */}
        <View style={styles.typeGrid}>
          {labourTypes.map(type => {
            const selected = labourType === type;

            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.88}
                onPress={() => {
                  setLabourType(selected ? '' : type);
                  if (!selected) scrollToResults();
                }}
                style={[
                  styles.typeTile,
                  { width: tileWidth },
                  selected && styles.typeTileSelected,
                ]}
              >
                <View>
                  <Image source={getLabourTypeImage(type)} style={[styles.typeImage, { width: tileImageSize, height: tileImageSize }]}
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
                  {tOpt(type)}
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
              {tOpt(labourType) || t('labourHome.availableWorkers')}
            </Text>
            <Text style={styles.resultCount}>
              {listLoading ? t('labourHome.searching') : t('labourHome.workersFound', {total: pagination.total})}
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
              {t('labourHome.onlyNear', {nearDistrict})}
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
        data={listLoading && !refreshing ? [] : labourers}
        keyExtractor={item => item._id}
        renderItem={renderItem}
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
          listLoading ? (
            <LoadingState />
          ) : listError ? (
            <EmptyState
              icon={<Users size={30} color={C.green} />}
              title={t('labourHome.couldntLoadWorkers')}
              message={listError}
              actionLabel={t('labourHome.tryAgain')}
              onAction={loadFirstPage}
            />
          ) : (
            <EmptyState
              icon={<Users size={30} color={C.green} />}
              title={t('labourHome.noWorkersFound')}
              message={t('labourHome.tryAnotherTypeOfWork')}
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
  section: { paddingHorizontal: 16 },
  item: { paddingHorizontal: 16 },
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

  ctaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  shortcut: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: 22,
    backgroundColor: C.white,
    padding: 15,
    minHeight: 124,
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
  workCtaWrap: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: 22,
    ...MARKET_SHADOW,
  },
  workCta: { flex: 1, borderRadius: 22, padding: 15, minHeight: 124 },
  workIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workTitle: {
    marginTop: 'auto',
    color: '#2E1C00',
    fontSize: 15,
    fontWeight: '900',
  },
  workLink: {
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
  workLinkText: { color: '#3A2400', fontSize: 11, fontWeight: '900' },

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
