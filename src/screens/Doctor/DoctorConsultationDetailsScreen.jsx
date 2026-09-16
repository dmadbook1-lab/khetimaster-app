import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  FileText,
  MapPin,
  MessageCircle,
  Stethoscope,
  XCircle,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  getDoctorConsultationById,
  cancelDoctorConsultation,
} from '../../redux/slices/doctorConsultationSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';
const BG = '#F8FAF9';
const RED = '#DC2626';
const ORANGE = '#D97706';

const DoctorConsultationDetailsScreen = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();

  const consultationId =
    route?.params?.consultationId;

  const {
    selectedConsultation,
    isLoadingConsultation,
    isCancelling,
    consultationError,
    actionError,
  } = useSelector(
    (state) => state.doctorConsultation,
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD CONSULTATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!consultationId) {
      return;
    }

    dispatch(
      getDoctorConsultationById(
        consultationId,
      ),
    );
  }, [dispatch, consultationId]);

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: ORANGE,
          background: '#FFF7ED',
          icon: Clock3,
        };

      case 'confirmed':
        return {
          label: 'Confirmed',
          color: GREEN,
          background: LIGHT_GREEN,
          icon: CheckCircle2,
        };

      case 'accepted':
        return {
          label: 'Accepted',
          color: GREEN,
          background: LIGHT_GREEN,
          icon: CheckCircle2,
        };

      case 'rejected':
        return {
          label: 'Rejected',
          color: RED,
          background: '#FEF2F2',
          icon: XCircle,
        };

      case 'cancelled':
        return {
          label: 'Cancelled',
          color: MUTED,
          background: '#F3F4F6',
          icon: XCircle,
        };

      case 'completed':
        return {
          label: 'Completed',
          color: GREEN,
          background: LIGHT_GREEN,
          icon: CheckCircle2,
        };

      default:
        return {
          label: status || 'Unknown',
          color: MUTED,
          background: '#F3F4F6',
          icon: Clock3,
        };
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return 'Not specified';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
  };

  const getDoctorTypeLabel = (type) => {
    if (type === 'veterinarian') {
      return 'Veterinarian';
    }

    if (type === 'agriculturalDoctor') {
      return 'Agricultural Doctor';
    }

    return 'Doctor';
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  const handleCancel = () => {
    Alert.alert(
      'Cancel Consultation',
      'Are you sure you want to cancel this consultation?',
      [
        {
          text: 'Keep',
          style: 'cancel',
        },
        {
          text: 'Cancel Consultation',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                cancelDoctorConsultation({
                  consultationId,
                  cancellationReason:
                    'Cancelled by farmer',
                }),
              ).unwrap();

              Alert.alert(
                'Cancelled',
                'Your consultation has been cancelled.',
              );

              dispatch(
                getDoctorConsultationById(
                  consultationId,
                ),
              );
            } catch (error) {
              Alert.alert(
                'Unable to Cancel',
                error ||
                  'Something went wrong while cancelling the consultation.',
              );
            }
          },
        },
      ],
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (
    isLoadingConsultation &&
    !selectedConsultation
  ) {
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
            Loading consultation...
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
    consultationError &&
    !selectedConsultation
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <ArrowLeft
              size={22}
              color={DARK}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Consultation
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
            Unable to load consultation
          </Text>

          <Text style={styles.errorText}>
            {consultationError}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              dispatch(
                getDoctorConsultationById(
                  consultationId,
                ),
              )
            }
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedConsultation) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Consultation not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const consultation =
    selectedConsultation;

  const doctor =
    consultation.doctor || {};

  const statusConfig =
    getStatusConfig(
      consultation.status,
    );

  const StatusIcon =
    statusConfig.icon;

  const location = [
    consultation.village,
    consultation.district,
    consultation.state,
  ]
    .filter(Boolean)
    .join(', ');

  const canCancel = [
    'pending',
    'confirmed',
    'accepted',
  ].includes(
    consultation.status,
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

        <Text
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Consultation Details
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* STATUS */}

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor:
                statusConfig.background,
              borderColor:
                statusConfig.color +
                '35',
            },
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor:
                  statusConfig.color +
                  '18',
              },
            ]}
          >
            <StatusIcon
              size={23}
              color={statusConfig.color}
            />
          </View>

          <View style={styles.statusInfo}>
            <Text
              style={[
                styles.statusTitle,
                {
                  color:
                    statusConfig.color,
                },
              ]}
            >
              {statusConfig.label}
            </Text>

            <Text style={styles.statusSubtitle}>
              {consultation.status ===
                'pending' &&
                'Waiting for the doctor to respond.'}

              {consultation.status ===
                'accepted' &&
                'The doctor has accepted your consultation request.'}

              {consultation.status ===
                'confirmed' &&
                'Your consultation has been confirmed.'}

              {consultation.status ===
                'rejected' &&
                'The doctor has rejected this request.'}

              {consultation.status ===
                'cancelled' &&
                'This consultation has been cancelled.'}

              {consultation.status ===
                'completed' &&
                'This consultation has been completed.'}
            </Text>
          </View>
        </View>

        {/* DOCTOR */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Doctor
          </Text>

          <View style={styles.doctorRow}>
            <View style={styles.doctorIcon}>
              <Stethoscope
                size={25}
                color={GREEN}
              />
            </View>

            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                {doctor.fullName ||
                  'Doctor'}
              </Text>

              <Text style={styles.doctorType}>
                {getDoctorTypeLabel(
                  doctor.doctorType,
                )}
              </Text>

              {doctor.rating !==
                undefined && (
                <Text style={styles.rating}>
                  {Number(
                    doctor.rating || 0,
                  ).toFixed(1)}{' '}
                  ★
                  {doctor.totalReviews
                    ? ` · ${doctor.totalReviews} reviews`
                    : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* DATE & TIME */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Schedule
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CalendarDays
                size={18}
                color={GREEN}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Date
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(
                  consultation.consultationDate,
                )}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock3
                size={18}
                color={GREEN}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Time
              </Text>

              <Text style={styles.detailValue}>
                {consultation.startTime ||
                  'Not specified'}
                {consultation.endTime
                  ? ` - ${consultation.endTime}`
                  : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* PROBLEM */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Problem Details
          </Text>

          {consultation.problemType ? (
            <View style={styles.problemBlock}>
              <Text style={styles.detailLabel}>
                Problem Type
              </Text>

              <Text style={styles.detailValue}>
                {consultation.problemType}
              </Text>
            </View>
          ) : null}

          {consultation.animalType ? (
            <View style={styles.problemBlock}>
              <Text style={styles.detailLabel}>
                Animal
              </Text>

              <Text style={styles.detailValue}>
                {consultation.animalType}

                {consultation.animalCount
                  ? ` · ${consultation.animalCount}`
                  : ''}
              </Text>
            </View>
          ) : null}

          {consultation.animalAge ? (
            <View style={styles.problemBlock}>
              <Text style={styles.detailLabel}>
                Animal Age
              </Text>

              <Text style={styles.detailValue}>
                {consultation.animalAge}
              </Text>
            </View>
          ) : null}

          {consultation.symptoms ? (
            <View style={styles.problemBlock}>
              <Text style={styles.detailLabel}>
                Symptoms
              </Text>

              <Text style={styles.description}>
                {consultation.symptoms}
              </Text>
            </View>
          ) : null}

          {consultation.description ? (
            <View style={styles.problemBlock}>
              <Text style={styles.detailLabel}>
                Description
              </Text>

              <Text style={styles.description}>
                {consultation.description}
              </Text>
            </View>
          ) : null}

          {consultation.farmerNotes ? (
            <View style={styles.problemBlock}>
              <Text style={styles.detailLabel}>
                Your Notes
              </Text>

              <Text style={styles.description}>
                {consultation.farmerNotes}
              </Text>
            </View>
          ) : null}
        </View>

        {/* LOCATION */}

        {(location ||
          consultation.address) && (
          <View style={styles.section}>
            <View
              style={styles.sectionTitleRow}
            >
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

            {consultation.address ? (
              <Text style={styles.addressText}>
                {consultation.address}
              </Text>
            ) : null}
          </View>
        )}

        {/* PAYMENT */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment
          </Text>

          <View style={styles.paymentRow}>
            <Text style={styles.detailLabel}>
              Consultation Fee
            </Text>

            <Text style={styles.amount}>
              {Number(
                consultation.totalAmount ??
                  consultation.consultationFee ??
                  0,
              ) === 0
                ? 'Free'
                : `₹${consultation.totalAmount ?? consultation.consultationFee}`}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.detailLabel}>
              Payment Method
            </Text>

            <Text style={styles.detailValue}>
              {String(
                consultation.paymentMethod ||
                  'cod',
              ).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* DOCTOR RESPONSE */}

        {(consultation.doctorNotes ||
          consultation.diagnosis ||
          consultation.prescription) && (
          <View style={styles.section}>
            <View
              style={styles.sectionTitleRow}
            >
              <MessageCircle
                size={18}
                color={GREEN}
              />

              <Text style={styles.sectionTitle}>
                Doctor's Response
              </Text>
            </View>

            {consultation.doctorNotes ? (
              <View style={styles.problemBlock}>
                <Text style={styles.detailLabel}>
                  Notes
                </Text>

                <Text style={styles.description}>
                  {consultation.doctorNotes}
                </Text>
              </View>
            ) : null}

            {consultation.diagnosis ? (
              <View style={styles.problemBlock}>
                <Text style={styles.detailLabel}>
                  Diagnosis
                </Text>

                <Text style={styles.description}>
                  {consultation.diagnosis}
                </Text>
              </View>
            ) : null}

            {consultation.prescription ? (
              <View style={styles.problemBlock}>
                <Text style={styles.detailLabel}>
                  Prescription
                </Text>

                <Text style={styles.description}>
                  {consultation.prescription}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* CANCELLATION */}

        {consultation.cancellationReason ? (
          <View style={styles.cancellationCard}>
            <View style={styles.sectionTitleRow}>
              <XCircle
                size={18}
                color={RED}
              />

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: RED,
                  },
                ]}
              >
                Cancellation Reason
              </Text>
            </View>

            <Text style={styles.description}>
              {
                consultation.cancellationReason
              }
            </Text>
          </View>
        ) : null}

        {actionError ? (
          <View style={styles.actionError}>
            <Text style={styles.actionErrorText}>
              {actionError}
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM ACTION */}

      {canCancel && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              isCancelling &&
                styles.cancelButtonDisabled,
            ]}
            onPress={handleCancel}
            disabled={isCancelling}
            activeOpacity={0.8}
          >
            {isCancelling ? (
              <ActivityIndicator
                size="small"
                color={RED}
              />
            ) : (
              <>
                <XCircle
                  size={19}
                  color={RED}
                />

                <Text style={styles.cancelText}>
                  Cancel Consultation
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DoctorConsultationDetailsScreen;

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
    paddingTop: 15,
    paddingBottom: 25,
  },

  statusCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },

  statusIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusInfo: {
    flex: 1,
    marginLeft: 11,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  statusSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: MUTED,
  },

  section: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },

  sectionTitle: {
    marginBottom: 13,
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorIcon: {
    width: 54,
    height: 54,
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
    marginTop: 3,
    fontSize: 11,
    color: MUTED,
  },

  rating: {
    marginTop: 5,
    fontSize: 10,
    color: MUTED,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  detailRowLast: {
    marginBottom: 0,
  },

  detailIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },

  detailContent: {
    flex: 1,
    marginLeft: 10,
  },

  detailLabel: {
    fontSize: 10,
    color: MUTED,
  },

  detailValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: DARK,
  },

  problemBlock: {
    marginBottom: 12,
  },

  description: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 19,
    color: '#4B5563',
  },

  locationText: {
    fontSize: 12,
    lineHeight: 19,
    color: DARK,
  },

  addressText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 18,
    color: MUTED,
  },

  paymentRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F3',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },

  cancellationCard: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },

  actionError: {
    marginTop: 14,
    padding: 12,
    borderRadius: 11,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  actionErrorText: {
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
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#EDEFF0',
  },

  cancelButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },

  cancelButtonDisabled: {
    opacity: 0.7,
  },

  cancelText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: RED,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
});