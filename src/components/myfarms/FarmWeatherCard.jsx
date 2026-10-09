import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  RefreshCw,
  Sun,
  Wind,
} from 'lucide-react-native';

import {useDispatch, useSelector} from 'react-redux';

import {
  createAOI,
  fetchForecastData,
  fetchAOICurrentWeather,
} from '../../redux/slices/weatherSlice';

import {farmToGeoJSON} from '../../utils/cropMonitoringGeometry';

const {width} = Dimensions.get('window');

const DARK = '#111827';
const MUTED = '#475569';
const GREEN = '#159447';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

/* ============================================================
   WEATHER HELPERS
============================================================ */

const getWeatherIcon = weather => {
  const value = String(weather || '').toLowerCase();

  if (
    value.includes('rain') ||
    value.includes('drizzle') ||
    value.includes('storm')
  ) {
    return CloudRain;
  }

  if (
    value.includes('cloud') ||
    value.includes('overcast')
  ) {
    return Cloud;
  }

  if (
    value.includes('partly') ||
    value.includes('cloudy')
  ) {
    return CloudSun;
  }

  return Sun;
};

const getWeatherDescription = weather => {
  if (!weather) {
    return 'Sunny';
  }

  const value = String(weather);

  if (
    value.toLowerCase().includes('rain') ||
    value.toLowerCase().includes('drizzle')
  ) {
    return 'Rainy';
  }

  if (
    value.toLowerCase().includes('cloud') ||
    value.toLowerCase().includes('overcast')
  ) {
    return 'Cloudy';
  }

  return value;
};

const getForecastArray = forecastData => {
  if (!forecastData) {
    return [];
  }

  if (Array.isArray(forecastData)) {
    return forecastData;
  }

  if (Array.isArray(forecastData.daily)) {
    return forecastData.daily;
  }

  if (Array.isArray(forecastData.forecast)) {
    return forecastData.forecast;
  }

  if (Array.isArray(forecastData.data)) {
    return forecastData.data;
  }

  return [];
};

const getTemperature = day => {
  if (day?.temp_mean != null) {
    return Math.round(Number(day.temp_mean));
  }

  if (day?.temp?.day != null) {
    return Math.round(Number(day.temp.day));
  }

  if (
    day?.temp != null &&
    !isNaN(Number(day.temp))
  ) {
    return Math.round(Number(day.temp));
  }

  if (day?.temperature != null) {
    return Math.round(Number(day.temperature));
  }

  return null;
};

const getMinTemperature = day => {
  if (day?.temp_min != null) {
    return Math.round(Number(day.temp_min));
  }

  if (day?.temp?.min != null) {
    return Math.round(Number(day.temp.min));
  }

  return null;
};

const getMaxTemperature = day => {
  if (day?.temp_max != null) {
    return Math.round(Number(day.temp_max));
  }

  if (day?.temp?.max != null) {
    return Math.round(Number(day.temp.max));
  }

  return null;
};

const getRain = day => {
  if (day?.precipitation != null) {
    return Number(day.precipitation);
  }

  if (day?.rain != null) {
    return Number(day.rain);
  }

  return null;
};

const formatDay = dateString => {
  if (!dateString) {
    return '--';
  }

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
    });
  } catch {
    return '--';
  }
};

/* ============================================================
   COMPONENT
============================================================ */

