import React, { useMemo, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
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
  Sparkles,
  Smartphone,
  CreditCard,
  Wallet,
  Banknote,
  ChevronDown,
  ShieldCheck,
  Check,
  CircleAlert,
  CircleX,
} from 'lucide-react-native';

// Dynamic Import of your machinery booking slice action
import { createMachineryBooking } from '../../redux/slices/machineryBookingSlice';

const { width } = Dimensions.get('window');
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

// Scaled up dynamic font size helper
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 3));
};

const PAYMENT_METHODS = [
  { id: 'upi', title: 'UPI', Icon: Smartphone },
  { id: 'card', title: 'Credit/Debit Card', Icon: CreditCard },
  { id: 'wallet', title: 'Wallet', Icon: Wallet },
  { id: 'cod', title: 'Cash on Delivery', Icon: Banknote, fullWidth: true },
];

const formatDateString = dateString => {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Thursday, 26 June 2026';
  }
};

export default function ConfirmMachineryBookingScreen({ navigation, route }) {
  const dispatch = useDispatch();

  const machine = route?.params?.machine || {};
  const selectedDate = route?.params?.selectedDate; // Real ISO String
  const selectedTime = route?.params?.selectedTime || '08:00 AM';
  const duration = route?.params?.duration || 4;
  const includeOperator = route?.params?.includeOperator ?? true;
  const selectedImplement = route?.params?.selectedImplement || '';
  const notes = route?.params?.notes || '';
  
  const rentalType = route?.params?.rentalType || 'hourly';
  const rentalTotal = route?.params?.rentalTotal || 0;
  const operatorTotal = route?.params?.operatorTotal || 0;

  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [policyExpanded, setPolicyExpanded] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transportCharge = 0;
  const platformFee = 150;
  const taxes = 130;
  const grandTotal = rentalTotal + operatorTotal + transportCharge + platformFee + taxes;

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    item => item.id === selectedPayment,
  );

  const handleConfirmBooking = () => {
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the booking terms before confirming.');
      return;
    }

    setIsSubmitting(true);

    const bookingPayload = {
      machinery: machine._id || machine.id,
      bookingDate: selectedDate, // ISO String
      startTime: selectedTime,
      workType: 'Cultivation',
      pricingType: rentalType,
      duration: duration,
      durationUnit: rentalType === 'hourly' ? 'hours' : 'days',
      basePrice: rentalTotal,
      platformFee,
      taxes,
      totalAmount: grandTotal,
      state: machine.state || '',
      district: machine.district || '',
      village: machine.village || '',
      address: machine.address || '',
      farmName: 'My Farm',
      paymentMethod: selectedPayment, // Pass strictly ('cod' | 'upi' | 'card' | 'wallet')
      farmerNotes: notes,
      selectedImplement,
    };

    dispatch(createMachineryBooking(bookingPayload))
      .unwrap()
      .then(res => {
        setIsSubmitting(false);
        navigation.replace('MachineryBookingSuccess', {
          booking: res.booking,
          bookingId: res.booking?._id || res.booking?.id,
        });
      })
      .catch(err => {
        setIsSubmitting(false);
        Alert.alert('Booking Failed', err || 'Failed to request rental.');
      });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MachineryBooking', { machine });
    }
  };

  const imageUri = Array.isArray(machine.images) && machine.images.length > 0 
    ? { uri: machine.images[0] } 
    : require('../../assets/machinery/sonalika-di-745.jpg');

  const ownerName = machine.ownerName || machine.owner?.fullName || 'Owner';

  const formatINR = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={rf(24)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            Review your booking before confirmation
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* MACHINE CARD */}
        <View style={styles.machineCard}>
          <Image source={imageUri} style={styles.machineImage} resizeMode="cover" />

          <View style={styles.machineContent}>
            <View style={styles.machineTitleRow}>
              <Text style={styles.machineName}>{machine.name || 'Machinery'}</Text>
              <View style={styles.verifiedPill}>
                <BadgeCheck size={rf(11)} color={DARK_GREEN} strokeWidth={2.5} />
                <Text style={styles.verifiedText}>Verified Partner</Text>
              </View>
            </View>

            <Text style={styles.machineSpecs}>
              {machine.enginePower?.value ? `${machine.enginePower.value} ${machine.enginePower.unit || 'HP'}` : '45 HP'} · {machine.driveType || '2WD'} · {machine.fuelType ? machine.fuelType.toUpperCase() : 'DIESEL'}
            </Text>

            <View style={styles.machineMetaRow}>
              <Star size={rf(13)} color="#FACC15" fill="#FACC15" />
              <Text style={styles.ratingText}>{machine.rating ? machine.rating.toFixed(1) : '4.8'}</Text>
              <Text style={styles.reviewText}>({machine.totalReviews || 128})</Text>

              {machine.village ? (
                <>
                  <MapPin size={rf(13)} color={ORANGE} strokeWidth={2.3} />
                  <Text style={styles.distanceText}>{machine.village}</Text>
                </>
              ) : null}
            </View>

            <View style={styles.machineDivider} />

            <View style={styles.ownerRow}>
              <Image source={require('../../assets/machinery/owner-1.jpg')} style={styles.ownerAvatar} />
              <View style={styles.ownerTextBox}>
                <Text style={styles.ownerLabel}>OWNER</Text>
                <Text style={styles.ownerNameText}>{ownerName}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Booking Details</Text>

        <BookingDetailsCard
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          duration={duration}
          rentalType={rentalType}
          includeOperator={includeOperator}
        />

        {selectedImplement ? (
          <>
            <Text style={styles.sectionTitle}>Selected Implement</Text>
            <View style={styles.implementsRow}>
              <View style={styles.implementPill}>
                <View style={styles.implementDot} />
                <Text style={styles.implementText}>{selectedImplement}</Text>
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentGrid}>
          {PAYMENT_METHODS.map(method => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              selected={selectedPayment === method.id}
              onPress={() => setSelectedPayment(method.id)}
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
          duration={duration}
          rentalType={rentalType}
          machine={machine}
          formatINR={formatINR}
        />

        <CancellationPolicyCard
          expanded={policyExpanded}
          onToggle={() => setPolicyExpanded(current => !current)}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setTermsAccepted(current => !current)}
          style={styles.termsCard}
        >
          <View style={[styles.termsCheckbox, termsAccepted && styles.activeTermsCheckbox]}>
            {termsAccepted && <Check size={rf(15)} color="#FFFFFF" strokeWidth={3} />}
          </View>

          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>KhetiMaster Booking Terms</Text>, cancellation policy, and confirm that the above details are correct.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Grand Total</Text>
          <Text style={styles.bottomValue}>{formatINR(grandTotal)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleConfirmBooking}
          disabled={!termsAccepted || isSubmitting}
          style={[
            styles.confirmButton,
            (!termsAccepted || isSubmitting) && styles.disabledConfirmButton,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Send Request</Text>
              <Check size={rf(19)} color="#FFFFFF" strokeWidth={2.6} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function BookingDetailsCard({ selectedDate, selectedTime, duration, rentalType, includeOperator }) {
  const bookingRows = [
    {
      id: 'date',
      label: 'DATE',
      value: formatDateString(selectedDate),
      Icon: CalendarDays,
    },
    {
      id: 'time',
      label: 'START TIME',
      value: selectedTime,
      Icon: Clock3,
    },
    {
      id: 'duration',
      label: 'DURATION',
      value: `${duration} ${rentalType === 'hourly' ? 'Hours' : 'Days'}`,
      Icon: Timer,
    },
    {
      id: 'operator',
      label: 'OPERATOR',
      value: includeOperator ? 'Included · Verified Operator' : 'Not Included',
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
              index === bookingRows.length - 1 && styles.lastDetailRow,
            ]}
          >
            <View style={styles.detailIconBox}>
              <Icon size={rf(21)} color="#FFFFFF" strokeWidth={2.3} />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={[styles.detailValue, item.green && styles.greenDetailValue]}>
                {item.value}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PaymentMethodCard({ method, selected, onPress }) {
  const Icon = method.Icon;
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.paymentCard,
        method.fullWidth && styles.fullPaymentCard,
        selected && styles.selectedPaymentCard,
      ]}
    >
      <Icon size={rf(18)} color={selected ? '#FFFFFF' : '#5B6575'} strokeWidth={2.3} />
      <Text style={[styles.paymentTitle, selected && styles.selectedPaymentTitle]}>
        {method.title}
      </Text>
      <View style={[styles.radioCircle, selected && styles.selectedRadioCircle]}>
        {selected && <View style={styles.radioInner} />}
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
  duration,
  rentalType,
  machine,
  formatINR,
}) {
  const rate = rentalType === 'hourly' ? (machine.pricing?.hourly || 650) : (machine.pricing?.daily || 2500);
  const rateLabel = rentalType === 'hourly' ? 'hrs' : 'days';

  return (
    <View style={styles.priceCard}>
      <Text style={styles.priceCardTitle}>Price Summary</Text>

      <PriceRow
        label={`Machine Rental (${duration} ${rateLabel} × ₹${rate})`}
        value={formatINR(rentalTotal)}
      />

      <PriceRow
        label={`Operator (${rentalType === 'hourly' ? duration : duration * 8} hrs × ₹250)`}
        value={operatorTotal > 0 ? formatINR(operatorTotal) : 'Not Included'}
      />

      <PriceRow
        label="Transport"
        value={transportCharge === 0 ? 'Free' : formatINR(transportCharge)}
        green
      />

      <PriceRow label="Platform Fee" value={formatINR(platformFee)} />
      <PriceRow label="Taxes (GST 5%)" value={formatINR(taxes)} />

      <View style={styles.priceDivider} />

      <View style={styles.grandTotalBox}>
        <Text style={styles.grandTotalLabel}>Grand Total</Text>
        <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
      </View>
    </View>
  );
}

function PriceRow({ label, value, green }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={[styles.priceValue, green && styles.greenPriceValue]}>{value}</Text>
    </View>
  );
}

function CancellationPolicyCard({ expanded, onToggle }) {
  return (
    <View style={styles.policyCard}>
      <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.policyHeader}>
        <View style={styles.policyIconBox}>
          <ShieldCheck size={rf(20)} color={ORANGE} strokeWidth={2.3} />
        </View>
        <Text style={styles.policyTitle}>Cancellation Policy</Text>
        <ChevronDown
          size={rf(20)}
          color="#94A3B8"
          strokeWidth={2.3}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
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
            text="50% charge for cancellations within 2 hours of start time."
          />
          <PolicyRow
            Icon={CircleX}
            color={RED}
            text="No refunds for cancellations made after the booking starts."
          />
        </View>
      )}
    </View>
  );
}

