import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Check} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';

import {MARKET_COLORS as C} from '../market/theme';
import {
  TRIP_STEPS,
  TRIP_STEP_TIME_KEY,
  formatClock,
} from '../../utils/deliveryFormat';

/*
 * Vertical requested -> delivered progress with the time of each step.
 */
export default function TripTimeline({booking}) {
  const {t} = useTranslation();
  const ended = ['rejected', 'cancelled'].includes(booking.status);
  const reached = TRIP_STEPS.indexOf(booking.status);

  return (
    <View>
      {TRIP_STEPS.map((step, index) => {
        const done = !ended && index <= reached;
        const current = !ended && index === reached && step !== 'delivered';
        const time = booking[TRIP_STEP_TIME_KEY[step]];
        const last = index === TRIP_STEPS.length - 1;

        return (
          <View key={step} style={styles.row}>
            <View style={styles.markerCol}>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  current && styles.dotCurrent,
                ]}>
                {done && !current && <Check size={11} color={C.white} strokeWidth={3} />}
              </View>
              {!last && <View style={[styles.line, done && index < reached && styles.lineDone]} />}
            </View>
            <View style={styles.textCol}>
              <Text style={[styles.title, !done && styles.muted]}>
                {t(`delivery.step.${step}`)}
              </Text>
              {done && !!time && <Text style={styles.time}>{formatClock(time)}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 12},
  markerCol: {alignItems: 'center', width: 20},
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D7D3',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {backgroundColor: C.green, borderColor: C.green},
  dotCurrent: {
    backgroundColor: C.white,
    borderColor: C.green,
    borderWidth: 6,
  },
  line: {width: 2, flex: 1, minHeight: 18, backgroundColor: '#E3E8E5'},
  lineDone: {backgroundColor: C.green},
  textCol: {flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16},
  title: {fontSize: 13, fontWeight: '900', color: C.dark},
  muted: {color: C.placeholder, fontWeight: '700'},
  time: {fontSize: 11.5, fontWeight: '800', color: C.muted},
});
