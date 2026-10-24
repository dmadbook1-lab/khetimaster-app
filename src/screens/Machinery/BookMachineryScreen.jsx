import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  AlertTriangle,
  Briefcase,
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Send,
  Sprout,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useLiveRegionPrefill } from '../../context/LocationContext';
import MarketHero, { TopInset } from '../../components/market/MarketHero';
import { LoadingState, MarketButton } from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import {
  Field,
  FormCard,
  FormInput,
  PickerField,
  SectionHeading,
  SelectChips,
  Stepper,
} from '../../components/labour/FormBits';
import useMachineryMeta from '../../components/machinery/useMachineryMeta';
import { machineryImageSource } from '../../components/machinery/machineryImages';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import { fetchMachineryById } from '../../redux/slices/machinerySlice';
import { createMachineryBooking } from '../../redux/slices/machineryBookingSlice';
import {
  PAYMENT_LABELS,
  UNIT_LABELS,
  buildRentalPayload,
  durationKind,
  estimateRental,
  getRateOptions,
  slotsOnDay,
} from '../../utils/machineryFormat';
import {
  addDaysToKey,
  formatDay,
  formatTime,
  formatTimeRange,
  minutesToTime,
  parseTime,
  toDayKey,
  todayInIndiaKey,
} from '../../utils/indiaSchedule';
import { formatRupees } from '../../utils/marketFormat';

const WORK_TYPES = [
  'Ploughing',
  'Rotavation',
  'Cultivation',
  'Sowing',
  'Harvesting',
  'Threshing',
  'Spraying',
  'Land levelling',
  'Transport',
  'Other',
];

const RATE_UNIT_TEXT = {
  hour: '/hour',
  day: '/day',
  acre: '/acre',
  job: '/job',
  custom: '',
};

const DEFAULT_DURATION = { hours: 4, days: 1, quantity: 1 };

const keyToLocalDate = key => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const timeToDate = value => {
  const minutes = parseTime(value) ?? 8 * 60;
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
};

/*
 * Loads the machine when opened directly, then shows the form.
 */
export default function BookMachineryScreen({ navigation, route }) {
  const { machineryId } = route.params;
  const dispatch = useDispatch();
  const selected = useSelector(state => state.machinery.selected);
  const machine = selected?._id === machineryId ? selected : null;

  useEffect(() => {
    if (!machine) dispatch(fetchMachineryById(machineryId));
  }, [dispatch, machine, machineryId]);

  if (!machine) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <MarketHero
          compact
          onBack={() => navigation.goBack()}
          title="Book machine"
        />
        <LoadingState />
      </SafeAreaView>
    );
  }

  return <BookingForm navigation={navigation} machine={machine} />;
}

