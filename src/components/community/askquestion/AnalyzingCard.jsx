import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Loader2 } from 'lucide-react-native';
import { COLORS, rf } from '../theme';
export default function AnalyzingCard({ progress = 72 }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Animated.View
          style={{
            transform: [
              {
                rotate,
              },
            ],
          }}
        >
          <Loader2 size={rf(18)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
        </Animated.View>
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.title}>Analyzing your question...</Text>
          <Text style={styles.sub}>Finding similar discussions & insights</Text>
        </View>
        <Text style={styles.percent}>{progress}%</Text>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  sub: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  percent: {
    fontSize: rf(14),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  barTrack: {
    marginTop: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.DARK_GREEN,
    borderRadius: 3,
  },
});
