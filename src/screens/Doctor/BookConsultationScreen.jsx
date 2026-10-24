import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ImagePlus,
  Leaf,
  MapPin,
  PawPrint,
  Send,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  Wallet,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useLiveRegionPrefill } from '../../context/LocationContext';
import { CareTopBar } from '../../components/doctor/CareHero';
import {
  CareBottomBar,
  CareButton,
  CareCard,
  CareChips,
  CareEmpty,
  CareField,
  CareInput,
  CareLoading,
} from '../../components/doctor/CareBits';
import { CARE as C } from '../../components/doctor/careTheme';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import useDoctorMeta from '../../components/doctor/useDoctorMeta';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { fetchDoctorById } from '../../redux/slices/doctorSlice';
import { createConsultation } from '../../redux/slices/doctorConsultationSlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadNurseryImages } from '../../utils/nurseryCloudinary';
import {
  dayKeyToUtc,
  formatDay,
  formatTime,
  nowMinutesInIndia,
  todayInIndiaKey,
} from '../../utils/indiaSchedule';
import {
  DOCTOR_TYPE_META,
  PAYMENT_LABELS,
  bookedCountOn,
  bookingDays,
  buildConsultationPayload,
  buildTimeSlots,
  consultationTypeFor,
  feeLabel,
  isFreeDoctor,
} from '../../utils/doctorFormat';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SLOT_GROUPS = [
  { key: 'morning', label: 'Morning', icon: Sunrise, from: 0, to: 12 * 60 },
  {
    key: 'afternoon',
    label: 'Afternoon',
    icon: Sun,
    from: 12 * 60,
    to: 16 * 60,
  },
  {
    key: 'evening',
    label: 'Evening',
    icon: Sunset,
    from: 16 * 60,
    to: 24 * 60,
  },
];

// which validation error belongs to which section (for the red hint)
const FIELD_LABELS = {
  consultationDate: 'when',
  startTime: 'when',
  problemType: 'problem',
  animalCount: 'problem',
  symptoms: 'problem',
  images: 'problem',
};

