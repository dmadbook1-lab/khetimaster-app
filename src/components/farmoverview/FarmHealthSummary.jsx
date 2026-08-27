import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {HeartPulse} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const GREEN = '#16883E';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmHealthSummary() {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <HeartPulse size={23} color={GREEN} strokeWidth={2.4} />
        </View>

        <View>
          <Text style={styles.title}>Farm Health Score</Text>
          <Text style={styles.desc}>Your crop condition is stable</Text>
        </View>
      </View>

      <View style={styles.scoreCircle}>
        <Text style={styles.score}>92%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: width * 0.055,
    marginTop: -28,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111827',
  },
  desc: {
    marginTop: 4,
    fontSize: rf(11),
    fontWeight: '700',
    color: '#667085',
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: rf(18),
    fontWeight: '900',
    color: GREEN,
  },
});