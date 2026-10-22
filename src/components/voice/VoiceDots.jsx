import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/*
 * Four coloured dots: the assistant's "face".
 *
 * mode
 *   listening   dots bounce one after another and grow with `level`
 *   thinking    quick small wave
 *   still       resting
 *
 * level  optional Animated value 0-1 from the microphone
 */

export const DOT_COLORS = ['#16A34A', '#0EA5E9', '#6366F1', '#F59E0B'];

const STILL = new Animated.Value(0);

export default function VoiceDots({
  mode = 'still',
  level = STILL,
  size = 14,
}) {
  const values = useRef(DOT_COLORS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (mode === 'still') {
      values.forEach(value => {
        value.stopAnimation();
        value.setValue(0);
      });
      return undefined;
    }

    const duration = mode === 'thinking' ? 260 : 420;

    const loops = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * (duration / 2.5)),
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay((values.length - 1 - index) * (duration / 2.5)),
        ]),
      ),
    );

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [mode, values]);

  const lift = mode === 'thinking' ? size * 0.5 : size * 0.9;

  return (
    <View style={[styles.row, { gap: size * 0.55 }]}>
      {values.map((value, index) => (
        <Animated.View
          key={DOT_COLORS[index]}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: DOT_COLORS[index],
            transform: [
              {
                translateY: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -lift],
                }),
              },
              {
                scale: level.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.35 + index * 0.08],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
