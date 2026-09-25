import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  UserRound,
  XCircle,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchNurseryOrderById,
  cancelNurseryOrder,
} from '../../redux/slices/nurseryOrderSlice';

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F6F8F7';
const WHITE = '#FFFFFF';
const MUTED = '#747B78';
const BORDER = '#E2E8E4';
const LIGHT_GREEN = '#EAF7EF';
const RED = '#D64545';
const ORANGE = '#D8891A';

/* ---------- Memoized Order Product Row ---------- */
const ProductItemRow = memo(({item, isLast}) => {
  const image = item?.image || null;
  const quantity = Number(item?.quantity || 0);
  const price = Number(item?.price || 0);
  const itemTotal = Number(item?.total || price * quantity);

  return (
    <View style={[styles.productRow, isLast && styles.lastProduct]}>
      {image ? (
        <Image source={{uri: image}} style={styles.productImage} />
      ) : (
        <View style={styles.productPlaceholder}>
          <Package size={20} color={GREEN} />
        </View>
      )}

      <View style={styles.productContent}>
        <Text numberOfLines={2} style={styles.productName}>
          {item?.name || 'Plant'}
        </Text>
        <Text style={styles.sellerText}>
          Seller: {item?.seller?.name || 'Seller'}
        </Text>
        <Text style={styles.quantityText}>
          ₹{price.toLocaleString('en-IN')} × {quantity}
        </Text>
      </View>

      <Text style={styles.productTotal}>
        ₹{itemTotal.toLocaleString('en-IN')}
      </Text>
    </View>
  );
});

const NurseryOrderDetailsScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const orderId = route?.params?.orderId;

  const {selectedOrder, loading, cancelling, error} = useSelector(
    state => state.nurseryOrder,
  );

  const [refreshing, setRefreshing] = useState(false);

  const loadOrderDetails = useCallback(() => {
    if (orderId) {
      dispatch(fetchNurseryOrderById(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const refreshOrder = useCallback(async () => {
    if (!orderId) return;
    setRefreshing(true);
    try {
      await dispatch(fetchNurseryOrderById(orderId)).unwrap();
    } catch (err) {
      console.log('Order refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, orderId]);

  const handleCancel = useCallback(() => {
    if (!selectedOrder) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {text: 'Keep Order', style: 'cancel'},
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelNurseryOrder(orderId)).unwrap();
              dispatch(fetchNurseryOrderById(orderId));
              Alert.alert(
                'Order cancelled',
                'Your order has been cancelled successfully.',
              );
            } catch (err) {
              Alert.alert(
                'Unable to cancel',
                err?.message || 'Unable to cancel this order.',
              );
            }
          },
        },
      ],
    );
  }, [dispatch, orderId, selectedOrder]);

  const getStatus = useCallback(status => {
    switch (status) {
      case 'CONFIRMED':
        return {
          title: 'Order Confirmed',
          description: 'The seller has confirmed your order.',
          color: GREEN,
          bg: LIGHT_GREEN,
          icon: CheckCircle2,
        };
      case 'DISPATCHED':
        return {
          title: 'Order Dispatched',
          description: 'Your plants have been dispatched.',
          color: '#3678C5',
          bg: '#EAF2FC',
          icon: Package,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          title: 'Out for Delivery',
          description: 'Your plants are on the way.',
          color: ORANGE,
          bg: '#FFF4E3',
          icon: Truck,
        };
      case 'DELIVERED':
        return {
          title: 'Delivered',
          description: 'Your plants have been delivered.',
          color: GREEN,
          bg: LIGHT_GREEN,
          icon: CheckCircle2,
        };
      case 'CANCELLED':
        return {
          title: 'Order Cancelled',
          description: 'This order has been cancelled.',
          color: RED,
          bg: '#FFF0F0',
          icon: XCircle,
        };
      case 'PENDING':
      default:
        return {
          title: 'Order Pending',
          description: 'Your order is waiting for confirmation.',
          color: ORANGE,
          bg: '#FFF4E3',
          icon: Clock3,
        };
    }
  }, []);

  const formatDate = useCallback(date => {
    if (!date) return '-';
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const formatDateTime = useCallback(date => {
    if (!date) return '-';
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const order = useMemo(() => {
    if (!selectedOrder) return null;
    return selectedOrder?.order || selectedOrder?.data || selectedOrder;
  }, [selectedOrder]);

  const orderStatusConfig = useMemo(() => {
    if (!order?.orderStatus) return getStatus('PENDING');
    return getStatus(order.orderStatus);
  }, [order?.orderStatus, getStatus]);

  if (loading && !selectedOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={21} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedOrder && error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={21} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Package size={35} color={RED} />
          </View>
          <Text style={styles.errorTitle}>Unable to load order</Text>
          <Text style={styles.errorDescription}>
            The order could not be loaded. Please try again.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retryButton}
            onPress={refreshOrder}>
            <RefreshCw size={15} color={WHITE} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const StatusIcon = orderStatusConfig.icon;
  const subtotal = Number(order?.subtotal || 0);
  const deliveryFee = Number(order?.deliveryFee || 0);
  const total = Number(order?.total || 0);
  const items = order?.items || [];
  const delivery = order?.deliveryAddress || {};
  const canCancel = order?.orderStatus === 'PENDING' || order?.orderStatus === 'CONFIRMED';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={21} color={DARK} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle}>
            #{String(order?._id || order?.id || '').slice(-8).toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.refreshButton}
          onPress={refreshOrder}>
          <RefreshCw size={18} color={GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshOrder}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        
        {/* STATUS CARD */}
        <View style={[styles.statusCard, {backgroundColor: orderStatusConfig.bg}]}>
          <View style={styles.statusIcon}>
            <StatusIcon size={26} color={orderStatusConfig.color} />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, {color: orderStatusConfig.color}]}>
              {orderStatusConfig.title}
            </Text>
            <Text style={styles.statusDescription}>
              {orderStatusConfig.description}
            </Text>
          </View>
        </View>

        {/* ORDER INFORMATION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <CalendarDays size={16} color={GREEN} />
            </View>
            <Text style={styles.cardTitle}>Order Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>{formatDate(order?.createdAt)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Payment</Text>
              <Text style={styles.infoValue}>Cash on Delivery</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  {color: order?.paymentStatus === 'PAID' ? GREEN : ORANGE},
                ]}>
                {order?.paymentStatus || 'PENDING'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{formatDateTime(order?.updatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* ITEMS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Package size={16} color={GREEN} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Ordered Plants</Text>
              <Text style={styles.cardSubtitle}>
                {items.length} plant{items.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>

          {items.map((item, index) => (
            <ProductItemRow
              key={String(item?._id || item?.plant || index)}
              item={item}
              isLast={index === items.length - 1}
            />
          ))}
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <MapPin size={16} color={GREEN} />
            </View>
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>

          <View style={styles.addressBox}>
            <View style={styles.addressTop}>
              <UserRound size={16} color={GREEN} />
              <Text style={styles.addressName}>{delivery?.fullName || '-'}</Text>
            </View>

            <View style={styles.addressLine}>
              <Phone size={13} color={MUTED} />
              <Text style={styles.addressText}>{delivery?.phoneNumber || '-'}</Text>
            </View>

            <View style={styles.addressLine}>
              <Home size={13} color={MUTED} />
              <Text style={styles.addressText}>{delivery?.address || '-'}</Text>
            </View>

            <View style={styles.addressLine}>
              <MapPin size={13} color={MUTED} />
              <Text style={styles.addressText}>
                {[
                  delivery?.village,
                  delivery?.taluka,
                  delivery?.district,
                  delivery?.state,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>

            <Text style={styles.pincodeText}>PIN: {delivery?.pincode || '-'}</Text>
          </View>
        </View>

        {/* PRICE SUMMARY */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <CreditCard size={16} color={GREEN} />
            </View>
            <Text style={styles.cardTitle}>Price Details</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery</Text>
            <Text style={[styles.priceValue, deliveryFee === 0 && styles.freeText]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* CANCEL */}
        {canCancel && (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={cancelling}
            style={[styles.cancelButton, cancelling && styles.disabledButton]}
            onPress={handleCancel}>
            {cancelling ? (
              <ActivityIndicator size="small" color={RED} />
            ) : (
              <XCircle size={16} color={RED} />
            )}
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomNote}>
          <Truck size={14} color={GREEN} />
          <Text style={styles.bottomNoteText}>
            Your plants will be delivered to the address provided above.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  header: {
    height: 66,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F2F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle: {color: DARK, fontSize: 17, fontWeight: '900', letterSpacing: -0.3},
  headerSubtitle: {color: MUTED, fontSize: 10, marginTop: 2, fontWeight: '600'},
  headerSpacer: {width: 40},
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {padding: 16, paddingBottom: 35},

  /* STATUS CARD */
  statusCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContent: {flex: 1, marginLeft: 14},
  statusTitle: {fontSize: 15, fontWeight: '900', letterSpacing: -0.2},
  statusDescription: {color: MUTED, fontSize: 10.5, lineHeight: 15, marginTop: 4, fontWeight: '500'},

  /* INFO CARDS */
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 13,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {color: DARK, fontSize: 14, fontWeight: '900', letterSpacing: -0.2},
  cardSubtitle: {color: MUTED, fontSize: 10, marginTop: 2, fontWeight: '600'},

  infoGrid: {flexDirection: 'row', flexWrap: 'wrap', rowGap: 16},
  infoItem: {width: '50%'},
  infoLabel: {color: MUTED, fontSize: 10, fontWeight: '600'},
  infoValue: {color: DARK, fontSize: 12, fontWeight: '800', marginTop: 4, paddingRight: 10},

  /* ITEMS SECTION */
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
  },
  lastProduct: {borderBottomWidth: 0, paddingBottom: 0},
  productImage: {width: 60, height: 60, borderRadius: 12, backgroundColor: '#EAF1EC'},
  productPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productContent: {flex: 1, marginLeft: 12, marginRight: 8},
  productName: {color: DARK, fontSize: 12.5, fontWeight: '800'},
  sellerText: {color: MUTED, fontSize: 10, marginTop: 3, fontWeight: '500'},
  quantityText: {color: GREEN, fontSize: 10.5, fontWeight: '700', marginTop: 4},
  productTotal: {color: DARK, fontSize: 12.5, fontWeight: '900'},

  /* ADDRESS SECTION */
  addressBox: {
    borderRadius: 14,
    backgroundColor: '#FAFBFA',
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  addressTop: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12},
  addressName: {color: DARK, fontSize: 13, fontWeight: '900'},
  addressLine: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8},
  addressText: {flex: 1, color: MUTED, fontSize: 10.5, lineHeight: 15, fontWeight: '500'},
  pincodeText: {color: DARK, fontSize: 11, fontWeight: '800', marginTop: 12},

  /* PRICING SECTION */
  priceRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11},
  priceLabel: {color: MUTED, fontSize: 12, fontWeight: '600'},
  priceValue: {color: DARK, fontSize: 12, fontWeight: '800'},
  freeText: {color: GREEN, fontWeight: '900'},
  divider: {height: 1, backgroundColor: BORDER, marginVertical: 6},
  totalLabel: {color: DARK, fontSize: 14, fontWeight: '900'},
  totalValue: {color: GREEN, fontSize: 18, fontWeight: '900'},

  /* CANCEL BUTTON */
  cancelButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#F0CCCC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  cancelButtonText: {color: RED, fontSize: 13, fontWeight: '900'},
  disabledButton: {opacity: 0.6},

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 7,
  },
  bottomNoteText: {color: MUTED, fontSize: 10, textAlign: 'center', fontWeight: '500'},

  /* LOADING & ERROR STATES */
  loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {color: MUTED, fontSize: 13, marginTop: 12},
  errorContainer: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35},
  errorIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {color: DARK, fontSize: 18, fontWeight: '900', marginTop: 18, letterSpacing: -0.3},
  errorDescription: {color: MUTED, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6},
  retryButton: {
    marginTop: 20,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  retryButtonText: {color: WHITE, fontSize: 12, fontWeight: '800'},
});

export default NurseryOrderDetailsScreen;