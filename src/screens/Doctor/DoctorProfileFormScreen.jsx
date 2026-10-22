import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  CircleCheck,
  FileBadge,
  Leaf,
  MapPin,
  PawPrint,
  Plus,
  Save,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareBottomBar,
  CareButton,
  CareCard,
  CareChips,
  CareField,
  CareInput,
} from '../../components/doctor/CareBits';
import { CARE as C } from '../../components/doctor/careTheme';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import useDoctorMeta from '../../components/doctor/useDoctorMeta';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { saveMyDoctorProfile } from '../../redux/slices/doctorSlice';
import { pickNurseryImages } from '../../utils/nurseryImagePicker';
import { uploadNurseryImage } from '../../utils/nurseryCloudinary';
import { dayKeyOf, formatDay, toDayKey } from '../../utils/indiaSchedule';
import {
  DOCTOR_TYPE_META,
  buildDoctorProfilePayload,
} from '../../utils/doctorFormat';

const STEPS = [
  { title: 'About you', text: 'Who you are and how farmers reach you' },
  { title: 'Expertise', text: 'What you treat and your qualifications' },
  { title: 'Fee & dates', text: 'What you charge and when you are available' },
  { title: 'Location', text: 'Where you practise' },
];

// page each validated field lives on (fields from buildDoctorProfilePayload)
const STEP_OF_FIELD = {
  fullName: 0,
  doctorType: 0,
  phoneNumber: 0,
  email: 0,
  specialization: 1,
  qualification: 1,
  languages: 1,
  about: 1,
  consultationFee: 2,
  availableUntil: 2,
};

const TYPE_CARDS = [
  { key: 'veterinarian', icon: PawPrint, color: C.teal, bg: C.tealSoft },
  { key: 'agriculturalDoctor', icon: Leaf, color: C.olive, bg: C.oliveSoft },
];

const initialForm = (doctor, user) => ({
  fullName: doctor?.fullName || user?.fullName || '',
  doctorType: doctor?.doctorType || '',
  phoneNumber: doctor?.phoneNumber ?? user?.phoneNumber ?? '',
  email: doctor?.email ?? user?.email ?? '',
  profileImage: doctor?.profileImage || '',
  doctorateCertificate: doctor?.doctorateCertificate || '',
  specialization: doctor?.specialization || [],
  qualification: doctor?.qualification || [],
  languages: doctor?.languages || [],
  about: doctor?.about || '',
  consultationFeeType: doctor
    ? doctor.consultationFeeType || 'perConsultation'
    : 'perConsultation',
  consultationFee: doctor?.consultationFee
    ? String(doctor.consultationFee)
    : '',
  availability: doctor?.availability || 'available',
  availableFrom: dayKeyOf(doctor?.availableFrom),
  availableUntil: dayKeyOf(doctor?.availableUntil),
  village: doctor?.village ?? user?.village ?? '',
  district: doctor?.district ?? user?.district ?? '',
  state: doctor?.state ?? user?.state ?? '',
  address: doctor?.address || '',
});

