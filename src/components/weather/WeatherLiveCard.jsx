import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronRight,
  CloudRain,
  Droplets,
  MapPin,
  SprayCan,
  Sun,
  Wind,
} from 'lucide-react-native';

import WeatherArt, { artKindFor } from './WeatherArt';
import AnimatedWeatherArt from './AnimatedWeatherArt';
import { weatherVisual } from './weatherVisuals';
import {
  formatTemp,
  hourLabel,
  round,
  sprayAdvice,
  upcomingHours,
  windDirection,
} from '../../utils/weatherFormat';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - width * 0.11;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const TIP_TONE = {
  good: { bg: 'rgba(74,222,128,0.22)', border: 'rgba(134,239,172,0.55)' },
  caution: { bg: 'rgba(251,191,36,0.22)', border: 'rgba(253,230,138,0.55)' },
  avoid: { bg: 'rgba(248,113,113,0.24)', border: 'rgba(252,165,165,0.55)' },
};

const todayText = () => {
  const now = new Date();
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${
    MONTHS[now.getMonth()]
  }`;
};

/*
 * A soft white cloud shape drifting slowly across the sky.
 */
function DriftingCloud({ top, scale, duration, delay }) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.cloud,
        {
          top,
          transform: [
            {
              translateX: value.interpolate({
                inputRange: [0, 1],
                outputRange: [-140, CARD_WIDTH + 20],
              }),
            },
            { scale },
          ],
        },
      ]}
    >
      <View style={[styles.cloudPuff, styles.cloudPuffLeft]} />
      <View style={[styles.cloudPuff, styles.cloudPuffMid]} />
      <View style={[styles.cloudPuff, styles.cloudPuffRight]} />
    </Animated.View>
  );
}

/*
 * Live weather widget: a sky that matches the weather, an animated
 * illustration, a farm tip, key numbers and the next few hours.
 *
 * data   local weather from useLocalWeather (needs data.current)
 * onPress optional; without it the card isn't tappable
 */
export default function WeatherLiveCard({ data, place, onPress, style }) {
  const current = data?.current;
  const days = data?.days || [];
  const today = days[0];

  if (!current) return null;

  const visual = weatherVisual(current.icon, current.conditions);
  const kind = artKindFor(current.icon, current.conditions);
  const tip = sprayAdvice(today);
  const tone = TIP_TONE[tip.tone] || TIP_TONE.good;
  const nowEpoch = current.datetimeEpoch || Math.floor(Date.now() / 1000);
  const nextHours = upcomingHours(days, nowEpoch, 6).slice(1, 6);
  const isNight = kind === 'moon' || kind === 'moonCloud';

  const metrics = [
    {
      Icon: Droplets,
      value: `${round(current.humidity) ?? '--'}%`,
      label: 'Humidity',
    },
    {
      Icon: Wind,
      value: `${round(current.windspeed) ?? '--'}`,
      unit: 'km/h',
      label: windDirection(current.winddir) || 'Wind',
    },
    {
      Icon: CloudRain,
      value: `${round(today?.precipprob) ?? 0}%`,
      label: 'Rain',
    },
    { Icon: Sun, value: String(round(current.uvindex) ?? 0), label: 'UV' },
  ];

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.94 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.wrap, style]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel="Weather now"
    >
      <LinearGradient
        colors={visual.sky}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.card}
      >
        {/* sky decoration */}
        <View pointerEvents="none" style={styles.sunGlow} />
        {!isNight && (
          <>
            <DriftingCloud top={10} scale={0.9} duration={26000} delay={0} />
            <DriftingCloud top={96} scale={0.6} duration={34000} delay={9000} />
          </>
        )}
        {isNight && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {[
              [18, 22],
              [62, 12],
              [140, 30],
              [210, 18],
              [96, 58],
            ].map(([left, top]) => (
              <View
                key={`${left}-${top}`}
                style={[styles.star, { left, top }]}
              />
            ))}
          </View>
        )}

        {/* TOP */}
        <View style={styles.topRow}>
          <View style={styles.live}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{todayText()}</Text>
          </View>
          <View style={styles.placePill}>
            <MapPin size={11} color="#FFFFFF" />
            <Text style={styles.placeText} numberOfLines={1}>
              {place}
            </Text>
          </View>
        </View>

        {/* NOW */}
        <View style={styles.nowRow}>
          <View style={styles.flex}>
            <View style={styles.tempRow}>
              <Text style={styles.temp}>{round(current.temp) ?? '--'}</Text>
              <Text style={styles.tempUnit}>°C</Text>
            </View>
            <Text style={styles.condition} numberOfLines={1}>
              {current.conditions}
            </Text>
            <Text style={styles.subline} numberOfLines={1}>
              Feels {formatTemp(current.feelslike)} · H{' '}
              {formatTemp(today?.tempmax)} · L {formatTemp(today?.tempmin)}
            </Text>
          </View>
          <View style={styles.artBox}>
            <AnimatedWeatherArt kind={kind} size={124} />
          </View>
        </View>

        {/* FARM TIP */}
        <View
          style={[
            styles.tip,
            { backgroundColor: tone.bg, borderColor: tone.border },
          ]}
        >
          <SprayCan size={14} color="#FFFFFF" />
          <Text style={styles.tipText} numberOfLines={1}>
            {tip.title}
          </Text>
        </View>

        {/* METRICS */}
        <View style={styles.metrics}>
          {metrics.map(({ Icon, value, unit, label }, index) => (
            <React.Fragment key={label}>
              {index > 0 && <View style={styles.metricDivider} />}
              <View style={styles.metric}>
                <Icon size={15} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.metricValue} numberOfLines={1}>
                  {value}
                  {!!unit && <Text style={styles.metricUnit}> {unit}</Text>}
                </Text>
                <Text style={styles.metricLabel} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* NEXT HOURS */}
        {nextHours.length > 0 && (
          <View style={styles.hours}>
            {nextHours.map(hour => (
              <View key={hour.datetimeEpoch} style={styles.hour}>
                <Text style={styles.hourTime}>{hourLabel(hour.datetime)}</Text>
                <WeatherArt
                  kind={artKindFor(hour.icon, hour.conditions)}
                  size={28}
                />
                <Text style={styles.hourTemp}>{formatTemp(hour.temp)}</Text>
              </View>
            ))}
            {!!onPress && (
              <View style={styles.more}>
                <ChevronRight size={18} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const WHITE = '#FFFFFF';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: {
    marginTop: 22,
    borderRadius: 28,
    shadowColor: '#0C4A6E',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  card: { borderRadius: 28, padding: 16, overflow: 'hidden' },

  sunGlow: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cloud: { position: 'absolute', left: 0, width: 120, height: 44 },
  cloudPuff: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 30,
  },
  cloudPuffLeft: { left: 0, top: 18, width: 60, height: 26 },
  cloudPuffMid: { left: 28, top: 0, width: 50, height: 44 },
  cloudPuffRight: { left: 62, top: 14, width: 58, height: 30 },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  liveText: { color: WHITE, fontSize: rf(12), fontWeight: '800' },
  placePill: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  placeText: {
    flexShrink: 1,
    color: WHITE,
    fontSize: rf(11.5),
    fontWeight: '800',
  },

  nowRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  tempRow: { flexDirection: 'row', alignItems: 'flex-start' },
  temp: {
    color: WHITE,
    fontSize: rf(64),
    lineHeight: rf(70),
    fontWeight: '900',
    letterSpacing: -3,
  },
  tempUnit: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: rf(20),
    fontWeight: '800',
    marginTop: 10,
    marginLeft: 2,
  },
  condition: {
    color: WHITE,
    fontSize: rf(16),
    fontWeight: '900',
    marginTop: -2,
  },
  subline: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: rf(12),
    fontWeight: '700',
    marginTop: 3,
  },
  artBox: { marginRight: -6, marginTop: -8 },

  tip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipText: { color: WHITE, fontSize: rf(12.5), fontWeight: '800' },

  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  metric: { flex: 1, alignItems: 'center' },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  metricValue: {
    color: WHITE,
    fontSize: rf(14),
    fontWeight: '900',
    marginTop: 4,
  },
  metricUnit: { fontSize: rf(10), fontWeight: '700' },
  metricLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: rf(10),
    fontWeight: '700',
    marginTop: 1,
  },

  hours: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  hour: { flex: 1, alignItems: 'center', gap: 3 },
  hourTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: rf(10.5),
    fontWeight: '800',
  },
  hourTemp: { color: WHITE, fontSize: rf(13), fontWeight: '900' },
  more: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
