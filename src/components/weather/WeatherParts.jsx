import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MapPin } from 'lucide-react-native';

import AnimatedWeatherArt from './AnimatedWeatherArt';
import { artKindFor } from './WeatherArt';

export const WEATHER_BG = require('../../assets/weather/hero.png');

export const W = {
  dark: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  bg: '#F4F7F6',
  white: '#FFFFFF',
  border: '#E5EAF0',
  green: '#15803D',
  greenDark: '#14532D',
  blue: '#0284C7',
};

export const W_SHADOW = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

const TONES = {
  good: { color: '#15803D', bg: '#DCFCE7', label: 'Good' },
  caution: { color: '#B45309', bg: '#FEF3C7', label: 'Careful' },
  avoid: { color: '#B91C1C', bg: '#FEE2E2', label: 'Avoid' },
};

/*
 * Fades and slides its children in after `delay` ms, so sections of a
 * screen appear one after another.
 */
export function FadeIn({ delay = 0, children, style }) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, value]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/*
 * The landscape card (sky on the left, hills on the right) with the
 * weather written over the clear sky.
 *
 * stats: [{icon, label, value}] shown as frosted chips at the bottom.
 */
export function WeatherHeroCard({
  place,
  subtitle,
  temp,
  condition,
  icon,
  meta,
  description,
  stats = [],
}) {
  return (
    <View style={styles.heroWrap}>
      <ImageBackground
        source={WEATHER_BG}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.96)',
            'rgba(255,255,255,0.85)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.4, 0.7, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(20,83,45,0.35)']}
          style={styles.heroBottomShade}
        />

        <View style={styles.placeRow}>
          <View style={styles.placeIcon}>
            <MapPin size={13} color={W.green} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.place} numberOfLines={1}>
              {place}
            </Text>
            {!!subtitle && (
              <Text style={styles.updated} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.nowRow}>
          <View style={styles.iconBubble}>
            <AnimatedWeatherArt kind={artKindFor(icon, condition)} size={56} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.temp}>{temp}</Text>
            <Text style={styles.condition} numberOfLines={1}>
              {condition}
            </Text>
          </View>
        </View>

        {!!meta && <Text style={styles.meta}>{meta}</Text>}
        {!!description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {stats.length > 0 && (
          <View style={styles.stats}>
            {stats.map(({ icon: Icon, label, value, color }) => (
              <View key={label} style={styles.stat}>
                <Icon size={15} color={color || W.green} />
                <Text style={styles.statValue} numberOfLines={1}>
                  {value}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

export function SectionHeader({ title, subtitle, right }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.flex}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function AdviceCard({ icon: Icon, advice }) {
  const tone = TONES[advice.tone] || TONES.good;

  return (
    <View style={styles.advice}>
      <View style={[styles.adviceStripe, { backgroundColor: tone.color }]} />
      <View style={[styles.adviceIcon, { backgroundColor: tone.bg }]}>
        <Icon size={19} color={tone.color} />
      </View>
      <View style={styles.flex}>
        <View style={styles.adviceHead}>
          <Text style={styles.adviceTitle} numberOfLines={1}>
            {advice.title}
          </Text>
          <Text
            style={[
              styles.adviceTag,
              { color: tone.color, backgroundColor: tone.bg },
            ]}
          >
            {tone.label}
          </Text>
        </View>
        <Text style={styles.adviceText}>{advice.text}</Text>
      </View>
    </View>
  );
}

export function DetailTile({ icon: Icon, color, label, value, note }) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: `${color}1A` }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
      {!!note && (
        <Text style={styles.tileNote} numberOfLines={1}>
          {note}
        </Text>
      )}
    </View>
  );
}

/*
 * Grey placeholder block with a light sweep moving across it.
 */
export function Skeleton({ style }) {
  const sweep = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  return (
    <View
      style={[styles.skeleton, style]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Animated.View
          style={[
            styles.skeletonSweep,
            {
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, width],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,0.65)',
              'rgba(255,255,255,0)',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  heroWrap: { borderRadius: 26, ...W_SHADOW },
  hero: {
    borderRadius: 26,
    overflow: 'hidden',
    padding: 16,
    minHeight: 250,
    backgroundColor: '#DDEFF8',
  },
  heroImage: { borderRadius: 26 },
  heroBottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  placeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  place: { fontSize: 15, fontWeight: '900', color: W.dark },
  updated: { fontSize: 11, fontWeight: '600', color: W.muted, marginTop: 1 },
  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...W_SHADOW,
  },
  temp: {
    fontSize: 50,
    lineHeight: 56,
    fontWeight: '900',
    color: W.dark,
    letterSpacing: -2,
  },
  condition: { fontSize: 15, fontWeight: '800', color: W.text },
  meta: { fontSize: 12.5, fontWeight: '700', color: W.text, marginTop: 8 },
  description: {
    width: '62%',
    fontSize: 12,
    fontWeight: '600',
    color: W.muted,
    marginTop: 4,
    lineHeight: 17,
  },
  stats: { flexDirection: 'row', gap: 8, marginTop: 16 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  statValue: { fontSize: 13.5, fontWeight: '900', color: W.dark, marginTop: 3 },
  statLabel: { fontSize: 10, fontWeight: '700', color: W.muted, marginTop: 1 },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: W.dark,
    letterSpacing: -0.3,
  },
  sectionSub: { fontSize: 12, fontWeight: '600', color: W.muted, marginTop: 2 },

  advice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingLeft: 16,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: W.white,
    overflow: 'hidden',
    ...W_SHADOW,
  },
  adviceStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  adviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adviceTitle: { flex: 1, fontSize: 14.5, fontWeight: '900', color: W.dark },
  adviceTag: {
    fontSize: 10.5,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  adviceText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: W.text,
    marginTop: 3,
    lineHeight: 18,
  },

  tile: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 20,
    backgroundColor: W.white,
    ...W_SHADOW,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 12, fontWeight: '800', color: W.muted, marginTop: 10 },
  tileValue: { fontSize: 21, fontWeight: '900', color: W.dark, marginTop: 2 },
  tileNote: { fontSize: 11.5, fontWeight: '600', color: W.muted, marginTop: 2 },

  skeleton: {
    backgroundColor: '#E8EDF2',
    borderRadius: 10,
    overflow: 'hidden',
  },
  skeletonSweep: { ...StyleSheet.absoluteFillObject },
});
