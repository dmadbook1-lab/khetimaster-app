import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import {
  Check,
  MessageCircle,
  ArrowLeft,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { COLORS, rf, PAGE_PADDING } from '../../theme';
const STATS = [
  {
    value: '1.2K+',
    label: 'Farmers\nnearby',
    color: COLORS.DARK_GREEN,
    icon: Users,
  },
  {
    value: '~2 hrs',
    label: 'Avg. response\ntime',
    color: COLORS.ORANGE,
    icon: Clock,
  },
  {
    value: 'AI',
    label: 'Analysis\nready',
    color: COLORS.DARK_GREEN,
    icon: Sparkles,
  },
];
const CONFETTI = [
  {
    top: 20,
    left: 30,
    color: COLORS.ORANGE,
    size: 10,
    rotate: '0deg',
  },
  {
    top: 40,
    right: 40,
    color: COLORS.DARK_GREEN,
    size: 12,
    rotate: '45deg',
  },
  {
    top: 10,
    right: 90,
    color: COLORS.ORANGE,
    size: 8,
    rotate: '20deg',
  },
  {
    bottom: 30,
    left: 20,
    color: COLORS.ORANGE,
    size: 10,
    rotate: '45deg',
  },
  {
    bottom: 50,
    right: 20,
    color: COLORS.DARK_GREEN,
    size: 11,
    rotate: '30deg',
  },
  {
    top: 60,
    left: 10,
    color: COLORS.DARK_GREEN,
    size: 8,
    rotate: '15deg',
  },
  {
    bottom: 20,
    left: 90,
    color: COLORS.ORANGE,
    size: 9,
    rotate: '60deg',
  },
  {
    top: 80,
    right: 10,
    color: COLORS.ORANGE,
    size: 7,
    rotate: '20deg',
  },
];
const STARS = [
  {
    top: 8,
    left: 60,
    char: '★',
    color: COLORS.ORANGE,
    size: 12,
  },
  {
    top: 25,
    right: 25,
    char: '★',
    color: COLORS.DARK_GREEN,
    size: 14,
  },
  {
    bottom: 45,
    left: 40,
    char: '✦',
    color: COLORS.DARK_GREEN,
    size: 10,
  },
  {
    top: 55,
    left: 8,
    char: '✦',
    color: COLORS.ORANGE,
    size: 11,
  },
];
export default function Step3Success({ onViewDiscussion, onBackToCommunity }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 400,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scaleAnim, opacityAnim, pulseAnim]);
  return (
    <View style={styles.flex}>
      {}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>KhetiMaster Community</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <View style={styles.circleWrap}>
          {}
          {CONFETTI.map((c, i) => (
            <View
              key={`c-${i}`}
              style={[
                styles.confetti,
                {
                  top: c.top,
                  bottom: c.bottom,
                  left: c.left,
                  right: c.right,
                  width: c.size,
                  height: c.size,
                  backgroundColor: c.color,
                  transform: [
                    {
                      rotate: c.rotate,
                    },
                  ],
                },
              ]}
            />
          ))}

          {}
          {STARS.map((s, i) => (
            <Text
              key={`s-${i}`}
              style={[
                styles.star,
                {
                  top: s.top,
                  bottom: s.bottom,
                  left: s.left,
                  right: s.right,
                  color: s.color,
                  fontSize: s.size,
                },
              ]}
            >
              {s.char}
            </Text>
          ))}

          {}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [
                  {
                    scale: pulseAnim,
                  },
                ],
              },
            ]}
          />

          {}
          <View style={styles.outerCircle}>
            {}
            <Animated.View
              style={[
                styles.innerCircle,
                {
                  transform: [
                    {
                      scale: scaleAnim,
                    },
                  ],
                },
              ]}
            >
              <Check size={rf(40)} color="#FFFFFF" strokeWidth={3.5} />
            </Animated.View>

            {}
            <View style={styles.circleStem} />
            <View style={styles.circleShadow} />
          </View>
        </View>

        {}
        <Animated.View
          style={{
            opacity: opacityAnim,
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>
            Your question has been{'\n'}shared successfully!
          </Text>
          <Text style={styles.sub}>
            Farmers and experts in your area will be notified. You will receive
            answers soon.
          </Text>
        </Animated.View>

        {}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: s.color,
                  },
                ]}
              >
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {}
        <View style={styles.ctaWrap}>
          <PrimaryButton
            label="View Discussion"
            icon={MessageCircle}
            onPress={onViewDiscussion}
          />

          <View
            style={{
              height: 10,
            }}
          />

          <SecondaryButton
            label="Back to Community"
            icon={ArrowLeft}
            onPress={onBackToCommunity}
          />
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  scroll: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  circleWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  star: {
    position: 'absolute',
    fontWeight: '900',
  },
  pulseRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#EAFBF0',
    opacity: 0.5,
  },
  outerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },
  circleStem: {
    position: 'absolute',
    bottom: -14,
    width: 16,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.DARK_GREEN,
  },
  circleShadow: {
    position: 'absolute',
    bottom: -30,
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  title: {
    marginTop: 26,
    textAlign: 'center',
    fontSize: rf(20),
    lineHeight: rf(27),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  sub: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: rf(12),
    lineHeight: rf(17),
    fontWeight: '500',
    color: COLORS.MUTED,
    paddingHorizontal: 20,
  },
  statsRow: {
    marginTop: 28,
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: rf(16),
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  ctaWrap: {
    marginTop: 28,
    alignSelf: 'stretch',
  },
});
