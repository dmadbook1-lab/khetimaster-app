import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Bot } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function TypingIndicator() {
  const first = useRef(new Animated.Value(0.35)).current;
  const second = useRef(new Animated.Value(0.35)).current;
  const third = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.stagger(160, [
        animateDot(first),
        animateDot(second),
        animateDot(third),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [first, second, third]);
  return (
    <View style={styles.wrapper}>
      <View style={styles.avatar}>
        <Bot size={rf(17)} color="#FFFFFF" strokeWidth={2.3} />
      </View>

      <View style={styles.bubble}>
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: first,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.dot,
            {
              opacity: second,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.dot,
            {
              opacity: third,
            },
          ]}
        />
      </View>
    </View>
  );
}
function animateDot(value) {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0.35,
      duration: 260,
      useNativeDriver: true,
    }),
  ]);
}
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 35,
    height: 35,
    marginRight: 9,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    height: 42,
    minWidth: 70,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    backgroundColor: '#F1F8F3',
    borderWidth: 1,
    borderColor: '#DCEFE2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
});
