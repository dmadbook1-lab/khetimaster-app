import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/*
 * Shared look for AI Guru: white page, soft green glow, frosted glass bars,
 * large type and a few gentle animations.
 */

export const { width, height } = Dimensions.get('window');

export const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export const GUTTER = width * 0.045;

export const COLORS = {
  green: '#15803D',
  greenDark: '#0F5E2C',
  greenLight: '#E8F5EC',
  greenBorder: '#CDE8D5',
  page: '#FFFFFF',
  soft: '#F4F7F5',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  faint: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
};

export const GRADIENT = ['#22C55E', '#15803D', '#0F5E2C'];

export const CARD_SHADOW = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

/* Button that springs down a little while pressed. */
export function PressableScale({
  onPress,
  disabled,
  style,
  scaleTo = 0.95,
  hitSlop,
  accessibilityLabel,
  children,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const springTo = toValue =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => springTo(scaleTo)}
      onPressOut={() => springTo(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/* Fade + rise in on mount; `delay` staggers lists. Disabled = shown as is. */
export function useEntrance(delay = 0, distance = 12, enabled = true) {
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;

  useEffect(() => {
    if (!enabled) return;
    Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, delay, enabled]);

  return {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  };
}

export function FadeInUp({ delay = 0, distance, style, children }) {
  const entrance = useEntrance(delay, distance);
  return <Animated.View style={[style, entrance]}>{children}</Animated.View>;
}

/* Looping value: 0 → 1 → 0 (yoyo) or 0 → 1 repeating. */
export function useLoop(
  duration = 2000,
  { yoyo = true, delay = 0, enabled = true } = {},
) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const to = (toValue, ms, easing) =>
      Animated.timing(value, {
        toValue,
        duration: ms,
        easing,
        useNativeDriver: true,
      });
    const loop = Animated.loop(
      Animated.sequence(
        yoyo
          ? [
              Animated.delay(delay),
              to(1, duration, Easing.inOut(Easing.sin)),
              to(0, duration, Easing.inOut(Easing.sin)),
            ]
          : [
              Animated.delay(delay),
              to(1, duration, Easing.out(Easing.quad)),
              to(0, 0),
            ],
      ),
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration, yoyo, delay, enabled]);

  return value;
}

const RADIUS_KEYS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
];

// Android re-renders a live blur every frame the content under it moves, which
// makes scrolling stutter; a dense frosted tint looks close and costs nothing.
const LIVE_BLUR = Platform.OS === 'ios';

/*
 * Frosted glass surface: native blur plus a white tint. The blur and tint
 * sit in a clipped inner layer so the outer view can still cast a shadow
 * (iOS drops shadows on views with overflow: hidden).
 */
export function Glass({ blurAmount = 20, tint = 0.6, style, children }) {
  const flat = StyleSheet.flatten(style) || {};
  const corners = {};
  RADIUS_KEYS.forEach(key => {
    if (flat[key] !== undefined) {
      corners[key] = flat[key];
    }
  });

  return (
    <View style={[styles.glass, style]}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.glassClip, corners]}
      >
        {LIVE_BLUR && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={blurAmount}
            reducedTransparencyFallbackColor="#FFFFFF"
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: `rgba(255,255,255,${
                LIVE_BLUR ? tint : Math.max(tint, 0.9)
              })`,
            },
          ]}
        />
      </View>
      {children}
    </View>
  );
}

const GLOWS = [
  {
    color: '#4ADE80',
    size: width * 1.1,
    top: -width * 0.55,
    left: -width * 0.3,
    duration: 7000,
    dx: 40,
    dy: 20,
    opacity: 0.32,
  },
  {
    color: '#2DD4BF',
    size: width * 0.9,
    top: -width * 0.35,
    left: width * 0.45,
    duration: 9000,
    dx: -30,
    dy: 26,
    opacity: 0.22,
  },
  {
    color: '#86EFAC',
    size: width * 0.9,
    top: height * 0.62,
    left: -width * 0.2,
    duration: 11000,
    dx: 30,
    dy: -24,
    opacity: 0.2,
  },
];

function GlowBlob({
  color,
  size,
  top,
  left,
  duration,
  dx,
  dy,
  opacity,
  index,
}) {
  // Drifts on iOS only; on Android the glow stays still so nothing behind
  // the chat has to be redrawn while it scrolls
  const drift = useLoop(duration, { delay: index * 500, enabled: LIVE_BLUR });
  const id = `aiguru-glow-${index}`;

  return (
    <Animated.View
      // cache the gradient as a bitmap; only the layer moves
      shouldRasterizeIOS
      renderToHardwareTextureAndroid
      style={[
        styles.blob,
        {
          top,
          left,
          width: size,
          height: size,
          transform: [
            {
              translateX: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, dx],
              }),
            },
            {
              translateY: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, dy],
              }),
            },
          ],
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/* Soft green light drifting over the white page. */
export function AmbientGlow() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glow]}>
      {GLOWS.map((glow, index) => (
        <GlowBlob key={glow.color} {...glow} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  glassClip: {
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
  glow: {
    backgroundColor: COLORS.page,
    overflow: 'hidden',
  },
});
