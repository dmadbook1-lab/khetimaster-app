import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  MapPin,
  Stethoscope,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createDoctorConsultation } from '../../redux/slices/doctorConsultationSlice';
import DoctorFeedbackModal from './DoctorFeedbackModal';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';
const BG = '#F8FAF9';
const RED = '#DC2626';

const PickerField = ({
  label,
  value,
  placeholder,
  error,
  onPress,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.input, error && styles.inputError]}
      onPress={onPress}
    >
      <Text style={value ? styles.inputText : styles.placeholderText}>
        {value || placeholder}
      </Text>
    </TouchableOpacity>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const DoctorConsultationScreen = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();

  const doctor =
    route?.params?.doctor || null;

  const doctorId =
    route?.params?.doctorId ||
    doctor?._id;

  const {
    isCreating,
    createError,
  } = useSelector(
    (state) => state.doctorConsultation,
  );

  const [consultationType, setConsultationType] =
    useState(
      doctor?.doctorType ===
        'agriculturalDoctor'
        ? 'agricultural'
        : 'veterinary',
    );

  const [problemType, setProblemType] =
    useState('');

  const [animalType, setAnimalType] =
    useState('');

  const [animalCount, setAnimalCount] =
    useState('');

  const [animalAge, setAnimalAge] =
    useState('');

  const [symptoms, setSymptoms] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [consultationDate, setConsultationDate] =
    useState('');

  const [startTime, setStartTime] =
    useState('');

  const [endTime, setEndTime] =
    useState('');

  const [stateName, setStateName] =
    useState('');

  const [district, setDistrict] =
    useState('');

  const [village, setVillage] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [farmerNotes, setFarmerNotes] =
    useState('');

  const [paymentMethod, setPaymentMethod] =
    useState('cod');

  const [errors, setErrors] = useState({});
  const [picker, setPicker] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const formatPickerDate = value => value.toISOString().slice(0, 10);
  const formatPickerTime = value =>
    value.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const handlePickerChange = (event, value) => {
    if (Platform.OS === 'android') {
      setPicker(null);
    }

    if (!value || event?.type === 'dismissed') return;

    const formatted =
      picker?.mode === 'date'
        ? formatPickerDate(value)
        : formatPickerTime(value);

    if (picker?.field === 'date') setConsultationDate(formatted);
    if (picker?.field === 'start') setStartTime(formatted);
    if (picker?.field === 'end') setEndTime(formatted);
    if (picker?.field === 'date') setErrors(prev => ({ ...prev, date: '' }));
    if (picker?.field === 'start') setErrors(prev => ({ ...prev, startTime: '' }));
  };

  /*
  |--------------------------------------------------------------------------
  | DOCTOR TYPE
  |--------------------------------------------------------------------------
  */

  const doctorTypeLabel = useMemo(() => {
    if (
      doctor?.doctorType ===
      'agriculturalDoctor'
    ) {
      return 'Agricultural Doctor';
    }

    return 'Veterinarian';
  }, [doctor]);

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    const nextErrors = {};

    if (!doctorId) {
      nextErrors.doctor =
        'Doctor information is missing.';
    }

    if (!consultationDate.trim()) {
      nextErrors.date =
        'Enter the consultation date.';
    } else if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        consultationDate.trim(),
      )
    ) {
      nextErrors.date =
        'Use date format YYYY-MM-DD.';
    }

    if (!startTime.trim()) {
      nextErrors.startTime =
        'Enter the start time.';
    }

    if (
      consultationType ===
        'veterinary' &&
      !animalType.trim()
    ) {
      nextErrors.animalType =
        'Enter the animal type.';
    }

    if (
      !description.trim() &&
      !symptoms.trim()
    ) {
      nextErrors.problem =
        'Describe the problem or symptoms.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE CONSULTATION
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    if (!doctorId) {
      return;
    }

    const fee =
      doctor?.consultationFeeType ===
      'free'
        ? 0
        : Number(
            doctor?.consultationFee || 0,
          );

    const payload = {
      doctorId,

      consultationDate:
        consultationDate.trim(),

      startTime:
        startTime.trim(),

      endTime:
        endTime.trim(),

      consultationType,

      problemType:
        problemType.trim(),

      animalType:
        animalType.trim(),

      animalCount:
        animalCount.trim(),

      animalAge:
        animalAge.trim(),

      symptoms:
        symptoms.trim(),

      description:
        description.trim(),

      state:
        stateName.trim(),

      district:
        district.trim(),

      village:
        village.trim(),

      address:
        address.trim(),

      consultationFee: fee,

      totalAmount: fee,

      paymentMethod,

      farmerNotes:
        farmerNotes.trim(),
    };

    try {
      const result = await dispatch(
        createDoctorConsultation(payload),
      ).unwrap();

      const consultation = result?.consultation || result?.data || result;
      const consultationId = consultation?._id || consultation?.id;
      setFeedback({
        title: 'Consultation Requested',
        message: 'Your consultation request has been sent to the doctor.',
        variant: 'success',
        confirmText: 'View Consultation',
        onConfirm: () => {
          setFeedback(null);
          if (consultationId) {
            navigation.replace('DoctorConsultationDetails', { consultationId });
          } else {
            navigation.goBack();
          }
        },
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to Request',
        message: error?.message || 'Something went wrong while creating the consultation.',
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FIELD
  |--------------------------------------------------------------------------
  */

  const renderField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    error,
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
      />

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );

  /*
  |--------------------------------------------------------------------------
  | SCREEN
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.75}
        >
          <ArrowLeft
            size={22}
            color={DARK}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Ask for Consultation
          </Text>

          <Text style={styles.headerSubtitle}>
            Book professional help
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* DOCTOR */}

        <View style={styles.doctorCard}>
          <View style={styles.doctorIcon}>
            <Stethoscope
              size={25}
              color={GREEN}
            />
          </View>

          <View style={styles.doctorInfo}>
            <Text
              style={styles.doctorName}
              numberOfLines={1}
            >
              {doctor?.fullName ||
                'Selected Doctor'}
            </Text>

            <Text style={styles.doctorType}>
              {doctorTypeLabel}
            </Text>
          </View>

          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>
              Fee
            </Text>

            <Text style={styles.feeValue}>
              {doctor?.consultationFeeType ===
              'free'
                ? 'Free'
                : `₹${doctor?.consultationFee || 0}`}
            </Text>
          </View>
        </View>

        {/* CONSULTATION TYPE */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Consultation Type
          </Text>

          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                consultationType ===
                  'veterinary' &&
                  styles.typeCardSelected,
              ]}
              onPress={() =>
                setConsultationType(
                  'veterinary',
                )
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radio,
                  consultationType ===
                    'veterinary' &&
                    styles.radioSelected,
                ]}
              >
                {consultationType ===
                  'veterinary' && (
                  <Check
                    size={12}
                    color={WHITE}
                  />
                )}
              </View>

              <Stethoscope
                size={18}
                color={
                  consultationType ===
                  'veterinary'
                    ? GREEN
                    : MUTED
                }
              />

              <Text
                style={[
                  styles.typeText,
                  consultationType ===
                    'veterinary' &&
                    styles.typeTextSelected,
                ]}
              >
                Veterinary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                consultationType ===
                  'agricultural' &&
                  styles.typeCardSelected,
              ]}
              onPress={() =>
                setConsultationType(
                  'agricultural',
                )
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radio,
                  consultationType ===
                    'agricultural' &&
                    styles.radioSelected,
                ]}
              >
                {consultationType ===
                  'agricultural' && (
                  <Check
                    size={12}
                    color={WHITE}
                  />
                )}
              </View>

              <Stethoscope
                size={18}
                color={
                  consultationType ===
                  'agricultural'
                    ? GREEN
                    : MUTED
                }
              />

              <Text
                style={[
                  styles.typeText,
                  consultationType ===
                    'agricultural' &&
                    styles.typeTextSelected,
                ]}
              >
                Agricultural
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DATE & TIME */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <CalendarDays
              size={18}
              color={GREEN}
            />

            <Text style={styles.sectionTitle}>
              Date & Time
            </Text>
          </View>

          <PickerField
            label="Consultation Date"
            value={consultationDate}
            placeholder="Select date"
            error={errors.date}
            onPress={() => setPicker({ field: 'date', mode: 'date' })}
          />

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <PickerField
                label="Start Time"
                value={startTime}
                placeholder="Select time"
                error={errors.startTime}
                onPress={() => setPicker({ field: 'start', mode: 'time' })}
              />
            </View>

            <View style={styles.column}>
              <PickerField
                label="End Time"
                value={endTime}
                placeholder="Select time"
                onPress={() => setPicker({ field: 'end', mode: 'time' })}
              />
            </View>
          </View>

          <View style={styles.hintRow}>
            <Clock3
              size={14}
              color={MUTED}
            />

            <Text style={styles.hintText}>
              Choose a time that works for both
              you and the doctor.
            </Text>
          </View>
        </View>

        {/* VETERINARY DETAILS */}

        {consultationType ===
          'veterinary' && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Stethoscope
                size={18}
                color={GREEN}
              />

              <Text style={styles.sectionTitle}>
                Animal Details
              </Text>
            </View>

            {renderField({
              label: 'Animal Type',
              value: animalType,
              onChangeText: (value) => {
                setAnimalType(value);
                setErrors((prev) => ({
                  ...prev,
                  animalType: '',
                }));
              },
              placeholder:
                'Cow, goat, buffalo, poultry...',
              error: errors.animalType,
            })}

            <View style={styles.twoColumns}>
              <View style={styles.column}>
                {renderField({
                  label: 'Animal Count',
                  value: animalCount,
                  onChangeText:
                    setAnimalCount,
                  placeholder: 'e.g. 2',
                  keyboardType:
                    Platform.OS ===
                    'ios'
                      ? 'number-pad'
                      : 'numeric',
                })}
              </View>

              <View style={styles.column}>
                {renderField({
                  label: 'Animal Age',
                  value: animalAge,
                  onChangeText:
                    setAnimalAge,
                  placeholder:
                    'e.g. 2 years',
                })}
              </View>
            </View>
          </View>
        )}

        {/* PROBLEM */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <FileText
              size={18}
              color={GREEN}
            />

            <Text style={styles.sectionTitle}>
              Problem Details
            </Text>
          </View>

          {renderField({
            label: 'Problem Type',
            value: problemType,
            onChangeText:
              setProblemType,
            placeholder:
              'Disease, nutrition, crop issue...',
          })}

          {consultationType ===
            'veterinary' &&
            renderField({
              label: 'Symptoms',
              value: symptoms,
              onChangeText: (value) => {
                setSymptoms(value);
                setErrors((prev) => ({
                  ...prev,
                  problem: '',
                }));
              },
              placeholder:
                'Describe visible symptoms',
              multiline: true,
              error: errors.problem,
            })}

          {renderField({
            label: 'Describe the Problem',
            value: description,
            onChangeText: (value) => {
              setDescription(value);
              setErrors((prev) => ({
                ...prev,
                problem: '',
              }));
            },
            placeholder:
              'Explain your problem in detail...',
            multiline: true,
            error:
              consultationType ===
                'agricultural'
                ? errors.problem
                : undefined,
          })}
        </View>

        {/* LOCATION */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MapPin
              size={18}
              color={GREEN}
            />

            <Text style={styles.sectionTitle}>
              Location
            </Text>
          </View>

          {renderField({
            label: 'State',
            value: stateName,
            onChangeText:
              setStateName,
            placeholder: 'Enter state',
          })}

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              {renderField({
                label: 'District',
                value: district,
                onChangeText:
                  setDistrict,
                placeholder:
                  'Enter district',
              })}
            </View>

            <View style={styles.column}>
              {renderField({
                label: 'Village',
                value: village,
                onChangeText:
                  setVillage,
                placeholder:
                  'Enter village',
              })}
            </View>
          </View>

          {renderField({
            label: 'Address',
            value: address,
            onChangeText:
              setAddress,
            placeholder:
              'Farm or consultation address',
            multiline: true,
          })}
        </View>

        {/* PAYMENT */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment Method
          </Text>

          <View style={styles.paymentRow}>
            {[
              {
                value: 'cod',
                label: 'Cash',
              },
              {
                value: 'upi',
                label: 'UPI',
              },
              {
                value: 'card',
                label: 'Card',
              },
              {
                value: 'wallet',
                label: 'Wallet',
              },
            ].map((item) => {
              const selected =
                paymentMethod ===
                item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.paymentChip,
                    selected &&
                      styles.paymentChipSelected,
                  ]}
                  onPress={() =>
                    setPaymentMethod(
                      item.value,
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      selected &&
                        styles.paymentTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* NOTES */}

        <View style={styles.section}>
          {renderField({
            label: 'Additional Notes',
            value: farmerNotes,
            onChangeText:
              setFarmerNotes,
            placeholder:
              'Anything else the doctor should know...',
            multiline: true,
          })}
        </View>

        {/* BACKEND ERROR */}

        {createError ? (
          <View style={styles.backendError}>
            <Text style={styles.backendErrorText}>
              {createError}
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM ACTION */}

      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            Total
          </Text>

          <Text style={styles.totalValue}>
            {doctor?.consultationFeeType ===
            'free'
              ? 'Free'
              : `₹${doctor?.consultationFee || 0}`}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isCreating &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isCreating}
          activeOpacity={0.85}
        >
          {isCreating ? (
            <ActivityIndicator
              size="small"
              color={WHITE}
            />
          ) : (
            <Text style={styles.submitText}>
              Request Consultation
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {picker ? (
        <DateTimePicker
          value={
            picker.mode === 'date'
              ? consultationDate
                ? new Date(`${consultationDate}T00:00:00`)
                : new Date()
              : new Date()
          }
          mode={picker.mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={picker.mode === 'date' ? new Date() : undefined}
          onChange={handlePickerChange}
        />
      ) : null}

      {feedback ? (
        <DoctorFeedbackModal
          visible
          title={feedback.title}
          message={feedback.message}
          variant={feedback.variant}
          confirmText={feedback.confirmText}
          onConfirm={feedback.onConfirm || (() => setFeedback(null))}
          onClose={() => setFeedback(null)}
        />
      ) : null}
    </SafeAreaView>
  );
};

export default DoctorConsultationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F2',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  headerText: {
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: MUTED,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 25,
  },

  doctorCard: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  doctorIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },

  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },

  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },

  doctorType: {
    marginTop: 4,
    fontSize: 11,
    color: MUTED,
  },

  feeContainer: {
    alignItems: 'flex-end',
  },

  feeLabel: {
    fontSize: 10,
    color: MUTED,
  },

  feeValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: GREEN,
  },

  section: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionTitle: {
    marginBottom: 13,
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 9,
  },

  typeCard: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  typeCardSelected: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },

  radio: {
    width: 20,
    height: 20,
    marginRight: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
  },

  radioSelected: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },

  typeText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
  },

  typeTextSelected: {
    color: GREEN,
  },

  fieldContainer: {
    marginBottom: 13,
  },

  fieldLabel: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },

  input: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FAFAFA',
    fontSize: 12,
    color: DARK,
  },

  multilineInput: {
    height: 95,
    paddingTop: 12,
    paddingBottom: 10,
  },

  inputError: {
    borderColor: '#FCA5A5',
  },

  errorText: {
    marginTop: 5,
    fontSize: 10,
    color: RED,
  },

  twoColumns: {
    flexDirection: 'row',
    gap: 10,
  },

  column: {
    flex: 1,
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -2,
  },

  hintText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 10,
    lineHeight: 15,
    color: MUTED,
  },

  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  paymentChip: {
    minWidth: 68,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  inputText: {
    fontSize: 14,
    color: DARK,
  },

  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  paymentChipSelected: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },

  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
  },

  paymentTextSelected: {
    color: GREEN,
  },

  backendError: {
    marginTop: 14,
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },

  backendErrorText: {
    fontSize: 11,
    lineHeight: 17,
    color: RED,
  },

  bottomSpace: {
    height: 10,
  },

  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#EDEFF0',
  },

  totalContainer: {
    width: 75,
  },

  totalLabel: {
    fontSize: 10,
    color: MUTED,
  },

  totalValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },

  submitButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
  },

  submitButtonDisabled: {
    backgroundColor: '#86B99A',
  },

  submitText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
});