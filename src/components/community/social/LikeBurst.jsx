import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';

const LikeBurst = forwardRef(({ size = 96 }, ref) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    play: () => {
      scale.setValue(0.2);
      opacity.setValue(1);

      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.6,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    },
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity, transform: [{ scale }] }]}
    >
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Heart
          size={size * 0.55}
          color="#FFFFFF"
          fill="#FFFFFF"
          strokeWidth={2.4}
        />
      </View>
    </Animated.View>
  );
});

export default LikeBurst;

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#E11D48',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
