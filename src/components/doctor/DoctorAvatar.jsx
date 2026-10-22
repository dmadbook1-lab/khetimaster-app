import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Leaf, PawPrint } from 'lucide-react-native';

import { CARE as C, CARE_GRADIENTS } from './careTheme';
import { AVAILABILITY_META } from '../../utils/doctorFormat';

const initialsOf = name =>
  String(name || '?')
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('') || '?';

/*
 * Round photo (or initials) with a gradient ring, a small badge for the
 * doctor type and, with showStatus, an availability dot.
 */
export default function DoctorAvatar({
  name,
  image,
  doctorType,
  availability,
  size = 56,
  showStatus = false,
  style,
}) {
  const isCrop = doctorType === 'agriculturalDoctor';
  const ring = isCrop ? CARE_GRADIENTS.crop : CARE_GRADIENTS.vet;
  const inner = size - 6;
  const TypeIcon = isCrop ? Leaf : PawPrint;
  const badgeSize = Math.max(18, size * 0.34);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LinearGradient
        colors={ring}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { borderRadius: size / 2 }]}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={[
              styles.inner,
              { width: inner, height: inner, borderRadius: inner / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.inner,
              styles.fallback,
              { width: inner, height: inner, borderRadius: inner / 2 },
            ]}
          >
            <Text
              style={[
                styles.initials,
                {
                  fontSize: inner * 0.34,
                  color: isCrop ? C.olive : C.tealDark,
                },
              ]}
            >
              {initialsOf(name)}
            </Text>
          </View>
        )}
      </LinearGradient>

      {!!doctorType && (
        <View
          style={[
            styles.typeBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: isCrop ? C.olive : C.teal,
            },
          ]}
        >
          <TypeIcon size={badgeSize * 0.55} color={C.white} />
        </View>
      )}

      {showStatus && !!AVAILABILITY_META[availability] && (
        <View
          style={[
            styles.statusDot,
            { backgroundColor: AVAILABILITY_META[availability].color },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { backgroundColor: C.white },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '900', letterSpacing: 0.5 },
  typeBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  statusDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: C.white,
  },
});
