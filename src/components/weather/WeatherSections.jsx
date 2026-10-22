import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Droplets } from 'lucide-react-native';

import WeatherArt, { artKindFor } from './WeatherArt';
import { W, W_SHADOW } from './WeatherParts';
import {
  dayLabel,
  formatTemp,
  hourLabel,
  round,
} from '../../utils/weatherFormat';

const { width } = Dimensions.get('window');
const GUTTER = 16;
const GAP = 10;

// 3 equal squares across the content width
const ADVICE_SIZE = Math.floor((width - GUTTER * 2 - 28 - GAP * 2) / 3);
// 3.4 day squares visible, so the row clearly scrolls
const DAY_SIZE = Math.floor((width - GUTTER * 2 - GAP * 3) / 3.4);
// 4.4 hour squares visible
const HOUR_SIZE = Math.floor((width - GUTTER * 2 - GAP * 4) / 4.4);

const TONES = {
  good: { color: '#15803D', bg: '#DCFCE7', soft: '#F0FDF4', label: 'Good' },
  caution: {
    color: '#B45309',
    bg: '#FEF3C7',
    soft: '#FFFBEB',
    label: 'Careful',
  },
  avoid: { color: '#B91C1C', bg: '#FEE2E2', soft: '#FEF2F2', label: 'Avoid' },
};

/*
|--------------------------------------------------------------------------
| FARM ADVICE BOARD
|--------------------------------------------------------------------------
|
| items: [{key, label, icon, advice: {tone, title, text}}]
| Three equal square tiles; the selected tile's advice shows below.
|
*/

