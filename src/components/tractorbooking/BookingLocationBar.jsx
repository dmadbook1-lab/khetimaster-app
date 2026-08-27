import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function BookingLocationBar({ onChangePress }) {
  return (
    <View style={styles.container}>
      <MapPin size={rf(18)} color={GREEN} strokeWidth={2.4} />

      <Text numberOfLines={1} style={styles.location}>
        Aurangabad, Maharashtra
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onChangePress}
        style={styles.changeButton}
      >
        <Text style={styles.changeText}>Change</Text>

        <ChevronDown size={rf(15)} color={GREEN} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: 43,
    borderRadius: 8,
    backgroundColor: '#E8F4ED',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    flex: 1,
    marginLeft: 9,
    fontSize: rf(13),
    fontWeight: '900',
    color: GREEN,
  },
  changeButton: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: GREEN,
  },
});
