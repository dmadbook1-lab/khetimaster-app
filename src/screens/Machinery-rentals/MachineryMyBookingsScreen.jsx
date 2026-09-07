import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Tractor,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyMachineryBookingsApi } from '../../api/machineryBookingApi';

const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};

const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const RED = '#EF4444';
const ORANGE = '#EA580C';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1595107144955-ccff0db9ffbc?auto=format&fit=crop&q=80&w=300';

export default function MachineryMyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const response = await getMyMachineryBookingsApi();
      const data =
        response?.bookings || response?.data || response?.results || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('MY MACHINERY BOOKINGS ERROR:', error?.response?.data || error?.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to load your machinery bookings.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getStatus = booking =>
    String(booking?.status || 'pending').toLowerCase();

  const getMachineryName = booking =>
    booking?.machinery?.name || booking?.machineryName || 'Machinery';

  const getCategory = booking =>
    booking?.machinery?.category || booking?.workType || 'Agricultural';

  const getFarmName = booking =>
    booking?.farmName || 'My Farm';

  const getFarmLocation = booking => {
    const loc = [booking?.village, booking?.district, booking?.state]
      .filter(Boolean)
      .join(', ');
    return loc || booking?.address || 'Location not specified';
  };

  const getDate = booking => {
    const date = booking?.bookingDate || booking?.createdAt;
    if (!date) return 'Date not specified';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(date);
    }
  };

  const getTime = booking =>
    booking?.startTime || booking?.time || '';

  const getDuration = booking => {
    if (!booking?.duration) return 'Full Day';
    return `${booking.duration} ${booking.durationUnit || 'hours'}`;
  };

  const getTotal = booking => {
    const total =
      booking?.totalAmount ?? booking?.basePrice ?? 0;
    return Number(total).toLocaleString('en-IN');
  };

  const StatusPill = ({ status }) => {
    if (status === 'confirmed' || status === 'accepted') {
      return (
        <View style={styles.confirmedPill}>
          <CheckCircle2 size={rf(13)} color={GREEN} strokeWidth={2.5} />
          <Text style={styles.confirmedText}>Confirmed</Text>
        </View>
      );
    }
    if (status === 'cancelled') {
      return (
        <View style={styles.cancelledPill}>
          <XCircle size={rf(13)} color={RED} strokeWidth={2.5} />
          <Text style={styles.cancelledText}>Cancelled</Text>
        </View>
      );
    }
    if (status === 'rejected') {
      return (
        <View style={styles.cancelledPill}>
          <XCircle size={rf(13)} color={RED} strokeWidth={2.5} />
          <Text style={styles.cancelledText}>Rejected</Text>
        </View>
      );
    }
    if (status === 'completed') {
      return (
        <View style={styles.confirmedPill}>
          <CheckCircle2 size={rf(13)} color={GREEN} strokeWidth={2.5} />
          <Text style={styles.confirmedText}>Completed</Text>
        </View>
      );
    }
    return (
      <View style={styles.pendingPill}>
        <Clock3 size={rf(12)} color={ORANGE} strokeWidth={2.5} />
        <Text style={styles.pendingText}>Pending</Text>
      </View>
    );
  };

  const renderBooking = ({ item }) => {
    const status = getStatus(item);
    const imgUri =
      Array.isArray(item?.machinery?.images) && item.machinery.images.length > 0
        ? item.machinery.images[0]
        : FALLBACK_IMG;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('MachineryBookingSuccess', {
            booking: item,
            bookingId: item._id || item.id,
          });
        }}
        style={styles.card}
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: imgUri }} style={styles.machineThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.machineName} numberOfLines={1}>
              {getMachineryName(item)}
            </Text>
            <Text style={styles.bookingLabel}>{getCategory(item)}</Text>
          </View>
          <StatusPill status={status} />
        </View>

        {/* LOCATION */}
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <MapPin size={rf(18)} color={GREEN} strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.farmName}>{getFarmName(item)}</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {getFarmLocation(item)}
            </Text>
          </View>
        </View>

        {/* DETAILS GRID */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <CalendarDays size={rf(17)} color={GREEN} strokeWidth={2.3} />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{getDate(item)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock3 size={rf(17)} color={GREEN} strokeWidth={2.3} />
            <View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{getDuration(item)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Tractor size={rf(17)} color={GREEN} strokeWidth={2.3} />
            <View>
              <Text style={styles.detailLabel}>Implement</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item?.selectedImplement || 'Standard'}
              </Text>
            </View>
          </View>
        </View>

        {/* TIME ROW */}
        {getTime(item) ? (
          <View style={styles.timeRow}>
            <Clock3 size={rf(15)} color={MUTED} strokeWidth={2} />
            <Text style={styles.timeText}>Start time: {getTime(item)}</Text>
          </View>
        ) : null}

        {/* BOTTOM ROW */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.amountLabel}>Booking Amount</Text>
            <Text style={styles.amount}>₹{getTotal(item)}</Text>
          </View>

          {status === 'pending' && (
            <View style={styles.waitingMessage}>
              <Clock3 size={rf(15)} color={ORANGE} />
              <Text style={styles.waitingText}>Waiting for acceptance</Text>
            </View>
          )}

          {(status === 'confirmed' || status === 'accepted') && (
            <View style={styles.confirmedMessage}>
              <CheckCircle2 size={rf(16)} color={GREEN} />
              <Text style={styles.confirmedMessageText}>Booking Confirmed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.emptyTitle}>Loading bookings...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <ClipboardList size={rf(30)} color={GREEN} strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
        <Text style={styles.emptyText}>
          Your machinery bookings will appear here after you book a machine.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>Track your machinery bookings</Text>
        </View>

        <View style={styles.countPill}>
          <Text style={styles.countText}>{bookings.length}</Text>
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={item => String(item?._id || item?.id)}
        renderItem={renderBooking}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 14,
          paddingBottom: 40,
          flexGrow: bookings.length === 0 ? 1 : 0,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={GREEN}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  headerSub: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '600',
    color: MUTED,
  },
  countPill: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  card: {
    marginBottom: 14,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  machineThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  machineName: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  bookingLabel: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  confirmedPill: {
    paddingHorizontal: 10,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  confirmedText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: GREEN,
  },
  pendingPill: {
    paddingHorizontal: 10,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pendingText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: ORANGE,
  },
  cancelledPill: {
    paddingHorizontal: 10,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cancelledText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: RED,
  },
  locationCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  farmName: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  locationText: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  detailsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  detailItem: {
    flex: 1,
    minHeight: 64,
    padding: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailLabel: {
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  detailValue: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  timeRow: {
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '700',
  },
  bottomRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  amount: {
    marginTop: 2,
    fontSize: rf(18),
    color: GREEN,
    fontWeight: '900',
  },
  waitingMessage: {
    paddingHorizontal: 9,
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  waitingText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: ORANGE,
  },
  confirmedMessage: {
    paddingHorizontal: 9,
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  confirmedMessageText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: GREEN,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 7,
    fontSize: rf(12),
    lineHeight: rf(18),
    color: MUTED,
    fontWeight: '600',
    textAlign: 'center',
  },
});