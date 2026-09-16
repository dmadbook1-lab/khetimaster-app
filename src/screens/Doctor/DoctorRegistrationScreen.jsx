import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  Check,
  ChevronDown,
  Stethoscope,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { createDoctor } from '../../redux/slices/doctorSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';
const RED = '#DC2626';

const DoctorRegistrationScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const {
    isCreating,
    createError,
  } = useSelector((state) => state.doctor);

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [doctorType, setDoctorType] = useState('');
  const [showDoctorType, setShowDoctorType] =
    useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [specialization, setSpecialization] =
    useState('');

  const [qualification, setQualification] =
    useState('');

  const [languages, setLanguages] = useState('');

  const [about, setAbout] = useState('');

  const [consultationFee, setConsultationFee] =
    useState('');

  const [consultationFeeType, setConsultationFeeType] =
    useState('perConsultation');

  const [availability, setAvailability] =
    useState('available');

  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');

  /*
  |--------------------------------------------------------------------------
  | DOCTOR TYPES
  |--------------------------------------------------------------------------
  */

  const doctorTypes = useMemo(
    () => [
      {
        value: 'veterinarian',
        label: 'Veterinarian',
        description:
          'Animal health, treatment and veterinary care',
      },
      {
        value: 'agriculturalDoctor',
        label: 'Agricultural Doctor',
        description:
          'Crop, soil and agricultural guidance',
      },
    ],
    [],
  );

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const parseCommaSeparated = (value) => {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const selectedDoctorType = doctorTypes.find(
    (item) => item.value === doctorType,
  );

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert(
        'Required',
        'Please enter your full name.',
      );
      return false;
    }

    if (!doctorType) {
      Alert.alert(
        'Required',
        'Please select your doctor type.',
      );
      return false;
    }

    if (!phoneNumber.trim()) {
      Alert.alert(
        'Required',
        'Please enter your phone number.',
      );
      return false;
    }

    if (!email.trim()) {
      Alert.alert(
        'Required',
        'Please enter your email address.',
      );
      return false;
    }

    if (!qualification.trim()) {
      Alert.alert(
        'Required',
        'Please enter your qualification.',
      );
      return false;
    }

    if (
      consultationFee.trim() &&
      (
        Number.isNaN(Number(consultationFee)) ||
        Number(consultationFee) < 0
      )
    ) {
      Alert.alert(
        'Invalid fee',
        'Please enter a valid consultation fee.',
      );
      return false;
    }

    if (!stateName.trim()) {
      Alert.alert(
        'Required',
        'Please enter your state.',
      );
      return false;
    }

    if (!district.trim()) {
      Alert.alert(
        'Required',
        'Please enter your district.',
      );
      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      fullName: fullName.trim(),

      phoneNumber: phoneNumber.trim(),

      email: email.trim().toLowerCase(),

      doctorType,

      specialization:
        parseCommaSeparated(specialization),

      qualification:
        parseCommaSeparated(qualification),

      /*
       * Certificate upload will be connected
       * in the next registration step.
       */

      doctorateCertificate: '',

      languages:
        parseCommaSeparated(languages),

      about: about.trim(),

      consultationFee: consultationFee.trim()
        ? Number(consultationFee)
        : 0,

      consultationFeeType,

      availability,

      availableFrom: null,

      availableUntil: null,

      state: stateName.trim(),

      district: district.trim(),

      village: village.trim(),

      address: address.trim(),

      profileCompleted: true,
    };

    try {
      const result = await dispatch(
        createDoctor(payload),
      ).unwrap();

      Alert.alert(
        'Profile Created',
        'Your doctor profile has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );

      return result;
    } catch (error) {
      Alert.alert(
        'Unable to create profile',
        error ||
          'Something went wrong while creating your doctor profile.',
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT COMPONENT
  |--------------------------------------------------------------------------
  */

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = 'default',
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
          multiline={multiline}
          keyboardType={keyboardType}
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
              strokeWidth={2}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Register as a Doctor
            </Text>

            <Text style={styles.headerSubtitle}>
              Create your professional profile
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
          {/* INTRO */}

          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Stethoscope
                size={25}
                color={GREEN}
                strokeWidth={2}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>
                Join KhetiMaster as a Doctor
              </Text>

              <Text style={styles.introText}>
                Help farmers with professional
                veterinary and agricultural guidance.
              </Text>
            </View>
          </View>

          {/* BASIC INFORMATION */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Basic Information
            </Text>

            <Text style={styles.sectionDescription}>
              Tell farmers who you are and what
              kind of professional help you provide.
            </Text>

            {/* DOCTOR TYPE */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Doctor Type
              </Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() =>
                  setShowDoctorType(
                    !showDoctorType,
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectText,
                    !selectedDoctorType &&
                      styles.placeholderText,
                  ]}
                >
                  {selectedDoctorType
                    ? selectedDoctorType.label
                    : 'Select doctor type'}
                </Text>

                <ChevronDown
                  size={20}
                  color={MUTED}
                />
              </TouchableOpacity>

              {showDoctorType && (
                <View style={styles.dropdown}>
                  {doctorTypes.map((item) => {
                    const selected =
                      doctorType === item.value;

                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.dropdownItem,
                          selected &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setDoctorType(
                            item.value,
                          );
                          setShowDoctorType(
                            false,
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={
                            styles.dropdownText
                          }
                        >
                          <Text
                            style={[
                              styles.dropdownTitle,
                              selected &&
                                styles.dropdownTitleSelected,
                            ]}
                          >
                            {item.label}
                          </Text>

                          <Text
                            style={
                              styles.dropdownDescription
                            }
                          >
                            {item.description}
                          </Text>
                        </View>

                        {selected && (
                          <Check
                            size={19}
                            color={GREEN}
                            strokeWidth={2.5}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {renderInput({
              label: 'Full Name',
              value: fullName,
              onChangeText: setFullName,
              placeholder:
                'Enter your full name',
            })}

            {renderInput({
              label: 'Phone Number',
              value: phoneNumber,
              onChangeText: setPhoneNumber,
              placeholder:
                'Enter your phone number',
              keyboardType: 'phone-pad',
            })}

            {renderInput({
              label: 'Email',
              value: email,
              onChangeText: setEmail,
              placeholder:
                'Enter your email address',
              keyboardType: 'email-address',
            })}
          </View>

          {/* PROFESSIONAL INFORMATION */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Professional Information
            </Text>

            <Text style={styles.sectionDescription}>
              Add your qualifications and areas of
              expertise.
            </Text>

            {renderInput({
              label: 'Specialization',
              value: specialization,
              onChangeText: setSpecialization,
              placeholder:
                'e.g. Animal Surgery, Dairy Health',
              optional: true,
            })}

            <Text style={styles.helperText}>
              Separate multiple specializations with
              commas.
            </Text>

            {renderInput({
              label: 'Qualification',
              value: qualification,
              onChangeText: setQualification,
              placeholder:
                'e.g. BVSc, MVSc',
            })}

            <Text style={styles.helperText}>
              Separate multiple qualifications with
              commas.
            </Text>

            {renderInput({
              label: 'Languages',
              value: languages,
              onChangeText: setLanguages,
              placeholder:
                'e.g. Malayalam, Hindi, English',
              optional: true,
            })}

            <Text style={styles.helperText}>
              Separate multiple languages with commas.
            </Text>

            {renderInput({
              label: 'About You',
              value: about,
              onChangeText: setAbout,
              placeholder:
                'Tell farmers about your experience and the help you provide...',
              multiline: true,
              optional: true,
            })}
          </View>

          {/* CONSULTATION */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Consultation Details
            </Text>

            <Text style={styles.sectionDescription}>
              Set your consultation fee and current
              availability.
            </Text>

            {renderInput({
              label: 'Consultation Fee',
              value: consultationFee,
              onChangeText: setConsultationFee,
              placeholder: 'Enter amount',
              keyboardType: 'numeric',
              optional: true,
            })}

            <Text style={styles.inputLabel}>
              Fee Type
            </Text>

            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  consultationFeeType ===
                    'perConsultation' &&
                    styles.optionButtonSelected,
                ]}
                onPress={() =>
                  setConsultationFeeType(
                    'perConsultation',
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    consultationFeeType ===
                      'perConsultation' &&
                      styles.optionTextSelected,
                  ]}
                >
                  Per Consultation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  consultationFeeType ===
                    'free' &&
                    styles.optionButtonSelected,
                ]}
                onPress={() =>
                  setConsultationFeeType('free')
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    consultationFeeType ===
                      'free' &&
                      styles.optionTextSelected,
                  ]}
                >
                  Free
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.inputLabel,
                styles.availabilityLabel,
              ]}
            >
              Availability
            </Text>

            <View style={styles.optionRow}>
              {[
                {
                  value: 'available',
                  label: 'Available',
                },
                {
                  value: 'busy',
                  label: 'Busy',
                },
                {
                  value: 'unavailable',
                  label: 'Unavailable',
                },
              ].map((item) => {
                const selected =
                  availability === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.availabilityButton,
                      selected &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setAvailability(
                        item.value,
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* LOCATION */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Location
            </Text>

            <Text style={styles.sectionDescription}>
              Help farmers find professionals in
              their area.
            </Text>

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
                'Enter clinic / office address',
              multiline: true,
              optional: true,
            })}
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
                Create Doctor Profile
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.bottomNote}>
            You can update your doctor profile later
            from your profile settings.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DoctorRegistrationScreen;

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

  headerTextContainer: {
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

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 35,
  },

  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN,
    marginBottom: 22,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },

  introContent: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },

  introText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
  },

  section: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF0F1',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },

  sectionDescription: {
    marginTop: 5,
    marginBottom: 18,
    fontSize: 12,
    lineHeight: 18,
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
    marginBottom: 8,
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

  multilineInput: {
    height: 105,
    paddingTop: 13,
  },

  helperText: {
    marginTop: -10,
    marginBottom: 16,
    fontSize: 11,
    lineHeight: 16,
    color: '#9CA3AF',
  },

  selectButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    color: DARK,
  },

  placeholderText: {
    color: '#9CA3AF',
  },

  dropdown: {
    marginTop: 7,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: WHITE,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  dropdownItemSelected: {
    backgroundColor: '#F3FAF5',
  },

  dropdownText: {
    flex: 1,
  },

  dropdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
  },

  dropdownTitleSelected: {
    color: GREEN,
  },

  dropdownDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },

  optionButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },

  availabilityButton: {
    minHeight: 42,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },

  optionButtonSelected: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },

  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },

  optionTextSelected: {
    color: GREEN,
  },

  availabilityLabel: {
    marginTop: 15,
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
    marginTop: 3,
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