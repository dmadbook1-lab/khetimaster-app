import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight, Mic } from 'lucide-react-native';

/*
 * Thin full-width button under the quick actions of a service screen:
 * a pulsing mic and "Use voice assistant to book labour".
 * It matches the green voice card on the home screen.
 */
export default function VoiceActionButton({ label, onPress, style }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.wrap, style]}
    >
      <LinearGradient
        colors={['#0E3B22', '#15803D', '#16A34A']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.button}
      >
        <View style={styles.micBox}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.micRing,
              {
                opacity: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.55, 0],
                }),
                transform: [
                  {
                    scale: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.7],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.mic}>
            <Mic size={14} color="#14532D" strokeWidth={2.8} />
          </View>
        </View>

        <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
          {label}
        </Text>

        <ChevronRight size={18} color="#BBF7D0" strokeWidth={2.8} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  button: {
    height: 46,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  micBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#BBF7D0',
  },
  mic: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
});
