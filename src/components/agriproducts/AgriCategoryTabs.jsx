import React from 'react';
import {ScrollView, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {Sprout, FlaskConical, Bug, Wrench} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const GREEN = '#16883E';

const iconMap = {
  sprout: Sprout,
  flask: FlaskConical,
  bug: Bug,
  wrench: Wrench,
};

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function AgriCategoryTabs({tabs, activeTab, onChange}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        const Icon = iconMap[tab.icon];

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.85}
            onPress={() => onChange(tab.id)}
            style={[styles.chip, active && styles.activeChip]}>
            <Icon
              size={18}
              color={active ? '#FFFFFF' : '#64748B'}
              strokeWidth={2.5}
            />
            <Text style={[styles.text, active && styles.activeText]}>
              {tab.label}
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
    paddingRight: 20,
  },

  chip: {
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  activeChip: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  text: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#64748B',
  },

  activeText: {
    color: '#FFFFFF',
  },
});