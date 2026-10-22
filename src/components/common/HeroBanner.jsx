import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// the banner artwork is 1671 x 941
const BANNER_RATIO = 941 / 1671;

export const bannerHeightFor = (width = Dimensions.get('window').width) =>
  Math.round(width * BANNER_RATIO);

/*
 * Wide banner photo across the top of a hero. It fades into `tint`
 * (the hero's background colour, a 6 digit hex) so the hero text can
 * sit on the faded part. Render it first inside a hero with that
 * background colour.
 */
export default function HeroBanner({
  source,
  tint,
  height = bannerHeightFor(),
}) {
  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <Image source={source} resizeMode="cover" style={styles.image} />
      {/* darkens the top a little so the glass buttons stay visible */}
      <LinearGradient
        colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
        style={styles.topShade}
      />
      <LinearGradient
        colors={[`${tint}00`, `${tint}00`, `${tint}B3`, tint]}
        locations={[0, 0.38, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0 },
  image: { width: '100%', height: '100%' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
});
