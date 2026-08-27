import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  Thermometer,
  Droplet,
  Wind,
  Sprout,
  Leaf,
  CloudRain,
  Clock,
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
const AMBER = '#F59E0B';
const RED = '#EF4444';
const PAGE_PADDING = width * 0.037;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const ICON_SUN = require('../../assets/weather/sun.png');
const ICON_SUN_CLOUD = require('../../assets/weather/sun-cloud.png');
const ICON_CLOUD_RAIN = require('../../assets/weather/cloud-rain.png');
const WEEKLY_SUMMARY = [
  {
    id: 'sunny',
    value: '3 Days',
    label: 'Sunny',
    icon: ICON_SUN,
  },
  {
    id: 'rainy',
    value: '2 Days',
    label: 'Rainy',
    icon: ICON_CLOUD_RAIN,
  },
  {
    id: 'cloudy',
    value: '2 Days',
    label: 'Cloudy',
    icon: ICON_SUN_CLOUD,
  },
  {
    id: 'temp',
    value: '28°C',
    label: 'Avg Temp',
    isTemp: true,
  },
  {
    id: 'rain',
    value: '18mm',
    label: 'Rainfall',
    isRainfall: true,
  },
];
const WEEK_GLANCE = [
  {
    id: 'mon',
    day: 'Mon',
    icon: ICON_SUN,
    selected: true,
  },
  {
    id: 'tue',
    day: 'Tue',
    icon: ICON_SUN,
  },
  {
    id: 'wed',
    day: 'Wed',
    icon: ICON_SUN_CLOUD,
  },
  {
    id: 'thu',
    day: 'Thu',
    icon: ICON_SUN,
  },
  {
    id: 'fri',
    day: 'Fri',
    icon: ICON_CLOUD_RAIN,
  },
  {
    id: 'sat',
    day: 'Sat',
    icon: ICON_CLOUD_RAIN,
  },
  {
    id: 'sun',
    day: 'Sun',
    icon: ICON_SUN_CLOUD,
  },
];
const AI_ADVISORIES = [
  {
    id: 'spray',
    label: 'Best for Spraying',
    value: 'Tuesday & Wednesday',
    Icon: Leaf,
    color: DARK_GREEN,
  },
  {
    id: 'irrigation',
    label: 'Best for Irrigation',
    value: 'Thursday morning',
    Icon: Droplet,
    color: BLUE,
  },
  {
    id: 'harvest',
    label: 'Harvest Window',
    value: 'Monday – before rain',
    Icon: Sprout,
    color: DARK_GREEN,
  },
  {
    id: 'warning',
    label: 'Heavy Rain Warning',
    value: 'Friday & Saturday',
    Icon: CloudRain,
    color: ORANGE,
  },
];
const DAILY_FORECASTS = [
  {
    id: 'mon',
    day: 'Monday',
    date: '13 Jan',
    temp: '32°',
    low: '22°',
    condition: 'SUNNY',
    humidity: '52%',
    wind: '10 km/h',
    rain: '5%',
    icon: ICON_SUN,
    tip: 'Ideal day for field spraying and harvesting crops.',
    tipBg: '#FFF7ED',
    buttonColor: ORANGE,
  },
  {
    id: 'tue',
    day: 'Tuesday',
    date: '14 Jan',
    temp: '30°',
    low: '21°',
    condition: 'Mostly Clear',
    humidity: '60%',
    wind: '12 km/h',
    rain: '15%',
    icon: ICON_SUN_CLOUD,
    tip: 'Good morning window for pesticide spraying before noon.',
    tipBg: '#EAFBF0',
    buttonColor: DARK_GREEN,
  },
  {
    id: 'wed',
    day: 'Wednesday',
    date: '15 Jan',
    temp: '29°',
    low: '20°',
    condition: 'Partly Cloudy',
    humidity: '65%',
    wind: '14 km/h',
    rain: '25%',
    icon: ICON_SUN_CLOUD,
    tip: 'Complete spraying early. Light clouds reduce chemical efficiency.',
    tipBg: '#EAFBF0',
    buttonColor: DARK_GREEN,
  },
  {
    id: 'thu',
    day: 'Thursday',
    date: '16 Jan',
    temp: '33°',
    low: '23°',
    condition: 'Sunny',
    humidity: '48%',
    wind: '9 km/h',
    rain: '8%',
    icon: ICON_SUN,
    tip: 'High heat stress possible. Irrigate crops early morning.',
    tipBg: '#EFF6FF',
    buttonColor: BLUE,
  },
  {
    id: 'fri',
    day: 'Friday',
    date: '17 Jan',
    temp: '26°',
    low: '19°',
    condition: 'Rainy',
    humidity: '80%',
    wind: '18 km/h',
    rain: '85%',
    icon: ICON_CLOUD_RAIN,
    tip: 'Avoid harvesting. Secure equipment and check field drainage.',
    tipBg: '#FEF2F2',
    buttonColor: RED,
  },
  {
    id: 'sat',
    day: 'Saturday',
    date: '18 Jan',
    temp: '24°',
    low: '18°',
    condition: 'Heavy Rain',
    humidity: '90%',
    wind: '22 km/h',
    rain: '92%',
    icon: ICON_CLOUD_RAIN,
    tip: 'Heavy rain alert. Stay indoors. Protect crops from waterlogging.',
    tipBg: '#FEF2F2',
    buttonColor: RED,
  },
  {
    id: 'sun',
    day: 'Sunday',
    date: '19 Jan',
    temp: '28°',
    low: '20°',
    condition: 'Clearing Up',
    humidity: '70%',
    wind: '13 km/h',
    rain: '30%',
    icon: ICON_SUN_CLOUD,
    tip: 'Post-rain soil is ideal. Plan sowing and transplanting activities.',
    tipBg: '#EAFBF0',
    buttonColor: DARK_GREEN,
  },
];
const FARMING_TIPS = [
  {
    id: 'spray',
    title: 'Spraying',
    subtitle: 'Best on Tue & Wed before 10 AM. Low wind, low humidity.',
    Icon: Leaf,
    color: DARK_GREEN,
    bg: '#EAFBF0',
  },
  {
    id: 'irrigation',
    title: 'Irrigation',
    subtitle: 'Skip Thu-Fri. Rain expected. Resume Saturday morning.',
    Icon: Droplet,
    color: BLUE,
    bg: '#EFF6FF',
  },
  {
    id: 'harvest',
    title: 'Harvest',
    subtitle: 'Harvest Monday or Tuesday before heavy rain on Friday.',
    Icon: Sprout,
    color: AMBER,
    bg: '#FEF9E7',
  },
];
export default function SevenDayForecastScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState('mon');
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };
  const handleViewHourly = () => {
    navigation.navigate('HourlyForecast');
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.backBtn}
        >
          <ChevronLeft size={rf(22)} color={DARK} strokeWidth={2.6} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>7-Day Forecast</Text>
          <View style={styles.headerLocation}>
            <MapPin size={rf(11)} color={DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.headerLocationText}>Yavatmal, Maharashtra</Text>
          </View>
        </View>

        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Weekly Summary</Text>

          <View style={styles.summaryRow}>
            {WEEKLY_SUMMARY.map(item => (
              <View key={item.id} style={styles.summaryItem}>
                {item.icon && (
                  <Image
                    source={item.icon}
                    style={styles.summaryIcon}
                    resizeMode="contain"
                  />
                )}
                {item.isTemp && (
                  <View style={styles.summaryLucideBox}>
                    <Thermometer size={rf(30)} color={RED} strokeWidth={2.2} />
                  </View>
                )}
                {item.isRainfall && (
                  <View style={styles.summaryLucideBox}>
                    <Droplet
                      size={rf(30)}
                      color={BLUE}
                      fill={BLUE}
                      strokeWidth={2}
                    />
                  </View>
                )}
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>Week at a Glance</Text>

        <View style={styles.glanceRow}>
          {WEEK_GLANCE.map(item => {
            const isSelected = item.id === selectedDay;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedDay(item.id)}
                style={styles.glanceCol}
              >
                <Text
                  style={[
                    styles.glanceDay,
                    isSelected && {
                      color: DARK_GREEN,
                      fontWeight: '900',
                    },
                  ]}
                >
                  {item.day}
                </Text>
                <View
                  style={[
                    styles.glanceIconCircle,
                    isSelected && styles.glanceIconCircleSelected,
                  ]}
                >
                  <Image
                    source={item.icon}
                    style={styles.glanceIcon}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <View style={styles.advisoryHeaderLeft}>
              <View style={styles.advisoryHeaderIcon}>
                <Sprout size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <Text style={styles.advisoryHeaderTitle}>AI Weekly Advisory</Text>
            </View>
            <Text style={styles.advisoryBrand}>KhetiAI</Text>
          </View>

          <View style={styles.advisoryList}>
            {AI_ADVISORIES.map(item => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={styles.advisoryRow}>
                  <View style={styles.advisoryIconCircle}>
                    <Icon size={rf(14)} color={item.color} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.advisoryLabel}>{item.label}</Text>
                  <Text style={styles.advisoryValue}>{item.value}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.advisoryButton}>
            <Text style={styles.advisoryButtonText}>
              View Detailed Advisory
            </Text>
          </TouchableOpacity>
        </View>

        {}
        <Text style={styles.sectionTitle}>Daily Forecasts</Text>

        <View style={styles.dailyList}>
          {DAILY_FORECASTS.map(day => (
            <View key={day.id} style={styles.dailyCard}>
              <View style={styles.dailyTopRow}>
                <View style={styles.dailyLeft}>
                  <Text style={styles.dailyDay}>{day.day}</Text>
                  <Text style={styles.dailyDate}>{day.date}</Text>
                </View>

                <Image
                  source={day.icon}
                  style={styles.dailyWeatherIcon}
                  resizeMode="contain"
                />

                <View style={styles.dailyTempBox}>
                  <Text style={styles.dailyTemp}>{day.temp}</Text>
                  <Text style={styles.dailyLow}>{day.low}</Text>
                  <Text style={styles.dailyCondition}>{day.condition}</Text>
                </View>
              </View>

              <View style={styles.dailyStatsRow}>
                <View style={styles.dailyStatCol}>
                  <Droplet
                    size={rf(16)}
                    color={BLUE}
                    strokeWidth={2.2}
                    fill={BLUE}
                  />
                  <Text style={styles.dailyStatValue}>{day.humidity}</Text>
                  <Text style={styles.dailyStatLabel}>HUMIDITY</Text>
                </View>

                <View style={styles.dailyStatDivider} />

                <View style={styles.dailyStatCol}>
                  <Wind size={rf(16)} color="#94A3B8" strokeWidth={2.2} />
                  <Text style={styles.dailyStatValue}>{day.wind}</Text>
                  <Text style={styles.dailyStatLabel}>WIND</Text>
                </View>

                <View style={styles.dailyStatDivider} />

                <View style={styles.dailyStatCol}>
                  <CloudRain size={rf(16)} color="#94A3B8" strokeWidth={2.2} />
                  <Text style={styles.dailyStatValue}>{day.rain}</Text>
                  <Text style={styles.dailyStatLabel}>RAIN</Text>
                </View>
              </View>

              <View
                style={[
                  styles.dailyTipBox,
                  {
                    backgroundColor: day.tipBg,
                  },
                ]}
              >
                <Text style={styles.dailyTipEmoji}>💡</Text>
                <Text style={styles.dailyTipText}>{day.tip}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.dailyDetailsBtn,
                  {
                    borderColor: day.buttonColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dailyDetailsBtnText,
                    {
                      color: day.buttonColor,
                    },
                  ]}
                >
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {}
        <Text style={styles.sectionTitle}>Quick Farming Tips</Text>

        <View style={styles.tipsList}>
          {FARMING_TIPS.map(tip => {
            const Icon = tip.Icon;
            return (
              <View key={tip.id} style={styles.tipCard}>
                <View
                  style={[
                    styles.tipIconCircle,
                    {
                      backgroundColor: tip.bg,
                    },
                  ]}
                >
                  <Icon size={rf(17)} color={tip.color} strokeWidth={2.3} />
                </View>
                <View style={styles.tipTextBox}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipSubtitle}>{tip.subtitle}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleViewHourly}
          style={styles.primaryButton}
        >
          <Clock size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>View Hourly Forecast</Text>
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
    minHeight: 70,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  backBtn: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 39,
    height: 39,
  },
  headerTextBox: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  headerLocation: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLocationText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: MUTED,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 90,
    backgroundColor: PAGE_BG,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  summaryIcon: {
    width: 40,
    height: 40,
  },
  summaryLucideBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  summaryLabel: {
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  glanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glanceCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  glanceDay: {
    fontSize: rf(11),
    fontWeight: '700',
    color: MUTED,
  },
  glanceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glanceIconCircleSelected: {
    backgroundColor: '#EAFBF0',
    borderColor: DARK_GREEN,
    borderWidth: 1.5,
  },
  glanceIcon: {
    width: 32,
    height: 32,
  },
  advisoryCard: {
    marginTop: 16,
    borderRadius: 14,
    padding: 4,
    backgroundColor: '#EAFBF0',
    borderWidth: 1,
    borderColor: '#BBF0CC',
  },
  advisoryHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advisoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advisoryHeaderIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryHeaderTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  advisoryBrand: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  advisoryList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 12,
  },
  advisoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advisoryIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: rf(11),
    fontWeight: '700',
    color: DARK,
  },
  advisoryValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  advisoryButton: {
    height: 46,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dailyList: {
    gap: 14,
  },
  dailyCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  dailyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyLeft: {
    flex: 1,
  },
  dailyDay: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  dailyDate: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '600',
    color: MUTED,
  },
  dailyWeatherIcon: {
    width: 66,
    height: 66,
    marginHorizontal: 8,
  },
  dailyTempBox: {
    alignItems: 'flex-end',
    flex: 1,
  },
  dailyTemp: {
    fontSize: rf(27),
    fontWeight: '900',
    color: DARK,
    lineHeight: rf(31),
  },
  dailyLow: {
    marginTop: 1,
    fontSize: rf(11),
    fontWeight: '600',
    color: MUTED,
  },
  dailyCondition: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '700',
    color: MUTED,
  },
  dailyStatsRow: {
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyStatCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dailyStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  dailyStatValue: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  dailyStatLabel: {
    fontSize: rf(8),
    fontWeight: '800',
    color: '#94A3B8',
  },
  dailyTipBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dailyTipEmoji: {
    fontSize: rf(13),
  },
  dailyTipText: {
    flex: 1,
    fontSize: rf(10),
    lineHeight: rf(14),
    fontWeight: '600',
    color: DARK,
  },
  dailyDetailsBtn: {
    height: 42,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dailyDetailsBtnText: {
    fontSize: rf(12),
    fontWeight: '900',
  },
  tipsList: {
    gap: 10,
  },
  tipCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextBox: {
    flex: 1,
    marginLeft: 11,
  },
  tipTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  tipSubtitle: {
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
  },
  primaryButtonText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
