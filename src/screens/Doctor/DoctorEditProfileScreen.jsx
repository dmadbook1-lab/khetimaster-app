import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  Languages,
  MapPin,
  Save,
  Stethoscope,
  Wallet,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  updateMyDoctorProfile,
} from '../../redux/slices/doctorSlice';
import DoctorFeedbackModal from './DoctorFeedbackModal';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const RED = '#DC2626';
const WHITE = '#FFFFFF';

const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const parseArray = value => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return value || '';
};

const parseNumber = value => {
  const trimmed = String(value || '').trim();

  if (!trimmed) return 0;

  const number = Number(trimmed);

  return Number.isFinite(number) ? number : NaN;
};

const DoctorEditProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const doctorFromRoute = route?.params?.doctor;

  const {
    myDoctor,
    isUpdating,
    isLoadingMyDoctor,
    myDoctorError,
    error,
  } = useSelector(state => state.doctor);

  const doctor = myDoctor || doctorFromRoute;

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [doctorType, setDoctorType] = useState('veterinarian');

  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [languages, setLanguages] = useState('');

  const [about, setAbout] = useState('');
  const [doctorateCertificate, setDoctorateCertificate] =
    useState('');

  const [consultationFee, setConsultationFee] = useState('');
  const [consultationFeeType, setConsultationFeeType] =
    useState('perConsultation');

  const [availability, setAvailability] = useState('available');

  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [picker, setPicker] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const Alert = {
    alert: (title, message) =>
      setFeedback({
        title,
        message:
          typeof message === 'string'
            ? message
            : 'Please review the information and try again.',
      }),
  };

  const handleTimePickerChange = (event, value) => {
    if (Platform.OS === 'android') setPicker(null);
    if (!value || event?.type === 'dismissed') return;
    const formatted = value.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    if (picker === 'from') setAvailableFrom(formatted);
    if (picker === 'until') setAvailableUntil(formatted);
  };

  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!doctor) return;

    setFullName(doctor.fullName || '');
    setPhoneNumber(doctor.phoneNumber || '');
    setEmail(doctor.email || '');

    setDoctorType(
      doctor.doctorType || 'veterinarian',
    );

    setSpecialization(
      parseArray(doctor.specialization),
    );

    setQualification(
      parseArray(doctor.qualification),
    );

    setLanguages(
      parseArray(doctor.languages),
    );

    setAbout(doctor.about || '');

    setDoctorateCertificate(
      doctor.doctorateCertificate || '',
    );

    setConsultationFee(
      doctor.consultationFee !== undefined &&
      doctor.consultationFee !== null
        ? String(doctor.consultationFee)
        : '',
    );

    setConsultationFeeType(
      doctor.consultationFeeType || 'perConsultation',
    );

    setAvailability(
      doctor.availability || 'available',
    );

    setAvailableFrom(
      formatTimeForInput(doctor.availableFrom),
    );

    setAvailableUntil(
      formatTimeForInput(doctor.availableUntil),
    );

    setStateName(doctor.state || '');
    setDistrict(doctor.district || '');
    setVillage(doctor.village || '');
    setAddress(doctor.address || '');
  }, [doctor]);

  const buildDateFromTime = value => {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

    if (!match) {
      return undefined;
    }

    const now = new Date();

    now.setHours(
      Number(match[1]),
      Number(match[2]),
      0,
      0,
    );

    return now.toISOString();
  };

  const handleSave = async () => {
    if (!doctor?._id) {
      Alert.alert(
        'Profile unavailable',
        'Your doctor profile could not be loaded.',
      );
      return;
    }

    if (!fullName.trim()) {
      Alert.alert(
        'Full name required',
        'Please enter your full name.',
      );
      return;
    }

    if (
      doctorType !== 'veterinarian' &&
      doctorType !== 'agriculturalDoctor'
    ) {
      Alert.alert(
        'Invalid doctor type',
        'Please select a valid doctor type.',
      );
      return;
    }

    const fee = parseNumber(consultationFee);

    if (Number.isNaN(fee) || fee < 0) {
      Alert.alert(
        'Invalid consultation fee',
        'Please enter a valid fee.',
      );
      return;
    }

    if (
      availability !== 'available' &&
      availability !== 'unavailable' &&
      availability !== 'busy'
    ) {
      Alert.alert(
        'Invalid availability',
        'Please select a valid availability status.',
      );
      return;
    }

    const from = buildDateFromTime(availableFrom);

    if (from === undefined) {
      Alert.alert(
        'Invalid start time',
        'Use 24-hour format such as 09:00 or 18:30.',
      );
      return;
    }

    const until = buildDateFromTime(availableUntil);

    if (until === undefined) {
      Alert.alert(
        'Invalid end time',
        'Use 24-hour format such as 09:00 or 18:30.',
      );
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),

      doctorType,

      specialization: specialization
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),

      qualification: qualification
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),

      languages: languages
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),

      about: about.trim(),

      doctorateCertificate:
        doctorateCertificate.trim(),

      consultationFee: fee,

      consultationFeeType,

      availability,

      availableFrom: from,
      availableUntil: until,

      state: stateName.trim(),
      district: district.trim(),
      village: village.trim(),
      address: address.trim(),

      profileCompleted: true,
    };

    try {
      await dispatch(
        updateMyDoctorProfile(payload),
      ).unwrap();

      Alert.alert(
        'Profile updated',
        'Your doctor profile has been updated successfully.',
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        'Update failed',
        getErrorMessage(
          err,
          'Your doctor profile could not be updated.',
        ),
      );
    }
  };

  if (!doctor && isLoadingMyDoctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Edit Doctor Profile
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />

          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Edit Doctor Profile
          </Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Doctor profile unavailable
          </Text>

          <Text style={styles.emptyText}>
            Please open your doctor profile and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              Edit Doctor Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Keep your professional information updated
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* Basic information */}
          <SectionHeader
            icon={<Stethoscope size={19} color={GREEN} />}
            title="Basic information"
          />

          <View style={styles.card}>
            <InputField
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
            />

            <InputField
              label="Phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>
              Doctor type
            </Text>

            <View style={styles.optionRow}>
              <OptionButton
                label="Veterinarian"
                selected={
                  doctorType === 'veterinarian'
                }
                onPress={() =>
                  setDoctorType('veterinarian')
                }
              />

              <OptionButton
                label="Agricultural Doctor"
                selected={
                  doctorType === 'agriculturalDoctor'
                }
                onPress={() =>
                  setDoctorType('agriculturalDoctor')
                }
              />
            </View>
          </View>

          {/* Professional */}
          <SectionHeader
            icon={<FileText size={19} color={GREEN} />}
            title="Professional information"
          />

          <View style={styles.card}>
            <InputField
              label="Specialization"
              value={specialization}
              onChangeText={setSpecialization}
              placeholder="Example: Surgery, Animal Nutrition"
              helper="Separate multiple specializations with commas"
            />

            <InputField
              label="Qualification"
              value={qualification}
              onChangeText={setQualification}
              placeholder="Example: BVSc, MVSc"
              helper="Separate multiple qualifications with commas"
            />

            <InputField
              label="Languages"
              value={languages}
              onChangeText={setLanguages}
              placeholder="Example: English, Hindi, Malayalam"
              helper="Separate languages with commas"
            />

            <InputField
              label="About"
              value={about}
              onChangeText={setAbout}
              placeholder="Tell farmers about your professional experience and services"
              multiline
            />

            <InputField
              label="Doctorate certificate"
              value={doctorateCertificate}
              onChangeText={setDoctorateCertificate}
              placeholder="Certificate reference or file information"
            />
          </View>

          {/* Consultation */}
          <SectionHeader
            icon={<Wallet size={19} color={GREEN} />}
            title="Consultation"
          />

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>
              Consultation fee type
            </Text>

            <View style={styles.optionRow}>
              <OptionButton
                label="Per consultation"
                selected={
                  consultationFeeType ===
                  'perConsultation'
                }
                onPress={() =>
                  setConsultationFeeType(
                    'perConsultation',
                  )
                }
              />

              <OptionButton
                label="Free"
                selected={
                  consultationFeeType === 'free'
                }
                onPress={() => {
                  setConsultationFeeType('free');
                  setConsultationFee('0');
                }}
              />
            </View>

            <InputField
              label="Consultation fee"
              value={consultationFee}
              onChangeText={setConsultationFee}
              placeholder="Enter fee"
              keyboardType="decimal-pad"
              editable={
                consultationFeeType !== 'free'
              }
            />
          </View>

          {/* Availability */}
          <SectionHeader
            icon={<Clock3 size={19} color={GREEN} />}
            title="Availability"
          />

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>
              Availability status
            </Text>

            <View style={styles.availabilityList}>
              <AvailabilityOption
                label="Available"
                description="Farmers can send new consultation requests"
                value="available"
                selected={
                  availability === 'available'
                }
                onPress={() =>
                  setAvailability('available')
                }
              />

              <AvailabilityOption
                label="Busy"
                description="Temporarily not accepting new requests"
                value="busy"
                selected={
                  availability === 'busy'
                }
                onPress={() =>
                  setAvailability('busy')
                }
              />

              <AvailabilityOption
                label="Unavailable"
                description="Hide your profile from new requests"
                value="unavailable"
                selected={
                  availability === 'unavailable'
                }
                onPress={() =>
                  setAvailability('unavailable')
                }
              />
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <InputField
                  label="Available from"
                  value={availableFrom}
                  placeholder="Select time"
                  onPress={() => setPicker('from')}
                  editable={false}
                />
              </View>

              <View style={styles.timeField}>
                <InputField
                  label="Available until"
                  value={availableUntil}
                  placeholder="Select time"
                  onPress={() => setPicker('until')}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.timeHint}>
              <Clock3 size={14} color={MUTED} />

              <Text style={styles.timeHintText}>
                Use 24-hour format, for example 09:00 and
                18:00.
              </Text>
            </View>
          </View>

          {/* Location */}
          <SectionHeader
            icon={<MapPin size={19} color={GREEN} />}
            title="Location"
          />

          <View style={styles.card}>
            <InputField
              label="State"
              value={stateName}
              onChangeText={setStateName}
              placeholder="Enter state"
            />

            <InputField
              label="District"
              value={district}
              onChangeText={setDistrict}
              placeholder="Enter district"
            />

            <InputField
              label="Village"
              value={village}
              onChangeText={setVillage}
              placeholder="Enter village"
            />

            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter complete address"
              multiline
            />
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isUpdating && styles.disabledButton,
            ]}
            activeOpacity={0.85}
            disabled={isUpdating}
            onPress={handleSave}
          >
            {isUpdating ? (
              <ActivityIndicator
                size="small"
                color={WHITE}
              />
            ) : (
              <>
                <Save
                  size={18}
                  color={WHITE}
                  strokeWidth={2.5}
                />

                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>

          {(myDoctorError || error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {getErrorMessage(
                  myDoctorError || error,
                )}
              </Text>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
      {picker ? (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimePickerChange}
        />
      ) : null}
      {feedback ? (
        <DoctorFeedbackModal
          visible
          title={feedback.title}
          message={feedback.message}
          variant={feedback.variant}
          onConfirm={() => {
            setFeedback(null);
            if (feedback.onConfirm) feedback.onConfirm();
          }}
          onClose={() => setFeedback(null)}
        />
      ) : null}
    </SafeAreaView>
  );
};

const formatTimeForInput = value => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>{icon}</View>

    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  helper,
  editable = true,
  autoCapitalize = 'sentences',
  onPress,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>

    <TouchableOpacity activeOpacity={onPress ? 0.8 : 1} onPress={onPress}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable && !onPress}
        autoCapitalize={autoCapitalize}
        pointerEvents={onPress ? 'none' : 'auto'}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.disabledInput,
        ]}
      />
    </TouchableOpacity>

    {helper ? (
      <Text style={styles.helperText}>{helper}</Text>
    ) : null}
  </View>
);