const keyToLocalDate = key => {
  if (!key) return new Date();
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/*
 * Free text list (qualifications, extra specialities).
 */
function TagInput({ value, onChange, placeholder }) {
  const [text, setText] = useState('');

  const add = () => {
    const tag = text.trim();
    if (tag && !value.includes(tag) && value.length < 20) {
      onChange([...value, tag]);
    }
    setText('');
  };

  return (
    <View>
      <View style={styles.tagInputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          returnKeyType="done"
          blurOnSubmit={false}
          style={styles.tagInput}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.tagAdd}
          onPress={add}
        >
          <Plus size={18} color={C.white} />
        </TouchableOpacity>
      </View>
      {value.length > 0 && (
        <View style={styles.tags}>
          {value.map(tag => (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.8}
              style={styles.tag}
              onPress={() => onChange(value.filter(item => item !== tag))}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <X size={12} color={C.white} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function DoctorProfileFormScreen({ navigation, route }) {
  const editing = route.params?.doctor || null;
  const isCreate = !editing;

  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const meta = useDoctorMeta();
  const scrollRef = useRef(null);

  const user = useSelector(state => state.auth.user);
  const saving = useSelector(state => state.doctor.saving);

  const [form, setForm] = useState(() => initialForm(editing, user));
  const [photoAsset, setPhotoAsset] = useState(null);
  const [certificateAsset, setCertificateAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dateField, setDateField] = useState(null);
  const [step, setStep] = useState(0);
  const [errorField, setErrorField] = useState(null);

  const setField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    if (errorField === key) setErrorField(null);
  };

  const shows = index => !isCreate || step === index;
  const isLastStep = !isCreate || step === STEPS.length - 1;

  const goToStep = index => {
    setStep(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleBack = () => {
    if (isCreate && step > 0) goToStep(step - 1);
    else navigation.goBack();
  };

  const handleNext = () => {
    const { error, field } = buildDoctorProfilePayload(form);
    const errorStep = STEP_OF_FIELD[field];

    if (error && errorStep <= step) {
      if (errorStep < step) goToStep(errorStep);
      setErrorField(field);
      feedback.error('Check your details', error);
      return;
    }

    goToStep(step + 1);
  };

  const pickOne = async setter => {
    try {
      const [asset] = await pickNurseryImages({ selectionLimit: 1 });
      if (asset) setter(asset);
    } catch (error) {
      feedback.error('Could not open photos', error?.message);
    }
  };

  const handleDateChange = (event, date) => {
    const field = dateField;
    setDateField(null);
    if (event.type === 'set' && date && field) setField(field, toDayKey(date));
  };

  const handleSave = async () => {
    const { payload, error, field } = buildDoctorProfilePayload(form);

    if (error) {
      if (isCreate && STEP_OF_FIELD[field] !== undefined) {
        goToStep(STEP_OF_FIELD[field]);
      }
      setErrorField(field);
      feedback.error('Check your details', error);
      return;
    }

    try {
      if (photoAsset || certificateAsset) {
        setUploading(true);
        if (photoAsset)
          payload.profileImage = await uploadNurseryImage(photoAsset);
        if (certificateAsset) {
          payload.doctorateCertificate = await uploadNurseryImage(
            certificateAsset,
          );
        }
        setUploading(false);
      }

      await dispatch(
        saveMyDoctorProfile({ doctorData: payload, isCreate }),
      ).unwrap();

      if (isCreate) {
        feedback.success(
          'Welcome, doctor!',
          'Your profile is live. Farmers can now find you and send consultation requests.',
          {
            primaryLabel: 'Go to Dashboard',
            dismissable: false,
            onPrimary: () => navigation.replace(DOCTOR_ROUTES.DASHBOARD),
          },
        );
      } else {
        feedback.success(
          'Profile updated',
          'A new fee applies to new consultations only.',
          {
            primaryLabel: 'Done',
            dismissable: false,
            onPrimary: () => navigation.goBack(),
          },
        );
      }
    } catch (failure) {
      setUploading(false);
      feedback.error(
        'Could not save profile',
        typeof failure === 'string' ? failure : failure?.message,
      );
    }
  };

  const suggested = meta.specializations?.[form.doctorType] || [];
  const extraSpecialities = form.specialization.filter(
    item => !suggested.includes(item),
  );
  const isFree = form.consultationFeeType === 'free';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <CareHero
            compact
            onBack={handleBack}
            gradient={isCreate ? 'care' : 'vet'}
            eyebrow={
              isCreate
                ? `Step ${step + 1} of ${STEPS.length} · ${STEPS[step].title}`
                : 'Edit profile'
            }
            title={isCreate ? STEPS[step].text : form.fullName || 'Doctor'}
            subtitle={
              isCreate
                ? 'Farmers see this on your profile.'
                : 'Fee changes only apply to new consultations.'
            }
          >
            {isCreate && (
              <View style={styles.progressBar}>
                {STEPS.map((item, index) => (
                  <View
                    key={item.title}
                    style={[
                      styles.progressSegment,
                      index <= step && styles.progressSegmentDone,
                    ]}
                  />
                ))}
              </View>
            )}
          </CareHero>

          <View style={styles.body}>
            {shows(0) && (
              <>
                <Text style={styles.blockTitle}>I am a</Text>
                <View style={styles.typeRow}>
                  {TYPE_CARDS.map(({ key, icon: Icon, color, bg }) => {
                    const selected = form.doctorType === key;
                    const type = DOCTOR_TYPE_META[key];

                    return (
                      <TouchableOpacity
                        key={key}
                        activeOpacity={0.88}
                        onPress={() => setField('doctorType', key)}
                        style={[
                          styles.typeCard,
                          selected && {
                            borderColor: color,
                            backgroundColor: bg,
                          },
                          errorField === 'doctorType' && styles.typeCardError,
                        ]}
                      >
                        <View
                          style={[styles.typeIcon, { backgroundColor: bg }]}
                        >
                          <Icon size={22} color={color} />
                        </View>
                        <Text style={styles.typeTitle}>{type.label}</Text>
                        <Text style={styles.typeText}>{type.for}</Text>
                        {selected && (
                          <View style={styles.typeCheck}>
                            <CircleCheck size={18} color={color} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <CareCard>
                  <View style={styles.photoRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => pickOne(setPhotoAsset)}
                    >
                      <DoctorAvatar
                        name={form.fullName}
                        image={photoAsset?.uri || form.profileImage}
                        doctorType={form.doctorType || null}
                        size={76}
                      />
                      <View style={styles.cameraBadge}>
                        <Camera size={13} color={C.white} />
                      </View>
                    </TouchableOpacity>
                    <View style={styles.flex}>
                      <Text style={styles.photoTitle}>Profile photo</Text>
                      <Text style={styles.photoText}>
                        A clear photo builds trust with farmers.
                      </Text>
                    </View>
                  </View>

                  <CareField label="Full name *">
                    <CareInput
                      value={form.fullName}
                      onChangeText={value => setField('fullName', value)}
                      placeholder="e.g. Dr. Sunil Patil"
                      maxLength={100}
                      invalid={errorField === 'fullName'}
                    />
                  </CareField>
                  <CareField
                    label="Phone number"
                    hint="Shared only with farmers whose request you accept."
                  >
                    <CareInput
                      value={form.phoneNumber}
                      onChangeText={value => setField('phoneNumber', value)}
                      placeholder="10 digit mobile number"
                      keyboardType="phone-pad"
                      maxLength={15}
                      invalid={errorField === 'phoneNumber'}
                    />
                  </CareField>
                  <CareField label="Email" hint="Never shown to farmers.">
                    <CareInput
                      value={form.email}
                      onChangeText={value => setField('email', value)}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      invalid={errorField === 'email'}
                    />
                  </CareField>
                </CareCard>
              </>
            )}

            {shows(1) && (
              <CareCard>
                <CareField
                  label="What do you treat? *"
                  error={
                    errorField === 'specialization'
                      ? 'Choose at least one'
                      : null
                  }
                  hint={
                    form.doctorType
                      ? 'Tap all that apply.'
                      : 'Choose Veterinarian or Crop Doctor first.'
                  }
                >
                  <CareChips
                    multiple
                    options={suggested}
                    value={form.specialization}
                    onChange={value =>
                      setField('specialization', [
                        ...value,
                        ...extraSpecialities.filter(
                          item => !value.includes(item),
                        ),
                      ])
                    }
                  />
                </CareField>
                <CareField label="Other specialities">
                  <TagInput
                    value={extraSpecialities}
                    onChange={extra =>
                      setField('specialization', [
                        ...form.specialization.filter(item =>
                          suggested.includes(item),
                        ),
                        ...extra,
                      ])
                    }
                    placeholder="Type and press +"
                  />
                </CareField>
                <CareField label="Qualifications">
                  <TagInput
                    value={form.qualification}
                    onChange={value => setField('qualification', value)}
                    placeholder="e.g. BVSc & AH, MSc Agri"
                  />
                </CareField>
                <CareField label="Languages you speak">
                  <CareChips
                    multiple
                    options={meta.languages || []}
                    value={form.languages}
                    onChange={value => setField('languages', value)}
                  />
                </CareField>
                <CareField label="About you">
                  <CareInput
                    value={form.about}
                    onChangeText={value => setField('about', value)}
                    placeholder="Years of experience, what you are good at, do you visit farms..."
                    multiline
                    maxLength={1000}
                    invalid={errorField === 'about'}
                  />
                </CareField>
              </CareCard>
            )}

            {shows(2) && (
              <CareCard>
                <CareField label="Consultation fee">
                  <View style={styles.feeTypes}>
                    {[
                      { key: 'perConsultation', label: 'I charge a fee' },
                      { key: 'free', label: 'Free consultation' },
                    ].map(option => {
                      const selected = form.consultationFeeType === option.key;

                      return (
                        <TouchableOpacity
                          key={option.key}
                          activeOpacity={0.85}
                          onPress={() =>
                            setField('consultationFeeType', option.key)
                          }
                          style={[
                            styles.feeType,
                            selected && styles.feeTypeSelected,
                          ]}
                        >
                          <View
                            style={[
                              styles.radio,
                              selected && styles.radioSelected,
                            ]}
                          >
                            {selected && <View style={styles.radioDot} />}
                          </View>
                          <Text
                            style={[
                              styles.feeTypeText,
                              selected && styles.feeTypeTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </CareField>

                {!isFree && (
                  <CareField
                    label="Fee per consultation *"
                    hint="Farmers see this before booking and pay you directly."
                  >
                    <View style={styles.moneyBox}>
                      <Wallet
                        size={17}
                        color={C.teal}
                        style={styles.moneyIcon}
                      />
                      <CareInput
                        value={form.consultationFee}
                        onChangeText={value =>
                          setField(
                            'consultationFee',
                            value.replace(/[^0-9.]/g, ''),
                          )
                        }
                        placeholder="e.g. 300"
                        keyboardType="decimal-pad"
                        style={styles.moneyInput}
                        invalid={errorField === 'consultationFee'}
                      />
                    </View>
                  </CareField>
                )}

                <CareField
                  label="Taking consultations (optional)"
                  hint="Leave empty if you are always available."
                  error={
                    errorField === 'availableUntil'
                      ? '"Until" must be after "from"'
                      : null
                  }
                >
                  <View style={styles.row}>
                    {['availableFrom', 'availableUntil'].map(key => (
                      <TouchableOpacity
                        key={key}
                        activeOpacity={0.85}
                        style={styles.dateBox}
                        onPress={() => setDateField(key)}
                      >
                        <Calendar size={16} color={C.teal} />
                        <View style={styles.flex}>
                          <Text style={styles.dateLabel}>
                            {key === 'availableFrom' ? 'From' : 'Until'}
                          </Text>
                          <Text style={styles.dateValue} numberOfLines={1}>
                            {form[key]
                              ? formatDay(form[key], { weekday: false })
                              : key === 'availableFrom'
                              ? 'Now'
                              : 'No end'}
                          </Text>
                        </View>
                        {!!form[key] && (
                          <TouchableOpacity
                            hitSlop={10}
                            onPress={() => setField(key, null)}
                          >
                            <X size={15} color={C.muted} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </CareField>
              </CareCard>
            )}

            {shows(3) && (
              <CareCard>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <CareField label="Village / town">
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
                <CareField label="Clinic address">
                  <CareInput
                    value={form.address}
                    onChangeText={value => setField('address', value)}
                    placeholder="Clinic / dispensary address"
                  />
                </CareField>

                <CareField
                  label="Degree certificate (optional)"
                  hint="Kept private. Helps us verify doctors."
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.certificate}
                    onPress={() => pickOne(setCertificateAsset)}
                  >
                    {certificateAsset || form.doctorateCertificate ? (
                      <Image
                        source={{
                          uri:
                            certificateAsset?.uri || form.doctorateCertificate,
                        }}
                        style={styles.certificateImage}
                      />
                    ) : (
                      <View style={styles.certificateIcon}>
                        <FileBadge size={22} color={C.teal} />
                      </View>
                    )}
                    <Text style={styles.certificateText}>
                      {certificateAsset || form.doctorateCertificate
                        ? 'Change photo'
                        : 'Add a photo of your certificate'}
                    </Text>
                  </TouchableOpacity>
                </CareField>
              </CareCard>
            )}

            {isCreate && step === STEPS.length - 1 && (
              <View style={styles.reviewRow}>
                <UserRound size={14} color={C.muted} />
                <Text style={styles.reviewText} numberOfLines={1}>
                  {form.fullName} ·{' '}
                  {DOCTOR_TYPE_META[form.doctorType]?.label || ''}
                </Text>
                <MapPin size={14} color={C.muted} />
                <Text style={styles.reviewText} numberOfLines={1}>
                  {form.district || '—'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CareBottomBar>
        {isCreate && step > 0 && (
          <CareButton
            variant="outline"
            label="Back"
            icon={<ArrowLeft size={16} color={C.tealDark} />}
            disabled={saving || uploading}
            onPress={handleBack}
            style={styles.flex}
          />
        )}
        {isLastStep ? (
          <CareButton
            label={
              uploading
                ? 'Uploading photos…'
                : isCreate
                ? 'Create Profile'
                : 'Save Changes'
            }
            icon={<Save size={17} color={C.white} />}
            loading={saving || uploading}
            onPress={handleSave}
            style={styles.flexWide}
          />
        ) : (
          <CareButton
            label="Next"
            icon={<ArrowRight size={17} color={C.white} />}
            onPress={handleNext}
            style={styles.flexWide}
          />
        )}
      </CareBottomBar>

      {!!dateField && (
        <DateTimePicker
          value={keyToLocalDate(form[dateField])}
          mode="date"
          minimumDate={
            dateField === 'availableUntil' && form.availableFrom
              ? keyToLocalDate(form.availableFrom)
              : undefined
          }
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  flexWide: { flex: 1.6 },
  row: { flexDirection: 'row', gap: 12 },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16 },

  progressBar: { flexDirection: 'row', gap: 6, marginTop: 16 },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressSegmentDone: { backgroundColor: C.white },

  blockTitle: { fontSize: 16, fontWeight: '900', color: C.ink, marginTop: 20 },
  typeRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  typeCard: {
    flex: 1,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  typeCardError: { borderColor: C.red },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTitle: { fontSize: 14.5, fontWeight: '900', color: C.ink, marginTop: 10 },
  typeText: { fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 2 },
  typeCheck: { position: 'absolute', top: 12, right: 12 },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cameraBadge: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  photoTitle: { fontSize: 14, fontWeight: '900', color: C.ink },
  photoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 2,
  },

  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: C.ink,
    backgroundColor: C.input,
  },
  tagAdd: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: C.navy,
  },
  tagText: { fontSize: 12, fontWeight: '800', color: C.white },

  feeTypes: { flexDirection: 'row', gap: 10 },
  feeType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  feeTypeSelected: { borderColor: C.teal, backgroundColor: C.tealSoft },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: C.teal },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.teal },
  feeTypeText: { flex: 1, fontSize: 12.5, fontWeight: '800', color: C.text },
  feeTypeTextSelected: { color: C.tealDark },
  moneyBox: { justifyContent: 'center' },
  moneyIcon: { position: 'absolute', left: 14, zIndex: 1 },
  moneyInput: { paddingLeft: 40, fontSize: 15, fontWeight: '800' },

  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
  },
  dateLabel: { fontSize: 10.5, fontWeight: '800', color: C.muted },
  dateValue: { fontSize: 13, fontWeight: '800', color: C.ink, marginTop: 1 },

  certificate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.teal,
    backgroundColor: C.tealSoft,
  },
  certificateIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateImage: { width: 56, height: 56, borderRadius: 12 },
  certificateText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '800',
    color: C.tealDark,
  },

  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  reviewText: {
    flexShrink: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: C.muted,
  },
});
