import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ArrowRight, Circle } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function BazaarHero() {
  return (
    <ImageBackground
      source={require('../../assets/bazar/bazar-hero.png')}
      style={styles.hero}
      imageStyle={styles.heroImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.title}>Monsoon{'\n'}Farming Essentials</Text>

        <Text style={styles.subtitle}>
          Everything you need for a bountiful harvest
        </Text>

        <TouchableOpacity activeOpacity={0.9} style={styles.button}>
          <Text style={styles.buttonText}>Explore Now</Text>
          <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      <View style={styles.dots}>
        <Circle size={5} color="#FFFFFF" fill="#FFFFFF" />
        <Circle
          size={5}
          color="rgba(255,255,255,0.7)"
          fill="rgba(255,255,255,0.7)"
        />
        <Circle
          size={5}
          color="rgba(255,255,255,0.7)"
          fill="rgba(255,255,255,0.7)"
        />
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  hero: {
    height: width < 360 ? 160 : 178,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },
  heroImage: {
    borderRadius: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    padding: 20,
    width: '66%',
  },
  title: {
    fontSize: rf(22),
    lineHeight: rf(27),
    color: '#111827',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 9,
    fontSize: rf(11),
    lineHeight: rf(15),
    color: '#334155',
    fontWeight: '700',
  },
  button: {
    marginTop: 16,
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#14532D',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  buttonText: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
