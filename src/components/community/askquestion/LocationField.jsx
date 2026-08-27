import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { COLORS, rf } from '../theme';
export default function LocationField({ location, sub, onChange }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <MapPin size={rf(15)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onChange}
        style={styles.changeBtn}
      >
        <Text style={styles.changeText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  sub: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  changeBtn: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  changeText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
});
