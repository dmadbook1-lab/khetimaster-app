import React from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Circle,
  ArrowLeft,
  LocateFixed,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7B8494';
const BORDER = '#E7EBED';
const PAGE_BG = '#F5F7F6';
const PAGE_PADDING = width * 0.037;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const DEFAULT_MACHINE = {
  name: 'Sonalika DI 745',
  horsepower: '45 HP',
  driveType: '2WD',
  fuelType: 'Diesel',
  rating: '4.8',
  reviews: 128,
  distance: '2.1 km Away',
  owner: 'Patil Agro Services',
  image: require('../../assets/machinery/sonalika-di-745.jpg'),
  ownerImage: require('../../assets/machinery/owner-1.jpg'),
};
const formatINR = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
export default function MachineryBookingSuccessScreen({ navigation, route }) {
  const machine = route?.params?.machine || DEFAULT_MACHINE;
  const hours = route?.params?.hours || 4;
  const includeOperator = route?.params?.includeOperator ?? true;
  const grandTotal = route?.params?.grandTotal || 3880;
  const bookingId = route?.params?.bookingId || '#KMB274618';
  const handleTrackMachinery = () => {
    navigation.navigate('MachineryLiveTracking', {
      machine,
      hours,
      includeOperator,
      grandTotal,
      bookingId,
    });
  };
  const handleBackToBazaar = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Bazaar',
        },
      ],
    });
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={require('../../assets/machinery/machinery-hero.png')}
          style={styles.hero}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.12)',
              '#F5F7F6',
            ]}
            locations={[0, 0.53, 1]}
            style={styles.heroGradient}
          />
        </ImageBackground>

        <View style={styles.successCircleOuter}>
          <View style={styles.successCircle}>
            <Check size={rf(36)} color="#FFFFFF" strokeWidth={3} />
          </View>
        </View>

        <View style={styles.successTextBox}>
          <Text style={styles.successTitle}>Booking Confirmed! 🎉</Text>

          <Text style={styles.successDescription}>
            Your tractor has been successfully reserved.
            {'\n'}The owner has been notified and is
            {'\n'}preparing for dispatch.
          </Text>
        </View>

        <View style={styles.pageContent}>
          <Text style={styles.sectionTitle}>Assigned Machine</Text>

          <AssignedMachineCard machine={machine} />

          <Text style={styles.sectionTitle}>Estimated Arrival</Text>

          <ArrivalCard />

          <Text style={styles.sectionTitle}>Owner Profile</Text>

          <OwnerProfileCard machine={machine} />

          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <BookingSummaryCard
            bookingId={bookingId}
            hours={hours}
            includeOperator={includeOperator}
            grandTotal={grandTotal}
          />

          <AIAlertCard />

          <Text style={styles.sectionTitle}>Booking Progress</Text>

          <BookingProgressCard />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleBackToBazaar}
          style={styles.backBazaarButton}
        >
          <Home size={rf(18)} color={BRIGHT_GREEN} strokeWidth={2.4} />

          <Text style={styles.backBazaarText}>Back to Bazaar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTrackMachinery}
          style={styles.trackButton}
        >
          <MapPin size={rf(18)} color="#FFFFFF" strokeWidth={2.4} />

          <Text style={styles.trackButtonText}>Track Machinery</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
