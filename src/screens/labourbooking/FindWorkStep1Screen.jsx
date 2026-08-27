import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  BadgeCheck,
  Users,
  X,
  UserCheck,
} from 'lucide-react-native';

import {getMyLabourerProfile} from '../../redux/slices/labourerSlice';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};

const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';

export default function FindWorkStep1Screen({navigation}) {
  const dispatch = useDispatch();

  const {
    myProfile,
    isLoadingProfile,
    error: labourerError,
  } = useSelector(state => state.labourer);

  const [showExistingModal, setShowExistingModal] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // ============================================================
  // CHECK EXISTING LABOUR PROFILE
  // ============================================================

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    setHasCheckedProfile(false);

    try {
      const result = await dispatch(
        getMyLabourerProfile(),
      ).unwrap();

      /*
       * Backend should return something like:
       *
       * {
       *   success: true,
       *   labourer: {...}
       * }
       */

      const profile = result?.labourer;

      if (profile) {
        setShowExistingModal(true);
      }
    } catch (error) {
      /*
       * IMPORTANT:
       *
       * If backend returns 404 / "Labourer profile not found",
       * that means the user does NOT have a labour profile.
       *
       * Therefore we simply allow them to continue.
       */
      console.log(
        'Labour profile check:',
        error,
      );
    } finally {
      setHasCheckedProfile(true);
    }
  };

  // ============================================================
  // GET STARTED
  // ============================================================

  const handleGetStarted = () => {
    /*
     * If profile is still being checked, don't navigate yet.
     */
    if (isLoadingProfile || !hasCheckedProfile) {
      return;
    }

    /*
     * Safety check:
     *
     * If profile exists in Redux, don't allow another profile.
     */
    if (myProfile) {
      setShowExistingModal(true);
      return;
    }

    navigation.navigate('FindWorkStep2');
  };

  // ============================================================
  // VIEW EXISTING PROFILE
  // ============================================================

  const handleViewProfile = () => {
    setShowExistingModal(false);

    /*
     * Change this route if your actual profile screen
     * has a different name.
     */
    navigation.navigate('LabourProfile', {
      labourer: myProfile,
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}>
          <ArrowLeft
            size={rf(20)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Find Work
        </Text>

        <Text style={styles.stepText}>
          Step 1 of 4
        </Text>
      </View>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <View style={styles.progressRow}>
        <View
          style={[
            styles.progressBar,
            styles.activeBar,
          ]}
        />

        <View style={styles.progressBar} />

        <View style={styles.progressBar} />

        <View style={styles.progressBar} />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.content}>
        <Image
          source={require('../../assets/labour/hero4.png')}
          style={styles.hero}
        />

        <View style={styles.titleRow}>
          <View style={styles.titleIcon}>
            <Users
              size={rf(22)}
              color={GREEN}
              strokeWidth={2.4}
            />
          </View>

          <Text style={styles.mainTitle}>
            Looking for work?
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Find farming jobs from{'\n'}
          nearby farmers.
        </Text>

        <View style={styles.featuresList}>
          <FeatureRow
            Icon={Briefcase}
            text="Daily work opportunities"
            color="#DCFCE7"
            iconColor="#16A34A"
          />

          <FeatureRow
            Icon={MapPin}
            text="Nearby jobs"
            color="#FFEDD5"
            iconColor="#EA580C"
          />

          <FeatureRow
            Icon={BadgeCheck}
            text="Free registration"
            color="#DBEAFE"
            iconColor="#2563EB"
          />
        </View>
      </View>

      {/* ======================================================
          BOTTOM BUTTON
      ====================================================== */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={
            isLoadingProfile ||
            !hasCheckedProfile
          }
          onPress={handleGetStarted}
          style={[
            styles.nextBtn,
            (isLoadingProfile ||
              !hasCheckedProfile) &&
              styles.disabledBtn,
          ]}>

          {isLoadingProfile ||
          !hasCheckedProfile ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.nextText}>
                Checking profile...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.nextText}>
                Get Started
              </Text>

              <ArrowRight
                size={rf(17)}
                color="#FFFFFF"
                strokeWidth={2.6}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ======================================================
          EXISTING PROFILE MODAL
      ====================================================== */}

      <Modal
        visible={showExistingModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowExistingModal(false)
        }>

        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* CLOSE */}

            <TouchableOpacity
              onPress={() =>
                setShowExistingModal(false)
              }
              style={styles.modalClose}>
              <X
                size={rf(18)}
                color={DARK}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            {/* ICON */}

            <View style={styles.existingIcon}>
              <UserCheck
                size={rf(28)}
                color={GREEN}
                strokeWidth={2.4}
              />
            </View>

            {/* TITLE */}

            <Text style={styles.modalTitle}>
              Labour Profile Already Exists
            </Text>

            {/* MESSAGE */}

            <Text style={styles.modalMessage}>
              You already have a labour profile
              registered with KhetiMaster.
              {'\n\n'}
              You don't need to create another
              profile. You can view or manage
              your existing profile instead.
            </Text>

            {/* PROFILE NAME */}

            {myProfile?.fullName ? (
              <View style={styles.profilePreview}>
                {myProfile?.profileImage ? (
                  <Image
                    source={{
                      uri: myProfile.profileImage,
                    }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={
                      styles.profileImagePlaceholder
                    }>
                    <UserCheck
                      size={rf(20)}
                      color={GREEN}
                    />
                  </View>
                )}

                <View style={{flex: 1}}>
                  <Text
                    style={
                      styles.profilePreviewName
                    }>
                    {myProfile.fullName}
                  </Text>

                  {myProfile?.village ? (
                    <Text
                      style={
                        styles.profilePreviewVillage
                      }>
                      {myProfile.village}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* VIEW PROFILE */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleViewProfile}
              style={styles.viewProfileBtn}>

              <UserCheck
                size={rf(18)}
                color="#FFFFFF"
                strokeWidth={2.4}
              />

              <Text style={styles.viewProfileText}>
                View My Labour Profile
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setShowExistingModal(false)
              }
              style={styles.cancelBtn}>

              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// FEATURE ROW
// ============================================================

function FeatureRow({
  Icon,
  text,
  color,
  iconColor,
}) {
  return (
    <View style={styles.featureCard}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: color,
          },
        ]}>
        <Icon
          size={rf(20)}
          color={iconColor}
          strokeWidth={2.4}
        />
      </View>

      <Text style={styles.featureText}>
        {text}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.037,
    justifyContent: 'space-between',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },

  stepText: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '700',
  },

  progressRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: width * 0.037,
    marginBottom: 20,
  },

  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E7EBED',
  },

  activeBar: {
    backgroundColor: GREEN,
  },

  content: {
    flex: 1,
    paddingHorizontal: width * 0.037,
  },

  hero: {
    width: '100%',
    height: 260,
    borderRadius: 16,
  },

  titleRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  titleIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainTitle: {
    fontSize: rf(23),
    fontWeight: '900',
    color: DARK,
  },

  subtitle: {
    marginTop: 8,
    fontSize: rf(14),
    color: MUTED,
    lineHeight: rf(20),
  },

  featuresList: {
    marginTop: 24,
    gap: 12,
  },

  featureCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureText: {
    fontSize: rf(14),
    fontWeight: '800',
    color: DARK,
  },

  bottomBar: {
    padding: width * 0.037,
  },

  nextBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabledBtn: {
    opacity: 0.65,
  },

  nextText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },

  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  existingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },

  modalMessage: {
    marginTop: 10,
    fontSize: rf(13),
    lineHeight: rf(19),
    color: MUTED,
    textAlign: 'center',
  },

  profilePreview: {
    width: '100%',
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profilePreviewName: {
    marginLeft: 10,
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  profilePreviewVillage: {
    marginLeft: 10,
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },

  viewProfileBtn: {
    width: '100%',
    height: 52,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  viewProfileText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  cancelBtn: {
    width: '100%',
    height: 48,
    marginTop: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: rf(14),
    fontWeight: '800',
    color: MUTED,
  },
});