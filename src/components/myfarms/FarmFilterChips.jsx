import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function FarmFilterChips({ filters, activeFilter, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {filters.map(item => {
        const active = activeFilter === item;
        return (
          <TouchableOpacity
            key={item}
            activeOpacity={0.85}
            onPress={() => onChange(item)}
            style={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: {
    marginTop: 18,
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  text: {
    fontSize: rf(13),
    fontWeight: '800',
    color: '#667085',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
