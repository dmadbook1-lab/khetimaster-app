import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AVATAR_TINTS, STORY_RING } from '../theme';
import { initialsOf } from '../../../utils/communityFormat';

const tintFor = id => {
  const key = String(id || '');
  let hash = 0;

  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 997;
  }

  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
};

/*
 * Profile photo, or initials on a tint when there is none.
 * ring draws the gradient used for people with recent reels.
 */
export default function Avatar({
  user,
  size = 36,
  ring = false,
  ringColor,
  onPress,
  style,
}) {
  const ringWidth = size >= 70 ? 3 : 2;
  const gap = ring ? (size >= 70 ? 3 : 2) : 0;
  const inner = ring ? size - (ringWidth + gap) * 2 : size;

  const face = user?.avatar ? (
    <Image
      source={{ uri: user.avatar }}
      style={{ width: inner, height: inner, borderRadius: inner / 2 }}
    />
  ) : (
    <View
      style={[
        styles.fallback,
        {
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: tintFor(user?._id || user?.fullName),
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: inner * 0.38 }]}>
        {initialsOf(user?.fullName)}
      </Text>
    </View>
  );

  const content = ring ? (
    <LinearGradient
      colors={ringColor ? [ringColor, ringColor] : STORY_RING}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.center,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.center,
          styles.gap,
          {
            width: size - ringWidth * 2,
            height: size - ringWidth * 2,
            borderRadius: (size - ringWidth * 2) / 2,
          },
        ]}
      >
        {face}
      </View>
    </LinearGradient>
  ) : (
    face
  );

  if (!onPress) {
    return <View style={style}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} hitSlop={6} style={style}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap: {
    backgroundColor: '#FFFFFF',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
