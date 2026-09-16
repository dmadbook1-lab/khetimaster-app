import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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
  Edit3,
  FileText,
  Languages,
  MapPin,
  Power,
  Stethoscope,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  getMyDoctorProfile,
  activateMyDoctorProfile,
  deactivateMyDoctorProfile,
} from '../../redux/slices/doctorSlice';

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const LIGHT_GREEN = '#EAF7EF';
const RED = '#DC2626';
const LIGHT_RED = '#FEF2F2';
const WHITE = '#FFFFFF';

const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const formatDoctorType = type => {
  if (type === 'veterinarian') return 'Veterinarian';
  if (type === 'agriculturalDoctor') return 'Agricultural Doctor';
  return 'Doctor';
};

const formatAvailability = value => {
  if (value === 'available') return 'Available';
  if (value === 'busy') return 'Busy';
  return 'Unavailable';
};

const formatDateTime = value => {
  if (!value) return '--';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MyDoctorProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const {
    myDoctor,
    isLoadingMyDoctor,
    isActivating,
    isDeactivating,
    myDoctorError,
  } = useSelector(state => state.doctor);

  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      await dispatch(getMyDoctorProfile()).unwrap();
    } catch (error) {
      // Redux stores the error.
    }
  }, [dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleToggleActive = async value => {
    if (!myDoctor?._id) return;

    try {
      if (value) {
        await dispatch(activateMyDoctorProfile()).unwrap();
      } else {
        await dispatch(deactivateMyDoctorProfile()).unwrap();
      }

      await loadProfile();
    } catch (error) {
      Alert.alert(
        'Unable to update profile',
        getErrorMessage(
          error,
          'Your doctor profile could not be updated.',
        ),
      );
    }
  };

  if (isLoadingMyDoctor && !myDoctor) {
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

          <Text style={styles.headerTitle}>My Doctor Profile</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />

          <Text style={styles.loadingText}>
            Loading your doctor profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!myDoctor) {
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

          <Text style={styles.headerTitle}>My Doctor Profile</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Stethoscope size={30} color={GREEN} />
          </View>

          <Text style={styles.emptyTitle}>
            Doctor profile not found
          </Text>

          <Text style={styles.emptyText}>
            Create your doctor profile to start receiving
            consultation requests.
          </Text>

          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('DoctorRegistration')
            }
          >
            <Text style={styles.registerButtonText}>
              Register as Doctor
            </Text>
          </TouchableOpacity>

          {myDoctorError ? (
            <Text style={styles.errorText}>
              {getErrorMessage(myDoctorError)}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  const isActive = Boolean(myDoctor.isActive);

  const location = [
    myDoctor.village,
    myDoctor.district,
    myDoctor.state,
  ]
    .filter(Boolean)
    .join(', ');

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
            My Doctor Profile
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your professional profile
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('DoctorEditProfile', {
              doctor: myDoctor,
            })
          }
        >
          <Edit3 size={19} color={GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={undefined}
      >
        {/* Profile hero */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.profileAvatar}>
              <UserRound size={32} color={GREEN} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {myDoctor.fullName || 'Doctor'}
              </Text>

              <Text style={styles.profileType}>
                {formatDoctorType(myDoctor.doctorType)}
              </Text>

              <View style={styles.activeRow}>
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor: isActive
                        ? GREEN
                        : '#9CA3AF',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.activeText,
                    {
                      color: isActive ? GREEN : MUTED,
                    },
                  ]}
                >
                  {isActive ? 'Profile active' : 'Profile inactive'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingNumber}>
                {Number(myDoctor.rating || 0).toFixed(1)}
              </Text>

              <Text style={styles.ratingLabel}>Rating</Text>
            </View>

            <View style={styles.ratingDivider} />

            <View style={styles.ratingItem}>
              <Text style={styles.ratingNumber}>
                {myDoctor.totalReviews || 0}
              </Text>

              <Text style={styles.ratingLabel}>Reviews</Text>
            </View>

            <View style={styles.ratingDivider} />

            <View style={styles.ratingItem}>
              <Text style={styles.ratingNumber}>
                {myDoctor.totalConsultations || 0}
              </Text>

              <Text style={styles.ratingLabel}>
                Consultations
              </Text>
            </View>
          </View>
        </View>

        {/* Active status */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Power size={20} color={isActive ? GREEN : MUTED} />
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              Accept consultation requests
            </Text>

            <Text style={styles.statusSubtitle}>
              {isActive
                ? 'Farmers can currently find and request consultations from you.'
                : 'Your profile is hidden from new farmer requests.'}
            </Text>
          </View>

          <Switch
            value={isActive}
            onValueChange={handleToggleActive}
            disabled={isActivating || isDeactivating}
            trackColor={{
              false: '#D1D5DB',
              true: '#A7DDBA',
            }}
            thumbColor={isActive ? GREEN : '#F3F4F6'}
          />
        </View>

        {/* Professional information */}
        <SectionCard
          icon={<Stethoscope size={19} color={GREEN} />}
          title="Professional information"
        >
          <InfoRow
            label="Doctor type"
            value={formatDoctorType(myDoctor.doctorType)}
          />

          <ArrayInfoRow
            label="Specialization"
            values={myDoctor.specialization}
          />

          <ArrayInfoRow
            label="Qualification"
            values={myDoctor.qualification}
          />

          <ArrayInfoRow
            label="Languages"
            values={myDoctor.languages}
          />
        </SectionCard>

        {/* About */}
        {myDoctor.about ? (
          <SectionCard
            icon={<FileText size={19} color={GREEN} />}
            title="About"
          >
            <Text style={styles.aboutText}>
              {myDoctor.about}
            </Text>
          </SectionCard>
        ) : null}

        {/* Consultation */}
        <SectionCard
          icon={<Wallet size={19} color={GREEN} />}
          title="Consultation"
        >
          <View style={styles.feeBox}>
            <View>
              <Text style={styles.feeLabel}>
                Consultation fee
              </Text>

              <Text style={styles.feeValue}>
                {myDoctor.consultationFeeType === 'free' ||
                Number(myDoctor.consultationFee || 0) === 0
                  ? 'Free'
                  : `₹${Number(
                      myDoctor.consultationFee,
                    ).toLocaleString('en-IN')}`}
              </Text>
            </View>

            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>
                {myDoctor.consultationFeeType === 'free'
                  ? 'Free'
                  : 'Per consultation'}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Availability */}
        <SectionCard
          icon={<Clock3 size={19} color={GREEN} />}
          title="Availability"
        >
          <InfoRow
            label="Current status"
            value={formatAvailability(myDoctor.availability)}
          />

          <View style={styles.availabilityTimeRow}>
            <View style={styles.availabilityTimeBox}>
              <Text style={styles.timeLabel}>Available from</Text>

              <Text style={styles.timeValue}>
                {formatDateTime(myDoctor.availableFrom)}
              </Text>
            </View>

            <View style={styles.availabilityTimeBox}>
              <Text style={styles.timeLabel}>Available until</Text>

              <Text style={styles.timeValue}>
                {formatDateTime(myDoctor.availableUntil)}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Location */}
        <SectionCard
          icon={<MapPin size={19} color={GREEN} />}
          title="Location"
        >
          {location ? (
            <Text style={styles.locationText}>
              {location}
            </Text>
          ) : (
            <Text style={styles.mutedValue}>
              Location not provided
            </Text>
          )}

          {myDoctor.address ? (
            <Text style={styles.addressText}>
              {myDoctor.address}
            </Text>
          ) : null}
        </SectionCard>

        {/* Certificate */}
        {myDoctor.doctorateCertificate ? (
          <SectionCard
            icon={<FileText size={19} color={GREEN} />}
            title="Doctorate certificate"
          >
            <View style={styles.certificateBox}>
              <CheckCircle2 size={20} color={GREEN} />

              <Text
                style={styles.certificateText}
                numberOfLines={2}
              >
                Certificate information added
              </Text>
            </View>
          </SectionCard>
        ) : null}

        {/* Requests button */}
        <TouchableOpacity
          style={styles.requestsButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('DoctorRequests')}
        >
          <Stethoscope size={19} color={WHITE} />

          <Text style={styles.requestsButtonText}>
            View Consultation Requests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.8}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>
            Refresh Profile
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionCard = ({ icon, title, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>{icon}</View>

      <Text style={styles.sectionTitle}>{title}</Text>
    </View>

    {children}
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>

    <Text style={styles.infoValue}>
      {value || '--'}
    </Text>
  </View>
);

const ArrayInfoRow = ({ label, values }) => {
  const list = Array.isArray(values) ? values : [];

  if (list.length === 0) {
    return null;
  }

  return (
    <View style={styles.arrayInfoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <View style={styles.chipsContainer}>
        {list.map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

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

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  profileCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 14,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
  },

  profileType: {
    marginTop: 4,
    fontSize: 13,
    color: GREEN,
    fontWeight: '700',
  },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },

  ratingItem: {
    flex: 1,
    alignItems: 'center',
  },

  ratingNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: DARK,
  },

  ratingLabel: {
    marginTop: 3,
    fontSize: 10,
    color: MUTED,
    fontWeight: '600',
  },

  ratingDivider: {
    width: 1,
    height: 28,
    backgroundColor: BORDER,
  },

  statusCard: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusInfo: {
    flex: 1,
    marginHorizontal: 11,
  },

  statusTitle: {
    fontSize: 13,
    color: DARK,
    fontWeight: '800',
  },

  statusSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
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
    marginBottom: 15,
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

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },

  infoLabel: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },

  infoValue: {
    maxWidth: '60%',
    fontSize: 13,
    color: DARK,
    fontWeight: '700',
    textAlign: 'right',
  },

  arrayInfoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },

  chip: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  chipText: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '700',
  },

  aboutText: {
    fontSize: 13,
    color: DARK,
    lineHeight: 20,
  },

  feeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 13,
  },

  feeLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
  },

  feeValue: {
    marginTop: 4,
    fontSize: 20,
    color: GREEN,
    fontWeight: '800',
  },

  freeBadge: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  freeBadgeText: {
    fontSize: 10,
    color: GREEN,
    fontWeight: '800',
  },

  availabilityTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  availabilityTimeBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },

  timeLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '600',
  },

  timeValue: {
    marginTop: 5,
    fontSize: 13,
    color: DARK,
    fontWeight: '800',
  },

  locationText: {
    fontSize: 14,
    color: DARK,
    fontWeight: '700',
    lineHeight: 20,
  },

  addressText: {
    marginTop: 7,
    fontSize: 12,
    color: MUTED,
    lineHeight: 18,
  },

  mutedValue: {
    fontSize: 13,
    color: MUTED,
  },

  certificateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    padding: 12,
  },

  certificateText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    color: GREEN,
    fontWeight: '700',
  },

  requestsButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },

  requestsButtonText: {
    marginLeft: 8,
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },

  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },

  refreshButtonText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
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

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    lineHeight: 20,
    textAlign: 'center',
  },

  registerButton: {
    marginTop: 20,
    backgroundColor: GREEN,
    borderRadius: 13,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },

  registerButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800',
  },

  errorText: {
    marginTop: 15,
    color: RED,
    fontSize: 12,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 15,
  },
});

export default MyDoctorProfileScreen;1