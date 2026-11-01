import React, {useEffect, useRef} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import {hasChosenLanguage} from '../../utils/languageUtils';

const {height} = Dimensions.get('window');
const GREEN = '#159447';
const DARK = '#1F2937';
const GRAY = '#6B7280';
const featureCards = [
  {icon: '✦', key: 'advice'},
  {icon: '☁', key: 'weather'},
  {icon: '🌱', key: 'care'},
  {icon: '⏱', key: 'always'},
];

const OnboardingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const featureScrollRef = useRef(null);
  const featureIndex = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      featureIndex.current = (featureIndex.current + 1) % featureCards.length;
      featureScrollRef.current?.scrollTo({
        x: featureIndex.current * 172,
        animated: true,
      });
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  // Like CropGen, a language is always picked before the first login
  const goToLogin = async () => {
    if (await hasChosenLanguage()) {
      navigation.replace('Login');
      return;
    }
    navigation.replace('language', {redirectTo: 'Login'});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF9" />
      <View style={styles.container}>
      <View style={styles.bgCircleOne} />
      <View style={styles.bgCircleTwo} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.imageCard}>
            <LinearGradient
              colors={['#F4FFF8', '#E9FFF1']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.imageGradient}
            />
            <Image
              source={require('../../assets/images/onboard2.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.topTag}>
              <Text style={styles.topTagText}>{t('onboarding.ai_assistant')}</Text>
            </View>
            <View style={styles.floatingBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.floatingBadgeText}>{t('onboarding.smart_support')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.label}>
            <Text style={styles.labelText}>{t('onboarding.label')}</Text>
          </View>
          <Text style={styles.title}>
            {t('onboarding.title_line1')}
            {'\n'}
            <Text style={styles.highlight}>{t('onboarding.title_line2')}</Text>
          </Text>
          <Text style={styles.description}>
            {t('onboarding.description')}
          </Text>
          <ScrollView
            ref={featureScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureRow}>
            {featureCards.map(card => (
              <View key={card.key} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{card.icon}</Text>
                <View>
                  <Text style={styles.featureTitle}>
                    {t(`onboarding.feature_${card.key}_title`)}
                  </Text>
                  <Text style={styles.featureText}>
                    {t(`onboarding.feature_${card.key}_text`)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.replace('language', {redirectTo: 'Login'})}>
            <LinearGradient
              colors={['#118A3B', '#2AD56D']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.button}>
              <Text style={styles.buttonText}>{t('onboarding.get_started')}</Text>
              <View style={styles.arrowWrap}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={goToLogin}>
            <Text style={styles.loginText}>
              {t('onboarding.have_account')}{' '}
              <Text style={styles.loginGreen}>{t('onboarding.login')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F7FFF9'},
  container: {flex: 1, backgroundColor: '#F7FFF9'},
  scrollContent: {paddingBottom: 24},
  bgCircleOne: {
    position: 'absolute', top: -60, left: -40, width: 170, height: 170,
    borderRadius: 85, backgroundColor: 'rgba(42, 213, 109, 0.10)',
  },
  bgCircleTwo: {
    position: 'absolute', top: 90, right: -45, width: 130, height: 130,
    borderRadius: 65, backgroundColor: 'rgba(21, 148, 71, 0.07)',
  },
  heroSection: {paddingHorizontal: 20, paddingTop: 10},
  imageCard: {
    height: height * 0.43, maxHeight: 360, borderRadius: 32, overflow: 'hidden',
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0B5D2A', shadowOpacity: 0.08, shadowRadius: 18,
    shadowOffset: {width: 0, height: 10}, elevation: 6,
  },
  imageGradient: {...StyleSheet.absoluteFillObject},
  image: {width: '88%', height: '88%'},
  topTag: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(21, 148, 71, 0.12)', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 18,
  },
  topTagText: {color: GREEN, fontSize: 12, fontWeight: '800'},
  floatingBadge: {
    position: 'absolute', left: 16, bottom: 16, flexDirection: 'row',
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: {width: 0, height: 4}, elevation: 3,
  },
  badgeDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#2AD56D', marginRight: 8,
  },
  floatingBadgeText: {color: DARK, fontSize: 13, fontWeight: '700'},
  bottomCard: {
    marginTop: -24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 34,
    borderTopRightRadius: 34, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24,
  },
  label: {
    alignSelf: 'center', backgroundColor: '#EAFBF0', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20, marginBottom: 16,
  },
  labelText: {color: GREEN, fontSize: 12, fontWeight: '800', letterSpacing: 0.8},
  title: {fontSize: 31, lineHeight: 39, fontWeight: '900', color: DARK, textAlign: 'center'},
  highlight: {color: GREEN},
  description: {
    marginTop: 14, fontSize: 16, lineHeight: 25, color: GRAY,
    textAlign: 'center', paddingHorizontal: 4,
  },
  featureRow: {paddingTop: 22, paddingBottom: 2, paddingRight: 12},
  featureCard: {
    width: 160,
    minHeight: 76,
    marginRight: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F5FBF6',
    borderWidth: 1,
    borderColor: '#DDEFE1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 32,
    height: 32,
    marginRight: 9,
    borderRadius: 16,
    backgroundColor: '#DDF4E3',
    color: GREEN,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 17,
  },
  featureTitle: {color: DARK, fontSize: 11, fontWeight: '800'},
  featureText: {marginTop: 3, color: GRAY, fontSize: 9.5},
  button: {
    marginTop: 42,
    height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', shadowColor: GREEN, shadowOpacity: 0.24,
    shadowRadius: 16, shadowOffset: {width: 0, height: 8}, elevation: 6,
  },
  buttonText: {color: '#FFFFFF', fontSize: 17, fontWeight: '800'},
  arrowWrap: {
    marginLeft: 10, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  arrow: {color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: -1},
  loginText: {
    marginTop: 18, textAlign: 'center', color: '#94A3B8', fontSize: 14, fontWeight: '500',
  },
  loginGreen: {color: GREEN, fontWeight: '800'},
});

export default OnboardingScreen;
