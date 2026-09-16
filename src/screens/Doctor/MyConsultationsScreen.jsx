import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Stethoscope,
  Sprout,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  CircleCheck,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getMyConsultations } from '../../redux/slices/doctorConsultationSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const LIGHT = '#F3F4F6';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';
const ORANGE = '#F97316';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: LoaderCircle,
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
  },
  accepted: {
    label: 'Accepted',
    icon: CircleCheck,
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
  },
};

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const formatDate = dateValue => {
  if (!dateValue) return 'Date not available';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = time => {
  if (!time) return '';

  const value = String(time).trim();

  if (!value) return '';

  const match = value.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return value;
  }

  let hours = Number(match[1]);
  const minutes = match[2];

  const suffix = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
};

const getDoctorName = consultation => {
  if (!consultation?.doctor) {
    return 'Doctor';
  }

  if (typeof consultation.doctor === 'string') {
    return 'Doctor';
  }

  return (
    consultation.doctor.fullName ||
    consultation.doctor.name ||
    'Doctor'
  );
};

const getDoctorType = consultation => {
  const type =
    typeof consultation?.doctor === 'object'
      ? consultation?.doctor?.doctorType
      : '';

  if (type === 'veterinarian') {
    return 'Veterinarian';
  }

  if (type === 'agriculturalDoctor') {
    return 'Agricultural Doctor';
  }

  return consultation?.consultationType === 'veterinary'
    ? 'Veterinarian'
    : 'Agricultural Doctor';
};

const getProblemText = consultation => {
  if (consultation?.problemType) {
    return consultation.problemType;
  }

  if (consultation?.consultationType === 'veterinary') {
    return consultation?.animalType
      ? `${consultation.animalType} consultation`
      : 'Veterinary consultation';
  }

  return 'Agricultural consultation';
};

const getLocation = consultation => {
  const parts = [
    consultation?.village,
    consultation?.district,
    consultation?.state,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'Location not provided';
};

const getStatusColors = status => {
  switch (status) {
    case 'accepted':
    case 'confirmed':
    case 'completed':
      return {
        background: '#EAF7EF',
        text: GREEN,
      };

    case 'rejected':
    case 'cancelled':
      return {
        background: '#FEF2F2',
        text: '#DC2626',
      };

    case 'pending':
      return {
        background: '#FFF7ED',
        text: ORANGE,
      };

    default:
      return {
        background: LIGHT,
        text: MUTED,
      };
  }
};

const ConsultationCard = ({ item, onPress }) => {
  const status = item?.status || 'pending';
  const statusConfig =
    STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const StatusIcon = statusConfig.icon;

  const colors = getStatusColors(status);

  const doctorName = getDoctorName(item);
  const doctorType = getDoctorType(item);

  const isVeterinary = item?.consultationType === 'veterinary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View style={styles.doctorIconContainer}>
          {isVeterinary ? (
            <Stethoscope size={22} color={GREEN} strokeWidth={2} />
          ) : (
            <Sprout size={22} color={GREEN} strokeWidth={2} />
          )}
        </View>

        <View style={styles.doctorInfo}>
          <Text
            style={styles.doctorName}
            numberOfLines={1}
          >
            {doctorName}
          </Text>

          <Text
            style={styles.doctorType}
            numberOfLines={1}
          >
            {doctorType}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.background },
          ]}
        >
          <StatusIcon
            size={13}
            color={colors.text}
            strokeWidth={2.2}
          />

          <Text
            style={[
              styles.statusText,
              { color: colors.text },
            ]}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <CalendarDays
            size={16}
            color={MUTED}
            strokeWidth={2}
          />

          <Text style={styles.infoText}>
            {formatDate(item?.consultationDate)}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Clock3
            size={16}
            color={MUTED}
            strokeWidth={2}
          />

          <Text style={styles.infoText}>
            {formatTime(item?.startTime) || 'Time not set'}
          </Text>
        </View>
      </View>

      <View style={styles.problemRow}>
        <Text style={styles.problemLabel}>Problem</Text>

        <Text
          style={styles.problemText}
          numberOfLines={2}
        >
          {getProblemText(item)}
        </Text>
      </View>

      <View style={styles.locationRow}>
        <MapPin
          size={15}
          color={MUTED}
          strokeWidth={2}
        />

        <Text
          style={styles.locationText}
          numberOfLines={1}
        >
          {getLocation(item)}
        </Text>
      </View>

      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.feeLabel}>Consultation fee</Text>

          <Text style={styles.feeValue}>
            {item?.totalAmount > 0
              ? `₹${item.totalAmount}`
              : 'Free'}
          </Text>
        </View>

        <View style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>
            View details
          </Text>

          <ChevronRight
            size={18}
            color={GREEN}
            strokeWidth={2}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = ({ filter }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Stethoscope
          size={30}
          color={GREEN}
          strokeWidth={1.8}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {filter
          ? `No ${filter.toLowerCase()} consultations`
          : 'No consultations yet'}
      </Text>

      <Text style={styles.emptyDescription}>
        {filter
          ? 'Consultations with this status will appear here.'
          : 'Your doctor consultation requests will appear here once you book one.'}
      </Text>
    </View>
  );
};

