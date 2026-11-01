import { useTranslation } from 'react-i18next';
import React, {useEffect, useRef} from 'react';

import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

import {Sprout} from 'lucide-react-native';

import {COLORS, GROWTH_STEPS, getGrowthStepIndex} from './advisoryTheme';

/*
|--------------------------------------------------------------------------
| STAGE NODE
|--------------------------------------------------------------------------
*/

function StageNode({step, state}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const isCurrent = state === 'current';

  useEffect(() => {
    if (!isCurrent) {
      return undefined;
    }

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
  }, [isCurrent, pulse]);

  const haloScale = pulse.interpolate({inputRange: [0, 1], outputRange: [1, 1.7]});
  const haloOpacity = pulse.interpolate({inputRange: [0, 1], outputRange: [0.45, 0]});

  return (
    <View style={styles.node}>
      <View style={styles.nodeCircleWrap}>
        {isCurrent ? (
          <Animated.View
            style={[
              styles.halo,
              {opacity: haloOpacity, transform: [{scale: haloScale}]},
            ]}
          />
        ) : null}

        <View
          style={[
            styles.nodeCircle,
            state === 'done' && styles.nodeDone,
            isCurrent && styles.nodeCurrent,
          ]}>
          <Text style={[styles.nodeEmoji, state === 'upcoming' && styles.nodeEmojiMuted]}>
            {step.emoji}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.nodeLabel,
          state !== 'upcoming' && styles.nodeLabelActive,
          isCurrent && styles.nodeLabelCurrent,
        ]}>
        {step.label}
      </Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

export default function GrowthJourneyCard({growth, isBarren}) {
  const { t } = useTranslation();
  const fill = useRef(new Animated.Value(0)).current;

  const bbch = Number(growth?.bbchStage) || 0;
  const currentIndex = isBarren ? 0 : getGrowthStepIndex(bbch);
  const overall = Math.max(0, Math.min(100, Number(growth?.overallProgress) || 0));
  const stageProgress = Math.max(0, Math.min(100, Number(growth?.stageProgress) || 0));

  // Track fill: completed segments + partial progress in the current segment.
  const segment = 100 / (GROWTH_STEPS.length - 1);
  const trackPercent = Math.min(
    100,
    currentIndex * segment +
      (currentIndex < GROWTH_STEPS.length - 1 ? (stageProgress / 100) * segment : 0),
  );

  useEffect(() => {
    Animated.timing(fill, {
      toValue: trackPercent,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [trackPercent, fill]);

  if (!growth) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Sprout size={18} color={COLORS.green} strokeWidth={2.3} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{t('advisory.growth_journey')}</Text>

          <Text style={styles.subtitle}>
            {isBarren
              ? t('advisory.pre_sowing_prep')
              : t('advisory.season_complete', {bbch, pct: Math.round(overall)})}
          </Text>
        </View>
      </View>

      {/* ====================================================
          STAGE TRACK
      ==================================================== */}

      <View style={styles.trackArea}>
        <View style={styles.trackLine}>
          <Animated.View
            style={[
              styles.trackFill,
              {
                width: fill.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.nodesRow}>
          {GROWTH_STEPS.map((step, index) => (
            <StageNode
              key={step.key}
              step={step}
              state={
                index < currentIndex
                  ? 'done'
                  : index === currentIndex
                  ? 'current'
                  : 'upcoming'
              }
            />
          ))}
        </View>
      </View>

      {/* ====================================================
          CURRENT STAGE
      ==================================================== */}

      <View style={styles.stageBox}>
        <View style={styles.stageTop}>
          <View style={styles.stageTextWrap}>
            <Text style={styles.stageEyebrow}>{t('advisory.current_stage')}</Text>

            <Text style={styles.stageName}>{growth.stageName || '—'}</Text>

            {growth.description ? (
              <Text style={styles.stageDescription}>{growth.description}</Text>
            ) : null}
          </View>
        </View>

        {!isBarren ? (
          <View style={styles.stageProgressRow}>
            <View style={styles.stageProgressTrack}>
              <View
                style={[styles.stageProgressFill, {width: `${stageProgress}%`}]}
              />
            </View>

            <Text style={styles.stageProgressText}>
              {t('advisory.through_stage', {pct: Math.round(stageProgress)})}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const NODE = 44;

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  trackArea: {
    marginTop: 20,
    justifyContent: 'center',
  },

  trackLine: {
    position: 'absolute',
    top: NODE / 2 - 2,
    left: NODE / 2,
    right: NODE / 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.track,
    overflow: 'hidden',
  },

  trackFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.green,
  },

  nodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  node: {
    alignItems: 'center',
    width: 58,
  },

  nodeCircleWrap: {
    width: NODE,
    height: NODE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  halo: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: COLORS.green,
  },

  nodeCircle: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: '#F4F6F5',
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nodeDone: {
    backgroundColor: COLORS.mintSoft,
    borderColor: '#9ED9B2',
  },

  nodeCurrent: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },

  nodeEmoji: {
    fontSize: 19,
  },

  nodeEmojiMuted: {
    opacity: 0.35,
  },

  nodeLabel: {
    color: '#A5AFAA',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 6,
  },

  nodeLabelActive: {
    color: COLORS.muted,
  },

  nodeLabelCurrent: {
    color: COLORS.forest,
    fontWeight: '900',
  },

  stageBox: {
    marginTop: 16,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#E4EFE7',
  },

  stageTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  stageTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  stageEyebrow: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  stageName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 3,
  },

  stageDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },

  stageProgressRow: {
    marginTop: 12,
  },

  stageProgressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E2EBE5',
    overflow: 'hidden',
  },

  stageProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#3BB26A',
  },

  stageProgressText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 5,
  },
});
