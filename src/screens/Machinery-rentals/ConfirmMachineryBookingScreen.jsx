import React, {useMemo, useState} from 'react';
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
  BadgeCheck,
  Star,
  MapPin,
  CalendarDays,
  Clock3,
  Timer,
  UserRound,
  Eye,
  Sparkles,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Banknote,
  ChevronDown,
  ShieldCheck,
  Check,
  CircleAlert,
  CircleX,
  ArrowRight,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const PAGE_BG = '#FAFBFA';
const ORANGE = '#F97316';
const RED = '#EF4444';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const PAYMENT_METHODS = [
  {
    id: 'upi',
    title: 'UPI',
    Icon: Smartphone,
  },
  {
    id: 'credit',
    title: 'Credit Card',
    Icon: CreditCard,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    Icon: Landmark,
  },
  {
    id: 'wallet',
    title: 'Wallet',
    Icon: Wallet,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    Icon: Banknote,
    fullWidth: true,
  },
];

const DEFAULT_MACHINE = {
  id: 'sonalika-di-745',
  name: 'Sonalika DI 745',
  horsepower: '45 HP',
  driveType: '2WD',
  fuelType: 'Diesel',
  rating: '4.8',
  reviews: 128,
  distance: '2.1 km Away',
  owner: 'Patil Agro Services',
  hourlyPrice: 650,
  image: require('../../assets/machinery/sonalika-di-745.jpg'),
  ownerImage: require('../../assets/machinery/owner-1.jpg'),
};

