import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, rf } from '../theme';
import {
  selectIsFollowing,
  selectMyUserId,
  toggleFollow,
} from '../../../redux/slices/communitySlice';
import {useTranslation} from 'react-i18next';

/*
 * variant:
 *   'solid'  green button (profiles, lists)
 *   'outline' compact green outline (feed post header)
 *   'glass'  white outline on dark video (reels)
 *
 * Renders nothing for the viewer's own account. 'outline' and 'glass' also
 * hide once the viewer follows the person, as on Instagram.
 */
export default function FollowButton({
  userId,
  initialFollowing = false,
  variant = 'solid',
  style,
  onChange,
}) {
  const {t} = useTranslation();
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

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={handlePress}
        hitSlop={6}
        style={[styles.outline, style]}
      >
        <Text style={styles.outlineText}>{t('followButton.follow')}</Text>
      </Pressable>
    );
  }

  if (variant === 'glass') {
    return (
      <Pressable onPress={handlePress} style={[styles.glass, style]}>
        <Text style={styles.glassText}>{t('followButton.follow')}</Text>
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
        {isFollowing ? t('followButton.following') : t('followButton.follow')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outline: {
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    justifyContent: 'center',
  },
  outlineText: {
    fontSize: rf(12.5),
    fontWeight: '600',
    color: COLORS.GREEN,
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