function StepHeading({ number, title, subtitle }) {
  return (
    <View style={styles.stepHeading}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.stepTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.stepSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export default function BookConsultationScreen({ navigation, route }) {
  const { doctorId } = route.params;
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const meta = useDoctorMeta();

  const user = useSelector(state => state.auth.user);
  const { selected, selectedError, selectedLoading } = useSelector(
    state => state.doctor,
  );
  const creating = useSelector(state => state.doctorConsultation.creating);

  const doctor = selected?._id === doctorId ? selected : null;
  const todayKey = todayInIndiaKey();

  const [form, setForm] = useState({
    consultationDate: null,
    startTime: null,
    problemType: '',
    animalType: '',
    animalCount: '1',
    animalAge: '',
    cropName: '',
    symptoms: '',
    description: '',
    village: user?.village || '',
    district: '',
    state: '',
    address: '',
    paymentMethod: 'cod',
    farmerNotes: '',
  });
  useLiveRegionPrefill(setForm);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorField, setErrorField] = useState(null);

  const setField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    if (FIELD_LABELS[errorField] === FIELD_LABELS[key]) setErrorField(null);
  };

  useFocusEffect(
    useCallback(() => {
      if (!doctor) dispatch(fetchDoctorById(doctorId));
    }, [dispatch, doctor, doctorId]),
  );

  const days = useMemo(
    () => (doctor ? bookingDays(doctor, todayKey) : []),
    [doctor, todayKey],
  );

  // first open day by default
  useEffect(() => {
    if (!form.consultationDate && days.length) {
      setForm(previous => ({ ...previous, consultationDate: days[0] }));
    }
  }, [days, form.consultationDate]);

  const slots = useMemo(
    () =>
      form.consultationDate
        ? buildTimeSlots({
            dayKey: form.consultationDate,
            todayKey,
            nowMinutes: nowMinutesInIndia(),
            bookedSlots: doctor?.bookedSlots,
            slotMinutes: meta.defaultSlotMinutes || 30,
          })
        : [],
    [
      form.consultationDate,
      todayKey,
      doctor?.bookedSlots,
      meta.defaultSlotMinutes,
    ],
  );

  if (!doctor) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <CareTopBar
          title="Book consultation"
          onBack={() => navigation.goBack()}
        />
        {selectedError && !selectedLoading ? (
          <CareEmpty
            title="Doctor not available"
            message={selectedError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <CareLoading />
        )}
      </SafeAreaView>
    );
  }

  const consultationType = consultationTypeFor(doctor);
  const isVet = consultationType === 'veterinary';
  const type = DOCTOR_TYPE_META[doctor.doctorType];
  const problemOptions = meta.problemTypes?.[consultationType] || [];
  const maxImages = meta.maxImages || 5;

  const chooseDay = key => {
    setForm(previous => ({
      ...previous,
      consultationDate: key,
      startTime: null,
    }));
  };

  const choosePhotos = async () => {
    const remaining = maxImages - assets.length;

    if (remaining <= 0) {
      feedback.info(
        'Maximum reached',
        `You can add up to ${maxImages} photos.`,
      );
      return;
    }

    try {
      const picked = await pickNurseryImages({ selectionLimit: remaining });
      if (picked.length) {
        setAssets(previous => [...previous, ...picked].slice(0, maxImages));
      }
    } catch (error) {
      feedback.error('Could not open photos', error?.message);
    }
  };

  const validate = () =>
    buildConsultationPayload(
      { ...form, images: assets.map(asset => asset.uri) },
      { doctor, todayKey, nowMinutes: nowMinutesInIndia() },
    );

  const send = async () => {
    const { payload } = validate();

    try {
      if (assets.length) {
        setUploading(true);
        payload.images = await uploadNurseryImages(assets);
        setUploading(false);
      }

      const result = await dispatch(createConsultation(payload)).unwrap();
      const consultationId = result?.consultation?._id;

      feedback.success(
        'Request sent!',
        `${doctor.fullName} will accept or decline soon. You'll see their phone number once they accept.`,
        {
          primaryLabel: 'View Request',
          dismissable: false,
          onPrimary: () =>
            navigation.replace(DOCTOR_ROUTES.CONSULTATION, { consultationId }),
        },
      );
    } catch (failure) {
      setUploading(false);
      const message = failure?.message || String(failure);

      if (failure?.consultationId) {
        feedback.error('Already booked', message, {
          primaryLabel: 'View Consultation',
          secondaryLabel: 'Close',
          onPrimary: () =>
            navigation.replace(DOCTOR_ROUTES.CONSULTATION, {
              consultationId: failure.consultationId,
            }),
        });
        return;
      }

      dispatch(fetchDoctorById(doctorId));
      feedback.error('Could not send request', message);
    }
  };

  const handleSubmit = () => {
    const { error, field } = validate();

    if (error) {
      setErrorField(field);
      feedback.error('Almost there', error);
      return;
    }

    feedback.confirm({
      title: 'Send consultation request?',
      message: `${formatDay(form.consultationDate)} at ${formatTime(
        form.startTime,
      )} with ${doctor.fullName}. Fee: ${feeLabel(doctor)}${
        isFreeDoctor(doctor)
          ? '.'
          : `, paid by ${PAYMENT_LABELS[form.paymentMethod] || 'cash'}.`
      }`,
      confirmLabel: 'Send Request',
      onConfirm: send,
    });
  };

  const sectionError = section =>
    FIELD_LABELS[errorField] === section ? validate().error : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <CareTopBar
        title="Book consultation"
        subtitle={type?.label}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* DOCTOR STRIP */}
          <View style={styles.doctorStrip}>
            <DoctorAvatar
              name={doctor.fullName}
              image={doctor.profileImage}
              doctorType={doctor.doctorType}
              size={52}
            />
            <View style={styles.flex}>
              <Text style={styles.doctorName} numberOfLines={1}>
                {doctor.fullName}
              </Text>
              <Text style={styles.doctorMeta} numberOfLines={1}>
                {(doctor.specialization || []).slice(0, 2).join(' · ') ||
                  type?.label}
              </Text>
            </View>
            <View style={styles.feeBadge}>
              <Text style={styles.feeBadgeText}>{feeLabel(doctor)}</Text>
            </View>
          </View>

          {/* 1. WHEN */}
          <StepHeading
            number="1"
            title="When?"
            subtitle={`${
              meta.defaultSlotMinutes || 30
            } minute slots. Grey times are taken.`}
          />
          {days.length === 0 ? (
            <CareCard>
              <Text style={styles.noDays}>
                This doctor is not taking consultations in the next two weeks.
              </Text>
            </CareCard>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayList}
              >
                {days.map(key => {
                  const date = dayKeyToUtc(key);
                  const selectedDay = form.consultationDate === key;
                  const busy = bookedCountOn(doctor.bookedSlots, key);

                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.85}
                      onPress={() => chooseDay(key)}
                      style={[styles.day, selectedDay && styles.daySelected]}
                    >
                      <Text
                        style={[
                          styles.dayWeek,
                          selectedDay && styles.dayTextSelected,
                        ]}
                      >
                        {key === todayKey
                          ? 'Today'
                          : WEEKDAYS[date.getUTCDay()]}
                      </Text>
                      <Text
                        style={[
                          styles.dayNumber,
                          selectedDay && styles.dayTextSelected,
                        ]}
                      >
                        {date.getUTCDate()}
                      </Text>
                      {busy > 0 && (
                        <View
                          style={[
                            styles.dayDot,
                            selectedDay && styles.dayDotSelected,
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <CareCard style={styles.slotCard}>
                {SLOT_GROUPS.map(group => {
                  const groupSlots = slots.filter(
                    slot => slot.minute >= group.from && slot.minute < group.to,
                  );
                  if (!groupSlots.length) return null;
                  const Icon = group.icon;

                  return (
                    <View key={group.key} style={styles.slotGroup}>
                      <View style={styles.slotGroupHead}>
                        <Icon size={14} color={C.amber} />
                        <Text style={styles.slotGroupLabel}>{group.label}</Text>
                      </View>
                      <View style={styles.slots}>
                        {groupSlots.map(slot => {
                          const disabled = slot.booked || slot.past;
                          const chosen = form.startTime === slot.time;

                          return (
                            <TouchableOpacity
                              key={slot.time}
                              activeOpacity={0.85}
                              disabled={disabled}
                              onPress={() => setField('startTime', slot.time)}
                              style={[
                                styles.slot,
                                disabled && styles.slotDisabled,
                                chosen && styles.slotChosen,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.slotText,
                                  disabled && styles.slotTextDisabled,
                                  chosen && styles.slotTextChosen,
                                ]}
                              >
                                {slot.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
                {slots.every(slot => slot.booked || slot.past) && (
                  <Text style={styles.noDays}>
                    No free times left this day. Please pick another day.
                  </Text>
                )}
              </CareCard>
              {!!sectionError('when') && (
                <Text style={styles.sectionError}>{sectionError('when')}</Text>
              )}
            </>
          )}

          {/* 2. PROBLEM */}
          <StepHeading
            number="2"
            title="What's the problem?"
            subtitle="The more you tell, the better the doctor can prepare"
          />
          <CareCard>
            <CareField label="Problem *">
              <CareChips
                options={problemOptions}
                value={form.problemType}
                onChange={value => setField('problemType', value)}
              />
            </CareField>

            {isVet ? (
              <>
                <CareField label="Animal">
                  <CareChips
                    options={meta.animalTypes || []}
                    value={form.animalType}
                    onChange={value => setField('animalType', value)}
                  />
                </CareField>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <CareField label="How many">
                      <CareInput
                        value={form.animalCount}
                        onChangeText={value =>
                          setField('animalCount', value.replace(/\D/g, ''))
                        }
                        keyboardType="number-pad"
                        placeholder="1"
                        invalid={errorField === 'animalCount'}
                      />
                    </CareField>
                  </View>
                  <View style={styles.flex}>
                    <CareField label="Age">
                      <CareInput
                        value={form.animalAge}
                        onChangeText={value => setField('animalAge', value)}
                        placeholder="e.g. 4 years"
                        maxLength={50}
                      />
                    </CareField>
                  </View>
                </View>
              </>
            ) : (
              <CareField label="Crop">
                <CareInput
                  value={form.cropName}
                  onChangeText={value => setField('cropName', value)}
                  placeholder="e.g. Tomato, Soybean, Grapes"
                  maxLength={100}
                />
              </CareField>
            )}

            <CareField label="What do you see? *">
              <CareInput
                value={form.symptoms}
                onChangeText={value => setField('symptoms', value)}
                placeholder={
                  isVet
                    ? 'e.g. High fever, not eating since 2 days, less milk'
                    : 'e.g. Yellow spots on leaves, white insects under leaves'
                }
                multiline
                maxLength={2000}
                invalid={errorField === 'symptoms'}
              />
            </CareField>
            <CareField label="Anything else? (optional)">
              <CareInput
                value={form.description}
                onChangeText={value => setField('description', value)}
                placeholder="Medicines already given, since when, how many affected..."
                multiline
                maxLength={2000}
              />
            </CareField>

            <CareField
              label="Photos"
              hint={`Add up to ${maxImages} clear photos of the ${
                isVet ? 'animal' : 'affected plants'
              }.`}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoList}
              >
                {assets.map((asset, index) => (
                  <View key={asset.uri} style={styles.photo}>
                    <Image
                      source={{ uri: asset.uri }}
                      style={styles.photoImage}
                    />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() =>
                        setAssets(previous =>
                          previous.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 size={13} color={C.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                {assets.length < maxImages && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.addPhoto}
                    onPress={choosePhotos}
                  >
                    <ImagePlus size={22} color={C.teal} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </CareField>
          </CareCard>
          {!!sectionError('problem') && (
            <Text style={styles.sectionError}>{sectionError('problem')}</Text>
          )}

          {/* 3. WHERE */}
          <StepHeading
            number="3"
            title="Where?"
            subtitle="Where the doctor can visit or reach you"
          />
          <CareCard>
            <View style={styles.row}>
              <View style={styles.flex}>
                <CareField label="Village">
                  <CareInput
                    value={form.village}
                    onChangeText={value => setField('village', value)}
                    placeholder="Village"
                  />
                </CareField>
              </View>
              <View style={styles.flex}>
                <CareField label="District">
                  <CareInput
                    value={form.district}
                    onChangeText={value => setField('district', value)}
                    placeholder="District"
                  />
                </CareField>
              </View>
            </View>
            <CareField label="State">
              <CareInput
                value={form.state}
                onChangeText={value => setField('state', value)}
                placeholder="State"
              />
            </CareField>
            <CareField label="Address / landmark">
              <CareInput
                value={form.address}
                onChangeText={value => setField('address', value)}
                placeholder="e.g. Behind the school, Patil wasti"
                maxLength={300}
              />
            </CareField>
          </CareCard>

          {/* 4. PAYMENT */}
          <StepHeading number="4" title="Payment" />
          <CareCard>
            <View style={styles.feeRow}>
              <Wallet size={18} color={C.teal} />
              <Text style={styles.feeLabel}>Consultation fee</Text>
              <Text style={styles.feeValue}>{feeLabel(doctor)}</Text>
            </View>
            {!isFreeDoctor(doctor) && (
              <CareField
                label="I'll pay by"
                hint="Pay the doctor directly after the consultation."
              >
                <CareChips
                  options={(meta.paymentMethods || ['cod']).map(key => ({
                    key,
                    label: PAYMENT_LABELS[key] || key,
                  }))}
                  value={form.paymentMethod}
                  onChange={value => setField('paymentMethod', value)}
                />
              </CareField>
            )}
            <CareField label="Note for the doctor (optional)">
              <CareInput
                value={form.farmerNotes}
                onChangeText={value => setField('farmerNotes', value)}
                placeholder="e.g. Please call before coming"
                maxLength={1000}
              />
            </CareField>
          </CareCard>

          <View style={styles.summary}>
            {isVet ? (
              <PawPrint size={14} color={C.muted} />
            ) : (
              <Leaf size={14} color={C.muted} />
            )}
            <Text style={styles.summaryText}>
              {form.consultationDate && form.startTime
                ? `${formatDay(form.consultationDate)} · ${formatTime(
                    form.startTime,
                  )}`
                : 'Choose a day and time above'}
            </Text>
            <MapPin size={14} color={C.muted} />
            <Text style={styles.summaryText} numberOfLines={1}>
              {form.village || form.district || '—'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CareBottomBar>
        <View style={styles.flex}>
          <Text style={styles.bottomLabel} numberOfLines={1}>
            {form.startTime && form.consultationDate
              ? `${formatDay(form.consultationDate, {
                  year: false,
                })} · ${formatTime(form.startTime)}`
              : 'Fee'}
          </Text>
          <Text style={styles.bottomPrice}>{feeLabel(doctor)}</Text>
        </View>
        <CareButton
          label={uploading ? 'Uploading photos…' : 'Send Request'}
          icon={<Send size={16} color={C.white} />}
          loading={creating || uploading}
          disabled={!days.length}
          onPress={handleSubmit}
          style={styles.flexWide}
        />
      </CareBottomBar>

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  flexWide: { flex: 1.5 },
  row: { flexDirection: 'row', gap: 12 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 30 },

  doctorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 24,
    backgroundColor: C.navy,
  },
  doctorName: { fontSize: 15, fontWeight: '900', color: C.white },
  doctorMeta: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  feeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: C.teal,
  },
  feeBadgeText: { fontSize: 13, fontWeight: '900', color: C.white },

  stepHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: C.white, fontSize: 13, fontWeight: '900' },
  stepTitle: { fontSize: 17, fontWeight: '900', color: C.ink },
  stepSubtitle: { fontSize: 11.5, fontWeight: '600', color: C.muted },

  dayList: { gap: 8, paddingTop: 12, paddingBottom: 2 },
  day: {
    width: 58,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  daySelected: { backgroundColor: C.teal, borderColor: C.teal },
  dayWeek: { fontSize: 10.5, fontWeight: '800', color: C.muted },
  dayNumber: { fontSize: 19, fontWeight: '900', color: C.ink, marginTop: 2 },
  dayTextSelected: { color: C.white },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.coral,
    marginTop: 4,
  },
  dayDotSelected: { backgroundColor: C.white },

  slotCard: { paddingTop: 6 },
  slotGroup: { marginTop: 10 },
  slotGroupHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotGroupLabel: { fontSize: 12, fontWeight: '900', color: C.text },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  slot: {
    width: '30.8%',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.mint,
    backgroundColor: C.tealSoft,
    alignItems: 'center',
  },
  slotDisabled: { backgroundColor: '#F2F4F7', borderColor: '#F2F4F7' },
  slotChosen: { backgroundColor: C.navy, borderColor: C.navy },
  slotText: { fontSize: 12.5, fontWeight: '800', color: C.tealDark },
  slotTextDisabled: { color: '#B5BDC9', textDecorationLine: 'line-through' },
  slotTextChosen: { color: C.white },
  noDays: { fontSize: 12.5, fontWeight: '700', color: C.muted, marginTop: 10 },
  sectionError: { fontSize: 12, fontWeight: '800', color: C.red, marginTop: 8 },

  photoList: { gap: 10 },
  photo: { width: 84, height: 84, borderRadius: 16, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 84,
    height: 84,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.teal,
    backgroundColor: C.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: C.teal,
    marginTop: 5,
  },

  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feeLabel: { flex: 1, fontSize: 13.5, fontWeight: '800', color: C.text },
  feeValue: { fontSize: 18, fontWeight: '900', color: C.teal },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 4,
  },
  summaryText: {
    flexShrink: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: C.muted,
  },

  bottomLabel: { fontSize: 11, color: C.muted, fontWeight: '700' },
  bottomPrice: {
    fontSize: 19,
    color: C.ink,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});
