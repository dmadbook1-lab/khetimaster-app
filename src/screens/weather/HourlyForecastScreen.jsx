import React, {useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  MapPin,
  Droplet,
  Wind,
  Sun,
  Eye,
  ArrowUp,
  ArrowDown,
  Thermometer,
  CloudRain,
  AlertTriangle,
  CloudDrizzle,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

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

// Weather icons
const ICON_SUN = require('../../assets/weather/sun.png');
const ICON_SUN_CLOUD = require('../../assets/weather/sun-cloud.png');
const ICON_CLOUD_RAIN = require('../../assets/weather/cloud-rain.png');

const HERO_STATS = [
  {id: 'hum', value: '72%', label: 'Humidity', Icon: Droplet},
  {id: 'wind', value: '14 km/h', label: 'Wind', Icon: Wind},
  {id: 'uv', value: '6 High', label: 'UV Index', Icon: Sun},
  {id: 'vis', value: '8 km', label: 'Visibility', Icon: Eye},
];

const CURRENT_CONDITIONS = [
  {
    id: 'feels',
    value: '31°C',
    label: 'Feels Like',
    note: 'Slightly hot',
    noteColor: ORANGE,
    Icon: Thermometer,
    iconColor: RED,
    bg: '#FEF9E7',
    border: '#FDE68A',
  },
  {
    id: 'hum',
    value: '72%',
    label: 'Humidity',
    note: 'High moisture',
    noteColor: BLUE,
    Icon: Droplet,
    iconColor: BLUE,
    bg: '#EFF6FF',
    border: '#BFDBFE',
    iconFill: true,
  },
  {
    id: 'wind',
    value: '14 km/h',
    label: 'Wind Speed',
    note: 'South-West',
    noteColor: '#64748B',
    Icon: Wind,
    iconColor: '#64748B',
    bg: '#F1F5F9',
    border: '#E2E8F0',
  },
  {
    id: 'uv',
    value: '6 High',
    label: 'UV Index',
    note: 'Use protection',
    noteColor: ORANGE,
    Icon: Sun,
    iconColor: '#F59E0B',
    bg: '#FFF7ED',
    border: '#FED7AA',
    iconFill: true,
  },
];

const TIMELINE_HOURS = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];

const TIMELINE_BARS = [
  {id: 'spray', Icon: Droplet, iconColor: DARK_GREEN, time: '8 AM — 11 AM', startPct: 0.20, widthPct: 0.28, color: DARK_GREEN},
  {id: 'irrigation', Icon: Droplet, iconColor: BLUE, time: '6 AM — 9 AM', startPct: 0.02, widthPct: 0.30, color: BLUE},
  {id: 'harvest', Icon: Sun, iconColor: ORANGE, time: '10 AM — 1 PM', startPct: 0.52, widthPct: 0.28, color: ORANGE},
  {id: 'rain', Icon: CloudRain, iconColor: RED, time: '6 PM — 10 PM', startPct: 0.68, widthPct: 0.30, color: RED},
];

const TIMELINE_LEGEND = [
  {id: 'spray', label: 'Spraying Window', color: DARK_GREEN},
  {id: 'irrigation', label: 'Irrigation Time', color: BLUE},
  {id: 'harvest', label: 'Harvest Window', color: ORANGE},
  {id: 'rain', label: 'Rain Expected', color: RED},
];

const AI_ADVICE = [
  {id: 'spray', title: 'Best for Spraying', value: '8 AM – 11 AM', Icon: Droplet, color: DARK_GREEN, bg: '#EAFBF0'},
  {id: 'irrigation', title: 'Best for Irrigation', value: '6 AM – 9 AM', Icon: Droplet, color: BLUE, bg: '#EFF6FF', iconFill: true},
  {id: 'rain', title: 'Rain Warning', value: 'After 6 PM', Icon: CloudRain, color: ORANGE, bg: '#FFF7ED'},
  {id: 'avoid', title: 'Avoid Field Work', value: '2 PM – 4 PM', Icon: AlertTriangle, color: RED, bg: '#FEF2F2'},
];

