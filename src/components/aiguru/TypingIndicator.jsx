import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { COLORS, GRADIENT, rf, useEntrance } from './theme';

export default function TypingIndicator() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const entrance = useEntrance(0, 8);

  useEffect(() => {
    const bounce = value =>
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.stagger(120, dots.map(bounce)),
        Animated.delay(180),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [dots]);

  return (
    <Animated.View style={[styles.wrapper, entrance]}>
      <View style={styles.labelRow}>
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Sparkles size={rf(12)} color="#FFFFFF" strokeWidth={2.4} />
        </LinearGradient>
        <Text style={styles.label}>AI Guru is typing…</Text>
      </View>

      <View style={styles.bubble}>
        {dots.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
                transform: [
                  {
                    translateY: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  labelRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: rf(12),
    fontWeight: '600',
    color: COLORS.muted,
  },
  bubble: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: '#EAF0EC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
});
