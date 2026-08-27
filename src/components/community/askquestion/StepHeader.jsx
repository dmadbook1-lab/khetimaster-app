import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, rf, PAGE_PADDING } from '../theme';
export default function StepHeader({ title, step, totalSteps, onBack }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backBtn}
        >
          <ArrowLeft size={rf(16)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.stepText}>
          Step {step} of {totalSteps}
        </Text>
      </View>

      <View style={styles.progress}>
        {Array.from({
          length: totalSteps,
        }).map((_, i) => (
          <View key={i} style={[styles.seg, i < step && styles.segActive]} />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  stepText: {
    fontSize: rf(10.5),
    fontWeight: '600',
    color: COLORS.MUTED,
    minWidth: 60,
    textAlign: 'right',
  },
  progress: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 6,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  segActive: {
    backgroundColor: COLORS.DARK_GREEN,
  },
});
