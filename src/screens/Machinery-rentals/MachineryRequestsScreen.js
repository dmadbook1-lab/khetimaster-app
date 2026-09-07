import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock3,
  Tractor,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMachineryRequestsApi,
  acceptMachineryBookingApi,
  rejectMachineryBookingApi,
} from '../../api/machineryBookingApi';
import { getMyMachineryApi } from '../../api/machineryApi';

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
const LIGHT_GREEN = '#F0FDF4';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1595107144955-ccff0db9ffbc?auto=format&fit=crop&q=80&w=300';

export default function MachineryRequestsScreen({ navigation }) {
  const [hasMachineryRegistered, setHasMachineryRegistered] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const checkRegistrationAndLoadRequests = async () => {
    try {
      // 1. Check if user is registered as a machinery owner
      const machResponse = await getMyMachineryApi();
      const userFleet = machResponse?.machinery || [];

      if (!Array.isArray(userFleet) || userFleet.length === 0) {
        setHasMachineryRegistered(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setHasMachineryRegistered(true);

      // 2. Load incoming requests
      const reqResponse = await getMachineryRequestsApi();
      const data = reqResponse?.requests || reqResponse?.data || [];
      const pendingRequests = Array.isArray(data)
        ? data.filter(
            item =>
              String(item?.status || 'pending').toLowerCase() === 'pending',
          )
        : [];
      setRequests(pendingRequests);
    } catch (error) {
      console.log('LOAD REQUESTS ERROR:', error?.response?.data || error?.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to load booking requests.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkRegistrationAndLoadRequests();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    checkRegistrationAndLoadRequests();
  };

  const handleAccept = booking => {
    const bookingId = booking?._id || booking?.id;
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing.');
      return;
    }

    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept and confirm this machinery booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setProcessingId(bookingId);
              const response = await acceptMachineryBookingApi(bookingId);
              if (response?.success === false) {
                throw new Error(response?.message || 'Unable to accept booking.');
              }
              setRequests(prev =>
                prev.filter(item => String(item?._id || item?.id) !== String(bookingId)),
              );
              Alert.alert('Booking Confirmed', 'The machinery booking has been accepted.');
            } catch (error) {
              console.log('ACCEPT ERROR:', error?.response?.data || error?.message);
              Alert.alert(
                'Unable to Accept',
                error?.response?.data?.message || error?.message || 'Something went wrong.',
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const handleReject = booking => {
    const bookingId = booking?._id || booking?.id;
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing.');
      return;
    }

    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(bookingId);
              const response = await rejectMachineryBookingApi(bookingId);
              if (response?.success === false) {
                throw new Error(response?.message || 'Unable to reject booking.');
              }
              setRequests(prev =>
                prev.filter(item => String(item?._id || item?.id) !== String(bookingId)),
              );
              Alert.alert('Booking Rejected', 'The booking request has been rejected.');
            } catch (error) {
              console.log('REJECT ERROR:', error?.response?.data || error?.message);
              Alert.alert(
                'Unable to Reject',
                error?.response?.data?.message || error?.message || 'Something went wrong.',
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const getFarmerName = booking =>
    booking?.farmer?.fullName ||
    booking?.farmer?.name ||
    booking?.farmerName ||
    'Farmer';

  const getMachineryName = booking =>
    booking?.machinery?.name || booking?.machineryName || 'Machinery';

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
    const total = booking?.totalAmount ?? booking?.basePrice ?? 0;
    return Number(total).toLocaleString('en-IN');
  };

  const renderRequest = ({ item }) => {
    const bookingId = item?._id || item?.id;
    const processing = String(processingId) === String(bookingId);
    const imgUri =
      Array.isArray(item?.machinery?.images) && item.machinery.images.length > 0
        ? item.machinery.images[0]
        : FALLBACK_IMG;

    return (
      <View style={styles.card}>
        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: imgUri }} style={styles.machineThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.farmerName} numberOfLines={1}>
              {getFarmerName(item)}
            </Text>
            <Text style={styles.bookingLabel}>
              Request for: {getMachineryName(item)}
            </Text>
          </View>

          <View style={styles.pendingPill}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>

        {/* LOCATION */}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <MapPin size={rf(17)} color={GREEN} strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>{item?.farmName || 'Farm Delivery'}</Text>
            <Text style={styles.infoSub} numberOfLines={2}>
              {getFarmLocation(item)}
            </Text>
          </View>
        </View>

        {/* INFO GRID */}
        <View style={styles.infoGrid}>
          <View style={styles.smallInfo}>
            <CalendarDays size={rf(17)} color={GREEN} strokeWidth={2.3} />
            <View>
              <Text style={styles.smallLabel}>Date</Text>
              <Text style={styles.smallValue}>{getDate(item)}</Text>
            </View>
          </View>

          <View style={styles.smallInfo}>
            <Clock3 size={rf(17)} color={GREEN} strokeWidth={2.3} />
            <View>
              <Text style={styles.smallLabel}>Duration</Text>
              <Text style={styles.smallValue}>{getDuration(item)}</Text>
            </View>
          </View>
        </View>

        {/* IMPLEMENT / WORK */}
        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Selected Implement</Text>
          <Text style={styles.activityValue} numberOfLines={1}>
            {item?.selectedImplement || 'Standard'}
          </Text>
        </View>

        {/* START TIME */}
        {getTime(item) ? (
          <View style={styles.timeRow}>
            <Clock3 size={rf(15)} color={MUTED} />
            <Text style={styles.timeText}>Start time: {getTime(item)}</Text>
          </View>
        ) : null}

        {/* TOTAL */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Booking Amount</Text>
          <Text style={styles.totalValue}>₹{getTotal(item)}</Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            disabled={processing}
            activeOpacity={0.85}
            onPress={() => handleReject(item)}
            style={styles.rejectButton}
          >
            {processing ? (
              <ActivityIndicator size="small" color={RED} />
            ) : (
              <X size={rf(18)} color={RED} strokeWidth={2.5} />
            )}
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={processing}
            activeOpacity={0.85}
            onPress={() => handleAccept(item)}
            style={styles.acceptButton}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={rf(18)} color="#FFFFFF" strokeWidth={2.7} />
            )}
            <Text style={styles.acceptText}>Accept Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.emptyTitle}>Loading requests...</Text>
        </View>
      );
    }

    // Unregistered owner message
    if (!hasMachineryRegistered) {
      return (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: '#FEF3C7' }]}>
            <ShieldAlert size={rf(30)} color="#D97706" strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>Machinery Registration Required</Text>
          <Text style={styles.emptyText}>
            First register your machinery for rent. Once registered, farmers in your area can discover your listings and send booking requests.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ProvideServiceStep1')}
            style={styles.registerBtn}
          >
            <Text style={styles.registerBtnText}>Register Your Machinery</Text>
            <ArrowRight size={rf(16)} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Check size={rf(30)} color={GREEN} strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>No Booking Requests</Text>
        <Text style={styles.emptyText}>
          New booking requests from farmers will appear here.
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
          <Text style={styles.headerTitle}>Booking Requests</Text>
          <Text style={styles.headerSub}>Requests from farmers</Text>
        </View>

        {requests.length > 0 ? (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{requests.length}</Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={requests}
        keyExtractor={item => String(item?._id || item?.id)}
        renderItem={renderRequest}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 14,
          paddingBottom: 40,
          flexGrow: 1,
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
  headerBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
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
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  farmerName: {
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
  pendingPill: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#EA580C',
  },
  infoRow: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  infoSub: {
    marginTop: 3,
    fontSize: rf(11),
    fontWeight: '600',
    color: MUTED,
  },
  infoGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  smallInfo: {
    flex: 1,
    minHeight: 64,
    padding: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  smallLabel: {
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  smallValue: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  activityRow: {
    marginTop: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '600',
  },
  activityValue: {
    maxWidth: '65%',
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
    textAlign: 'right',
  },
  timeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: rf(18),
    color: GREEN,
    fontWeight: '900',
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 9,
  },
  rejectButton: {
    flex: 0.8,
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rejectText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: RED,
  },
  acceptButton: {
    flex: 1.5,
    height: 46,
    borderRadius: 11,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  acceptText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
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
  registerBtn: {
    marginTop: 18,
    backgroundColor: GREEN,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: rf(13),
    fontWeight: '900',
  },
});