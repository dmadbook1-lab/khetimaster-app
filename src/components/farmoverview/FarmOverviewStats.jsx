import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {stats} from './data';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - width * 0.11 - 14) / 2;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmOverviewStats() {
  return (
    <View style={styles.wrapper}>
      {stats.map((item, index) => {
        const Icon = item.Icon;

        return (
          <View key={index} style={styles.card}>
            <View style={[styles.iconBox, {backgroundColor: item.bg}]}>
              <Icon size={22} color={item.color} strokeWidth={2.4} />
            </View>

            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={[styles.status, {color: item.color}]}>
              {item.status}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 22,
    paddingHorizontal: width * 0.055,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 13,
    fontSize: rf(12),
    fontWeight: '800',
    color: '#667085',
  },
  value: {
    marginTop: 5,
    fontSize: rf(22),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  status: {
    marginTop: 4,
    fontSize: rf(11),
    fontWeight: '900',
  },
});