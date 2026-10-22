import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import {
  Banknote,
  CircleX,
  Lock,
  MapPin,
  Phone,
  Star,
  Store,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import MarketHeader from '../../components/market/MarketHeader';
import NoteSheet from '../../components/market/NoteSheet';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import Toast, { useToast } from '../../components/common/Toast';
import { OrderTracker, PlantImage } from '../../components/nursery/NurseryBits';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  cancelNurseryOrder,
  fetchNurseryOrderById,
  reviewNurseryOrderItem,
} from '../../redux/slices/nurseryOrderSlice';
import { formatRupees } from '../../utils/marketFormat';
import { formatDay } from '../../utils/indiaSchedule';
import {
  ORDER_STATUS_META,
  describeOrderState,
  formatAddress,
  groupItemsBySeller,
} from '../../utils/nurseryFormat';

const heroGradientFor = status =>
  ({
    PENDING: 'blue',
    CONFIRMED: 'blue',
    DISPATCHED: 'green',
    OUT_FOR_DELIVERY: 'amber',
    DELIVERED: 'forest',
    CANCELLED: 'slate',
  }[status] || 'forest');

export default function NurseryOrderDetailsScreen({ navigation, route }) {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const { selectedOrder, orderLoading, orderError, actionInProgress } =
    useSelector(state => state.nurseryOrder);

  // 'cancel' or {item} to review
  const [sheet, setSheet] = useState(null);
  const [sheetError, setSheetError] = useState(null);

  const order = selectedOrder?._id === orderId ? selectedOrder : null;

  const load = useCallback(
    () => dispatch(fetchNurseryOrderById(orderId)),
    [dispatch, orderId],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Order" onBack={() => navigation.goBack()} />
        {orderError && !orderLoading ? (
          <EmptyState
            title="Order not available"
            message={orderError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const status = order.orderStatus;
  const sellers = groupItemsBySeller(order);
  const multiSeller = sellers.length > 1;
  const cancelled = status === 'CANCELLED';
  const reviewItem = sheet && sheet !== 'cancel' ? sheet.item : null;

  const openSheet = value => {
    setSheetError(null);
    setSheet(value);
  };

  const handleSheetSubmit = async ({ text, rating }) => {
    try {
      if (sheet === 'cancel') {
        await dispatch(cancelNurseryOrder({ orderId, reason: text })).unwrap();
        setSheet(null);
        toast.show('Order cancelled');
      } else {
        await dispatch(
          reviewNurseryOrderItem({
            orderId,
            itemId: reviewItem._id,
            rating,
            comment: text,
          }),
        ).unwrap();
        setSheet(null);
        toast.show('Thanks for your review');
      }
    } catch (error) {
      setSheetError(String(error));
      load();
    }
  };

  const call = phoneNumber => Linking.openURL(`tel:${phoneNumber}`);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={orderLoading}
            onRefresh={load}
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
                  : { label: 'Cash on delivery', color: C.dark, bg: C.white }
              }
            />
          }
        >
          <Text style={styles.heroLabel}>
            {order.paymentStatus === 'PAID' ? 'Paid' : 'To pay on delivery'}
          </Text>
          <Text style={styles.heroAmount}>{formatRupees(order.total)}</Text>
          <Text style={styles.heroTerms}>
            Ordered {formatDay(order.createdAt)}
          </Text>

          {!cancelled && (
            <View style={styles.heroTracker}>
              <OrderTracker status={status} light />
            </View>
          )}

          <View style={styles.heroState}>
            <Text style={styles.heroStateText}>
              {describeOrderState(order)}
            </Text>
            {cancelled && !!order.cancellationReason && (
              <Text style={styles.heroReason}>
                Reason: {order.cancellationReason}
              </Text>
            )}
          </View>
        </MarketHero>

        <View style={styles.body}>
          {/* ITEMS BY SELLER */}
          {sellers.map(group => (
            <View key={group.sellerId} style={styles.card}>
              <View style={styles.sellerHeader}>
                <View style={styles.sellerIcon}>
                  <Store size={17} color={C.orange} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.sellerLabel}>Sold by</Text>
                  <Text style={styles.sellerName} numberOfLines={1}>
                    {group.sellerName}
                  </Text>
                </View>
                {multiSeller && (
                  <StatusPill meta={ORDER_STATUS_META[group.status]} />
                )}
              </View>

              {multiSeller && group.status !== 'CANCELLED' && (
                <View style={styles.groupTracker}>
                  <OrderTracker status={group.status} />
                </View>
              )}

              {group.items.map(item => (
                <View key={item._id} style={styles.itemRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate(NURSERY_ROUTES.PLANT, {
                        plantId: item.plant,
                      })
                    }
                  >
                    <PlantImage plant={item} style={styles.itemImage} />
                  </TouchableOpacity>
                  <View style={styles.flex}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} × {formatRupees(item.price)}
                    </Text>
                    {item.status === 'CANCELLED' && (
                      <Text style={styles.itemCancelled}>
                        Cancelled
                        {item.cancellationReason
                          ? ` · ${item.cancellationReason}`
                          : ''}
                      </Text>
                    )}
                    {!!item.review?.rating && (
                      <View style={styles.reviewed}>
                        <Star size={11} color={C.gold} fill={C.gold} />
                        <Text style={styles.reviewedText}>
                          You rated {item.review.rating}/5
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemRight}>
                    <Text
                      style={[
                        styles.itemTotal,
                        item.status === 'CANCELLED' && styles.struck,
                      ]}
                    >
                      {formatRupees(item.total)}
                    </Text>
                    {item.canReview && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.rateButton}
                        onPress={() => openSheet({ item })}
                      >
                        <Star size={12} color={C.amber} />
                        <Text style={styles.rateText}>Rate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {group.status !== 'CANCELLED' &&
                (group.phoneNumber ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.callRow}
                    onPress={() => call(group.phoneNumber)}
                  >
                    <Phone size={15} color={C.white} />
                    <Text style={styles.callText}>
                      Call seller · {group.phoneNumber}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.lockedRow}>
                    <Lock size={13} color={C.muted} />
                    <Text style={styles.lockedText}>
                      Seller's phone number appears once they confirm
                    </Text>
                  </View>
                ))}
            </View>
          ))}

          {/* ADDRESS */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <MapPin size={17} color={C.green} />
              <Text style={styles.cardTitle}>Delivering to</Text>
            </View>
            <Text style={styles.addressName}>
              {order.deliveryAddress?.fullName} ·{' '}
              {order.deliveryAddress?.phoneNumber}
            </Text>
            <Text style={styles.addressText}>
              {formatAddress(order.deliveryAddress)}
            </Text>
          </View>

          {/* BILL */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Banknote size={17} color={C.blue} />
              <Text style={styles.cardTitle}>Bill</Text>
            </View>
            <InfoRow label="Plants" value={formatRupees(order.subtotal)} />
            <InfoRow
              label="Delivery"
              value={
                order.deliveryFee ? formatRupees(order.deliveryFee) : 'FREE'
              }
            />
            <InfoRow
              label="Payment"
              value={
                order.paymentStatus === 'PAID' ? 'Paid' : 'Cash on delivery'
              }
            />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Order total</Text>
              <Text style={styles.totalValue}>{formatRupees(order.total)}</Text>
            </View>
            {multiSeller && order.items.some(i => i.status === 'CANCELLED') && (
              <Text style={styles.payNote}>
                Cancelled plants are not charged. Pay each seller only for the
                plants they deliver.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {order.canCancel && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          <MarketButton
            variant="danger"
            label="Cancel Order"
            icon={<CircleX size={16} color={C.red} />}
            disabled={!!actionInProgress}
            onPress={() => openSheet('cancel')}
            style={styles.flex}
          />
        </View>
      )}

      <NoteSheet
        visible={!!sheet}
        {...(sheet === 'cancel'
          ? {
              title: 'Cancel this order?',
              description:
                'All plants in this order will be cancelled. You pay nothing.',
              placeholder: 'Reason (optional), e.g. Ordered by mistake',
              submitLabel: 'Cancel Order',
              variant: 'danger',
            }
          : {
              title: `Rate ${reviewItem?.name || 'this plant'}`,
              description:
                'How healthy was the plant when it arrived? Your review helps other farmers.',
              placeholder: 'Share your experience (optional)',
              submitLabel: 'Submit Review',
              withRating: true,
            })}
        loading={!!actionInProgress}
        serverError={sheetError}
        onClose={() => setSheet(null)}
        onSubmit={handleSheetSubmit}
      />

      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16, paddingTop: 4 },
  flex: { flex: 1 },

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
  heroStateText: { color: C.white, fontSize: 13, fontWeight: '800' },
  heroReason: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    ...MARKET_SHADOW,
  },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sellerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerLabel: { fontSize: 10.5, fontWeight: '800', color: C.muted },
  sellerName: { fontSize: 14.5, fontWeight: '900', color: C.dark },
  groupTracker: {
    marginTop: 14,
    padding: 12,
    paddingBottom: 10,
    borderRadius: 14,
    backgroundColor: C.bg,
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
  reviewed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  reviewedText: { fontSize: 11, fontWeight: '800', color: C.amber },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemTotal: { fontSize: 14, fontWeight: '900', color: C.dark },
  struck: { textDecorationLine: 'line-through', color: C.muted },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.lightAmber,
  },
  rateText: { fontSize: 11.5, fontWeight: '900', color: C.amber },

  callRow: {
    marginTop: 12,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callText: { color: C.white, fontSize: 13, fontWeight: '900' },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.bg,
  },
  lockedText: { flex: 1, fontSize: 11.5, color: C.muted, fontWeight: '600' },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: C.dark },
  addressName: {
    fontSize: 13.5,
    fontWeight: '900',
    color: C.dark,
    marginTop: 4,
  },
  addressText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: C.text,
    marginTop: 4,
    lineHeight: 18,
  },
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
  payNote: { fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 8 },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
});
