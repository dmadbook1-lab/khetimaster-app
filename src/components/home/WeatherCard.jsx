import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CloudSun, Droplets, Wind, Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get('window');
const DARK = '#111827';
const MUTED = '#475569';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function WeatherCard() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Weather')}
      style={styles.touchable}
    >
      <ImageBackground
        source={require('../../assets/weather/hero.png')}
        style={styles.weatherCard}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        {}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.98)',
            'rgba(255,255,255,0.92)',
            'rgba(255,255,255,0.75)',
            'rgba(255,255,255,0.55)',
            'rgba(255,255,255,0.35)',
          ]}
          locations={[0, 0.3, 0.6, 0.85, 1]}
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

        <View style={styles.weatherLeft}>
          <CloudSun size={50} color="#FBBF24" strokeWidth={2} />
          <View>
            <Text style={styles.temp}>32°C</Text>
            <Text style={styles.weatherDesc}>Sunny</Text>
          </View>
        </View>

        <WeatherStat
          Icon={Droplets}
          color="#2563EB"
          value="48%"
          label="Humidity"
        />
        <WeatherStat
          Icon={Wind}
          color="#0EA5E9"
          value="12 km/h"
          label="Wind Speed"
        />
        <WeatherStat
          Icon={Navigation}
          color="#475569"
          value="WSW"
          label="Direction"
        />
      </ImageBackground>
    </TouchableOpacity>
  );
}
const WeatherStat = ({ Icon, color, value, label }) => (
  <View style={styles.weatherStat}>
    <Icon size={24} color={color} strokeWidth={2.4} />
    <Text style={styles.weatherValue}>{value}</Text>
    <Text style={styles.weatherLabel}>{label}</Text>
  </View>
);
const styles = StyleSheet.create({
  touchable: {
    marginTop: 26,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },
  weatherCard: {
    height: 105,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgImage: {
    borderRadius: 20,
  },
  weatherLeft: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  temp: {
    fontSize: rf(31),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -1,
  },
  weatherDesc: {
    marginTop: 2,
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '700',
  },
  weatherStat: {
    flex: 0.85,
    alignItems: 'center',
  },
  weatherValue: {
    marginTop: 4,
    fontSize: rf(12),
    color: DARK,
    fontWeight: '900',
  },
  weatherLabel: {
    marginTop: 3,
    fontSize: rf(10),
    lineHeight: rf(13),
    color: MUTED,
    fontWeight: '700',
    textAlign: 'center',
  },
});
