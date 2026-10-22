import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Package, Sprout } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
import {
  ChipRow,
  EmptyState,
  LoadingState,
} from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import NurseryOrderCard from '../../components/nursery/NurseryOrderCard';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import { fetchMyNurseryOrders } from '../../redux/slices/nurseryOrderSlice';

const STATUS_FILTERS = [
  { key: 'active', label: 'Ongoing' },
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

const PAGE_SIZE = 20;

export default function NurseryOrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.nurseryOrder.myOrders);

  const [status, setStatus] = useState('active');

  const params = useMemo(() => ({ status, limit: PAGE_SIZE }), [status]);

  const load = useCallback(
    () => dispatch(fetchMyNurseryOrders({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    dispatch(
      fetchMyNurseryOrders({
        params: { ...params, page: page + 1 },
        append: true,
      }),
    );
  };

  const onTheWay = items.filter(item =>
    ['DISPATCHED', 'OUT_FOR_DELIVERY'].includes(item.orderStatus),
  ).length;
  const toRate = items.filter(item =>
    (item.items || []).some(entry => entry.canReview),
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : items}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <NurseryOrderCard
              order={item}
              onPress={() =>
                navigation.navigate(NURSERY_ROUTES.ORDER_DETAILS, {
                  orderId: item._id,
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
          <View style={styles.header}>
            <MarketHero
              compact
              gradient="forest"
              onBack={() => navigation.goBack()}
              eyebrow="Nursery"
              title="My Orders"
              subtitle="Track the plants you ordered"
              right={
                <GlassButton
                  onPress={() => navigation.navigate(NURSERY_ROUTES.HOME)}
                >
                  <Sprout size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat value={total} label="Showing" />
                <HeroStat value={onTheWay} label="On the way" />
                <HeroStat
                  value={toRate}
                  label="To rate"
                  highlight={toRate > 0}
                />
              </View>
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
            refreshing={loading && items.length > 0}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              title="Couldn't load your orders"
              message={error}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Package size={30} color={C.green} />}
              title="No orders here"
              message="Order saplings, seedlings and flowering plants from nurseries near you."
              actionLabel="Browse Plants"
              onAction={() => navigation.navigate(NURSERY_ROUTES.HOME)}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
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
  header: { marginBottom: 14 },
  item: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  filters: { paddingHorizontal: 16, marginTop: 16 },
  footerLoader: { marginVertical: 16 },
});
