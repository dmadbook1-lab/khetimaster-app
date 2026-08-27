import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {MapPin, Globe2, Heart, AlertTriangle} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmOverviewCard() {
  return (
    <View style={styles.card}>
      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />

      <View style={styles.topRow}>
        <Text style={styles.title}>Farm Overview</Text>

        <View style={styles.seasonPill}>
          <Text style={styles.seasonText}>Kharif 2025</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <OverviewItem Icon={MapPin} value="6" label="FARMS" />
        <OverviewItem Icon={Globe2} value="18.5" label="ACRES" />
        <OverviewItem Icon={Heart} value="5" label="HEALTHY" />
        <OverviewItem Icon={AlertTriangle} value="1" label="ATTENTION" />
      </View>
    </View>
  );
}

function OverviewItem({Icon, value, label}) {
  return (
    <View style={styles.statItem}>
      <View style={styles.iconBox}>
        <Icon size={18} color="#FFFFFF" strokeWidth={2.2} />
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 28,
    height: 180,
    borderRadius: 28,
    backgroundColor: '#16883E',
    padding: 22,
    overflow: 'hidden',
  },

  circleOne: {
    position: 'absolute',
    right: -54,
    top: -42,
    width: 170,
    height: 170,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  circleTwo: {
    position: 'absolute',
    right: 18,
    top: 20,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: rf(18),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  seasonPill: {
    paddingHorizontal: 13,
    height: 30,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seasonText: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '800',
  },

  statsRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    alignItems: 'center',
    width: '24%',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  value: {
    fontSize: rf(20),
    lineHeight: rf(24),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  label: {
    marginTop: 3,
    fontSize: rf(9),
    fontWeight: '800',
    color: 'rgba(255,255,255,0.76)',
    letterSpacing: 0.6,
  },
});