const OptionButton = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.optionButton,
      selected && styles.optionButtonSelected,
    ]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    {selected ? (
      <View style={styles.optionCheck}>
        <Check
          size={13}
          color={WHITE}
          strokeWidth={3}
        />
      </View>
    ) : null}

    <Text
      style={[
        styles.optionButtonText,
        selected && styles.optionButtonTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const AvailabilityOption = ({
  label,
  description,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.availabilityOption,
      selected && styles.availabilityOptionSelected,
    ]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View
      style={[
        styles.radio,
        selected && styles.radioSelected,
      ]}
    >
      {selected ? (
        <View style={styles.radioInner} />
      ) : null}
    </View>

    <View style={styles.availabilityInfo}>
      <Text style={styles.availabilityTitle}>
        {label}
      </Text>

      <Text style={styles.availabilityDescription}>
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 19,
    color: DARK,
    fontWeight: '800',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 9,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: 16,
    color: DARK,
    fontWeight: '800',
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 17,
  },

  inputContainer: {
    marginBottom: 15,
  },

  fieldLabel: {
    marginBottom: 7,
    fontSize: 12,
    color: DARK,
    fontWeight: '700',
  },

  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 13,
    color: DARK,
    fontSize: 13,
  },

  multilineInput: {
    minHeight: 92,
    paddingTop: 12,
  },

  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: MUTED,
  },

  helperText: {
    marginTop: 5,
    fontSize: 10,
    color: MUTED,
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },

  optionButton: {
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  optionButtonSelected: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },

  optionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  optionButtonText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '700',
  },

  optionButtonTextSelected: {
    color: GREEN,
  },

  availabilityList: {
    gap: 8,
    marginBottom: 15,
  },

  availabilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    padding: 12,
    backgroundColor: WHITE,
  },

  availabilityOptionSelected: {
    borderColor: '#A7DDBA',
    backgroundColor: LIGHT_GREEN,
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: GREEN,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GREEN,
  },

  availabilityInfo: {
    flex: 1,
    marginLeft: 10,
  },

  availabilityTitle: {
    fontSize: 13,
    color: DARK,
    fontWeight: '800',
  },

  availabilityDescription: {
    marginTop: 3,
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
  },

  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  timeField: {
    flex: 1,
  },

  timeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    padding: 10,
    marginTop: -2,
  },

  timeHintText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 10,
    color: MUTED,
    lineHeight: 15,
  },

  saveButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    marginLeft: 8,
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  errorText: {
    color: RED,
    fontSize: 12,
    lineHeight: 18,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,
    color: DARK,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpace: {
    height: 15,
  },
});

export default DoctorEditProfileScreen;