import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Circle, Lightbulb } from 'lucide-react-native';
import { COLORS, rf } from '../theme';
export default function AIDiagnosisCard({ onViewAdvice }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.dotCircle}>
          <View style={styles.innerDot} />
        </View>
        <Text style={styles.title}>AI DIAGNOSIS</Text>
      </View>

      <Text style={styles.sub}>AI thinks the issue may be:</Text>

      <View style={styles.bar1}>
        <View style={styles.bar1Dot} />
      </View>
      <View style={styles.bar2} />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onViewAdvice}
        style={styles.viewBtn}
      >
        <Lightbulb size={rf(15)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
        <Text style={styles.viewText}>View AI Advice</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.DARK_GREEN,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  sub: {
    marginTop: 12,
    fontSize: rf(11),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  bar1: {
    marginTop: 12,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  bar1Dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ORANGE,
  },
  bar2: {
    marginTop: 10,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  viewBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewText: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
});
