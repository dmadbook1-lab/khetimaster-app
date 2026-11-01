import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
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
  ChevronRight,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  Navigation,
  RefreshCw,
  ShieldAlert,
  SprayCan,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Tractor,
  TriangleAlert,
} from 'lucide-react-native';

import { TopInset } from '../../components/market/MarketHero';
import useLocalWeather from '../../components/weather/useLocalWeather';
import { WeatherIcon } from '../../components/weather/weatherVisuals';
import WeatherLiveCard from '../../components/weather/WeatherLiveCard';
import useAfterTransition from '../../components/weather/useAfterTransition';
import {
  AdviceBoard,
  DaySquares,
  HourSquares,
} from '../../components/weather/WeatherSections';
import {
  DetailTile,
  FadeIn,
  SectionHeader,
  Skeleton,
  W,
  W_SHADOW,
} from '../../components/weather/WeatherParts';
import {
  clockLabel,
  dateLabel,
  dayLabel,
  dayShortLabel,
  descriptionLabel,
  fieldWorkAdvice,
  formatTemp,
  irrigationAdvice,
  round,
  sprayAdvice,
  upcomingHours,
  uvLevel,
  windDirection,
} from '../../utils/weatherFormat';
import { timeAgo } from '../../utils/marketFormat';

function Header({ onBack, onRefresh, refreshing }) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBack}
        style={styles.backRow}
      >
        <ChevronLeft size={24} color={W.greenDark} strokeWidth={2.8} />
        <Text style={styles.headerTitle}>{t('weather.title')}</Text>
      </TouchableOpacity>
      {!!onRefresh && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRefresh}
          style={styles.refreshButton}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={W.green} />
          ) : (
            <RefreshCw size={18} color={W.greenDark} strokeWidth={2.4} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function WeatherScreen({ navigation }) {
  const { t } = useTranslation();
  const {
    data,
    status,
    error,
    fetchedAt,
    place,
    locationLoading,
    locationMissing,
    refresh,
  } = useLocalWeather();
  const [refreshing, setRefreshing] = useState(false);
  const ready = useAfterTransition(navigation);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const current = data?.current;
  const days = data?.days || [];
  const today = days[0];

  /* LOADING / NO LOCATION / ERROR */

  if (!current) {
    const busy =
      locationLoading ||
      (!locationMissing && (status === 'loading' || status === 'idle'));

    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        <Header onBack={() => navigation.goBack()} />
        {busy ? (
          <View style={styles.body}>
            <Skeleton style={styles.skeletonHero} />
            <Skeleton style={styles.skeletonLine} />
            <Skeleton style={styles.skeletonCard} />
            <Skeleton style={styles.skeletonCard} />
            <View style={styles.skeletonRow}>
              {[0, 1, 2, 3, 4].map(index => (
                <Skeleton key={index} style={styles.skeletonHour} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.center}>
            <View style={styles.centerIcon}>
              {locationMissing ? (
                <LocateFixed size={30} color={W.green} />
              ) : (
                <TriangleAlert size={30} color="#B45309" />
              )}
            </View>
            <Text style={styles.centerTitle}>
              {locationMissing
                ? t('weather.turn_on_location')
                : t('weather.not_available')}
            </Text>
            <Text style={styles.centerText}>
              {locationMissing
                ? t('weather.allow_location')
                : error}
            </Text>
            <TouchableOpacity style={styles.retry} onPress={refresh}>
              <RefreshCw size={16} color={W.white} />
              <Text style={styles.retryText}>{t('common.try_again')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const nowEpoch = current.datetimeEpoch || Math.floor(Date.now() / 1000);
  const hours = upcomingHours(days, nowEpoch, 24);
  const todayKey = today?.datetime;

  const forecast = days.slice(0, 15);
  const lowest = Math.min(...forecast.map(day => day.tempmin));
  const highest = Math.max(...forecast.map(day => day.tempmax));
  const span = highest - lowest || 1;

  const week = days.slice(0, 7);
  const maxRain = Math.max(5, ...week.map(day => Number(day.precip) || 0));
  const weekRain = week.reduce(
    (sum, day) => sum + (Number(day.precip) || 0),
    0,
  );

  const openDay = day =>
    navigation.navigate('WeatherDay', { date: day.datetime });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <Header
        onBack={() => navigation.goBack()}
        onRefresh={onRefresh}
        refreshing={refreshing || status === 'loading'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[W.green]}
            tintColor={W.green}
          />
        }
      >
        <FadeIn>
          <WeatherLiveCard data={data} place={place} style={styles.liveCard} />
          <Text style={styles.updated}>
            {t('weather.updated', {
              when: fetchedAt
                ? timeAgo(fetchedAt) || t('common.just_now')
                : t('common.now'),
            })}
            {error ? ` · ${t('weather.showing_saved')}` : ''}
          </Text>
          {!!descriptionLabel(today) && (
            <Text style={styles.description}>{descriptionLabel(today)}</Text>
          )}
        </FadeIn>

        {(data.alerts || []).map(alert => (
          <FadeIn key={alert.event + alert.onset} delay={80}>
            <View style={styles.alert}>
              <ShieldAlert size={18} color="#B91C1C" />
              <View style={styles.flex}>
                <Text style={styles.alertTitle}>{alert.event}</Text>
                {!!alert.headline && (
                  <Text style={styles.alertText}>{alert.headline}</Text>
                )}
              </View>
            </View>
          </FadeIn>
        ))}

        {ready ? (
          <>
            {/* FARM ADVICE */}
            <FadeIn delay={80}>
              <SectionHeader
                title={t('weather.farm_advice_today')}
                subtitle={t('weather.tap_card')}
              />
              <AdviceBoard
                items={[
                  {
                    key: 'spray',
                    label: t('weather.spraying'),
                    icon: SprayCan,
                    advice: sprayAdvice(today),
                  },
                  {
                    key: 'water',
                    label: t('weather.watering'),
                    icon: Droplets,
                    advice: irrigationAdvice(days),
                  },
                  {
                    key: 'field',
                    label: t('weather.field_work'),
                    icon: Tractor,
                    advice: fieldWorkAdvice(days),
                  },
                ]}
              />
            </FadeIn>

            {/* 7 DAYS */}
            <FadeIn delay={140}>
              <SectionHeader
                title={t('weather.forecast_7')}
                subtitle={t('weather.tap_day')}
              />
              <DaySquares days={week} todayKey={todayKey} onPress={openDay} />
            </FadeIn>

            {/* NEXT 24 HOURS */}
            <FadeIn delay={200}>
              <SectionHeader title={t('weather.next_24')} />
              <HourSquares hours={hours} />
            </FadeIn>

            {/* RAIN */}
            <FadeIn delay={320}>
              <SectionHeader
                title={t('weather.rain_week')}
                subtitle={
                  weekRain >= 1
                    ? t('weather.rain_week_mm', { mm: Math.round(weekRain) })
                    : t('weather.rain_week_none')
                }
              />
              <View style={styles.card}>
                <View style={styles.rainRow}>
                  {week.map(day => {
                    const mm = Number(day.precip) || 0;
                    return (
                      <TouchableOpacity
                        key={day.datetime}
                        activeOpacity={0.8}
                        style={styles.rainCol}
                        onPress={() => openDay(day)}
                      >
                        <Text style={styles.rainMm}>
                          {mm >= 0.5
                            ? t('units.mm_value', { n: Math.round(mm) })
                            : ''}
                        </Text>
                        <View style={styles.rainTrack}>
                          <LinearGradient
                            colors={['#7DD3FC', '#0284C7']}
                            style={[
                              styles.rainBar,
                              {
                                height: `${Math.max((mm / maxRain) * 100, 4)}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.rainChance}>
                          {round(day.precipprob) ?? 0}%
                        </Text>
                        <Text style={styles.rainDay}>
                          {dayShortLabel(day.datetime, todayKey)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.cardNote}>
                  {t('weather.bars_note')}
                </Text>
              </View>
            </FadeIn>

            {/* 15 DAYS */}
            <FadeIn delay={380}>
              <SectionHeader
                title={t('weather.next_days', { n: forecast.length })}
              />
              <View style={styles.card}>
                {forecast.map((day, index) => (
                  <TouchableOpacity
                    key={day.datetime}
                    activeOpacity={0.8}
                    style={[styles.dayRow, index > 0 && styles.dayDivider]}
                    onPress={() => openDay(day)}
                  >
                    <View style={styles.dayName}>
                      <Text style={styles.dayLabel}>
                        {dayLabel(day.datetime, todayKey)}
                      </Text>
                      <Text style={styles.dayDate}>
                        {dateLabel(day.datetime)}
                      </Text>
                    </View>
                    <WeatherIcon
                      icon={day.icon}
                      conditions={day.conditions}
                      size={22}
                    />
                    <Text style={styles.dayRainPct}>
                      {(Number(day.precipprob) || 0) >= 20
                        ? `${round(day.precipprob)}%`
                        : ''}
                    </Text>
                    <Text style={styles.dayMin}>{formatTemp(day.tempmin)}</Text>
                    <View style={styles.rangeTrack}>
                      <LinearGradient
                        colors={['#38BDF8', '#FBBF24', '#F97316']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.rangeFill,
                          {
                            left: `${((day.tempmin - lowest) / span) * 100}%`,
                            width: `${Math.max(
                              ((day.tempmax - day.tempmin) / span) * 100,
                              6,
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.dayMax}>{formatTemp(day.tempmax)}</Text>
                    <ChevronRight size={15} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            {/* DETAILS */}
            <FadeIn delay={440}>
              <SectionHeader title="Weather details" />
              <View style={styles.tiles}>
                <DetailTile
                  icon={Thermometer}
                  color="#F97316"
                  label={t('weather.feels_like')}
                  value={formatTemp(current.feelslike)}
                  note={
                    Math.abs((current.feelslike || 0) - (current.temp || 0)) >=
                    2
                      ? current.feelslike > current.temp
                        ? t('weather.feels_hotter')
                        : t('weather.feels_cooler')
                      : t('weather.feels_same')
                  }
                />
                <DetailTile
                  icon={Navigation}
                  color="#0EA5E9"
                  label={t('weather.wind')}
                  value={t('units.kmh_value', { n: round(current.windspeed) })}
                  note={`${t('weather.from_dir', {
                    dir: windDirection(current.winddir) || '—',
                  })}${
                    current.windgust
                      ? ` · ${t('weather.gusts', { n: round(current.windgust) })}`
                      : ''
                  }`}
                />
                <DetailTile
                  icon={Sun}
                  color="#EAB308"
                  label={t('weather.uv_index')}
                  value={String(round(current.uvindex) ?? 0)}
                  note={uvLevel(current.uvindex)}
                />
                <DetailTile
                  icon={Droplets}
                  color="#2563EB"
                  label={t('weather.dew_point')}
                  value={formatTemp(current.dew)}
                  note={t('weather.humidity_pct', { n: round(current.humidity) })}
                />
                <DetailTile
                  icon={Gauge}
                  color="#7C3AED"
                  label={t('weather.pressure')}
                  value={`${round(current.pressure)} hPa`}
                  note={t('weather.clouds_pct', { n: round(current.cloudcover) ?? 0 })}
                />
                <DetailTile
                  icon={Eye}
                  color="#0F766E"
                  label={t('weather.visibility')}
                  value={t('units.km_value', { n: round(current.visibility) ?? '--' })}
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
                    <Text style={styles.sunLabel}>{t('weather.sunrise')}</Text>
                    <Text style={styles.sunValue}>
                      {clockLabel(current.sunrise || today?.sunrise)}
                    </Text>
                  </View>
                </View>
                <View style={styles.sunDivider} />
                <View style={styles.sunItem}>
                  <Sunset size={24} color="#EA580C" />
                  <View>
                    <Text style={styles.sunLabel}>{t('weather.sunset')}</Text>
                    <Text style={styles.sunValue}>
                      {clockLabel(current.sunset || today?.sunset)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </FadeIn>
          </>
        ) : (
          // light placeholders while the screen slides in
          <View>
            <Skeleton style={styles.skeletonLine} />
            <Skeleton style={styles.skeletonCard} />
            <Skeleton style={styles.skeletonCard} />
            <Skeleton style={styles.skeletonCard} />
          </View>
        )}

        <Text style={styles.source}>
          Weather data: Visual Crossing · {data.address}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: W.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  body: { paddingHorizontal: 16 },
  flex: { flex: 1 },
  white: { color: W.white },
  whiteSoft: { color: 'rgba(255,255,255,0.85)' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: W.white,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: 19, fontWeight: '900', color: W.dark },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  skeletonHero: { height: 380, borderRadius: 28, marginTop: 8 },
  liveCard: { marginTop: 6 },
  updated: {
    marginTop: 10,
    fontSize: 11.5,
    fontWeight: '600',
    color: W.muted,
    textAlign: 'center',
  },
  description: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: '600',
    color: W.text,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  skeletonLine: { height: 18, width: '55%', marginTop: 26 },
  skeletonCard: { height: 74, borderRadius: 20, marginTop: 12 },
  skeletonRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  skeletonHour: { flex: 1, height: 110, borderRadius: 20 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  centerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: { fontSize: 17, fontWeight: '900', color: W.dark },
  centerText: {
    fontSize: 13,
    fontWeight: '600',
    color: W.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  retry: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 14,
    backgroundColor: W.green,
  },
  retryText: { color: W.white, fontWeight: '900', fontSize: 14 },

  alert: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
  },
  alertTitle: { fontSize: 14, fontWeight: '900', color: '#991B1B' },
  alertText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 18,
  },

  card: {
    padding: 14,
    borderRadius: 22,
    backgroundColor: W.white,
    ...W_SHADOW,
  },
  cardNote: {
    fontSize: 11,
    fontWeight: '600',
    color: W.muted,
    marginTop: 10,
    textAlign: 'center',
  },
  rainRow: { flexDirection: 'row', gap: 6 },
  rainCol: { flex: 1, alignItems: 'center' },
  rainMm: { fontSize: 10, fontWeight: '800', color: '#0369A1', height: 14 },
  rainTrack: {
    height: 96,
    width: '68%',
    marginTop: 4,
    justifyContent: 'flex-end',
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    overflow: 'hidden',
  },
  rainBar: { width: '100%', borderRadius: 10 },
  rainChance: { fontSize: 11, fontWeight: '900', color: W.dark, marginTop: 6 },
  rainDay: { fontSize: 10.5, fontWeight: '700', color: W.muted },

  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
  },
  dayDivider: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dayName: { width: 74 },
  dayLabel: { fontSize: 14, fontWeight: '900', color: W.dark },
  dayDate: { fontSize: 11, fontWeight: '600', color: W.muted },
  dayRainPct: {
    width: 34,
    fontSize: 11,
    fontWeight: '800',
    color: W.blue,
    textAlign: 'center',
  },
  dayMin: {
    width: 30,
    fontSize: 13,
    fontWeight: '700',
    color: W.muted,
    textAlign: 'right',
  },
  dayMax: { width: 30, fontSize: 13, fontWeight: '900', color: W.dark },
  rangeTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  rangeFill: { position: 'absolute', top: 0, bottom: 0, borderRadius: 3 },

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
  source: {
    marginTop: 22,
    fontSize: 11,
    fontWeight: '600',
    color: W.muted,
    textAlign: 'center',
  },
});
