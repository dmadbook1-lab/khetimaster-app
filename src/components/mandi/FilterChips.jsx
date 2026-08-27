import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, rf, PAGE_PADDING } from './theme';
export default function FilterChips({ options, value, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
    >
      {options.map(opt => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            activeOpacity={0.85}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: PAGE_PADDING,
  },
  chip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  text: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#64748B',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
