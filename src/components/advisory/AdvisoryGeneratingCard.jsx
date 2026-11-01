import { useTranslation } from 'react-i18next';
import React, {useEffect, useRef, useState} from 'react';

import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {Check, Satellite} from 'lucide-react-native';

import {COLORS} from './advisoryTheme';

/** Mirrors the backend pipeline order. */
const STEPS = [
  'advisory.gen_step_1',
  'advisory.gen_step_2',
  'advisory.gen_step_3',
  'advisory.gen_step_4',
  'advisory.gen_step_5',
  'advisory.gen_step_6',
];

const STEP_MS = 3500;

export default function AdvisoryGeneratingCard() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();

    const timer = setInterval(() => {
      setStep(current => Math.min(current + 1, STEPS.length - 1));
    }, STEP_MS);

    return () => {
      loop.stop();
      clearInterval(timer);
    };
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[COLORS.forest, COLORS.forestDeep]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.card}>
      <View style={styles.orbitWrap}>
        <View style={styles.planet} />

        <Animated.View style={[styles.orbit, {transform: [{rotate}]}]}>
          <View style={styles.satellite}>
            <Satellite size={15} color={COLORS.forest} strokeWidth={2.4} />
          </View>
        </Animated.View>
      </View>

      <Text style={styles.title}>{t('advisory.preparing')}</Text>

      <Text style={styles.subtitle}>
        {t('advisory.preparing_sub')}
      </Text>

      <View style={styles.steps}>
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;

          return (
            <View key={label} style={styles.stepRow}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}>
                {done ? <Check size={9} color={COLORS.forest} strokeWidth={3.5} /> : null}
              </View>

              <Text
                style={[
                  styles.stepText,
                  (done || active) && styles.stepTextActive,
                ]}>
                {t(label)}
              </Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const ORBIT = 92;

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 25,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },

  orbitWrap: {
    width: ORBIT,
    height: ORBIT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  planet: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3FAF6A',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  orbit: {
    position: 'absolute',
    width: ORBIT,
    height: ORBIT,
    borderRadius: ORBIT / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.28)',
  },

  satellite: {
    position: 'absolute',
    top: -13,
    left: ORBIT / 2 - 13,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 16,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  steps: {
    alignSelf: 'stretch',
    marginTop: 18,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },

  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  stepDotDone: {
    backgroundColor: COLORS.mint,
    borderColor: COLORS.mint,
  },

  stepDotActive: {
    borderColor: COLORS.mint,
    borderWidth: 2,
  },

  stepText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
  },

  stepTextActive: {
    color: '#FFFFFF',
  },
});
