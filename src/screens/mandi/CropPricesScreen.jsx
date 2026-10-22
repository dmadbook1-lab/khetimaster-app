import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  CalendarDays,
  ChartColumn,
  GitCompareArrows,
  History,
  MapPin,
  Store,
  Trophy,
  TriangleAlert,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  TopInset,
} from '../../components/market/MarketHero';
import {
  ChipRow,
  EmptyState,
  LoadingState,
  MarketButton,
  SegmentTabs,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import LocationSheet from '../../components/mandi/LocationSheet';
import useMandiSetup from '../../components/mandi/useMandiSetup';
import MarketPriceRow from '../../components/mandi/MarketPriceRow';
import CompareMarketsSheet from '../../components/mandi/CompareMarketsSheet';
import { cropImage } from '../../components/mandi/cropImages';
import {
  WeekColumns,
  WhereToSellChart,
} from '../../components/mandi/MandiCharts';
import { MANDI_ROUTES } from '../../constants/mandiRoutes';
import {
  addRecentCrop,
  fetchMandiRates,
  fetchMandiSummary,
} from '../../redux/slices/mandiSlice';
import { todayInIndiaKey } from '../../utils/indiaSchedule';
import { timeAgo } from '../../utils/marketFormat';
import {
  bestGain,
  formatPerKg,
  formatQuintal,
  recordKey,
  scopeLabel,
  scopeParams,
  shortDay,
  summaryKey,
  topMarkets,
  trendDates,
} from '../../utils/mandiFormat';

const PAGE_SIZE = 50;
const MAX_COMPARE = 3;

const SORT_OPTIONS = [
  { key: 'price_desc', label: 'Highest price' },
  { key: 'price_asc', label: 'Lowest price' },
  { key: 'market', label: 'Market name' },
];

function Section({ icon, title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardIcon}>{icon}</View>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

export default function CropPricesScreen({ navigation, route }) {
  const { cropId, cropName } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const todayKey = todayInIndiaKey();

  const { crops, location } = useMandiSetup();
  const rates = useSelector(state => state.mandi.rates);
  const summaries = useSelector(state => state.mandi.summaries);

  const crop = crops.find(item => item.id === cropId);
  const name = crop?.name || cropName || cropId;

  const [scope, setScope] = useState(null);
  const [sort, setSort] = useState('price_desc');
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // start at the narrowest place we know
  const activeScope =
    scope ||
    (location?.district ? 'district' : location?.state ? 'state' : 'india');
  const placeName = scopeLabel(activeScope, location);

  useEffect(() => {
    if (crop) dispatch(addRecentCrop(crop));
  }, [dispatch, crop]);

  const place = scopeParams(activeScope, location);

  const params = useMemo(
    () => ({ crop: cropId, ...place, sort, limit: PAGE_SIZE }),
    // place values are the real dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cropId, place.state, place.district, sort],
  );

  const load = useCallback(
    () => dispatch(fetchMandiRates({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useEffect(() => {
    load();
    setSelected([]);
  }, [load]);

  /* THIS WEEK: one summary per day, loaded one at a time */

  const dates = useMemo(() => trendDates(todayKey, 6), [todayKey]);

  useEffect(() => {
    if (rates.loading) return undefined;
    let cancelled = false;

    (async () => {
      for (const arrivalDate of [...dates].reverse()) {
        if (cancelled) return;
        await dispatch(
          fetchMandiSummary({ crop: cropId, ...place, arrivalDate }),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, cropId, place.state, place.district, dates, rates.loading]);

  const weekPoints = [
    ...dates.map(day => {
      const entry =
        summaries[summaryKey({ crop: cropId, ...place, arrivalDate: day })];
      return {
        key: day,
        label: shortDay(day),
        value: entry?.summary?.averageModalPrice ?? null,
        loading: !entry || entry.status === 'loading',
      };
    }),
    ...(rates.source === 'daily'
      ? [
          {
            key: 'today',
            label: 'Today',
            value: rates.summary?.averageModalPrice ?? null,
            loading: rates.loading,
          },
        ]
      : []),
  ];

  const handleLoadMore = () => {
    if (rates.loading || rates.loadingMore || rates.page >= rates.pages) return;
    dispatch(
      fetchMandiRates({
        params: { ...params, page: rates.page + 1 },
        append: true,
      }),
    );
  };

  const toggleSelect = record => {
    const key = recordKey(record);
    setSelected(previous =>
      previous.some(item => recordKey(item) === key)
        ? previous.filter(item => recordKey(item) !== key)
        : previous.length >= MAX_COMPARE
        ? previous
        : [...previous, record],
    );
  };

  const exitSelect = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const summary = rates.summary;
  const average = summary?.averageModalPrice;
  const gain = bestGain(summary);
  const sellMarkets = topMarkets(rates.data, 5);
  const hasData = rates.total > 0;
  const firstLoad = rates.loading && !rates.data.length;
  const bestKey =
    rates.data.length && sort === 'price_desc'
      ? recordKey(rates.data[0])
      : null;

  const scopeOptions = [
    ...(location?.district
      ? [{ key: 'district', label: location.district }]
      : []),
    ...(location?.state ? [{ key: 'state', label: location.state }] : []),
    { key: 'india', label: 'All India' },
  ];

  const header = (
    <View>
      <MarketHero
        image={cropImage(cropId) || undefined}
        gradient="green"
        onBack={() => navigation.goBack()}
        eyebrow={`Mandi price · ${placeName}`}
        title={name}
        right={
          <>
            <GlassButton
              onPress={() =>
                navigation.navigate(MANDI_ROUTES.COMPARE, { cropId })
              }
            >
              <ChartColumn size={19} color={C.white} />
            </GlassButton>
            <GlassButton onPress={() => setLocationOpen(true)}>
              <MapPin size={19} color={C.white} />
            </GlassButton>
          </>
        }
      >
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>
            {rates.source === 'daily'
              ? "Today's average price"
              : 'Latest average price'}
          </Text>
          {firstLoad ? (
            <ActivityIndicator color={C.green} style={styles.priceLoader} />
          ) : (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatQuintal(average)}</Text>
                <Text style={styles.priceUnit}>per quintal</Text>
              </View>
              <View style={styles.priceSubRow}>
                <Text style={styles.kgPill}>{formatPerKg(average)}</Text>
                {!!summary?.markets && (
                  <Text style={styles.marketsText}>
                    from {summary.markets} market
                    {summary.markets === 1 ? '' : 's'}
                  </Text>
                )}
              </View>
              {!!summary?.minPrice && !!summary?.maxPrice && (
                <View style={styles.rangeRow}>
                  <View style={styles.rangeBox}>
                    <Text style={styles.rangeLabel}>Lowest</Text>
                    <Text style={[styles.rangeValue, styles.redText]}>
                      {formatQuintal(summary.minPrice)}
                    </Text>
                  </View>
                  <View style={styles.rangeDivider} />
                  <View style={styles.rangeBox}>
                    <Text style={styles.rangeLabel}>Highest</Text>
                    <Text style={[styles.rangeValue, styles.greenText]}>
                      {formatQuintal(summary.maxPrice)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </MarketHero>

      <View style={styles.body}>
        {scopeOptions.length > 1 && (
          <View style={styles.scope}>
            <SegmentTabs
              options={scopeOptions}
              value={activeScope}
              onChange={setScope}
            />
          </View>
        )}

        {!!summary?.latestArrivalDate && (
          <View style={styles.dateRow}>
            <CalendarDays size={14} color={C.muted} />
            <Text style={styles.dateText}>
              Prices of {summary.latestArrivalDate}
            </Text>
          </View>
        )}

        {rates.source === 'historical_latest' && hasData && (
          <View style={[styles.notice, styles.noticeAmber]}>
            <History size={16} color={C.amber} />
            <Text style={[styles.noticeText, styles.noticeTextAmber]}>
              No mandi here sold {name} today. These are the last prices from
              the past 30 days.
            </Text>
          </View>
        )}
        {rates.stale && (
          <View style={[styles.notice, styles.noticeRed]}>
            <TriangleAlert size={16} color={C.red} />
            <Text style={[styles.noticeText, styles.noticeTextRed]}>
              Couldn't get new prices right now. Showing prices saved{' '}
              {timeAgo(rates.fetchedAt) || 'earlier'}.
            </Text>
          </View>
        )}

        {firstLoad ? (
          <LoadingState />
        ) : rates.error && !hasData ? (
          <EmptyState
            icon={<TriangleAlert size={30} color={C.green} />}
            title="Couldn't load prices"
            message={rates.error}
            actionLabel="Try Again"
            onAction={load}
          />
        ) : !hasData ? (
          <EmptyState
            icon={<Store size={30} color={C.green} />}
            title={`No ${name} prices in ${placeName}`}
            message="No mandi here has sold this crop in the last 30 days."
            actionLabel={activeScope !== 'india' ? 'See All India' : undefined}
            onAction={() => setScope('india')}
          />
        ) : (
          <>
            {/* WHERE TO SELL */}
            {sellMarkets.length > 0 && (
              <Section
                icon={<Trophy size={17} color={C.amber} />}
                title="Best place to sell"
                subtitle="Mandis paying the most"
              >
                {!!gain?.amount && (
                  <View style={styles.tip}>
                    <Text style={styles.tipText}>
                      <Text style={styles.bold}>
                        {summary.highestModal.market}
                      </Text>{' '}
                      pays{' '}
                      <Text style={styles.bold}>
                        {formatQuintal(gain.amount)}
                      </Text>{' '}
                      more per quintal than the average.
                    </Text>
                  </View>
                )}
                <WhereToSellChart
                  markets={sellMarkets}
                  homeDistrict={
                    activeScope !== 'district' ? location?.district : null
                  }
                />
              </Section>
            )}

            {/* THIS WEEK */}
            <Section
              icon={<ChartColumn size={17} color={C.green} />}
              title="Price this week"
              subtitle={`Average price per quintal in ${placeName}`}
            >
              <WeekColumns points={weekPoints} />
              <Text style={styles.weekNote}>
                – means no mandi sold {name} that day.
              </Text>
            </Section>

            {/* LIST HEADER */}
            <View style={styles.listHead}>
              <View style={styles.flex}>
                <Text style={styles.listTitle}>All mandis</Text>
                <Text style={styles.listCount}>
                  {rates.total} price{rates.total === 1 ? '' : 's'} in{' '}
                  {placeName}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.selectButton, selectMode && styles.selectOn]}
                onPress={() =>
                  selectMode ? exitSelect() : setSelectMode(true)
                }
              >
                {selectMode ? (
                  <X size={14} color={C.white} />
                ) : (
                  <GitCompareArrows size={14} color={C.green} />
                )}
                <Text
                  style={[styles.selectText, selectMode && styles.selectTextOn]}
                >
                  {selectMode ? 'Cancel' : 'Compare'}
                </Text>
              </TouchableOpacity>
            </View>
            {selectMode && (
              <Text style={styles.selectHint}>
                Tap 2 or 3 mandis to see which pays more.
              </Text>
            )}
            <ChipRow options={SORT_OPTIONS} value={sort} onChange={setSort} />
            <View style={styles.listGap} />
          </>
        )}
      </View>
    </View>
  );

  const selectedKeys = new Set(selected.map(recordKey));

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={hasData ? rates.data : []}
        keyExtractor={(item, index) => `${recordKey(item)}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <MarketPriceRow
              record={item}
              average={average}
              best={recordKey(item) === bestKey}
              selectMode={selectMode}
              selected={selectedKeys.has(recordKey(item))}
              onPress={() => toggleSelect(item)}
            />
          </View>
        )}
        ListHeaderComponent={header}
        contentContainerStyle={[
          styles.listContent,
          selectMode && styles.listContentSelect,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={rates.loading && rates.data.length > 0}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListFooterComponent={
          rates.loadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />

      {selectMode && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          <Text style={styles.bottomText}>
            {selected.length}/{MAX_COMPARE}
          </Text>
          <MarketButton
            label={
              selected.length < 2
                ? 'Pick at least 2 mandis'
                : `Compare ${selected.length} mandis`
            }
            icon={<GitCompareArrows size={16} color={C.white} />}
            disabled={selected.length < 2}
            onPress={() => setCompareOpen(true)}
            style={styles.flex}
          />
        </View>
      )}

      <LocationSheet
        visible={locationOpen}
        onClose={() => {
          setLocationOpen(false);
          setScope(null);
        }}
      />
      <CompareMarketsSheet
        visible={compareOpen}
        records={selected}
        onClose={() => setCompareOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  listContentSelect: { paddingBottom: 120 },
  body: { paddingHorizontal: 16 },
  item: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  bold: { fontWeight: '900' },
  greenText: { color: C.green },
  redText: { color: C.red },

  priceCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: C.white,
  },
  priceLabel: { fontSize: 12, fontWeight: '800', color: C.muted },
  priceLoader: { alignSelf: 'flex-start', marginVertical: 14 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 34,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -1,
  },
  priceUnit: { fontSize: 13, fontWeight: '700', color: C.muted },
  priceSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  kgPill: {
    fontSize: 13,
    fontWeight: '900',
    color: C.greenDeep,
    backgroundColor: C.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  marketsText: { fontSize: 12, fontWeight: '700', color: C.muted },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
  },
  rangeBox: { flex: 1, alignItems: 'center' },
  rangeDivider: { width: 1, height: 30, backgroundColor: '#E6EBE8' },
  rangeLabel: { fontSize: 11, fontWeight: '800', color: C.muted },
  rangeValue: { fontSize: 17, fontWeight: '900', marginTop: 2 },

  scope: { marginTop: 16 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dateText: { fontSize: 12, fontWeight: '700', color: C.muted },
  notice: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  noticeAmber: { backgroundColor: C.lightAmber },
  noticeRed: { backgroundColor: C.lightRed },
  noticeText: { flex: 1, fontSize: 12.5, fontWeight: '700', lineHeight: 18 },
  noticeTextAmber: { color: '#8A5A00' },
  noticeTextRed: { color: C.red },

  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16.5, fontWeight: '900', color: C.dark },
  cardSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 1,
  },
  tip: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.lightAmber,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B4A00',
    lineHeight: 19,
  },
  weekNote: {
    fontSize: 10.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 10,
  },

  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    marginBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: '900', color: C.dark },
  listCount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.muted,
    marginTop: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
  },
  selectOn: { backgroundColor: C.dark },
  selectText: { fontSize: 12.5, fontWeight: '900', color: C.green },
  selectTextOn: { color: C.white },
  selectHint: {
    fontSize: 12,
    fontWeight: '700',
    color: C.blue,
    marginBottom: 10,
  },
  listGap: { height: 12 },
  footerLoader: { marginVertical: 16 },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  bottomText: { fontSize: 13, fontWeight: '900', color: C.muted },
});
