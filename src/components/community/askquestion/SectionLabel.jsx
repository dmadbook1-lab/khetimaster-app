import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, rf } from '../theme';
export default function SectionLabel({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}
const styles = StyleSheet.create({
  label: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
    marginBottom: 10,
  },
});
