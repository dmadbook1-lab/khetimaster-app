import React, { useMemo, useState } from 'react';
import {
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
  Briefcase,
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Send,
  Star,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, { TopInset } from '../../components/market/MarketHero';
import { MarketButton } from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import PersonAvatar from '../../components/labour/PersonAvatar';
import useLabourMeta from '../../components/labour/useLabourMeta';
import {
  Field,
  FormCard,
  FormInput,
  PickerField,
  SectionHeading,
  SelectChips,
  Stepper,
} from '../../components/labour/FormBits';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import { createLabourBooking } from '../../redux/slices/labourBookingSlice';
import {
  WAGE_TYPE_LABELS,
  addDaysToKey,
  buildBookingPayload,
  estimateTotal,
  formatDateRange,
  formatDay,
  formatTime,
  formatTimeRange,
  formatWage,
  parseTime,
  minutesToTime,
  toDayKey,
  todayInIndiaKey,
} from '../../utils/labourFormat';
import { formatRupees } from '../../utils/marketFormat';

const TIME_PRESETS = [
  { key: 'full', label: 'Full day', start: '08:00', end: '17:00' },
  { key: 'morning', label: 'Morning', start: '07:00', end: '12:00' },
  { key: 'afternoon', label: 'Afternoon', start: '13:00', end: '18:00' },
];

const WAGE_TYPES = ['daily', 'hourly', 'monthly'];

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

export default function BookLabourScreen({ navigation, route }) {
  const { labourer } = route.params;
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();

  const user = useSelector(state => state.auth.user);
  const creating = useSelector(state => state.labourBooking.creating);
  const { workTypes, maxBookingDays } = useLabourMeta();

  const today = todayInIndiaKey();

  const [form, setForm] = useState(() => ({
    labourerId: labourer._id,
    bookingDate: today,
    numberOfDays: 1,
    startTime: '08:00',
    endTime: '17:00',
    workType: labourer.preferredWork?.[0] || '',
    description: '',
    wage: labourer.expectedWage ? String(labourer.expectedWage) : '',
    wageType: labourer.wageType || 'daily',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    address: '',
    farmerNotes: '',
  }));

  // 'date' | 'start' | 'end' | null
  const [picker, setPicker] = useState(null);

  const setField = (key, value) =>
    setForm(previous => ({ ...previous, [key]: value }));

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

  const workOptions = useMemo(() => {
    const options = [...workTypes];
    for (const work of labourer.preferredWork || []) {
      if (!options.includes(work)) options.unshift(work);
    }
    return options;
  }, [workTypes, labourer.preferredWork]);

  const estimate = estimateTotal(form);
  const isCustomDate = !quickDates.some(item => item.key === form.bookingDate);

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
    const { payload, error } = buildBookingPayload(form, {
      maxDays: maxBookingDays,
      today,
    });

    if (error) {
      feedback.error('Check your booking', error);
      return;
    }

    feedback.confirm({
      title: `Send request to ${labourer.fullName}?`,
      message: `${payload.workType} on ${formatDateRange(
        payload.bookingDate,
        payload.numberOfDays,
      )}, ${formatTimeRange(
        payload.startTime,
        payload.endTime,
      )}. Estimated ${formatRupees(
        estimate,
      )}. You'll get their phone number once they accept.`,
      confirmLabel: 'Send Request',
      onConfirm: async () => {
        try {
          const result = await dispatch(createLabourBooking(payload)).unwrap();

          feedback.success(
            'Request sent!',
            `${labourer.fullName} will see your request now. We'll show their phone number here once they accept.`,
            {
              primaryLabel: 'View Booking',
              dismissable: false,
              onPrimary: () =>
                navigation.replace(LABOUR_ROUTES.BOOKING_DETAILS, {
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
                navigation.replace(LABOUR_ROUTES.BOOKING_DETAILS, {
                  bookingId: failure.bookingId,
                }),
            }),
          });
        }
      },
    });
  };

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
            eyebrow="Book a worker"
            title="Hire for your farm"
          >
            <View style={styles.workerCard}>
              <PersonAvatar
                name={labourer.fullName}
                image={labourer.profileImage}
                size={54}
              />
              <View style={styles.flex}>
                <Text style={styles.workerName} numberOfLines={1}>
                  {labourer.fullName}
                </Text>
                <Text style={styles.workerType} numberOfLines={1}>
                  {labourer.labourType}
                </Text>
                <View style={styles.inline}>
                  <Star size={11} color={C.gold} fill={C.gold} />
                  <Text style={styles.workerMeta}>
                    {labourer.totalReviews ? `${labourer.rating} · ` : ''}
                    {formatWage(labourer.expectedWage, labourer.wageType)}
                  </Text>
                </View>
              </View>
            </View>
          </MarketHero>

          <View style={styles.body}>
            {/* WHEN */}
            <SectionHeading
              icon={<CalendarDays size={16} color={C.green} />}
              title="When do you need them?"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
            >
              {quickDates.map(item => {
                const selected = item.key === form.bookingDate;
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

            <FormCard>
              <Field
                label="Number of days"
                hint={
                  form.numberOfDays > 1
                    ? `${formatDateRange(form.bookingDate, form.numberOfDays)}`
                    : formatDay(form.bookingDate)
                }
              >
                <Stepper
                  value={form.numberOfDays}
                  onChange={value => setField('numberOfDays', value)}
                  max={maxBookingDays}
                  suffix={form.numberOfDays === 1 ? 'day' : 'days'}
                />
              </Field>
            </FormCard>

            {/* TIME */}
            <SectionHeading
              icon={<Clock size={16} color={C.blue} />}
              color={C.blue}
              title="Working hours"
            />
            <FormCard>
              <Field label="Quick pick">
                <View style={styles.presetRow}>
                  {TIME_PRESETS.map(preset => {
                    const selected =
                      form.startTime === preset.start &&
                      form.endTime === preset.end;
                    return (
                      <TouchableOpacity
                        key={preset.key}
                        activeOpacity={0.85}
                        onPress={() =>
                          setForm(previous => ({
                            ...previous,
                            startTime: preset.start,
                            endTime: preset.end,
                          }))
                        }
                        style={[
                          styles.preset,
                          selected && styles.presetSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetLabel,
                            selected && styles.presetTextSelected,
                          ]}
                        >
                          {preset.label}
                        </Text>
                        <Text
                          style={[
                            styles.presetTime,
                            selected && styles.presetTextSelected,
                          ]}
                        >
                          {formatTime(preset.start).replace(':00', '')} -{' '}
                          {formatTime(preset.end).replace(':00', '')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Field>

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
                <View style={styles.flex}>
                  <Field
                    label={
                      form.wageType === 'hourly' ? 'End time *' : 'End time'
                    }
                  >
                    <PickerField
                      icon={<Clock size={16} color={C.green} />}
                      value={form.endTime ? formatTime(form.endTime) : ''}
                      placeholder="Optional"
                      onPress={() => setPicker('end')}
                      onClear={
                        form.wageType === 'hourly'
                          ? undefined
                          : () => setField('endTime', '')
                      }
                    />
                  </Field>
                </View>
              </View>
            </FormCard>

            {/* WORK */}
            <SectionHeading
              icon={<Briefcase size={16} color={C.orange} />}
              color={C.orange}
              title="What work?"
            />
            <FormCard>
              <Field label="Type of work *">
                <SelectChips
                  options={workOptions}
                  value={form.workType}
                  onChange={value => setField('workType', value)}
                />
              </Field>

              <Field label="Details for the worker">
                <FormInput
                  value={form.description}
                  onChangeText={value => setField('description', value)}
                  placeholder="e.g. Soybean harvesting on 2 acres, bring your own sickle"
                  maxLength={1000}
                  multiline
                  textAlignVertical="top"
                  style={styles.textArea}
                />
              </Field>
            </FormCard>

            {/* WAGE */}
            <SectionHeading
              icon={<IndianRupee size={16} color={C.green} />}
              title="Wage"
              subtitle={`${
                labourer.fullName.split(' ')[0]
              } usually asks ${formatWage(
                labourer.expectedWage,
                labourer.wageType,
              )}`}
            />
            <FormCard>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field label="Wage amount *">
                    <View style={[styles.wageBox]}>
                      <Text style={styles.rupee}>₹</Text>
                      <FormInput
                        value={form.wage}
                        onChangeText={value => setField('wage', value)}
                        keyboardType="decimal-pad"
                        placeholder="500"
                        style={styles.wageInput}
                      />
                    </View>
                  </Field>
                </View>
              </View>
              <Field label="Paid">
                <SelectChips
                  options={WAGE_TYPES}
                  labels={WAGE_TYPE_LABELS}
                  value={form.wageType}
                  onChange={value => setField('wageType', value)}
                />
              </Field>
            </FormCard>

            {/* WHERE */}
            <SectionHeading
              icon={<MapPin size={16} color={C.green} />}
              title="Where is the work?"
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
                  placeholder="e.g. Near Hanuman temple, Patil farm"
                  maxLength={300}
                />
              </Field>
              <Field label="Note to worker (optional)">
                <FormInput
                  value={form.farmerNotes}
                  onChangeText={value => setField('farmerNotes', value)}
                  placeholder="e.g. Lunch will be provided"
                  maxLength={500}
                />
              </Field>
            </FormCard>

            <Text style={styles.disclaimer}>
              The final amount is calculated when the request is sent. Pay the
              worker directly after the work is done.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
      >
        <View style={styles.flex}>
          <Text style={styles.bottomLabel}>Estimated total</Text>
          <Text style={styles.bottomTotal}>
            {estimate ? formatRupees(estimate) : '—'}
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
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  row: { flexDirection: 'row', gap: 12 },

  workerCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  workerName: { fontSize: 16, fontWeight: '900', color: C.white },
  workerType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BFF0D2',
    marginTop: 1,
  },
  workerMeta: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },

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

  presetRow: { flexDirection: 'row', gap: 8 },
  preset: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.white,
  },
  presetSelected: { backgroundColor: C.lightBlue, borderColor: C.blue },
  presetLabel: { fontSize: 12, fontWeight: '900', color: C.dark },
  presetTime: { fontSize: 10, fontWeight: '700', color: C.muted, marginTop: 2 },
  presetTextSelected: { color: C.blue },

  textArea: { height: 90, paddingTop: 12 },
  wageBox: { flexDirection: 'row', alignItems: 'center' },
  rupee: {
    position: 'absolute',
    left: 13,
    zIndex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: C.green,
  },
  wageInput: { flex: 1, paddingLeft: 30, fontSize: 15, fontWeight: '800' },

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
