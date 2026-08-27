import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { defaultFarm } from './data';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function FarmInformationCard({ farm }) {
  const item = farm || defaultFarm;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Farm Information</Text>

      <InfoRow label="Crop" value={item.crop || defaultFarm.crop} />
      <InfoRow label="Area" value={item.area || defaultFarm.area} />
      <InfoRow
        label="Sowing Date"
        value={item.sowingDate || defaultFarm.sowingDate}
      />
      <InfoRow
        label="Soil Type"
        value={item.soilType || defaultFarm.soilType}
      />
      <InfoRow
        label="Location"
        value={item.location || defaultFarm.location}
        last
      />
    </View>
  );
}
function InfoRow({ label, value, last }) {
  return (
    <View style={[styles.row, last && styles.lastRow]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
  title: {
    fontSize: rf(17),
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  row: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#667085',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: rf(12),
    fontWeight: '900',
    color: '#111827',
  },
});
