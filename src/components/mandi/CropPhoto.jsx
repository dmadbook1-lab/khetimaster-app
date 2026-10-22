import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { cropImage } from './cropImages';
import { cropVisual } from './cropVisuals';

/*
 * Photo of the crop, or its category icon on a tinted tile for crops
 * without a photo (e.g. a name the farmer typed).
 */
export default function CropPhoto({ cropId, category, style, iconSize = 24 }) {
  const source = cropImage(cropId);

  if (source) {
    return <Image source={source} style={[styles.image, style]} />;
  }

  const visual = cropVisual(category);
  const Icon = visual.icon;

  return (
    <View
      style={[
        styles.image,
        styles.fallback,
        { backgroundColor: visual.bg },
        style,
      ]}
    >
      <Icon size={iconSize} color={visual.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#E3EEE7' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
