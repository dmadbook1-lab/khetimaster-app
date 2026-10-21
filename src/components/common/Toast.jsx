import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, Info } from 'lucide-react-native';

/*
|--------------------------------------------------------------------------
| TOAST
|--------------------------------------------------------------------------
|
| Small non-blocking confirmation at the bottom of the screen ("Saved",
| "Listing paused"). It is a plain View, not a Modal, so it can show
| while a bottom sheet is closing.
|
|   const toast = useToast();
|   toast.show('Listing paused');
|   <Toast {...toast.toastProps} />
|
*/

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, variant = 'success') => {
    setToast({ message, variant, id: Date.now() });
  }, []);

  const clear = useCallback(() => setToast(null), []);

  return { show, toastProps: { toast, onHidden: clear } };
}

export default function Toast({ toast, onHidden, bottomOffset = 90 }) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    progress.setValue(0);

    const animation = Animated.sequence([
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.delay(2200),
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => finished && onHidden?.());

    return () => animation.stop();
  }, [toast, progress, onHidden]);

  if (!toast) {
    return null;
  }

  const Icon = toast.variant === 'info' ? Info : CircleCheck;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + bottomOffset,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.toast}>
        <View style={styles.icon}>
          <Icon size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.text} numberOfLines={2}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 18,
    borderRadius: 18,
    backgroundColor: '#14261B',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#159447',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flexShrink: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
