import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Gauge, MapPin, Star } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';
import { machineryImageSource } from './machineryImages';
import {
  AVAILABILITY_META,
  FUEL_LABELS,
  startingPrice,
} from '../../utils/machineryFormat';

/*
 * Two-column browse card: photo with price overlay, details below.
 */
function MachineryGridCard({ machinery, onPress, width }) {
  const location = [machinery.village, machinery.district]
    .filter(Boolean)
    .join(', ');
  const power = machinery.enginePower?.value
    ? `${machinery.enginePower.value} ${machinery.enginePower.unit || 'HP'}`
    : null;
  const specs = [power, FUEL_LABELS[machinery.fuelType], machinery.driveType]
    .filter(Boolean)
    .join(' · ');
  const unavailable = machinery.availability !== 'available';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { width }]}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        <Image source={machineryImageSource(machinery)} style={styles.image} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.shade}
        />

        <View style={styles.topRow}>
          <Text style={styles.category} numberOfLines={1}>
            {machinery.category}
          </Text>
          {unavailable && (
            <Text
              style={[
                styles.availability,
                { color: AVAILABILITY_META[machinery.availability]?.color },
              ]}
            >
              {AVAILABILITY_META[machinery.availability]?.label}
            </Text>
          )}
        </View>

        <Text style={styles.price} numberOfLines={1}>
          {startingPrice(machinery)}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {machinery.name}
        </Text>

        {!!specs && (
          <View style={styles.inline}>
            <Gauge size={11} color={C.blue} />
            <Text style={styles.meta} numberOfLines={1}>
              {specs}
            </Text>
          </View>
        )}

        <View style={styles.inline}>
          <Star size={11} color={C.gold} fill={C.gold} />
          <Text style={styles.meta}>
            {machinery.totalReviews
              ? `${machinery.rating} (${machinery.totalReviews})`
              : 'New'}
            {machinery.totalJobsCompleted
              ? ` · ${machinery.totalJobsCompleted} jobs`
              : ''}
          </Text>
        </View>

        {!!location && (
          <View style={styles.inline}>
            <MapPin size={11} color={C.muted} />
            <Text style={styles.meta} numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(MachineryGridCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...MARKET_SHADOW,
  },
  imageBox: { height: 140, backgroundColor: '#E3EEE7' },
  image: { width: '100%', height: '100%' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  topRow: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  category: {
    flexShrink: 1,
    fontSize: 9.5,
    fontWeight: '900',
    color: C.blue,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  availability: {
    fontSize: 9.5,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  price: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
    color: C.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  body: { padding: 11, gap: 4 },
  name: {
    fontSize: 13,
    fontWeight: '900',
    color: C.dark,
    lineHeight: 17,
    minHeight: 34,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { flex: 1, fontSize: 10.5, color: C.muted, fontWeight: '600' },
});
