import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import WeatherArt from './WeatherArt';

const RAINY = ['rain', 'storm'];

/*
 * WeatherArt that feels alive: it floats gently, a clear sun slowly
 * turns, and rain falls under rain clouds. Native-driver only.
 */
export default function AnimatedWeatherArt({ kind, size = 120 }) {
  const float = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const rain = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    if (kind === 'sun') {
      loops.push(
        Animated.loop(
          Animated.timing(spin, {
            toValue: 1,
            duration: 24000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ),
      );
    }

    if (RAINY.includes(kind)) {
      loops.push(
        Animated.loop(
          Animated.timing(rain, {
            toValue: 1,
            duration: 900,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ),
      );
    }

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [kind, float, spin, rain]);

  const drops = RAINY.includes(kind)
    ? [0.28, 0.46, 0.64].map((left, index) => (
        <Animated.View
          key={left}
          pointerEvents="none"
          style={[
            styles.drop,
            {
              left: size * left,
              top: size * 0.72,
              height: size * 0.12,
              opacity: rain.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: rain.interpolate({
                    inputRange: [0, 1],
                    outputRange: [index * 3, size * 0.22 + index * 3],
                  }),
                },
                { rotate: '15deg' },
              ],
            },
          ]}
        />
      ))
    : null;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [
          {
            translateY: float.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -6],
            }),
          },
        ],
      }}
    >
      <Animated.View
        style={
          kind === 'sun'
            ? {
                transform: [
                  {
                    rotate: spin.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }
            : null
        }
      >
        {/* rain is drawn by the falling drops instead of the static ones */}
        <WeatherArt kind={kind} size={size} hideDrops={RAINY.includes(kind)} />
      </Animated.View>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {drops}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drop: {
    position: 'absolute',
    width: 4,
    borderRadius: 2,
    backgroundColor: '#7DD3FC',
  },
});
