import React, {useEffect, useRef} from 'react';

import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle, Defs, LinearGradient as SvgGradient, Stop} from 'react-native-svg';

import {
  CalendarDays,
  RefreshCw,
  Sparkles,
  Sprout,
  Wheat,
} from 'lucide-react-native';

import {COLORS, formatRelativeTime, getHealthBand} from './advisoryTheme';

const RING_SIZE = 118;
const RING_STROKE = 11;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/*
|--------------------------------------------------------------------------
| HEALTH RING
|--------------------------------------------------------------------------
*/

function HealthRing({percentage, color}) {
  const progress = useRef(new Animated.Value(0)).current;
  const hasValue = Number.isFinite(Number(percentage));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: hasValue ? Math.max(0, Math.min(100, Number(percentage))) : 0,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percentage, hasValue, progress]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#B9F6CF" />
            <Stop offset="1" stopColor={color} />
          </SvgGradient>
        </Defs>

        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={RING_STROKE}
          fill="none"
        />

        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="url(#ring)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>

      <View style={styles.ringCenter} pointerEvents="none">
        <Text style={styles.ringValue}>
          {hasValue ? Math.round(Number(percentage)) : '--'}
          {hasValue ? <Text style={styles.ringPercent}>%</Text> : null}
        </Text>

        <Text style={styles.ringLabel}>CROP HEALTH</Text>
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STAT
|--------------------------------------------------------------------------
*/

function PulseStat({icon: Icon, label, value}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Icon size={14} color="#FFFFFF" strokeWidth={2.2} />
      </View>

      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

export default function AdvisoryPulseCard({
  advisory,
  farm,
  generating,
  onRefresh,
}) {
  const cropHealth = advisory?.cropHealth;
  const growth = advisory?.plantGrowthActivity;
  const isBarren = Boolean(farm?.isBarrenLand);

  const band = isBarren
    ? {
        label: 'Pre-sowing',
        color: '#8BE5A9',
        textColor: '#FFFFFF',
        soft: 'rgba(255,255,255,0.14)',
      }
    : getHealthBand(cropHealth?.percentage);

  const cropAgeDays =
    growth?.cropAgeDays ??
    (farm?.sowingDate
      ? Math.max(
          0,
          Math.floor((Date.now() - new Date(farm.sowingDate).getTime()) / 86400000),
        )
      : null);

  const standardYield = advisory?.yield?.standardYield;
  const yieldUnit = advisory?.yield?.unit === 'tons' ? 't' : 'q';

  return (
    <LinearGradient
      colors={[COLORS.forest, COLORS.forestDeep]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      {/* ====================================================
          HEADER
      ==================================================== */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={13} color={COLORS.mint} strokeWidth={2.4} />

          <Text style={styles.eyebrow}>SMART FIELD PULSE</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={generating}
          onPress={onRefresh}
          style={styles.refreshButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          {generating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <RefreshCw size={14} color="#FFFFFF" strokeWidth={2.4} />
          )}

          <Text style={styles.refreshText}>
            {generating ? 'Updating' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ====================================================
          RING + SUMMARY
      ==================================================== */}

      <View style={styles.body}>
        <HealthRing
          percentage={isBarren ? null : cropHealth?.percentage}
          color={band.color}
        />

        <View style={styles.summary}>
          <View style={[styles.bandChip, {backgroundColor: band.soft}]}>
            <View style={[styles.bandDot, {backgroundColor: band.color}]} />

            <Text
              style={[
                styles.bandText,
                {color: band.textColor || band.color},
              ]}>
              {band.label}
            </Text>
          </View>

          <Text style={styles.stageTitle} numberOfLines={2}>
            {growth?.stageName || (isBarren ? 'Field preparation' : 'Analysing crop')}
          </Text>

          {cropHealth?.recommendation ? (
            <Text style={styles.recommendation} numberOfLines={4}>
              {cropHealth.recommendation}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ====================================================
          STATS
      ==================================================== */}

      <View style={styles.stats}>
        <PulseStat
          icon={CalendarDays}
          label="Crop age"
          value={cropAgeDays != null ? `${cropAgeDays} days` : '—'}
        />

        <View style={styles.statDivider} />

        <PulseStat
          icon={Sprout}
          label="BBCH stage"
          value={growth?.bbchStage != null ? `${growth.bbchStage}` : '—'}
        />

        <View style={styles.statDivider} />

        <PulseStat
          icon={Wheat}
          label="Std. yield"
          value={
            standardYield != null
              ? `${Number(standardYield).toFixed(1)} ${yieldUnit}`
              : '—'
          }
        />
      </View>

      {advisory?.createdAt ? (
        <Text style={styles.updated}>
          Updated {formatRelativeTime(advisory.createdAt)}
          {advisory.activitiesSource === 'llm' ? ' · AI agronomist' : ' · Agronomy engine'}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 25,
    padding: 18,
    overflow: 'hidden',
  },

  glowOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -90,
    top: -110,
    backgroundColor: 'rgba(110,231,162,0.10)',
  },

  glowTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    left: -80,
    bottom: -90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginLeft: 6,
  },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  refreshText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 6,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },

  ringPercent: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
  },

  ringLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 1,
  },

  summary: {
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
  },

  bandChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  bandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  bandText: {
    fontSize: 10,
    fontWeight: '900',
  },

  stageTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },

  recommendation: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 5,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  statLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 6,
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  updated: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 14,
  },
});
