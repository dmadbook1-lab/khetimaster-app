import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, Users, X } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useLocation } from '../../context/LocationContext';
import MarketHero, { TopInset } from '../../components/market/MarketHero';
import { EmptyState, LoadingState } from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW_STRONG,
} from '../../components/market/theme';
import LabourerCard from '../../components/labour/LabourerCard';
import useLabourMeta from '../../components/labour/useLabourMeta';
import { LABOUR_BANNER } from '../../components/labour/labourTypes';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import { fetchLabourers } from '../../redux/slices/labourerSlice';
import { tOpt } from '../../utils/tOpt';

const PAGE_SIZE = 20;

/*
 * Two screens share this list:
 *   mode 'all'    - every worker in the app (Book Labour)
 *   mode 'nearby' - only workers of the farmer's own district
 */
export default function LabourListScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nearby = route.params?.mode === 'nearby';

  const { labourTypes } = useLabourMeta();
  const { location } = useLocation();
  const user = useSelector(state => state.auth.user);
  const { labourers, pagination, listLoading, listLoadingMore, listError } =
    useSelector(state => state.labourer);

  // where the phone is now; falls back to the profile district
  const district = (location?.district || user?.district || '').trim();

  const [labourType, setLabourType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const needsDistrict = nearby && !district;

  const params = useMemo(
    () => ({
      search,
      labourType,
      sort: nearby ? 'rating' : 'newest',
      district: nearby ? district : '',
      limit: PAGE_SIZE,
    }),
    [search, labourType, nearby, district],
  );

  const loadFirstPage = useCallback(
    () => dispatch(fetchLabourers({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useEffect(() => {
    if (!needsDistrict) loadFirstPage();
  }, [loadFirstPage, needsDistrict]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!needsDistrict) await loadFirstPage();
    setRefreshing(false);
  }, [loadFirstPage, needsDistrict]);

  const handleLoadMore = useCallback(() => {
    if (
      needsDistrict ||
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
  }, [dispatch, params, pagination, listLoading, listLoadingMore, needsDistrict]);

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
        compact
        banner={LABOUR_BANNER}
        onBack={() => navigation.goBack()}
        eyebrow={
          nearby ? t('labourList.nearbyEyebrow') : t('labourList.allEyebrow')
        }
        title={nearby ? t('labourList.nearbyTitle') : t('labourList.allTitle')}
        subtitle={
          nearby
            ? district
              ? t('labourList.nearbySubtitle', { district })
              : t('labourList.nearbyNoDistrict')
            : t('labourList.allSubtitle')
        }
      />

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeList}
      >
        {[
          { value: '', label: t('labourHome.allWork') },
          ...labourTypes.map(type => ({ value: type, label: tOpt(type) })),
        ].map(item => {
          const selected = labourType === item.value;
          return (
            <TouchableOpacity
              key={item.value || 'all'}
              activeOpacity={0.85}
              onPress={() => setLabourType(item.value)}
              style={[styles.typeChip, selected && styles.typeChipSelected]}
            >
              <Text
                style={[styles.typeText, selected && styles.typeTextSelected]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.resultsHeader}>
        {nearby && !!district && <MapPin size={15} color={C.blue} />}
        <Text style={styles.resultCount}>
          {needsDistrict
            ? ''
            : listLoading
            ? t('labourHome.searching')
            : t('labourHome.workersFound', { total: pagination.total })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={needsDistrict || (listLoading && !refreshing) ? [] : labourers}
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
          needsDistrict ? (
            <EmptyState
              icon={<MapPin size={30} color={C.green} />}
              title={t('labourList.locationNeededTitle')}
              message={t('labourList.locationNeededMessage')}
            />
          ) : listLoading ? (
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
              title={
                nearby
                  ? t('labourList.noneNearbyTitle', { district })
                  : t('labourHome.noWorkersFound')
              }
              message={
                nearby
                  ? t('labourList.noneNearbyMessage')
                  : t('labourHome.tryAnotherTypeOfWork')
              }
            />
          )
        }
        ListFooterComponent={
          listLoadingMore ? (
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
  item: { paddingHorizontal: 16 },

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

  typeList: { paddingHorizontal: 16, gap: 8, paddingTop: 14 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeChipSelected: { borderColor: C.green, backgroundColor: C.lightGreen },
  typeText: { fontSize: 12.5, fontWeight: '800', color: C.dark },
  typeTextSelected: { color: C.green },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  resultCount: { fontSize: 12.5, fontWeight: '800', color: C.muted },
  footerLoader: { marginVertical: 16 },
});
