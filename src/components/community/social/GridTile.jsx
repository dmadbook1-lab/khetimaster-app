import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Clapperboard, Copy, Play } from 'lucide-react-native';
import { coverOf, formatCount } from '../../../utils/communityFormat';

/*
 * One square (or 9:16 when tall) tile in a profile / explore grid.
 */
export default function GridTile({
  post,
  size,
  tall = false,
  radius = 0,
  onPress,
}) {
  const cover = coverOf(post);
  const isVideo = post.media?.[0]?.type === 'video';
  const height = tall ? size * (16 / 9) : size;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height, borderRadius: radius },
        pressed && styles.pressed,
      ]}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]} />
      )}

      <View style={styles.badge}>
        {post.type === 'reel' ? (
          <Clapperboard size={16} color="#FFFFFF" strokeWidth={2.2} />
        ) : post.media?.length > 1 ? (
          <Copy size={16} color="#FFFFFF" strokeWidth={2.2} />
        ) : isVideo ? (
          <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
        ) : null}
      </View>

      {post.type === 'reel' || isVideo ? (
        <View style={styles.views}>
          <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.viewsText}>{formatCount(post.viewsCount)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#E8DFCC',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  placeholder: {
    backgroundColor: '#1F2937',
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  views: {
    position: 'absolute',
    left: 7,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
  },
});
