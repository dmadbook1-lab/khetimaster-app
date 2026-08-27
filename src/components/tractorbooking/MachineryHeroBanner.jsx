import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IndianRupee, CheckCircle2, Clock3 } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function MachineryHeroBanner() {
  return (
    <ImageBackground
      source={require('../../assets/machinery/machinery-hero.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          'rgba(13, 88, 44, 0.78)',
          'rgba(22, 118, 58, 0.62)',
          'rgba(38, 150, 72, 0.35)',
          'rgba(38, 150, 72, 0.08)',
        ]}
        locations={[0, 0.42, 0.72, 1]}
        start={{
          x: 0,
          y: 0.5,
        }}
        end={{
          x: 1,
          y: 0.5,
        }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Book Tractors &{'\n'}
          Farm Equipment{'\n'}
          With Ease
        </Text>

        <View style={styles.features}>
          <Feature Icon={IndianRupee} title="Best" subtitle="Price" />

          <Feature Icon={CheckCircle2} title="Verified" subtitle="Owners" />

          <Feature Icon={Clock3} title="Better" subtitle="Availability" />
        </View>
      </View>
    </ImageBackground>
  );
}
function Feature({ Icon, title, subtitle }) {
  return (
    <View style={styles.feature}>
      <View style={styles.iconCircle}>
        <Icon size={rf(14)} color="#F7C948" strokeWidth={2.2} />
      </View>

      <Text style={styles.label}>{title}</Text>
      <Text style={styles.label}>{subtitle}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  banner: {
    height: 182,
    marginTop: 15,
    borderRadius: 17,
    overflow: 'hidden',
  },
  bannerImage: {
    borderRadius: 17,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  title: {
    width: '56%',
    color: '#FFFFFF',
    fontSize: rf(19),
    lineHeight: rf(25),
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  feature: {
    width: 62,
    alignItems: 'center',
    marginRight: 10,
  },
  iconCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: '#F7C948',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: rf(9.2),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: rf(11),
  },
});
