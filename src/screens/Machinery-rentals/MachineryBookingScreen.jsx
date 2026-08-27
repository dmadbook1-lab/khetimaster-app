import React, {useMemo, useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
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
  Eye,
  Pencil,
  ArrowRight,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const BRIGHT_GREEN = '#18B94D';
const DARK = '#171717';
const MUTED = '#7A8495';
const BORDER = '#E5E7EB';
const PAGE_BG = '#FFFFFF';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

const DATE_OPTIONS = [
  {
    id: '25',
    day: 'Thu',
    date: '25',
    month: 'Jun',
  },
  {
    id: '26',
    day: 'Today',
    date: '26',
    month: 'Jun',
  },
  {
    id: '27',
    day: 'Sat',
    date: '27',
    month: 'Jun',
  },
  {
    id: '28',
    day: 'Sun',
    date: '28',
    month: 'Jun',
  },
  {
    id: '29',
    day: 'Mon',
    date: '29',
    month: 'Jun',
  },
];

const TIME_OPTIONS = [
  {
    id: '6',
    label: '6:00 AM',
    unavailable: true,
  },
  {
    id: '7',
    label: '7:00 AM',
  },
  {
    id: '8',
    label: '8:00 AM',
  },
  {
    id: '9',
    label: '9:00 AM',
  },
  {
    id: '10',
    label: '10:00 AM',
  },
  {
    id: '11',
    label: '11:00 AM',
    unavailable: true,
  },
  {
    id: '12',
    label: '12:00 PM',
  },
  {
    id: '14',
    label: '2:00 PM',
  },
];

const RENTAL_TYPES = [
  {
    id: 'hourly',
    label: 'Hourly',
  },
  {
    id: 'half-day',
    label: 'Half Day',
  },
  {
    id: 'full-day',
    label: 'Full Day',
  },
];

const IMPLEMENTS = [
  'Rotavator',
  'Cultivator',
  'Plough',
  'Seed Drill',
  'Trailer',
];

const DEFAULT_MACHINE = {
  name: 'Sonalika DI 745',
  horsepower: '45 HP',
  driveType: '2WD',
  fuelType: 'Diesel',
  rating: '4.8',
  reviews: 128,
  hourlyPrice: 650,
  image: require('../../assets/machinery/sonalika-di-745.jpg'),
};

export default function MachineryBookingScreen({
  navigation,
  route,
}) {
  const machine = route?.params?.machine || DEFAULT_MACHINE;

  const [selectedDate, setSelectedDate] = useState('26');
  const [selectedTime, setSelectedTime] = useState('8');
  const [rentalType, setRentalType] = useState(
    route?.params?.selectedPlan === 'day'
      ? 'full-day'
      : 'hourly',
  );

  const [hours, setHours] = useState(4);
  const [includeOperator, setIncludeOperator] = useState(true);
  const [selectedImplements, setSelectedImplements] = useState([
    'Rotavator',
    'Cultivator',
  ]);

  const [notes, setNotes] = useState('');

  const rentalTotal = useMemo(
    () => Number(machine.hourlyPrice || 650) * hours,
    [machine.hourlyPrice, hours],
  );

  const operatorTotal = includeOperator ? 250 * hours : 0;

  const totalAmount = rentalTotal + operatorTotal;

  const toggleImplement = implement => {
    setSelectedImplements(current => {
      if (current.includes(implement)) {
        return current.filter(item => item !== implement);
      }

      return [...current, implement];
    });
  };

const handleContinue = () => {
  navigation.navigate('ConfirmMachineryBooking', {
    machine,
    selectedDate,
    selectedTime,
    rentalType,
    hours,
    includeOperator,
    selectedImplements,
    notes,
    rentalTotal,
    operatorTotal,
    totalAmount,
  });
};

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MachineryDetails', {
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
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            Booking Details
          </Text>

          <Text style={styles.headerSubtitle}>
            {machine.name}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.machineCard}>
          <Image
            source={machine.image}
            style={styles.machineImage}
            resizeMode="cover"
          />

          <View style={styles.machineDetails}>
            <Text
              numberOfLines={1}
              style={styles.machineName}>
              {machine.name}
            </Text>

            <Text style={styles.machineSpecs}>
              {machine.horsepower || '45 HP'} •{' '}
              {machine.driveType || '2WD'} •{' '}
              {machine.fuelType || 'Diesel'}
            </Text>

            <View style={styles.machineRatingRow}>
              <Star
                size={rf(14)}
                color="#FACC15"
                fill="#FACC15"
              />

              <Text style={styles.machineRating}>
                {machine.rating || '4.8'}
              </Text>

              <Text style={styles.machineReviews}>
                ({machine.reviews || 128} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.machinePriceBox}>
            <Text style={styles.machinePrice}>
              ₹{machine.hourlyPrice || 650}
            </Text>

            <Text style={styles.machinePriceUnit}>
              per hour
            </Text>

            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                Available Today
              </Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Select Date" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}>
          {DATE_OPTIONS.map(item => {
            const selected = selectedDate === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setSelectedDate(item.id)}
                style={[
                  styles.dateCard,
                  selected && styles.selectedDateCard,
                ]}>
                <Text
                  style={[
                    styles.dateDay,
                    selected && styles.selectedDateText,
                  ]}>
                  {item.day}
                </Text>

                <Text
                  style={[
                    styles.dateNumber,
                    selected && styles.selectedDateText,
                  ]}>
                  {item.date}
                </Text>

                <Text
                  style={[
                    styles.dateMonth,
                    selected && styles.selectedDateSubText,
                  ]}>
                  {item.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
                ]}>
                <Text
                  style={[
                    styles.timeText,
                    selected && styles.selectedTimeText,
                    item.unavailable &&
                      styles.disabledTimeText,
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

            <Text style={styles.legendText}>
              Selected
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={styles.unavailableLegendBox} />

            <Text style={styles.legendText}>
              Unavailable
            </Text>
          </View>
        </View>

        <SectionTitle title="Rental Duration" />

        <View style={styles.rentalTabs}>
          {RENTAL_TYPES.map(item => {
            const selected = rentalType === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setRentalType(item.id)}
                style={[
                  styles.rentalTab,
                  selected && styles.selectedRentalTab,
                ]}>
                <Text
                  style={[
                    styles.rentalTabText,
                    selected &&
                      styles.selectedRentalTabText,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>
            Duration
          </Text>

          <View style={styles.durationControls}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setHours(current => Math.max(1, current - 1))
              }
              style={styles.durationButton}>
              <Minus
                size={rf(18)}
                color="#94A3B8"
                strokeWidth={2.3}
              />
            </TouchableOpacity>

            <Text style={styles.durationValue}>
              {hours} Hours
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setHours(current => Math.min(24, current + 1))
              }
              style={[
                styles.durationButton,
                styles.durationAddButton,
              ]}>
              <Plus
                size={rf(18)}
                color="#FFFFFF"
                strokeWidth={2.3}
              />
            </TouchableOpacity>
          </View>
        </View>

        <SectionTitle title="Operator" />

        <View style={styles.operatorCard}>
          <View style={styles.operatorIconBox}>
            <UserRound
              size={rf(22)}
              color={BRIGHT_GREEN}
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.operatorDetails}>
            <Text style={styles.operatorTitle}>
              Include Driver / Operator
            </Text>

            <Text style={styles.operatorPrice}>
              + ₹250 / Hour
            </Text>

            <View style={styles.verifiedOperatorRow}>
              <CheckCircle2
                size={rf(12)}
                color={BRIGHT_GREEN}
                fill={BRIGHT_GREEN}
              />

              <Text style={styles.verifiedOperatorText}>
                Verified Operator
              </Text>
            </View>
          </View>

          <Switch
            value={includeOperator}
            onValueChange={setIncludeOperator}
            trackColor={{
              false: '#D1D5DB',
              true: '#20C55A',
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        <SectionTitle title="Select Implements" />

        <View style={styles.implementWrap}>
          {IMPLEMENTS.map(implement => {
            const selected =
              selectedImplements.includes(implement);

            return (
              <TouchableOpacity
                key={implement}
                activeOpacity={0.85}
                onPress={() => toggleImplement(implement)}
                style={[
                  styles.implementPill,
                  selected &&
                    styles.selectedImplementPill,
                ]}>
                {selected && (
                  <View style={styles.implementDot} />
                )}

                <Text
                  style={[
                    styles.implementText,
                    selected &&
                      styles.selectedImplementText,
                  ]}>
                  {implement}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionTitle title="Delivery Location" />

        <View style={styles.locationCard}>
          <View style={styles.locationIconBox}>
            <MapPin
              size={rf(23)}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          </View>

          <View style={styles.locationDetails}>
            <Text style={styles.locationName}>
              Patil Farm
            </Text>

            <Text
              numberOfLines={1}
              style={styles.locationAddress}>
              Village Khadki, Aurangabad, MH
            </Text>

            <Text style={styles.locationDistance}>
              2.1 km Away
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Change Location',
                'Location selection screen can be opened here.',
              )
            }>
            <Text style={styles.changeText}>
              Change
            </Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#16883E', '#20C55A']}
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
              AI SUGGESTION
            </Text>
          </View>

          <Text style={styles.aiTitle}>
            Optimal Booking for Your Farm
          </Text>

          <Text style={styles.aiDescription}>
            “For your 2.34-acre soybean farm, a 45 HP tractor
            with a cultivator for approximately 4 hours is
            recommended for best soil preparation.”
          </Text>

          <View style={styles.aiCompletionCard}>
            <View style={styles.aiClockBox}>
              <Clock3
                size={rf(20)}
                color="#FFFFFF"
                strokeWidth={2.3}
              />
            </View>

            <View style={styles.aiCompletionDetails}>
              <Text style={styles.aiCompletionLabel}>
                Estimated Completion
              </Text>

              <Text style={styles.aiCompletionTime}>
                12:30 PM
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSelectedDate('26');
                setSelectedTime('8');
                setRentalType('hourly');
                setHours(4);
                setIncludeOperator(true);
                setSelectedImplements([
                  'Rotavator',
                  'Cultivator',
                ]);
              }}
              style={styles.applyButton}>
              <Text style={styles.applyButtonText}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.priceSectionHeader}>
          <SectionTitle
            title="Price Summary"
            noMargin
          />

          <View style={styles.livePricing}>
            <View style={styles.liveDot} />

            <Text style={styles.livePricingText}>
              Live Pricing
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <SummaryRow
            label={`Rental (${hours} hrs × ₹${
              machine.hourlyPrice || 650
            })`}
            value={`₹${rentalTotal.toLocaleString(
              'en-IN',
            )}`}
          />

          <SummaryRow
            label={`Operator (${hours} hrs × ₹250)`}
            value={
              includeOperator
                ? `₹${operatorTotal.toLocaleString('en-IN')}`
                : 'Not Included'
            }
          />

          <SummaryRow
            label="Transport"
            value="Free"
            green
          />

          <SummaryRow
            label={`Implements (${
              selectedImplements[0] || 'None'
            })`}
            value={
              selectedImplements.length > 0
                ? 'Included'
                : 'Not Selected'
            }
            green={selectedImplements.length > 0}
          />

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Amount
            </Text>

            <Text style={styles.totalValue}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <SectionTitle title="Additional Notes" />

        <View style={styles.notesBox}>
          <Pencil
            size={rf(18)}
            color="#94A3B8"
            strokeWidth={2.1}
          />

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add instructions for the owner..."
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.notesInput}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>
            TOTAL PRICE
          </Text>

          <Text style={styles.bottomTotalValue}>
            ₹{totalAmount.toLocaleString('en-IN')}
          </Text>
        </View>

      <TouchableOpacity
  activeOpacity={0.9}
  onPress={handleContinue}
  style={styles.continueButton}>
  <Text style={styles.continueText}>
    Continue
  </Text>

  <ArrowRight
    size={rf(19)}
    color="#FFFFFF"
    strokeWidth={2.5}
  />
</TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({title, noMargin = false}) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        noMargin && styles.sectionTitleNoMargin,
      ]}>
      {title}
    </Text>
  );
}

function SummaryRow({
  label,
  value,
  green = false,
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.summaryValue,
          green && styles.greenSummaryValue,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },

  header: {
    height: 63,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F3',
  },

  backButton: {
    width: 41,
    height: 41,
    justifyContent: 'center',
  },

  headerTitleBox: {
    marginLeft: 8,
  },

  headerTitle: {
    fontSize: rf(20),
    lineHeight: rf(24),
    fontWeight: '900',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: rf(11),
    fontWeight: '600',
    color: MUTED,
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 17,
    paddingBottom: 110,
  },

  machineCard: {
    minHeight: 122,
    borderRadius: 11,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF0F1',
    flexDirection: 'row',
  },

  machineImage: {
    width: 96,
    height: 96,
    borderRadius: 7,
  },

  machineDetails: {
    flex: 1,
    marginLeft: 15,
  },

  machineName: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  machineSpecs: {
    marginTop: 24,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },

  machineRatingRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  machineRating: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },

  machineReviews: {
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  machinePriceBox: {
    alignItems: 'flex-end',
  },

  machinePrice: {
    fontSize: rf(20),
    fontWeight: '900',
    color: GREEN,
  },

  machinePriceUnit: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '500',
    color: MUTED,
  },

  availableBadge: {
    marginTop: 36,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 9,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },

  availableText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: GREEN,
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 13,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  sectionTitleNoMargin: {
    marginTop: 0,
    marginBottom: 0,
  },

  dateRow: {
    paddingRight: 12,
    gap: 14,
  },

  dateCard: {
    width: 64,
    height: 81,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDateCard: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  dateDay: {
    fontSize: rf(9),
    fontWeight: '500',
    color: '#94A3B8',
  },

  dateNumber: {
    marginTop: 4,
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  dateMonth: {
    marginTop: 3,
    fontSize: rf(8),
    fontWeight: '500',
    color: '#94A3B8',
  },

  selectedDateText: {
    color: '#FFFFFF',
  },

  selectedDateSubText: {
    color: '#BBF7D0',
  },

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  timeButton: {
    width: '31.5%',
    height: 43,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedTimeButton: {
    backgroundColor: BRIGHT_GREEN,
    borderColor: BRIGHT_GREEN,
  },

  disabledTimeButton: {
    backgroundColor: '#F1F3F6',
    borderColor: '#F1F3F6',
  },

  timeText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },

  selectedTimeText: {
    color: '#FFFFFF',
  },

  disabledTimeText: {
    color: '#AEB5C0',
    textDecorationLine: 'line-through',
  },

  timeLegend: {
    marginTop: 13,
    flexDirection: 'row',
    gap: 17,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  selectedLegendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: BRIGHT_GREEN,
  },

  unavailableLegendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#F1F3F6',
  },

  legendText: {
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  rentalTabs: {
    height: 41,
    borderRadius: 9,
    padding: 4,
    backgroundColor: '#F1F3F6',
    flexDirection: 'row',
  },

  rentalTab: {
    flex: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedRentalTab: {
    backgroundColor: '#FFFFFF',
  },

  rentalTabText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: MUTED,
  },

  selectedRentalTabText: {
    color: GREEN,
  },

  durationCard: {
    minHeight: 63,
    marginTop: 13,
    borderRadius: 9,
    paddingHorizontal: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  durationLabel: {
    fontSize: rf(13),
    fontWeight: '600',
    color: MUTED,
  },

  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  durationButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  durationAddButton: {
    backgroundColor: GREEN,
  },

  durationValue: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  operatorCard: {
    minHeight: 89,
    borderRadius: 9,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  operatorIconBox: {
    width: 41,
    height: 41,
    borderRadius: 8,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  operatorDetails: {
    flex: 1,
    marginLeft: 13,
  },

  operatorTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  operatorPrice: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '900',
    color: '#F97316',
  },

  verifiedOperatorRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  verifiedOperatorText: {
    fontSize: rf(8),
    fontWeight: '800',
    color: BRIGHT_GREEN,
  },

  implementWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  implementPill: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedImplementPill: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  implementDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  implementText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#475569',
  },

  selectedImplementText: {
    color: '#FFFFFF',
  },

  locationCard: {
    minHeight: 91,
    borderRadius: 9,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationDetails: {
    flex: 1,
    marginLeft: 13,
  },

  locationName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  locationAddress: {
    marginTop: 3,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  locationDistance: {
    marginTop: 4,
    fontSize: rf(9),
    fontWeight: '900',
    color: '#F97316',
  },

  changeText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },

  aiCard: {
    minHeight: 249,
    marginTop: 24,
    marginHorizontal: 25,
    borderRadius: 5,
    padding: 17,
    overflow: 'hidden',
  },

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
    height: 25,
    borderRadius: 13,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  aiBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  aiTitle: {
    marginTop: 16,
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiDescription: {
    marginTop: 9,
    fontSize: rf(11),
    lineHeight: rf(18),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },

  aiCompletionCard: {
    minHeight: 63,
    marginTop: 17,
    borderRadius: 8,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(0,110,45,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiClockBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiCompletionDetails: {
    flex: 1,
    marginLeft: 12,
  },

  aiCompletionLabel: {
    fontSize: rf(8),
    fontWeight: '500',
    color: '#D1FAE5',
  },

  aiCompletionTime: {
    marginTop: 3,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  applyButton: {
    height: 35,
    borderRadius: 7,
    paddingHorizontal: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  priceSectionHeader: {
    marginTop: 28,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  livePricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },

  livePricingText: {
    fontSize: rf(8),
    fontWeight: '800',
    color: GREEN,
  },

  summaryCard: {
    borderRadius: 9,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  summaryRow: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    flex: 1,
    marginRight: 10,
    fontSize: rf(11),
    fontWeight: '500',
    color: MUTED,
  },

  summaryValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },

  greenSummaryValue: {
    color: GREEN,
  },

  summaryDivider: {
    height: 1,
    marginTop: 2,
    marginBottom: 19,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#E5E7EB',
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  totalValue: {
    fontSize: rf(22),
    fontWeight: '900',
    color: GREEN,
  },

  notesBox: {
    minHeight: 85,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingTop: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3E8',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  notesInput: {
    flex: 1,
    minHeight: 65,
    marginLeft: 11,
    padding: 0,
    fontSize: rf(13),
    lineHeight: rf(19),
    fontWeight: '500',
    color: DARK,
    textAlignVertical: 'top',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 80,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomTotalLabel: {
    fontSize: rf(8),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },

  bottomTotalValue: {
    marginTop: 4,
    fontSize: rf(21),
    fontWeight: '900',
    color: GREEN,
  },

  continueButton: {
    width: width * 0.39,
    height: 53,
    borderRadius: 17,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  continueText: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});