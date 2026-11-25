import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {MARKET_COLORS as C} from '../market/theme';
import {stopLabel} from '../../utils/deliveryFormat';
import {useTranslation} from 'react-i18next';

function Stop({stop, kind, detailed}) {
  const {t} = useTranslation();

  return (
    <View style={styles.stop}>
      <View style={styles.markerCol}>
        <View
          style={[styles.marker, kind === 'pickup' ? styles.pickup : styles.drop]}
        />
      </View>
      <View style={styles.flex}>
        <Text style={styles.kind}>
          {kind === 'pickup' ? t('delivery.pickup') : t('delivery.drop')}
        </Text>
        <Text style={styles.place} numberOfLines={detailed ? 2 : 1}>
          {stopLabel(stop) || '—'}
        </Text>
        {detailed && !!stop?.address && stop.address !== stopLabel(stop) && (
          <Text style={styles.address} numberOfLines={3}>
            {stop.address}
          </Text>
        )}
      </View>
    </View>
  );
}

/*
 * Pickup -> drop with the classic green dot / red pin and a dashed line.
 * detailed shows the full address under each stop.
 */
export default function RouteStops({pickup, drop, detailed = false, right}) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Stop stop={pickup} kind="pickup" detailed={detailed} />
        <View style={styles.line} />
        <Stop stop={drop} kind="drop" detailed={detailed} />
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  flex: {flex: 1},
  stop: {flexDirection: 'row', gap: 10},
  markerCol: {width: 14, alignItems: 'center', paddingTop: 4},
  marker: {width: 12, height: 12, borderRadius: 6, borderWidth: 3},
  pickup: {borderColor: C.green, backgroundColor: C.white},
  drop: {borderColor: C.red, backgroundColor: C.red, borderRadius: 3},
  line: {
    marginLeft: 6,
    width: 2,
    height: 16,
    borderLeftWidth: 2,
    borderColor: '#C9D2CD',
    borderStyle: 'dashed',
    marginVertical: 2,
  },
  kind: {fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 0.3},
  place: {fontSize: 13.5, fontWeight: '900', color: C.dark, marginTop: 1},
  address: {fontSize: 11.5, fontWeight: '600', color: C.text, marginTop: 2, lineHeight: 16},
});
