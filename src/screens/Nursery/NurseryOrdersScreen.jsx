import React, {
  useCallback,
  useEffect,
  useState,
  memo,
  useMemo,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock3,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchMyNurseryOrders,
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

/* ---------- Memoized Order Card ---------- */
const OrderCard = memo(({item, onSelect, onCancel, cancelling, getStatusConfig, formatDate}) => {
  const orderId = item?._id || item?.id;
  const status = getStatusConfig(item?.orderStatus);
  const StatusIcon = status.icon;

  const itemCount = useMemo(() => {
    return item?.items?.reduce((sum, orderItem) => sum + Number(orderItem?.quantity || 0), 0) || 0;
  }, [item?.items]);

  const total = Number(item?.total || 0);
  const canCancel = item?.orderStatus === 'PENDING' || item?.orderStatus === 'CONFIRMED';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.orderCard}
      onPress={() => onSelect(orderId)}>
      
      {/* TOP */}
      <View style={styles.orderTop}>
        <View style={styles.orderIcon}>
          <Package size={20} color={GREEN} />
        </View>

        <View style={styles.orderIdentity}>
          <Text style={styles.orderNumber}>
            Order #{String(orderId || '').slice(-8).toUpperCase()}
          </Text>

          <View style={styles.dateRow}>
            <CalendarDays size={11} color={MUTED} />
            <Text style={styles.dateText}>{formatDate(item?.createdAt)}</Text>
          </View>
        </View>

        <ChevronRight size={18} color="#A1A8A5" />
      </View>

      {/* STATUS */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
          <StatusIcon size={12} color={status.color} />
          <Text style={[styles.statusText, {color: status.color}]}>
            {status.label}
          </Text>
        </View>

        <View style={styles.codBadge}>
          <Text style={styles.codBadgeText}>COD</Text>
        </View>
      </View>

      {/* DETAILS */}
      <View style={styles.orderDetails}>
        <View>
          <Text style={styles.detailLabel}>Items</Text>
          <Text style={styles.detailValue}>{itemCount}</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.orderArrow}>
          <Text style={styles.viewText}>View Details</Text>
          <ChevronRight size={13} color={GREEN} />
        </View>
      </View>

      {/* CANCEL */}
      {canCancel && (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={cancelling}
          style={styles.cancelButton}
          onPress={(event) => {
            event.stopPropagation();
            onCancel(item);
          }}>
          {cancelling ? (
            <ActivityIndicator size="small" color={RED} />
          ) : (
            <XCircle size={14} color={RED} />
          )}
          <Text style={styles.cancelText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const NurseryOrdersScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const {orders = [], loading, cancelling, error} = useSelector(
    state => state.nurseryOrder,
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyNurseryOrders());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMyNurseryOrders()).unwrap();
    } catch (err) {
      console.log('Orders refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleCancel = useCallback((order) => {
    const orderId = order?._id || order?.id;
    if (!orderId) return;

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
              Alert.alert('Order cancelled', 'Your nursery order has been cancelled.');
            } catch (err) {
              Alert.alert('Unable to cancel', err?.message || 'Unable to cancel this order.');
            }
          },
        },
      ],
    );
  }, [dispatch]);

  const getStatusConfig = useCallback((status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          color: GREEN,
          bg: LIGHT_GREEN,
          icon: CircleCheck,
        };
      case 'DISPATCHED':
        return {
          label: 'Dispatched',
          color: '#3678C5',
          bg: '#EAF2FC',
          icon: Package,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          color: ORANGE,
          bg: '#FFF4E3',
          icon: Truck,
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          color: GREEN,
          bg: LIGHT_GREEN,
          icon: CircleCheck,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: RED,
          bg: '#FFF0F0',
          icon: XCircle,
        };
      case 'PENDING':
      default:
        return {
          label: 'Pending',
          color: ORANGE,
          bg: '#FFF4E3',
          icon: Clock3,
        };
    }
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'Date unavailable';
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'Date unavailable';
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const handleSelectOrder = useCallback((orderId) => {
    navigation.navigate('NurseryOrderDetails', {orderId});
  }, [navigation]);

  const renderOrder = useCallback(({item}) => (
    <OrderCard
      item={item}
      onSelect={handleSelectOrder}
      onCancel={handleCancel}
      cancelling={cancelling}
      getStatusConfig={getStatusConfig}
      formatDate={formatDate}
    />
  ), [handleSelectOrder, handleCancel, cancelling, getStatusConfig, formatDate]);

  const keyExtractor = useCallback((item, index) => String(item?._id || item?.id || index), []);

  const ListEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingTitle}>Loading your orders...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Package size={40} color={GREEN} />
        </View>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyText}>
          Your plant orders will appear here after you place an order.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.shopButton}
          onPress={() => navigation.navigate('NurseryHome')}>
          <Text style={styles.shopButtonText}>Browse Plants</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, navigation]);

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
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>Nursery purchases</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.refreshButton}
          onPress={handleRefresh}>
          <RefreshCw size={18} color={GREEN} />
        </TouchableOpacity>
      </View>

      {error && !loading ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Unable to load orders.</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
        ListEmptyComponent={ListEmpty}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
      />
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ERROR */
  errorBanner: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F0CCCC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {color: RED, fontSize: 11, fontWeight: '600'},
  retryText: {color: GREEN, fontSize: 11, fontWeight: '900'},

  /* LIST CONTENT */
  listContent: {padding: 16, paddingBottom: 30},
  emptyListContent: {flexGrow: 1},

  /* ORDER CARD */
  orderCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 12,
  },
  orderTop: {flexDirection: 'row', alignItems: 'center'},
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderIdentity: {flex: 1, marginLeft: 12},
  orderNumber: {color: DARK, fontSize: 13.5, fontWeight: '900', letterSpacing: -0.2},
  dateRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5},
  dateText: {color: MUTED, fontSize: 10, fontWeight: '600'},

  /* STATUS ROW */
  statusRow: {marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },
  statusText: {fontSize: 9.5, fontWeight: '800'},
  codBadge: {paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, backgroundColor: '#F1F3F2'},
  codBadgeText: {color: MUTED, fontSize: 9.5, fontWeight: '900'},

  /* ORDER DETAILS */
  orderDetails: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF1EF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {color: MUTED, fontSize: 9.5, fontWeight: '600'},
  detailValue: {color: DARK, fontSize: 13.5, fontWeight: '900', marginTop: 3},
  totalValue: {color: GREEN, fontSize: 13.5, fontWeight: '900', marginTop: 3},
  verticalDivider: {width: 1, height: 26, backgroundColor: BORDER, marginHorizontal: 20},
  orderArrow: {marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3},
  viewText: {color: GREEN, fontSize: 10.5, fontWeight: '800'},

  /* CANCEL BUTTON */
  cancelButton: {
    marginTop: 13,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#F3D2D2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelText: {color: RED, fontSize: 11, fontWeight: '800'},

  /* EMPTY */
  loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingTitle: {color: DARK, fontSize: 13, fontWeight: '700', marginTop: 12},
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {color: DARK, fontSize: 19, fontWeight: '900', marginTop: 18, letterSpacing: -0.3},
  emptyText: {color: MUTED, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 7},
  shopButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {color: WHITE, fontSize: 12, fontWeight: '800'},
});

export default NurseryOrdersScreen;