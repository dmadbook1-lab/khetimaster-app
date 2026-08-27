import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Mic } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const DARK = '#1B1B1B';
const MUTED = '#768195';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AIReadySection({ onVoicePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.aiVisualWrapper}>
        <View style={styles.ringOuter} />
        <View style={styles.ringMiddle} />
        <View style={styles.ringInner} />

        <View style={styles.imageCircle}>
          <Image
            source={require('../../assets/images/ai-guru.png')}
            style={styles.aiImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <Text style={styles.title}>AI Guru</Text>

      <Text style={styles.description}>
        Ask me about crops, weather, diseases,{'\n'}
        irrigation, fertilizers, mandi prices, and{'\n'}
        government schemes.
      </Text>

      <TouchableOpacity
        activeOpacity={0.86}
        onPress={onVoicePress}
        style={styles.micButton}
      >
        <Mic size={rf(28)} color="#FFFFFF" strokeWidth={2.4} />
      </TouchableOpacity>

      <Text style={styles.voiceLabel}>Tap to Speak</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 25,
  },
  aiVisualWrapper: {
    width: 165,
    height: 165,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#CDEFD8',
  },
  ringMiddle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#BEE9CD',
  },
  ringInner: {
    position: 'absolute',
    width: 103,
    height: 103,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: '#80D79E',
  },
  imageCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DDF7E6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  aiImage: {
    width: 94,
    height: 94,
  },
  title: {
    marginTop: 18,
    fontSize: rf(24),
    lineHeight: rf(29),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.45,
  },
  description: {
    marginTop: 9,
    fontSize: rf(13),
    lineHeight: rf(21),
    fontWeight: '500',
    color: MUTED,
    textAlign: 'center',
  },
  micButton: {
    width: 65,
    height: 65,
    marginTop: 30,
    borderRadius: 33,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 7,
  },
  voiceLabel: {
    marginTop: 12,
    fontSize: rf(12),
    fontWeight: '800',
    color: MUTED,
  },
});
