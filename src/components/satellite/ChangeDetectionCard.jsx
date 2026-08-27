import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ArrowLeftRight, TrendingUp} from 'lucide-react-native';

export default function ChangeDetectionCard() {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <ArrowLeftRight size={23} color="#16A34A" strokeWidth={2.4} />
        </View>

        <View>
          <Text style={styles.label}>CHANGE DETECTION</Text>
          <Text style={styles.title}>Compared to Last{'\n'}Week</Text>
        </View>
      </View>

      <View style={styles.badge}>
        <TrendingUp size={15} color="#16883E" strokeWidth={2.4} />
        <Text style={styles.badgeText}>+8%{'\n'}Improvement</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    minHeight: 94,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 2,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },

  title: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
    color: '#111827',
  },

  badge: {
    minWidth: 132,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  badgeText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
    color: '#16883E',
  },
});