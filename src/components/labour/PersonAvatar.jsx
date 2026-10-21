import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { MARKET_GRADIENTS } from '../market/theme';

const initialsOf = name =>
  String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || '?';

/*
 * Profile photo, or the person's initials on a gradient.
 */
export default function PersonAvatar({
  name,
  image,
  size = 52,
  radius,
  gradient = 'green',
  style,
}) {
  const borderRadius = radius ?? size * 0.34;

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={[
          { width: size, height: size, borderRadius },
          styles.image,
          style,
        ]}
      />
    );
  }

  return (
    <LinearGradient
      colors={MARKET_GRADIENTS[gradient] || MARKET_GRADIENTS.green}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
        {initialsOf(name)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#E3EEE7' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.5 },
});
