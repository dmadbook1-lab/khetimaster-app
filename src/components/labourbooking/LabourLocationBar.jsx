import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
export default function LabourLocationBar({ onChangePress }) {
  return (
    <View style={styles.row}>
      <MapPin size={rf(16)} color="#16A34A" strokeWidth={2.4} />
      <Text style={styles.location}>Aurangabad, Maharashtra</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onChangePress}
        style={styles.btn}
      >
        <Text style={styles.btnText}>Change Location</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  location: {
    flex: 1,
    marginLeft: 8,
    fontSize: rf(13),
    fontWeight: '600',
    color: '#374151',
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  btnText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: '#16A34A',
  },
});
