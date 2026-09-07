import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Star,
  Minus,
  Plus,
  MapPin,
  UserRound,
  CheckCircle2,
  Sparkles,
  Clock3,
  Pencil,
  ArrowRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#18B94D';
const DARK = '#171717';
const MUTED = '#7A8495';
const BORDER = '#E5E7EB';
const PAGE_BG = '#FFFFFF';
const PAGE_PADDING = width * 0.037;

// Scaled up dynamic font size helper
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 3));
};

// Generates real dynamic dates starting from today onwards
const generateDateOptions = () => {
  const dates = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      id: d.toISOString(), // Real ISO Date String
      day: i === 0 ? 'Today' : daysOfWeek[d.getDay()],
      date: String(d.getDate()),
      month: months[d.getMonth()],
    });
  }
  return dates;
};

const TIME_OPTIONS = [
  { id: '06:00 AM', label: '6:00 AM' },
  { id: '07:00 AM', label: '7:00 AM' },
  { id: '08:00 AM', label: '8:00 AM' },
  { id: '09:00 AM', label: '9:00 AM' },
  { id: '10:00 AM', label: '10:00 AM' },
  { id: '11:00 AM', label: '11:00 AM', unavailable: true },
  { id: '12:00 PM', label: '12:00 PM' },
  { id: '02:00 PM', label: '2:00 PM' },
];