const ErrorState = ({ message, onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <AlertCircle
          size={28}
          color="#DC2626"
          strokeWidth={1.8}
        />
      </View>

      <Text style={styles.errorTitle}>
        Something went wrong
      </Text>

      <Text style={styles.errorMessage}>
        {message || 'Unable to load your consultations.'}
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onRetry}
        style={styles.retryButton}
      >
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function MyConsultationsScreen({
  navigation,
}) {
  const dispatch = useDispatch();

  const {
    myConsultations,
    myConsultationsPagination,
    isLoadingMyConsultations,
    myConsultationsError,
  } = useSelector(state => state.doctorConsultation);

  const [selectedFilter, setSelectedFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadConsultations = useCallback(
    async ({
      page = 1,
      refresh = false,
      status = selectedFilter,
    } = {}) => {
      if (refresh) {
        setRefreshing(true);
      }

      try {
        await dispatch(
          getMyConsultations({
            page,
            limit: 10,
            ...(status ? { status } : {}),
          }),
        ).unwrap();
      } catch (error) {
        // Redux already stores the error.
      } finally {
        if (refresh) {
          setRefreshing(false);
        }
      }
    },
    [dispatch, selectedFilter],
  );

  useFocusEffect(
    useCallback(() => {
      loadConsultations({
        page: 1,
        refresh: false,
        status: selectedFilter,
      });
    }, [loadConsultations, selectedFilter]),
  );

  const handleFilterChange = filter => {
    setSelectedFilter(filter);

    dispatch(
      getMyConsultations({
        page: 1,
        limit: 10,
        ...(filter ? { status: filter } : {}),
      }),
    );
  };

  const handleRefresh = async () => {
    await loadConsultations({
      page: 1,
      refresh: true,
      status: selectedFilter,
    });
  };

  const handleLoadMore = async () => {
    if (
      loadingMore ||
      isLoadingMyConsultations ||
      refreshing
    ) {
      return;
    }

    const currentPage =
      myConsultationsPagination?.page || 1;

    const totalPages =
      myConsultationsPagination?.totalPages || 1;

    if (currentPage >= totalPages) {
      return;
    }

    setLoadingMore(true);

    try {
      await dispatch(
        getMyConsultations({
          page: currentPage + 1,
          limit: 10,
          ...(selectedFilter
            ? { status: selectedFilter }
            : {}),
        }),
      ).unwrap();
    } catch (error) {
      // Redux already stores the error.
    } finally {
      setLoadingMore(false);
    }
  };

  const openConsultation = item => {
    if (!item?._id) {
      return;
    }

    navigation.navigate('DoctorConsultationDetails', {
      consultationId: item._id,
    });
  };

  const renderItem = ({ item }) => (
    <ConsultationCard
      item={item}
      onPress={() => openConsultation(item)}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) {
      return <View style={styles.footerSpace} />;
    }

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator
          size="small"
          color={GREEN}
        />

        <Text style={styles.loadingMoreText}>
          Loading more...
        </Text>
      </View>
    );
  };

  const hasError =
    !!myConsultationsError &&
    !isLoadingMyConsultations &&
    !refreshing;

  const showInitialLoader =
    isLoadingMyConsultations &&
    (!myConsultations ||
      myConsultations.length === 0) &&
    !refreshing;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft
              size={22}
              color={DARK}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              My Consultations
            </Text>

            <Text style={styles.headerSubtitle}>
              Track your doctor requests
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={item => item.value || 'all'}
            contentContainerStyle={
              styles.filterContent
            }
            renderItem={({ item }) => {
              const active =
                selectedFilter === item.value;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    handleFilterChange(item.value)
                  }
                  style={[
                    styles.filterButton,
                    active &&
                      styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Content */}
        {showInitialLoader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color={GREEN}
            />

            <Text style={styles.loaderText}>
              Loading consultations...
            </Text>
          </View>
        ) : hasError && myConsultations?.length === 0 ? (
          <ErrorState
            message={myConsultationsError}
            onRetry={() =>
              loadConsultations({
                page: 1,
                refresh: false,
                status: selectedFilter,
              })
            }
          />
        ) : (
          <FlatList
            data={myConsultations || []}
            keyExtractor={(item, index) =>
              item?._id || `consultation-${index}`
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              (!myConsultations ||
                myConsultations.length === 0) &&
                styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={GREEN}
                colors={[GREEN]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.35}
            ListEmptyComponent={
              <EmptyState
                filter={
                  FILTERS.find(
                    item =>
                      item.value === selectedFilter,
                  )?.label
                }
              />
            }
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: WHITE,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT,
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: MUTED,
  },

  filterWrapper: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
  },

  filterButton: {
    paddingHorizontal: 15,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: GREEN,
  },

  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
  },

  filterTextActive: {
    color: WHITE,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  doctorInfo: {
    flex: 1,
    paddingRight: 8,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },

  doctorType: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  statusBadge: {
    minHeight: 29,
    paddingHorizontal: 9,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },

  infoText: {
    marginLeft: 7,
    fontSize: 13,
    color: DARK,
    fontWeight: '600',
  },

  problemRow: {
    marginBottom: 11,
  },

  problemLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  problemText: {
    fontSize: 14,
    lineHeight: 20,
    color: DARK,
    fontWeight: '700',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  locationText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    color: MUTED,
  },

  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  feeLabel: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 2,
  },

  feeValue: {
    fontSize: 16,
    color: DARK,
    fontWeight: '800',
  },

  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewDetailsText: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '800',
  },

  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },

  errorIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },

  errorMessage: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,
    height: 42,
    paddingHorizontal: 22,
    borderRadius: 21,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800',
  },

  loadingMore: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  loadingMoreText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  footerSpace: {
    height: 10,
  },
});