const HOURLY_DATA = [
  {id: 'now', time: 'Now · 12 PM', badge: 'NOW', temp: '28°', feels: 'Feels 31°', humidity: '72%', wind: '14 km/h', rain: '20%', icon: ICON_SUN_CLOUD, tip: 'Excellent for Spraying', tipEmoji: '🌿', tipColor: DARK_GREEN, tipBg: '#EAFBF0', highlight: true},
  {id: '1pm', time: '1 PM', temp: '30°', feels: 'Feels 33°', humidity: '65%', wind: '12 km/h', rain: '10%', icon: ICON_SUN, tip: 'Good for Field Work', tipEmoji: '👍', tipColor: BLUE, tipBg: '#EFF6FF'},
  {id: '2pm', time: '2 PM', temp: '32°', feels: 'Feels 35°', humidity: '58%', wind: '10 km/h', rain: '8%', icon: ICON_SUN, tip: 'Avoid Spraying — Heat', tipEmoji: '🔥', tipColor: ORANGE, tipBg: '#FFF7ED'},
  {id: '3pm', time: '3 PM', temp: '33°', feels: 'Feels 36°', humidity: '55%', wind: '9 km/h', rain: '12%', icon: ICON_SUN, tip: 'Avoid Field Work — Hot', tipEmoji: '⚠️', tipColor: ORANGE, tipBg: '#FFF7ED'},
  {id: '4pm', time: '4 PM', temp: '31°', feels: 'Feels 33°', humidity: '60%', wind: '13 km/h', rain: '25%', icon: ICON_SUN_CLOUD, tip: 'Prepare Equipment', tipEmoji: '🧰', tipColor: AMBER, tipBg: '#FEF9E7'},
  {id: '5pm', time: '5 PM', temp: '29°', feels: 'Feels 31°', humidity: '68%', wind: '16 km/h', rain: '45%', icon: ICON_SUN_CLOUD, tip: 'Prepare Equipment', tipEmoji: '🧰', tipColor: AMBER, tipBg: '#FEF9E7'},
  {id: '6pm', time: '6 PM', temp: '26°', feels: 'Feels 27°', humidity: '80%', wind: '18 km/h', rain: '80%', icon: ICON_CLOUD_RAIN, tip: 'Avoid Spraying — Rain', tipEmoji: '🌧️', tipColor: RED, tipBg: '#FEF2F2'},
  {id: '7pm', time: '7 PM', temp: '24°', feels: 'Feels 25°', humidity: '85%', wind: '20 km/h', rain: '88%', icon: ICON_CLOUD_RAIN, tip: 'Avoid Field Work — Rain', tipEmoji: '🌧️', tipColor: RED, tipBg: '#FEF2F2'},
  {id: '8pm', time: '8 PM', temp: '23°', feels: 'Feels 23°', humidity: '90%', wind: '22 km/h', rain: '92%', icon: ICON_CLOUD_RAIN, tip: 'Stay Indoors', tipEmoji: '🏠', tipColor: RED, tipBg: '#FEF2F2'},
  {id: '9pm', time: '9 PM', temp: '22°', feels: 'Feels 22°', humidity: '88%', wind: '18 km/h', rain: '85%', icon: ICON_CLOUD_RAIN, tip: 'Avoid Field Work — Rain', tipEmoji: '🌧️', tipColor: RED, tipBg: '#FEF2F2'},
  {id: '10pm', time: '10 PM', temp: '21°', feels: 'Feels 21°', humidity: '82%', wind: '14 km/h', rain: '60%', icon: ICON_CLOUD_RAIN, tip: 'Good for Irrigation', tipEmoji: '💧', tipColor: BLUE, tipBg: '#EFF6FF'},
];

