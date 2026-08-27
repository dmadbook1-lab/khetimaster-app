import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Sparkles,
  ChevronDown,
  Check,
  ChevronsDown,
} from 'lucide-react-native';
import { COLORS, rf } from '../theme';
export default function ImproveQuestionCard({ original, improved, onUse }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Sparkles size={rf(14)} color={COLORS.ORANGE} strokeWidth={2.4} />
        <Text style={styles.title}>Improve Your Question</Text>
      </View>

      <Text style={styles.label}>ORIGINAL</Text>
      <View style={styles.originalBox}>
        <Text style={styles.originalText}>{original}</Text>
      </View>

      <View style={styles.arrowWrap}>
        <View style={styles.arrowCircle}>
          <ChevronDown
            size={rf(14)}
            color={COLORS.DARK_GREEN}
            strokeWidth={2.4}
          />
        </View>
      </View>

      <View style={styles.improvedHeader}>
        <ChevronsDown
          size={rf(11)}
          color={COLORS.DARK_GREEN}
          strokeWidth={2.4}
        />
        <Text style={styles.improvedLabel}>AI IMPROVED</Text>
      </View>

      <View style={styles.improvedBox}>
        <Text style={styles.improvedText}>{improved}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onUse}
        style={styles.useBtn}
      >
        <Check size={rf(14)} color="#FFFFFF" strokeWidth={2.6} />
        <Text style={styles.useText}>Use Improved Question</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: rf(13),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  label: {
    marginTop: 14,
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  originalBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  originalText: {
    fontSize: rf(11.5),
    lineHeight: rf(16),
    color: COLORS.MUTED,
    fontWeight: '500',
  },
  arrowWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  improvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  improvedLabel: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    letterSpacing: 0.5,
  },
  improvedBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    borderWidth: 1,
    borderColor: '#BBF0CC',
  },
  improvedText: {
    fontSize: rf(11.5),
    lineHeight: rf(16.5),
    color: COLORS.DARK,
    fontWeight: '500',
  },
  useBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  useText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
