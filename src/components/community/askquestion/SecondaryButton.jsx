import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, rf } from '../theme';
export default function SecondaryButton({ label, icon: Icon, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.btn}>
      {Icon && <Icon size={rf(14)} color={COLORS.DARK} strokeWidth={2.4} />}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
});
