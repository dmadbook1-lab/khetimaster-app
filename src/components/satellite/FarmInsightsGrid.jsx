import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BookOpen, Box, Zap, TrendingUp } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - width * 0.074 - 16) / 2;
const insights = [
  {
    Icon: BookOpen,
    label: 'Vegetation',
    value: 'High',
    color: '#16A34A',
    bg: '#ECFDF5',
  },
  {
    Icon: Box,
    label: 'Moisture',
    value: 'Good',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    Icon: Zap,
    label: 'Crop Stress',
    value: 'Low',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    Icon: TrendingUp,
    label: 'Growth',
    value: 'Normal',
    color: '#A855F7',
    bg: '#FAF5FF',
  },
];
export default function FarmInsightsGrid() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Farm Insights</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      <View style={styles.grid}>
        {insights.map((item, index) => {
          const Icon = item.Icon;
          return (
            <View key={index} style={styles.card}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: item.bg,
                  },
                ]}
              >
                <Icon size={21} color={item.color} strokeWidth={2.4} />
              </View>

              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 34,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.35,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16883E',
  },
  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: 136,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  value: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },
});
