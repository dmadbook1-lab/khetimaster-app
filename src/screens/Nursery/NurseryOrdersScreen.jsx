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
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'active', get label() {
    return i18n.t('nurseryOrders.ongoing');
  } },
  { key: 'PENDING', get label() {
    return i18n.t('nurseryOrders.placed');
  } },
  { key: 'CONFIRMED', get label() {
    return i18n.t('nurseryOrders.confirmed');
  } },
  { key: 'DISPATCHED', get label() {
    return i18n.t('nurseryOrders.dispatched');
  } },
  { key: 'DELIVERED', get label() {
    return i18n.t('nurseryOrders.delivered');
  } },
  { key: 'CANCELLED', get label() {
    return i18n.t('nurseryOrders.cancelled');
  } },
  { key: 'all', get label() {
    return i18n.t('nurseryOrders.all');
  } },
];

const PAGE_SIZE = 20;

export default function NurseryOrdersScreen({ navigation }) {
  const {t} = useTranslation();
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
              eyebrow={t('nurseryOrders.nursery')}
              title={t('nurseryOrders.myOrders')}
              subtitle={t('nurseryOrders.trackThePlantsYouOrdered')}
              right={
                <GlassButton
                  onPress={() => navigation.navigate(NURSERY_ROUTES.HOME)}
                >
                  <Sprout size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat value={total} label={t('nurseryOrders.showing')} />
                <HeroStat value={onTheWay} label={t('nurseryOrders.onTheWay')} />
                <HeroStat
                  value={toRate}
                  label={t('nurseryOrders.toRate')}
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
              title={t('nurseryOrders.couldntLoadYourOrders')}
              message={error}
              actionLabel={t('nurseryOrders.tryAgain')}
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Package size={30} color={C.green} />}
              title={t('nurseryOrders.noOrdersHere')}
              message={t('nurseryOrders.orderSaplingsSeedlingsAndFlowering')}
              actionLabel={t('nurseryOrders.browsePlants')}
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
