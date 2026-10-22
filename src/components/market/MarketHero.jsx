import React from 'react';
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_GRADIENTS } from './theme';
import HeroBanner, { bannerHeightFor } from '../common/HeroBanner';

// colour the wide banners fade into
const BANNER_TINT = '#0A3D20';

/*
 * White strip behind the status bar. Hero screens render it first, above
 * their (edge-to-edge) content, so the hero starts below the status bar
 * and the status bar keeps the app's usual dark icons on white.
 */
export function TopInset({ color = '#FFFFFF' }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: insets.top, backgroundColor: color }}>
      <StatusBar barStyle="dark-content" backgroundColor={color} />
    </View>
  );
}

export function GlassButton({ children, onPress, badge, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.glassButton, style]}
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
 * Gradient (or photo + gradient) header used across the marketplace.
 *
 * gradient   one of MARKET_GRADIENTS keys
 * image      optional background photo
 * banner     optional wide banner shown across the top, fading into
 *            the hero colour (text sits below the subjects)
 * eyebrow    small label above the title
 * right      header action buttons (use GlassButton)
 * children   extra hero content (search, stats...)
 */
export default function MarketHero({
  title,
  subtitle,
  eyebrow,
  onBack,
  right,
  gradient = 'green',
  image,
  banner,
  bannerTint = BANNER_TINT,
  children,
  compact = false,
  style,
}) {
  const colors = MARKET_GRADIENTS[gradient] || MARKET_GRADIENTS.green;

  const content = (
    <View
      style={[styles.inner, styles.innerTop, compact && styles.innerCompact]}
    >
      {/* decorative rings */}
      <View pointerEvents="none" style={[styles.ring, styles.ringLarge]} />
      <View pointerEvents="none" style={[styles.ring, styles.ringSmall]} />

      <View style={styles.topRow}>
        {onBack ? (
          <GlassButton onPress={onBack}>
            <ArrowLeft size={20} color={C.white} />
          </GlassButton>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.rightRow}>{right}</View>
      </View>

      {!!banner && <View style={{ height: bannerHeightFor() - 150 }} />}

      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      {!!title && (
        <Text
          style={[styles.title, compact && styles.titleCompact]}
          numberOfLines={2}
        >
          {title}
        </Text>
      )}
      {!!subtitle && (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      )}

      {children}
    </View>
  );

  if (banner) {
    return (
      <View style={[styles.hero, { backgroundColor: bannerTint }, style]}>
        <HeroBanner source={banner} tint={bannerTint} />
        {content}
      </View>
    );
  }

  if (image) {
    return (
      <ImageBackground
        source={image}
        resizeMode="cover"
        style={[styles.hero, style]}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={MARKET_GRADIENTS.photoOverlay}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {content}
      </ImageBackground>
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
 * Frosted stat tile for hero sections.
 */
export function HeroStat({ value, label, highlight }) {
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
  hero: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroImage: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  inner: { paddingHorizontal: 18, paddingBottom: 24 },
  innerTop: { paddingTop: 12 },
  innerCompact: { paddingBottom: 18 },

  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ringLarge: { width: 260, height: 260, right: -90, top: -60 },
  ringSmall: {
    width: 140,
    height: 140,
    right: -20,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spacer: { width: 42 },

  glassButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0E6B35',
  },
  badgeText: { color: '#3A2400', fontSize: 9.5, fontWeight: '900' },

  eyebrow: {
    marginTop: 20,
    alignSelf: 'flex-start',
    color: '#D9F5E3',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  title: {
    marginTop: 12,
    color: C.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 33,
  },
  titleCompact: { fontSize: 22, lineHeight: 27, marginTop: 14 },
  subtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  stat: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statHighlight: { backgroundColor: C.gold, borderColor: C.gold },
  statValue: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statValueHighlight: { color: '#3A2400' },
  statLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  statLabelHighlight: { color: '#5C3B00' },
});
