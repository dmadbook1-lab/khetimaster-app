import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Menu, MapPin, Bell } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const DARK = '#111827';
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function BazaarHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity activeOpacity={0.8} style={styles.headerIcon}>
        <Menu size={25} color={DARK} strokeWidth={2.3} />
      </TouchableOpacity>

      <View style={styles.locationBox}>
        <Text style={styles.locationLabel}>Your Location⌄</Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color={GREEN} fill={GREEN} />
          <Text style={styles.location}>Punjab, India</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.headerIcon}>
        <Bell size={22} color={DARK} strokeWidth={2.2} />
        <View style={styles.badgeDot} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBox: {
    flex: 1,
    marginLeft: 4,
  },
  locationLabel: {
    fontSize: rf(10),
    color: '#64748B',
    fontWeight: '700',
  },
  locationRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
