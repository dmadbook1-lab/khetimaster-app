import React from 'react';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, rf} from '../theme';
import {COMMUNITY_IMAGES} from '../communityImages';

const IMG = COMMUNITY_IMAGES.community3;

export default function HeroBanner({title, subtitle}) {
  return (
    <View style={styles.wrap}>
      <ImageBackground source={IMG} style={styles.img}>
        <LinearGradient
          colors={['rgba(21,139,61,0.3)', 'rgba(21,139,61,0.85)']}
          style={styles.overlay}>
          <View style={styles.textBox}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{subtitle}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 18,
  },
  img: {width: '100%', height: 190, justifyContent: 'flex-end'},
  overlay: {flex: 1, justifyContent: 'flex-end', padding: 16},
  textBox: {},
  title: {fontSize: rf(18), fontWeight: '900', color: '#FFFFFF'},
  sub: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
});