import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, rf, PAGE_PADDING } from './theme';
const TABS = [
  {
    id: 'Community',
    label: 'All',
  },
  {
    id: 'Videos',
    label: 'Videos',
  },
  {
    id: 'Questions',
    label: 'Questions',
  },
  {
    id: 'Experts',
    label: 'Experts',
  },
  {
    id: 'Disease',
    label: 'Disease',
  },
];
export default function CommunityTabs({
  navigation,
  activeRoute,
  onTabChange,
}) {
  const handleTabPress = routeName => {
    if (routeName === activeRoute) return;
    if (onTabChange) {
      onTabChange(routeName);
      return;
    }
    if (navigation?.push) {
      navigation.push(routeName);
      return;
    }
    if (navigation?.navigate) {
      navigation.navigate(routeName);
    }
  };
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {TABS.map(tab => {
          const isActive = tab.id === activeRoute;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              onPress={() => handleTabPress(tab.id)}
              style={[styles.pill, isActive && styles.activePill]}
            >
              <Text
                style={[styles.pillText, isActive && styles.activePillText]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  row: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 12,
    gap: 8,
  },
  pill: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  pillText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#64748B',
  },
  activePillText: {
    color: '#FFFFFF',
  },
});