export function AdviceBoard({ items }) {
  const [selectedKey, setSelectedKey] = useState(items[0]?.key);
  const selected = items.find(item => item.key === selectedKey) || items[0];
  const selectedTone = TONES[selected?.advice.tone] || TONES.good;

  return (
    <View style={styles.board}>
      <View style={styles.adviceRow}>
        {items.map(({ key, label, icon: Icon, advice }) => {
          const tone = TONES[advice.tone] || TONES.good;
          const active = key === selected?.key;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.85}
              onPress={() => setSelectedKey(key)}
              style={[
                styles.adviceTile,
                { backgroundColor: tone.soft },
                active && { borderColor: tone.color },
              ]}
            >
              <View style={[styles.adviceIcon, { backgroundColor: tone.bg }]}>
                <Icon size={20} color={tone.color} strokeWidth={2.4} />
              </View>
              <Text style={styles.adviceLabel} numberOfLines={1}>
                {label}
              </Text>
              <View style={[styles.adviceTag, { backgroundColor: tone.bg }]}>
                <View
                  style={[styles.adviceDot, { backgroundColor: tone.color }]}
                />
                <Text style={[styles.adviceTagText, { color: tone.color }]}>
                  {tone.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!!selected && (
        <View
          style={[styles.adviceDetail, { borderLeftColor: selectedTone.color }]}
        >
          <Text style={styles.adviceTitle}>{selected.advice.title}</Text>
          <Text style={styles.adviceText}>{selected.advice.text}</Text>
        </View>
      )}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| 7-DAY SQUARES
|--------------------------------------------------------------------------
*/

export function DaySquares({ days, todayKey, onPress }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {days.map((day, index) => {
        const today = index === 0;
        const content = (
          <>
            <View style={styles.squareTop}>
              <Text
                style={[styles.dayName, today && styles.white]}
                numberOfLines={1}
              >
                {today ? 'Today' : dayLabel(day.datetime, todayKey).slice(0, 3)}
              </Text>
              {(Number(day.precipprob) || 0) >= 10 && (
                <View style={[styles.rainPill, today && styles.rainPillLight]}>
                  <Droplets size={9} color={today ? W.white : W.blue} />
                  <Text style={[styles.rainPillText, today && styles.white]}>
                    {round(day.precipprob)}%
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.squareArt}>
              <WeatherArt
                kind={artKindFor(day.icon, day.conditions)}
                size={DAY_SIZE * 0.4}
              />
            </View>

            <View style={styles.squareBottom}>
              <Text style={[styles.dayHigh, today && styles.white]}>
                {formatTemp(day.tempmax)}
              </Text>
              <Text style={[styles.dayLow, today && styles.whiteSoft]}>
                {formatTemp(day.tempmin)}
              </Text>
            </View>
          </>
        );

        return (
          <TouchableOpacity
            key={day.datetime}
            activeOpacity={0.85}
            onPress={() => onPress?.(day)}
          >
            {today ? (
              <LinearGradient
                colors={['#22A75A', '#15803D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.square, styles.daySquare, styles.squareToday]}
              >
                {content}
              </LinearGradient>
            ) : (
              <View style={[styles.square, styles.daySquare]}>{content}</View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/*
|--------------------------------------------------------------------------
| NEXT HOURS SQUARES
|--------------------------------------------------------------------------
*/

export function HourSquares({ hours }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {hours.map((hour, index) => {
        const now = index === 0;
        const rain = round(hour.precipprob) ?? 0;

        return (
          <View
            key={hour.datetimeEpoch}
            style={[styles.square, styles.hourSquare, now && styles.hourNow]}
          >
            <Text
              style={[styles.hourTime, now && styles.white]}
              numberOfLines={1}
            >
              {now ? 'Now' : hourLabel(hour.datetime)}
            </Text>
            <WeatherArt
              kind={artKindFor(hour.icon, hour.conditions)}
              size={HOUR_SIZE * 0.36}
            />
            <View style={styles.hourBottom}>
              <Text style={[styles.hourTemp, now && styles.white]}>
                {formatTemp(hour.temp)}
              </Text>
              {rain > 0 && (
                <Text style={[styles.hourRain, now && styles.whiteSoft]}>
                  {rain}%
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  white: { color: W.white },
  whiteSoft: { color: 'rgba(255,255,255,0.82)' },

  board: {
    padding: 14,
    borderRadius: 24,
    backgroundColor: W.white,
    ...W_SHADOW,
  },
  adviceRow: { flexDirection: 'row', gap: GAP },
  adviceTile: {
    width: ADVICE_SIZE,
    height: ADVICE_SIZE,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  adviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceLabel: { fontSize: 12.5, fontWeight: '900', color: W.dark },
  adviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  adviceDot: { width: 6, height: 6, borderRadius: 3 },
  adviceTagText: { fontSize: 10.5, fontWeight: '900' },
  adviceDetail: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    backgroundColor: W.bg,
  },
  adviceTitle: { fontSize: 14.5, fontWeight: '900', color: W.dark },
  adviceText: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: '600',
    color: W.text,
    lineHeight: 18,
  },

  strip: { gap: GAP, paddingRight: GUTTER, paddingBottom: 6 },
  square: {
    borderRadius: 20,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
  },

  daySquare: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    padding: 9,
    justifyContent: 'space-between',
  },
  squareToday: { borderColor: '#15803D' },
  squareTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayName: { fontSize: 12.5, fontWeight: '900', color: W.text },
  rainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
  },
  rainPillLight: { backgroundColor: 'rgba(255,255,255,0.22)' },
  rainPillText: { fontSize: 9.5, fontWeight: '900', color: '#0369A1' },
  squareArt: { alignItems: 'center' },
  squareBottom: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  dayHigh: { fontSize: 16, fontWeight: '900', color: W.dark },
  dayLow: { fontSize: 12.5, fontWeight: '700', color: W.muted },

  hourSquare: {
    width: HOUR_SIZE,
    height: HOUR_SIZE,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hourNow: { backgroundColor: W.blue, borderColor: W.blue },
  hourTime: { fontSize: 11, fontWeight: '800', color: W.muted },
  hourBottom: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  hourTemp: { fontSize: 14, fontWeight: '900', color: W.dark },
  hourRain: { fontSize: 9.5, fontWeight: '800', color: W.blue },
});
