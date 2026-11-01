import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clapperboard,
  Compass,
  Search,
  UsersRound,
} from 'lucide-react-native';
import Avatar from './social/Avatar';
import { FIELD, rf, PAGE_PADDING } from './theme';
import { COMMUNITY_ROUTES } from '../../constants/communityRoutes';

export const COMMUNITY_TABS = [
  { id: 'Community', label: 'Discover', Icon: Compass },
  { id: 'Following', label: 'My Circle', Icon: UsersRound },
  { id: 'Reels', label: 'Field Reels', Icon: Clapperboard },
];

/*
 * Curved field-green header with the section switch built in.
 *
 * collapse             optional Animated value 0 → 1 as the header tucks away
 * onCollapsibleLayout  height of the part above the tabs (what may hide)
 */
export default function CommunityHeader({
  navigation,
  activeTab,
  onTabChange,
  collapse,
  onCollapsibleLayout,
}) {
  const me = useSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();

  const topOpacity = collapse
    ? collapse.interpolate({
        inputRange: [0, 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;

  return (
    <LinearGradient
      colors={[FIELD.DEEP, FIELD.FOREST]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + 8 }]}
    >
      {/* soft wheat glow */}
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.glowSmall} pointerEvents="none" />

      <Animated.View
        style={{ opacity: topOpacity }}
        onLayout={event =>
          onCollapsibleLayout?.(event.nativeEvent.layout.height)
        }
      >
        <View style={styles.topRow}>
          <Pressable
            hitSlop={6}
            style={styles.roundBtn}
            onPress={() => navigation?.goBack()}
            accessibilityLabel="Back"
          >
            <ArrowLeft size={rf(20)} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>

          <View style={styles.titleBox}>
            <Text style={styles.kicker}>KHETIMASTER</Text>
            <Text style={styles.title}>Community</Text>
          </View>

          <Pressable
            hitSlop={6}
            style={styles.roundBtn}
            onPress={() => navigation?.navigate(COMMUNITY_ROUTES.SEARCH)}
            accessibilityLabel="Search"
          >
            <Search size={rf(19)} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>

          <Pressable
            hitSlop={6}
            onPress={() => navigation?.navigate(COMMUNITY_ROUTES.PROFILE)}
            style={styles.meRing}
            accessibilityLabel="My community profile"
          >
            <Avatar user={me && { ...me, _id: me.id }} size={34} />
          </Pressable>
        </View>

        <Text style={styles.tagline}>
          Farmers helping farmers — share what works in your field.
        </Text>
      </Animated.View>

      <View style={styles.switchTrack}>
        {COMMUNITY_TABS.map(({ id, label, Icon }) => {
          const active = id === activeTab;

          return (
            <Pressable
              key={id}
              onPress={() => onTabChange?.(id)}
              style={[styles.switchItem, active && styles.switchActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Icon
                size={rf(15)}
                color={active ? FIELD.FOREST : 'rgba(255,255,255,0.8)'}
                strokeWidth={2.4}
              />
              <Text
                numberOfLines={1}
                style={[styles.switchText, active && styles.switchTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: PAGE_PADDING + 2,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    top: -90,
    backgroundColor: 'rgba(227,163,59,0.22)',
  },
  glowSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    left: -40,
    bottom: -60,
    backgroundColor: 'rgba(46,157,79,0.35)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flex: 1,
  },
  kicker: {
    fontSize: rf(9.5),
    fontWeight: '900',
    letterSpacing: 1.6,
    color: FIELD.WHEAT,
  },
  title: {
    marginTop: 1,
    fontSize: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  meRing: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: FIELD.WHEAT,
  },
  tagline: {
    marginTop: 10,
    fontSize: rf(12),
    lineHeight: rf(17),
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
  },
  switchTrack: {
    marginTop: 14,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  switchItem: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  switchActive: {
    backgroundColor: '#FFFFFF',
  },
  switchText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
  },
  switchTextActive: {
    color: FIELD.FOREST,
    fontWeight: '900',
  },
});