export default function HourlyForecastScreen({navigation}) {
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };

 const handleRainfallDetails = () => {
  navigation.navigate('RainfallDetails');
};

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backBtn}>
          <ChevronLeft size={rf(22)} color={DARK} strokeWidth={2.6} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Hourly Forecast</Text>
          <View style={styles.headerLocation}>
            <MapPin size={rf(11)} color={DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.headerLocationText}>Yavatmal, Maharashtra</Text>
          </View>
          <Text style={styles.headerUpdated}>
            <Text style={{color: DARK_GREEN, fontWeight: '900'}}>Today</Text> · Updated Just Now
          </Text>
        </View>

        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO */}
        <LinearGradient
          colors={['#3B9EFF', '#1E7FFF', '#0F5FE0']}
          locations={[0, 0.5, 1]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTemp}>28°</Text>
              <Text style={styles.heroCondition}>Partly Cloudy</Text>

              <View style={styles.heroTagsRow}>
                <View style={styles.heroTag}>
                  <ArrowUp size={rf(12)} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.heroTagText}>High 33°</Text>
                </View>
                <View style={styles.heroTag}>
                  <ArrowDown size={rf(12)} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.heroTagText}>Low 19°</Text>
                </View>
              </View>
            </View>

            <Image source={ICON_SUN_CLOUD} style={styles.heroIcon} resizeMode="contain" />
          </View>

          <View style={styles.heroRainRow}>
            <CloudDrizzle size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.heroRainText}>Rain 65% after 6 PM</Text>
          </View>

          <View style={styles.heroStatsBox}>
            {HERO_STATS.map((stat, idx) => {
              const Icon = stat.Icon;
              return (
                <React.Fragment key={stat.id}>
                  <View style={styles.heroStatCol}>
                    <Icon size={rf(16)} color="#FFFFFF" strokeWidth={2.2} />
                    <Text style={styles.heroStatValue}>{stat.value}</Text>
                    <Text style={styles.heroStatLabel}>{stat.label}</Text>
                  </View>
                  {idx < HERO_STATS.length - 1 && <View style={styles.heroStatDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        </LinearGradient>

        {/* CURRENT CONDITIONS */}
        <Text style={styles.sectionTitle}>Current Conditions</Text>

        <View style={styles.conditionsGrid}>
          {CURRENT_CONDITIONS.map(item => {
            const Icon = item.Icon;
            return (
              <View key={item.id} style={[styles.conditionCard, {backgroundColor: item.bg, borderColor: item.border}]}>
                <View style={styles.conditionIconTop}>
                  <Icon size={rf(22)} color={item.iconColor} strokeWidth={2.3} fill={item.iconFill ? item.iconColor : 'none'} />
                </View>
                <Text style={styles.conditionValue}>{item.value}</Text>
                <Text style={styles.conditionLabel}>{item.label}</Text>
                <Text style={[styles.conditionNote, {color: item.noteColor}]}>{item.note}</Text>
              </View>
            );
          })}
        </View>

        {/* TIMELINE */}
        <Text style={styles.sectionTitle}>Farming Timeline</Text>

        <View style={styles.timelineCard}>
          <View style={styles.timelineHoursRow}>
            {TIMELINE_HOURS.map(h => <Text key={h} style={styles.timelineHour}>{h}</Text>)}
          </View>

          <View style={styles.timelineBarsCol}>
            {TIMELINE_BARS.map(bar => {
              const Icon = bar.Icon;
              return (
                <View key={bar.id} style={styles.timelineBarRow}>
                  <View style={styles.timelineBarIcon}>
                    <Icon size={rf(14)} color={bar.iconColor} strokeWidth={2.3} />
                  </View>
                  <View style={styles.timelineBarTrack}>
                    <View style={[styles.timelineBarFill, {backgroundColor: bar.color, left: `${bar.startPct * 100}%`, width: `${bar.widthPct * 100}%`}]} />
                  </View>
                  <Text style={styles.timelineBarTime}>{bar.time}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.timelineLegendGrid}>
            {TIMELINE_LEGEND.map(leg => (
              <View key={leg.id} style={styles.timelineLegendItem}>
                <View style={[styles.timelineLegendDot, {backgroundColor: leg.color}]} />
                <Text style={styles.timelineLegendText}>{leg.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI ADVICE */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiHeaderLeft}>
              <View style={styles.aiHeaderIcon}>
                <Text style={styles.aiHeaderEmoji}>🌱</Text>
              </View>
              <Text style={styles.aiHeaderTitle}>AI Farming Advice</Text>
            </View>
            <Text style={styles.aiHeaderBadge}>Today Only</Text>
          </View>

          <View style={styles.aiGrid}>
            {AI_ADVICE.map(item => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={[styles.aiCell, {backgroundColor: item.bg}]}>
                  <View style={styles.aiCellIconRow}>
                    <View style={[styles.aiCellIcon, {backgroundColor: '#FFFFFF'}]}>
                      <Icon size={rf(14)} color={item.color} strokeWidth={2.4} fill={item.iconFill ? item.color : 'none'} />
                    </View>
                  </View>
                  <Text style={styles.aiCellTitle}>{item.title}</Text>
                  <Text style={[styles.aiCellValue, {color: item.color}]}>{item.value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* HOUR BY HOUR */}
        <View style={styles.hourHeader}>
          <Text style={styles.sectionTitleNoMargin}>Hour by Hour</Text>
          <Text style={styles.next12}>Next 12 Hours</Text>
        </View>

        <View style={styles.hourList}>
          {HOURLY_DATA.map(hour => (
            <View key={hour.id} style={[styles.hourCard, hour.highlight && styles.hourCardHighlight]}>
              <View style={styles.hourTopRow}>
                <Image source={hour.icon} style={styles.hourIcon} resizeMode="contain" />

                <View style={styles.hourTextBox}>
                  <Text style={styles.hourTime}>{hour.time}</Text>
                  {hour.badge && (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowBadgeText}>{hour.badge}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.hourTempBox}>
                  <Text style={styles.hourTemp}>{hour.temp}</Text>
                  <Text style={styles.hourFeels}>{hour.feels}</Text>
                </View>
              </View>

              <View style={styles.hourStatsRow}>
                <View style={styles.hourStatCol}>
                  <Droplet size={rf(14)} color={BLUE} fill={BLUE} strokeWidth={2} />
                  <Text style={styles.hourStatValue}>{hour.humidity}</Text>
                  <Text style={styles.hourStatLabel}>Humidity</Text>
                </View>

                <View style={styles.hourStatCol}>
                  <Wind size={rf(14)} color="#94A3B8" strokeWidth={2.2} />
                  <Text style={styles.hourStatValue}>{hour.wind}</Text>
                  <Text style={styles.hourStatLabel}>Wind</Text>
                </View>

                <View style={styles.hourStatCol}>
                  <CloudRain size={rf(14)} color="#94A3B8" strokeWidth={2.2} />
                  <Text style={styles.hourStatValue}>{hour.rain}</Text>
                  <Text style={styles.hourStatLabel}>Rain</Text>
                </View>
              </View>

              <View style={[styles.hourTipRow, {backgroundColor: hour.tipBg}]}>
                <Text style={styles.hourTipEmoji}>{hour.tipEmoji}</Text>
                <Text style={[styles.hourTipText, {color: hour.tipColor}]}>{hour.tip}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleRainfallDetails} style={styles.primaryButton}>
          <CloudRain size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>Rainfall Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},

  header: {
    minHeight: 82,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },

  backBtn: {width: 39, height: 39, borderRadius: 20, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center'},

  backBtnPlaceholder: {width: 39, height: 39},

  headerTextBox: {flex: 1, marginHorizontal: 12, alignItems: 'center'},

  headerTitle: {fontSize: rf(18), fontWeight: '900', color: DARK},

  headerLocation: {marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 4},

  headerLocationText: {fontSize: rf(10), fontWeight: '600', color: MUTED},

  headerUpdated: {marginTop: 3, fontSize: rf(9), fontWeight: '500', color: MUTED},

  scrollContent: {paddingHorizontal: PAGE_PADDING, paddingTop: 14, paddingBottom: 90, backgroundColor: PAGE_BG},

  // HERO
  heroCard: {
    borderRadius: 18,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#1E7FFF',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },

  glowTopRight: {position: 'absolute', top: -80, right: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.14)'},

  glowBottomLeft: {position: 'absolute', bottom: -90, left: -80, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(255,255,255,0.09)'},

  heroTopRow: {flexDirection: 'row', alignItems: 'center'},

  heroLeft: {flex: 1},

  heroTemp: {fontSize: rf(52), fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: rf(58)},

  heroCondition: {marginTop: 2, fontSize: rf(15), fontWeight: '700', color: '#FFFFFF'},

  heroTagsRow: {marginTop: 12, flexDirection: 'row', gap: 8},

  heroTag: {height: 28, paddingHorizontal: 11, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', flexDirection: 'row', alignItems: 'center', gap: 4},

  heroTagText: {fontSize: rf(10.5), fontWeight: '800', color: '#FFFFFF'},

  heroIcon: {width: 90, height: 90},

  heroRainRow: {marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6},

  heroRainText: {fontSize: rf(11), fontWeight: '700', color: '#FFFFFF'},

  heroStatsBox: {marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', flexDirection: 'row', alignItems: 'center'},

  heroStatCol: {flex: 1, alignItems: 'center', gap: 4},

  heroStatDivider: {width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.22)'},

  heroStatValue: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},

  heroStatLabel: {fontSize: rf(9), fontWeight: '600', color: 'rgba(255,255,255,0.85)'},

  // Sections
  sectionTitle: {marginTop: 22, marginBottom: 12, fontSize: rf(15), fontWeight: '900', color: DARK},

  sectionTitleNoMargin: {fontSize: rf(15), fontWeight: '900', color: DARK},

  // Conditions
  conditionsGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10},

  conditionCard: {width: '48.5%', borderRadius: 12, padding: 13, borderWidth: 1},

  conditionIconTop: {marginBottom: 8},

  conditionValue: {fontSize: rf(19), fontWeight: '900', color: DARK},

  conditionLabel: {marginTop: 2, fontSize: rf(10), fontWeight: '600', color: MUTED},

  conditionNote: {marginTop: 5, fontSize: rf(10), fontWeight: '900'},

  // Timeline
  timelineCard: {borderRadius: 12, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER},

  timelineHoursRow: {flexDirection: 'row', justifyContent: 'space-between', marginLeft: 32, marginRight: 82},

  timelineHour: {fontSize: rf(9), fontWeight: '700', color: MUTED},

  timelineBarsCol: {marginTop: 10, gap: 10},

  timelineBarRow: {flexDirection: 'row', alignItems: 'center'},

  timelineBarIcon: {width: 22, height: 22, alignItems: 'center', justifyContent: 'center'},

  timelineBarTrack: {flex: 1, height: 10, marginHorizontal: 10, borderRadius: 5, backgroundColor: '#F1F5F9', position: 'relative', overflow: 'hidden'},

  timelineBarFill: {position: 'absolute', top: 0, bottom: 0, borderRadius: 5},

  timelineBarTime: {width: 82, fontSize: rf(9), fontWeight: '700', color: DARK, textAlign: 'right'},

  timelineLegendGrid: {marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', flexWrap: 'wrap', rowGap: 8},

  timelineLegendItem: {width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6},

  timelineLegendDot: {width: 9, height: 9, borderRadius: 5},

  timelineLegendText: {fontSize: rf(10), fontWeight: '700', color: DARK},

  // AI Advice
  aiCard: {marginTop: 20, borderRadius: 14, padding: 4, backgroundColor: '#EAFBF0', borderWidth: 1, borderColor: '#BBF0CC'},

  aiHeader: {paddingHorizontal: 14, paddingVertical: 12, borderRadius: 11, backgroundColor: DARK_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},

  aiHeaderLeft: {flexDirection: 'row', alignItems: 'center', gap: 8},

  aiHeaderIcon: {width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center'},

  aiHeaderEmoji: {fontSize: rf(12)},

  aiHeaderTitle: {fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},

  aiHeaderBadge: {fontSize: rf(9), fontWeight: '700', color: 'rgba(255,255,255,0.85)'},

  aiGrid: {padding: 8, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8},

  aiCell: {width: '49%', minHeight: 86, padding: 12, borderRadius: 10},

  aiCellIconRow: {marginBottom: 6},

  aiCellIcon: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},

  aiCellTitle: {fontSize: rf(10), fontWeight: '700', color: MUTED},

  aiCellValue: {marginTop: 3, fontSize: rf(12.5), fontWeight: '900'},

  // Hour cards
  hourHeader: {marginTop: 22, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},

  next12: {fontSize: rf(10), fontWeight: '700', color: MUTED},

  hourList: {gap: 12},

  hourCard: {borderRadius: 14, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER},

  hourCardHighlight: {borderColor: DARK_GREEN, borderWidth: 1.5, backgroundColor: '#FBFFFD'},

  hourTopRow: {flexDirection: 'row', alignItems: 'center'},

  hourIcon: {width: 44, height: 44},

  hourTextBox: {flex: 1, marginLeft: 10, gap: 4},

  hourTime: {fontSize: rf(13), fontWeight: '900', color: DARK},

  nowBadge: {alignSelf: 'flex-start', height: 18, paddingHorizontal: 7, borderRadius: 5, backgroundColor: DARK_GREEN, justifyContent: 'center'},

  nowBadgeText: {fontSize: rf(8), fontWeight: '900', color: '#FFFFFF'},

  hourTempBox: {alignItems: 'flex-end'},

  hourTemp: {fontSize: rf(23), fontWeight: '900', color: DARK, lineHeight: rf(27)},

  hourFeels: {marginTop: 1, fontSize: rf(10), fontWeight: '600', color: MUTED},

  hourStatsRow: {marginTop: 12, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center'},

  hourStatCol: {flex: 1, alignItems: 'center', gap: 3},

  hourStatValue: {fontSize: rf(11), fontWeight: '900', color: DARK},

  hourStatLabel: {fontSize: rf(8.5), fontWeight: '700', color: '#94A3B8'},

  hourTipRow: {marginTop: 10, height: 34, paddingHorizontal: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6},

  hourTipEmoji: {fontSize: rf(12)},

  hourTipText: {fontSize: rf(10.5), fontWeight: '900'},

  // Bottom Bar
  bottomBar: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: PAGE_PADDING, paddingVertical: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER},

  primaryButton: {height: 52, borderRadius: 12, backgroundColor: DARK_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9},

  primaryButtonText: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
});