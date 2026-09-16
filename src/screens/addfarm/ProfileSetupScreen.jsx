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

import { SafeAreaView } from 'react-native-safe-area-context';

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

const { width, height } =
  Dimensions.get('window');

const GREEN = '#159447';
const DARK = '#151C2B';

const ProfileSetupScreen = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();

  const scrollRef = useRef(null);

  const reduxEmail =
    useSelector(selectEmail);

  const user =
    useSelector(selectUser);

  const routeEmail =
    route?.params?.email || '';

  const email =
    reduxEmail || routeEmail;

  const isLoading =
    useSelector(selectIsLoading);

  /*
  |--------------------------------------------------------------------------
  | EDIT MODE
  |--------------------------------------------------------------------------
  */

  const isEditMode =
    route?.params?.mode === 'edit';

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | LOAD EXISTING USER DATA
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | KEYBOARD
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | FOCUS / SCROLL
  |--------------------------------------------------------------------------
  */

  const focusField = y => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 120);
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE / CONTINUE
  |--------------------------------------------------------------------------
  */

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

      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!phoneValue) {
        Alert.alert(
          'Required',
          'Please enter your phone number.',
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
          'Invalid Phone Number',
          'Please enter a valid phone number.',
        );

        return;
      }

      if (!fullName) {
        Alert.alert(
          'Required',
          'Please enter your full name.',
        );

        return;
      }

      if (!state) {
        Alert.alert(
          'Required',
          'Please enter your state.',
        );

        return;
      }

      if (!districtValue) {
        Alert.alert(
          'Required',
          'Please enter your district.',
        );

        return;
      }

      if (!talukaValue) {
        Alert.alert(
          'Required',
          'Please enter your taluka.',
        );

        return;
      }

      if (!villageValue) {
        Alert.alert(
          'Required',
          'Please enter your village.',
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE MODE
      |--------------------------------------------------------------------------
      */

      if (!isEditMode && !email) {
        Alert.alert(
          'Session Error',
          'Email information is missing. Please login again.',
        );

        return;
      }

      try {
        Keyboard.dismiss();

        /*
        |--------------------------------------------------------------------------
        | EDIT PROFILE
        |--------------------------------------------------------------------------
        */

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
              'Profile Updated',
              'Your profile has been updated successfully.',
              [
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.goBack(),
                },
              ],
            );

            return;
          }

          Alert.alert(
            'Profile',
            result?.message ||
              'Unable to update your profile.',
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE PROFILE
        |--------------------------------------------------------------------------
        */

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
          'Profile Setup',
          result?.message ||
            'Unable to complete your profile.',
        );
      } catch (error) {
        console.log(
          'PROFILE ERROR:',
          error,
        );

        Alert.alert(
          isEditMode
            ? 'Profile Update Failed'
            : 'Profile Setup Failed',

          typeof error === 'string'
            ? error
            : error?.message ||
                'Unable to save your profile.',
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | BACK
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    if (isLoading) {
      return;
    }

    Keyboard.dismiss();

    navigation.goBack();
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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
          {/* HEADER */}

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

          {/* HERO */}

          <Image
            source={require('../../assets/images/profile1.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <View style={styles.content}>
            {/* TITLE */}

            <Text style={styles.title}>
              {isEditMode
                ? 'Edit Your Profile'
                : 'Let’s Get to Know You'}
            </Text>

            <Text style={styles.subtitle}>
              {isEditMode
                ? 'Keep your personal and location details up to date.'
                : 'Help us personalize weather updates, mandi prices, and farming recommendations.'}
            </Text>

            {/* EMAIL */}

            <FieldLabel title="Email Address" />

            <View style={styles.emailBox}>
              <View
                style={styles.emailIconBox}
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
                style={styles.emailInput}
                placeholder="Email address"
                placeholderTextColor="#A3ADBD"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View
                style={styles.verifiedBadge}
              >
                <Text
                  style={styles.verifiedText}
                >
                  Verified
                </Text>
              </View>
            </View>

            {/* PHONE */}

            <FieldLabel title="Phone Number" />

            <View style={styles.inputBox}>
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
                placeholder="Enter your phone number"
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

            {/* FULL NAME */}

            <FieldLabel title="Full Name" />

            <View style={styles.inputBox}>
              <User
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
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

            {/* STATE */}

            <FieldLabel title="State" />

            <View style={styles.inputBox}>
              <Map
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={stateName}
                onChangeText={setStateName}
                placeholder="Enter your state"
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() =>
                  focusField(220)
                }
              />
            </View>

            {/* DISTRICT */}

            <FieldLabel title="District" />

            <View style={styles.inputBox}>
              <MapPin
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={district}
                onChangeText={setDistrict}
                placeholder="Enter your district"
                placeholderTextColor="#A3ADBD"
                style={styles.input}
                editable={!isLoading}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() =>
                  focusField(290)
                }
              />
            </View>

            {/* TALUKA */}

            <FieldLabel title="Taluka" />

            <View style={styles.inputBox}>
              <MapPin
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={taluka}
                onChangeText={setTaluka}
                placeholder="Enter your taluka"
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

            {/* VILLAGE */}

            <FieldLabel title="Village" />

            <View style={styles.inputBox}>
              <Home
                size={18}
                color="#7D8796"
                strokeWidth={2.1}
              />

              <TextInput
                value={village}
                onChangeText={setVillage}
                placeholder="Enter your village"
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

            {/* STEP */}

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
                  Step 1 of 2
                </Text>
              </View>
            )}

            {/* BUTTON */}

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
                        ? 'Updating Profile...'
                        : 'Saving Profile...'}
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
                        ? 'Save Changes'
                        : 'Continue'}
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

const FieldLabel = ({
  title,
}) => (
  <Text style={styles.label}>
    {title}
  </Text>
);

export default ProfileSetupScreen;

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