export default function MachineryBookingScreen({ navigation, route }) {
  const machine = route?.params?.machine || route?.params?.machinery || {};
  
  const DATE_OPTIONS = useMemo(() => generateDateOptions(), []);

  // State populated with dynamic real values
  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]?.id);
  const [selectedTime, setSelectedTime] = useState('08:00 AM');
  
  const initialRentalType = route?.params?.selectedPlan === 'day' ? 'daily' : 'hourly';
  const [rentalType, setRentalType] = useState(initialRentalType);
  const [duration, setDuration] = useState(rentalType === 'hourly' ? 4 : 1);
  const [includeOperator, setIncludeOperator] = useState(true);
  
  // Real supported implements extracted from current machine document
  const availableImplements = Array.isArray(machine.supportedImplements) 
    ? machine.supportedImplements 
    : [];
  const [selectedImplement, setSelectedImplement] = useState(availableImplements[0] || '');
  const [notes, setNotes] = useState('');

  const hourlyPrice = Number(machine.pricing?.hourly) || 0;
  const dailyPrice = Number(machine.pricing?.daily) || 0;

  // Dynamic calculations based on DB configurations
  const rentalTotal = useMemo(() => {
    if (rentalType === 'hourly') {
      return hourlyPrice * duration;
    }
    return dailyPrice * duration;
  }, [rentalType, duration, hourlyPrice, dailyPrice]);

  const operatorTotal = includeOperator ? 250 * (rentalType === 'hourly' ? duration : duration * 8) : 0;
  const totalAmount = rentalTotal + operatorTotal;

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a booking date.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a start time.');
      return;
    }

    navigation.navigate('ConfirmMachineryBooking', {
      machine,
      selectedDate, // Passes ISO String
      selectedTime, // Passes e.g. "08:00 AM"
      rentalType,   // 'hourly' | 'daily'
      duration,
      includeOperator,
      selectedImplement,
      notes,
      rentalTotal,
      operatorTotal,
      totalAmount,
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MachineryDetails', { machine });
    }
  };

  const imageUri = Array.isArray(machine.images) && machine.images.length > 0 
    ? { uri: machine.images[0] } 
    : require('../../assets/machinery/sonalika-di-745.jpg');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={rf(24)} color={DARK} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSubtitle}>{machine.name || 'Machinery'}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* MACHINE CARD */}
        <View style={styles.machineCard}>
          <Image source={imageUri} style={styles.machineImage} resizeMode="cover" />

          <View style={styles.machineDetails}>
            <Text numberOfLines={1} style={styles.machineName}>
              {machine.name || 'Machinery'}
            </Text>

            <Text style={styles.machineSpecs}>
              {machine.enginePower?.value ? `${machine.enginePower.value} ${machine.enginePower.unit || 'HP'}` : '45 HP'} • {machine.driveType || '2WD'} • {machine.fuelType ? machine.fuelType.toUpperCase() : 'DIESEL'}
            </Text>

            <View style={styles.machineRatingRow}>
              <Star size={rf(15)} color="#FACC15" fill="#FACC15" />
              <Text style={styles.machineRating}>
                {machine.rating ? machine.rating.toFixed(1) : '4.8'}
              </Text>
              <Text style={styles.machineReviews}>
                ({machine.totalReviews || 128} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.machinePriceBox}>
            <Text style={styles.machinePrice}>
              ₹{rentalType === 'hourly' ? hourlyPrice : dailyPrice}
            </Text>
            <Text style={styles.machinePriceUnit}>per {rentalType === 'hourly' ? 'hour' : 'day'}</Text>

            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Live Now</Text>
            </View>
          </View>
        </View>

        {/* SELECT DATE */}
        <SectionTitle title="Select Date" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {DATE_OPTIONS.map(item => {
            const selected = selectedDate === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setSelectedDate(item.id)}
                style={[styles.dateCard, selected && styles.selectedDateCard]}
              >
                <Text style={[styles.dateDay, selected && styles.selectedDateText]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateNumber, selected && styles.selectedDateText]}>
                  {item.date}
                </Text>
                <Text style={[styles.dateMonth, selected && styles.selectedDateSubText]}>
                  {item.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SELECT TIME */}
        <SectionTitle title="Select Time" />
        <View style={styles.timeGrid}>
          {TIME_OPTIONS.map(item => {
            const selected = selectedTime === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={item.unavailable ? 1 : 0.85}
                disabled={item.unavailable}
                onPress={() => setSelectedTime(item.id)}
                style={[
                  styles.timeButton,
                  selected && styles.selectedTimeButton,
                  item.unavailable && styles.disabledTimeButton,
                ]}
              >
                <Text style={[
                  styles.timeText,
                  selected && styles.selectedTimeText,
                  item.unavailable && styles.disabledTimeText,
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.timeLegend}>
          <View style={styles.legendItem}>
            <View style={styles.selectedLegendBox} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.unavailableLegendBox} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>

        {/* DURATION */}
        <SectionTitle title="Rental Duration" />
        <View style={styles.rentalTabs}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setRentalType('hourly');
              setDuration(4);
            }}
            style={[styles.rentalTab, rentalType === 'hourly' && styles.selectedRentalTab]}
          >
            <Text style={[styles.rentalTabText, rentalType === 'hourly' && styles.selectedRentalTabText]}>
              Hourly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setRentalType('daily');
              setDuration(1);
            }}
            style={[styles.rentalTab, rentalType === 'daily' && styles.selectedRentalTab]}
          >
            <Text style={[styles.rentalTabText, rentalType === 'daily' && styles.selectedRentalTabText]}>
              Daily
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>Duration</Text>

          <View style={styles.durationControls}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDuration(current => Math.max(1, current - 1))}
              style={styles.durationButton}
            >
              <Minus size={rf(19)} color="#94A3B8" strokeWidth={2.3} />
            </TouchableOpacity>

            <Text style={styles.durationValue}>
              {duration} {rentalType === 'hourly' ? 'Hours' : 'Days'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDuration(current => Math.min(24, current + 1))}
              style={[styles.durationButton, styles.durationAddButton]}
            >
              <Plus size={rf(19)} color="#FFFFFF" strokeWidth={2.3} />
            </TouchableOpacity>
          </View>
        </View>

        {/* OPERATOR */}
        <SectionTitle title="Operator" />
        <View style={styles.operatorCard}>
          <View style={styles.operatorIconBox}>
            <UserRound size={rf(24)} color={BRIGHT_GREEN} strokeWidth={2.2} />
          </View>

          <View style={styles.operatorDetails}>
            <Text style={styles.operatorTitle}>Include Driver / Operator</Text>
            <Text style={styles.operatorPrice}>+ ₹250 / Hour</Text>
            <View style={styles.verifiedOperatorRow}>
              <CheckCircle2 size={rf(13)} color={BRIGHT_GREEN} fill={BRIGHT_GREEN} />
              <Text style={styles.verifiedOperatorText}>Verified Operator</Text>
            </View>
          </View>

          <Switch
            value={includeOperator}
            onValueChange={setIncludeOperator}
            trackColor={{ false: '#D1D5DB', true: '#20C55A' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* SELECT IMPLEMENT */}
        {machine.supportsImplements && availableImplements.length > 0 && (
          <>
            <SectionTitle title="Select Implement" />
            <View style={styles.implementWrap}>
              {availableImplements.map(implement => {
                const selected = selectedImplement === implement;
                return (
                  <TouchableOpacity
                    key={implement}
                    activeOpacity={0.85}
                    onPress={() => setSelectedImplement(selected ? '' : implement)}
                    style={[
                      styles.implementPill,
                      selected && styles.selectedImplementPill,
                    ]}
                  >
                    {selected && <View style={styles.implementDot} />}
                    <Text style={[styles.implementText, selected && styles.selectedImplementText]}>
                      {implement}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* DELIVERY LOCATION */}
        <SectionTitle title="Delivery Location" />
        <View style={styles.locationCard}>
          <View style={styles.locationIconBox}>
            <MapPin size={rf(25)} color="#FFFFFF" strokeWidth={2.4} />
          </View>

          <View style={styles.locationDetails}>
            <Text style={styles.locationName}>Delivery Address</Text>
            <Text numberOfLines={1} style={styles.locationAddress}>
              {[machine.village, machine.district, machine.state].filter(Boolean).join(', ') || 'Your registered farm'}
            </Text>
            <Text style={styles.locationDistance}>Dispatch Location Verified</Text>
          </View>
        </View>

        {/* AI SUGGESTION */}
        <LinearGradient
          colors={['#16883E', '#20C55A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiCard}
        >
          <View style={styles.aiCircle} />
          <View style={styles.aiBadge}>
            <Sparkles size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.aiBadgeText}>AI SUGGESTION</Text>
          </View>

          <Text style={styles.aiTitle}>Optimal Booking for Your Farm</Text>
          <Text style={styles.aiDescription}>
            “For your regional soil profiles, a cultivator for approximately {duration} {rentalType === 'hourly' ? 'hours' : 'days'} is recommended for best crop bed soil preparation.”
          </Text>
        </LinearGradient>

        {/* PRICE SUMMARY */}
        <View style={styles.priceSectionHeader}>
          <SectionTitle title="Price Summary" noMargin />
          <View style={styles.livePricing}>
            <View style={styles.liveDot} />
            <Text style={styles.livePricingText}>Live Calculation</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <SummaryRow
            label={`Rental (${duration} ${rentalType === 'hourly' ? 'hrs' : 'days'} × ₹${rentalType === 'hourly' ? hourlyPrice : dailyPrice})`}
            value={`₹${rentalTotal.toLocaleString('en-IN')}`}
          />

          <SummaryRow
            label={`Operator Fee`}
            value={includeOperator ? `₹${operatorTotal.toLocaleString('en-IN')}` : 'Not Included'}
          />

          <SummaryRow label="Transport" value="Free" green />

          {selectedImplement ? (
            <SummaryRow label={`Implement (${selectedImplement})`} value="Included" green />
          ) : null}

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <SectionTitle title="Additional Notes" />
        <View style={styles.notesBox}>
          <Pencil size={rf(20)} color="#94A3B8" strokeWidth={2.1} />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add instructions or local farm notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.notesInput}
          />
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>TOTAL PRICE</Text>
          <Text style={styles.bottomTotalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handleContinue} style={styles.continueButton}>
          <Text style={styles.continueText}>Continue</Text>
          <ArrowRight size={rf(21)} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({ title, noMargin = false }) {
  return (
    <Text style={[styles.sectionTitle, noMargin && styles.sectionTitleNoMargin]}>
      {title}
    </Text>
  );
}

function SummaryRow({ label, value, green = false }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, green && styles.greenSummaryValue]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  header: {
    height: 66,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F3',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerTitleBox: { marginLeft: 8 },
  headerTitle: { fontSize: rf(21), lineHeight: rf(25), fontWeight: '900', color: DARK },
  headerSubtitle: { marginTop: 1, fontSize: rf(12), fontWeight: '600', color: MUTED },
  scrollContent: { paddingHorizontal: PAGE_PADDING, paddingTop: 17, paddingBottom: 110 },
  machineCard: {
    minHeight: 126,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF0F1',
    flexDirection: 'row',
  },
  machineImage: { width: 100, height: 100, borderRadius: 8 },
  machineDetails: { flex: 1, marginLeft: 16 },
  machineName: { fontSize: rf(18), fontWeight: '900', color: DARK },
  machineSpecs: { marginTop: 20, fontSize: rf(11), fontWeight: '600', color: MUTED },
  machineRatingRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  machineRating: { fontSize: rf(12), fontWeight: '900', color: DARK },
  machineReviews: { fontSize: rf(10), fontWeight: '500', color: MUTED },
  machinePriceBox: { alignItems: 'flex-end' },
  machinePrice: { fontSize: rf(21), fontWeight: '900', color: GREEN },
  machinePriceUnit: { marginTop: 2, fontSize: rf(9), fontWeight: '600', color: MUTED },
  availableBadge: {
    marginTop: 32,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  availableText: { fontSize: rf(9), fontWeight: '900', color: GREEN },
  sectionTitle: { marginTop: 30, marginBottom: 14, fontSize: rf(16), fontWeight: '900', color: DARK },
  dateRow: { paddingRight: 12, gap: 14 },
  dateCard: {
    width: 68,
    height: 85,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateCard: { backgroundColor: GREEN, borderColor: GREEN },
  dateDay: { fontSize: rf(10), fontWeight: '600', color: '#94A3B8' },
  dateNumber: { marginTop: 4, fontSize: rf(21), fontWeight: '900', color: DARK },
  dateMonth: { marginTop: 3, fontSize: rf(9), fontWeight: '600', color: '#94A3B8' },
  selectedDateText: { color: '#FFFFFF' },
  selectedDateSubText: { color: '#BBF7D0' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  timeButton: {
    width: '31.5%',
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeButton: { backgroundColor: BRIGHT_GREEN, borderColor: BRIGHT_GREEN },
  disabledTimeButton: { backgroundColor: '#F1F3F6', borderColor: '#F1F3F6' },
  timeText: { fontSize: rf(13), fontWeight: '900', color: DARK },
  selectedTimeText: { color: '#FFFFFF' },
  disabledTimeText: { color: '#AEB5C0', textDecorationLine: 'line-through' },
  timeLegend: { marginTop: 14, flexDirection: 'row', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectedLegendBox: { width: 13, height: 13, borderRadius: 2, backgroundColor: BRIGHT_GREEN },
  unavailableLegendBox: { width: 13, height: 13, borderRadius: 2, backgroundColor: '#F1F3F6' },
  legendText: { fontSize: rf(10), fontWeight: '600', color: MUTED },
  rentalTabs: { height: 44, borderRadius: 10, padding: 4, backgroundColor: '#F1F3F6', flexDirection: 'row' },
  rentalTab: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  selectedRentalTab: { backgroundColor: '#FFFFFF' },
  rentalTabText: { fontSize: rf(12), fontWeight: '800', color: MUTED },
  selectedRentalTabText: { color: GREEN },
  durationCard: {
    minHeight: 66,
    marginTop: 14,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationLabel: { fontSize: rf(14), fontWeight: '700', color: MUTED },
  durationControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  durationButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationAddButton: { backgroundColor: GREEN },
  durationValue: { fontSize: rf(17), fontWeight: '900', color: DARK },
  operatorCard: {
    minHeight: 92,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorDetails: { flex: 1, marginLeft: 14 },
  operatorTitle: { fontSize: rf(15), fontWeight: '900', color: DARK },
  operatorPrice: { marginTop: 2, fontSize: rf(12), fontWeight: '900', color: '#F97316' },
  verifiedOperatorRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedOperatorText: { fontSize: rf(9), fontWeight: '800', color: BRIGHT_GREEN },
  implementWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  implementPill: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedImplementPill: { backgroundColor: GREEN, borderColor: GREEN },
  implementDot: { width: 6, height: 6, marginRight: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  implementText: { fontSize: rf(12), fontWeight: '800', color: '#475569' },
  selectedImplementText: { color: '#FFFFFF' },
  locationCard: {
    minHeight: 94,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDetails: { flex: 1, marginLeft: 14 },
  locationName: { fontSize: rf(15), fontWeight: '900', color: DARK },
  locationAddress: { marginTop: 3, fontSize: rf(10), fontWeight: '600', color: MUTED },
  locationDistance: { marginTop: 4, fontSize: rf(10), fontWeight: '900', color: '#F97316' },
  aiCard: { minHeight: 220, marginTop: 24, borderRadius: 12, padding: 18, overflow: 'hidden' },
  aiCircle: {
    position: 'absolute',
    right: -36,
    top: -47,
    width: 133,
    height: 133,
    borderRadius: 67,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  aiBadge: {
    alignSelf: 'flex-start',
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: { fontSize: rf(9), fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 },
  aiTitle: { marginTop: 16, fontSize: rf(18), fontWeight: '900', color: '#FFFFFF' },
  aiDescription: { marginTop: 9, fontSize: rf(12), lineHeight: rf(19), fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  priceSectionHeader: {
    marginTop: 30,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  livePricing: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  livePricingText: { fontSize: rf(9), fontWeight: '800', color: GREEN },
  summaryCard: { borderRadius: 10, padding: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER },
  summaryRow: { marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { flex: 1, marginRight: 10, fontSize: rf(12), fontWeight: '500', color: MUTED },
  summaryValue: { fontSize: rf(12), fontWeight: '900', color: DARK },
  greenSummaryValue: { color: GREEN },
  summaryDivider: { height: 1, marginTop: 2, marginBottom: 19, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: '#E5E7EB' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: rf(15), fontWeight: '900', color: DARK },
  totalValue: { fontSize: rf(23), fontWeight: '900', color: GREEN },
  notesBox: {
    minHeight: 90,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3E8',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notesInput: {
    flex: 1,
    minHeight: 70,
    marginLeft: 11,
    padding: 0,
    fontSize: rf(14),
    lineHeight: rf(20),
    fontWeight: '500',
    color: DARK,
    textAlignVertical: 'top',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 84,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomTotalLabel: { fontSize: rf(9), fontWeight: '700', color: '#94A3B8', letterSpacing: 0.3 },
  bottomTotalValue: { marginTop: 4, fontSize: rf(22), fontWeight: '900', color: GREEN },
  continueButton: {
    width: width * 0.41,
    height: 54,
    borderRadius: 18,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueText: { fontSize: rf(17), fontWeight: '900', color: '#FFFFFF' },
});