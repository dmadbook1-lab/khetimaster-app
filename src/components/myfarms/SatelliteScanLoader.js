import { useTranslation } from 'react-i18next';
import React, {useEffect, useRef, useState} from 'react';

import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

import {Satellite} from 'lucide-react-native';

const MINT = '#6EE7A2';

const ORBIT = 150;
const CORE = 64;

const STEPS = [
  'farms.scan_step_1',
  'farms.scan_step_2',
  'farms.scan_step_3',
  'farms.scan_step_4',
];

/*
|--------------------------------------------------------------------------
| SATELLITE SCAN LOADER
|--------------------------------------------------------------------------
|
| Full-bleed overlay for the crop-monitoring map: a satellite orbits the
| field, a radar sweep rotates and a scan line passes over the map.
|
*/

export default function SatelliteScanLoader({title, mapOnly}) {
  const { t } = useTranslation();
  const orbit = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const [step, setStep] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const loop = (value, duration, easing = Easing.linear) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing,
          useNativeDriver: true,
        }),
      );

    const animations = [
      loop(orbit, 4200),
      loop(sweep, 2400),
      loop(pulse, 2000, Easing.out(Easing.quad)),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scan, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scan, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    animations.forEach(a => a.start());

    Animated.timing(fade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    const timer = setInterval(() => {
      setStep(s => (s + 1) % STEPS.length);
    }, 1800);

    return () => {
      animations.forEach(a => a.stop());
      clearInterval(timer);
    };
  }, [orbit, sweep, pulse, scan, fade]);

  const orbitRotate = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterRotate = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const sweepRotate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scanY = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, height - 2)],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, {opacity: fade}]}
      onLayout={e => setHeight(e.nativeEvent.layout.height)}>
      {/* Scan line sweeping the whole map */}

      <Animated.View
        style={[styles.scanBand, {transform: [{translateY: scanY}]}]}>
        <View style={styles.scanGlow} />
        <View style={styles.scanLine} />
      </Animated.View>

      <View style={styles.stage}>
        {/* Expanding pulse rings */}

        {[0, 0.5].map(offset => {
          const p = Animated.modulo(Animated.add(pulse, offset), 1);

          return (
            <Animated.View
              key={offset}
              style={[
                styles.pulseRing,
                {
                  opacity: p.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.55, 0],
                  }),
                  transform: [
                    {
                      scale: p.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Orbit track */}

        <View style={styles.orbitTrack} />

        {/* Radar core with rotating sweep */}

        <View style={styles.core}>
          <Animated.View
            style={[styles.sweepWrap, {transform: [{rotate: sweepRotate}]}]}>
            <View style={styles.sweepArm} />
          </Animated.View>

          <View style={styles.fieldGrid}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={styles.fieldPlot} />
            ))}
          </View>
        </View>

        {/* Orbiting satellite */}

        <Animated.View
          style={[styles.orbit, {transform: [{rotate: orbitRotate}]}]}>
          <Animated.View
            style={[styles.satellite, {transform: [{rotate: counterRotate}]}]}>
            <Satellite size={17} color="#07431E" strokeWidth={2.4} />
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.textBox}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>
          {mapOnly ? t('farms.preparing_basemap') : t(STEPS[step])}
        </Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, (mapOnly ? 0 : step) === i && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 38, 18, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  scanBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  scanGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -14,
    height: 30,
    backgroundColor: 'rgba(110, 231, 162, 0.10)',
  },

  scanLine: {
    height: 2,
    backgroundColor: MINT,
    opacity: 0.85,
  },

  stage: {
    width: ORBIT + 30,
    height: ORBIT + 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pulseRing: {
    position: 'absolute',
    width: ORBIT,
    height: ORBIT,
    borderRadius: ORBIT / 2,
    borderWidth: 1.5,
    borderColor: MINT,
  },

  orbitTrack: {
    position: 'absolute',
    width: ORBIT,
    height: ORBIT,
    borderRadius: ORBIT / 2,
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 162, 0.35)',
    borderStyle: 'dashed',
  },

  core: {
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    backgroundColor: 'rgba(22, 136, 62, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(110, 231, 162, 0.7)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sweepWrap: {
    ...StyleSheet.absoluteFillObject,
  },

  sweepArm: {
    position: 'absolute',
    top: 0,
    left: CORE / 2,
    width: CORE / 2,
    height: CORE / 2,
    backgroundColor: 'rgba(110, 231, 162, 0.45)',
    borderTopRightRadius: CORE / 2,
  },

  fieldGrid: {
    width: 26,
    height: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },

  fieldPlot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  orbit: {
    position: 'absolute',
    width: ORBIT,
    height: ORBIT,
    alignItems: 'center',
  },

  satellite: {
    width: 32,
    height: 32,
    marginTop: -16,
    borderRadius: 11,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: MINT,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },

  textBox: {
    alignItems: 'center',
    marginTop: 10,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },

  dots: {
    flexDirection: 'row',
    marginTop: 10,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  dotActive: {
    width: 16,
    backgroundColor: MINT,
  },
});
