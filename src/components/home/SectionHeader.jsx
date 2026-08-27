import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const DARK = '#111827';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function SectionHeader({ title, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        <View style={styles.viewAllRow}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={GREEN} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 34,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: rf(12),
    color: GREEN,
    fontWeight: '900',
  },
});
