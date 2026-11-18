import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Cloud, Plus, ChevronRight } from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
const GREEN = '#16A34A';
const items = [
  {
    Icon: Zap,
    time: 'YESTERDAY, 08:30 AM',
    get title() {
    return i18n.t('farmRecentActivity.aiAdvisoryGenerated');
  },
    get desc() {
    return i18n.t('farmRecentActivity.irrigationRecommendationGeneratedBy');
  },
  },
  {
    Icon: Cloud,
    time: '2 DAYS AGO, 06:45 PM',
    get title() {
    return i18n.t('farmRecentActivity.weatherAlertSent');
  },
    get desc() {
    return i18n.t('farmRecentActivity.moderateRainfallExpectedInYour');
  },
    solid: true,
  },
  {
    Icon: Plus,
    time: '4 DAYS AGO, 11:20 AM',
    get title() {
    return i18n.t('farmRecentActivity.farmAdded');
  },
    get desc() {
    return i18n.t('farmRecentActivity.patilFarmHasBeenSuccessfully');
  },
  },
];
export default function FarmRecentActivity() {
  const {t} = useTranslation();
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.title}>{t('farmRecentActivity.recentActivity')}</Text>
        <Text style={styles.viewAll}>{t('farmRecentActivity.viewAll')}</Text>
      </View>

      <View style={styles.card}>
        {items.map((item, index) => {
          const Icon = item.Icon;
          return (
            <View
              key={index}
              style={[styles.item, index !== items.length - 1 && styles.border]}
            >
              <View style={styles.lineDot} />

              <View style={[styles.iconBox, item.solid && styles.solidIcon]}>
                <Icon
                  size={24}
                  color={item.solid ? '#FFFFFF' : GREEN}
                  strokeWidth={2.4}
                />
              </View>

              <View style={styles.textBox}>
                <Text style={styles.time}>{item.time}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.desc}>
                  {item.desc}
                </Text>
              </View>

              <ChevronRight size={22} color="#CBD5E1" strokeWidth={2.2} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 26,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '900',
    color: '#16883E',
  },
  card: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  item: {
    minHeight: 82,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineDot: {
    position: 'absolute',
    left: 15,
    top: 16,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  solidIcon: {
    backgroundColor: GREEN,
  },
  textBox: {
    flex: 1,
  },
  time: {
    fontSize: 10,
    fontWeight: '900',
    color: '#98A2B3',
    letterSpacing: 0.4,
  },
  itemTitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  desc: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#667085',
  },
});
