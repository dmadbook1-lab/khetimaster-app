import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const points = [
  {date: '25 May', week: 'Week 1'},
  {date: '1 Jun', week: 'Week 2'},
  {date: '8 Jun', week: 'Week 3'},
  {date: '15 Jun', week: 'Today', active: true},
];

export default function HistoricalViewCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Historical View</Text>
        <Text style={styles.month}>Jun 2026</Text>
      </View>

      <View style={styles.timelineWrap}>
        <View style={styles.line} />

        <View style={styles.pointsRow}>
          {points.map((item, index) => (
            <View key={index} style={styles.pointItem}>
              <View style={[styles.point, item.active && styles.activePoint]}>
                {item.active && <View style={styles.innerDot} />}
              </View>

              <Text style={[styles.date, item.active && styles.activeText]}>
                {item.date}
              </Text>
              <Text style={[styles.week, item.active && styles.activeText]}>
                {item.week}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.35,
  },

  month: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },

  timelineWrap: {
    marginTop: 32,
  },

  line: {
    position: 'absolute',
    top: 13,
    left: 34,
    right: 34,
    height: 2,
    backgroundColor: '#16883E',
  },

  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  pointItem: {
    alignItems: 'center',
    width: 70,
  },

  point: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activePoint: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 7,
    borderColor: '#16883E',
    marginTop: -4,
  },

  innerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  date: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
  },

  week: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },

  activeText: {
    color: '#16883E',
  },
});