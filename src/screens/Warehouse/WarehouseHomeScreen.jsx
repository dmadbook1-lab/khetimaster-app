import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ChevronDown,
  Info,
  LocateFixed,
  MapPin,
  Search,
  Warehouse,
  X,
} from 'lucide-react-native';

import { useLocation } from '../../context/LocationContext';
import { TopInset } from '../../components/market/MarketHero';
import WarehouseCard from '../../components/warehouse/WarehouseCard';
import WarehouseLocationSheet from '../../components/warehouse/WarehouseLocationSheet';
import {
  WAREHOUSE_ART,
  WH,
  WH_GRADIENT,
  WH_SHADOW,
} from '../../components/warehouse/theme';
import { WAREHOUSE_ROUTES } from '../../constants/warehouseRoutes';
import {
  NEARBY_RADIUS_KM,
  filterWarehouses,
  formatDistance,
  formatPreparedDate,
  inRegion,
  matchDetectedRegion,
  nearbyWarehouses,
  sortWarehouses,
  withDistances,
} from '../../utils/warehouseData';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const CATEGORIES = [
  { key: '', get label() {
    return i18n.t('warehouseHome.all');
  } },
  { key: 'central', get label() {
    return i18n.t('warehouseHome.centralGovt');
  } },
  { key: 'state', get label() {
    return i18n.t('warehouseHome.stateGovt');
  } },
  { key: 'private', get label() {
    return i18n.t('warehouseHome.private');
  } },
];