function AssignedMachineCard({ machine }) {
  return (
    <View style={styles.machineCard}>
      <Image
        source={machine.image}
        style={styles.machineImage}
        resizeMode="cover"
      />

      <View style={styles.assignedBadge}>
        <View style={styles.assignedDot} />

        <Text style={styles.assignedText}>Assigned</Text>
      </View>

      <View style={styles.machineContent}>
        <Text style={styles.machineName}>{machine.name}</Text>

        <Text style={styles.machineSpecs}>
          {machine.horsepower} · {machine.driveType} · {machine.fuelType}
        </Text>

        <View style={styles.machineMetaRow}>
          <Star size={rf(12)} color="#FACC15" fill="#FACC15" />

          <Text style={styles.machineRating}>{machine.rating}</Text>

          <Text style={styles.machineReviews}>({machine.reviews})</Text>

          <MapPin size={rf(12)} color="#EF4444" strokeWidth={2.3} />

          <Text style={styles.machineDistance}>{machine.distance}</Text>

          <Text style={styles.machineAvailable}>Available Today</Text>
        </View>

        <View style={styles.machineDivider} />

        <View style={styles.ownerStrip}>
          <Image source={machine.ownerImage} style={styles.ownerSmallImage} />

          <View style={styles.ownerStripContent}>
            <Text style={styles.ownerStripName}>{machine.owner}</Text>

            <Text style={styles.ownerStripSub}>
              Verified Partner · 250+ Bookings
            </Text>
          </View>

          <View style={styles.verifiedBadge}>
            <BadgeCheck size={rf(11)} color="#2563EB" strokeWidth={2.5} />

            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
function ArrivalCard() {
  return (
    <LinearGradient
      colors={['#158B3D', '#16883E']}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 0,
      }}
      style={styles.arrivalCard}
    >
      <View style={styles.arrivalIconBox}>
        <Truck size={rf(27)} color="#31D46A" strokeWidth={2.3} />
      </View>

      <View style={styles.arrivalContent}>
        <Text style={styles.arrivalLabel}>ARRIVING AT PATIL FARM</Text>

        <Text style={styles.arrivalTime}>08:30 AM</Text>

        <Text style={styles.arrivalDate}>Today · Thursday, 26 June 2026</Text>
      </View>

      <View style={styles.minutesBox}>
        <Text style={styles.minutesValue}>~25</Text>

        <Text style={styles.minutesLabel}>MIN AWAY</Text>
      </View>
    </LinearGradient>
  );
}
function OwnerProfileCard({ machine }) {
  return (
    <View style={styles.ownerCard}>
      <View style={styles.ownerTopRow}>
        <Image source={machine.ownerImage} style={styles.ownerImage} />

        <View style={styles.ownerDetails}>
          <Text style={styles.ownerName}>Rajesh Patil</Text>

          <Text style={styles.ownerCompany}>
            Patil Agro Services · Verified Partner
          </Text>

          <View style={styles.ownerMetaRow}>
            <Star size={rf(12)} color="#FACC15" fill="#FACC15" />

            <Text style={styles.ownerRating}>4.9</Text>

            <View style={styles.ownerSeparator} />

            <Text style={styles.ownerBookings}>250+ Bookings</Text>

            <View style={styles.ownerSeparator} />

            <Text style={styles.ownerVerified}>✓ Verified</Text>
          </View>
        </View>
      </View>

      <View style={styles.ownerActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Alert.alert('Call Owner', 'Calling Rajesh Patil...')}
          style={styles.callButton}
        >
          <Phone size={rf(17)} color="#FFFFFF" strokeWidth={2.4} />

          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert('Chat Owner', 'Opening chat with Rajesh Patil.')
          }
          style={styles.chatButton}
        >
          <MessageCircle size={rf(17)} color={BRIGHT_GREEN} strokeWidth={2.4} />

          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
function BookingSummaryCard({ bookingId, hours, includeOperator, grandTotal }) {
  const rows = [
    {
      id: 'farm',
      label: 'Farm Name',
      value: 'Patil Farm',
      Icon: Home,
    },
    {
      id: 'date',
      label: 'Booking Date',
      value: '26 June 2026',
      Icon: CalendarDays,
    },
    {
      id: 'time',
      label: 'Booking Time',
      value: '8:00 AM',
      Icon: Clock3,
    },
    {
      id: 'duration',
      label: 'Duration',
      value: `${hours} Hours`,
      Icon: Timer,
    },
    {
      id: 'operator',
      label: 'Operator',
      value: includeOperator ? 'Included' : 'Not Included',
      Icon: UserRound,
      green: includeOperator,
    },
  ];
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Alert.alert('Copied', `${bookingId} copied.`)}
          style={styles.copyButton}
        >
          <Copy size={rf(13)} color={BRIGHT_GREEN} strokeWidth={2.4} />

          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRows}>
        {rows.map(item => {
          const Icon = item.Icon;
          return (
            <View key={item.id} style={styles.summaryRow}>
              <Icon size={rf(15)} color="#98A1AF" strokeWidth={2.2} />

              <Text style={styles.summaryLabel}>{item.label}</Text>

              <Text
                style={[
                  styles.summaryValue,
                  item.green && styles.greenSummaryValue,
                ]}
              >
                {item.value}
              </Text>
            </View>
          );
        })}

        <View style={styles.summaryDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>

          <Text style={styles.totalValue}>{formatINR(grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}
function AIAlertCard() {
  return (
    <LinearGradient
      colors={['#158B3D', '#18A84A']}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.aiCard}
    >
      <View style={styles.aiCircle} />

      <View style={styles.aiBadge}>
        <Sparkles size={rf(11)} color="#FFFFFF" strokeWidth={2.3} />

        <Text style={styles.aiBadgeText}>AI Reminder</Text>
      </View>

      <Text style={styles.aiTitle}>Smart Farming Alert</Text>

      <Text style={styles.aiText}>
        “Your soybean field has moderate soil moisture. The booked tractor
        should complete cultivation before today’s forecasted rainfall. Optimal
        application window: 8:00 AM – 11:00 AM.”
      </Text>
    </LinearGradient>
  );
}
function BookingProgressCard() {
  const steps = [
    {
      id: 'confirmed',
      label: 'Booking\nConfirmed',
      completed: true,
    },
    {
      id: 'dispatched',
      label: 'Machine\nDispatched',
      active: true,
    },
    {
      id: 'arriving',
      label: 'Arriving',
    },
    {
      id: 'started',
      label: 'Work\nStarted',
    },
    {
      id: 'completed',
      label: 'Completed',
    },
  ];
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressRow}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  step.completed && styles.completedProgressCircle,
                  step.active && styles.activeProgressCircle,
                ]}
              >
                {step.completed ? (
                  <Check size={rf(15)} color="#FFFFFF" strokeWidth={3} />
                ) : step.active ? (
                  <View style={styles.activeProgressDot} />
                ) : null}
              </View>

              <Text
                style={[
                  styles.progressLabel,
                  (step.completed || step.active) && styles.activeProgressLabel,
                ]}
              >
                {step.label}
              </Text>
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index === 0 && styles.activeProgressLine,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: PAGE_BG,
  },
  hero: {
    width: '100%',
    height: width * 0.59,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  successCircleOuter: {
    alignSelf: 'center',
    width: 75,
    height: 75,
    marginTop: -39,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRIGHT_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextBox: {
    paddingTop: 21,
    paddingBottom: 26,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: rf(23),
    fontWeight: '900',
    color: DARK,
  },
  successDescription: {
    marginTop: 10,
    fontSize: rf(13),
    lineHeight: rf(19),
    color: MUTED,
    fontWeight: '500',
    textAlign: 'center',
  },
  pageContent: {
    paddingHorizontal: PAGE_PADDING,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 11,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  machineCard: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  machineImage: {
    width: '100%',
    height: 176,
  },
  assignedBadge: {
    position: 'absolute',
    right: 14,
    top: 189,
    height: 23,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  assignedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRIGHT_GREEN,
  },
  assignedText: {
    fontSize: rf(7),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  machineContent: {
    padding: 13,
  },
  machineName: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  machineSpecs: {
    marginTop: 3,
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '600',
  },
  machineMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  machineRating: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK,
  },
  machineReviews: {
    marginRight: 5,
    fontSize: rf(8),
    fontWeight: '500',
    color: MUTED,
  },
  machineDistance: {
    marginRight: 5,
    fontSize: rf(8),
    fontWeight: '500',
    color: MUTED,
  },
  machineAvailable: {
    fontSize: rf(8),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  machineDivider: {
    height: 1,
    marginVertical: 11,
    backgroundColor: '#EEF1F2',
  },
  ownerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerSmallImage: {
    width: 33,
    height: 33,
    borderRadius: 17,
  },
  ownerStripContent: {
    flex: 1,
    marginLeft: 9,
  },
  ownerStripName: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  ownerStripSub: {
    marginTop: 2,
    fontSize: rf(7),
    fontWeight: '500',
    color: MUTED,
  },
  verifiedBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: rf(7),
    fontWeight: '800',
    color: '#2563EB',
  },
  arrivalCard: {
    minHeight: 86,
    borderRadius: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  arrivalIconBox: {
    width: 50,
    height: 50,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrivalContent: {
    flex: 1,
    marginLeft: 13,
  },
  arrivalLabel: {
    fontSize: rf(8),
    fontWeight: '700',
    color: '#BBF7D0',
  },
  arrivalTime: {
    marginTop: 3,
    fontSize: rf(20),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  arrivalDate: {
    marginTop: 2,
    fontSize: rf(7),
    fontWeight: '500',
    color: '#BBF7D0',
  },
  minutesBox: {
    width: 64,
    height: 60,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesValue: {
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  minutesLabel: {
    marginTop: 2,
    fontSize: rf(6),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  ownerCard: {
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  ownerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  ownerDetails: {
    flex: 1,
    marginLeft: 13,
  },
  ownerName: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  ownerCompany: {
    marginTop: 3,
    fontSize: rf(8),
    fontWeight: '500',
    color: MUTED,
  },
  ownerMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ownerRating: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK,
  },
  ownerSeparator: {
    width: 1,
    height: 12,
    marginHorizontal: 5,
    backgroundColor: '#CBD5E1',
  },
  ownerBookings: {
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },
  ownerVerified: {
    fontSize: rf(8),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  ownerActions: {
    marginTop: 13,
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    flex: 1,
    height: 43,
    borderRadius: 10,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  callText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  chatButton: {
    flex: 1,
    height: 43,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  chatText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  summaryCard: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  summaryHeader: {
    height: 43,
    paddingHorizontal: 13,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingIdText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  copyText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  summaryRows: {
    padding: 13,
  },
  summaryRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    flex: 1,
    marginLeft: 9,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },
  summaryValue: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  greenSummaryValue: {
    color: BRIGHT_GREEN,
  },
  summaryDivider: {
    height: 1,
    marginTop: 4,
    marginBottom: 11,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: rf(12),
    fontWeight: '600',
    color: MUTED,
  },
  totalValue: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  aiCard: {
    minHeight: 215,
    marginTop: 20,
    borderRadius: 8,
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
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiBadgeText: {
    fontSize: rf(7),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiTitle: {
    marginTop: 15,
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiText: {
    marginTop: 11,
    fontSize: rf(11),
    lineHeight: rf(18),
    color: 'rgba(255,255,255,0.90)',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  progressCard: {
    minHeight: 106,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressStep: {
    width: 50,
    alignItems: 'center',
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  activeProgressCircle: {
    borderColor: BRIGHT_GREEN,
  },
  activeProgressDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: BRIGHT_GREEN,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginTop: 14,
    backgroundColor: '#E1E6EA',
  },
  activeProgressLine: {
    backgroundColor: BRIGHT_GREEN,
  },
  progressLabel: {
    marginTop: 7,
    fontSize: rf(7),
    lineHeight: rf(9),
    color: '#A5ADB8',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeProgressLabel: {
    color: BRIGHT_GREEN,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 74,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    gap: 12,
  },
  backBazaarButton: {
    flex: 1,
    height: 53,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.3,
    borderColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  backBazaarText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },
  trackButton: {
    flex: 1,
    height: 53,
    borderRadius: 13,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: BRIGHT_GREEN,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  trackButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
