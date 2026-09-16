import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { getAllDoctors } from '../../redux/slices/doctorSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const WHITE = '#FFFFFF';
const BG = '#F8FAF9';

const DoctorsScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const {
    doctors,
    pagination,
    isLoading,
    error,
  } = useSelector((state) => state.doctor);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] =
    useState('');

  const [selectedAvailability, setSelectedAvailability] =
    useState('available');

  const [showFilters, setShowFilters] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH DOCTORS
  |--------------------------------------------------------------------------
  */

  const fetchDoctors = useCallback(
    (customParams = {}) => {
      const params = {
        page: 1,
        limit: 10,

        ...(search.trim()
          ? {
              search: search.trim(),
            }
          : {}),

        ...(selectedType
          ? {
              doctorType: selectedType,
            }
          : {}),

        ...(selectedAvailability
          ? {
              availability:
                selectedAvailability,
            }
          : {}),

        ...customParams,
      };

      dispatch(getAllDoctors(params));
    },
    [
      dispatch,
      search,
      selectedType,
      selectedAvailability,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    setRefreshing(true);

    await dispatch(
      getAllDoctors({
        page: 1,
        limit: 10,
        ...(search.trim()
          ? {
              search: search.trim(),
            }
          : {}),
        ...(selectedType
          ? {
              doctorType: selectedType,
            }
          : {}),
        ...(selectedAvailability
          ? {
              availability:
                selectedAvailability,
            }
          : {}),
      }),
    );

    setRefreshing(false);
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearch = () => {
    fetchDoctors();
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const applyTypeFilter = (type) => {
    setSelectedType(type);

    dispatch(
      getAllDoctors({
        page: 1,
        limit: 10,

        ...(search.trim()
          ? {
              search: search.trim(),
            }
          : {}),

        ...(type
          ? {
              doctorType: type,
            }
          : {}),

        ...(selectedAvailability
          ? {
              availability:
                selectedAvailability,
            }
          : {}),
      }),
    );
  };

  const applyAvailabilityFilter = (
    availability,
  ) => {
    setSelectedAvailability(availability);

    dispatch(
      getAllDoctors({
        page: 1,
        limit: 10,

        ...(search.trim()
          ? {
              search: search.trim(),
            }
          : {}),

        ...(selectedType
          ? {
              doctorType: selectedType,
            }
          : {}),

        ...(availability
          ? {
              availability,
            }
          : {}),
      }),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR FILTERS
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSelectedType('');
    setSelectedAvailability('available');

    dispatch(
      getAllDoctors({
        page: 1,
        limit: 10,
        ...(search.trim()
          ? {
              search: search.trim(),
            }
          : {}),
        availability: 'available',
      }),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD MORE
  |--------------------------------------------------------------------------
  */

  const handleLoadMore = () => {
    if (isLoading) {
      return;
    }

    if (
      !pagination ||
      pagination.page >= pagination.totalPages
    ) {
      return;
    }

    dispatch(
      getAllDoctors({
        page: pagination.page + 1,
        limit: pagination.limit || 10,

        ...(search.trim()
          ? {
              search: search.trim(),
            }
          : {}),

        ...(selectedType
          ? {
              doctorType: selectedType,
            }
          : {}),

        ...(selectedAvailability
          ? {
              availability:
                selectedAvailability,
            }
          : {}),
      }),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DOCTOR TYPE LABEL
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

  /*
  |--------------------------------------------------------------------------
  | DOCTOR CARD
  |--------------------------------------------------------------------------
  */

  const renderDoctor = ({
    item,
  }) => {
    const isAvailable =
      item.availability === 'available';

    const specialization =
      Array.isArray(item.specialization)
        ? item.specialization
        : [];

    const location = [
      item.village,
      item.district,
      item.state,
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <TouchableOpacity
        style={styles.doctorCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate(
            'DoctorDetails',
            {
              doctorId: item._id,
            },
          )
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.doctorAvatar}>
            {item.profileImage ? (
              <View style={styles.imagePlaceholder}>
                <UserRound
                  size={27}
                  color={GREEN}
                />
              </View>
            ) : (
              <Stethoscope
                size={27}
                color={GREEN}
                strokeWidth={2}
              />
            )}
          </View>

          <View style={styles.doctorMain}>
            <View style={styles.nameRow}>
              <Text
                style={styles.doctorName}
                numberOfLines={1}
              >
                {item.fullName ||
                  'Doctor'}
              </Text>

              <View
                style={[
                  styles.availabilityDot,
                  {
                    backgroundColor:
                      isAvailable
                        ? GREEN
                        : '#9CA3AF',
                  },
                ]}
              />
            </View>

            <Text style={styles.doctorType}>
              {getDoctorTypeLabel(
                item.doctorType,
              )}
            </Text>

            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                {Number(item.rating || 0).toFixed(
                  1,
                )}
              </Text>

              <Text style={styles.ratingStar}>
                ★
              </Text>

              <Text style={styles.reviewText}>
                ({item.totalReviews || 0})
              </Text>
            </View>
          </View>
        </View>

        {specialization.length > 0 && (
          <View style={styles.specializationRow}>
            {specialization
              .slice(0, 3)
              .map((speciality) => (
                <View
                  key={speciality}
                  style={styles.specializationTag}
                >
                  <Text
                    style={
                      styles.specializationText
                    }
                    numberOfLines={1}
                  >
                    {speciality}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {location ? (
          <View style={styles.locationRow}>
            <MapPin
              size={14}
              color={MUTED}
            />

            <Text
              style={styles.locationText}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.feeLabel}>
              Consultation
            </Text>

            <Text style={styles.fee}>
              {item.consultationFeeType ===
              'free'
                ? 'Free'
                : `₹${item.consultationFee || 0}`}
            </Text>
          </View>

          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>
              View Profile
            </Text>

            <ChevronRight
              size={17}
              color={GREEN}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | EMPTY STATE
  |--------------------------------------------------------------------------
  */

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            size="small"
            color={GREEN}
          />

          <Text style={styles.emptyText}>
            Finding doctors...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Stethoscope
            size={28}
            color={GREEN}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No doctors found
        </Text>

        <Text style={styles.emptyText}>
          Try changing your search or filters.
        </Text>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.clearButtonText}>
            Clear Filters
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FOOTER
  |--------------------------------------------------------------------------
  */

  const renderFooter = () => {
    if (!isLoading || doctors.length === 0) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator
          size="small"
          color={GREEN}
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
      edges={['top']}
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

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Vets & Doctors
          </Text>

          <Text style={styles.headerSubtitle}>
            Get professional help for your farm
          </Text>
        </View>
      </View>

      {/* SEARCH */}

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search
            size={19}
            color={MUTED}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search doctors or specialization"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                dispatch(
                  getAllDoctors({
                    page: 1,
                    limit: 10,
                    availability:
                      selectedAvailability,
                    ...(selectedType
                      ? {
                          doctorType:
                            selectedType,
                        }
                      : {}),
                  }),
                );
              }}
            >
              <X
                size={18}
                color={MUTED}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showFilters &&
              styles.filterButtonActive,
          ]}
          onPress={() =>
            setShowFilters(!showFilters)
          }
          activeOpacity={0.8}
        >
          <SlidersHorizontal
            size={19}
            color={
              showFilters
                ? WHITE
                : DARK
            }
          />
        </TouchableOpacity>
      </View>

      {/* FILTERS */}

      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>
              Filters
            </Text>

            <TouchableOpacity
              onPress={clearFilters}
            >
              <Text style={styles.resetText}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>
            Doctor Type
          </Text>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedType &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                applyTypeFilter('')
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedType &&
                    styles.filterChipTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType ===
                  'veterinarian' &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                applyTypeFilter(
                  'veterinarian',
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType ===
                    'veterinarian' &&
                    styles.filterChipTextSelected,
                ]}
              >
                Veterinarian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType ===
                  'agriculturalDoctor' &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                applyTypeFilter(
                  'agriculturalDoctor',
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType ===
                    'agriculturalDoctor' &&
                    styles.filterChipTextSelected,
                ]}
              >
                Agricultural
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.filterLabel,
              styles.availabilityFilterLabel,
            ]}
          >
            Availability
          </Text>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedAvailability ===
                  'available' &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                applyAvailabilityFilter(
                  'available',
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedAvailability ===
                    'available' &&
                    styles.filterChipTextSelected,
                ]}
              >
                Available
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedAvailability ===
                  'busy' &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                applyAvailabilityFilter(
                  'busy',
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedAvailability ===
                    'busy' &&
                    styles.filterChipTextSelected,
                ]}
              >
                Busy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedAvailability ===
                  'unavailable' &&
                  styles.filterChipSelected,
              ]}
              onPress={() =>
                applyAvailabilityFilter(
                  'unavailable',
                )
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedAvailability ===
                    'unavailable' &&
                    styles.filterChipTextSelected,
                ]}
              >
                Unavailable
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* RESULTS */}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {pagination?.total || doctors.length}{' '}
          Doctors
        </Text>

        <Text style={styles.resultsSubtitle}>
          Professional help near you
        </Text>
      </View>

      {error && doctors.length === 0 ? (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchDoctors()}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) =>
            item._id
          }
          renderItem={renderDoctor}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            renderFooter
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            doctors.length === 0 &&
              styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={GREEN}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorsScreen;

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
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
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },

  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: WHITE,
  },

  searchBox: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FAFAFA',
  },

  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 13,
    color: DARK,
  },

  filterButton: {
    width: 48,
    height: 48,
    marginLeft: 9,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  filterButtonActive: {
    backgroundColor: GREEN,
  },

  filterPanel: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F1',
  },

  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },

  resetText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN,
  },

  filterLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
  },

  availabilityFilterLabel: {
    marginTop: 14,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },

  filterChipSelected: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },

  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },

  filterChipTextSelected: {
    color: GREEN,
  },

  resultsHeader: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },

  resultsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },

  resultsSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: MUTED,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  doctorCard: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#EEF0F1',
    backgroundColor: WHITE,
  },

  cardTop: {
    flexDirection: 'row',
  },

  doctorAvatar: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
    overflow: 'hidden',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  doctorMain: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  doctorName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },

  availabilityDot: {
    width: 7,
    height: 7,
    marginLeft: 7,
    borderRadius: 4,
  },

  doctorType: {
    marginTop: 3,
    fontSize: 11,
    color: MUTED,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  rating: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK,
  },

  ratingStar: {
    marginLeft: 3,
    fontSize: 12,
    color: '#F59E0B',
  },

  reviewText: {
    marginLeft: 4,
    fontSize: 10,
    color: MUTED,
  },

  specializationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 13,
  },

  specializationTag: {
    maxWidth: '48%',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  specializationText: {
    fontSize: 10,
    color: '#4B5563',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  locationText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 11,
    color: MUTED,
  },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F2',
  },

  feeLabel: {
    fontSize: 10,
    color: MUTED,
  },

  fee: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_GREEN,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
  },

  clearButton: {
    marginTop: 16,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: LIGHT_GREEN,
  },

  clearButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },

  footerLoader: {
    paddingVertical: 18,
  },

  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#DC2626',
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: LIGHT_GREEN,
  },

  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
});