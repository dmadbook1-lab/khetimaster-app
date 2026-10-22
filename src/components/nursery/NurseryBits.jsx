import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Minus, Plus } from 'lucide-react-native';

import { MARKET_COLORS as C } from '../market/theme';
import { categoryVisual, plantImageUri } from './nurseryVisuals';
import { ORDER_FLOW, TRACKER_LABELS } from '../../utils/nurseryFormat';

/*
|--------------------------------------------------------------------------
| PLANT IMAGE
|--------------------------------------------------------------------------
|
| Photo, or the category icon on a tinted tile when there is none.
| plant can be a plant or an order item ({image, name}).
|
*/

export function PlantImage({ plant, category, style, iconSize = 28 }) {
  const uri = plantImageUri(plant);

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} />;
  }

  const visual = categoryVisual(category || plant?.category);
  const Icon = visual.icon;

  return (
    <View
      style={[
        styles.image,
        styles.placeholder,
        { backgroundColor: visual.bg },
        style,
      ]}
    >
      <Icon size={iconSize} color={visual.color} />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| QUANTITY STEPPER (compact)
|--------------------------------------------------------------------------
*/

export function QtyStepper({ value, onChange, min = 1, max = 999, busy }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        hitSlop={6}
        activeOpacity={0.75}
        disabled={busy || value <= min}
        style={[styles.stepButton, value <= min && styles.stepDisabled]}
        onPress={() => onChange(value - 1)}
      >
        <Minus size={15} color={C.green} strokeWidth={2.8} />
      </TouchableOpacity>
      <View style={styles.stepValue}>
        {busy ? (
          <ActivityIndicator size="small" color={C.green} />
        ) : (
          <Text style={styles.stepText}>{value}</Text>
        )}
      </View>
      <TouchableOpacity
        hitSlop={6}
        activeOpacity={0.75}
        disabled={busy || value >= max}
        style={[styles.stepButton, value >= max && styles.stepDisabled]}
        onPress={() => onChange(value + 1)}
      >
        <Plus size={15} color={C.green} strokeWidth={2.8} />
      </TouchableOpacity>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| ORDER TRACKER
|--------------------------------------------------------------------------
|
| Placed -> Confirmed -> Dispatched -> On the way -> Delivered
| light: white text for use on a hero gradient.
|
*/

export function OrderTracker({ status, light = false }) {
  const current = ORDER_FLOW.indexOf(status);

  return (
    <View style={styles.tracker}>
      {ORDER_FLOW.map((step, index) => {
        const done = index <= current;
        const isLast = index === ORDER_FLOW.length - 1;

        return (
          <View key={step} style={styles.trackerStep}>
            <View style={styles.trackerRow}>
              <View
                style={[
                  styles.trackerDot,
                  light && styles.trackerDotLight,
                  done &&
                    (light
                      ? styles.trackerDotDoneLight
                      : styles.trackerDotDone),
                  index === current && styles.trackerDotCurrent,
                ]}
              >
                {done && (
                  <Check
                    size={11}
                    color={light ? C.greenDark : C.white}
                    strokeWidth={3.2}
                  />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.trackerLine,
                    light && styles.trackerLineLight,
                    index < current &&
                      (light
                        ? styles.trackerLineDoneLight
                        : styles.trackerLineDone),
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.trackerLabel,
                light && styles.trackerLabelLight,
                done &&
                  (light
                    ? styles.trackerLabelDoneLight
                    : styles.trackerLabelDone),
              ]}
              numberOfLines={1}
            >
              {TRACKER_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#E3EEE7' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    padding: 3,
  },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.4 },
  stepValue: { minWidth: 34, alignItems: 'center' },
  stepText: { fontSize: 14, fontWeight: '900', color: C.dark },

  tracker: { flexDirection: 'row' },
  trackerStep: { flex: 1 },
  trackerRow: { flexDirection: 'row', alignItems: 'center' },
  trackerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D3DAD6',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerDotLight: {
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trackerDotDone: { borderColor: C.green, backgroundColor: C.green },
  trackerDotDoneLight: { borderColor: C.white, backgroundColor: C.white },
  trackerDotCurrent: { transform: [{ scale: 1.15 }] },
  trackerLine: { flex: 1, height: 3, backgroundColor: '#E3E8E5' },
  trackerLineLight: { backgroundColor: 'rgba(255,255,255,0.28)' },
  trackerLineDone: { backgroundColor: C.green },
  trackerLineDoneLight: { backgroundColor: C.white },
  trackerLabel: {
    marginTop: 6,
    fontSize: 9.5,
    fontWeight: '700',
    color: C.muted,
    marginLeft: -4,
  },
  trackerLabelLight: { color: 'rgba(255,255,255,0.6)' },
  trackerLabelDone: { color: C.dark, fontWeight: '900' },
  trackerLabelDoneLight: { color: C.white, fontWeight: '900' },
});
