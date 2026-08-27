import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Sprout } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function CropGrowthCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Crop Growth Stage</Text>
          <Text style={styles.subtitle}>Vegetative growth phase</Text>
        </View>

        <View style={styles.iconBox}>
          <Sprout size={24} color={GREEN} strokeWidth={2.5} />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.dayText}>Day 42 of 90</Text>
        <Text style={styles.percentText}>64%</Text>
      </View>

      <Text style={styles.note}>
        Crop growth is on track. Maintain regular irrigation and monitor for
        early signs of pest activity.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    marginHorizontal: width * 0.055,
    marginTop: 22,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rf(17),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: rf(12),
    fontWeight: '700',
    color: '#667085',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    marginTop: 20,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    width: '64%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: GREEN,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#667085',
  },
  percentText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
  note: {
    marginTop: 14,
    fontSize: rf(12),
    lineHeight: rf(19),
    fontWeight: '600',
    color: '#475467',
  },
});
