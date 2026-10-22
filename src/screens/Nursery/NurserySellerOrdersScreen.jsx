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
import { ArrowRight, Inbox, Store } from 'lucide-react-native';
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
  MarketButton,
} from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import NurseryOrderCard from '../../components/nursery/NurseryOrderCard';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  fetchSellerNurseryOrders,
  updateSellerNurseryOrder,
} from '../../redux/slices/nurseryOrderSlice';
import { ORDER_STATUS_META, SELLER_NEXT_STEP } from '../../utils/nurseryFormat';

const STATUS_FILTERS = [
  { key: 'active', label: 'To handle' },
  { key: 'PENDING', label: 'New' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

const PAGE_SIZE = 20;

export default function NurserySellerOrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.nurseryOrder.sellerOrders);
  const actionInProgress = useSelector(
    state => state.nurseryOrder.actionInProgress,
  );

  const [status, setStatus] = useState('active');
  const [busyOrderId, setBusyOrderId] = useState(null);

  const params = useMemo(() => ({ status, limit: PAGE_SIZE }), [status]);

  const load = useCallback(
    () =>
      dispatch(fetchSellerNurseryOrders({ params: { ...params, page: 1 } })),
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
      fetchSellerNurseryOrders({
        params: { ...params, page: page + 1 },
        append: true,
      }),
    );
  };

  const advance = order => {
    const next = SELLER_NEXT_STEP[order.sellerStatus];

    feedback.confirm({
      title: `${next.label}?`,
      message: `The buyer will see this order as "${
        ORDER_STATUS_META[next.status].label
      }".`,
      confirmLabel: next.label,
      onConfirm: async () => {
        setBusyOrderId(order._id);
        try {
          await dispatch(
            updateSellerNurseryOrder({
              orderId: order._id,
              status: next.status,
            }),
          ).unwrap();
          toast.show(`Marked ${ORDER_STATUS_META[next.status].label}`);
        } catch (failure) {
          feedback.error('Could not update order', String(failure));
          load();
        } finally {
          setBusyOrderId(null);
        }
      },
    });
  };

  const newOrders = items.filter(
    item => item.sellerStatus === 'PENDING',
  ).length;
  const toShip = items.filter(item =>
    ['CONFIRMED', 'DISPATCHED', 'OUT_FOR_DELIVERY'].includes(item.sellerStatus),
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : items}
        keyExtractor={item => item._id}
        renderItem={({ item }) => {
          const next = SELLER_NEXT_STEP[item.sellerStatus];

          return (
            <View style={styles.item}>
              <NurseryOrderCard
                order={item}
                role="seller"
                onPress={() =>
                  navigation.navigate(NURSERY_ROUTES.SELLER_ORDER_DETAILS, {
                    orderId: item._id,
                  })
                }
                footer={
                  next ? (
                    <MarketButton
                      label={next.label}
                      icon={<ArrowRight size={16} color={C.white} />}
                      loading={busyOrderId === item._id && !!actionInProgress}
                      disabled={!!actionInProgress}
                      onPress={() => advance(item)}
                      style={styles.cardButton}
                    />
                  ) : null
                }
              />
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <MarketHero
              compact
              gradient="amber"
              onBack={() => navigation.goBack()}
              eyebrow="My Nursery"
              title="Orders received"
              subtitle="Confirm new orders, then move them to delivered"
              right={
                <GlassButton
                  onPress={() =>
                    navigation.navigate(NURSERY_ROUTES.MY_LISTINGS)
                  }
                >
                  <Store size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat
                  value={newOrders}
                  label="New"
                  highlight={newOrders > 0}
                />
                <HeroStat value={toShip} label="To deliver" />
                <HeroStat value={total} label="Showing" />
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
              title="Couldn't load orders"
              message={error}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Inbox size={30} color={C.green} />}
              title={status === 'active' ? 'All caught up' : 'No orders here'}
              message={
                status === 'active'
                  ? 'New orders for your plants will show up here.'
                  : 'Try another filter.'
              }
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
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
  cardButton: { marginTop: 12, height: 46 },
});
