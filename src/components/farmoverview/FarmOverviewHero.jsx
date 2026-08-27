import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ArrowLeft, MoreVertical, MapPin} from 'lucide-react-native';
import {defaultFarm} from './data';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmOverviewHero({navigation, farm}) {
  const item = farm || defaultFarm;

  return (
    <ImageBackground source={item.image} style={styles.hero} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}>
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <MoreVertical size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Healthy</Text>
        </View>

        <Text style={styles.title}>{item.title || defaultFarm.title}</Text>

        <View style={styles.locationRow}>
          <MapPin size={15} color="#FFFFFF" strokeWidth={2.3} />
          <Text style={styles.location}>
            {item.location || defaultFarm.location}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 292,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  topRow: {
    marginTop: 14,
    paddingHorizontal: width * 0.055,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    left: width * 0.055,
    right: width * 0.055,
    bottom: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#16883E',
    fontSize: rf(12),
    fontWeight: '900',
  },
  title: {
    marginTop: 12,
    fontSize: rf(30),
    lineHeight: rf(36),
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.75,
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: rf(13),
    color: '#FFFFFF',
    fontWeight: '700',
  },
});