const SORTS = [
  { key: 'nearest', get label() {
    return i18n.t('warehouseHome.nearest');
  } },
  { key: 'capacity', get label() {
    return i18n.t('warehouseHome.largest');
  } },
  { key: 'name', label: 'A–Z' },
];

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function WarehouseHomeScreen({ navigation }) {
  const {t} = useTranslation();
  const {
    location: detected,
    loading: locating,
    refreshLocation,
  } = useLocation();

  const [area, setArea] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('nearest');
  const [refreshing, setRefreshing] = useState(false);

  const latitude = detected?.latitude;
  const longitude = detected?.longitude;

  const coords = useMemo(
    () =>
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { latitude, longitude }
        : null,
    [latitude, longitude],
  );

  const directory = useMemo(() => withDistances(coords), [coords]);
  const searching = query.trim().length > 0;
  const onGps = !area && !!coords;

  // A search covers the whole directory, not only the chosen area
  const scope = useMemo(() => {
    if (searching) return directory;
    if (area) return inRegion(directory, area);
    return coords ? nearbyWarehouses(directory) : [];
  }, [searching, directory, area, coords]);

  const activeSort = !coords && sort === 'nearest' ? 'name' : sort;

  const results = useMemo(
    () =>
      sortWarehouses(
        filterWarehouses(scope, { category, phoneOnly, query }),
        activeSort,
      ),
    [scope, category, phoneOnly, query, activeSort],
  );

  const detectedRegion = useMemo(
    () => matchDetectedRegion(detected),
    [detected],
  );

  const detectedLabel = [detected?.district || detected?.city, detected?.state]
    .filter(Boolean)
    .join(', ');

  const needsArea = !area && !coords && !searching;
  const nearestKm = results.reduce(
    (nearest, item) =>
      item.distanceKm != null && item.distanceKm < nearest
        ? item.distanceKm
        : nearest,
    Infinity,
  );
  const closestOverall = scope[0]?.distanceKm;
  const sparseArea =
    onGps && !searching && closestOverall > NEARBY_RADIUS_KM;

  const openDetails = useCallback(
    item =>
      navigation.navigate(WAREHOUSE_ROUTES.DETAILS, { warehouseId: item.id }),
    [navigation],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLocation();
    setRefreshing(false);
  };

  const applyArea = next => {
    setArea(next);
    setQuery('');
    setSheetOpen(false);
  };

  const useCurrentLocation = () => {
    setArea(null);
    setQuery('');
    setSheetOpen(false);
  };

  const clearFilters = () => {
    setCategory('');
    setPhoneOnly(false);
    setQuery('');
  };

  let eyebrow = t('warehouseHome.findingYourLocation');
  let title = t('warehouseHome.storageNearYou');
  let locationLabel = t('warehouseHome.detectingLocation');
  let locationCaption = t('warehouseHome.yourLocation');

  if (area) {
    eyebrow = t('warehouseHome.selectedArea');
    title = t('warehouseHome.warehousesIn', {v1: area.district || area.state});
    locationLabel = [area.district, area.state].filter(Boolean).join(', ');
    locationCaption = t('warehouseHome.selectedArea');
  } else if (coords) {
    eyebrow = t('warehouseHome.nearYou');
    locationLabel = detectedLabel || t('warehouseHome.yourCurrentLocation');
    locationCaption = t('warehouseHome.detectedLocation');
  } else if (!locating) {
    eyebrow = t('warehouseHome.chooseYourArea');
    locationLabel = t('warehouseHome.locationUnavailable');
    locationCaption = t('warehouseHome.turnOnGpsOrChoose');
  }

  const hero = (
    <LinearGradient
      colors={WH_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Image
        source={WAREHOUSE_ART}
        style={styles.art}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.glass}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <ArrowLeft size={20} color={WH.white} />
      </TouchableOpacity>

      <View style={styles.heroText}>
        <View style={styles.eyebrow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText} numberOfLines={1}>
            {eyebrow}
          </Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {t('warehouseHome.governmentAndPrivateGodownsFor')}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.locationCard}
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('warehouseHome.changeStateAndDistrict')}
      >
        <View style={styles.pin}>
          {locating && !area ? (
            <ActivityIndicator size="small" color={WH.steel} />
          ) : (
            <MapPin size={18} color={WH.steel} />
          )}
        </View>
        <View style={styles.flex}>
          <Text style={styles.locationCaption} numberOfLines={1}>
            {locationCaption}
          </Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
        <View style={styles.change}>
          <Text style={styles.changeText}>{t('warehouseHome.change')}</Text>
          <ChevronDown size={14} color={WH.white} strokeWidth={3} />
        </View>
      </TouchableOpacity>

      {!!area && !!coords && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backToGps}
          onPress={useCurrentLocation}
        >
          <LocateFixed size={13} color={WH.white} />
          <Text style={styles.backToGpsText}>{t('warehouseHome.useMyCurrentLocation')}</Text>
        </TouchableOpacity>
      )}

      {!needsArea && !searching && (
        <View style={styles.stats}>
          <Stat value={results.length} label={t('warehouseHome.warehouses')} />
          <Stat
            value={
              Number.isFinite(nearestKm) ? formatDistance(nearestKm) : '—'
            }
            label={t('warehouseHome.closest')}
          />
          <Stat
            value={results.filter(item => item.phones?.length).length}
            label={t('warehouseHome.withPhone')}
          />
        </View>
      )}
    </LinearGradient>
  );

  const filters = (
    <View style={styles.filters}>
      <View style={styles.searchBox}>
        <Search size={18} color={WH.steel} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('warehouseHome.searchTownGodownOrCommodity')}
          placeholderTextColor={WH.placeholder}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {!!query && (
          <TouchableOpacity hitSlop={10} onPress={() => setQuery('')}>
            <X size={17} color={WH.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chips}
      >
        {CATEGORIES.map(item => {
          const active = item.key === category;

          return (
            <TouchableOpacity
              key={item.key || 'all'}
              activeOpacity={0.85}
              onPress={() => setCategory(item.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setPhoneOnly(value => !value)}
          style={[styles.chip, phoneOnly && styles.chipActive]}
        >
          <Text style={[styles.chipText, phoneOnly && styles.chipTextActive]}>
            {t('warehouseHome.hasPhone')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {sparseArea && (
        <View style={styles.notice}>
          <Info size={15} color={WH.amberDark} />
          <Text style={styles.noticeText}>
            {t('warehouseHome.noListedWarehouseWithinKm', {NEARBY_RADIUS_KM})}
          </Text>
        </View>
      )}

      {!needsArea && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle} numberOfLines={1}>
            {searching
              ? t('warehouseHome.acrossIndia', {length: results.length})
              : `${results.length} ${
                  results.length === 1 ? t('plural.warehouse') : t('plural.warehouses')
                }`}
          </Text>
          <View style={styles.sorts}>
            {SORTS.filter(item => coords || item.key !== 'nearest').map(
              item => {
                const active = item.key === activeSort;

                return (
                  <TouchableOpacity
                    key={item.key}
                    hitSlop={6}
                    onPress={() => setSort(item.key)}
                    style={[styles.sort, active && styles.sortActive]}
                  >
                    <Text
                      style={[styles.sortText, active && styles.sortTextActive]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (needsArea && locating) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={WH.steel} />
          <Text style={styles.emptyText}>{t('warehouseHome.findingWarehousesNearYou')}</Text>
        </View>
      );
    }

    if (needsArea) {
      return (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <LocateFixed size={30} color={WH.steel} />
          </View>
          <Text style={styles.emptyTitle}>{t('warehouseHome.weCouldntFindYourLocation')}</Text>
          <Text style={styles.emptyText}>
            {t('warehouseHome.turnOnGpsAndTry')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emptyButton}
            onPress={() => setSheetOpen(true)}
          >
            <Text style={styles.emptyButtonText}>{t('warehouseHome.chooseState')}</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8} onPress={refreshLocation}>
            <Text style={styles.emptyLink}>{t('warehouseHome.tryLocationAgain')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Warehouse size={30} color={WH.steel} />
        </View>
        <Text style={styles.emptyTitle}>{t('warehouseHome.noWarehousesMatch')}</Text>
        <Text style={styles.emptyText}>
          {t('warehouseHome.clearYourFiltersOrTry')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.emptyButton}
          onPress={clearFilters}
        >
          <Text style={styles.emptyButtonText}>{t('warehouseHome.clearFilters')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <WarehouseCard item={item} onPress={openDetails} />
          </View>
        )}
        ListHeaderComponent={
          <>
            {hero}
            {filters}
          </>
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={
          results.length ? (
            <Text style={styles.footer}>
              {t('warehouseHome.compiledFromPublicRecordsOn', {v1: formatPreparedDate()})}
            </Text>
          ) : null
        }
        initialNumToRender={8}
        windowSize={9}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[WH.steel]}
            tintColor={WH.steel}
          />
        }
      />

      <WarehouseLocationSheet
        visible={sheetOpen}
        selected={area}
        suggestedState={detectedRegion.state}
        onApply={applyArea}
        onUseCurrent={coords ? useCurrentLocation : undefined}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WH.bg },
  content: { paddingBottom: 36 },
  flex: { flex: 1 },
  item: { paddingHorizontal: 16 },

  hero: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  art: {
    position: 'absolute',
    right: 0,
    top: 6,
    width: 136,
    height: 204,
  },
  glass: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { marginTop: 14, paddingRight: 116 },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
  },
  eyebrowText: {
    color: WH.white,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 11,
    color: WH.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 31,
  },
  subtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  locationCard: {
    marginTop: 16,
    padding: 10,
    borderRadius: 20,
    backgroundColor: WH.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...WH_SHADOW,
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: WH.steelSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCaption: { fontSize: 11, fontWeight: '700', color: WH.muted },
  locationValue: {
    marginTop: 1,
    fontSize: 14.5,
    fontWeight: '900',
    color: WH.ink,
  },
  change: {
    height: 34,
    paddingLeft: 12,
    paddingRight: 9,
    borderRadius: 17,
    backgroundColor: WH.amber,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeText: { fontSize: 12, fontWeight: '900', color: WH.white },
  backToGps: {
    alignSelf: 'flex-start',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToGpsText: { fontSize: 12, fontWeight: '800', color: WH.white },
  stats: { marginTop: 12, flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    color: WH.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  statLabel: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '700',
  },

  filters: { paddingTop: 16, marginBottom: 12 },
  searchBox: {
    marginHorizontal: 16,
    height: 50,
    borderRadius: 25,
    backgroundColor: WH.white,
    borderWidth: 1,
    borderColor: WH.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...WH_SHADOW,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    fontWeight: '600',
    color: WH.ink,
  },
  chips: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: WH.white,
    borderWidth: 1,
    borderColor: WH.border,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: WH.steel, borderColor: WH.steel },
  chipText: { fontSize: 12.5, fontWeight: '800', color: WH.text },
  chipTextActive: { color: WH.white },
  notice: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 11,
    borderRadius: 14,
    backgroundColor: WH.amberSoft,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: WH.amberDark,
  },
  resultsHeader: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: WH.ink,
    letterSpacing: -0.3,
  },
  sorts: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 15,
    backgroundColor: '#E4EBF1',
  },
  sort: {
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sortActive: { backgroundColor: WH.white },
  sortText: { fontSize: 11, fontWeight: '800', color: WH.muted },
  sortTextActive: { color: WH.steelDark, fontWeight: '900' },

  empty: { alignItems: 'center', paddingHorizontal: 34, paddingTop: 34 },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: WH.steelSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WH.ink,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
    color: WH.muted,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    height: 46,
    paddingHorizontal: 26,
    borderRadius: 23,
    backgroundColor: WH.navy,
    justifyContent: 'center',
  },
  emptyButtonText: { fontSize: 14, fontWeight: '900', color: WH.white },
  emptyLink: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '800',
    color: WH.steel,
  },
  footer: {
    marginTop: 6,
    paddingHorizontal: 26,
    textAlign: 'center',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
    color: WH.muted,
  },
});
