import { useTranslation } from 'react-i18next';
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import LinearGradient from 'react-native-linear-gradient';

import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Map,
  MapPin,
  Home,
} from 'lucide-react-native';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  completeProfile,
  updateProfile,
  selectIsLoading,
  selectEmail,
  selectUser,
} from '../../redux/slices/authSlice';

import {useLocation} from '../../context/LocationContext';

const {width, height} =
  Dimensions.get('window');

const GREEN = '#159447';
const DARK = '#151C2B';

const ProfileSetupScreen = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const scrollRef = useRef(null);

  // ==================================================
  // REDUX
  // ==================================================

  const reduxEmail =
    useSelector(selectEmail);

  const user =
    useSelector(selectUser);

  const isLoading =
    useSelector(selectIsLoading);

  // ==================================================
  // EMAIL
  // ==================================================

  const routeEmail =
    route?.params?.email || '';

  const email =
    reduxEmail || routeEmail;

  // ==================================================
  // EDIT MODE
  // ==================================================

  const isEditMode =
    route?.params?.mode === 'edit';

  // ==================================================
  // LOCATION
  // SAME LOCATION SYSTEM AS HOMESCREEN
  // ==================================================

  const {
    location: currentLocation,
    loading: locationLoading,
  } = useLocation();

  // ==================================================
  // FORM STATE
  // ==================================================

  const [phoneNumber, setPhoneNumber] =
    useState('');

  const [name, setName] =
    useState('');

  const [stateName, setStateName] =
    useState('');

  const [district, setDistrict] =
    useState('');

  const [taluka, setTaluka] =
    useState('');

  const [village, setVillage] =
    useState('');

  const [keyboardVisible, setKeyboardVisible] =
    useState(false);

  // ==================================================
  // LOAD EXISTING USER DATA
  // ==================================================

  useEffect(() => {
    if (!isEditMode || !user) {
      return;
    }

    setPhoneNumber(
      user?.phoneNumber ||
        user?.phone ||
        '',
    );

    setName(
      user?.fullName ||
        user?.name ||
        '',
    );

    setStateName(
      user?.state || '',
    );

    setDistrict(
      user?.district || '',
    );

    setTaluka(
      user?.taluka || '',
    );

    setVillage(
      user?.village || '',
    );
  }, [isEditMode, user]);

  // ==================================================
  // AUTOMATIC LOCATION
  //
  // Same location source used by HomeScreen.
  //
  // ONLY STATE + DISTRICT are automatically filled.
  //
  // TALUKA + VILLAGE remain untouched.
  // ==================================================

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    const detectedState =
      currentLocation?.state || '';

    const detectedDistrict =
      currentLocation?.district || '';

    if (detectedState) {
      setStateName(detectedState);
    }

    if (detectedDistrict) {
      setDistrict(detectedDistrict);
    }

    console.log(
      '[Profile Location] Detected:',
      {
        state: detectedState,
        district: detectedDistrict,
      },
    );
  }, [currentLocation]);

  // ==================================================
  // KEYBOARD
  // ==================================================

  useEffect(() => {
    const showSubscription =
      Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        },
      );

    const hideSubscription =
      Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);

          setTimeout(() => {
            scrollRef.current?.scrollTo({
              y: 0,
              animated: true,
            });
          }, 100);
        },
      );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // ==================================================
  // FOCUS / SCROLL
  // ==================================================

  const focusField = y => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 120);
  };

  // ==================================================
  // SAVE / CONTINUE
  // ==================================================

  const handleContinue =
    async () => {
      const phoneValue =
        phoneNumber.trim();

      const fullName =
        name.trim();

      const state =
        stateName.trim();

      const districtValue =
        district.trim();

      const talukaValue =
        taluka.trim();

      const villageValue =
        village.trim();

      // ==================================================
      // VALIDATION
      // ==================================================

      if (!phoneValue) {
        Alert.alert(
          t('profileSetup.required'),
          t('profileSetup.err_phone'),
        );

        return;
      }

      const phoneDigits =
        phoneValue.replace(
          /\D/g,
          '',
        );

      if (
        phoneDigits.length < 10 ||
        phoneDigits.length > 15
      ) {
        Alert.alert(
          t('profileSetup.invalid_phone'),
          t('profileSetup.err_phone_valid'),
        );

        return;
      }

      if (!fullName) {
        Alert.alert(
          t('profileSetup.required'),
          t('profileSetup.err_name'),
        );

        return;
      }

      if (!state) {
        Alert.alert(
          t('profileSetup.required'),
          t('profileSetup.err_state'),
        );

        return;
      }

      if (!districtValue) {
        Alert.alert(
          t('profileSetup.required'),
          t('profileSetup.err_district'),
        );

        return;
      }

      // ==================================================
      // TALUKA IS MANUAL
      // ==================================================

      if (!talukaValue) {
        Alert.alert(
          t('profileSetup.required'),
          t('profileSetup.err_taluka'),
        );

        return;
      }

      // ==================================================
      // VILLAGE IS MANUAL
      // ==================================================

      if (!villageValue) {
        Alert.alert(
          t('profileSetup.required'),
          t('profileSetup.err_village'),
        );

        return;
      }

      // ==================================================
      // CREATE MODE EMAIL
      // ==================================================

      if (!isEditMode && !email) {
        Alert.alert(
          t('profileSetup.session_error'),
          t('profileSetup.session_error_text'),
        );

        return;
      }

      try {
        Keyboard.dismiss();

        // ==================================================
        // EDIT PROFILE
        // ==================================================

        if (isEditMode) {
          const result =
            await dispatch(
              updateProfile({
                phoneNumber:
                  phoneValue,

                fullName,

                state,

                district:
                  districtValue,

                taluka:
                  talukaValue,

                village:
                  villageValue,
              }),
            ).unwrap();

          if (result?.success) {
            Alert.alert(
              t('profileSetup.updated'),
              t('profileSetup.updated_text'),
              [
                {
                  text: t('common.ok'),
                  onPress: () =>
                    navigation.goBack(),
                },
              ],
            );

            return;
          }

          Alert.alert(
            t('profileSetup.profile'),
            result?.message ||
              t('profileSetup.err_update'),
          );

          return;
        }

        // ==================================================
        // CREATE PROFILE
        // ==================================================

        const result =
          await dispatch(
            completeProfile({
              email:
                email
                  .trim()
                  .toLowerCase(),

              phoneNumber:
                phoneValue,

              fullName,

              state,

              district:
                districtValue,

              taluka:
                talukaValue,

              village:
                villageValue,
            }),
          ).unwrap();

        if (result?.success) {
          navigation.reset({
            index: 0,

            routes: [
              {
                name: 'Home',
              },
            ],
          });

          return;
        }

        Alert.alert(
          t('profileSetup.setup'),
          result?.message ||
            t('profileSetup.err_complete'),
        );
      } catch (error) {
        console.log(
          'PROFILE ERROR:',
          error,
        );

        Alert.alert(
          isEditMode
            ? t('profileSetup.update_failed')
            : t('profileSetup.setup_failed'),

          typeof error === 'string'
            ? error
            : error?.message ||
                t('profileSetup.err_save'),
        );
      }
    };

  // ==================================================
  // BACK
  // ==================================================

  const handleBack = () => {
    if (isLoading) {
      return;
    }

    Keyboard.dismiss();

    navigation.goBack();
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={
            Platform.OS === 'ios'
          }
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible &&
              styles.keyboardScrollContent,
          ]}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleBack}
              disabled={isLoading}
              style={styles.backBtn}
            >
              <ArrowLeft
                size={22}
                color="#087235"
                strokeWidth={2.6}
              />
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/logoo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View
              style={styles.headerRight}
            />
          </View>

          <View style={styles.divider} />

          {/* ==================================================
              HERO
          ================================================== */}

          <Image
            source={require('../../assets/images/profile1.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <View style={styles.content}>
            {/* ==================================================
                TITLE
            ================================================== */}

            <Text style={styles.title}>
              {isEditMode
                ? t('profileSetup.edit_title')
                : t('profileSetup.create_title')}
            </Text>

            <Text style={styles.subtitle}>
              {isEditMode
                ? t('profileSetup.edit_sub')
                : t('profileSetup.create_sub')}
            </Text>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <FieldLabel
              title={t('profileSetup.email')}
            />

            <View
              style={styles.emailBox}
            >
              <View
                style={
                  styles.emailIconBox
                }
              >
                <Mail
                  size={19}
                  color="#159447"
                  strokeWidth={2.2}
                />
              </View>

              <TextInput
                value={email}
                editable={false}
                style={
                  styles.emailInput
                }
                placeholder={t('profileSetup.email_ph')}
                placeholderTextColor="#A3ADBD"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View
                style={
                  styles.verifiedBadge
                }
              >
                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  Verified
                </Text>
              </View>
            </View>

            {/* ==================================================
                PHONE
            ================================================== */}

            <FieldLabel
              title={t('profileSetup.phone')}
            />

            <View
              style={styles.inputBox}
            >
              <Phone
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={phoneNumber}
                onChangeText={text => {
                  const cleaned =
                    text.replace(
                      /[^0-9+ ]/g,
                      '',
                    );

                  setPhoneNumber(
                    cleaned,
                  );
                }}
                placeholder={t('profileSetup.phone_ph')}
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                keyboardType="phone-pad"
                maxLength={15}
                returnKeyType="next"
                onFocus={() =>
                  focusField(80)
                }
              />
            </View>

            {/* ==================================================
                FULL NAME
            ================================================== */}

            <FieldLabel
              title={t('profileSetup.full_name')}
            />

            <View
              style={styles.inputBox}
            >
              <User
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('profileSetup.full_name_ph')}
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() =>
                  focusField(150)
                }
              />
            </View>

            {/* ==================================================
                STATE
            ================================================== */}

            <FieldLabel title={t('profileSetup.state')} />

            <View style={styles.inputBox}>
              <Map
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={stateName}
                onChangeText={setStateName}
                placeholder={
                  locationLoading
                    ? t('profileSetup.detecting_state')
                    : t('profileSetup.state_ph')
                }
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() =>
                  focusField(220)
                }
              />

              {locationLoading && (
                <ActivityIndicator
                  size="small"
                  color={GREEN}
                />
              )}
            </View>

            {/* ==================================================
                DISTRICT
            ================================================== */}

            <FieldLabel
              title={t('profileSetup.district')}
            />

            <View style={styles.inputBox}>
              <MapPin
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={district}
                onChangeText={setDistrict}
                placeholder={
                  locationLoading
                    ? t('profileSetup.detecting_district')
                    : t('profileSetup.district_ph')
                }
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() =>
                  focusField(290)
                }
              />

              {locationLoading && (
                <ActivityIndicator
                  size="small"
                  color={GREEN}
                />
              )}
            </View>

            {/* ==================================================
                TALUKA
                MANUAL ONLY
            ================================================== */}

            <FieldLabel title={t('profileSetup.taluka')} />

            <View
              style={styles.inputBox}
            >
              <MapPin
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={taluka}
                onChangeText={setTaluka}
                placeholder={t('profileSetup.taluka_ph')}
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() =>
                  focusField(360)
                }
              />
            </View>

            {/* ==================================================
                VILLAGE
                MANUAL ONLY
            ================================================== */}

            <FieldLabel
              title={t('profileSetup.village')}
            />

            <View
              style={styles.inputBox}
            >
              <Home
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={village}
                onChangeText={setVillage}
                placeholder={t('profileSetup.village_ph')}
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="done"
                onFocus={() =>
                  focusField(430)
                }
              />
            </View>

            {/* ==================================================
                STEP
            ================================================== */}

            {!isEditMode && (
              <View
                style={styles.stepRow}
              >
                <View
                  style={styles.dots}
                >
                  <View
                    style={
                      styles.activeStepDot
                    }
                  />

                  <View
                    style={
                      styles.stepDot
                    }
                  />
                </View>

                <Text
                  style={styles.stepText}
                >
                  {t('common.step_of', { step: 1, total: 2 })}
                </Text>
              </View>
            )}

            {/* ==================================================
                BUTTON
            ================================================== */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <LinearGradient
                colors={
                  isLoading
                    ? [
                        '#9BCDAE',
                        '#A9DDBA',
                      ]
                    : [
                        '#138A3D',
                        '#27D66B',
                      ]
                }
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={styles.button}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      {isEditMode
                        ? t('profileSetup.updating')
                        : t('profileSetup.saving')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      {isEditMode
                        ? t('common.save_changes')
                        : t('common.continue')}
                    </Text>

                    <ArrowRight
                      size={21}
                      color="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==================================================
// FIELD LABEL
// ==================================================

const FieldLabel = ({
  title,
}) => (
  <Text style={styles.label}>
    {title}
  </Text>
);

export default ProfileSetupScreen;

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },

  keyboardScrollContent: {
    paddingBottom: 300,
  },

  header: {
    height: 60,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
  },

  logo: {
    width: 150,
    height: 42,
  },

  headerRight: {
    width: 34,
  },

  divider: {
    height: 1,
    backgroundColor: '#D2DDD0',
  },

  heroImage: {
    width,
    height:
      height < 700
        ? height * 0.24
        : height * 0.25,
    backgroundColor: '#F1FBF8',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop:
      height < 700 ? 14 : 18,
    paddingBottom: 8,
  },

  title: {
    fontSize:
      width < 360 ? 21 : 24,
    lineHeight:
      width < 360 ? 27 : 30,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 8,
    fontSize:
      width < 360 ? 13 : 14,
    lineHeight:
      width < 360 ? 19 : 21,
    color: '#626B7A',
  },

  label: {
    marginTop:
      height < 700 ? 12 : 16,
    marginBottom: 7,
    fontSize:
      width < 360 ? 12.5 : 13.5,
    color: '#202838',
    fontWeight: '800',
  },

  emailBox: {
    height:
      height < 700 ? 48 : 52,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: '#CFE8D8',
    backgroundColor: '#F7FFF9',
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  emailIconBox: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF8EF',
  },

  emailInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    marginLeft: 12,
    paddingVertical: 0,
    fontSize:
      width < 360 ? 13.5 : 14.5,
    color: '#52606D',
    fontWeight: '600',
  },

  verifiedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#E3F8EA',
  },

  verifiedText: {
    fontSize: 10.5,
    color: '#159447',
    fontWeight: '900',
  },

  inputBox: {
    height:
      height < 700 ? 48 : 52,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: '#E1E5EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    marginLeft: 13,
    paddingVertical: 0,
    fontSize:
      width < 360 ? 14 : 15,
    color: '#1F2937',
    fontWeight: '500',
  },

  stepRow: {
    marginTop:
      height < 700 ? 18 : 22,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeStepDot: {
    width: 38,
    height: 7,
    borderRadius: 10,
    backgroundColor: GREEN,
    marginRight: 8,
  },

  stepDot: {
    width: 16,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#EEF1F4',
  },

  stepText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '800',
  },

  button: {
    height:
      height < 700 ? 52 : 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: GREEN,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 7,
  },

  buttonText: {
    fontSize:
      width < 360 ? 15.5 : 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});