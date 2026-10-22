import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/*
 * Glowing border around the whole screen while the assistant is open.
 *
 * Drawn with SVG: the same rounded rectangle stroked several times,
 * wide and faint to thin and bright, which reads as a soft neon glow.
 * Two copies with the colours in a different order fade into each
 * other so the colours seem to flow. Only opacity is animated.
 *
 * colors  four hex colours for the current state
 * level   Animated value 0-1 from the microphone (brighter when loud)
 */

const LAYERS = [
  { width: 40, opacity: 0.08 },
  { width: 26, opacity: 0.16 },
  { width: 14, opacity: 0.32 },
  { width: 6, opacity: 0.7 },
  { width: 2.5, opacity: 1 },
];

const RADIUS = 42;

function GlowLayer({ id, colors, size, flip }) {
  return (
    <Svg width={size.width} height={size.height}>
      <Defs>
        <LinearGradient
          id={id}
          x1={flip ? '1' : '0'}
          y1="0"
          x2={flip ? '0' : '1'}
          y2="1"
        >
          {colors.map((color, index) => (
            <Stop
              key={`${color}-${index}`}
              offset={index / (colors.length - 1)}
              stopColor={color}
            />
          ))}
        </LinearGradient>
      </Defs>
      {LAYERS.map(layer => (
        <Rect
          key={layer.width}
          x={layer.width / 2}
          y={layer.width / 2}
          width={size.width - layer.width}
          height={size.height - layer.width}
          rx={RADIUS}
          ry={RADIUS}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={layer.width}
          strokeOpacity={layer.opacity}
        />
      ))}
    </Svg>
  );
}

export default function ScreenGlow({ colors, level }) {
  const [size, setSize] = useState(null);
  const flow = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(flow, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(flow, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [flow, breathe]);

  const reversed = [...colors].reverse();

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        if (width && height) setSize({ width, height });
      }}
    >
      {!!size && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: breathe.interpolate({
                inputRange: [0, 1],
                outputRange: [0.75, 1],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: level.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: flow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              <GlowLayer id="glowA" colors={colors} size={size} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: flow }]}>
              <GlowLayer id="glowB" colors={reversed} size={size} flip />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
