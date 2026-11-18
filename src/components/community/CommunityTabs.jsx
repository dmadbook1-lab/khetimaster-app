import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, rf, PAGE_PADDING } from './theme';
import i18n from 'i18next';
import {useTranslation} from 'react-i18next';
const TABS = [
  {
    id: 'Community',
    get label() {
    return i18n.t('communityTabs.forYou');
  },
  },
  {
    id: 'Following',
    get label() {
    return i18n.t('communityTabs.following');
  },
  },
  {
    id: 'Reels',
    get label() {
    return i18n.t('communityTabs.reels');
  },
  },
  {
    id: 'Questions',
    get label() {
    return i18n.t('communityTabs.questions');
  },
  },
  {
    id: 'Experts',
    get label() {
    return i18n.t('communityTabs.experts');
  },
  },
  {
    id: 'Disease',
    get label() {
    return i18n.t('communityTabs.disease');
  },
  },
];
export default function CommunityTabs({
  navigation,
  activeRoute,
  onTabChange,
}) {
  useTranslation();
  const handleTabPress = routeName => {
    if (routeName === activeRoute) return;
    if (onTabChange) {
      onTabChange(routeName);
      return;
    }
    // feed tabs live inside the Community screen, not as routes
    if (['Community', 'Following', 'Reels'].includes(routeName)) {
      navigation?.navigate('Community', {
        tab: routeName,
      });
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
