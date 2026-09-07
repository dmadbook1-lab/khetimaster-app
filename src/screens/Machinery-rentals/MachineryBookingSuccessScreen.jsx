import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  Check,
  Star,
  MapPin,
  BadgeCheck,
  Phone,
  MessageCircle,
  Copy,
  Home,
  CalendarDays,
  Clock3,
  Timer,
  UserRound,
  Sparkles,
  Truck,
  ClipboardList,
} from 'lucide-react-native';

import { getMachineryBookingById } from '../../redux/slices/machineryBookingSlice';

const { width } = Dimensions.get('window');
const BRIGHT_GREEN = '#1FC45A';
const DARK_GREEN = '#16883E';
const DARK = '#172033';
const MUTED = '#7B8494';
const BORDER = '#E7EBED';
const PAGE_BG = '#F5F7F6';
const PAGE_PADDING = width * 0.037;

// Upscaled font utility
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 3));
};

const formatINR = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = date => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const getEstimatedMinutes = () => Math.floor(Math.random() * 30) + 15;

export default function MachineryBookingSuccessScreen({ navigation, route }) {
  const dispatch = useDispatch();

  const bookingFromRoute = route?.params?.booking;
  const bookingId = route?.params?.bookingId;

  const { selectedBooking } = useSelector(
    state => state.machineryBooking || {},
  );

  useEffect(() => {
    if (bookingId && !bookingFromRoute) {
      dispatch(getMachineryBookingById(bookingId));
    }
  }, [dispatch, bookingId, bookingFromRoute]);

  const booking = bookingFromRoute || selectedBooking || {};

  const machinery = booking.machinery || {};
  const machineryName = machinery.name || 'Machinery';
  
  const machineryImage =
    Array.isArray(machinery.images) && machinery.images.length > 0
      ? { uri: machinery.images[0] }
      : require('../../assets/machinery/sonalika-di-745.jpg');
  
  const enginePower = machinery.enginePower || {};
  const horsepower = enginePower.value
    ? `${enginePower.value} ${enginePower.unit || 'HP'}`
    : 'N/A';
  const driveType = machinery.driveType || 'N/A';
  const fuelType = machinery.fuelType
    ? machinery.fuelType.charAt(0).toUpperCase() + machinery.fuelType.slice(1)
    : 'N/A';
  const rating = machinery.rating || 0;
  const totalReviews = machinery.totalReviews || 0;
  const totalJobsCompleted = machinery.totalJobsCompleted || 0;

  const machineryLocation = [
    machinery.village,
    machinery.district,
    machinery.state,
  ]
    .filter(Boolean)
    .join(', ');

  const owner = machinery.owner || {};
  const ownerName = machinery.ownerName || owner.fullName || 'Owner';
  const ownerPhone = owner.phoneNumber || '';
  
  const ownerImageSource = owner.profileImage
    ? { uri: owner.profileImage }
    : require('../../assets/machinery/owner-1.jpg');

  const displayBookingId =
    booking._id || booking.id
      ? `#${String(booking._id || booking.id).slice(-8).toUpperCase()}`
      : 'N/A';

  const bookingDate = booking.bookingDate;
  const startTime = booking.startTime || 'N/A';
  const duration = booking.duration || 0;
  const durationUnit = booking.durationUnit || 'hours';

  const grandTotal = booking.totalAmount || 0;
  const farmName = booking.farmName || 'Your Farm';
  const farmerNotes = booking.farmerNotes || '';
  const workType = booking.workType || 'Cultivation';
  const status = booking.status || 'pending';

  const estimatedMinutes = getEstimatedMinutes();

  const handleViewBookings = () => {
    navigation.navigate('MachineryMyBookings');
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Bazaar' }],
    });
  };

  const handleCallOwner = () => {
    if (!ownerPhone) {
      Alert.alert('Contact Unavailable', 'Owner phone not available.');
      return;
    }
    Linking.openURL(`tel:${ownerPhone}`).catch(() =>
      Alert.alert('Error', 'Could not open dialer.'),
    );
  };

  const handleChatOwner = () => {
    Alert.alert('Chat', 'Chat feature coming soon.');
  };

  const handleCopyBookingId = () => {
    Alert.alert('Booking ID', `${displayBookingId} — Copy manually.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={machineryImage}
          style={styles.hero}
          resizeMode="cover">
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.12)', PAGE_BG]}
            locations={[0, 0.53, 1]}
            style={styles.heroGradient}
          />
        </ImageBackground>

        <View style={styles.successCircleOuter}>
          <View style={styles.successCircle}>
            <Check size={rf(38)} color="#FFFFFF" strokeWidth={3} />
          </View>
        </View>

        <View style={styles.successTextBox}>
          <Text style={styles.successTitle}>
            {status === 'pending' ? 'Request Sent! 🎉' : 'Booking Confirmed! 🎉'}
          </Text>

          <Text style={styles.successDescription}>
            {status === 'pending'
              ? 'Your request has been sent to the owner.\nYou will be notified once confirmed.'
              : 'Your machinery has been successfully reserved.\nThe owner has been notified and is\npreparing for dispatch.'}
          </Text>
        </View>

        <View style={styles.pageContent}>
          <Text style={styles.sectionTitle}>Assigned Machine</Text>

          <AssignedMachineCard
            machineryName={machineryName}
            machineryImage={machineryImage}
            horsepower={horsepower}
            driveType={driveType}
            fuelType={fuelType}
            rating={rating}
            totalReviews={totalReviews}
            totalJobsCompleted={totalJobsCompleted}
            location={machineryLocation}
            ownerName={ownerName}
            ownerImageSource={ownerImageSource}
            status={status}
          />

          {status !== 'pending' && (
            <>
              <Text style={styles.sectionTitle}>Estimated Arrival</Text>
              <ArrivalCard
                minutes={estimatedMinutes}
                startTime={startTime}
                bookingDate={bookingDate}
                farmName={farmName}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Owner Profile</Text>

          <OwnerProfileCard
            ownerName={ownerName}
            ownerImageSource={ownerImageSource}
            rating={rating}
            totalJobsCompleted={totalJobsCompleted}
            onCall={handleCallOwner}
            onChat={handleChatOwner}
          />

          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <BookingSummaryCard
            bookingId={displayBookingId}
            farmName={farmName}
            bookingDate={bookingDate}
            startTime={startTime}
            duration={duration}
            durationUnit={durationUnit}
            workType={workType}
            grandTotal={grandTotal}
            onCopy={handleCopyBookingId}
          />

          {farmerNotes ? (
            <>
              <Text style={styles.sectionTitle}>Your Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{farmerNotes}</Text>
              </View>
            </>
          ) : null}

          <AIAlertCard workType={workType} />

          <Text style={styles.sectionTitle}>Booking Progress</Text>

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleBackToHome}
          style={styles.homeButton}>
          <Home size={rf(19)} color={BRIGHT_GREEN} strokeWidth={2.4} />
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleViewBookings}
          style={styles.viewBookingsButton}>
          <ClipboardList size={rf(19)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.viewBookingsButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function AssignedMachineCard({
  machineryName,
  machineryImage,
  horsepower,
  driveType,
  fuelType,
  rating,
  totalReviews,
  totalJobsCompleted,
  location,
  ownerName,
  ownerImageSource,
  status,
}) {
  const statusLabel =
    status === 'pending'
      ? 'Pending'
      : status === 'confirmed'
      ? 'Confirmed'
      : status === 'completed'
      ? 'Completed'
      : 'Assigned';

  const statusColor = status === 'pending' ? '#F59E0B' : BRIGHT_GREEN;
  const statusBg = status === 'pending' ? '#FEF3C7' : '#EAFBF0';

  return (
    <View style={styles.machineCard}>
      <Image
        source={machineryImage}
        style={styles.machineImage}
        resizeMode="cover"
      />

      <View style={[styles.assignedBadge, { backgroundColor: statusBg }]}>
        <View style={[styles.assignedDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.assignedText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>

      <View style={styles.machineContent}>
        <Text style={styles.machineName}>{machineryName}</Text>

        <Text style={styles.machineSpecs}>
          {horsepower} · {driveType} · {fuelType}
        </Text>

        <View style={styles.machineMetaRow}>
          <Star size={rf(13)} color="#FACC15" fill="#FACC15" />
          <Text style={styles.machineRating}>
            {rating > 0 ? rating.toFixed(1) : 'New'}
          </Text>
          <Text style={styles.machineReviews}>({totalReviews})</Text>

          {location ? (
            <>
              <MapPin size={rf(13)} color="#EF4444" strokeWidth={2.3} />
              <Text style={styles.machineDistance} numberOfLines={1}>
                {location}
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.machineDivider} />

        <View style={styles.ownerStrip}>
          <Image source={ownerImageSource} style={styles.ownerSmallImage} />

          <View style={styles.ownerStripContent}>
            <Text style={styles.ownerStripName}>{ownerName}</Text>
            <Text style={styles.ownerStripSub}>
              Verified Partner · {totalJobsCompleted} Jobs
            </Text>
          </View>

          <View style={styles.verifiedBadge}>
            <BadgeCheck size={rf(12)} color="#2563EB" strokeWidth={2.5} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ArrivalCard({ minutes, startTime, bookingDate, farmName }) {
  return (
    <LinearGradient
      colors={['#158B3D', '#16883E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.arrivalCard}>
      <View style={styles.arrivalIconBox}>
        <Truck size={rf(28)} color="#31D46A" strokeWidth={2.3} />
      </View>

      <View style={styles.arrivalContent}>
        <Text style={styles.arrivalLabel}>
          ARRIVING AT {farmName.toUpperCase()}
        </Text>
        <Text style={styles.arrivalTime}>{startTime}</Text>
        <Text style={styles.arrivalDate}>{formatDate(bookingDate)}</Text>
      </View>

      <View style={styles.minutesBox}>
        <Text style={styles.minutesValue}>~{minutes}</Text>
        <Text style={styles.minutesLabel}>MIN AWAY</Text>
      </View>
    </LinearGradient>
  );
}

function OwnerProfileCard({
  ownerName,
  ownerImageSource,
  rating,
  totalJobsCompleted,
  onCall,
  onChat,
}) {
  return (
    <View style={styles.ownerCard}>
      <View style={styles.ownerTopRow}>
        <Image source={ownerImageSource} style={styles.ownerImage} />

        <View style={styles.ownerDetails}>
          <Text style={styles.ownerName}>{ownerName}</Text>
          <Text style={styles.ownerCompany}>Verified Partner</Text>

          <View style={styles.ownerMetaRow}>
            <Star size={rf(13)} color="#FACC15" fill="#FACC15" />
            <Text style={styles.ownerRating}>
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </Text>

            <View style={styles.ownerSeparator} />

            <Text style={styles.ownerBookings}>
              {totalJobsCompleted}+ Jobs
            </Text>

            <View style={styles.ownerSeparator} />

            <Text style={styles.ownerVerified}>✓ Verified</Text>
          </View>
        </View>
      </View>

      <View style={styles.ownerActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCall}
          style={styles.callButton}>
          <Phone size={rf(18)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onChat}
          style={styles.chatButton}>
          <MessageCircle size={rf(18)} color={BRIGHT_GREEN} strokeWidth={2.4} />
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BookingSummaryCard({
  bookingId,
  farmName,
  bookingDate,
  startTime,
  duration,
  durationUnit,
  workType,
  grandTotal,
  onCopy,
}) {
  const rows = [
    { id: 'farm', label: 'Farm Name', value: farmName, Icon: Home },
    {
      id: 'date',
      label: 'Booking Date',
      value: formatDate(bookingDate),
      Icon: CalendarDays,
    },
    { id: 'time', label: 'Start Time', value: startTime, Icon: Clock3 },
    {
      id: 'duration',
      label: 'Duration',
      value: `${duration} ${durationUnit}`,
      Icon: Timer,
    },
    { id: 'work', label: 'Work Type', value: workType, Icon: UserRound },
  ];

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCopy}
          style={styles.copyButton}>
          <Copy size={rf(14)} color={BRIGHT_GREEN} strokeWidth={2.4} />
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRows}>
        {rows.map(item => {
          const Icon = item.Icon;
          return (
            <View key={item.id} style={styles.summaryRow}>
              <Icon size={rf(16)} color="#98A1AF" strokeWidth={2.2} />
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          );
        })}

        <View style={styles.summaryDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatINR(grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

function AIAlertCard({ workType }) {
  return (
    <LinearGradient
      colors={['#158B3D', '#18A84A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.aiCard}>
      <View style={styles.aiCircle} />

      <View style={styles.aiBadge}>
        <Sparkles size={rf(12)} color="#FFFFFF" strokeWidth={2.3} />
        <Text style={styles.aiBadgeText}>AI Reminder</Text>
      </View>

      <Text style={styles.aiTitle}>Smart Farming Alert</Text>

      <Text style={styles.aiText}>
        "Your {workType.toLowerCase()} work is scheduled during optimal soil
        conditions. Ensure the operator is briefed on your farm layout for
        maximum efficiency and safety."
      </Text>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100, backgroundColor: PAGE_BG },
  hero: { width: '100%', height: width * 0.59 },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  successCircleOuter: {
    alignSelf: 'center',
    width: 78,
    height: 78,
    marginTop: -40,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRIGHT_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  successCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: BRIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextBox: {
    paddingTop: 22,
    paddingBottom: 26,
    alignItems: 'center',
  },
  successTitle: { fontSize: rf(24), fontWeight: '900', color: DARK },
  successDescription: {
    marginTop: 10,
    fontSize: rf(14),
    lineHeight: rf(20),
    color: MUTED,
    fontWeight: '500',
    textAlign: 'center',
  },
  pageContent: { paddingHorizontal: PAGE_PADDING },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  machineCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  machineImage: { width: '100%', height: 180 },
  assignedBadge: {
    position: 'absolute',
    right: 14,
    top: 189,
    height: 25,
    paddingHorizontal: 9,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  assignedDot: { width: 6, height: 6, borderRadius: 3 },
  assignedText: { fontSize: rf(9), fontWeight: '900' },
  machineContent: { padding: 14 },
  machineName: { fontSize: rf(18), fontWeight: '900', color: DARK },
  machineSpecs: {
    marginTop: 4,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  machineMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  machineRating: { fontSize: rf(11), fontWeight: '900', color: DARK },
  machineReviews: {
    marginRight: 5,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },
  machineDistance: {
    flex: 1,
    marginRight: 5,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },
  machineDivider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: '#EEF1F2',
  },
  ownerStrip: { flexDirection: 'row', alignItems: 'center' },
  ownerSmallImage: { width: 36, height: 36, borderRadius: 18 },
  ownerStripContent: { flex: 1, marginLeft: 10 },
  ownerStripName: { fontSize: rf(12), fontWeight: '900', color: DARK },
  ownerStripSub: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },
  verifiedBadge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: { fontSize: rf(9), fontWeight: '800', color: '#2563EB' },
  arrivalCard: {
    minHeight: 90,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  arrivalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalContent: { flex: 1, marginLeft: 14 },
  arrivalLabel: { fontSize: rf(10), fontWeight: '700', color: '#BBF7D0' },
  arrivalTime: {
    marginTop: 3,
    fontSize: rf(21),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  arrivalDate: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '500',
    color: '#BBF7D0',
  },
  minutesBox: {
    width: 68,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesValue: { fontSize: rf(18), fontWeight: '900', color: '#FFFFFF' },
  minutesLabel: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  ownerCard: {
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  ownerTopRow: { flexDirection: 'row', alignItems: 'center' },
  ownerImage: { width: 62, height: 62, borderRadius: 31 },
  ownerDetails: { flex: 1, marginLeft: 14 },
  ownerName: { fontSize: rf(18), fontWeight: '900', color: DARK },
  ownerCompany: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },
  ownerMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ownerRating: { fontSize: rf(11), fontWeight: '900', color: DARK },
  ownerSeparator: {
    width: 1,
    height: 13,
    marginHorizontal: 6,
    backgroundColor: '#CBD5E1',
  },
  ownerBookings: { fontSize: rf(10), fontWeight: '600', color: MUTED },
  ownerVerified: { fontSize: rf(10), fontWeight: '900', color: BRIGHT_GREEN },
  ownerActions: { marginTop: 14, flexDirection: 'row', gap: 10 },
  callButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  callText: { fontSize: rf(14), fontWeight: '900', color: '#FFFFFF' },
  chatButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  chatText: { fontSize: rf(14), fontWeight: '900', color: BRIGHT_GREEN },
  summaryCard: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  summaryHeader: {
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingIdText: { fontSize: rf(12), fontWeight: '900', color: DARK },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  copyText: { fontSize: rf(10), fontWeight: '900', color: BRIGHT_GREEN },
  summaryRows: { padding: 14 },
  summaryRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: rf(11),
    fontWeight: '500',
    color: MUTED,
  },
  summaryValue: { fontSize: rf(12), fontWeight: '900', color: DARK },
  summaryDivider: {
    height: 1,
    marginTop: 6,
    marginBottom: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#E5E7EB',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: rf(13), fontWeight: '600', color: MUTED },
  totalValue: { fontSize: rf(19), fontWeight: '900', color: DARK },
  notesCard: {
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  notesText: {
    fontSize: rf(11),
    lineHeight: rf(17),
    color: '#4B5563',
    fontWeight: '500',
  },
  aiCard: {
    minHeight: 200,
    marginTop: 22,
    borderRadius: 12,
    padding: 18,
    overflow: 'hidden',
  },
  aiCircle: {
    position: 'absolute',
    right: -42,
    top: -44,
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  aiBadge: {
    alignSelf: 'flex-start',
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiBadgeText: { fontSize: rf(9), fontWeight: '900', color: '#FFFFFF' },
  aiTitle: {
    marginTop: 16,
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiText: {
    marginTop: 12,
    fontSize: rf(12),
    lineHeight: rf(19),
    color: 'rgba(255,255,255,0.90)',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  progressCard: {
    minHeight: 112,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 22,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  progressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  progressStep: { width: 54, alignItems: 'center' },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E1E6EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedProgressCircle: {
    backgroundColor: BRIGHT_GREEN,
    borderColor: BRIGHT_GREEN,
  },
  activeProgressCircle: { borderColor: BRIGHT_GREEN },
  activeProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRIGHT_GREEN,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginTop: 15,
    backgroundColor: '#E1E6EA',
  },
  activeProgressLine: { backgroundColor: BRIGHT_GREEN },
  progressLabel: {
    marginTop: 8,
    fontSize: rf(9),
    lineHeight: rf(11),
    color: '#A5ADB8',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeProgressLabel: { color: BRIGHT_GREEN, fontWeight: '900' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    gap: 12,
  },
  homeButton: {
    flex: 0.6,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.3,
    borderColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  homeButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  viewBookingsButton: {
    flex: 1.4,
    height: 56,
    borderRadius: 14,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: BRIGHT_GREEN,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  viewBookingsButtonText: { fontSize: rf(13), fontWeight: '900', color: '#FFFFFF' },
});