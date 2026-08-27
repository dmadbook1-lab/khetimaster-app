import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowRight} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};

export default function LabourHeroBanner({onBookPress}) {
  return (
    <ImageBackground
      source={require('../../assets/labour/hero.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
      resizeMode="cover">

      <LinearGradient
        colors={[
          'rgba(12,71,33,0.88)',
          'rgba(23,112,52,0.60)',
          'rgba(23,112,52,0.18)',
          'rgba(23,112,52,0)',
        ]}
        locations={[0, 0.42, 0.72, 1]}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Find Skilled{'\n'}
          Farm Workers{'\n'}
          Near You
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onBookPress}
          style={styles.btn}>
          <Text style={styles.btnText}>Find Workers</Text>

          <ArrowRight
            size={18}
            color="#111827"
            strokeWidth={2.6}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 10,
    height: 145,
    borderRadius: 18,
    overflow: 'hidden',
  },

  bannerImage: {
    borderRadius: 18,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  title: {
    width: '55%',
    fontSize: rf(18),
    lineHeight: rf(24),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  btn: {
    alignSelf: 'flex-start',
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFD229',
    flexDirection: 'row',
    alignItems: 'center',
  },

  btnText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#111827',
    marginRight: 8,
  },
});