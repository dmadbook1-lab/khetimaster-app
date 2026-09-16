import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
  UserRound,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  getDoctorById,
  clearSelectedDoctor,
} from '../../redux/slices/doctorSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';
const BG = '#F8FAF9';

const DoctorDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const doctorId = route?.params?.doctorId;

  const {
    selectedDoctor,
    isLoadingDoctor,
    selectedDoctorError,
  } = useSelector((state) => state.doctor);

  /*
  |--------------------------------------------------------------------------
  | LOAD DOCTOR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!doctorId) {
      return;
    }

    dispatch(getDoctorById(doctorId));

    return () => {
      dispatch(clearSelectedDoctor());
    };
  }, [dispatch, doctorId]);

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getDoctorTypeLabel = (type) => {
    if (type === 'veterinarian') {
      return 'Veterinarian';
    }

    if (type === 'agriculturalDoctor') {
      return 'Agricultural Doctor';
    }

    return 'Doctor';
  };

  const getAvailabilityLabel = (availability) => {
    if (availability === 'available') {
      return 'Available now';
    }

    if (availability === 'busy') {
      return 'Currently busy';
    }

    return 'Currently unavailable';
  };

  const getAvailabilityColor = (availability) => {
    if (availability === 'available') {
      return GREEN;
    }

    if (availability === 'busy') {
      return '#D97706';
    }

    return '#6B7280';
  };

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoadingDoctor && !selectedDoctor) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={GREEN}
          />

          <Text style={styles.loadingText}>
            Loading doctor profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (
    selectedDoctorError &&
    !selectedDoctor
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
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

          <Text style={styles.headerTitle}>
            Doctor Profile
          </Text>
        </View>

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Stethoscope
              size={28}
              color={GREEN}
            />
          </View>

          <Text style={styles.errorTitle}>
            Unable to load profile
          </Text>

          <Text style={styles.errorText}>
            {selectedDoctorError}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              dispatch(
                getDoctorById(doctorId),
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedDoctor) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Doctor profile not available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const doctor = selectedDoctor;

  const specialization = Array.isArray(
    doctor.specialization,
  )
    ? doctor.specialization
    : [];

  const qualification = Array.isArray(
    doctor.qualification,
  )
    ? doctor.qualification
    : [];

  const languages = Array.isArray(
    doctor.languages,
  )
    ? doctor.languages
    : [];

  const location = [
    doctor.village,
    doctor.district,
    doctor.state,
  ]
    .filter(Boolean)
    .join(', ');

  const fromTime = formatTime(
    doctor.availableFrom,
  );

  const untilTime = formatTime(
    doctor.availableUntil,
  );

  const isAvailable =
    doctor.availability === 'available';

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
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ArrowLeft
            size={22}
            color={DARK}
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Doctor Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* PROFILE */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Stethoscope
              size={38}
              color={GREEN}
              strokeWidth={1.8}
            />
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text
                style={styles.doctorName}
                numberOfLines={2}
              >
                {doctor.fullName}
              </Text>

              {doctor.isActive && (
                <CheckCircle2
                  size={18}
                  color={GREEN}
                />
              )}
            </View>

            <Text style={styles.doctorType}>
              {getDoctorTypeLabel(
                doctor.doctorType,
              )}
            </Text>

            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                {Number(
                  doctor.rating || 0,
                ).toFixed(1)}
              </Text>

              <Text style={styles.star}>
                ★
              </Text>

              <Text style={styles.reviewText}>
                {doctor.totalReviews || 0}{' '}
                reviews
              </Text>
            </View>
          </View>
        </View>

        {/* AVAILABILITY */}

        <View
          style={[
            styles.availabilityCard,
            {
              borderColor: isAvailable
                ? '#CBEBD7'
                : BORDER,
              backgroundColor: isAvailable
                ? LIGHT_GREEN
                : WHITE,
            },
          ]}
        >
          <View
            style={[
              styles.availabilityIcon,
              {
                backgroundColor: isAvailable
                  ? '#D7F2E0'
                  : '#F3F4F6',
              },
            ]}
          >
            <Clock3
              size={19}
              color={getAvailabilityColor(
                doctor.availability,
              )}
            />
          </View>

          <View style={styles.availabilityInfo}>
            <Text
              style={[
                styles.availabilityTitle,
                {
                  color:
                    getAvailabilityColor(
                      doctor.availability,
                    ),
                },
              ]}
            >
              {getAvailabilityLabel(
                doctor.availability,
              )}
            </Text>

            {fromTime || untilTime ? (
              <Text style={styles.availabilityTime}>
                {fromTime || '--:--'}{' '}
                {untilTime
                  ? `to ${untilTime}`
                  : ''}
              </Text>
            ) : (
              <Text style={styles.availabilityTime}>
                Consultation availability varies
              </Text>
            )}
          </View>
        </View>

        {/* ABOUT */}

        {doctor.about ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About
            </Text>

            <Text style={styles.aboutText}>
              {doctor.about}
            </Text>
          </View>
        ) : null}

        {/* SPECIALIZATION */}

        {specialization.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Stethoscope
                size={18}
                color={GREEN}
              />

              <Text style={styles.sectionTitle}>
                Specialization
              </Text>
            </View>

            <View style={styles.tagContainer}>
              {specialization.map(
                (item, index) => (
                  <View
                    key={`${item}-${index}`}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>
                      {item}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        )}

        {/* QUALIFICATIONS */}

        {qualification.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <GraduationCap
                size={18}
                color={GREEN}
              />

              <Text style={styles.sectionTitle}>
                Qualifications
              </Text>
            </View>

            {qualification.map(
              (item, index) => (
                <View
                  key={`${item}-${index}`}
                  style={styles.infoRow}
                >
                  <View style={styles.bullet} />

                  <Text style={styles.infoText}>
                    {item}
                  </Text>
                </View>
              ),
            )}
          </View>
        )}

        {/* LANGUAGES */}

        {languages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Languages
                size={18}
                color={GREEN}
              />

              <Text style={styles.sectionTitle}>
                Languages
              </Text>
            </View>

            <Text style={styles.aboutText}>
              {languages.join(', ')}
            </Text>
          </View>
        )}

        {/* LOCATION */}

        {location || doctor.address ? (
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

            {location ? (
              <Text style={styles.locationText}>
                {location}
              </Text>
            ) : null}

            {doctor.address ? (
              <Text style={styles.addressText}>
                {doctor.address}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* CONSULTATION */}

        <View style={styles.consultationCard}>
          <View style={styles.consultationHeader}>
            <View>
              <Text style={styles.consultationTitle}>
                Consultation
              </Text>

              <Text
                style={
                  styles.consultationSubtitle
                }
              >
                Get professional guidance for
                your farm
              </Text>
            </View>

            <CalendarDays
              size={24}
              color={GREEN}
            />
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>
              Consultation fee
            </Text>

            <Text style={styles.feeValue}>
              {doctor.consultationFeeType ===
              'free'
                ? 'Free'
                : `₹${doctor.consultationFee || 0}`}
            </Text>
          </View>
        </View>

        {/* EXTRA SPACE FOR BOTTOM BUTTON */}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM ACTION */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.consultButton,
            !isAvailable &&
              styles.consultButtonDisabled,
          ]}
          disabled={!isAvailable}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              'DoctorConsultation',
              {
                doctorId: doctor._id,
                doctor,
              },
            )
          }
        >
          <MessageCircle
            size={20}
            color={WHITE}
          />

          <Text style={styles.consultButtonText}>
            {isAvailable
              ? 'Ask for Consultation'
              : 'Doctor Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DoctorDetailsScreen;

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

  headerTitle: {
    flex: 1,
    marginLeft: 13,
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },

  profileCard: {
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  doctorName: {
    flexShrink: 1,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    color: DARK,
  },

  doctorType: {
    marginTop: 4,
    fontSize: 12,
    color: MUTED,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },

  star: {
    marginLeft: 3,
    fontSize: 13,
    color: '#F59E0B',
  },

  reviewText: {
    marginLeft: 5,
    fontSize: 11,
    color: MUTED,
  },

  availabilityCard: {
    marginTop: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
  },

  availabilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  availabilityInfo: {
    marginLeft: 11,
  },

  availabilityTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  availabilityTime: {
    marginTop: 3,
    fontSize: 11,
    color: MUTED,
  },

  section: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },

  aboutText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
  },

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: LIGHT_GREEN,
  },

  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: GREEN,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },

  bullet: {
    width: 6,
    height: 6,
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },

  locationText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },

  addressText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
  },

  consultationCard: {
    marginTop: 20,
    padding: 17,
    borderRadius: 17,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#CBEBD7',
  },

  consultationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  consultationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },

  consultationSubtitle: {
    maxWidth: 270,
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: MUTED,
  },

  feeRow: {
    marginTop: 15,
    paddingTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#CFE8D8',
  },

  feeLabel: {
    fontSize: 11,
    color: MUTED,
  },

  feeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: GREEN,
  },

  bottomSpace: {
    height: 10,
  },

  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#EDEFF0',
  },

  consultButton: {
    height: 52,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
  },

  consultButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  consultButtonText: {
    marginLeft: 9,
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: MUTED,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: DARK,
  },

  errorText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
});