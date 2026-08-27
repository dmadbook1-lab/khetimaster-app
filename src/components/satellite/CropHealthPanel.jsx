import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
export default function CropHealthPanel() {
  return (
    <View style={styles.card}>
      <View style={styles.circle}>
        <Text style={styles.percent}>92%</Text>
      </View>

      <View style={styles.textBox}>
        <View style={styles.labelRow}>
          <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.label}>CROP HEALTH</Text>
        </View>

        <Text style={styles.title}>Excellent{'\n'}Vegetation</Text>

        <View style={styles.updatedRow}>
          <View style={styles.dot} />
          <Text style={styles.updated}>Last Updated: 2 Days Ago</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    height: 154,
    borderRadius: 28,
    backgroundColor: '#16883E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    shadowColor: '#22C55E',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 8,
  },
  circle: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 3,
    borderColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  textBox: {
    marginLeft: 28,
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#DCFCE7',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  updatedRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  updated: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '700',
  },
});