export default function FarmWeatherCard({
  farmData,
}) {
  const dispatch = useDispatch();

  const {
    forecastData,
    aoiCurrentWeather,
    aoiId,
    isLoading,
    error,
  } = useSelector(state => state.weather);

  const [localError, setLocalError] =
    useState(null);

  /* ==========================================================
     FARM GEOMETRY
  ========================================================== */

  const geometry = useMemo(() => {
    if (!farmData?.field) {
      return null;
    }

    try {
      return farmToGeoJSON(farmData);
    } catch {
      return null;
    }
  }, [farmData]);

  /* ==========================================================
     LOAD WEATHER
  ========================================================== */

  const loadWeather = useCallback(
    async ({forceCreate = false} = {}) => {
      if (!geometry) {
        setLocalError(
          'Farm boundary is not available',
        );

        return;
      }

      setLocalError(null);

      try {
        let currentAoiId = aoiId;

        if (!currentAoiId || forceCreate) {
          const result = await dispatch(
            createAOI({
              name:
                farmData?.fieldName ||
                farmData?.name ||
                'KhetiMaster Farm',

              geometry,
            }),
          ).unwrap();

          currentAoiId =
            typeof result === 'object'
              ? result?.id
              : result;

          if (!currentAoiId) {
            throw new Error(
              'ObserveEarth did not return an AOI ID',
            );
          }
        }

        await Promise.all([
          dispatch(
            fetchForecastData({
              geometry_id: currentAoiId,
            }),
          ).unwrap(),

          dispatch(
            fetchAOICurrentWeather({
              geometry_id: currentAoiId,
            }),
          ).unwrap(),
        ]);
      } catch (err) {
        setLocalError(
          typeof err === 'string'
            ? err
            : err?.message ||
                'Unable to load farm weather',
        );
      }
    },
    [
      dispatch,
      geometry,
      aoiId,
      farmData?.fieldName,
      farmData?.name,
    ],
  );

  useEffect(() => {
    if (!geometry) {
      return;
    }

    loadWeather();
  }, [geometry]);

  /* ==========================================================
     FORECAST
  ========================================================== */

  const forecast = useMemo(
    () => getForecastArray(forecastData),
    [forecastData],
  );

  const current = aoiCurrentWeather;

  const isLoadingWeather =
    isLoading?.forecast ||
    isLoading?.createAoi ||
    isLoading?.aoiCurrentWeather;

  const displayError =
    localError || error;

  /* ==========================================================
     INVALID FARM
  ========================================================== */

  if (
    !farmData?.field ||
    farmData.field.length < 3
  ) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <CloudSun
            size={38}
            color="#FBBF24"
            strokeWidth={2}
          />

          <View style={styles.invalidTextContainer}>
            <Text style={styles.temp}>
              --°C
            </Text>

            <Text style={styles.weatherDesc}>
              Farm boundary unavailable
            </Text>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    isLoadingWeather &&
    !forecast.length &&
    !current
  ) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={GREEN}
          />

          <Text style={styles.loadingText}>
            Getting farm weather...
          </Text>
        </View>
      </View>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    displayError &&
    !forecast.length &&
    !current
  ) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <View style={styles.errorLeft}>
            <CloudSun
              size={34}
              color="#FBBF24"
              strokeWidth={2}
            />

            <View>
              <Text style={styles.temp}>
                --°C
              </Text>

              <Text
                style={styles.weatherDesc}
                numberOfLines={1}>
                Weather unavailable
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              loadWeather({
                forceCreate: true,
              })
            }
            style={styles.refreshButton}>
            <RefreshCw
              size={17}
              color={DARK}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ==========================================================
     CURRENT WEATHER
  ========================================================== */

  const currentTemperature =
    current?.temperature ??
    current?.temp ??
    current?.current?.temperature ??
    current?.current?.temp;

  const currentHumidity =
    current?.relative_humidity ??
    current?.humidity ??
    current?.current?.relative_humidity ??
    current?.current?.humidity;

  const currentWind =
    current?.wind_speed ??
    current?.windSpeed ??
    current?.current?.wind_speed ??
    current?.current?.windSpeed;

  const currentRain =
    current?.rain ??
    current?.current?.rain;

  const currentPrecipitation =
    current?.precipitation ??
    current?.current?.precipitation;

  const currentCondition =
    current?.weather ??
    current?.condition ??
    current?.description ??
    current?.current?.weather ??
    current?.current?.condition ??
    current?.current?.description ??
    'Sunny';

  const CurrentWeatherIcon =
    getWeatherIcon(currentCondition);

  const temperatureText =
    currentTemperature != null
      ? `${Math.round(
          Number(currentTemperature),
        )}°C`
      : '--°C';

  const humidityText =
    currentHumidity != null
      ? `${Math.round(
          Number(currentHumidity),
        )}%`
      : '--';

  const windText =
    currentWind != null
      ? `${Number(currentWind).toFixed(1)} km/h`
      : '--';

  const rainText =
    currentRain != null
      ? `${Number(currentRain).toFixed(1)} mm`
      : '--';

  const precipitationText =
    currentPrecipitation != null
      ? `${Number(
          currentPrecipitation,
        ).toFixed(1)} mm`
      : '--';

  /* ==========================================================
     CARD
  ========================================================== */

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardShadow}>
        <ImageBackground
          source={require('../../assets/weather/hero.png')}
          style={styles.weatherCard}
          imageStyle={styles.bgImage}
          resizeMode="cover">

          <LinearGradient
            colors={[
              'rgba(255,255,255,0.98)',
              'rgba(255,255,255,0.92)',
              'rgba(255,255,255,0.75)',
              'rgba(255,255,255,0.55)',
              'rgba(255,255,255,0.35)',
            ]}
            locations={[
              0,
              0.3,
              0.6,
              0.85,
              1,
            ]}
            start={{
              x: 0,
              y: 0.5,
            }}
            end={{
              x: 1,
              y: 0.5,
            }}
            style={StyleSheet.absoluteFill}
          />

          {/* ==================================================
              CURRENT WEATHER
          ================================================== */}

          <View style={styles.weatherLeft}>
            <CurrentWeatherIcon
              size={46}
              color={
                CurrentWeatherIcon ===
                CloudRain
                  ? '#38BDF8'
                  : CurrentWeatherIcon ===
                    Cloud
                  ? '#64748B'
                  : CurrentWeatherIcon ===
                    CloudSun
                  ? '#FBBF24'
                  : '#FBBF24'
              }
              strokeWidth={2}
            />

            <View>
              <Text style={styles.temp}>
                {temperatureText}
              </Text>

              <Text
                style={styles.weatherDesc}
                numberOfLines={1}>
                {getWeatherDescription(
                  currentCondition,
                )}
              </Text>
            </View>
          </View>

          {/* ==================================================
              HUMIDITY
          ================================================== */}

          <WeatherStat
            Icon={Droplets}
            color="#2563EB"
            value={humidityText}
            label="Humidity"
          />

          {/* ==================================================
              WIND
          ================================================== */}

          <WeatherStat
            Icon={Wind}
            color="#0EA5E9"
            value={windText}
            label="Wind"
          />

          {/* ==================================================
              RAIN
          ================================================== */}

          <WeatherStat
            Icon={CloudRain}
            color="#38BDF8"
            value={rainText}
            label="Rain"
          />

          {/* ==================================================
              PRECIPITATION
          ================================================== */}

          <WeatherStat
            Icon={Droplets}
            color="#6366F1"
            value={precipitationText}
            label="Precip."
          />
        </ImageBackground>
      </View>

      {/* ========================================================
          FORECAST
      ======================================================== */}

      {forecast.length > 0 && (
        <View style={styles.forecastWrapper}>
          <View style={styles.forecastHeader}>
            <View>
              <Text style={styles.forecastTitle}>
                Farm Forecast
              </Text>

              <Text style={styles.forecastSubtitle}>
                Next{' '}
                {Math.min(
                  forecast.length,
                  5,
                )}{' '}
                days
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                loadWeather({
                  forceCreate: true,
                })
              }
              style={styles.forecastRefresh}>
              {isLoadingWeather ? (
                <ActivityIndicator
                  size="small"
                  color={GREEN}
                />
              ) : (
                <RefreshCw
                  size={15}
                  color={GREEN}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.forecastList}>
            {forecast
              .slice(0, 5)
              .map((day, index) => {
                const weatherText =
                  day?.weather?.description ||
                  day?.weather?.main ||
                  day?.condition ||
                  day?.description ||
                  'Sunny';

                const Icon =
                  getWeatherIcon(weatherText);

                const temp =
                  getTemperature(day);

                const min =
                  getMinTemperature(day);

                const max =
                  getMaxTemperature(day);

                const rain =
                  getRain(day);

                return (
                  <View
                    key={`${day?.date || index}`}
                    style={[
                      styles.forecastItem,
                      index ===
                        Math.min(
                          forecast.length,
                          5,
                        ) -
                          1 &&
                        styles.lastForecastItem,
                    ]}>

                    <View
                      style={styles.forecastDay}>
                      <Text
                        style={styles.dayText}>
                        {index === 0
                          ? 'Today'
                          : formatDay(
                              day?.date,
                            )}
                      </Text>

                      <Text
                        style={styles.dateText}>
                        {day?.date
                          ? day.date.slice(5)
                          : '--'}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.forecastIcon
                      }>
                      <Icon
                        size={22}
                        color={
                          Icon === CloudRain
                            ? '#38BDF8'
                            : Icon === Cloud
                            ? '#64748B'
                            : '#FBBF24'
                        }
                        strokeWidth={2}
                      />
                    </View>

                    <View
                      style={
                        styles.forecastCondition
                      }>
                      <Text
                        style={
                          styles.conditionText
                        }
                        numberOfLines={1}>
                        {getWeatherDescription(
                          weatherText,
                        )}
                      </Text>

                      {rain != null && (
                        <Text
                          style={
                            styles.rainText
                          }>
                          {Number(
                            rain,
                          ).toFixed(1)}{' '}
                          mm rain
                        </Text>
                      )}
                    </View>

                    <View
                      style={
                        styles.forecastTemperature
                      }>
                      <Text
                        style={
                          styles.maxTemperature
                        }>
                        {max != null
                          ? `${max}°`
                          : temp != null
                          ? `${temp}°`
                          : '--'}
                      </Text>

                      {min != null && (
                        <Text
                          style={
                            styles.minTemperature
                          }>
                          {min}°
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      )}
    </View>
  );
}

/* ================================================================
   WEATHER STAT
================================================================ */

const WeatherStat = ({
  Icon,
  color,
  value,
  label,
}) => (
  <View style={styles.weatherStat}>
    <Icon
      size={20}
      color={color}
      strokeWidth={2.4}
    />

    <Text
      style={styles.weatherValue}
      numberOfLines={1}
      adjustsFontSizeToFit>
      {value}
    </Text>

    <Text
      style={styles.weatherLabel}
      numberOfLines={1}>
      {label}
    </Text>
  </View>
);

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
  },

  card: {
    marginTop: 14,
  },

  cardShadow: {
    borderRadius: 20,

    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 5,
  },

  weatherCard: {
    height: 105,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: width * 0.035,

    flexDirection: 'row',

    alignItems: 'center',

    overflow: 'hidden',
  },

  bgImage: {
    borderRadius: 20,
  },

  /* ============================================================
     CURRENT WEATHER
  ============================================================ */

  weatherLeft: {
    flex: 1.35,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 9,

    minWidth: 105,
  },

  invalidTextContainer: {
    marginLeft: 10,
  },

  temp: {
    fontSize: rf(27),

    color: DARK,

    fontWeight: '900',

    letterSpacing: -1,
  },

  weatherDesc: {
    marginTop: 1,

    fontSize: rf(11),

    color: MUTED,

    fontWeight: '700',

    maxWidth: 80,
  },

  /* ============================================================
     WEATHER STATS
  ============================================================ */

  weatherStat: {
    flex: 0.72,

    alignItems: 'center',

    justifyContent: 'center',

    minWidth: 45,
  },

  weatherValue: {
    marginTop: 3,

    fontSize: rf(10.5),

    color: DARK,

    fontWeight: '900',

    maxWidth: 58,

    textAlign: 'center',
  },

  weatherLabel: {
    marginTop: 2,

    fontSize: rf(8.5),

    lineHeight: rf(11),

    color: MUTED,

    fontWeight: '700',

    textAlign: 'center',

    maxWidth: 55,
  },

  /* ============================================================
     LOADING
  ============================================================ */

  loadingContainer: {
    height: 105,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

    flexDirection: 'row',

    paddingHorizontal: 20,
  },

  loadingText: {
    marginLeft: 9,

    fontSize: 12,

    color: MUTED,

    fontWeight: '700',
  },

  /* ============================================================
     ERROR
  ============================================================ */

  errorContainer: {
    height: 105,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: width * 0.04,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  errorLeft: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,
  },

  refreshButton: {
    width: 38,

    height: 38,

    borderRadius: 12,

    backgroundColor: '#F3F4F3',

    alignItems: 'center',

    justifyContent: 'center',
  },

  /* ============================================================
     FORECAST
  ============================================================ */

  forecastWrapper: {
    marginTop: 10,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1,

    borderColor: '#E8ECE9',

    padding: 14,
  },

  forecastHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 9,
  },

  forecastTitle: {
    fontSize: 15,

    fontWeight: '900',

    color: DARK,
  },

  forecastSubtitle: {
    marginTop: 2,

    fontSize: 10,

    color: '#7B817D',

    fontWeight: '600',
  },

  forecastRefresh: {
    width: 34,

    height: 34,

    borderRadius: 10,

    backgroundColor: '#EAF7EF',

    alignItems: 'center',

    justifyContent: 'center',
  },

  forecastList: {
    borderWidth: 1,

    borderColor: '#E9ECEB',

    borderRadius: 13,

    overflow: 'hidden',
  },

  forecastItem: {
    minHeight: 60,

    paddingHorizontal: 9,

    paddingVertical: 8,

    flexDirection: 'row',

    alignItems: 'center',

    borderBottomWidth: 1,

    borderBottomColor: '#ECEEED',
  },

  lastForecastItem: {
    borderBottomWidth: 0,
  },

  forecastDay: {
    width: 48,
  },

  dayText: {
    fontSize: 11,

    fontWeight: '800',

    color: DARK,
  },

  dateText: {
    marginTop: 2,

    fontSize: 9,

    color: '#929792',
  },

  forecastIcon: {
    width: 34,

    alignItems: 'center',

    justifyContent: 'center',
  },

  forecastCondition: {
    flex: 1,

    marginLeft: 4,

    minWidth: 0,
  },

  conditionText: {
    fontSize: 10,

    fontWeight: '700',

    color: '#333734',
  },

  rainText: {
    marginTop: 2,

    fontSize: 8,

    color: '#64748B',

    fontWeight: '600',
  },

  forecastTemperature: {
    minWidth: 43,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',
  },

  maxTemperature: {
    fontSize: 13,

    fontWeight: '800',

    color: DARK,
  },

  minTemperature: {
    marginLeft: 4,

    fontSize: 10,

    color: '#8A908C',
  },
});