const formatINR = value =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function ConfirmMachineryBookingScreen({
  navigation,
  route,
}) {
  const machine = route?.params?.machine || DEFAULT_MACHINE;

  const selectedDate = route?.params?.selectedDate || '26';
  const selectedTime = route?.params?.selectedTime || '8';
  const hours = route?.params?.hours || 4;
  const includeOperator =
    route?.params?.includeOperator ?? true;

  const selectedImplements =
    route?.params?.selectedImplements || [
      'Rotavator',
      'Cultivator',
    ];

  const [selectedPayment, setSelectedPayment] =
    useState('upi');

  const [policyExpanded, setPolicyExpanded] =
    useState(true);

  const [termsAccepted, setTermsAccepted] =
    useState(true);

  const rentalTotal = useMemo(
    () => Number(machine.hourlyPrice || 650) * hours,
    [machine.hourlyPrice, hours],
  );

  const operatorTotal = includeOperator
    ? 250 * hours
    : 0;

  const transportCharge = 0;
  const platformFee = 150;
  const taxes = 130;

  const grandTotal =
    rentalTotal +
    operatorTotal +
    transportCharge +
    platformFee +
    taxes;

  const selectedPaymentMethod =
    PAYMENT_METHODS.find(
      item => item.id === selectedPayment,
    );

  const handleConfirmBooking = () => {
    if (!termsAccepted) {
      Alert.alert(
        'Accept Booking Terms',
        'Please accept the booking terms before confirming.',
      );
      return;
    }

    navigation.replace('MachineryBookingSuccess', {
      machine,
      selectedDate,
      selectedTime,
      hours,
      includeOperator,
      selectedImplements,
      selectedPayment,
      paymentMethod:
        selectedPaymentMethod?.title || 'UPI',
      rentalTotal,
      operatorTotal,
      transportCharge,
      platformFee,
      taxes,
      grandTotal,
      bookingId: '#KMB274618',
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MachineryBooking', {
      machine,
    });
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
          onPress={handleBack}
          style={styles.backButton}>
          <ArrowLeft
            size={rf(22)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>
            Confirm Booking
          </Text>

          <Text
            numberOfLines={1}
            style={styles.headerSubtitle}>
            Review your booking before confirmation
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <MachineCard machine={machine} />

        <Text style={styles.sectionTitle}>
          Booking Details
        </Text>

        <BookingDetailsCard
          selectedTime={selectedTime}
          hours={hours}
          includeOperator={includeOperator}
        />

        <Text style={styles.sectionTitle}>
          Farm Location
        </Text>

        <FarmLocationCard />

        <Text style={styles.sectionTitle}>
          Selected Implements
        </Text>

        <View style={styles.implementsRow}>
          {selectedImplements.map(item => (
            <View
              key={item}
              style={styles.implementPill}>
              <View style={styles.implementDot} />

              <Text style={styles.implementText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <AIAnalysisCard />

        <Text style={styles.sectionTitle}>
          Payment Method
        </Text>

        <View style={styles.paymentGrid}>
          {PAYMENT_METHODS.map(method => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              selected={
                selectedPayment === method.id
              }
              onPress={() =>
                setSelectedPayment(method.id)
              }
            />
          ))}
        </View>

        <PriceSummaryCard
          rentalTotal={rentalTotal}
          operatorTotal={operatorTotal}
          transportCharge={transportCharge}
          platformFee={platformFee}
          taxes={taxes}
          grandTotal={grandTotal}
        />

        <CancellationPolicyCard
          expanded={policyExpanded}
          onToggle={() =>
            setPolicyExpanded(current => !current)
          }
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            setTermsAccepted(current => !current)
          }
          style={styles.termsCard}>
          <View
            style={[
              styles.termsCheckbox,
              termsAccepted &&
                styles.activeTermsCheckbox,
            ]}>
            {termsAccepted && (
              <Check
                size={rf(14)}
                color="#FFFFFF"
                strokeWidth={3}
              />
            )}
          </View>

          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.termsLink}>
              KhetiMaster Booking Terms
            </Text>
            , cancellation policy, and confirm the
            above details are correct.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>
            Grand Total
          </Text>

          <Text style={styles.bottomValue}>
            {formatINR(grandTotal)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleConfirmBooking}
          style={[
            styles.confirmButton,
            !termsAccepted &&
              styles.disabledConfirmButton,
          ]}>
          <Text style={styles.confirmButtonText}>
            Confirm Booking
          </Text>

          <Check
            size={rf(18)}
            color="#FFFFFF"
            strokeWidth={2.6}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MachineCard({machine}) {
  return (
    <View style={styles.machineCard}>
      <Image
        source={machine.image}
        style={styles.machineImage}
        resizeMode="cover"
      />

      <View style={styles.machineContent}>
        <View style={styles.machineTitleRow}>
          <Text style={styles.machineName}>
            {machine.name}
          </Text>

          <View style={styles.verifiedPill}>
            <BadgeCheck
              size={rf(10)}
              color={DARK_GREEN}
              strokeWidth={2.5}
            />

            <Text style={styles.verifiedText}>
              Verified Partner
            </Text>
          </View>
        </View>

        <Text style={styles.machineSpecs}>
          {machine.horsepower} ·{' '}
          {machine.driveType} ·{' '}
          {machine.fuelType}
        </Text>

        <View style={styles.machineMetaRow}>
          <Star
            size={rf(12)}
            color="#FACC15"
            fill="#FACC15"
          />

          <Text style={styles.ratingText}>
            {machine.rating}
          </Text>

          <Text style={styles.reviewText}>
            ({machine.reviews})
          </Text>

          <MapPin
            size={rf(12)}
            color={ORANGE}
            strokeWidth={2.3}
          />

          <Text style={styles.distanceText}>
            {machine.distance}
          </Text>

          <View style={styles.availabilityDot} />

          <Text style={styles.availableText}>
            Available Today
          </Text>
        </View>

        <View style={styles.machineDivider} />

        <View style={styles.ownerRow}>
          <Image
            source={machine.ownerImage}
            style={styles.ownerImage}
          />

          <View style={styles.ownerTextBox}>
            <Text style={styles.ownerLabel}>
              OWNER
            </Text>

            <Text style={styles.ownerName}>
              {machine.owner}
            </Text>
          </View>

          <View style={styles.ownerVerifiedPill}>
            <BadgeCheck
              size={rf(10)}
              color={DARK_GREEN}
              strokeWidth={2.5}
            />

            <Text style={styles.ownerVerifiedText}>
              Verified
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function BookingDetailsCard({
  selectedTime,
  hours,
  includeOperator,
}) {
  const bookingRows = [
    {
      id: 'date',
      label: 'DATE',
      value: 'Thursday, 26 June 2026',
      Icon: CalendarDays,
    },
    {
      id: 'time',
      label: 'START TIME',
      value:
        selectedTime === '8'
          ? '8:00 AM'
          : `${selectedTime}:00 AM`,
      Icon: Clock3,
    },
    {
      id: 'duration',
      label: 'DURATION',
      value: `${hours} Hours (Est. ends 12:00 PM)`,
      Icon: Timer,
    },
    {
      id: 'operator',
      label: 'OPERATOR',
      value: includeOperator
        ? 'Included · Verified Operator'
        : 'Not Included',
      Icon: UserRound,
      green: includeOperator,
    },
  ];

  return (
    <View style={styles.detailsCard}>
      {bookingRows.map((item, index) => {
        const Icon = item.Icon;

        return (
          <View
            key={item.id}
            style={[
              styles.detailRow,
              index === bookingRows.length - 1 &&
                styles.lastDetailRow,
            ]}>
            <View style={styles.detailIconBox}>
              <Icon
                size={rf(20)}
                color="#FFFFFF"
                strokeWidth={2.3}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                {item.label}
              </Text>

              <Text
                style={[
                  styles.detailValue,
                  item.green &&
                    styles.greenDetailValue,
                ]}>
                {item.value}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function FarmLocationCard() {
  return (
    <View style={styles.locationCard}>
      <View style={styles.locationTopRow}>
        <View style={styles.locationIconBox}>
          <MapPin
            size={rf(22)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />
        </View>

        <View style={styles.locationContent}>
          <Text style={styles.locationName}>
            Patil Farm
          </Text>

          <Text style={styles.locationAddress}>
            Village Khadki, Aurangabad, Maharashtra
            431001
          </Text>

          <Text style={styles.locationDistance}>
            2.1 km from machine location
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() =>
          Alert.alert(
            'View on Map',
            'Farm map can be opened here.',
          )
        }
        style={styles.mapButton}>
        <MapPin
          size={rf(16)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />

        <Text style={styles.mapButtonText}>
          View on Map
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function AIAnalysisCard() {
  return (
    <LinearGradient
      colors={['#158B3D', '#18A84A']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.aiCard}>
      <View style={styles.aiCircle} />

      <View style={styles.aiBadge}>
        <Sparkles
          size={rf(11)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />

        <Text style={styles.aiBadgeText}>
          AI BOOKING ANALYSIS
        </Text>
      </View>

      <Text style={styles.aiTitle}>
        Smart Farm Booking Insights
      </Text>

      <View style={styles.aiGrid}>
        <AIStat
          label="SUITABLE CROP"
          value="🌱 Soybean"
        />

        <AIStat
          label="FARM AREA"
          value="2.34 Acres"
        />

        <AIStat
          label="GROWTH STAGE"
          value="Vegetative"
        />

        <AIStat
          label="FUEL ESTIMATE"
          value="8–10 Litres"
        />
      </View>

      <View style={styles.compatibilityCard}>
        <View style={styles.compatibilityScore}>
          <Text style={styles.compatibilityPercent}>
            98%
          </Text>
        </View>

        <View style={styles.compatibilityTextBox}>
          <Text style={styles.compatibilityTitle}>
            Compatibility Score
          </Text>

          <Text style={styles.compatibilityText}>
            Excellent match for your crop, soil type,
            and current growth stage.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function AIStat({label, value}) {
  return (
    <View style={styles.aiStatCard}>
      <Text style={styles.aiStatLabel}>
        {label}
      </Text>

      <Text style={styles.aiStatValue}>
        {value}
      </Text>
    </View>
  );
}

function PaymentMethodCard({
  method,
  selected,
  onPress,
}) {
  const Icon = method.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.paymentCard,
        method.fullWidth &&
          styles.fullPaymentCard,
        selected && styles.selectedPaymentCard,
      ]}>
      <Icon
        size={rf(17)}
        color={
          selected ? '#FFFFFF' : '#5B6575'
        }
        strokeWidth={2.3}
      />

      <Text
        style={[
          styles.paymentTitle,
          selected &&
            styles.selectedPaymentTitle,
        ]}>
        {method.title}
      </Text>

      <View
        style={[
          styles.radioCircle,
          selected &&
            styles.selectedRadioCircle,
        ]}>
        {selected && (
          <View style={styles.radioInner} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function PriceSummaryCard({
  rentalTotal,
  operatorTotal,
  transportCharge,
  platformFee,
  taxes,
  grandTotal,
}) {
  return (
    <View style={styles.priceCard}>
      <Text style={styles.priceCardTitle}>
        Price Summary
      </Text>

      <PriceRow
        label="Machine Rental (4 hrs × ₹650)"
        value={formatINR(rentalTotal)}
      />

      <PriceRow
        label="Operator (4 hrs × ₹250)"
        value={formatINR(operatorTotal)}
      />

      <PriceRow
        label="Transport"
        value={
          transportCharge === 0
            ? 'Free'
            : formatINR(transportCharge)
        }
        green
      />

      <PriceRow
        label="Platform Fee"
        value={formatINR(platformFee)}
      />

      <PriceRow
        label="Taxes (GST 5%)"
        value={formatINR(taxes)}
      />

      <View style={styles.priceDivider} />

      <View style={styles.grandTotalBox}>
        <Text style={styles.grandTotalLabel}>
          Grand Total
        </Text>

        <Text style={styles.grandTotalValue}>
          {formatINR(grandTotal)}
        </Text>
      </View>
    </View>
  );
}

function PriceRow({label, value, green}) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.priceValue,
          green && styles.greenPriceValue,
        ]}>
        {value}
      </Text>
    </View>
  );
}

function CancellationPolicyCard({
  expanded,
  onToggle,
}) {
  return (
    <View style={styles.policyCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={styles.policyHeader}>
        <View style={styles.policyIconBox}>
          <ShieldCheck
            size={rf(19)}
            color={ORANGE}
            strokeWidth={2.3}
          />
        </View>

        <Text style={styles.policyTitle}>
          Cancellation Policy
        </Text>

        <ChevronDown
          size={rf(19)}
          color="#94A3B8"
          strokeWidth={2.3}
          style={{
            transform: [
              {
                rotate: expanded
                  ? '180deg'
                  : '0deg',
              },
            ],
          }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.policyContent}>
          <PolicyRow
            Icon={Check}
            color={BRIGHT_GREEN}
            text="Free cancellation up to 2 hours before the booking starts."
          />

          <PolicyRow
            Icon={CircleAlert}
            color={ORANGE}
            text="50% refund for cancellations within 2 hours of start time."
          />

          <PolicyRow
            Icon={CircleX}
            color={RED}
            text="No refund for cancellations after the booking starts."
          />
        </View>
      )}
    </View>
  );
}

function PolicyRow({Icon, color, text}) {
  return (
    <View style={styles.policyRow}>
      <View
        style={[
          styles.policyStatusIcon,
          {backgroundColor: color},
        ]}>
        <Icon
          size={rf(10)}
          color="#FFFFFF"
          strokeWidth={3}
        />
      </View>

      <Text style={styles.policyText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 61,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 39,
    height: 39,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: rf(17),
    lineHeight: rf(21),
    fontWeight: '900',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 105,
    backgroundColor: PAGE_BG,
  },

  machineCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  machineImage: {
    width: '100%',
    height: 139,
  },

  machineContent: {
    padding: 13,
  },

  machineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  machineName: {
    flex: 1,
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  verifiedPill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  verifiedText: {
    fontSize: rf(7),
    fontWeight: '800',
    color: DARK_GREEN,
  },

  machineSpecs: {
    marginTop: 6,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },

  machineMetaRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },

  ratingText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK,
  },

  reviewText: {
    marginRight: 6,
    fontSize: rf(8),
    fontWeight: '500',
    color: MUTED,
  },

  distanceText: {
    marginRight: 6,
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },

  availabilityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BRIGHT_GREEN,
  },

  availableText: {
    fontSize: rf(8),
    fontWeight: '700',
    color: MUTED,
  },

  machineDivider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: '#EEF1F2',
  },

  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ownerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  ownerTextBox: {
    flex: 1,
    marginLeft: 9,
  },

  ownerLabel: {
    fontSize: rf(6),
    color: MUTED,
    fontWeight: '800',
  },

  ownerName: {
    marginTop: 2,
    fontSize: rf(9),
    color: DARK,
    fontWeight: '900',
  },

  ownerVerifiedPill: {
    height: 21,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ownerVerifiedText: {
    fontSize: rf(7),
    fontWeight: '800',
    color: DARK_GREEN,
  },

  sectionTitle: {
    marginTop: 19,
    marginBottom: 10,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  detailsCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  detailRow: {
    minHeight: 60,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  lastDetailRow: {
    borderBottomWidth: 0,
  },

  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: BRIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: rf(7),
    fontWeight: '800',
    color: '#98A1AF',
  },

  detailValue: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },

  greenDetailValue: {
    color: DARK_GREEN,
  },

  locationCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  locationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIconBox: {
    width: 39,
    height: 39,
    borderRadius: 7,
    backgroundColor: BRIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationContent: {
    flex: 1,
    marginLeft: 11,
  },

  locationName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },

  locationAddress: {
    marginTop: 3,
    fontSize: rf(8),
    lineHeight: rf(12),
    fontWeight: '500',
    color: MUTED,
  },

  locationDistance: {
    marginTop: 4,
    fontSize: rf(8),
    fontWeight: '900',
    color: ORANGE,
  },

  mapButton: {
    height: 36,
    marginTop: 11,
    borderRadius: 6,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  mapButtonText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  implementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  implementPill: {
    height: 27,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
  },

  implementDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  implementText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiCard: {
    marginTop: 17,
    borderRadius: 12,
    padding: 15,
    overflow: 'hidden',
  },

  aiCircle: {
    position: 'absolute',
    right: -45,
    top: -49,
    width: 135,
    height: 135,
    borderRadius: 68,
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
    marginTop: 14,
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  aiStatCard: {
    width: '48.5%',
    height: 49,
    borderRadius: 7,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },

  aiStatLabel: {
    fontSize: rf(6),
    fontWeight: '600',
    color: '#BBF7D0',
  },

  aiStatValue: {
    marginTop: 5,
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  compatibilityCard: {
    minHeight: 66,
    marginTop: 10,
    borderRadius: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  compatibilityScore: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  compatibilityPercent: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  compatibilityTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  compatibilityTitle: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  compatibilityText: {
    marginTop: 3,
    fontSize: rf(7),
    lineHeight: rf(10),
    color: '#D1FAE5',
    fontWeight: '500',
  },

  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  paymentCard: {
    width: '48.5%',
    height: 47,
    borderRadius: 7,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  fullPaymentCard: {
    width: '100%',
  },

  selectedPaymentCard: {
    backgroundColor: BRIGHT_GREEN,
    borderColor: BRIGHT_GREEN,
  },

  paymentTitle: {
    flex: 1,
    marginLeft: 9,
    fontSize: rf(9),
    fontWeight: '800',
    color: '#5B6575',
  },

  selectedPaymentTitle: {
    color: '#FFFFFF',
  },

  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: '#D8DDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRadioCircle: {
    borderColor: '#FFFFFF',
  },

  radioInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  priceCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  priceCardTitle: {
    marginBottom: 18,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  priceRow: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '500',
  },

  priceValue: {
    fontSize: rf(9),
    color: DARK,
    fontWeight: '900',
  },

  greenPriceValue: {
    color: DARK_GREEN,
  },

  priceDivider: {
    height: 1,
    marginBottom: 14,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#E5E7EB',
  },

  grandTotalBox: {
    height: 44,
    borderRadius: 6,
    paddingHorizontal: 14,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  grandTotalLabel: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  grandTotalValue: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  policyCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },

  policyHeader: {
    height: 60,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  policyIconBox: {
    width: 34,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  policyTitle: {
    flex: 1,
    marginLeft: 11,
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },

  policyContent: {
    paddingHorizontal: 14,
    paddingTop: 3,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F2',
  },

  policyRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  policyStatusIcon: {
    width: 14,
    height: 14,
    marginTop: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  policyText: {
    flex: 1,
    marginLeft: 9,
    fontSize: rf(8),
    lineHeight: rf(13),
    color: MUTED,
    fontWeight: '500',
  },

  termsCard: {
    minHeight: 77,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  termsCheckbox: {
    width: 18,
    height: 18,
    marginTop: 1,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTermsCheckbox: {
    backgroundColor: DARK_GREEN,
    borderColor: DARK_GREEN,
  },

  termsText: {
    flex: 1,
    marginLeft: 10,
    fontSize: rf(8),
    lineHeight: rf(13),
    color: MUTED,
    fontWeight: '500',
  },

  termsLink: {
    color: DARK_GREEN,
    fontWeight: '900',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 72,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomLabel: {
    fontSize: rf(8),
    color: '#94A3B8',
    fontWeight: '500',
  },

  bottomValue: {
    marginTop: 3,
    fontSize: rf(20),
    color: DARK_GREEN,
    fontWeight: '900',
  },

  confirmButton: {
    height: 49,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  disabledConfirmButton: {
    opacity: 0.55,
  },

  confirmButtonText: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});