import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock3,
  FileText,
  MapPin,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createDoctor } from '../../redux/slices/doctorSlice';
import DoctorFeedbackModal from './DoctorFeedbackModal';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';
const RED = '#DC2626';

const PickerField = ({ label, value, placeholder, optional, onPress }) => (
  <View style={styles.inputGroup}>
    <View style={styles.labelRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      {optional ? <Text style={styles.optionalText}>Optional</Text> : null}
    </View>
    <TouchableOpacity style={styles.input} activeOpacity={0.8} onPress={onPress}>
      <Text style={value ? styles.inputText : styles.placeholderText}>
        {value || placeholder}
      </Text>
    </TouchableOpacity>
  </View>
);

const DoctorRegistrationDetailsScreen = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();

  const {
    isCreating,
    createError,
  } = useSelector((state) => state.doctor);

  /*
  |--------------------------------------------------------------------------
  | DATA FROM STEP 1
  |--------------------------------------------------------------------------
  */

  const stepOneData =
    route?.params?.doctorData || {};

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [certificate, setCertificate] =
    useState(
      stepOneData.doctorateCertificate || '',
    );

  const [fromTime, setFromTime] = useState('');

  const [untilTime, setUntilTime] = useState('');
  const [picker, setPicker] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const formatTime = value =>
    value.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const handlePickerChange = (event, value) => {
    if (Platform.OS === 'android') setPicker(null);
    if (!value || event?.type === 'dismissed') return;
    const formatted = formatTime(value);
    if (picker?.field === 'from') setFromTime(formatted);
    if (picker?.field === 'until') setUntilTime(formatted);
  };

  const [stateName, setStateName] =
    useState(stepOneData.state || '');

  const [district, setDistrict] =
    useState(stepOneData.district || '');

  const [village, setVillage] =
    useState(stepOneData.village || '');

  const [address, setAddress] =
    useState(stepOneData.address || '');

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const convertTimeToDate = (time) => {
    if (!time) {
      return null;
    }

    const match = time.match(
      /^(\d{1,2}):(\d{2})$/,
    );

    if (!match) {
      return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    const date = new Date();

    date.setHours(hour, minute, 0, 0);

    return date.toISOString();
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateTime = (time) => {
    if (!time) {
      return false;
    }

    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
      time,
    );
  };

  const validateForm = () => {
    if (!certificate.trim()) {
      setFeedback({ title: 'Certificate required', message: 'Please enter your doctorate certificate reference.' });

      return false;
    }

    if (fromTime && !validateTime(fromTime)) {
      setFeedback({ title: 'Invalid time', message: 'Please choose a valid starting time.' });

      return false;
    }

    if (untilTime && !validateTime(untilTime)) {
      setFeedback({ title: 'Invalid time', message: 'Please choose a valid ending time.' });

      return false;
    }

    if (!stateName.trim()) {
      setFeedback({ title: 'Required', message: 'Please enter your state.' });

      return false;
    }

    if (!district.trim()) {
      setFeedback({ title: 'Required', message: 'Please enter your district.' });

      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleCreateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      ...stepOneData,

      doctorateCertificate:
        certificate.trim(),

      availableFrom:
        convertTimeToDate(fromTime),

      availableUntil:
        convertTimeToDate(untilTime),

      state: stateName.trim(),

      district: district.trim(),

      village: village.trim(),

      address: address.trim(),

      profileCompleted: true,
    };

    try {
      await dispatch(
        createDoctor(payload),
      ).unwrap();

      setFeedback({
        title: 'Profile Created',
        message: 'Your doctor profile has been created successfully.',
        variant: 'success',
        onConfirm: () => {
          setFeedback(null);
          navigation.navigate('Home');
        },
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to create profile',
        message: error?.message || 'Something went wrong while creating your doctor profile.',
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT
  |--------------------------------------------------------------------------
  */

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    optional = false,
  }) => {
    return (
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>
            {label}
          </Text>

          {optional && (
            <Text style={styles.optionalText}>
              Optional
            </Text>
          )}
        </View>

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
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <ArrowLeft
              size={22}
              color={DARK}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              Complete Your Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Professional details
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              2/2
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
          {/* PROGRESS */}

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressText}>
              Almost there
            </Text>
          </View>

          {/* CERTIFICATE */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FileText
                  size={20}
                  color={GREEN}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Professional Certificate
                </Text>

                <Text
                  style={styles.sectionDescription}
                >
                  Add your professional certificate
                  information.
                </Text>
              </View>
            </View>

            {renderInput({
              label: 'Doctorate Certificate',
              value: certificate,
              onChangeText: setCertificate,
              placeholder:
                'Enter certificate reference or details',
            })}

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                This information will be associated
                with your doctor profile.
              </Text>
            </View>
          </View>

          {/* AVAILABILITY */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CalendarClock
                  size={20}
                  color={GREEN}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Consultation Hours
                </Text>

                <Text
                  style={styles.sectionDescription}
                >
                  Let farmers know when you are
                  generally available.
                </Text>
              </View>
            </View>

            <PickerField
              label="Available From"
              value={fromTime}
              placeholder="Select time"
              optional
              onPress={() => setPicker({ field: 'from' })}
            />

            <PickerField
              label="Available Until"
              value={untilTime}
              placeholder="Select time"
              optional
              onPress={() => setPicker({ field: 'until' })}
            />

            <View style={styles.timeHint}>
              <Clock3
                size={16}
                color={MUTED}
              />

              <Text style={styles.timeHintText}>
                Use 24-hour format, for example
                09:00 to 17:00.
              </Text>
            </View>
          </View>

          {/* LOCATION */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MapPin
                  size={20}
                  color={GREEN}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Practice Location
                </Text>

                <Text
                  style={styles.sectionDescription}
                >
                  Add your location so nearby
                  farmers can find you.
                </Text>
              </View>
            </View>

            {renderInput({
              label: 'State',
              value: stateName,
              onChangeText: setStateName,
              placeholder: 'Enter state',
            })}

            {renderInput({
              label: 'District',
              value: district,
              onChangeText: setDistrict,
              placeholder: 'Enter district',
            })}

            {renderInput({
              label: 'Village',
              value: village,
              onChangeText: setVillage,
              placeholder: 'Enter village',
              optional: true,
            })}

            {renderInput({
              label: 'Address',
              value: address,
              onChangeText: setAddress,
              placeholder:
                'Clinic, hospital or office address',
              multiline: true,
              optional: true,
            })}
          </View>

          {/* CONFIRMATION */}

          <View style={styles.confirmationCard}>
            <View style={styles.confirmationIcon}>
              <Check
                size={19}
                color={GREEN}
                strokeWidth={2.5}
              />
            </View>

            <View style={styles.confirmationContent}>
              <Text style={styles.confirmationTitle}>
                Ready to join KhetiMaster
              </Text>

              <Text style={styles.confirmationText}>
                Your profile will be available to
                farmers looking for professional
                agricultural or veterinary help.
              </Text>
            </View>
          </View>

          {/* ERROR */}

          {createError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {createError}
              </Text>
            </View>
          )}

          {/* SUBMIT */}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isCreating &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleCreateProfile}
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
                Create Doctor Profile
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.bottomNote}>
            You can update these details later from
            your doctor profile.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      {picker ? (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
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

export default DoctorRegistrationDetailsScreen;

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
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

  headerContent: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  stepBadge: {
    minWidth: 42,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },

  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 35,
  },

  progressContainer: {
    marginBottom: 18,
  },

  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: GREEN,
  },

  progressText: {
    marginTop: 7,
    fontSize: 11,
    color: MUTED,
  },

  section: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF0F1',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 19,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },

  sectionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },

  inputGroup: {
    marginBottom: 16,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  optionalText: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: DARK,
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

  multilineInput: {
    height: 100,
    paddingTop: 13,
  },

  infoBox: {
    padding: 12,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: MUTED,
  },

  timeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 1,
  },

  timeHintText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },

  confirmationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    marginBottom: 15,
    borderRadius: 17,
    backgroundColor: LIGHT_GREEN,
  },

  confirmationIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },

  confirmationContent: {
    flex: 1,
    marginLeft: 11,
  },

  confirmationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },

  confirmationText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: '#4B5563',
  },

  errorContainer: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
  },

  errorText: {
    fontSize: 12,
    lineHeight: 18,
    color: RED,
  },

  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },

  bottomNote: {
    textAlign: 'center',
    marginTop: 13,
    paddingHorizontal: 20,
    fontSize: 11,
    lineHeight: 17,
    color: '#9CA3AF',
  },
});