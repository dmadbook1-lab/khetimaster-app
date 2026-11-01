import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, rf } from '../theme';
import {
  selectIsFollowing,
  selectMyUserId,
  toggleFollow,
} from '../../../redux/slices/communitySlice';

/*
 * variant:
 *   'solid'  green button (profiles, lists)
 *   'text'   inline "Follow" link next to a name (feed header)
 *   'glass'  white outline on dark video (reels)
 *
 * Renders nothing for the viewer's own account. 'text' and 'glass' also
 * hide once the viewer follows the person, as on Instagram.
 */
export default function FollowButton({
  userId,
  initialFollowing = false,
  variant = 'solid',
  style,
  onChange,
}) {
  const dispatch = useDispatch();
  const myId = useSelector(selectMyUserId);
  const isFollowing = useSelector(state =>
    selectIsFollowing(state, userId, initialFollowing),
  );

  if (!userId || String(userId) === String(myId)) {
    return null;
  }

  if (variant !== 'solid' && isFollowing) {
    return null;
  }

  const handlePress = () => {
    dispatch(toggleFollow({ userId, follow: !isFollowing }));
    onChange?.(!isFollowing);
  };

  if (variant === 'text') {
    return (
      <Pressable onPress={handlePress} hitSlop={8} style={style}>
        <Text style={styles.textLink}>Follow</Text>
      </Pressable>
    );
  }

  if (variant === 'glass') {
    return (
      <Pressable onPress={handlePress} style={[styles.glass, style]}>
        <Text style={styles.glassText}>Follow</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.solid,
        isFollowing && styles.solidFollowing,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.solidText, isFollowing && styles.followingText]}>
        {isFollowing ? 'Following' : 'Follow'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textLink: {
    fontSize: rf(13),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  glass: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
  },
  glassText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  solid: {
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidFollowing: {
    backgroundColor: '#EEF1F4',
  },
  pressed: {
    opacity: 0.8,
  },
  solidText: {
    fontSize: rf(13),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  followingText: {
    color: COLORS.DARK,
  },
});