function PolicyRow({ Icon, color, text }) {
  return (
    <View style={styles.policyRow}>
      <View style={[styles.policyStatusIcon, { backgroundColor: color }]}>
        <Icon size={rf(11)} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={styles.policyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 66,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBox: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: rf(19), lineHeight: rf(23), fontWeight: '900', color: DARK },
  headerSubtitle: { marginTop: 2, fontSize: rf(10), fontWeight: '500', color: MUTED },
  scrollContent: { paddingHorizontal: PAGE_PADDING, paddingTop: 12, paddingBottom: 105, backgroundColor: PAGE_BG },
  machineCard: { borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  machineImage: { width: '100%', height: 139 },
  machineContent: { padding: 13 },
  machineTitleRow: { flexDirection: 'row', alignItems: 'center' },
  machineName: { flex: 1, fontSize: rf(18), fontWeight: '900', color: DARK },
  verifiedPill: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: { fontSize: rf(8), fontWeight: '800', color: DARK_GREEN },
  machineSpecs: { marginTop: 6, fontSize: rf(11), color: MUTED, fontWeight: '600' },
  machineMetaRow: { marginTop: 11, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  ratingText: { fontSize: rf(10), fontWeight: '900', color: DARK },
  reviewText: { marginRight: 6, fontSize: rf(9), fontWeight: '500', color: MUTED },
  distanceText: { marginRight: 6, fontSize: rf(9), fontWeight: '600', color: MUTED },
  availabilityDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: BRIGHT_GREEN },
  availableText: { fontSize: rf(9), fontWeight: '700', color: MUTED },
  machineDivider: { height: 1, marginVertical: 12, backgroundColor: '#EEF1F2' },
  ownerRow: { flexDirection: 'row', alignItems: 'center' },
  ownerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  ownerTextBox: { flex: 1, marginLeft: 9 },
  ownerLabel: { fontSize: rf(7), color: MUTED, fontWeight: '800' },
  ownerNameText: { marginTop: 2, fontSize: rf(10), color: DARK, fontWeight: '900' },
  sectionTitle: { marginTop: 21, marginBottom: 11, fontSize: rf(16), fontWeight: '900', color: DARK },
  detailsCard: { borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  detailRow: { minHeight: 62, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#EEF1F2', flexDirection: 'row', alignItems: 'center' },
  lastDetailRow: { borderBottomWidth: 0 },
  detailIconBox: { width: 32, height: 32, borderRadius: 6, backgroundColor: BRIGHT_GREEN, alignItems: 'center', justifyContent: 'center' },
  detailContent: { marginLeft: 12 },
  detailLabel: { fontSize: rf(8), fontWeight: '800', color: '#98A1AF' },
  detailValue: { marginTop: 3, fontSize: rf(11), fontWeight: '900', color: DARK },
  greenDetailValue: { color: DARK_GREEN },
  implementsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  implementPill: { height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: DARK_GREEN, flexDirection: 'row', alignItems: 'center' },
  implementDot: { width: 5, height: 5, marginRight: 5, borderRadius: 3, backgroundColor: '#FFFFFF' },
  implementText: { fontSize: rf(9), fontWeight: '900', color: '#FFFFFF' },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  paymentCard: { width: '48.5%', height: 49, borderRadius: 7, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center' },
  fullPaymentCard: { width: '100%' },
  selectedPaymentCard: { backgroundColor: BRIGHT_GREEN, borderColor: BRIGHT_GREEN },
  paymentTitle: { flex: 1, marginLeft: 9, fontSize: rf(10), fontWeight: '800', color: '#5B6575' },
  selectedPaymentTitle: { color: '#FFFFFF' },
  radioCircle: { width: 15, height: 14, borderRadius: 7, borderWidth: 1.4, borderColor: '#D8DDE3', alignItems: 'center', justifyContent: 'center' },
  selectedRadioCircle: { borderColor: '#FFFFFF' },
  radioInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  priceCard: { marginTop: 18, borderRadius: 12, padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER },
  priceCardTitle: { marginBottom: 18, fontSize: rf(16), fontWeight: '900', color: DARK },
  priceRow: { marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: rf(10), color: MUTED, fontWeight: '500' },
  priceValue: { fontSize: rf(10), color: DARK, fontWeight: '900' },
  greenPriceValue: { color: DARK_GREEN },
  priceDivider: { height: 1, marginBottom: 14, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: '#E5E7EB' },
  grandTotalBox: { height: 46, borderRadius: 6, paddingHorizontal: 14, backgroundColor: BRIGHT_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grandTotalLabel: { fontSize: rf(12), fontWeight: '900', color: '#FFFFFF' },
  grandTotalValue: { fontSize: rf(19), fontWeight: '900', color: '#FFFFFF' },
  policyCard: { marginTop: 18, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  policyHeader: { height: 62, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  policyIconBox: { width: 36, height: 36, borderRadius: 7, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  policyTitle: { flex: 1, marginLeft: 11, fontSize: rf(13), fontWeight: '900', color: DARK },
  policyContent: { paddingHorizontal: 14, paddingTop: 3, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#EEF1F2' },
  policyRow: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-start' },
  policyStatusIcon: { width: 14, height: 14, marginTop: 1, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  policyText: { flex: 1, marginLeft: 9, fontSize: rf(9), lineHeight: rf(14), color: MUTED, fontWeight: '500' },
  termsCard: { minHeight: 77, marginTop: 18, borderRadius: 12, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'flex-start' },
  termsCheckbox: { width: 18, height: 18, marginTop: 1, borderRadius: 3, borderWidth: 1.5, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  activeTermsCheckbox: { backgroundColor: DARK_GREEN, borderColor: DARK_GREEN },
  termsText: { flex: 1, marginLeft: 10, fontSize: rf(9), lineHeight: rf(14), color: MUTED, fontWeight: '500' },
  termsLink: { color: DARK_GREEN, fontWeight: '900' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 74, paddingHorizontal: PAGE_PADDING, paddingVertical: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomLabel: { fontSize: rf(9), color: '#94A3B8', fontWeight: '500' },
  bottomValue: { marginTop: 3, fontSize: rf(21), color: DARK_GREEN, fontWeight: '900' },
  confirmButton: { height: 50, paddingHorizontal: 20, borderRadius: 10, backgroundColor: BRIGHT_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  disabledConfirmButton: { opacity: 0.55 },
  confirmButtonText: { fontSize: rf(13), color: '#FFFFFF', fontWeight: '900' },
});