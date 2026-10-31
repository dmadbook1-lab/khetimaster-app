import React from 'react';

import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {Droplets, Thermometer, Waves} from 'lucide-react-native';

import {COLORS} from './advisoryTheme';

const toNumber = value => {
  const n = Number(value);

  return value === null || value === undefined || !Number.isFinite(n) ? null : n;
};

/** Open-Meteo soil moisture is volumetric (m³/m³); show it as %. */
const toMoisturePercent = value => {
  const n = toNumber(value);

  if (n === null) return null;

  return n <= 1 ? n * 100 : n;
};

const moistureBand = pct => {
  if (pct === null) return {label: '—', color: COLORS.muted, hint: 'No reading yet'};
  if (pct < 15) return {label: 'Dry', color: '#D97706', hint: 'Plan irrigation soon'};
  if (pct <= 35) return {label: 'Optimal', color: '#0891B2', hint: 'Good for root uptake'};

  return {label: 'Wet', color: '#2563EB', hint: 'Hold irrigation'};
};

const temperatureBand = temp => {
  if (temp === null) return {label: '—', color: COLORS.muted, hint: 'No reading yet'};
  if (temp < 12) return {label: 'Cool', color: '#2563EB', hint: 'Slow root activity'};
  if (temp <= 30) return {label: 'Ideal', color: COLORS.green, hint: 'Healthy root zone'};

  return {label: 'Hot', color: '#E5484D', hint: 'Mulch to cool soil'};
};

/*
|--------------------------------------------------------------------------
| METER TILE
|--------------------------------------------------------------------------
*/

function MeterTile({icon: Icon, label, value, unit, percent, band, deeper}) {
  return (
    <View style={styles.tile}>
      <View style={styles.tileTop}>
        <View style={[styles.tileIcon, {backgroundColor: `${band.color}1A`}]}>
          <Icon size={16} color={band.color} strokeWidth={2.4} />
        </View>

        <View style={[styles.bandChip, {backgroundColor: `${band.color}1A`}]}>
          <View style={[styles.bandDot, {backgroundColor: band.color}]} />

          <Text style={[styles.bandText, {color: band.color}]}>{band.label}</Text>
        </View>
      </View>

      <Text style={styles.tileLabel}>{label}</Text>

      <Text style={styles.tileValue}>
        {value === null ? '--' : value.toFixed(1)}
        <Text style={styles.tileUnit}> {unit}</Text>
      </Text>

      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${Math.max(4, Math.min(100, percent ?? 0))}%`,
              backgroundColor: band.color,
            },
          ]}
        />
      </View>

      <Text style={[styles.tileHint, {color: band.color}]}>{band.hint}</Text>

      {deeper ? (
        <View style={styles.deeperRow}>
          <Text style={styles.deeperLabel}>{deeper.label}</Text>

          <Text style={styles.deeperValue}>{deeper.value}</Text>
        </View>
      ) : null}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

export default function SoilPulseCard({conditions, loading}) {
  const current = conditions?.current;

  const moisture = toMoisturePercent(current?.soil_moisture_surface);
  const moistureDeep = toMoisturePercent(current?.soil_moisture_15cm);
  const temperature = toNumber(current?.soil_temperature_surface);
  const temperatureDeep = toNumber(current?.soil_temperature_6cm);

  if (!loading && moisture === null && temperature === null) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Waves size={18} color={COLORS.green} strokeWidth={2.3} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Soil Pulse</Text>

          <Text style={styles.subtitle}>
            Live soil moisture & temperature at your field
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={COLORS.green} />
        ) : (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.tiles}>
        <MeterTile
          icon={Droplets}
          label="Soil moisture"
          value={moisture}
          unit="%"
          percent={moisture !== null ? (moisture / 50) * 100 : 0}
          band={moistureBand(moisture)}
          deeper={
            moistureDeep !== null
              ? {label: 'Root zone', value: `${moistureDeep.toFixed(0)}%`}
              : null
          }
        />

        <MeterTile
          icon={Thermometer}
          label="Soil temperature"
          value={temperature}
          unit="°C"
          percent={temperature !== null ? (temperature / 45) * 100 : 0}
          band={temperatureBand(temperature)}
          deeper={
            temperatureDeep !== null
              ? {label: '6 cm deep', value: `${temperatureDeep.toFixed(0)}°C`}
              : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: COLORS.mintSoft,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 5,
  },

  liveText: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  tiles: {
    flexDirection: 'row',
    marginTop: 14,
    marginHorizontal: -5,
  },

  tile: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#ECF0EE',
  },

  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tileIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  bandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  bandText: {
    fontSize: 9,
    fontWeight: '900',
  },

  tileLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 12,
  },

  tileValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 1,
  },

  tileUnit: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },

  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E6ECE8',
    marginTop: 8,
    overflow: 'hidden',
  },

  meterFill: {
    height: '100%',
    borderRadius: 3,
  },

  tileHint: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 6,
  },

  deeperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9EEEB',
  },

  deeperLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
  },

  deeperValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
  },
});
