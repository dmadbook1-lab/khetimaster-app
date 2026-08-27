import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  X,
  ShieldCheck,
  Zap,
  Users,
  Info,
  Mail,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendOtp,
  selectIsLoading,
  selectAuthError,
} from '../../redux/slices/authSlice';
const { width, height } = Dimensions.get('window');
const GREEN = '#159447';
const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const authError = useSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const isValidEmail = value => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim().toLowerCase());
  };
  const handleOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      return;
    }
    try {
      const result = await dispatch(sendOtp(normalizedEmail)).unwrap();
      if (result.success) {
        navigation.navigate('Otp', {
          email: normalizedEmail,
        });
      }
    } catch (error) {
      console.log('Send OTP error:', error);
    }
  };
  const trimmedEmail = email.trim();
  const canContinue =
    trimmedEmail.length > 0 && isValidEmail(trimmedEmail) && !isLoading;
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {}
          {}
          {}

          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('language')}
              style={styles.backBtn}
            >
              <ArrowLeft size={23} color="#087235" strokeWidth={2.5} />
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/logoo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <View style={styles.headerRight} />
          </View>

          <View style={styles.divider} />

          {}
          {}
          {}

          <Image
            source={require('../../assets/images/login.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {}
          {}
          {}

          <View style={styles.content}>
            <Text style={styles.title}>
              Welcome to{'\n'}
              <Text style={styles.greenText}>KhetiMaster 👋</Text>
            </Text>

            <Text style={styles.subtitle}>
              Enter your email address to continue
            </Text>

            {}
            {}
            {}

            <Text style={styles.label}>Email Address</Text>

            {}
            {}
            {}

            <View
              style={[
                styles.inputBox,
                email.length > 0 && !isValidEmail(email)
                  ? styles.inputBoxError
                  : null,
              ]}
            >
              <View style={styles.emailIconBox}>
                <Mail size={21} color="#159447" strokeWidth={2.2} />
              </View>

              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                placeholder="example@gmail.com"
                placeholderTextColor="#C8D1DF"
                style={styles.input}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={canContinue ? handleOtp : undefined}
              />

              {email.length > 0 && (
                <TouchableOpacity
                  onPress={() => setEmail('')}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <View style={styles.clearCircle}>
                    <X size={15} color="#A7B0C2" strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {}
            {}
            {}

            {email.length > 0 && !isValidEmail(email) && (
              <Text style={styles.validationText}>
                Please enter a valid email address
              </Text>
            )}

            {authError && <Text style={styles.errorText}>{authError}</Text>}

            {}
            {}
            {}

            <View style={styles.infoRow}>
              <Info size={14} color="#738096" />

              <Text style={styles.infoText}>
                We'll send you a verification code
              </Text>
            </View>

            {}
            {}
            {}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleOtp}
              disabled={!canContinue}
            >
              <LinearGradient
                colors={
                  canContinue ? ['#178C45', '#22B862'] : ['#B8D8C4', '#C5E1CE']
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

                    <Text style={styles.buttonText}>Sending OTP...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonText}>Get OTP</Text>

                    <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.4} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {}
            {}
            {}

            <View style={styles.orRow}>
              <View style={styles.orLine} />

              <Text style={styles.orText}>OR</Text>

              <View style={styles.orLine} />
            </View>

            {}
            {}
            {}

            <View style={styles.featuresRow}>
              <Feature
                icon={<ShieldCheck size={23} color={GREEN} />}
                bg="#EFFFF5"
                border="#CFF6DD"
                title="Secure Login"
              />

              <Feature
                icon={<Zap size={23} color="#FF8A2A" />}
                bg="#FFF6EB"
                border="#FFE1BD"
                title="Quick Verification"
              />

              <Feature
                icon={<Users size={23} color="#4387FF" />}
                bg="#EEF6FF"
                border="#D6E8FF"
                title="Trusted by Farmers"
              />
            </View>

            {}
            {}
            {}

            <Text style={styles.termsText}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.termsGreen}>Terms of Service</Text> and{' '}
              <Text style={styles.termsGreen}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const Feature = ({ icon, bg, border, title }) => {
  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureCircle,
          {
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      >
        {icon}
      </View>

      <Text style={styles.featureText}>{title}</Text>
    </View>
  );
};
export default LoginScreen;
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
    paddingBottom: 24,
  },
  header: {
    height: 62,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  headerRight: {
    width: 36,
  },
  logoImage: {
    width: 165,
    height: 42,
  },
  divider: {
    height: 1,
    backgroundColor: '#D2DDD0',
  },
  heroImage: {
    width,
    height: height * 0.32,
    marginTop: 6,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 10,
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    color: '#16372C',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  greenText: {
    color: '#21A957',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
    color: '#6A7488',
    fontSize: 14.5,
    lineHeight: 21,
  },
  label: {
    marginTop: 24,
    marginBottom: 9,
    fontSize: 14.5,
    color: '#2F3D56',
    fontWeight: '800',
  },
  inputBox: {
    height: 62,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DDEFE4',
    backgroundColor: '#F7FFF9',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputBoxError: {
    borderColor: '#F3B8B8',
  },
  emailIconBox: {
    width: 58,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF9F1',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5EAF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  validationText: {
    marginTop: 7,
    color: '#D14343',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 8,
    color: '#D14343',
    fontSize: 12.5,
    fontWeight: '700',
  },
  infoRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 9,
    color: '#778397',
    fontSize: 12.5,
  },
  button: {
    marginTop: 24,
    height: 62,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  orRow: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF0F4',
  },
  orText: {
    marginHorizontal: 18,
    color: '#98A2B3',
    fontSize: 14,
    fontWeight: '800',
  },
  featuresRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '31%',
    alignItems: 'center',
  },
  featureCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    marginTop: 9,
    textAlign: 'center',
    color: '#64728A',
    fontSize: 11.8,
    lineHeight: 15,
    fontWeight: '800',
  },
  termsText: {
    marginTop: 31,
    textAlign: 'center',
    color: '#90A0B8',
    fontSize: 12.8,
    lineHeight: 20,
  },
  termsGreen: {
    color: '#129143',
    fontWeight: '900',
  },
});
