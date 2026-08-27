import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {Sparkles, BookOpen, FlaskConical} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const BLUE = '#2563EB';

const CARD_WIDTH = (width - width * 0.074 - 32) / 3;

const items = [
  {
    Icon: Sparkles,
    label: 'Crop Health',
    value: '92%',
    pill: 'HEALTHY',
    color: '#111827',
    iconColor: GREEN,
    bg: '#ECFDF5',
  },
  {
    Icon: BookOpen,
    label: 'Growth Stage',
    value: 'Vegetative',
    pill: 'CURRENT\nSTAGE',
    color: '#166534',
    iconColor: GREEN,
    bg: '#ECFDF5',
    bigPill: true,
  },
  {
    Icon: FlaskConical,
    label: 'Soil Moisture',
    value: 'Good',
    pill: 'OPTIMAL',
    color: BLUE,
    iconColor: BLUE,
    bg: '#EFF6FF',
  },
];

export default function FarmMetricCards() {
  return (
    <View style={styles.row}>
      {items.map((item, index) => {
        const Icon = item.Icon;

        return (
          <View key={index} style={styles.card}>
            <View style={[styles.iconBox, {backgroundColor: item.bg}]}>
              <Icon size={22} color={item.iconColor} strokeWidth={2.5} />
            </View>

            <Text style={styles.label}>{item.label}</Text>
            <Text style={[styles.value, {color: item.color}]}>{item.value}</Text>

            <View style={[styles.pill, item.bigPill && styles.bigPill]}>
              <Text style={styles.pillText}>{item.pill}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    height: 178,
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
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#667085',
  },

  value: {
    marginTop: 5,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  pill: {
    marginTop: 16,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 9,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
  },

  bigPill: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 17,
    alignSelf: 'center',
  },

  pillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    color: '#16883E',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});