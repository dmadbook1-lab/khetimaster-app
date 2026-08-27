import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  Sun,
  CloudSun,
  FlaskConical,
  Droplets,
  CloudRain,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function FarmWeatherCard() {
  return (
    <View style={styles.card}>
      <View style={styles.leftBlock}>
        <View style={styles.iconWrap}>
          <Sun size={24} color="#FB923C" strokeWidth={2.5} />
          <CloudSun
            size={31}
            color="#F97316"
            strokeWidth={2.5}
            style={styles.cloudIcon}
          />
        </View>

        <View>
          <Text style={styles.temp}>29°C</Text>
          <Text style={styles.condition}>Partly Cloudy</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <WeatherItem Icon={FlaskConical} value="58%" label="Humidity" />
        <WeatherItem Icon={Droplets} value="12" label="km/h Wind" />
        <WeatherItem Icon={CloudRain} value="10%" label="Rain Forecast" />
      </View>
    </View>
  );
}
function WeatherItem({ Icon, value, label }) {
  return (
    <View style={styles.weatherItem}>
      <View style={styles.smallIconBox}>
        <Icon size={15} color="#94A3B8" strokeWidth={2.4} />
      </View>

      <Text style={styles.itemValue}>{value}</Text>
      <Text numberOfLines={2} style={styles.itemLabel}>
        {label}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    minHeight: 108,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  leftBlock: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cloudIcon: {
    position: 'absolute',
    bottom: 11,
    right: 8,
  },
  temp: {
    fontSize: rf(30),
    lineHeight: rf(34),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.8,
  },
  condition: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '700',
    color: '#667085',
  },
  divider: {
    width: 1,
    height: 56,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  infoRow: {
    flex: 1.7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    width: '32%',
    alignItems: 'center',
  },
  smallIconBox: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemValue: {
    marginTop: 5,
    fontSize: rf(12),
    fontWeight: '900',
    color: '#111827',
  },
  itemLabel: {
    marginTop: 2,
    fontSize: rf(8.5),
    lineHeight: rf(10),
    fontWeight: '700',
    textAlign: 'center',
    color: '#98A2B3',
  },
});
