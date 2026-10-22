import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, MapPin } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';
import { formatPerKg, formatQuintal, isPrice } from '../../utils/mandiFormat';

/*
 * One market's price, in plain words. In select mode the row toggles
 * selection for the market comparison.
 */
function MarketPriceRow({
  record,
  average,
  best = false,
  selectMode = false,
  selected = false,
  onPress,
}) {
  const difference =
    isPrice(record.modalPrice) && isPrice(average)
      ? Math.round(record.modalPrice - average)
      : null;
  const hasRange = isPrice(record.minPrice) && isPrice(record.maxPrice);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      disabled={!selectMode}
      onPress={onPress}
      style={[
        styles.card,
        best && styles.cardBest,
        selected && styles.cardSelected,
      ]}
    >
      <View style={styles.top}>
        {selectMode && (
          <View style={[styles.check, selected && styles.checkOn]}>
            {selected && <Check size={14} color={C.white} strokeWidth={3} />}
          </View>
        )}

        <View style={styles.flex}>
          {best && <Text style={styles.bestTag}>Best price</Text>}
          <Text style={styles.market} numberOfLines={1}>
            {record.market}
          </Text>
          <View style={styles.inline}>
            <MapPin size={11} color={C.muted} />
            <Text style={styles.place} numberOfLines={1}>
              {[record.district, record.state].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.priceBox}>
          <Text style={[styles.price, best && styles.priceBest]}>
            {formatQuintal(record.modalPrice)}
          </Text>
          <Text style={styles.unit}>per quintal</Text>
          <Text style={styles.perKg}>{formatPerKg(record.modalPrice)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {!!record.variety && (
          <Text style={styles.variety} numberOfLines={1}>
            {record.variety}
          </Text>
        )}
        {hasRange && (
          <Text style={styles.footText}>
            {formatQuintal(record.minPrice)} – {formatQuintal(record.maxPrice)}
          </Text>
        )}
        {difference !== null && difference !== 0 && (
          <Text
            style={[styles.footText, difference > 0 ? styles.up : styles.down]}
          >
            {difference > 0 ? '▲' : '▼'} {formatQuintal(Math.abs(difference))}{' '}
            {difference > 0 ? 'above' : 'below'} average
          </Text>
        )}
      </View>

      {!!record.arrivalDate && (
        <Text style={styles.date}>Price of {record.arrivalDate}</Text>
      )}
    </TouchableOpacity>
  );
}

export default memo(MarketPriceRow);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  cardBest: { borderColor: '#BFE3CC' },
  cardSelected: { borderColor: C.green, backgroundColor: '#F6FCF8' },
  top: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  flex: { flex: 1 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#C3CDC7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkOn: { backgroundColor: C.green, borderColor: C.green },
  bestTag: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '900',
    color: '#3A2400',
    backgroundColor: C.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  market: { fontSize: 16, fontWeight: '900', color: C.dark },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  place: { flex: 1, fontSize: 12, fontWeight: '600', color: C.muted },
  priceBox: { alignItems: 'flex-end' },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.4,
  },
  priceBest: { color: C.green },
  unit: { fontSize: 10, fontWeight: '700', color: C.muted },
  perKg: { fontSize: 12, fontWeight: '800', color: C.text, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  variety: {
    fontSize: 11,
    fontWeight: '800',
    color: C.blue,
    backgroundColor: C.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  footText: { fontSize: 11.5, fontWeight: '700', color: C.muted },
  up: { color: C.green },
  down: { color: C.red },
  date: { fontSize: 10.5, fontWeight: '600', color: C.muted, marginTop: 6 },
});
