import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Sun, ChevronRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#20C55A';
const DARK = '#171D2C';
const MUTED = '#8791A1';
const BORDER = '#E9EDF1';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function CurrentFarmCard({ onSwitchFarm }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Sun size={rf(27)} color="#FFFFFF" strokeWidth={2.1} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Current Farm</Text>

        <Text style={styles.farmName}>Patil Farm</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Soybean</Text>

          <View style={styles.metaDivider} />

          <Text style={styles.metaText}>2.34{'\n'}Acres</Text>

          <View style={styles.monitorDot} />

          <Text style={styles.monitorText}>Monitoring{'\n'}Active</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSwitchFarm}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>Switch</Text>

        <ChevronRight size={rf(16)} color={DARK} strokeWidth={2.3} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    marginHorizontal: width * 0.037,
    marginTop: 12,
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.045,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 13,
  },
  label: {
    fontSize: rf(10),
    fontWeight: '600',
    color: MUTED,
  },
  farmName: {
    marginTop: 2,
    fontSize: rf(17),
    lineHeight: rf(21),
    fontWeight: '900',
    color: DARK,
  },
  metaRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '500',
    color: MUTED,
  },
  metaDivider: {
    width: 1,
    height: 19,
    marginHorizontal: 10,
    backgroundColor: '#E4E8EC',
  },
  monitorDot: {
    width: 6,
    height: 6,
    marginLeft: 11,
    marginRight: 7,
    borderRadius: 3,
    backgroundColor: BRIGHT_GREEN,
  },
  monitorText: {
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '700',
    color: BRIGHT_GREEN,
  },
  switchButton: {
    height: 37,
    paddingHorizontal: 13,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE4E8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
});
