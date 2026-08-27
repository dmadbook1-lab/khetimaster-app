import React, { useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  verifyOtp,
  sendOtp,
  selectIsLoading,
  selectAuthError,
  clearAuthError,
} from '../../redux/slices/authSlice';
const { width, height } = Dimensions.get('window');
const GREEN = '#178C45';
const DARK = '#141A1F';
const OtpScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const email = route?.params?.email || '';
  const isLoading = useSelector(selectIsLoading);
  const authError = useSelector(selectAuthError);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(28);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputs = useRef([]);
  const scrollRef = useRef(null);
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(previous => {
        if (previous <= 0) {
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: 260,
          animated: true,
        });
      }, 100);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }, 100);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const entered = otp.filter(value => value !== '').length;
  const progress = entered / 6;
  const isComplete = entered === 6;
  const handleChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const updatedOtp = [...otp];
    updatedOtp[index] = cleaned;
    setOtp(updatedOtp);
    if (cleaned && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    if (cleaned && index === 5) {
      const completeOtp = updatedOtp.join('');
      if (completeOtp.length === 6) {
        setTimeout(() => {
          handleVerify(completeOtp);
        }, 150);
      }
    }
  };
  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };
  const handleVerify = async customOtp => {
    if (isLoading) {
      return;
    }
    const enteredOtp = customOtp || otp.join('');
    if (enteredOtp.length !== 6) {
      return;
    }
    if (!email) {
      return;
    }
    try {
      Keyboard.dismiss();
      dispatch(clearAuthError());
      const result = await dispatch(
        verifyOtp({
          email: email.trim().toLowerCase(),
          otp: enteredOtp,
        }),
      ).unwrap();
      if (result.success && result.isNewUser && !result.profileCompleted) {
        navigation.replace('ProfileSetup', {
          email: email.trim().toLowerCase(),
        });
        return;
      }
      if (result.success && result.profileCompleted) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
            },
          ],
        });
      }
    } catch (error) {
      console.log('OTP verification error:', error);
    }
  };
  const handleResend = async () => {
    if (timer > 0 || isLoading || !email) {
      return;
    }
    try {
      dispatch(clearAuthError());
      await dispatch(sendOtp(email.trim().toLowerCase())).unwrap();
      setOtp(['', '', '', '', '', '']);
      setTimer(28);
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.log('Resend OTP error:', error);
    }
  };
  const handleChangeEmail = () => {
    if (isLoading) {
      return;
    }
    dispatch(clearAuthError());
    Keyboard.dismiss();
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && styles.keyboardScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleChangeEmail}
              disabled={isLoading}
              style={styles.backBtn}
            >
              <ArrowLeft size={23} color="#087235" strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={styles.timerText}>
              00:
              {String(timer).padStart(2, '0')}
            </Text>

            <View style={styles.headerRight} />
          </View>

          <View style={styles.divider} />

          <Image
            source={require('../../assets/images/otp.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <Text style={styles.title}>
              Verify Your <Text style={styles.greenText}>Email</Text>
            </Text>

            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={event => handleKeyPress(event, index)}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={1}
                  editable={!isLoading}
                  selectTextOnFocus
                  textAlign="center"
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : styles.otpBoxEmpty,
                    authError && styles.otpBoxError,
                  ]}
                />
              ))}
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {entered} of 6 digits entered
              </Text>

              <Text style={styles.percentText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>

            {authError ? (
              <Text style={styles.errorText}>{authError}</Text>
            ) : null}

            {timer > 0 ? (
              <Text style={styles.resendText}>
                Resend OTP in{' '}
                <Text style={styles.resendGreen}>
                  00:
                  {String(timer).padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleResend}
                disabled={isLoading}
              >
                <Text style={[styles.resendText, styles.resendGreen]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleChangeEmail}
              disabled={isLoading}
            >
              <Text style={styles.changeText}>Wrong email? Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleVerify()}
              disabled={!isComplete || isLoading}
            >
              <LinearGradient
                colors={
                  isComplete ? ['#178C45', '#25C866'] : ['#8CC5A3', '#8BC7A4']
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
                    <ActivityIndicator size="small" color="#FFFFFF" />

                    <Text style={styles.buttonText}>Verifying...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>Verify & Continue</Text>

                    <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.4} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.autoRow}>
              <View style={styles.greenDot} />

              <Zap size={13} color="#FF8A2A" fill="#FF8A2A" />

              <Text style={styles.autoText}>Auto-detecting OTP...</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default OtpScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  keyboardScrollContent: {
    paddingBottom: 260,
  },
  header: {
    height: 62,
    paddingHorizontal: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 18,
    color: '#087235',
    fontWeight: '900',
  },
  headerRight: {
    width: 36,
  },
  divider: {
    height: 1,
    backgroundColor: '#D2DDD0',
  },
  heroImage: {
    width,
    height: height * 0.39,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 26,
  },
  title: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.7,
  },
  greenText: {
    color: '#21A957',
  },
  subtitle: {
    marginTop: 15,
    fontSize: 15.5,
    lineHeight: 24,
    color: '#49515A',
  },
  emailText: {
    color: '#0B8E3D',
    fontWeight: '900',
  },
  otpRow: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: (width - 96) / 6,
    height: 50,
    borderRadius: 11,
    fontSize: 24,
    fontWeight: '800',
    color: '#26333F',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  otpBoxFilled: {
    borderWidth: 1.8,
    borderColor: GREEN,
  },
  otpBoxEmpty: {
    borderWidth: 1.3,
    borderColor: '#EEF0F4',
    backgroundColor: '#FCFCFD',
  },
  otpBoxError: {
    borderColor: '#D14343',
  },
  progressInfo: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#98A2B3',
    fontSize: 13.5,
    fontWeight: '700',
  },
  percentText: {
    color: GREEN,
    fontSize: 13.5,
    fontWeight: '900',
  },
  progressTrack: {
    marginTop: 15,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#F0F1F3',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 10,
  },
  errorText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#D14343',
    fontSize: 13,
    fontWeight: '700',
  },
  resendText: {
    marginTop: 25,
    textAlign: 'center',
    fontSize: 15.5,
    color: '#384237',
    fontWeight: '800',
  },
  resendGreen: {
    color: '#087235',
    fontWeight: '900',
  },
  changeText: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 15.5,
    color: '#087235',
    fontWeight: '900',
  },
  button: {
    marginTop: 38,
    height: 62,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 11,
    shadowColor: GREEN,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 7,
  },
  buttonText: {
    fontSize: 17.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  autoRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginRight: 10,
  },
  autoText: {
    marginLeft: 7,
    color: '#A2ABBA',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
