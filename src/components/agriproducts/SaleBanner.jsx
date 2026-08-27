import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CloudRain, ArrowRight} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const isSmall = width < 370;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function SaleBanner() {
  return (
    <ImageBackground
      source={require('../../assets/bazar/sales-banner.jpg')}
      resizeMode="cover"
      imageStyle={styles.image}
      style={styles.banner}>
      <LinearGradient
        colors={[
          'rgba(154,52,18,0.94)',
          'rgba(249,115,22,0.84)',
          'rgba(249,115,22,0.58)',
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <CloudRain size={isSmall ? 19 : 22} color="#FFFFFF" strokeWidth={2.4} />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.tag}>LIMITED TIME OFFER</Text>

          <Text numberOfLines={2} style={styles.title}>
            Monsoon Mega Sale
          </Text>

          <Text numberOfLines={2} style={styles.sub}>
            Save big on fertilizers, pesticides, seeds & crop nutrition.
          </Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.button}>
            <Text style={styles.buttonText}>Shop Now</Text>
            <ArrowRight size={14} color="#F97316" strokeWidth={2.8} />
          </TouchableOpacity>
        </View>

        <View style={styles.discountCircle}>
          <Text style={styles.percent}>20%</Text>
          <Text style={styles.off}>OFF</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 34,
    minHeight: isSmall ? 164 : 178,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#EA580C',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },

  image: {
    borderRadius: 24,
  },

  content: {
    flex: 1,
    paddingHorizontal: isSmall ? 15 : 18,
    paddingVertical: isSmall ? 16 : 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconBox: {
    width: isSmall ? 38 : 44,
    height: isSmall ? 38 : 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  textBox: {
    flex: 1,
    paddingRight: isSmall ? 64 : 86,
  },

  tag: {
    fontSize: rf(9),
    color: '#FDE68A',
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  title: {
    marginTop: 6,
    fontSize: rf(isSmall ? 22 : 25),
    lineHeight: rf(isSmall ? 26 : 30),
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  sub: {
    marginTop: 7,
    fontSize: rf(11),
    lineHeight: rf(16),
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '700',
  },

  button: {
    marginTop: 13,
    height: isSmall ? 34 : 38,
    borderRadius: 19,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonText: {
    marginRight: 6,
    fontSize: rf(12),
    color: '#F97316',
    fontWeight: '900',
  },

  discountCircle: {
    position: 'absolute',
    right: isSmall ? 12 : 16,
    top: isSmall ? 15 : 18,
    width: isSmall ? 64 : 76,
    height: isSmall ? 64 : 76,
    borderRadius: isSmall ? 32 : 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },

  percent: {
    fontSize: rf(isSmall ? 19 : 23),
    color: '#EA580C',
    fontWeight: '900',
    lineHeight: rf(isSmall ? 21 : 25),
  },

  off: {
    marginTop: -1,
    fontSize: rf(9),
    color: '#EA580C',
    fontWeight: '900',
    letterSpacing: 1,
  },
});