import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  getDoctorRequests,
  acceptDoctorConsultation,
  rejectDoctorConsultation,
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

const formatDate = dateString => {
  if (!dateString) return 'Date not available';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatStatus = status => {
  if (!status) return 'Pending';

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColors = status => {
  switch (status) {
    case 'accepted':
    case 'confirmed':
      return {
        background: LIGHT_GREEN,
        text: GREEN,
      };

    case 'rejected':
    case 'cancelled':
      return {
        background: LIGHT_RED,
        text: RED,
      };

    case 'completed':
      return {
        background: '#EFF6FF',
        text: '#2563EB',
      };

    default:
      return {
        background: '#FFF7ED',
        text: ORANGE,
      };
  }
};

const getFarmerName = consultation =>
  consultation?.farmer?.fullName ||
  consultation?.farmer?.name ||
  'Farmer';

const getProblemTitle = consultation => {
  if (consultation?.problemType) {
    return consultation.problemType;
  }

  if (consultation?.description) {
    return consultation.description.length > 50
      ? `${consultation.description.substring(0, 50)}...`
      : consultation.description;
  }

  return consultation?.consultationType === 'veterinary'
    ? 'Veterinary consultation'
    : 'Agricultural consultation';
};

const DoctorRequestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const {
    doctorRequests = [],
    doctorRequestsPagination,
    isLoadingDoctorRequests,
    isAccepting,
    isRejecting,
    doctorRequestsError,
    actionError,
  } = useSelector(state => state.doctorConsultation);

  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = useCallback(
    async (showLoader = true) => {
      try {
        await dispatch(
          getDoctorRequests({
            page: 1,
            limit: 20,
            status: 'pending',
          }),
        ).unwrap();
      } catch (error) {
        // Redux already stores the error.
      }
    },
    [dispatch],
  );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests(false);
    setRefreshing(false);
  };

  const handleAccept = async consultation => {
    if (!consultation?._id || processingId) return;

    setProcessingId(consultation._id);

    try {
      await dispatch(
        acceptDoctorConsultation(consultation._id),
      ).unwrap();

      await loadRequests(false);
    } catch (error) {
      // Error is handled by Redux.
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async consultation => {
    if (!consultation?._id || processingId) return;

    setProcessingId(consultation._id);

    try {
      await dispatch(
        rejectDoctorConsultation({
          consultationId: consultation._id,
          cancellationReason: 'Rejected by doctor',
        }),
      ).unwrap();

      await loadRequests(false);
    } catch (error) {
      // Error is handled by Redux.
    } finally {
      setProcessingId(null);
    }
  };

  const openDetails = consultation => {
    navigation.navigate('DoctorRequestDetails', {
      consultationId: consultation._id,
      consultation,
    });
  };

  const renderRequest = ({ item }) => {
    const farmerName = getFarmerName(item);
    const statusColors = getStatusColors(item.status);
    const isProcessing = processingId === item._id;
    const isPending = item.status === 'pending';

    return (
      <View style={styles.card}>
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={styles.avatar}>
            <UserRound size={22} color={GREEN} strokeWidth={2} />
          </View>

          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName} numberOfLines={1}>
              {farmerName}
            </Text>

            <View style={styles.consultationTypeRow}>
              <Stethoscope size={14} color={MUTED} />

              <Text style={styles.consultationType}>
                {item.consultationType === 'veterinary'
                  ? 'Veterinary consultation'
                  : 'Agricultural consultation'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColors.background,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusColors.text,
                },
              ]}
            >
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>

        {/* Problem */}
        <View style={styles.problemBox}>
          <Text style={styles.problemLabel}>Problem</Text>

          <Text style={styles.problemText} numberOfLines={2}>
            {getProblemTitle(item)}
          </Text>

          {item.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        {/* Schedule */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <CalendarDays size={16} color={GREEN} />

            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(item.consultationDate)}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Clock3 size={16} color={GREEN} />

            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>
                {item.startTime || '--'}
                {item.endTime ? ` - ${item.endTime}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Location */}
        {(item.village || item.district || item.state) && (
          <View style={styles.locationRow}>
            <MapPin size={16} color={MUTED} />

            <Text style={styles.locationText} numberOfLines={1}>
              {[item.village, item.district, item.state]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        )}

        {/* Fee */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Consultation fee</Text>

          <Text style={styles.feeValue}>
            {Number(item.totalAmount ?? item.consultationFee ?? 0) === 0
              ? 'Free'
              : `₹${Number(
                  item.totalAmount ?? item.consultationFee ?? 0,
                ).toLocaleString('en-IN')}`}
          </Text>
        </View>

        {/* Actions */}
        {isPending ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              activeOpacity={0.8}
              disabled={isProcessing}
              onPress={() => handleReject(item)}
            >
              {isProcessing && isRejecting ? (
                <ActivityIndicator size="small" color={RED} />
              ) : (
                <>
                  <X size={17} color={RED} strokeWidth={2.5} />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              activeOpacity={0.8}
              disabled={isProcessing}
              onPress={() => handleAccept(item)}
            >
              {isProcessing && isAccepting ? (
                <ActivityIndicator size="small" color={WHITE} />
              ) : (
                <>
                  <Check size={17} color={WHITE} strokeWidth={2.5} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.detailsButton}
            activeOpacity={0.8}
            onPress={() => openDetails(item)}
          >
            <Text style={styles.detailsButtonText}>
              View consultation
            </Text>

            <ChevronRight size={18} color={GREEN} />
          </TouchableOpacity>
        )}

        {/* Open details */}
        {isPending && (
          <TouchableOpacity
            style={styles.viewRequestButton}
            activeOpacity={0.8}
            onPress={() => openDetails(item)}
          >
            <Text style={styles.viewRequestText}>
              View request details
            </Text>

            <ChevronRight size={17} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Stethoscope size={30} color={GREEN} />
        </View>

        <Text style={styles.emptyTitle}>
          No consultation requests
        </Text>

        <Text style={styles.emptyText}>
          New farmer consultation requests will appear here.
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.8}
          onPress={() => loadRequests()}
        >
          <Text style={styles.refreshButtonText}>Refresh requests</Text>
        </TouchableOpacity>
      </View>
    ),
    [loadRequests],
  );

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.75}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={22} color={DARK} />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Consultation Requests</Text>

        <Text style={styles.headerSubtitle}>
          Manage requests from farmers
        </Text>
      </View>

      <View style={styles.headerIcon}>
        <Stethoscope size={21} color={GREEN} />
      </View>
    </View>
  );

  if (isLoadingDoctorRequests && doctorRequests.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {header}

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />

          <Text style={styles.loadingText}>
            Loading consultation requests...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const errorText = doctorRequestsError || actionError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={doctorRequests}
        keyExtractor={item => item._id}
        renderItem={renderRequest}
        ListHeaderComponent={
          <>
            {header}

            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>
                  Pending requests
                </Text>

                <Text style={styles.summaryCount}>
                  {doctorRequests.length}
                </Text>
              </View>

              <View style={styles.summaryIcon}>
                <Clock3 size={24} color={GREEN} />
              </View>
            </View>

            {errorText ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {getErrorMessage(errorText)}
                </Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={[
          styles.listContent,
          doctorRequests.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GREEN}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
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

  summaryCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDEDE3',
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
  },

  summaryCount: {
    marginTop: 3,
    fontSize: 28,
    fontWeight: '800',
    color: GREEN,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorBox: {
    backgroundColor: LIGHT_RED,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  errorText: {
    color: RED,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  farmerInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  farmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },

  consultationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  consultationType: {
    marginLeft: 5,
    fontSize: 12,
    color: MUTED,
    fontWeight: '500',
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  problemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 13,
    marginTop: 15,
  },

  problemLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  problemText: {
    marginTop: 5,
    fontSize: 15,
    color: DARK,
    fontWeight: '700',
    lineHeight: 21,
  },

  descriptionText: {
    marginTop: 5,
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },

  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    marginLeft: 7,
    fontSize: 10,
    color: MUTED,
    fontWeight: '600',
  },

  infoValue: {
    marginLeft: 7,
    marginTop: 2,
    fontSize: 12,
    color: DARK,
    fontWeight: '700',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  locationText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: MUTED,
    fontWeight: '500',
  },

  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  feeLabel: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  feeValue: {
    fontSize: 15,
    color: DARK,
    fontWeight: '800',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: LIGHT_RED,
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
    minHeight: 46,
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

  detailsButton: {
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },

  detailsButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
  },

  viewRequestButton: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  viewRequestText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    minHeight: 430,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    color: DARK,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },

  refreshButton: {
    marginTop: 18,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  refreshButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800',
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
    fontWeight: '500',
  },
});

export default DoctorRequestsScreen;