import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
const tabs = ['True Color', 'NDVI', 'NDRE', 'Moisture'];
export default function SatelliteIndexTabs({ activeIndex, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {tabs.map(tab => {
        const active = activeIndex === tab;
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.85}
            onPress={() => onChange(tab)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: {
    marginTop: 20,
    gap: 10,
    paddingRight: 18,
  },
  tab: {
    height: 42,
    minWidth: 112,
    borderRadius: 21,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    minWidth: 78,
    backgroundColor: '#16883E',
    borderColor: '#16883E',
    shadowColor: '#16883E',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
