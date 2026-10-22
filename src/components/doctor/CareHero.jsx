import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import HeroBanner, { bannerHeightFor } from '../common/HeroBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { CARE as C, CARE_GRADIENTS } from './careTheme';

/*
|--------------------------------------------------------------------------
| TOP BAR
|--------------------------------------------------------------------------
|
| Sits on the light page background under the status bar. Screens use
| edges={['left', 'right']} and render this first.
|
*/

export function CareTopBar({ title, subtitle, onBack, right }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {onBack ? (
        <CareIconButton onPress={onBack}>
          <ArrowLeft size={20} color={C.ink} />
        </CareIconButton>
      ) : (
        <View style={styles.iconSpacer} />
      )}

      <View style={styles.topTitleBox}>
        {!!title && (
          <Text style={styles.topTitle} numberOfLines={1}>
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text style={styles.topSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.topRight}>
        {right || <View style={styles.iconSpacer} />}
      </View>
    </View>
  );
}

export function CareIconButton({ children, onPress, badge, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.iconButton, style]}
      onPress={onPress}
    >
      {children}
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/*
|--------------------------------------------------------------------------
| HERO
|--------------------------------------------------------------------------
|
| Full-width hero, laid out like the labour and machinery heroes, in the
| clinic colours with a heartbeat line. Screens render <TopInset /> (the
| white status-bar strip) above it.
|
| gradient   one of CARE_GRADIENTS keys
| banner     optional wide banner across the top, fading into the hero
| onBack     shows a back button in the top row
| right      top-row buttons (use CareGlassButton)
| aside      element shown to the right of the title (e.g. an avatar)
| children   extra hero content (stats, actions...)
|
*/

const PULSE_PATH =
  'M0 40 H70 L82 18 L96 62 L110 6 L124 52 L134 40 H200 L210 30 L220 48 L228 40 H400';

// colour the doctor banner fades into
const BANNER_TINT = '#0A3F45';

export function CareGlassButton({ children, onPress, badge, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.glassButton, style]}
      onPress={onPress}
    >
      {children}
      {badge > 0 && (
        <View style={[styles.badge, styles.glassBadge]}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function CareHero({
  eyebrow,
  title,
  subtitle,
  gradient = 'care',
  banner,
  onBack,
  right,
  aside,
  children,
  compact = false,
  style,
}) {
  const colors = CARE_GRADIENTS[gradient] || CARE_GRADIENTS.care;

  const content = (
    <View style={[styles.inner, compact && styles.innerCompact]}>
      {!banner && (
        <Svg
          pointerEvents="none"
          width="100%"
          height={80}
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          style={styles.pulse}
        >
          <Path
            d={PULSE_PATH}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={2.5}
            fill="none"
            strokeLinejoin="round"
          />
        </Svg>
      )}
      {!banner && (
        <Text pointerEvents="none" style={[styles.cross, styles.crossOne]}>
          +
        </Text>
      )}

      {(onBack || right) && (
        <View style={styles.topRow}>
          {onBack ? (
            <CareGlassButton onPress={onBack}>
              <ArrowLeft size={20} color={C.white} />
            </CareGlassButton>
          ) : (
            <View style={styles.iconSpacer} />
          )}
          <View style={styles.topRight}>{right}</View>
        </View>
      )}

      {!!banner && <View style={{ height: bannerHeightFor() - 150 }} />}

      <View style={styles.heroRow}>
        <View style={styles.heroText}>
          {!!eyebrow && (
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText} numberOfLines={1}>
                {eyebrow}
              </Text>
            </View>
          )}
          {!!title && (
            <Text style={[styles.title, compact && styles.titleCompact]}>
              {title}
            </Text>
          )}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {aside}
      </View>

      {children}
    </View>
  );

  if (banner) {
    return (
      <View style={[styles.hero, { backgroundColor: BANNER_TINT }, style]}>
        <HeroBanner source={banner} tint={BANNER_TINT} />
        {content}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, style]}
    >
      {content}
    </LinearGradient>
  );
}

/*
 * Frosted stat tile for hero cards.
 */
export function CareStat({ value, label, highlight }) {
  return (
    <View style={[styles.stat, highlight && styles.statHighlight]}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text
        style={[styles.statLabel, highlight && styles.statLabelHighlight]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: C.bg,
  },
  topTitleBox: { flex: 1 },
  topTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.3,
  },
  topSubtitle: { fontSize: 11.5, fontWeight: '600', color: C.muted },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconSpacer: { width: 42 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: C.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  badgeText: { color: C.white, fontSize: 9.5, fontWeight: '900' },

  hero: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  inner: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24 },
  innerCompact: { paddingBottom: 18 },
  pulse: { position: 'absolute', left: 0, right: 0, top: 70 },
  cross: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.1)',
    fontWeight: '900',
  },
  crossOne: { fontSize: 120, right: 10, top: -30 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBadge: { borderColor: C.tealDark },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  heroText: { flex: 1 },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#5EEAD4',
  },
  eyebrowText: {
    color: C.white,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: C.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 33,
  },
  titleCompact: { fontSize: 22, lineHeight: 27 },
  subtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  stat: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statHighlight: { backgroundColor: C.white, borderColor: C.white },
  statValue: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statValueHighlight: { color: C.coral },
  statLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  statLabelHighlight: { color: C.text },
});
