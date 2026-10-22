import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { MARKET_COLORS as C } from '../market/theme';
import {
  formatPerKg,
  formatQuintal,
  isPrice,
  shortPrice,
} from '../../utils/mandiFormat';

/*
 * Charts are kept simple on purpose: farmers read them on small phones,
 * so every bar carries its own price and there are no axes to decode.
 */

/*
|--------------------------------------------------------------------------
| WHERE TO SELL
|--------------------------------------------------------------------------
|
| Markets ranked by price. One bar per market with the price written on
| it. Markets in `homeDistrict` get a "Near you" tag.
|
*/

export function WhereToSellChart({ markets, homeDistrict }) {
  const top = Math.max(...markets.map(item => item.modalPrice));

  return (
    <View>
      {markets.map((item, index) => {
        const near =
          !!homeDistrict &&
          String(item.district).toLowerCase() === homeDistrict.toLowerCase();
        const best = index === 0;

        return (
          <View key={`${item.market}-${item.district}`} style={styles.rankRow}>
            <View style={[styles.rank, best && styles.rankBest]}>
              <Text style={[styles.rankText, best && styles.rankTextBest]}>
                {index + 1}
              </Text>
            </View>

            <View style={styles.flex}>
              <View style={styles.rankHead}>
                <Text style={styles.market} numberOfLines={1}>
                  {item.market}
                </Text>
                {near && <Text style={styles.nearTag}>Near you</Text>}
                <Text style={[styles.rankPrice, best && styles.bestPrice]}>
                  {formatQuintal(item.modalPrice)}
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    { width: `${Math.max((item.modalPrice / top) * 100, 4)}%` },
                    best && styles.barBest,
                    near && !best && styles.barNear,
                  ]}
                />
              </View>
              <Text style={styles.district} numberOfLines={1}>
                {item.district} · {formatPerKg(item.modalPrice)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| THIS WEEK
|--------------------------------------------------------------------------
|
| One column per day with the average price on top. Days the mandis
| were closed show a dash. The last column (today) is highlighted.
|
| points: [{key, label, value, loading}]
|
*/

const COLUMN_HEIGHT = 120;

export function WeekColumns({ points }) {
  const known = points.filter(point => isPrice(point.value));
  const max = Math.max(...known.map(point => point.value), 1);
  const min = Math.min(...known.map(point => point.value), max);
  // start the columns a little below the lowest day so changes show
  const floor = Math.max(min - (max - min) * 1.5 - max * 0.05, 0);
  const height = value =>
    Math.max(((value - floor) / (max - floor)) * COLUMN_HEIGHT, 8);

  const first = known[0];
  const last = known[known.length - 1];
  const change =
    first && last && first !== last ? last.value - first.value : null;

  return (
    <View>
      <View style={styles.columns}>
        {points.map((point, index) => {
          const isLast = index === points.length - 1;

          return (
            <View key={point.key} style={styles.column}>
              <View style={styles.columnPlot}>
                {point.loading ? (
                  <ActivityIndicator size="small" color={C.green} />
                ) : isPrice(point.value) ? (
                  <>
                    <Text
                      style={[
                        styles.columnValue,
                        isLast && styles.columnValueLast,
                      ]}
                    >
                      {shortPrice(point.value)}
                    </Text>
                    <View
                      style={[
                        styles.columnBar,
                        { height: height(point.value) },
                        isLast && styles.columnBarLast,
                      ]}
                    />
                  </>
                ) : (
                  <Text style={styles.closed}>–</Text>
                )}
              </View>
              <Text
                style={[styles.columnLabel, isLast && styles.columnLabelLast]}
                numberOfLines={1}
              >
                {point.label}
              </Text>
            </View>
          );
        })}
      </View>

      {change !== null && (
        <View
          style={[
            styles.changeBox,
            change > 0 && styles.changeUp,
            change < 0 && styles.changeDown,
          ]}
        >
          <Text
            style={[
              styles.changeText,
              change > 0 && styles.upText,
              change < 0 && styles.downText,
            ]}
          >
            {change > 0
              ? `▲ Up by ${formatQuintal(change)} per quintal`
              : change < 0
              ? `▼ Down by ${formatQuintal(-change)} per quintal`
              : 'No change in price'}
          </Text>
          <Text style={styles.changeNote}>
            From {first.label} to {last.label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  rankRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rankBest: { backgroundColor: C.gold },
  rankText: { fontSize: 13, fontWeight: '900', color: C.muted },
  rankTextBest: { color: '#3A2400' },
  rankHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  market: { flex: 1, fontSize: 14, fontWeight: '900', color: C.dark },
  nearTag: {
    fontSize: 10,
    fontWeight: '900',
    color: C.blue,
    backgroundColor: C.lightBlue,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rankPrice: { fontSize: 14.5, fontWeight: '900', color: C.dark },
  bestPrice: { color: C.green },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EEF2EF',
    marginTop: 7,
    overflow: 'hidden',
  },
  bar: { height: 10, borderRadius: 5, backgroundColor: '#9ED4B2' },
  barBest: { backgroundColor: C.green },
  barNear: { backgroundColor: C.blue },
  district: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 5 },

  columns: { flexDirection: 'row', gap: 6 },
  column: { flex: 1, alignItems: 'center' },
  columnPlot: {
    height: COLUMN_HEIGHT + 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  columnValue: {
    fontSize: 10.5,
    fontWeight: '900',
    color: C.text,
    marginBottom: 4,
  },
  columnValueLast: { color: C.green },
  columnBar: {
    width: '74%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#B9E2C8',
  },
  columnBarLast: { backgroundColor: C.green },
  closed: {
    fontSize: 16,
    fontWeight: '900',
    color: '#C9D0CC',
    marginBottom: 6,
  },
  columnLabel: {
    marginTop: 6,
    fontSize: 10.5,
    fontWeight: '800',
    color: C.muted,
  },
  columnLabelLast: { color: C.green, fontWeight: '900' },

  changeBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.bg,
  },
  changeUp: { backgroundColor: C.lightGreen },
  changeDown: { backgroundColor: C.lightRed },
  changeText: { fontSize: 13.5, fontWeight: '900', color: C.text },
  upText: { color: C.green },
  downText: { color: C.red },
  changeNote: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2 },
});
