import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ShieldCheck, ArrowRight} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function OwnerRegistrationBanner({
  onRegisterPress,
  onFreeBadgePress,
}) {
  return (
    <ImageBackground
      source={require('../../assets/machinery/owner-registration-hero.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
      resizeMode="cover">
      <LinearGradient
        colors={[
          'rgba(232, 240, 220, 0.15)',
          'rgba(232, 240, 220, 0.55)',
          'rgba(232, 240, 220, 0.90)',
        ]}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={styles.overlay}
      />

      {/* Free Registration Badge (top-right) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onFreeBadgePress}
        style={styles.freeBadge}>
        <ShieldCheck
          size={rf(14)}
          color="#2E7D32"
          strokeWidth={2.4}
        />
        <Text style={styles.freeBadgeText}>Free Registration</Text>
      </TouchableOpacity>

      {/* Right side content */}
      <View style={styles.content}>
        <Text style={styles.title}>Own Machinery?</Text>

        <Text style={styles.subtitle}>
          Rent out your tractor{'\n'}or machinery{'\n'}with ease
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onRegisterPress}
          style={styles.registerButton}>
          <Text style={styles.registerButtonText}>List Your Machine</Text>
          <ArrowRight
            size={rf(18)}
            color="#FFFFFF"
            strokeWidth={2.6}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 175,
    marginTop: 15,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#EAF1DC',
  },
  bannerImage: {
    borderRadius: 17,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  freeBadge: {
    position: 'absolute',

    left: 12,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CDE3B8',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 2,
  },
  freeBadgeText: {
    fontSize: rf(11),
    fontWeight: '700',
    color: '#2E7D32',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(22),
    lineHeight: rf(26),
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: -0.3,
    textAlign: 'right',
  },
  subtitle: {
    marginTop: 6,
    fontSize: rf(13),
    lineHeight: rf(18),
    fontWeight: '600',
    color: '#2E3A2A',
    textAlign: 'right',
  },
  registerButton: {
    marginTop: 12,
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 18,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2E7D32',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});