import React, { useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
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
  ArrowRight,
  Banknote,
  CircleCheck,
  CircleX,
  MapPin,
  Phone,
  Sprout,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import NoteSheet from '../../components/market/NoteSheet';
import {
  EmptyState,
  InfoRow,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import PersonAvatar from '../../components/labour/PersonAvatar';
import { OrderTracker, PlantImage } from '../../components/nursery/NurseryBits';
import {
  fetchSellerNurseryOrders,
  updateSellerNurseryOrder,
} from '../../redux/slices/nurseryOrderSlice';
import { formatRupees } from '../../utils/marketFormat';
import { formatDay } from '../../utils/indiaSchedule';
import {
  ORDER_STATUS_META,
  SELLER_NEXT_STEP,
  describeSellerState,
  formatAddress,
  isCancellable,
  itemCount,
} from '../../utils/nurseryFormat';

const heroGradientFor = status =>
  ({
    PENDING: 'amber',
    CONFIRMED: 'blue',
    DISPATCHED: 'green',
    OUT_FOR_DELIVERY: 'green',
    DELIVERED: 'forest',
    CANCELLED: 'slate',
  }[status] || 'forest');

/*
 * The seller's view of one order. It comes from the orders-received
 * list (there is no single seller-order endpoint); refreshing reloads
 * all of the seller's orders into the cache.
 */
export default function NurserySellerOrderDetailsScreen({ navigation, route }) {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const order = useSelector(
    state => state.nurseryOrder.sellerOrderById[orderId],
  );
  const actionInProgress = useSelector(
    state => state.nurseryOrder.actionInProgress,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [sheetError, setSheetError] = useState(null);

  const refresh = async () => {
    setRefreshing(true);
    await dispatch(
      fetchSellerNurseryOrders({ params: { status: 'all', limit: 50 } }),
    );
    setRefreshing(false);
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Order" onBack={() => navigation.goBack()} />
        <EmptyState
          title="Order not found"
          message="Go back to orders received and open it again."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const status = order.sellerStatus;
  const next = SELLER_NEXT_STEP[status];
  // local hand-over: allow jumping straight to delivered
  const canDeliverNow = ['CONFIRMED', 'DISPATCHED'].includes(status);
  const canCancel = isCancellable(status);
  const buyer = order.deliveryAddress || {};

  const updateStatus = async (newStatus, reason) => {
    await dispatch(
      updateSellerNurseryOrder({ orderId, status: newStatus, reason }),
    ).unwrap();
    toast.show(
      newStatus === 'CANCELLED'
        ? 'Order cancelled. Stock was put back.'
        : `Marked ${ORDER_STATUS_META[newStatus].label}`,
    );
  };

  const confirmStatus = (newStatus, label, message) =>
    feedback.confirm({
      title: `${label}?`,
      message,
      confirmLabel: label,
      onConfirm: async () => {
        try {
          await updateStatus(newStatus);
        } catch (failure) {
          feedback.error('Could not update order', String(failure), {
            primaryLabel: 'Refresh',
            secondaryLabel: 'Close',
            onPrimary: refresh,
          });
        }
      },
    });

  const handleCancel = async ({ text }) => {
    try {
      await updateStatus('CANCELLED', text);
      setCancelOpen(false);
    } catch (failure) {
      setSheetError(String(failure));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
      >
        <MarketHero
          compact
          gradient={heroGradientFor(status)}
          onBack={() => navigation.goBack()}
          eyebrow={`Order #${String(order._id).slice(-6).toUpperCase()}`}
          title={ORDER_STATUS_META[status]?.label || 'Order'}
          right={
            <StatusPill
              meta={
                order.paymentStatus === 'PAID'
                  ? { label: 'Paid', color: C.green, bg: C.white }
                  : { label: 'Collect cash', color: C.dark, bg: C.white }
              }
            />
          }
        >
          <Text style={styles.heroLabel}>Your earning from this order</Text>
          <Text style={styles.heroAmount}>
            {formatRupees(order.sellerSubtotal)}
          </Text>
          <Text style={styles.heroTerms}>
            {itemCount(order.items)} plants · ordered{' '}
            {formatDay(order.createdAt, { weekday: false })}
          </Text>

          {status !== 'CANCELLED' && (
            <View style={styles.heroTracker}>
              <OrderTracker status={status} light />
            </View>
          )}

          <View
            style={[
              styles.heroState,
              status === 'PENDING' && styles.heroStateUrgent,
            ]}
          >
            <Text
              style={[
                styles.heroStateText,
                status === 'PENDING' && styles.heroStateTextUrgent,
              ]}
            >
              {describeSellerState(status)}
            </Text>
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* BUYER */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Deliver to</Text>
            <View style={styles.buyerRow}>
              <PersonAvatar name={buyer.fullName} gradient="blue" size={50} />
              <View style={styles.flex}>
                <Text style={styles.buyerName}>
                  {buyer.fullName || 'Buyer'}
                </Text>
                {!!buyer.phoneNumber && (
                  <Text style={styles.buyerPhone}>{buyer.phoneNumber}</Text>
                )}
              </View>
              {!!buyer.phoneNumber && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${buyer.phoneNumber}`)}
                >
                  <Phone size={18} color={C.white} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.locationRow}>
              <MapPin size={15} color={C.green} />
              <Text style={styles.locationText}>{formatAddress(buyer)}</Text>
            </View>
          </View>

          {/* ITEMS */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Sprout size={17} color={C.green} />
              <Text style={styles.cardTitle}>Your plants in this order</Text>
            </View>
            {order.items.map(item => (
              <View key={item._id} style={styles.itemRow}>
                <PlantImage plant={item} style={styles.itemImage} />
                <View style={styles.flex}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × {formatRupees(item.price)}
                  </Text>
                  {item.status === 'CANCELLED' && !!item.cancellationReason && (
                    <Text style={styles.itemCancelled}>
                      Cancelled · {item.cancellationReason}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.itemTotal,
                    item.status === 'CANCELLED' && styles.struck,
                  ]}
                >
                  {formatRupees(item.total)}
                </Text>
              </View>
            ))}
          </View>

          {/* PAYMENT */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Banknote size={17} color={C.blue} />
              <Text style={styles.cardTitle}>Payment</Text>
            </View>
            <InfoRow label="Method" value="Cash on delivery" />
            <InfoRow
              label="Status"
              value={
                order.paymentStatus === 'PAID' ? 'Paid' : 'Collect on delivery'
              }
            />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Collect for your plants</Text>
              <Text style={styles.totalValue}>
                {formatRupees(order.sellerSubtotal)}
              </Text>
            </View>
            <Text style={styles.payNote}>
              If the buyer ordered from other nurseries too, they pay each
              seller for their own plants. Delivery fee is settled by the buyer.
            </Text>
          </View>
        </View>
      </ScrollView>

      {(next || canCancel) && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          {canDeliverNow && (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!!actionInProgress}
              style={styles.skipLink}
              onPress={() =>
                confirmStatus(
                  'DELIVERED',
                  'Mark Delivered',
                  'Use this if the buyer picked up the plants or you handed them over directly.',
                )
              }
            >
              <CircleCheck size={14} color={C.green} />
              <Text style={styles.skipText}>
                Handed over directly? Mark delivered
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.buttonRow}>
            {canCancel && (
              <MarketButton
                variant="danger"
                label="Cancel"
                icon={<CircleX size={16} color={C.red} />}
                disabled={!!actionInProgress}
                onPress={() => {
                  setSheetError(null);
                  setCancelOpen(true);
                }}
                style={styles.flex}
              />
            )}
            {!!next && (
              <MarketButton
                label={next.label}
                icon={<ArrowRight size={17} color={C.white} />}
                loading={actionInProgress === next.status}
                disabled={!!actionInProgress}
                onPress={() =>
                  confirmStatus(
                    next.status,
                    next.label,
                    `The buyer will see this order as "${
                      ORDER_STATUS_META[next.status].label
                    }".`,
                  )
                }
                style={styles.flexWide}
              />
            )}
          </View>
        </View>
      )}

      <NoteSheet
        visible={cancelOpen}
        title="Cancel your plants in this order?"
        description="The buyer will be told and the stock goes back to your listing."
        placeholder="Reason (optional), e.g. Plants damaged"
        submitLabel="Cancel Order"
        variant="danger"
        loading={actionInProgress === 'CANCELLED'}
        serverError={sheetError}
        onClose={() => setCancelOpen(false)}
        onSubmit={handleCancel}
      />

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16, paddingTop: 4 },
  flex: { flex: 1 },
  flexWide: { flex: 1.5 },

  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 14,
  },
  heroAmount: {
    color: C.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 2,
  },
  heroTerms: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  heroTracker: { marginTop: 18 },
  heroState: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroStateUrgent: { backgroundColor: C.white, borderColor: C.white },
  heroStateText: { color: C.white, fontSize: 13, fontWeight: '800' },
  heroStateTextUrgent: { color: '#8A4A00', fontWeight: '900' },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  cardLabel: { fontSize: 11.5, fontWeight: '800', color: C.muted },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: C.dark },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  buyerName: { fontSize: 15.5, fontWeight: '900', color: C.dark },
  buyerPhone: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  callButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
  },
  locationText: {
    flex: 1,
    fontSize: 12.5,
    color: C.text,
    fontWeight: '700',
    lineHeight: 18,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F1',
  },
  itemImage: { width: 56, height: 56, borderRadius: 14 },
  itemName: { fontSize: 13.5, fontWeight: '900', color: C.dark },
  itemMeta: { fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 2 },
  itemCancelled: {
    fontSize: 11,
    fontWeight: '800',
    color: C.red,
    marginTop: 3,
  },
  itemTotal: { fontSize: 14, fontWeight: '900', color: C.dark },
  struck: { textDecorationLine: 'line-through', color: C.muted },

  totalRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, fontWeight: '800', color: C.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: C.green },
  payNote: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 16,
  },

  bottomBar: {
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
  buttonRow: { flexDirection: 'row', gap: 10 },
  skipLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  skipText: { fontSize: 12, fontWeight: '800', color: C.green },
});
