import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Zap } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const isSmall = width < 370;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AgriHeroBanner() {
  return (
    <ImageBackground
      source={require('../../assets/bazar/bazar-hero.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.fastBadge}>
        <Zap size={13} color="#16883E" fill="#16883E" />
        <Text style={styles.fastText}>Fast Delivery</Text>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          Top Agri Products Delivered Fast
        </Text>

        <Text numberOfLines={1} style={styles.subtitle}>
          Quality guaranteed • Farmer trusted
        </Text>

        <TouchableOpacity activeOpacity={0.9} style={styles.button}>
          <Text style={styles.buttonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  banner: {
    marginTop: 20,
    minHeight: isSmall ? 148 : 162,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#14532D',
  },
  bannerImage: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  fastBadge: {
    position: 'absolute',
    top: 12,
    left: 14,
    height: 26,
    borderRadius: 9,
    paddingHorizontal: 9,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fastText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#16883E',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: 46,
    paddingBottom: 18,
    width: isSmall ? '84%' : '78%',
  },
  title: {
    fontSize: rf(isSmall ? 20 : 22),
    lineHeight: rf(isSmall ? 24 : 27),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.45,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: 7,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
  },
  button: {
    marginTop: 13,
    height: 34,
    borderRadius: 11,
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#16883E',
  },
});
