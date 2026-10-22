import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MapPin, Star } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';
import { PlantImage } from './NurseryBits';
import { categoryVisual } from './nurseryVisuals';
import { formatRupees } from '../../utils/marketFormat';
import { plantLocation, stockInfo } from '../../utils/nurseryFormat';

/*
 * Two-column browse card: photo with price, details below.
 */
function PlantGridCard({ plant, onPress, width }) {
  const visual = categoryVisual(plant.category);
  const stock = stockInfo(plant.quantity);
  const location = plantLocation(plant);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { width }]}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        <PlantImage plant={plant} style={styles.image} iconSize={40} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.62)']}
          style={styles.shade}
        />

        <Text
          style={[styles.category, { color: visual.color }]}
          numberOfLines={1}
        >
          {plant.category}
        </Text>

        <Text style={styles.price} numberOfLines={1}>
          {formatRupees(plant.price)}
          <Text style={styles.per}> /plant</Text>
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {plant.name}
        </Text>

        <View style={styles.inline}>
          <Star size={11} color={C.gold} fill={C.gold} />
          <Text style={styles.meta} numberOfLines={1}>
            {plant.totalReviews
              ? `${plant.rating} (${plant.totalReviews})`
              : 'New'}
            {plant.totalSold ? ` · ${plant.totalSold} sold` : ''}
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

        {stock.tone !== 'ok' && (
          <Text style={[styles.stock, stock.tone === 'out' && styles.stockOut]}>
            {stock.label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(PlantGridCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...MARKET_SHADOW,
  },
  imageBox: { height: 148 },
  image: { width: '100%', height: '100%' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 },
  category: {
    position: 'absolute',
    top: 9,
    left: 9,
    maxWidth: '85%',
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
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  per: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
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
  stock: {
    alignSelf: 'flex-start',
    marginTop: 2,
    fontSize: 10,
    fontWeight: '900',
    color: C.amber,
    backgroundColor: C.lightAmber,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stockOut: { color: C.red, backgroundColor: C.lightRed },
});
