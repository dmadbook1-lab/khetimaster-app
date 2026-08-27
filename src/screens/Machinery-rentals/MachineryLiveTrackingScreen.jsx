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
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  UserRound,
  Tractor,
  Home,
  Clock3,
  MapPin,
  Truck,
  Phone,
  MessageCircle,
  Navigation,
  Check,
  Copy,
  Building2,
  Timer,
  Zap,
  CircleDollarSign,
  Sparkles,
  Grid2X2,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Share2,
  CircleX,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7B8494';
const BORDER = '#E7EBED';
const PAGE_BG = '#F8FAF9';
const ORANGE = '#F97316';
const RED = '#EF4444';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const DEFAULT_MACHINE = {
  name: 'Sonalika DI 745',
  owner: 'Patil Agro Services',
  ownerImage: require('../../assets/machinery/owner-1.jpg'),
};

const formatINR = value =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function MachineryLiveTrackingScreen({
  navigation,
  route,
}) {
  const machine = route?.params?.machine || DEFAULT_MACHINE;
  const hours = route?.params?.hours || 4;
  const includeOperator =
    route?.params?.includeOperator ?? true;

  const grandTotal =
    route?.params?.grandTotal || 3880;

  const bookingId =
    route?.params?.bookingId || '#KMB274618';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'Keep Booking',
          style: 'cancel',
        },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Cancellation Requested',
              'Your booking cancellation request has been submitted.',
            ),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <ArrowLeft
            size={rf(22)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Live Tracking
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              'Driver Profile',
              'Driver profile can be opened here.',
            )
          }
          style={styles.headerButton}>
          <UserRound
            size={rf(21)}
            color={DARK}
            strokeWidth={2.3}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <TrackingMapCard machine={machine} />

        <RouteStatusCard machine={machine} />

        <Text style={styles.sectionTitle}>
          Driver & Owner
        </Text>

        <DriverCard machine={machine} />

        <Text style={styles.sectionTitle}>
          Booking Timeline
        </Text>

        <TimelineCard />

        <Text style={styles.sectionTitle}>
          Booking Details
        </Text>

        <BookingDetailsCard
          machine={machine}
          hours={hours}
          includeOperator={includeOperator}
          grandTotal={grandTotal}
          bookingId={bookingId}
        />

        <AIFieldInsightCard />

        <Text style={styles.sectionTitle}>
          Farm Weather Now
        </Text>

        <WeatherGrid />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() =>
            Alert.alert(
              'Share Tracking',
              'Live tracking link can be shared here.',
            )
          }
          style={styles.shareButton}>
          <Share2
            size={rf(18)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />

          <Text style={styles.shareButtonText}>
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCancel}
          style={styles.cancelButton}>
          <CircleX
            size={rf(18)}
            color={RED}
            strokeWidth={2.4}
          />

          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TrackingMapCard({machine}) {
  return (
    <View style={styles.mapCard}>
      <Image
        source={require('../../assets/machinery/tracking-map.png')}
        style={styles.mapImage}
        resizeMode="cover"
      />

      <View style={styles.tractorMarker}>
        <Tractor
          size={rf(21)}
          color="#FFFFFF"
          strokeWidth={2.3}
        />
      </View>

      <View style={styles.machineNameBubble}>
        <Text style={styles.machineNameBubbleText}>
          {machine.name}
        </Text>
      </View>

      <View style={styles.timeBubble}>
        <Clock3
          size={rf(12)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />

        <Text style={styles.timeBubbleText}>
          ~25 min
        </Text>
      </View>

      <View style={styles.homeMarker}>
        <Home
          size={rf(20)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />
      </View>

      <View style={styles.farmBubble}>
        <Text style={styles.farmBubbleText}>
          Patil Farm
        </Text>
      </View>

      <View style={styles.routeLine} />
    </View>
  );
}

function RouteStatusCard({machine}) {
  return (
    <View style={styles.routeCard}>
      <View style={styles.routeTopRow}>
        <Text style={styles.routeStatusLabel}>
          ROUTE STATUS
        </Text>

        <View style={styles.livePill}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            LIVE
          </Text>
        </View>
      </View>

      <View style={styles.routeMainRow}>
        <View style={styles.routeTruckBox}>
          <Truck
            size={rf(23)}
            color={DARK_GREEN}
            strokeWidth={2.3}
          />
        </View>

        <View style={styles.routeContent}>
          <Text style={styles.routeTitle}>
            Tractor On The Way
          </Text>

          <Text style={styles.routeSubtitle}>
            Heading to Patil Farm · 2.1 km Away
          </Text>
        </View>

        <View style={styles.routeEtaBox}>
          <Text style={styles.routeEtaValue}>
            25
          </Text>

          <Text style={styles.routeEtaLabel}>
            min ETA
          </Text>

          <Text style={styles.routeEtaDistance}>
            2.1 km
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.progressTextRow}>
        <Text style={styles.partnerText}>
          {machine.owner}
        </Text>

        <Text style={styles.routeCoveredText}>
          35% of route covered
        </Text>
      </View>
    </View>
  );
}

function DriverCard({machine}) {
  return (
    <View style={styles.driverCard}>
      <View style={styles.driverTopRow}>
        <Image
          source={machine.ownerImage}
          style={styles.driverImage}
        />

        <View style={styles.driverContent}>
          <View style={styles.driverNameRow}>
            <Text style={styles.driverName}>
              Rajesh Patil
            </Text>

            <View style={styles.driverVerifiedBadge}>
              <Check
                size={rf(9)}
                color={DARK_GREEN}
                strokeWidth={3}
              />

              <Text style={styles.driverVerifiedText}>
                Verified
              </Text>
            </View>
          </View>

          <Text style={styles.driverCompany}>
            Patil Agro Services · 250+ Completed Jobs
          </Text>

          <Text style={styles.driverRating}>
            ⭐ 4.9　•　Operator Included
          </Text>
        </View>
      </View>

      <View style={styles.driverActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              'Call Driver',
              'Calling Rajesh Patil...',
            )
          }
          style={styles.callButton}>
          <Phone
            size={rf(16)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />

          <Text style={styles.callText}>
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              'Chat Driver',
              'Opening driver chat.',
            )
          }
          style={styles.chatButton}>
          <MessageCircle
            size={rf(16)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />

          <Text style={styles.chatText}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              'Live Location',
              'Driver location is shown on the map.',
            )
          }
          style={styles.locationButton}>
          <MapPin
            size={rf(15)}
            color={ORANGE}
            strokeWidth={2.4}
          />

          <Text style={styles.locationText}>
            Location
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TimelineCard() {
  const steps = [
    {
      id: 'confirmed',
      title: 'Booking Confirmed',
      subtitle:
        '7:45 AM · Confirmed by Patil Agro Services',
      completed: true,
    },
    {
      id: 'assigned',
      title: 'Driver Assigned',
      subtitle:
        '7:52 AM · Rajesh Patil assigned as operator',
      completed: true,
    },
    {
      id: 'route',
      title: 'En Route to Your Farm',
      subtitle: 'Now · ~25 minutes away',
      active: true,
    },
    {
      id: 'arrived',
      title: 'Arrived at Farm',
      subtitle: 'Est. 8:30 AM',
    },
    {
      id: 'started',
      title: 'Work Started',
      subtitle: 'Est. 8:35 AM',
    },
    {
      id: 'completed',
      title: 'Completed',
      subtitle: 'Est. 12:00 PM',
    },
  ];

  return (
    <View style={styles.timelineCard}>
      {steps.map((step, index) => (
        <View
          key={step.id}
          style={styles.timelineRow}>
          <View style={styles.timelineIndicatorColumn}>
            <View
              style={[
                styles.timelineCircle,
                step.completed &&
                  styles.completedTimelineCircle,
                step.active &&
                  styles.activeTimelineCircle,
              ]}>
              {step.completed ? (
                <Check
                  size={rf(13)}
                  color="#FFFFFF"
                  strokeWidth={3}
                />
              ) : step.active ? (
                <View style={styles.timelineActiveDot} />
              ) : null}
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  (step.completed || step.active) &&
                    styles.activeTimelineLine,
                ]}
              />
            )}
          </View>

          <View style={styles.timelineContent}>
            <Text
              style={[
                styles.timelineTitle,
                (step.completed || step.active) &&
                  styles.activeTimelineTitle,
              ]}>
              {step.title}
            </Text>

            <Text
              style={[
                styles.timelineSubtitle,
                step.active &&
                  styles.orangeTimelineSubtitle,
              ]}>
              {step.subtitle}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function BookingDetailsCard({
  machine,
  hours,
  includeOperator,
  grandTotal,
  bookingId,
}) {
  const rows = [
    {
      id: 'machine',
      label: 'Machine',
      value: machine.name,
      Icon: Building2,
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
      Icon: Zap,
    },
    {
      id: 'operator',
      label: 'Operator',
      value: includeOperator
        ? 'Included'
        : 'Not Included',
      Icon: UserRound,
      green: includeOperator,
    },
  ];

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>
          BOOKING ID: {bookingId}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              'Copied',
              `${bookingId} copied.`,
            )
          }
          style={styles.copyButton}>
          <Copy
            size={rf(13)}
            color={DARK_GREEN}
            strokeWidth={2.4}
          />

          <Text style={styles.copyText}>
            Copy
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bookingRows}>
        {rows.map(item => {
          const Icon = item.Icon;

          return (
            <View
              key={item.id}
              style={styles.bookingRow}>
              <Icon
                size={rf(16)}
                color="#8490A1"
                strokeWidth={2.2}
              />

              <Text style={styles.bookingLabel}>
                {item.label}
              </Text>

              <Text
                style={[
                  styles.bookingValue,
                  item.green &&
                    styles.greenBookingValue,
                ]}>
                {item.value}
              </Text>
            </View>
          );
        })}

        <View style={styles.bookingDivider} />

        <View style={styles.bookingTotalRow}>
          <View style={styles.totalIconLabel}>
            <CircleDollarSign
              size={rf(17)}
              color="#8490A1"
              strokeWidth={2.2}
            />

            <Text style={styles.bookingTotalLabel}>
              Total
            </Text>
          </View>

          <Text style={styles.bookingTotalValue}>
            {formatINR(grandTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AIFieldInsightCard() {
  return (
    <LinearGradient
      colors={['#16883E', '#18A84A']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.aiCard}>
      <View style={styles.aiCircle} />

      <View style={styles.aiBadge}>
        <Sparkles
          size={rf(11)}
          color="#FFFFFF"
          strokeWidth={2.3}
        />

        <Text style={styles.aiBadgeText}>
          LIVE AI UPDATE
        </Text>
      </View>

      <Text style={styles.aiTitle}>
        Smart Field Insight
      </Text>

      <Text style={styles.aiText}>
        “The operator is expected to arrive before
        forecasted rainfall at 1:00 PM. This is an
        ideal time to begin cultivation on your
        soybean field for maximum soil preparation
        benefit.”
      </Text>

      <View style={styles.completionCard}>
        <View style={styles.completionIconBox}>
          <Grid2X2
            size={rf(19)}
            color="#FFFFFF"
            strokeWidth={2.3}
          />
        </View>

        <View>
          <Text style={styles.completionLabel}>
            Estimated Completion
          </Text>

          <Text style={styles.completionValue}>
            12:00 PM Today
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function WeatherGrid() {
  const weatherItems = [
    {
      id: 'temperature',
      value: '32°C',
      label: 'Temperature',
      sublabel: 'Warm',
      Icon: Thermometer,
      color: ORANGE,
      background: '#FFF7ED',
    },
    {
      id: 'humidity',
      value: '68%',
      label: 'Humidity',
      sublabel: 'Moderate',
      Icon: Droplets,
      color: '#3B82F6',
      background: '#EFF6FF',
    },
    {
      id: 'wind',
      value: '14 km/h',
      label: 'Wind',
      sublabel: 'Light Breeze',
      Icon: Wind,
      color: BRIGHT_GREEN,
      background: '#ECFDF3',
    },
    {
      id: 'rain',
      value: '1:00 PM',
      label: 'Rain Forecast',
      sublabel: 'Low Risk',
      Icon: CloudRain,
      color: '#9333EA',
      background: '#FAF5FF',
    },
  ];

  return (
    <View style={styles.weatherGrid}>
      {weatherItems.map(item => {
        const Icon = item.Icon;

        return (
          <View
            key={item.id}
            style={styles.weatherCard}>
            <View
              style={[
                styles.weatherIconBox,
                {backgroundColor: item.background},
              ]}>
              <Icon
                size={rf(18)}
                color={item.color}
                strokeWidth={2.3}
              />
            </View>

            <Text style={styles.weatherValue}>
              {item.value}
            </Text>

            <Text style={styles.weatherLabel}>
              {item.label}
            </Text>

            <Text style={styles.weatherSublabel}>
              {item.sublabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 67,
    paddingHorizontal: PAGE_PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 16,
    paddingBottom: 97,
    backgroundColor: PAGE_BG,
  },

  mapCard: {
    height: 191,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E3E8EB',
    overflow: 'hidden',
  },

  mapImage: {
    width: '100%',
    height: '100%',
  },

  tractorMarker: {
    position: 'absolute',
    left: 76,
    top: 32,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  machineNameBubble: {
    position: 'absolute',
    left: 50,
    top: 77,
    height: 23,
    paddingHorizontal: 9,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  machineNameBubbleText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: ORANGE,
  },

  timeBubble: {
    position: 'absolute',
    left: 191,
    top: 59,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  timeBubbleText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  homeMarker: {
    position: 'absolute',
    right: 59,
    top: 92,
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  farmBubble: {
    position: 'absolute',
    right: 45,
    top: 137,
    height: 23,
    paddingHorizontal: 9,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  farmBubbleText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  routeLine: {
    position: 'absolute',
    left: 113,
    top: 53,
    width: 169,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderTopColor: DARK_GREEN,
    transform: [{rotate: '12deg'}],
  },

  routeCard: {
    marginTop: 17,
    borderRadius: 15,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: {width: 0, height: 5},
    elevation: 3,
  },

  routeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  routeStatusLabel: {
    fontSize: rf(8),
    color: MUTED,
    fontWeight: '900',
    letterSpacing: 0.45,
  },

  livePill: {
    height: 21,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },

  liveText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: RED,
  },

  routeMainRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeTruckBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  routeContent: {
    flex: 1,
    marginLeft: 13,
  },

  routeTitle: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  routeSubtitle: {
    marginTop: 3,
    fontSize: rf(9),
    lineHeight: rf(13),
    color: MUTED,
    fontWeight: '500',
  },

  routeEtaBox: {
    alignItems: 'flex-end',
  },

  routeEtaValue: {
    fontSize: rf(24),
    lineHeight: rf(26),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  routeEtaLabel: {
    fontSize: rf(7),
    fontWeight: '700',
    color: MUTED,
  },

  routeEtaDistance: {
    marginTop: 2,
    fontSize: rf(7),
    color: MUTED,
  },

  progressTrack: {
    height: 5,
    marginTop: 15,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: DARK_GREEN,
  },

  progressTextRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  partnerText: {
    fontSize: rf(8),
    color: MUTED,
    fontWeight: '500',
  },

  routeCoveredText: {
    fontSize: rf(8),
    color: MUTED,
    fontWeight: '500',
  },

  sectionTitle: {
    marginTop: 23,
    marginBottom: 11,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  driverCard: {
    borderRadius: 15,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  driverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverImage: {
    width: 51,
    height: 51,
    borderRadius: 26,
  },

  driverContent: {
    flex: 1,
    marginLeft: 12,
  },

  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverName: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  driverVerifiedBadge: {
    height: 20,
    marginLeft: 7,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  driverVerifiedText: {
    fontSize: rf(7),
    fontWeight: '800',
    color: DARK_GREEN,
  },

  driverCompany: {
    marginTop: 4,
    fontSize: rf(8),
    color: MUTED,
    fontWeight: '500',
  },

  driverRating: {
    marginTop: 6,
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '600',
  },

  driverActions: {
    marginTop: 15,
    flexDirection: 'row',
    gap: 8,
  },

  callButton: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  callText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  chatButton: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  chatText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  locationButton: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  locationText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: ORANGE,
  },

  timelineCard: {
    borderRadius: 15,
    padding: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  timelineRow: {
    minHeight: 59,
    flexDirection: 'row',
  },

  timelineIndicatorColumn: {
    width: 31,
    alignItems: 'center',
  },

  timelineCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#E1E6EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedTimelineCircle: {
    backgroundColor: DARK_GREEN,
    borderColor: DARK_GREEN,
  },

  activeTimelineCircle: {
    borderColor: DARK_GREEN,
  },

  timelineActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK_GREEN,
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E1E6EA',
  },

  activeTimelineLine: {
    backgroundColor: DARK_GREEN,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 10,
  },

  timelineTitle: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#A1A9B5',
  },

  activeTimelineTitle: {
    color: DARK_GREEN,
  },

  timelineSubtitle: {
    marginTop: 4,
    fontSize: rf(8),
    color: '#A1A9B5',
    fontWeight: '500',
  },

  orangeTimelineSubtitle: {
    color: ORANGE,
    fontWeight: '900',
  },

  bookingCard: {
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  bookingHeader: {
    height: 48,
    paddingHorizontal: 15,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bookingId: {
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
    color: DARK_GREEN,
  },

  bookingRows: {
    padding: 15,
  },

  bookingRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },

  bookingLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '500',
  },

  bookingValue: {
    fontSize: rf(10),
    color: DARK,
    fontWeight: '900',
  },

  greenBookingValue: {
    color: DARK_GREEN,
  },

  bookingDivider: {
    height: 1,
    marginVertical: 9,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#E5E7EB',
  },

  bookingTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bookingTotalLabel: {
    marginLeft: 10,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },

  bookingTotalValue: {
    fontSize: rf(18),
    color: DARK_GREEN,
    fontWeight: '900',
  },

  aiCard: {
    minHeight: 242,
    marginTop: 18,
    borderRadius: 15,
    padding: 20,
    overflow: 'hidden',
  },

  aiCircle: {
    position: 'absolute',
    right: -44,
    top: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  aiBadge: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
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
    marginTop: 16,
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiText: {
    marginTop: 12,
    fontSize: rf(11),
    lineHeight: rf(18),
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  completionCard: {
    minHeight: 60,
    marginTop: 17,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.11)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  completionIconBox: {
    width: 39,
    height: 39,
    marginRight: 11,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completionLabel: {
    fontSize: rf(8),
    color: '#D1FAE5',
    fontWeight: '500',
  },

  completionValue: {
    marginTop: 3,
    fontSize: rf(14),
    color: '#FFFFFF',
    fontWeight: '900',
  },

  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  weatherCard: {
    width: '23.5%',
    minHeight: 116,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  weatherIconBox: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weatherValue: {
    marginTop: 9,
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },

  weatherLabel: {
    marginTop: 8,
    fontSize: rf(7),
    color: MUTED,
    fontWeight: '600',
    textAlign: 'center',
  },

  weatherSublabel: {
    marginTop: 3,
    fontSize: rf(7),
    color: MUTED,
    fontWeight: '600',
    textAlign: 'center',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 77,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    gap: 12,
  },

  shareButton: {
    flex: 1,
    height: 53,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  shareButtonText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  cancelButton: {
    flex: 1,
    height: 53,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  cancelButtonText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: RED,
  },
});