import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  RefreshCw,
  MapPin,
  Thermometer,
  Droplet,
  Wind,
  Eye,
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Umbrella,
  ChevronRight,
  ChevronLeft,
  Leaf,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const PAGE_BG = '#FAFBFA';
const ORANGE = '#F97316';
const BLUE = '#3B82F6';
const PAGE_PADDING = width * 0.037;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const WEATHER_STATS = [
  {
    id: 'feels',
    label: 'Feels Like',
    value: '30°C',
    Icon: Thermometer,
  },
  {
    id: 'humidity',
    label: 'Humidity',
    value: '60%',
    Icon: Droplet,
  },
  {
    id: 'wind',
    label: 'Wind Speed',
    value: '12 km/h',
    Icon: Wind,
  },
  {
    id: 'visibility',
    label: 'Visibility',
    value: '10 km',
    Icon: Eye,
  },
  {
    id: 'uv',
    label: 'UV Index',
    value: 'Moderate',
    Icon: Sun,
    highlight: true,
  },
];
const FORECAST_DAYS = [
  {
    id: 'today',
    day: 'Today',
    temp: '28°',
    low: '19°',
    Icon: Sun,
    color: '#FBBF24',
    selected: true,
  },
  {
    id: 'fri',
    day: 'Fri',
    temp: '27°',
    low: '18°',
    Icon: CloudRain,
    color: BLUE,
  },
  {
    id: 'sat',
    day: 'Sat',
    temp: '26°',
    low: '17°',
    Icon: Cloud,
    color: '#94A3B8',
  },
  {
    id: 'sun',
    day: 'Sun',
    temp: '29°',
    low: '20°',
    Icon: CloudSun,
    color: '#FBBF24',
  },
  {
    id: 'mon',
    day: 'Mon',
    temp: '27°',
    low: '19°',
    Icon: CloudRain,
    color: BLUE,
  },
];
const HOURLY_FORECAST = [
  {
    id: 'now',
    time: 'Now',
    temp: '28°',
    rain: '10%',
    Icon: Sun,
    color: '#FBBF24',
  },
  {
    id: '10am',
    time: '10 AM',
    temp: '29°',
    rain: '10%',
    Icon: Sun,
    color: '#FBBF24',
  },
  {
    id: '11am',
    time: '11 AM',
    temp: '30°',
    rain: '10%',
    Icon: Sun,
    color: '#FBBF24',
  },
  {
    id: '12pm',
    time: '12 PM',
    temp: '31°',
    rain: '20%',
    Icon: CloudSun,
    color: '#FBBF24',
  },
  {
    id: '1pm',
    time: '1 PM',
    temp: '32°',
    rain: '40%',
    Icon: CloudRain,
    color: BLUE,
  },
];
const ALERTS = [
  {
    id: 'spray',
    title: 'Spray Advisory',
    subtitle: 'Good conditions for pesticide spray in your area today.',
    time: '9:00 AM',
    Icon: Leaf,
    color: DARK_GREEN,
    bg: '#EAFBF0',
  },
  {
    id: 'rain',
    title: 'Heavy Rain Alert',
    subtitle: 'Heavy rain expected tomorrow. Take necessary precautions.',
    time: '8:30 AM',
    Icon: CloudRain,
    color: ORANGE,
    bg: '#FFF7ED',
  },
  {
    id: 'temp',
    title: 'Temperature Alert',
    subtitle: 'Increase in temperature expected from next 2 days.',
    time: '8:00 AM',
    Icon: Thermometer,
    color: BLUE,
    bg: '#EFF6FF',
  },
];
export default function WeatherScreen({ navigation }) {
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };
  const handleRefresh = () => {
    Alert.alert('Refresh', 'Weather data refreshed.');
  };
  const handleViewFullForecast = () => {
    navigation.navigate('SevenDayForecast');
  };
  const getAlertTitleColor = alert => {
    if (alert.id === 'spray') return DARK_GREEN;
    if (alert.id === 'rain') return ORANGE;
    return BLUE;
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.backButtonRow}
        >
          <ChevronLeft size={rf(23)} color={DARK_GREEN} strokeWidth={2.8} />
          <Text style={styles.headerTitle}>Weather</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRefresh}
          style={styles.refreshBtn}
        >
          <RefreshCw size={rf(19)} color={DARK_GREEN} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.locationCard}>
          <ImageBackground
            source={require('../../assets/weather/hero.png')}
            style={styles.locationBg}
            imageStyle={styles.locationBgImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                '#FFFFFF',
                '#FFFFFF',
                'rgba(255,255,255,0.94)',
                'rgba(255,255,255,0.55)',
                'rgba(255,255,255,0.05)',
                'rgba(255,255,255,0)',
              ]}
              locations={[0, 0.28, 0.44, 0.62, 0.85, 1]}
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

            <View style={styles.locationRow}>
              <View style={styles.locationIconCircle}>
                <MapPin size={rf(16)} color={DARK_GREEN} strokeWidth={2.4} />
              </View>

              <View style={styles.locationTextBox}>
                <Text style={styles.locationName}>Yavatmal, Maharashtra</Text>
                <Text style={styles.locationUpdated}>Updated just now</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {}
        <LinearGradient
          colors={['#3B9EFF', '#1E7FFF', '#0F5FE0']}
          locations={[0, 0.5, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={styles.mainWeatherCard}
        >
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          <View style={styles.mainWeatherTop}>
            <View style={styles.sunCloudBox}>
              <Sun
                size={rf(64)}
                color="#FCD34D"
                fill="#FCD34D"
                strokeWidth={1.4}
                style={styles.sunIcon}
              />
              <Cloud
                size={rf(42)}
                color="#E8EEF5"
                fill="#E8EEF5"
                strokeWidth={1.2}
                style={styles.cloudOverlay}
              />
            </View>

            <View style={styles.tempBox}>
              <Text style={styles.tempText}>28°C</Text>
              <Text style={styles.tempCondition}>Sunny</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {WEATHER_STATS.map(stat => {
              const Icon = stat.Icon;
              return (
                <View key={stat.id} style={styles.statCol}>
                  <Icon size={rf(16)} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text
                    style={[
                      styles.statValue,
                      stat.highlight && {
                        color: '#FCD34D',
                      },
                    ]}
                  >
                    {stat.value}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.weatherDivider} />

          <View style={styles.rainRow}>
            <View style={styles.rainBox}>
              <View style={styles.rainIconCircle}>
                <CloudRain size={rf(19)} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={styles.rainTextBox}>
                <Text style={styles.rainLabel}>RAIN PROBABILITY</Text>
                <Text style={styles.rainValue}>40%</Text>
              </View>
            </View>

            <View style={styles.rainDivider} />

            <View style={styles.rainBox}>
              <View style={styles.rainIconCircle}>
                <Umbrella size={rf(19)} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={styles.rainTextBox}>
                <Text style={styles.rainLabel}>TODAY'S RAINFALL</Text>
                <Text style={styles.rainValue}>
                  2.5<Text style={styles.rainUnit}>mm</Text>
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {}
        <View style={styles.aiCard}>
          <Image
            source={require('../../assets/homescreen/bot.png')}
            style={styles.aiBot}
            resizeMode="contain"
          />

          <View style={styles.aiContent}>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>AI Weather Advice</Text>
            </View>
            <Text style={styles.aiTitle}>
              Good time for pesticide spraying today.
            </Text>
            <Text style={styles.aiSubtitle}>
              Rain expected after 6 PM.{'\n'}Complete spraying before 4 PM.
            </Text>
          </View>

          <ChevronRight size={rf(19)} color={DARK_GREEN} strokeWidth={2.4} />
        </View>

        {}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={rf(14)} color={BLUE} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastRow}
        >
          {FORECAST_DAYS.map(day => {
            const Icon = day.Icon;
            const isSun = day.Icon === Sun;
            return (
              <View
                key={day.id}
                style={[
                  styles.forecastCard,
                  day.selected && styles.selectedForecastCard,
                ]}
              >
                <Text
                  style={[
                    styles.forecastDay,
                    day.selected && {
                      color: DARK_GREEN,
                    },
                  ]}
                >
                  {day.day}
                </Text>
                <Icon
                  size={rf(28)}
                  color={day.color}
                  fill={isSun ? day.color : 'none'}
                  strokeWidth={2}
                />
                <Text style={styles.forecastTemp}>{day.temp}</Text>
                <Text style={styles.forecastLow}>{day.low}</Text>
              </View>
            );
          })}
        </ScrollView>

        {}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hourly Forecast</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={rf(14)} color={BLUE} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastRow}
        >
          {HOURLY_FORECAST.map(hour => {
            const Icon = hour.Icon;
            const isSun = hour.Icon === Sun;
            return (
              <View key={hour.id} style={styles.hourlyCard}>
                <Text style={styles.forecastDay}>{hour.time}</Text>
                <Icon
                  size={rf(26)}
                  color={hour.color}
                  fill={isSun ? hour.color : 'none'}
                  strokeWidth={2}
                />
                <Text style={styles.forecastTemp}>{hour.temp}</Text>
                <View style={styles.rainInfo}>
                  <Droplet
                    size={rf(10)}
                    color={BLUE}
                    fill={BLUE}
                    strokeWidth={2}
                  />
                  <Text style={styles.rainInfoText}>{hour.rain}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Farming Weather Alerts</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={rf(14)} color={BLUE} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <View style={styles.alertsList}>
          {ALERTS.map(alert => {
            const Icon = alert.Icon;
            const titleColor = getAlertTitleColor(alert);
            return (
              <TouchableOpacity
                key={alert.id}
                activeOpacity={0.85}
                style={styles.alertCard}
              >
                <View
                  style={[
                    styles.alertIconCircle,
                    {
                      backgroundColor: alert.bg,
                    },
                  ]}
                >
                  <Icon size={rf(19)} color={alert.color} strokeWidth={2.3} />
                </View>

                <View style={styles.alertContent}>
                  <View style={styles.alertTopRow}>
                    <Text
                      style={[
                        styles.alertTitle,
                        {
                          color: titleColor,
                        },
                      ]}
                    >
                      {alert.title}
                    </Text>
                    <Text
                      style={[
                        styles.alertTime,
                        {
                          color: titleColor,
                        },
                      ]}
                    >
                      {alert.time}
                    </Text>
                  </View>
                  <Text style={styles.alertSubtitle}>{alert.subtitle}</Text>
                </View>

                <ChevronRight size={rf(17)} color="#94A3B8" strokeWidth={2.3} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleViewFullForecast}
          style={styles.primaryButton}
        >
          <Cloud size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>View Full Forecast</Text>
          <ChevronRight
            size={rf(16)}
            color="#FFFFFF"
            strokeWidth={2.4}
            style={styles.primaryButtonChevron}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 58,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
  },
  refreshBtn: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 6,
    paddingBottom: 90,
    backgroundColor: PAGE_BG,
  },
  locationCard: {
    height: 74,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  locationBg: {
    flex: 1,
    justifyContent: 'center',
  },
  locationBgImage: {
    width: '100%',
    height: '100%',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  locationIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextBox: {
    marginLeft: 10,
    flex: 1,
  },
  locationName: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: DARK,
  },
  locationUpdated: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },
  mainWeatherCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#1E7FFF',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  mainWeatherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sunCloudBox: {
    width: 104,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunIcon: {
    marginBottom: 6,
    marginRight: 8,
  },
  cloudOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 2,
  },
  tempBox: {
    alignItems: 'center',
  },
  tempText: {
    fontSize: rf(50),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.2,
    lineHeight: rf(56),
  },
  tempCondition: {
    marginTop: 2,
    fontSize: rf(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: rf(9),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  statValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  weatherDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  rainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rainBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rainIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rainTextBox: {
    flex: 1,
  },
  rainLabel: {
    fontSize: rf(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.2,
  },
  rainValue: {
    marginTop: 2,
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rainUnit: {
    fontSize: rf(11),
    fontWeight: '700',
  },
  rainDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 12,
  },
  aiCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0FBF3',
    borderWidth: 1,
    borderColor: '#C9EED6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBot: {
    width: 50,
    height: 50,
  },
  aiContent: {
    flex: 1,
    marginLeft: 11,
  },
  aiPill: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BBF0CC',
    justifyContent: 'center',
  },
  aiPillText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  aiTitle: {
    marginTop: 5,
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  aiSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    lineHeight: rf(14),
    fontWeight: '500',
    color: MUTED,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: BLUE,
  },
  forecastRow: {
    gap: 8,
    paddingRight: 8,
  },
  forecastCard: {
    width: 72,
    minHeight: 114,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedForecastCard: {
    borderColor: DARK_GREEN,
    borderWidth: 2,
  },
  forecastDay: {
    fontSize: rf(11),
    fontWeight: '700',
    color: DARK,
  },
  forecastTemp: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  forecastLow: {
    fontSize: rf(10),
    fontWeight: '600',
    color: '#94A3B8',
  },
  hourlyCard: {
    width: 72,
    minHeight: 114,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rainInfoText: {
    fontSize: rf(9),
    fontWeight: '700',
    color: BLUE,
  },
  alertsList: {
    gap: 10,
  },
  alertCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    marginLeft: 11,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTitle: {
    fontSize: rf(12),
    fontWeight: '900',
  },
  alertTime: {
    fontSize: rf(10),
    fontWeight: '900',
  },
  alertSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    lineHeight: rf(14),
    fontWeight: '500',
    color: MUTED,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    position: 'relative',
  },
  primaryButtonText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  primaryButtonChevron: {
    position: 'absolute',
    right: 18,
  },
});
