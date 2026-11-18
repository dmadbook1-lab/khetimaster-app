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
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'active', get label() {
    return i18n.t('nurserySellerOrders.toHandle');
  } },
  { key: 'PENDING', get label() {
    return i18n.t('nurserySellerOrders.new');
  } },
  { key: 'CONFIRMED', get label() {
    return i18n.t('nurserySellerOrders.confirmed');
  } },
  { key: 'DISPATCHED', get label() {
    return i18n.t('nurserySellerOrders.dispatched');
  } },
  { key: 'OUT_FOR_DELIVERY', get label() {
    return i18n.t('nurserySellerOrders.onTheWay');
  } },
  { key: 'DELIVERED', get label() {
    return i18n.t('nurserySellerOrders.delivered');
  } },
  { key: 'CANCELLED', get label() {
    return i18n.t('nurserySellerOrders.cancelled');
  } },
  { key: 'all', get label() {
    return i18n.t('nurserySellerOrders.all');
  } },
];

const PAGE_SIZE = 20;

export default function NurserySellerOrdersScreen({ navigation }) {
  const {t} = useTranslation();
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
      message: t('nurserySellerOrders.theBuyerWillSeeThis', {label: ORDER_STATUS_META[next.status].label}),
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
          toast.show(t('nurserySellerOrders.marked', {label: ORDER_STATUS_META[next.status].label}));
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
              eyebrow={t('nurserySellerOrders.myNursery')}
              title={t('nurserySellerOrders.ordersReceived')}
              subtitle={t('nurserySellerOrders.confirmNewOrdersThenMove')}
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
                  label={t('nurserySellerOrders.new')}
                  highlight={newOrders > 0}
                />
                <HeroStat value={toShip} label={t('nurserySellerOrders.toDeliver')} />
                <HeroStat value={total} label={t('nurserySellerOrders.showing')} />
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
              title={t('nurserySellerOrders.couldntLoadOrders')}
              message={error}
              actionLabel={t('nurserySellerOrders.tryAgain')}
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Inbox size={30} color={C.green} />}
              title={status === 'active' ? t('nurserySellerOrders.allCaughtUp') : t('nurserySellerOrders.noOrdersHere')}
              message={
                status === 'active'
                  ? t('nurserySellerOrders.newOrdersForYourPlants')
                  : t('nurserySellerOrders.tryAnotherFilter')
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
