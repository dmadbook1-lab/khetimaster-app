import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const {height} = Dimensions.get('window');

const GREEN = '#159447';
const DARK = '#1F2937';
const GRAY = '#6B7280';

const OnboardingScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF9" />

      <View style={styles.container}>
        <View style={styles.bgCircleOne} />
        <View style={styles.bgCircleTwo} />

        {/* Hero Section */}
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
              <Text style={styles.topTagText}>AI Assistant</Text>
            </View>

            <View style={styles.floatingBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.floatingBadgeText}>24/7 Smart Support</Text>
            </View>
          </View>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomCard}>
          <View style={styles.label}>
            <Text style={styles.labelText}>MODERN FARMING</Text>
          </View>

          <Text style={styles.title}>
            Your Personal{'\n'}
            <Text style={styles.highlight}>Farm Advisor</Text>
          </Text>

          <Text style={styles.description}>
            Ask farming questions, get crop recommendations, and receive
            weather-smart guidance instantly with AI-powered support.
          </Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>✦</Text>
              </View>
              <Text style={styles.featureTitle}>Smart Advice</Text>
              <Text style={styles.featureSub}>Quick crop guidance</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>☁</Text>
              </View>
              <Text style={styles.featureTitle}>Weather Based</Text>
              <Text style={styles.featureSub}>Plan with confidence</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🌱</Text>
              </View>
              <Text style={styles.featureTitle}>Crop Care</Text>
              <Text style={styles.featureSub}>Health & growth tips</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>⏱</Text>
              </View>
              <Text style={styles.featureTitle}>Always Available</Text>
              <Text style={styles.featureSub}>Anytime help</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.replace('language')}>
            <LinearGradient
              colors={['#118A3B', '#2AD56D']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
              <View style={styles.arrowWrap}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginGreen}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FFF9',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7FFF9',
  },

  bgCircleOne: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(42, 213, 109, 0.10)',
  },

  bgCircleTwo: {
    position: 'absolute',
    top: 90,
    right: -45,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(21, 148, 71, 0.07)',
  },

  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  imageCard: {
    height: height * 0.43,
    maxHeight: 360,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5D2A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 6,
  },

  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  image: {
    width: '88%',
    height: '88%',
  },

  topTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(21, 148, 71, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },

  topTagText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
  },

  floatingBadge: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },

  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2AD56D',
    marginRight: 8,
  },

  floatingBadgeText: {
    color: DARK,
    fontSize: 13,
    fontWeight: '700',
  },

  bottomCard: {
    flex: 1,
    marginTop: -24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },

  label: {
    alignSelf: 'center',
    backgroundColor: '#EAFBF0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },

  labelText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  title: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },

  highlight: {
    color: GREEN,
  },

  description: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 25,
    color: GRAY,
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },

  featureCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },

  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  featureIconText: {
    fontSize: 16,
  },

  featureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: DARK,
  },

  featureSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
  },

  button: {
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  arrowWrap: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -1,
  },

  loginText: {
    marginTop: 18,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },

  loginGreen: {
    color: GREEN,
    fontWeight: '800',
  },
});