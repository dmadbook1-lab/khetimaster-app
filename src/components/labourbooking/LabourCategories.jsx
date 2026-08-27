import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function LabourCategories({categories, activeCategory, onChange, onSeeAllPress}) {
  return (
    <View style={{marginTop: 18}}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>See All ›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
        {categories.map(cat => {
          const active = cat.id === activeCategory;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => onChange(cat.id)}
              style={[styles.pill, active && styles.activePill]}>
              <Text style={styles.emoji}>{cat.icon}</Text>
              <Text style={[styles.label, active && styles.activeLabel]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#172033',
  },
  seeAll: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#16A34A',
  },
  pill: {
    marginRight: 10,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E7EBED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePill: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  emoji: {
    fontSize: rf(14),
  },
  label: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#172033',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});