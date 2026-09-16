import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  UserRound,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  getDoctorConsultationById,
  acceptDoctorConsultation,
  rejectDoctorConsultation,
  completeDoctorConsultation,
} from '../../redux/slices/doctorConsultationSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const RED = '#DC2626';
const LIGHT_RED = '#FEF2F2';
const ORANGE = '#F97316';
const WHITE = '#FFFFFF';

const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const formatDate = value => {
  if (!value) return '--';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatStatus = status => {
  if (!status) return 'Pending';

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusStyle = status => {
  switch (status) {
    case 'accepted':
    case 'confirmed':
      return {
        backgroundColor: LIGHT_GREEN,
        color: GREEN,
      };

    case 'rejected':
    case 'cancelled':
      return {
        backgroundColor: LIGHT_RED,
        color: RED,
      };

    case 'completed':
      return {
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
      };

    default:
      return {
        backgroundColor: '#FFF7ED',
        color: ORANGE,
      };
  }
};

const DoctorRequestDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const consultationId =
    route?.params?.consultationId || route?.params?.consultation?._id;

  const {
    selectedConsultation,
    isLoadingConsultation,
    isAccepting,
    isRejecting,
    isCompleting,
    consultationError,
    actionError,
  } = useSelector(state => state.doctorConsultation);

  const [localConsultation, setLocalConsultation] = useState(
    route?.params?.consultation || null,
  );

  const [doctorNotes, setDoctorNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const consultation = selectedConsultation || localConsultation;

  const loadConsultation = useCallback(async () => {
    if (!consultationId) return;

    try {
      const result = await dispatch(
        getDoctorConsultationById(consultationId),
      ).unwrap();

      if (result?.consultation) {
        setLocalConsultation(result.consultation);
      } else if (result?.data) {
        setLocalConsultation(result.data);
      } else if (result?._id) {
        setLocalConsultation(result);
      }
    } catch (error) {
      // Redux stores the error.
    }
  }, [consultationId, dispatch]);

  useEffect(() => {
    loadConsultation();
  }, [loadConsultation]);

  const handleAccept = () => {
    if (!consultation?._id || processingAction) return;

    Alert.alert(
      'Accept consultation?',
      'This will accept the farmer consultation request.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            setProcessingAction(true);

            try {
              const result = await dispatch(
                acceptDoctorConsultation(consultation._id),
              ).unwrap();

              if (result?.consultation) {
                setLocalConsultation(result.consultation);
              }

              await loadConsultation();
            } catch (error) {
              Alert.alert(
                'Unable to accept',
                getErrorMessage(
                  error,
                  'The consultation could not be accepted.',
                ),
              );
            } finally {
              setProcessingAction(false);
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    if (!consultation?._id || processingAction) return;

    Alert.alert(
      'Reject consultation?',
      'Are you sure you want to reject this request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingAction(true);

            try {
              const result = await dispatch(
                rejectDoctorConsultation({
                  consultationId: consultation._id,
                  cancellationReason: 'Rejected by doctor',
                }),
              ).unwrap();

              if (result?.consultation) {
                setLocalConsultation(result.consultation);
              }

              await loadConsultation();
            } catch (error) {
              Alert.alert(
                'Unable to reject',
                getErrorMessage(
                  error,
                  'The consultation could not be rejected.',
                ),
              );
            } finally {
              setProcessingAction(false);
            }
          },
        },
      ],
    );
  };

  const handleComplete = () => {
    if (!consultation?._id || processingAction) return;

    Alert.alert(
      'Complete consultation?',
      'Save the consultation response and mark this consultation as completed.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          onPress: async () => {
            setProcessingAction(true);

            try {
              const result = await dispatch(
                completeDoctorConsultation({
                  consultationId: consultation._id,
                  doctorNotes: doctorNotes.trim(),
                  diagnosis: diagnosis.trim(),
                  prescription: prescription.trim(),
                }),
              ).unwrap();

              if (result?.consultation) {
                setLocalConsultation(result.consultation);
              }

              await loadConsultation();

              Alert.alert(
                'Consultation completed',
                'The consultation has been marked as completed.',
              );
            } catch (error) {
              Alert.alert(
                'Unable to complete',
                getErrorMessage(
                  error,
                  'The consultation could not be completed.',
                ),
              );
            } finally {
              setProcessingAction(false);
            }
          },
        },
      ],
    );
  };

  const farmer = consultation?.farmer || {};

  const statusStyle = getStatusStyle(consultation?.status);

  const isPending = consultation?.status === 'pending';

  const isAccepted =
    consultation?.status === 'accepted' ||
    consultation?.status === 'confirmed';

  const isCompleted = consultation?.status === 'completed';

  if (isLoadingConsultation && !consultation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Consultation Request</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />

          <Text style={styles.loadingText}>
            Loading consultation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!consultation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Consultation Request</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Stethoscope size={30} color={GREEN} />
          </View>

          <Text style={styles.emptyTitle}>
            Consultation not found
          </Text>

          <Text style={styles.emptyText}>
            This consultation may no longer be available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
            Consultation Request
          </Text>

          <Text style={styles.headerSubtitle}>
            Farmer consultation details
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Stethoscope size={21} color={GREEN} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>Consultation status</Text>

            <Text style={styles.statusDescription}>
              {isPending
                ? 'A farmer is waiting for your response.'
                : isAccepted
                ? 'This consultation has been accepted.'
                : isCompleted
                ? 'This consultation has been completed.'
                : 'This consultation is no longer active.'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusStyle.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusStyle.color,
                },
              ]}
            >
              {formatStatus(consultation.status)}
            </Text>
          </View>
        </View>

        {/* Farmer */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <UserRound size={19} color={GREEN} />
            </View>

            <Text style={styles.sectionTitle}>Farmer details</Text>
          </View>

          <View style={styles.farmerProfile}>
            <View style={styles.farmerAvatar}>
              <UserRound size={25} color={GREEN} />
            </View>

            <View style={styles.farmerProfileInfo}>
              <Text style={styles.farmerName}>
                {farmer.fullName || 'Farmer'}
              </Text>

              {farmer.phoneNumber ? (
                <Text style={styles.secondaryText}>
                  {farmer.phoneNumber}
                </Text>
              ) : null}

              {farmer.email ? (
                <Text style={styles.secondaryText}>
                  {farmer.email}
                </Text>
              ) : null}
            </View>
          </View>

          {(farmer.village || farmer.district || farmer.state) && (
            <View style={styles.locationRow}>
              <MapPin size={16} color={MUTED} />

              <Text style={styles.locationText}>
                {[
                  farmer.village,
                  farmer.district,
                  farmer.state,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Schedule */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <CalendarDays size={19} color={GREEN} />
            </View>

            <Text style={styles.sectionTitle}>Schedule</Text>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>

              <Text style={styles.detailValue}>
                {formatDate(consultation.consultationDate)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Time</Text>

              <View style={styles.timeValueRow}>
                <Clock3 size={15} color={GREEN} />

                <Text style={styles.detailValue}>
                  {consultation.startTime || '--'}
                  {consultation.endTime
                    ? ` - ${consultation.endTime}`
                    : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailItemFull}>
            <Text style={styles.detailLabel}>
              Consultation type
            </Text>

            <Text style={styles.detailValue}>
              {consultation.consultationType === 'veterinary'
                ? 'Veterinary'
                : 'Agricultural'}
            </Text>
          </View>
        </View>

        {/* Problem */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <FileText size={19} color={GREEN} />
            </View>

            <Text style={styles.sectionTitle}>Problem details</Text>
          </View>

          <InfoBlock
            label="Problem type"
            value={consultation.problemType}
          />

          {consultation.consultationType === 'veterinary' ? (
            <>
              <InfoBlock
                label="Animal type"
                value={consultation.animalType}
              />

              <InfoBlock
                label="Animal count"
                value={consultation.animalCount}
              />

              <InfoBlock
                label="Animal age"
                value={consultation.animalAge}
              />

              <InfoBlock
                label="Symptoms"
                value={consultation.symptoms}
              />
            </>
          ) : null}

          <InfoBlock
            label="Description"
            value={consultation.description}
          />

          <InfoBlock
            label="Farmer notes"
            value={consultation.farmerNotes}
          />
        </View>

        {/* Location */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MapPin size={19} color={GREEN} />
            </View>

            <Text style={styles.sectionTitle}>Consultation location</Text>
          </View>

          <Text style={styles.locationLarge}>
            {[
              consultation.village,
              consultation.district,
              consultation.state,
            ]
              .filter(Boolean)
              .join(', ') || 'Location not provided'}
          </Text>

          {consultation.address ? (
            <Text style={styles.addressText}>
              {consultation.address}
            </Text>
          ) : null}
        </View>

        {/* Payment */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.rupeeIcon}>₹</Text>
            </View>

            <Text style={styles.sectionTitle}>Payment</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Consultation fee
            </Text>

            <Text style={styles.paymentValue}>
              {Number(
                consultation.totalAmount ??
                  consultation.consultationFee ??
                  0,
              ) === 0
                ? 'Free'
                : `₹${Number(
                    consultation.totalAmount ??
                      consultation.consultationFee ??
                      0,
                  ).toLocaleString('en-IN')}`}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>
              Payment method
            </Text>

            <Text style={styles.paymentMethod}>
              {(consultation.paymentMethod || 'cod').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Existing doctor response */}
        {(consultation.doctorNotes ||
          consultation.diagnosis ||
          consultation.prescription) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <FileText size={19} color={GREEN} />
              </View>

              <Text style={styles.sectionTitle}>
                Consultation response
              </Text>
            </View>

            <InfoBlock
              label="Doctor notes"
              value={consultation.doctorNotes}
            />

            <InfoBlock
              label="Diagnosis"
              value={consultation.diagnosis}
            />

            <InfoBlock
              label="Prescription"
              value={consultation.prescription}
            />
          </View>
        )}

        {/* Complete consultation */}
        {isAccepted && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Check size={19} color={GREEN} />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Complete consultation
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Add your consultation response
                </Text>
              </View>
            </View>

            <InputField
              label="Doctor notes"
              placeholder="Add your consultation notes"
              value={doctorNotes}
              onChangeText={setDoctorNotes}
              multiline
            />

            <InputField
              label="Diagnosis"
              placeholder="Enter diagnosis"
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline
            />

            <InputField
              label="Prescription"
              placeholder="Enter prescription or treatment advice"
              value={prescription}
              onChangeText={setPrescription}
              multiline
            />

            <TouchableOpacity
              style={styles.completeButton}
              activeOpacity={0.85}
              disabled={processingAction || isCompleting}
              onPress={handleComplete}
            >
              {processingAction && isCompleting ? (
                <ActivityIndicator size="small" color={WHITE} />
              ) : (
                <>
                  <Check size={18} color={WHITE} strokeWidth={2.5} />

                  <Text style={styles.completeButtonText}>
                    Complete Consultation
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Pending actions */}
        {isPending && (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>
              Respond to this request
            </Text>

            <Text style={styles.actionSubtitle}>
              Accept the request to proceed with the consultation,
              or reject it if you are unavailable.
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.rejectButton}
                activeOpacity={0.85}
                disabled={processingAction || isRejecting}
                onPress={handleReject}
              >
                {processingAction && isRejecting ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <>
                    <X size={18} color={RED} strokeWidth={2.5} />

                    <Text style={styles.rejectButtonText}>
                      Reject
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                activeOpacity={0.85}
                disabled={processingAction || isAccepting}
                onPress={handleAccept}
              >
                {processingAction && isAccepting ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <>
                    <Check size={18} color={WHITE} strokeWidth={2.5} />

                    <Text style={styles.acceptButtonText}>
                      Accept
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {consultation.cancellationReason ? (
          <View style={styles.cancellationCard}>
            <Text style={styles.cancellationLabel}>
              Reason
            </Text>

            <Text style={styles.cancellationText}>
              {consultation.cancellationReason}
            </Text>
          </View>
        ) : null}

        {(consultationError || actionError) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {getErrorMessage(
                consultationError || actionError,
              )}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoBlock = ({ label, value }) => {
  if (!value) return null;

  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>
        {String(value)}
      </Text>
    </View>
  );
};

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[
        styles.input,
        multiline && styles.multilineInput,
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF9',
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
    fontWeight: '800',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 25,
  },

  statusCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  statusLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statusDescription: {
    marginTop: 5,
    maxWidth: 215,
    fontSize: 13,
    color: DARK,
    fontWeight: '600',
    lineHeight: 18,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  sectionCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    color: DARK,
    fontWeight: '800',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  rupeeIcon: {
    fontSize: 19,
    color: GREEN,
    fontWeight: '800',
  },

  farmerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  farmerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  farmerProfileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  farmerName: {
    fontSize: 16,
    color: DARK,
    fontWeight: '800',
  },

  secondaryText: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  locationText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },

  detailGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  detailItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },

  detailItemFull: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },

  detailLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  detailValue: {
    marginTop: 5,
    fontSize: 13,
    color: DARK,
    fontWeight: '700',
  },

  timeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  infoBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },

  infoLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  infoValue: {
    marginTop: 5,
    fontSize: 13,
    color: DARK,
    lineHeight: 19,
    fontWeight: '500',
  },

  locationLarge: {
    fontSize: 14,
    color: DARK,
    fontWeight: '700',
    lineHeight: 20,
  },

  addressText: {
    marginTop: 7,
    fontSize: 13,
    color: MUTED,
    lineHeight: 19,
  },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  paymentLabel: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
  },

  paymentValue: {
    fontSize: 17,
    color: GREEN,
    fontWeight: '800',
  },

  paymentMethod: {
    fontSize: 12,
    color: DARK,
    fontWeight: '800',
  },

  inputContainer: {
    marginBottom: 14,
  },

  inputLabel: {
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
    minHeight: 90,
    paddingTop: 12,
  },

  completeButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 3,
  },

  completeButtonText: {
    marginLeft: 7,
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },

  actionCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 16,
    color: DARK,
    fontWeight: '800',
  },

  actionSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  rejectButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: LIGHT_RED,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  rejectButtonText: {
    marginLeft: 7,
    color: RED,
    fontSize: 14,
    fontWeight: '800',
  },

  acceptButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  acceptButtonText: {
    marginLeft: 7,
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },

  cancellationCard: {
    backgroundColor: LIGHT_RED,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
  },

  cancellationLabel: {
    fontSize: 11,
    color: RED,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  cancellationText: {
    marginTop: 5,
    fontSize: 13,
    color: DARK,
    lineHeight: 19,
  },

  errorBox: {
    backgroundColor: LIGHT_RED,
    borderRadius: 13,
    padding: 13,
    marginBottom: 14,
  },

  errorText: {
    fontSize: 13,
    color: RED,
    lineHeight: 19,
    fontWeight: '500',
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

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    color: DARK,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: 6,
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 20,
  },
});

export default DoctorRequestDetailsScreen;