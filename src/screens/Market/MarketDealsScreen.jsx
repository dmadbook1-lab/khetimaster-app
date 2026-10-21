import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Handshake, X } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
import DealCard from '../../components/market/DealCard';
import {
  ChipRow,
  EmptyState,
  LoadingState,
} from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import { fetchMyMarketDeals } from '../../redux/slices/marketDealSlice';

const ROLE_TABS = [
  { key: '', label: 'All' },
  { key: 'buying', label: 'Buying' },
  { key: 'selling', label: 'Selling' },
];

const STATUS_FILTERS = [
  { key: 'open', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

const PAGE_SIZE = 20;

export default function MarketDealsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { deals, pagination, dealsLoading, dealsLoadingMore, dealsError } =
    useSelector(state => state.marketDeal);

  // opened from a listing -> offers on that listing only
  const [listingFilter, setListingFilter] = useState(
    route?.params?.listingId
      ? { id: route.params.listingId, title: route.params.listingTitle }
      : null,
  );
  const [role, setRole] = useState(listingFilter ? 'selling' : '');
  const [status, setStatus] = useState('open');

  const params = useMemo(
    () => ({
      role,
      status,
      listingId: listingFilter?.id,
      limit: PAGE_SIZE,
    }),
    [role, status, listingFilter],
  );

  const load = useCallback(
    () => dispatch(fetchMyMarketDeals({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleLoadMore = () => {
    if (
      dealsLoading ||
      dealsLoadingMore ||
      pagination.page >= pagination.pages
    ) {
      return;
    }

    dispatch(
      fetchMyMarketDeals({
        params: { ...params, page: pagination.page + 1 },
        append: true,
      }),
    );
  };

  const myTurnCount = deals.filter(deal => deal.isMyTurn).length;
  const acceptedCount = deals.filter(deal => deal.status === 'ACCEPTED').length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={dealsLoading && !deals.length ? [] : deals}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <DealCard
              deal={item}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.DEAL_DETAILS, {
                  dealId: item._id,
                })
              }
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <MarketHero
              compact
              gradient="blue"
              onBack={() => navigation.goBack()}
              eyebrow={listingFilter ? 'Offers received' : 'Negotiations'}
              title={
                listingFilter
                  ? listingFilter.title || 'This listing'
                  : 'My Deals'
              }
              subtitle={
                myTurnCount
                  ? `${myTurnCount} ${
                      myTurnCount === 1 ? 'deal is' : 'deals are'
                    } waiting for your reply`
                  : 'Track every offer you send and receive'
              }
            >
              <View style={styles.statsRow}>
                <HeroStat
                  value={myTurnCount}
                  label="Your turn"
                  highlight={myTurnCount > 0}
                />
                <HeroStat value={acceptedCount} label="Accepted" />
                <HeroStat value={pagination.total} label="Showing" />
              </View>

              {listingFilter ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.clearFilter}
                  onPress={() => {
                    setListingFilter(null);
                    setRole('');
                  }}
                >
                  <Text style={styles.clearFilterText}>Show all my deals</Text>
                  <X size={14} color={C.white} />
                </TouchableOpacity>
              ) : (
                <View style={styles.roleTabs}>
                  {ROLE_TABS.map(tab => {
                    const selected = tab.key === role;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        activeOpacity={0.85}
                        style={[
                          styles.roleTab,
                          selected && styles.roleTabSelected,
                        ]}
                        onPress={() => setRole(tab.key)}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            selected && styles.roleTextSelected,
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </MarketHero>

            <View style={styles.filters}>
              <ChipRow
                options={STATUS_FILTERS}
                value={status}
                onChange={setStatus}
              />
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={dealsLoading && deals.length > 0}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          dealsLoading ? (
            <LoadingState />
          ) : dealsError ? (
            <EmptyState
              title="Couldn't load deals"
              message={dealsError}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Handshake size={30} color={C.green} />}
              title="No deals here"
              message={
                listingFilter
                  ? 'No offers on this listing yet.'
                  : 'Offers you send or receive on Kheti Market will show up here.'
              }
            />
          )
        }
        ListFooterComponent={
          dealsLoadingMore ? (
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
  headerBlock: { marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  roleTabs: {
    flexDirection: 'row',
    marginTop: 14,
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  roleTab: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTabSelected: { backgroundColor: C.white },
  roleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
  },
  roleTextSelected: { color: C.blue, fontWeight: '900' },
  clearFilter: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  clearFilterText: { color: C.white, fontSize: 12, fontWeight: '800' },
  filters: { paddingHorizontal: 16, marginTop: 16 },
  footerLoader: { marginVertical: 16 },
});
