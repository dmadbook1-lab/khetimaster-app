import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  CloudRain,
  Droplets,
  SprayCan,
  Sun,
  Sunrise,
  Sunset,
  Tractor,
  Wind,
} from 'lucide-react-native';

import { TopInset } from '../../components/market/MarketHero';
import useLocalWeather from '../../components/weather/useLocalWeather';
import useAfterTransition from '../../components/weather/useAfterTransition';
import { WeatherIcon } from '../../components/weather/weatherVisuals';
import {
  AdviceCard,
  DetailTile,
  FadeIn,
  SectionHeader,
  W,
  W_SHADOW,
  WeatherHeroCard,
} from '../../components/weather/WeatherParts';
import {
  clockLabel,
  dateLabel,
  dayLabel,
  fieldWorkAdvice,
  formatTemp,
  hourLabel,
  irrigationAdvice,
  round,
  sprayAdvice,
  uvLevel,
  windDirection,
} from '../../utils/weatherFormat';

/*
 * One day of the forecast: summary card, farm advice and every hour.
 */
export default function WeatherDayScreen({ navigation, route }) {
  const { date } = route.params || {};
  const { data, place } = useLocalWeather();
  const ready = useAfterTransition(navigation);

  const days = data?.days || [];
  const index = days.findIndex(day => day.datetime === date);
  const day = days[index];
  const todayKey = days[0]?.datetime;

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
        style={styles.backRow}
      >
        <ChevronLeft size={24} color={W.greenDark} strokeWidth={2.8} />
        <Text style={styles.headerTitle}>
          {day
            ? `${dayLabel(day.datetime, todayKey)}, ${dateLabel(day.datetime)}`
            : 'Weather'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!day) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        {header}
        <View style={styles.missing}>
          <Text style={styles.missingText}>
            This day is no longer in the forecast.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const next = days[index + 1];
  const hours = day.hours || [];
  const hourMax = Math.max(...hours.map(hour => hour.temp));
  const hourMin = Math.min(...hours.map(hour => hour.temp));
  const hourSpan = hourMax - hourMin || 1;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <FadeIn>
          <WeatherHeroCard
            place={place}
            subtitle={`${dayLabel(day.datetime, todayKey)} · ${dateLabel(
              day.datetime,
            )}`}
            temp={formatTemp(day.tempmax)}
            condition={day.conditions}
            icon={day.icon}
            meta={`Low ${formatTemp(day.tempmin)}  ·  Sunrise ${clockLabel(
              day.sunrise,
            )}  ·  Sunset ${clockLabel(day.sunset)}`}
            description={day.description}
            stats={[
              {
                icon: CloudRain,
                label: 'Rain',
                value: `${round(day.precipprob) ?? 0}%`,
                color: '#0891B2',
              },
              {
                icon: Wind,
                label: windDirection(day.winddir) || 'Wind',
                value: `${round(day.windspeed)} km/h`,
                color: '#0EA5E9',
              },
              {
                icon: Droplets,
                label: 'Humidity',
                value: `${round(day.humidity)}%`,
                color: '#2563EB',
              },
              {
                icon: Sun,
                label: 'UV',
                value: String(round(day.uvindex) ?? 0),
                color: '#F59E0B',
              },
            ]}
          />
        </FadeIn>

        {ready && (
          <>
            <FadeIn delay={120}>
              <SectionHeader title="Farm advice" />
              <AdviceCard icon={SprayCan} advice={sprayAdvice(day)} />
              <AdviceCard
                icon={Droplets}
                advice={irrigationAdvice([day, next])}
              />
              <AdviceCard
                icon={Tractor}
                advice={fieldWorkAdvice([day, next])}
              />
            </FadeIn>

            <FadeIn delay={200}>
              <SectionHeader title="Rain and wind" />
              <View style={styles.tiles}>
                <DetailTile
                  icon={CloudRain}
                  color="#0284C7"
                  label="Rain"
                  value={
                    (Number(day.precip) || 0) >= 0.5
                      ? `${Math.round(day.precip)} mm`
                      : 'None'
                  }
                  note={`${round(day.precipprob) ?? 0}% chance`}
                />
                <DetailTile
                  icon={Wind}
                  color="#0EA5E9"
                  label="Wind"
                  value={`${round(day.windspeed)} km/h`}
                  note={`From ${windDirection(day.winddir) || '—'}${
                    day.windgust ? ` · gusts ${round(day.windgust)}` : ''
                  }`}
                />
                <DetailTile
                  icon={Sun}
                  color="#EAB308"
                  label="UV index"
                  value={String(round(day.uvindex) ?? 0)}
                  note={uvLevel(day.uvindex)}
                />
                <DetailTile
                  icon={Droplets}
                  color="#2563EB"
                  label="Humidity"
                  value={`${round(day.humidity)}%`}
                />
              </View>

              <LinearGradient
                colors={['#FFF7ED', '#FEF3C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sunCard}
              >
                <View style={styles.sunItem}>
                  <Sunrise size={24} color="#F59E0B" />
                  <View>
                    <Text style={styles.sunLabel}>Sunrise</Text>
                    <Text style={styles.sunValue}>
                      {clockLabel(day.sunrise)}
                    </Text>
                  </View>
                </View>
                <View style={styles.sunDivider} />
                <View style={styles.sunItem}>
                  <Sunset size={24} color="#EA580C" />
                  <View>
                    <Text style={styles.sunLabel}>Sunset</Text>
                    <Text style={styles.sunValue}>
                      {clockLabel(day.sunset)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </FadeIn>

            <FadeIn delay={280}>
              <SectionHeader title="Hour by hour" />
              <View style={styles.card}>
                {hours.map((hour, hourIndex) => (
                  <View
                    key={hour.datetime}
                    style={[
                      styles.hourRow,
                      hourIndex > 0 && styles.hourDivider,
                    ]}
                  >
                    <Text style={styles.hourTime}>
                      {hourLabel(hour.datetime)}
                    </Text>
                    <WeatherIcon
                      icon={hour.icon}
                      conditions={hour.conditions}
                      size={20}
                    />
                    <View style={styles.hourBarTrack}>
                      <LinearGradient
                        colors={['#38BDF8', '#FBBF24', '#F97316']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.hourBar,
                          {
                            width: `${
                              20 + ((hour.temp - hourMin) / hourSpan) * 80
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.hourRain}>
                      {(Number(hour.precipprob) || 0) > 0
                        ? `${round(hour.precipprob)}%`
                        : ''}
                    </Text>
                    <Text style={styles.hourTemp}>{formatTemp(hour.temp)}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: W.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: W.white,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: W.dark },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { fontSize: 14, fontWeight: '700', color: W.muted },

  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sunCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
  },
  sunItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sunLabel: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  sunValue: { fontSize: 16, fontWeight: '900', color: W.dark },
  sunDivider: { width: 1, height: 34, backgroundColor: '#FCD9A8' },

  card: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 22,
    backgroundColor: W.white,
    ...W_SHADOW,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  hourDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  hourTime: { width: 46, fontSize: 12.5, fontWeight: '800', color: W.text },
  hourBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  hourBar: { height: 6, borderRadius: 3 },
  hourRain: {
    width: 34,
    fontSize: 11.5,
    fontWeight: '800',
    color: W.blue,
    textAlign: 'right',
  },
  hourTemp: {
    width: 36,
    fontSize: 15,
    fontWeight: '900',
    color: W.dark,
    textAlign: 'right',
  },
});
