import { useTranslation } from 'react-i18next';
import React from 'react';
import { Animated, View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { Mic } from 'lucide-react-native';
import {
  COLORS,
  GRADIENT,
  FadeInUp,
  Glass,
  PressableScale,
  rf,
  useLoop,
} from './theme';

const ORB = 150;
const RING = ORB + 36;

function Ripple({ delay, size }) {
  const wave = useLoop(2800, { yoyo: false, delay });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: wave.interpolate({
            inputRange: [0, 0.15, 1],
            outputRange: [0, 0.5, 0],
          }),
          transform: [
            {
              scale: wave.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1.6],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/* Empty state: floating AI orb, greeting and one big speak button. */
export default function AIReadySection({ name, onVoicePress }) {
  const { t } = useTranslation();
  const float = useLoop(2600);
  const spin = useLoop(10000, { yoyo: false });
  const micPulse = useLoop(1800, { yoyo: false });

  return (
    <View style={styles.container}>
      <View style={styles.visual}>
        <Ripple delay={0} size={ORB} />
        <Ripple delay={1400} size={ORB} />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width={RING} height={RING}>
            <Defs>
              <SvgGradient id="aiguruRing" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#22C55E" stopOpacity="1" />
                <Stop offset="0.55" stopColor="#2DD4BF" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#22C55E" stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RING / 2 - 2}
              stroke="url(#aiguruRing)"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.orbShadow,
            {
              transform: [
                {
                  translateY: float.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-6, 6],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#F0FDF4', '#BBF7D0', '#4ADE80']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.orb}
          >
            <Image
              source={require('../../assets/images/ai-guru.png')}
              style={styles.orbImage}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.orbSheen}
              pointerEvents="none"
            />
          </LinearGradient>
        </Animated.View>
      </View>

      <FadeInUp delay={100}>
        <Text style={styles.greeting}>Namaste{name ? `, ${name}` : ''} 👋</Text>
      </FadeInUp>

      <FadeInUp delay={180}>
        <Text style={styles.title}>{t('aiGuru.ready_title')}</Text>
      </FadeInUp>

      <FadeInUp delay={260}>
        <Text style={styles.subtitle}>
          {t('aiGuru.ready_subtitle')}
        </Text>
      </FadeInUp>

      <FadeInUp delay={380} style={styles.speakWrap}>
        <PressableScale
          accessibilityLabel={t('aiGuru.tap_and_speak')}
          onPress={onVoicePress}
          scaleTo={0.96}
        >
          <Glass tint={0.72} style={styles.speakButton}>
            <View style={styles.micWrap}>
              <Animated.View
                style={[
                  styles.micPulse,
                  {
                    opacity: micPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.45, 0],
                    }),
                    transform: [
                      {
                        scale: micPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.9],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <LinearGradient
                colors={GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mic}
              >
                <Mic size={rf(20)} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.speakTitle}>{t('aiGuru.tap_to_speak')}</Text>
              <Text style={styles.speakHint}>{t('aiGuru.speak_languages')}</Text>
            </View>
          </Glass>
        </PressableScale>
      </FadeInUp>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  visual: {
    width: RING + 40,
    height: RING + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(34,197,94,0.55)',
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
  },
  // Shadow kept off the orb itself: its overflow: hidden would clip it on iOS
  orbShadow: {
    borderRadius: ORB / 2,
    shadowColor: '#16A34A',
    shadowOpacity: 0.35,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
  },
  orb: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbImage: {
    width: ORB - 14,
    height: ORB - 14,
  },
  orbSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ORB * 0.5,
  },
  greeting: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: rf(15),
    fontWeight: '600',
    color: COLORS.green,
  },
  title: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: rf(30),
    lineHeight: rf(36),
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: rf(14),
    lineHeight: rf(21),
    color: COLORS.muted,
  },
  speakWrap: {
    marginTop: 26,
  },
  speakButton: {
    height: 66,
    paddingLeft: 10,
    paddingRight: 26,
    borderRadius: 33,
    borderColor: COLORS.greenBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#16A34A',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  micWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
  },
  mic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakTitle: {
    fontSize: rf(16),
    fontWeight: '800',
    color: COLORS.text,
  },
  speakHint: {
    marginTop: 1,
    fontSize: rf(12),
    color: COLORS.muted,
  },
});
