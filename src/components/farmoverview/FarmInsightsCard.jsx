import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {Bot, AlertTriangle} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const GREEN = '#16883E';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmInsightsCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Bot size={22} color={GREEN} strokeWidth={2.4} />
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>AI Farm Insights</Text>
          <Text style={styles.subtitle}>Latest recommendation</Text>
        </View>
      </View>

      <View style={styles.alertBox}>
        <AlertTriangle size={18} color="#F97316" strokeWidth={2.4} />
        <Text style={styles.alertText}>
          Mild leaf stress detected in one patch. Check irrigation and inspect
          crop leaves in the north-east area.
        </Text>
      </View>
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
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    marginLeft: 13,
  },
  title: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 3,
    fontSize: rf(11),
    fontWeight: '700',
    color: '#667085',
  },
  alertBox: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  alertText: {
    flex: 1,
    fontSize: rf(12),
    lineHeight: rf(19),
    fontWeight: '700',
    color: '#9A3412',
  },
});