function BookingForm({ navigation, machine }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();

  const user = useSelector(state => state.auth.user);
  const creating = useSelector(state => state.machineryBooking.creating);
  const { paymentMethods, maxBookingDays, maxBookingHours } =
    useMachineryMeta();

  const rates = useMemo(() => getRateOptions(machine), [machine]);
  const today = todayInIndiaKey();

  const [form, setForm] = useState(() => ({
    machineryId: machine._id,
    rateKey: rates[0]?.key,
    duration: String(DEFAULT_DURATION[durationKind(rates[0]?.unit)]),
    bookingDate: today,
    startTime: '08:00',
    endTime: '',
    workType: rates[0]?.pricingType === 'custom' ? rates[0].label : '',
    selectedImplement: '',
    village: user?.village || '',
    district: '',
    state: '',
    address: '',
    farmSize: '',
    crop: '',
    paymentMethod: 'cod',
    farmerNotes: '',
  }));
  useLiveRegionPrefill(setForm);

  // 'date' | 'start' | 'end' | null
  const [picker, setPicker] = useState(null);

  const setField = (key, value) =>
    setForm(previous => ({ ...previous, [key]: value }));

  const option = rates.find(rate => rate.key === form.rateKey);
  const kind = durationKind(option?.unit);

  const chooseRate = rate => {
    const nextKind = durationKind(rate.unit);

    setForm(previous => ({
      ...previous,
      rateKey: rate.key,
      duration:
        nextKind === kind
          ? previous.duration
          : String(DEFAULT_DURATION[nextKind]),
      endTime: nextKind === 'quantity' ? previous.endTime : '',
      workType:
        rate.pricingType === 'custom' && !previous.workType
          ? rate.label
          : previous.workType,
    }));
  };

  const quickDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const key = addDaysToKey(today, index);
        return {
          key,
          top:
            index === 0
              ? 'Today'
              : index === 1
              ? 'Tomorrow'
              : formatDay(key).split(',')[0],
          bottom: formatDay(key, { weekday: false, year: false }),
        };
      }),
    [today],
  );

  const isCustomDate = !quickDates.some(item => item.key === form.bookingDate);
  const bookedThatDay = slotsOnDay(machine.bookedSlots, form.bookingDate);

  const estimate = estimateRental({
    option,
    duration: form.duration,
    startTime: form.startTime,
    maxDays: maxBookingDays,
    maxHours: maxBookingHours,
  });

  const hourlyEnd =
    kind === 'hours' &&
    estimate.endMinute !== null &&
    estimate.endMinute !== undefined
      ? formatTime(minutesToTime(estimate.endMinute))
      : null;

  const handlePickerChange = (event, date) => {
    const target = picker;
    setPicker(null);

    if (event.type !== 'set' || !date || !target) return;

    if (target === 'date') {
      setField('bookingDate', toDayKey(date));
    } else {
      setField(
        target === 'start' ? 'startTime' : 'endTime',
        minutesToTime(date.getHours() * 60 + date.getMinutes()),
      );
    }
  };

  const handleSubmit = () => {
    const { payload, error } = buildRentalPayload(form, {
      option,
      maxDays: maxBookingDays,
      maxHours: maxBookingHours,
      today,
    });

    if (error) {
      feedback.error('Check your booking', error);
      return;
    }

    const when =
      kind === 'days' && payload.duration > 1
        ? `${formatDay(payload.bookingDate, { year: false })} for ${
            payload.duration
          } days`
        : `${formatDay(payload.bookingDate, { year: false })}, ${formatTime(
            payload.startTime,
          )}`;

    feedback.confirm({
      title: `Rent ${machine.name}?`,
      message: `${payload.workType} · ${when}. Estimated ${formatRupees(
        estimate.total,
      )}. You'll get the owner's phone number once they confirm.`,
      confirmLabel: 'Send Request',
      onConfirm: async () => {
        try {
          const result = await dispatch(
            createMachineryBooking(payload),
          ).unwrap();

          feedback.success(
            'Request sent!',
            'The owner will confirm your booking soon. We will show their phone number once they do.',
            {
              primaryLabel: 'View Booking',
              dismissable: false,
              onPrimary: () =>
                navigation.replace(MACHINERY_ROUTES.BOOKING_DETAILS, {
                  bookingId: result.booking._id,
                }),
            },
          );
        } catch (failure) {
          feedback.error('Could not send request', failure?.message, {
            ...(failure?.bookingId && {
              primaryLabel: 'View Booking',
              secondaryLabel: 'Close',
              onPrimary: () =>
                navigation.replace(MACHINERY_ROUTES.BOOKING_DETAILS, {
                  bookingId: failure.bookingId,
                }),
            }),
          });
        }
      },
    });
  };

  const implementOptions = machine.supportsImplements
    ? machine.supportedImplements || []
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <MarketHero
            compact
            onBack={() => navigation.goBack()}
            eyebrow="Book machinery"
            title="Rent for your farm"
          >
            <View style={styles.machineCard}>
              <Image
                source={machineryImageSource(machine)}
                style={styles.machineImage}
              />
              <View style={styles.flex}>
                <Text style={styles.machineName} numberOfLines={1}>
                  {machine.name}
                </Text>
                <Text style={styles.machineMeta} numberOfLines={1}>
                  {[machine.category, machine.brand]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text style={styles.machineOwner} numberOfLines={1}>
                  Owner: {machine.owner?.fullName || machine.ownerName}
                </Text>
              </View>
            </View>
          </MarketHero>

          <View style={styles.body}>
            {/* RATE */}
            <SectionHeading
              icon={<IndianRupee size={16} color={C.green} />}
              title="How do you want to rent?"
            />
            <View style={styles.rateList}>
              {rates.map(rate => {
                const selected = rate.key === form.rateKey;
                return (
                  <TouchableOpacity
                    key={rate.key}
                    activeOpacity={0.85}
                    onPress={() => chooseRate(rate)}
                    style={[styles.rate, selected && styles.rateSelected]}
                  >
                    <Text
                      style={[
                        styles.rateLabel,
                        selected && styles.rateTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {rate.label}
                    </Text>
                    <Text
                      style={[
                        styles.rateAmount,
                        selected && styles.rateTextSelected,
                      ]}
                    >
                      ₹{rate.amount}
                      <Text style={styles.rateUnit}>
                        {RATE_UNIT_TEXT[rate.unit] ?? ''}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FormCard>
              {kind === 'hours' && (
                <Field
                  label="How many hours?"
                  hint={
                    hourlyEnd
                      ? `Ends around ${hourlyEnd}`
                      : `Up to ${maxBookingHours} hours, on the same day`
                  }
                >
                  <Stepper
                    value={Number(form.duration) || 1}
                    onChange={value => setField('duration', String(value))}
                    max={maxBookingHours}
                    suffix="hours"
                  />
                </Field>
              )}
              {kind === 'days' && (
                <Field
                  label="How many days?"
                  hint={`Up to ${maxBookingDays} days`}
                >
                  <Stepper
                    value={Number(form.duration) || 1}
                    onChange={value => setField('duration', String(value))}
                    max={maxBookingDays}
                    suffix={Number(form.duration) === 1 ? 'day' : 'days'}
                  />
                </Field>
              )}
              {kind === 'quantity' && (
                <Field
                  label={
                    option?.unit === 'custom'
                      ? 'Quantity'
                      : `How many ${UNIT_LABELS[option?.unit] || 'unit'}s?`
                  }
                >
                  <FormInput
                    value={form.duration}
                    onChangeText={value => setField('duration', value)}
                    keyboardType="decimal-pad"
                    placeholder="1"
                  />
                </Field>
              )}
            </FormCard>

            {/* WHEN */}
            <SectionHeading
              icon={<CalendarDays size={16} color={C.blue} />}
              color={C.blue}
              title="When?"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
            >
              {quickDates.map(item => {
                const selected = item.key === form.bookingDate;
                const busy =
                  slotsOnDay(machine.bookedSlots, item.key).length > 0;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.85}
                    onPress={() => setField('bookingDate', item.key)}
                    style={[
                      styles.dateChip,
                      selected && styles.dateChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateTop,
                        selected && styles.dateTextSelected,
                      ]}
                    >
                      {item.top}
                    </Text>
                    <Text
                      style={[
                        styles.dateBottom,
                        selected && styles.dateTextSelected,
                      ]}
                    >
                      {item.bottom}
                    </Text>
                    {busy && <View style={styles.busyDot} />}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPicker('date')}
                style={[
                  styles.dateChip,
                  isCustomDate && styles.dateChipSelected,
                ]}
              >
                <CalendarDays
                  size={17}
                  color={isCustomDate ? C.white : C.green}
                />
                <Text
                  style={[
                    styles.dateBottom,
                    isCustomDate && styles.dateTextSelected,
                  ]}
                >
                  {isCustomDate
                    ? formatDay(form.bookingDate, {
                        weekday: false,
                        year: false,
                      })
                    : 'Other'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {bookedThatDay.length > 0 && (
              <View style={styles.busyBanner}>
                <AlertTriangle size={16} color={C.amber} />
                <Text style={styles.busyText}>
                  Already booked on this day:{' '}
                  {bookedThatDay
                    .map(slot =>
                      slot.endTime
                        ? formatTimeRange(slot.startTime, slot.endTime)
                        : 'whole day',
                    )
                    .join(', ')}
                  . Pick another time or day.
                </Text>
              </View>
            )}

            {kind !== 'days' && (
              <FormCard>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Field label="Start time *">
                      <PickerField
                        icon={<Clock size={16} color={C.green} />}
                        value={formatTime(form.startTime)}
                        placeholder="Start"
                        onPress={() => setPicker('start')}
                      />
                    </Field>
                  </View>
                  {kind === 'quantity' && (
                    <View style={styles.flex}>
                      <Field label="End time">
                        <PickerField
                          icon={<Clock size={16} color={C.green} />}
                          value={form.endTime ? formatTime(form.endTime) : ''}
                          placeholder="Optional"
                          onPress={() => setPicker('end')}
                          onClear={() => setField('endTime', '')}
                        />
                      </Field>
                    </View>
                  )}
                </View>
              </FormCard>
            )}

            {/* WORK */}
            <SectionHeading
              icon={<Briefcase size={16} color={C.orange} />}
              color={C.orange}
              title="What work?"
            />
            <FormCard>
              <Field label="Type of work *">
                <SelectChips
                  options={
                    form.workType && !WORK_TYPES.includes(form.workType)
                      ? [form.workType, ...WORK_TYPES]
                      : WORK_TYPES
                  }
                  value={form.workType}
                  onChange={value => setField('workType', value)}
                />
              </Field>
              {implementOptions.length > 0 && (
                <Field label="Implement needed" hint="Tap again to remove.">
                  <SelectChips
                    options={implementOptions}
                    value={form.selectedImplement}
                    onChange={value =>
                      setField(
                        'selectedImplement',
                        value === form.selectedImplement ? '' : value,
                      )
                    }
                  />
                </Field>
              )}
            </FormCard>

            {/* FARM */}
            <SectionHeading
              icon={<Sprout size={16} color={C.green} />}
              title="About your farm"
              subtitle="Helps the owner plan the work"
            />
            <FormCard>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label="Farm size">
                    <FormInput
                      value={form.farmSize}
                      onChangeText={value => setField('farmSize', value)}
                      placeholder="e.g. 3 acres"
                      maxLength={50}
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label="Crop">
                    <FormInput
                      value={form.crop}
                      onChangeText={value => setField('crop', value)}
                      placeholder="e.g. Soybean"
                      maxLength={100}
                    />
                  </Field>
                </View>
              </View>
            </FormCard>

            {/* WHERE */}
            <SectionHeading
              icon={<MapPin size={16} color={C.blue} />}
              color={C.blue}
              title="Where is the farm?"
              subtitle="Filled from your profile. Change it if the farm is elsewhere."
            />
            <FormCard>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label="Village">
                    <FormInput
                      value={form.village}
                      onChangeText={value => setField('village', value)}
                      placeholder="Village"
                    />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label="District">
                    <FormInput
                      value={form.district}
                      onChangeText={value => setField('district', value)}
                      placeholder="District"
                    />
                  </Field>
                </View>
              </View>
              <Field label="Farm address / landmark">
                <FormInput
                  value={form.address}
                  onChangeText={value => setField('address', value)}
                  placeholder="e.g. Behind the school, Patil farm"
                  maxLength={300}
                />
              </Field>
              <Field label="Pay with">
                <SelectChips
                  options={
                    paymentMethods.length ? paymentMethods : ['cod', 'upi']
                  }
                  labels={PAYMENT_LABELS}
                  value={form.paymentMethod}
                  onChange={value => setField('paymentMethod', value)}
                />
              </Field>
              <Field label="Note to owner (optional)">
                <FormInput
                  value={form.farmerNotes}
                  onChangeText={value => setField('farmerNotes', value)}
                  placeholder="e.g. Field is muddy after rain"
                  maxLength={500}
                />
              </Field>
            </FormCard>

            <Text style={styles.disclaimer}>
              The final amount is calculated from the owner's rates when the
              request is sent. Pay the owner directly after the work.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        <View style={styles.flex}>
          <Text style={styles.bottomLabel}>Estimated total</Text>
          <Text style={styles.bottomTotal}>
            {estimate.total ? formatRupees(estimate.total) : '—'}
          </Text>
        </View>
        <MarketButton
          label="Send Request"
          icon={<Send size={16} color={C.white} />}
          loading={creating}
          onPress={handleSubmit}
          style={styles.flexWide}
        />
      </View>

      {!!picker && (
        <DateTimePicker
          value={
            picker === 'date'
              ? keyToLocalDate(form.bookingDate)
              : timeToDate(
                  picker === 'start' ? form.startTime : form.endTime || '17:00',
                )
          }
          mode={picker === 'date' ? 'date' : 'time'}
          minimumDate={picker === 'date' ? keyToLocalDate(today) : undefined}
          display={
            Platform.OS === 'ios'
              ? picker === 'date'
                ? 'inline'
                : 'spinner'
              : 'default'
          }
          onChange={handlePickerChange}
        />
      )}

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  flexWide: { flex: 1.3 },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 12 },

  machineCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  machineImage: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#E3EEE7',
  },
  machineName: { fontSize: 16, fontWeight: '900', color: C.white },
  machineMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BFF0D2',
    marginTop: 1,
  },
  machineOwner: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  rateList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  rate: {
    width: '47%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  rateSelected: { backgroundColor: C.green, borderColor: C.green },
  rateLabel: { fontSize: 12, fontWeight: '800', color: C.muted },
  rateAmount: { fontSize: 20, fontWeight: '900', color: C.dark, marginTop: 4 },
  rateUnit: { fontSize: 12, fontWeight: '700' },
  rateTextSelected: { color: C.white },

  dateList: { gap: 8, paddingTop: 12, paddingBottom: 2 },
  dateChip: {
    width: 74,
    height: 66,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateChipSelected: { backgroundColor: C.green, borderColor: C.green },
  dateTop: { fontSize: 11, fontWeight: '800', color: C.muted },
  dateBottom: { fontSize: 13, fontWeight: '900', color: C.dark },
  dateTextSelected: { color: C.white },
  busyDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.gold,
  },
  busyBanner: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.lightAmber,
  },
  busyText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#8A5A00',
    lineHeight: 17,
  },

  disclaimer: {
    marginTop: 16,
    fontSize: 11.5,
    color: C.muted,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bottomLabel: { fontSize: 11, color: C.muted, fontWeight: '700' },
  bottomTotal: {
    fontSize: 20,
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});
