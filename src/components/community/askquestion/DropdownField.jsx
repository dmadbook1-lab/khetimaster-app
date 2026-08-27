import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Search, ChevronDown} from 'lucide-react-native';
import {COLORS, rf} from '../theme';

export default function DropdownField({value, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.wrap}>
      <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
      <Text style={styles.value}>{value}</Text>
      <ChevronDown size={rf(15)} color={COLORS.MUTED} strokeWidth={2.3} />
      <ChevronDown size={rf(15)} color={COLORS.MUTED} strokeWidth={2.3} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  value: {flex: 1, fontSize: rf(12), fontWeight: '700', color: COLORS.DARK},
});