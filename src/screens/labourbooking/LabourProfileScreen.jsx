import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  VenusAndMars,
  CalendarDays,
  Briefcase,
  IndianRupee,
  Clock3,
  BadgeCheck,
  Edit3,
  Power,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import {
  getMyLabourerProfile,
  activateMyLabourerProfile,
  deactivateMyLabourerProfile,
} from '../../redux/slices/labourerSlice';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const LIGHT_GREEN = '#DCFCE7';
const RED = '#DC2626';
const LIGHT_RED = '#FEE2E2';
const ORANGE = '#F97316';
const LIGHT_ORANGE = '#FFEDD5';
export default function LabourProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { myProfile, isLoadingProfile, error } = useSelector(
    state => state.labourer,
  );
  useEffect(() => {
    dispatch(getMyLabourerProfile());
  }, [dispatch]);
  const handleRefresh = useCallback(() => {
    dispatch(getMyLabourerProfile());
  }, [dispatch]);
  const handleToggleAvailability = () => {
    if (!myProfile) {
      return;
    }
    const isActive =
      myProfile?.isActive !== false &&
      myProfile?.availability !== 'unavailable';
    if (isActive) {
      dispatch(deactivateMyLabourerProfile());
    } else {
      dispatch(activateMyLabourerProfile());
    }
  };
  if (isLoadingProfile && !myProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />

          <Text style={styles.loadingTitle}>
            Loading your labour profile...
          </Text>

          <Text style={styles.loadingText}>
            Please wait while we fetch your profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!myProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={rf(21)} color={DARK} strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Labour Profile</Text>

          <View
            style={{
              width: 40,
            }}
          />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Users size={rf(32)} color={GREEN} strokeWidth={2} />
          </View>

          <Text style={styles.emptyTitle}>No Labour Profile Found</Text>

          <Text style={styles.emptyText}>
            You haven't created a labour profile yet. Create one to start
            finding farming work near you.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.createButton}
            onPress={() => navigation.navigate('FindWorkStep2')}
          >
            <Text style={styles.createButtonText}>Create Labour Profile</Text>

            <ChevronRight size={rf(18)} color="#FFFFFF" strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const profile = myProfile;
  const isActive =
    profile?.isActive !== false && profile?.availability !== 'unavailable';
  const profileImage =
    profile?.profileImage || profile?.image || profile?.photo || null;
  const preferredWork = Array.isArray(profile?.preferredWork)
    ? profile.preferredWork
    : profile?.preferredWork
    ? [profile.preferredWork]
    : [];
  const experience =
    profile?.experience !== undefined &&
    profile?.experience !== null &&
    profile?.experience !== ''
      ? `${profile.experience} ${profile?.experienceUnit || 'years'}`
      : 'Not specified';
  const wage =
    profile?.expectedWage !== undefined &&
    profile?.expectedWage !== null &&
    profile?.expectedWage !== ''
      ? `₹${Number(profile.expectedWage).toLocaleString('en-IN')} / ${
          profile?.wageType || 'day'
        }`
      : 'Not specified';
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={rf(21)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Labour Profile</Text>

          <Text style={styles.headerSubtitle}>Your work profile</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('FindWorkStep2', {
              editMode: true,
              profile,
            })
          }
        >
          <Edit3 size={rf(18)} color={GREEN} strokeWidth={2.3} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshing={isLoadingProfile}
        onRefresh={handleRefresh}
      >
        {}

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                style={styles.profileImage}
                onError={() => {}}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={rf(38)} color={GREEN} strokeWidth={1.8} />
              </View>
            )}

            <View style={styles.profileMain}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName} numberOfLines={2}>
                  {profile?.fullName || profile?.name || 'Labour Worker'}
                </Text>

                <View style={styles.verifiedBadge}>
                  <BadgeCheck
                    size={rf(13)}
                    color={DARK_GREEN}
                    strokeWidth={2.6}
                  />

                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <View
                style={[
                  styles.availabilityBadge,
                  isActive ? styles.availableBadge : styles.unavailableBadge,
                ]}
              >
                {isActive ? (
                  <CheckCircle2 size={rf(13)} color={GREEN} strokeWidth={2.5} />
                ) : (
                  <XCircle size={rf(13)} color={RED} strokeWidth={2.5} />
                )}

                <Text
                  style={[
                    styles.availabilityText,
                    {
                      color: isActive ? GREEN : RED,
                    },
                  ]}
                >
                  {isActive ? 'Available for Work' : 'Currently Unavailable'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.profileMetaRow}>
            <View style={styles.profileMetaItem}>
              <Briefcase size={rf(16)} color={GREEN} strokeWidth={2.3} />

              <Text style={styles.profileMetaText}>Labour Worker</Text>
            </View>

            <View style={styles.profileMetaItem}>
              <MapPin size={rf(16)} color={GREEN} strokeWidth={2.3} />

              <Text style={styles.profileMetaText} numberOfLines={1}>
                {profile?.village || 'Location not specified'}
              </Text>
            </View>
          </View>
        </View>

        {}

        <SectionTitle title="Personal Information" />

        <View style={styles.card}>
          <ProfileRow
            Icon={User}
            label="Full Name"
            value={profile?.fullName || profile?.name || 'Not provided'}
          />

          <ProfileRow
            Icon={Phone}
            label="Phone Number"
            value={profile?.phoneNumber || profile?.phone || 'Not provided'}
          />

          <ProfileRow
            Icon={VenusAndMars}
            label="Gender"
            value={profile?.gender || 'Not specified'}
          />

          <ProfileRow
            Icon={CalendarDays}
            label="Age"
            value={profile?.age ? `${profile.age} Years` : 'Not specified'}
            last
          />
        </View>

        {}

        <SectionTitle title="Location" />

        <View style={styles.card}>
          <ProfileRow
            Icon={MapPin}
            label="Village"
            value={profile?.village || 'Not provided'}
          />

          <ProfileRow
            Icon={MapPin}
            label="District"
            value={profile?.district || 'Not provided'}
          />

          <ProfileRow
            Icon={MapPin}
            label="State"
            value={profile?.state || 'Not provided'}
            last
          />
        </View>

        {}

        <SectionTitle title="Work Information" />

        <View style={styles.card}>
          <ProfileRow
            Icon={Briefcase}
            label="Preferred Work"
            value={
              preferredWork.length > 0
                ? preferredWork.join(' · ')
                : 'Not specified'
            }
          />

          <ProfileRow Icon={Clock3} label="Experience" value={experience} />

          <ProfileRow Icon={IndianRupee} label="Expected Wage" value={wage} />

          <ProfileRow
            Icon={CalendarDays}
            label="Availability"
            value={profile?.availability || 'Not specified'}
            last
          />
        </View>

        {}

        {preferredWork.length > 0 && (
          <>
            <SectionTitle title="Skills & Preferred Work" />

            <View style={styles.skillsCard}>
              {preferredWork.map((work, index) => (
                <View key={`${work}-${index}`} style={styles.skillPill}>
                  <CheckCircle2 size={rf(14)} color={GREEN} strokeWidth={2.5} />

                  <Text style={styles.skillText}>{work}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {}

        <SectionTitle title="Work Preferences" />

        <View style={styles.card}>
          <ProfileRow
            Icon={Users}
            label="Worker Arrangement"
            value={profile?.workerArrangement || 'Single'}
          />

          <ProfileRow
            Icon={MapPin}
            label="Preferred Distance"
            value={profile?.workDistance || '10 KM'}
            last
          />
        </View>

        {}

        <SectionTitle title="Profile Status" />

        <View
          style={[
            styles.statusCard,
            isActive ? styles.activeStatusCard : styles.inactiveStatusCard,
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor: isActive ? LIGHT_GREEN : LIGHT_RED,
              },
            ]}
          >
            {isActive ? (
              <CheckCircle2 size={rf(23)} color={GREEN} strokeWidth={2.3} />
            ) : (
              <XCircle size={rf(23)} color={RED} strokeWidth={2.3} />
            )}
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.statusTitle}>
              {isActive ? 'Your profile is active' : 'Your profile is inactive'}
            </Text>

            <Text style={styles.statusText}>
              {isActive
                ? 'Farmers can find you and send labour work requests.'
                : 'Your profile is currently hidden from new work opportunities.'}
            </Text>
          </View>
        </View>

        {}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleToggleAvailability}
          style={[
            styles.toggleButton,
            isActive ? styles.deactivateButton : styles.activateButton,
          ]}
        >
          <Power
            size={rf(18)}
            color={isActive ? RED : '#FFFFFF'}
            strokeWidth={2.4}
          />

          <Text
            style={[
              styles.toggleButtonText,
              {
                color: isActive ? RED : '#FFFFFF',
              },
            ]}
          >
            {isActive ? 'Make Profile Unavailable' : 'Make Profile Available'}
          </Text>
        </TouchableOpacity>

        {}

        {error ? (
          <View style={styles.errorCard}>
            <XCircle size={rf(18)} color={RED} strokeWidth={2.3} />

            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View
          style={{
            height: 30,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}
function ProfileRow({ Icon, label, value, last = false }) {
  return (
    <View
      style={[
        styles.profileRow,
        last && {
          borderBottomWidth: 0,
        },
      ]}
    >
      <View style={styles.rowIcon}>
        <Icon size={rf(17)} color={GREEN} strokeWidth={2.3} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>

        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFA',
  },
  header: {
    height: 62,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.037,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingTop: 14,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#F1F5F9',
  },
  profileImagePlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMain: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  profileName: {
    maxWidth: '72%',
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  verifiedBadge: {
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  availabilityBadge: {
    marginTop: 9,
    alignSelf: 'flex-start',
    height: 27,
    paddingHorizontal: 9,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availableBadge: {
    backgroundColor: LIGHT_GREEN,
  },
  unavailableBadge: {
    backgroundColor: LIGHT_RED,
  },
  availabilityText: {
    fontSize: rf(10),
    fontWeight: '900',
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  profileMetaRow: {
    flexDirection: 'row',
    gap: 18,
  },
  profileMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  profileMetaText: {
    flex: 1,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 11,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  profileRow: {
    minHeight: 66,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    fontSize: rf(10),
    color: '#98A1AF',
    fontWeight: '800',
  },
  rowValue: {
    marginTop: 3,
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
  },
  skillsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
    backgroundColor: LIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  skillText: {
    fontSize: rf(11),
    color: DARK_GREEN,
    fontWeight: '800',
  },
  statusCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatusCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  inactiveStatusCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTitle: {
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
  },
  statusText: {
    marginTop: 3,
    fontSize: rf(10),
    lineHeight: rf(15),
    color: MUTED,
    fontWeight: '500',
  },
  toggleButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deactivateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  activateButton: {
    backgroundColor: GREEN,
  },
  toggleButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
  },
  errorCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: LIGHT_RED,
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: rf(11),
    color: RED,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: rf(16),
    color: DARK,
    fontWeight: '900',
  },
  loadingText: {
    marginTop: 6,
    fontSize: rf(12),
    color: MUTED,
    textAlign: 'center',
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
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: rf(13),
    color: MUTED,
    lineHeight: rf(20),
    textAlign: 'center',
  },
  createButton: {
    marginTop: 22,
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 26,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: rf(14),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
