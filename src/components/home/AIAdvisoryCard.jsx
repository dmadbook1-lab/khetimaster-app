import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function AIAdvisoryCard() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => navigation.navigate('AIGuru')}
      style={styles.cardContainer}
    >
      {/* Background Decorative Glow */}
      <View style={styles.glowCircle} />

      <View style={styles.content}>
        {/* Left Column: Text & CTA */}
        <View style={styles.textContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ AI Powered</Text>
          </View>

          <Text style={styles.title}>AI Guru</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Ask anything about crops, pests & weather
          </Text>

          <View style={styles.askButton}>
            <Text style={styles.askText}>Ask AI Guru</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
        </View>

        {/* Right Column: Animated AI Mascot */}
        <View style={styles.animationWrapper}>
          <LottieView
            source={require('../../assets/animations/ai-kissan.json')}
            autoPlay
            loop
            speed={0.85}
            style={styles.characterAnimation}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 20,
    marginHorizontal: 2,              // ← increased width (was 16)
    height: width < 360 ? 145 : 160,
    borderRadius: 24,
    backgroundColor: '#2B7BFF',        // ← main blue
    borderWidth: 1.2,
    borderColor: '#1A6AE8',            // ← slightly darker blue border
    overflow: 'hidden',
    position: 'relative',

    // iOS Shadow
    shadowColor: '#1A56DB',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    // Android Shadow
    elevation: 6,
  },

  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',  // soft white glow
    right: -20,
    top: -20,
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 8,
  },

  textContainer: {
    flex: 1.2,
    justifyContent: 'center',
    zIndex: 2,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  title: {
    fontSize: width < 360 ? 19 : 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    paddingRight: 4,
  },

  askButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  askText: {
    color: '#2B7BFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  arrowIcon: {
    color: '#2B7BFF',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  animationWrapper: {
    flex: 0.95,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  characterAnimation: {
    width: width < 360 ? 130 : 155,
    height: width < 360 ? 130 : 155,
  },
});