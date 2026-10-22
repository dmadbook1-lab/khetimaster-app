import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Crown, MapPin, X } from 'lucide-react-native';

import { MARKET_COLORS as C } from '../market/theme';
import { formatPerKg, formatQuintal, isPrice } from '../../utils/mandiFormat';

/*
 * The chosen markets side by side, best first, with one sentence that
 * says which pays more and by how much.
 */
export default function CompareMarketsSheet({ visible, records, onClose }) {
  const ranked = [...records]
    .filter(record => isPrice(record.modalPrice))
    .sort((a, b) => b.modalPrice - a.modalPrice);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const gap =
    best && worst && best !== worst ? best.modalPrice - worst.modalPrice : 0;
  const top = best?.modalPrice || 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Which market pays more?</Text>
            <Pressable hitSlop={10} onPress={onClose}>
              <X size={20} color={C.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {gap > 0 ? (
              <View style={styles.verdict}>
                <Crown size={22} color={C.amber} />
                <View style={styles.flex}>
                  <Text style={styles.verdictTitle}>{best.market}</Text>
                  <Text style={styles.verdictText}>
                    pays {formatQuintal(gap)} more per quintal (
                    {formatPerKg(gap)} more) than {worst.market}.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.verdict}>
                <Text style={styles.verdictText}>
                  These markets pay the same price.
                </Text>
              </View>
            )}

            {ranked.map((record, index) => (
              <View
                key={`${record.market}-${record.variety}-${index}`}
                style={[styles.card, index === 0 && styles.cardBest]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.flex}>
                    {index === 0 && <Text style={styles.bestTag}>Best</Text>}
                    <Text style={styles.market} numberOfLines={1}>
                      {record.market}
                    </Text>
                    <View style={styles.inline}>
                      <MapPin size={11} color={C.muted} />
                      <Text style={styles.place} numberOfLines={1}>
                        {record.district}
                        {record.variety ? ` · ${record.variety}` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.priceBox}>
                    <Text
                      style={[styles.price, index === 0 && styles.priceBest]}
                    >
                      {formatQuintal(record.modalPrice)}
                    </Text>
                    <Text style={styles.perKg}>
                      {formatPerKg(record.modalPrice)}
                    </Text>
                  </View>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${(record.modalPrice / top) * 100}%` },
                      index === 0 && styles.barBest,
                    ]}
                  />
                </View>
              </View>
            ))}

            <Text style={styles.note}>
              Prices per quintal (100 kg) on each market's latest day. Think
              about the cost of taking your crop there too.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9DEDB',
    marginTop: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '900', color: C.dark },
  flex: { flex: 1 },
  verdict: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.lightAmber,
  },
  verdictTitle: { fontSize: 16, fontWeight: '900', color: '#4A2E00' },
  verdictText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B4A00',
    lineHeight: 19,
  },
  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  cardBest: { borderColor: C.green, backgroundColor: '#F6FCF8' },
  cardTop: { flexDirection: 'row', gap: 10 },
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
  price: { fontSize: 20, fontWeight: '900', color: C.dark },
  priceBest: { color: C.green },
  perKg: { fontSize: 12, fontWeight: '800', color: C.muted },
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EEF2EF',
    marginTop: 12,
    overflow: 'hidden',
  },
  bar: { height: 12, borderRadius: 6, backgroundColor: '#9ED4B2' },
  barBest: { backgroundColor: C.green },
  note: {
    fontSize: 11.5,
    fontWeight: '600',
    color: C.muted,
    marginTop: 16,
    lineHeight: 17,
  },
});
