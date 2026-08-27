import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {Briefcase} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 2));
};

export default function WorkerRegistrationBanner({
  onRegisterPress,
  onFreeBadgePress,
}) {
  return (
    <ImageBackground
      source={require('../../assets/labour/hero3.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
      resizeMode="cover">

      <View style={styles.content}>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Looking for Work?</Text>

          <Text style={styles.subtitle}>
            Find farming jobs near your location.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onRegisterPress}
            style={styles.button}>
            <Briefcase
              size={16}
              color="#FFFFFF"
              strokeWidth={2.3}
            />

            <Text style={styles.buttonText}>Find Work</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 14,
    height: 145,
    borderRadius: 18,
    overflow: 'hidden',
  },

  bannerImage: {
    borderRadius: 18,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#D9F99D',
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#166534',
    fontSize: rf(10),
    fontWeight: '800',
  },

  textContainer: {
    marginLeft: width * 0.36,
    justifyContent: 'center',
  },

  title: {
    color: '#1F2937',
    fontSize: rf(18),
    fontWeight: '900',
    lineHeight: rf(22),
  },

  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: rf(12),
    fontWeight: '600',
    lineHeight: rf(16),
    width: '90%',
  },

  button: {
    marginTop: 14,
    alignSelf: 'flex-start',
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: rf(13),
    fontWeight: '800',
    marginLeft: 8,
  },
});