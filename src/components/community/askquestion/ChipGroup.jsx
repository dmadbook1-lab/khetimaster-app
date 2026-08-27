import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, rf } from '../theme';
export default function ChipGroup({ options, value, onChange, multi = false }) {
  const isSelected = opt => (multi ? value?.includes(opt) : value === opt);
  const toggle = opt => {
    if (multi) {
      const next = value?.includes(opt)
        ? value.filter(x => x !== opt)
        : [...(value || []), opt];
      onChange(next);
    } else {
      onChange(opt);
    }
  };
  return (
    <View style={styles.row}>
      {options.map(opt => {
        const active = isSelected(opt);
        return (
          <TouchableOpacity
            key={opt}
            activeOpacity={0.85}
            onPress={() => toggle(opt)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  text: {
    fontSize: rf(11.5),
    fontWeight: '900',
    color: '#64748B',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
