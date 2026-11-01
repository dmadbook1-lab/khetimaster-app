import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Mic, SendHorizontal, Camera } from 'lucide-react-native';
import { COLORS, GRADIENT, GUTTER, Glass, PressableScale, rf } from './theme';

// Space the floating composer takes; the chat scrolls underneath it
export const COMPOSER_HEIGHT = 80;

export default function ChatComposer({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  onAttachmentPress,
  hasAttachment = false,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);
  const canSend = value.trim().length > 0 || hasAttachment;
  const morph = useRef(new Animated.Value(canSend ? 1 : 0)).current;

  // Mic turns into send once there is something to send
  useEffect(() => {
    Animated.spring(morph, {
      toValue: canSend ? 1 : 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 9,
    }).start();
  }, [morph, canSend]);

  const handleSend = () => {
    if (!canSend || disabled) {
      return;
    }
    Keyboard.dismiss();
    onSend();
  };

  const layer = visibleAt => ({
    opacity: morph.interpolate({
      inputRange: [0, 1],
      outputRange: visibleAt ? [0, 1] : [1, 0],
    }),
    transform: [
      {
        scale: morph.interpolate({
          inputRange: [0, 1],
          outputRange: visibleAt ? [0.4, 1] : [1, 0.4],
        }),
      },
      {
        rotate: morph.interpolate({
          inputRange: [0, 1],
          outputRange: visibleAt ? ['-90deg', '0deg'] : ['0deg', '90deg'],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <Glass
        tint={0.68}
        style={[styles.composer, focused && styles.composerFocused]}
      >
        <PressableScale
          accessibilityLabel="Add crop photo"
          onPress={onAttachmentPress}
          scaleTo={0.88}
          style={[styles.sideButton, hasAttachment && styles.sideButtonActive]}
        >
          <Camera
            size={rf(20)}
            color={hasAttachment ? '#FFFFFF' : COLORS.green}
            strokeWidth={2.2}
          />
        </PressableScale>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask AI Guru…"
          placeholderTextColor={COLORS.faint}
          multiline
          maxLength={1000}
          style={styles.input}
        />

        <View style={styles.mainSlot}>
          <Animated.View
            pointerEvents={canSend ? 'none' : 'auto'}
            style={[StyleSheet.absoluteFill, layer(false)]}
          >
            <Pressable
              accessibilityLabel="Speak your question"
              onPress={onVoicePress}
            >
              <LinearGradient
                colors={GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainButton}
              >
                <Mic size={rf(21)} color="#FFFFFF" strokeWidth={2.4} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View
            pointerEvents={canSend ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, layer(true)]}
          >
            <PressableScale
              accessibilityLabel="Send"
              onPress={handleSend}
              disabled={disabled}
              scaleTo={0.86}
              style={disabled && styles.disabled}
            >
              <LinearGradient
                colors={GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainButton}
              >
                <SendHorizontal
                  size={rf(20)}
                  color="#FFFFFF"
                  strokeWidth={2.4}
                />
              </LinearGradient>
            </PressableScale>
          </Animated.View>
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: COMPOSER_HEIGHT,
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  composer: {
    minHeight: 60,
    maxHeight: 130,
    padding: 6,
    borderRadius: 30,
    borderColor: COLORS.greenBorder,
    flexDirection: 'row',
    alignItems: 'flex-end',
    shadowColor: '#0F3D22',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  composerFocused: {
    borderColor: '#22C55E',
    shadowColor: '#16A34A',
    shadowOpacity: 0.22,
  },
  sideButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonActive: {
    backgroundColor: COLORS.green,
  },
  input: {
    flex: 1,
    maxHeight: 116,
    paddingTop: 13,
    paddingBottom: 12,
    paddingHorizontal: 12,
    fontSize: rf(15),
    lineHeight: rf(20),
    color: COLORS.text,
    textAlignVertical: 'center',
  },
  mainSlot: {
    width: 46,
    height: 46,
  },
  mainButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
