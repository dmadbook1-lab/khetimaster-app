import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import {
  ChevronLeft,
  MapPin,
  Share2,
  CloudRain,
  Droplet,
  Clock,
  Wind,
  Bot,
  SprayCan,
  Wheat,
  ChevronRight,
  Timer,
  AlertTriangle,
  AlertCircle,
  Leaf,
  Bell,
  Sun,
  CloudSun,
  Cloud,
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
const PURPLE = '#A855F7';
const PAGE_PADDING = width * 0.037;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const RAIN_STATS = [
  {
    id: 'expected',
    value: '2.5 mm',
    label: 'Expected Rain',
    Icon: Droplet,
  },
  {
    id: 'starts',
    value: '6:30 PM',
    label: 'Rain Starts',
    Icon: Clock,
  },
  {
    id: 'intensity',
    value: 'Moderate',
    label: 'Intensity',
    Icon: Wind,
  },
];
const AI_ADVISORY = [
  {
    id: 'spray',
    title: 'Spraying',
    subtitle: 'Complete before 4 PM',
    Icon: SprayCan,
    badge: 'Recommended',
    badgeBg: '#FFFFFF',
    badgeColor: DARK_GREEN,
  },
  {
    id: 'irrigation',
    title: 'Irrigation',
    subtitle: 'Rainfall is sufficient',
    Icon: Droplet,
    badge: 'Not Required',
    badgeBg: 'rgba(255,255,255,0.25)',
    badgeColor: '#FFFFFF',
  },
  {
    id: 'harvest',
    title: 'Harvest',
    subtitle: 'Expected after sunset',
    Icon: Wheat,
    badge: 'High Priority',
    badgeBg: '#FED7AA',
    badgeColor: '#B45309',
  },
];
const TIMELINE_DATA = [
  {
    id: '8am',
    time: '8AM',
    value: '0%',
    Icon: Sun,
    color: '#FBBF24',
  },
  {
    id: '10am',
    time: '10AM',
    value: '5%',
    Icon: Sun,
    color: '#FBBF24',
  },
  {
    id: '12pm',
    time: '12PM',
    value: '10%',
    Icon: CloudSun,
    color: '#FBBF24',
  },
  {
    id: '4pm',
    time: '4PM',
    value: '40%',
    Icon: Cloud,
    color: '#94A3B8',
  },
  {
    id: '7pm',
    time: '7PM',
    value: '82%',
    Icon: CloudRain,
    color: BLUE,
    active: true,
  },
  {
    id: '9pm',
    time: '9PM',
    value: '20%',
    Icon: Cloud,
    color: '#94A3B8',
  },
];
const INSIGHTS = [
  {
    id: 'prob',
    value: '82%',
    label: 'Rain Probability',
    Icon: CloudRain,
    color: BLUE,
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    id: 'expected',
    value: '2.5 mm',
    label: 'Expected Rain',
    Icon: Droplet,
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    iconFill: true,
  },
  {
    id: 'duration',
    value: '1h 45m',
    label: 'Duration',
    Icon: Timer,
    color: PURPLE,
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    id: 'risk',
    value: 'Medium',
    label: 'Risk Level',
    Icon: AlertTriangle,
    color: ORANGE,
    bg: '#FFF7ED',
    border: '#FED7AA',
  },
];
const FARM_IMPACT = [
  {
    id: 'spray',
    title: 'Spraying',
    subtitle: 'Recommended Before 4 PM',
    Icon: Leaf,
    color: DARK_GREEN,
    bg: '#EAFBF0',
  },
  {
    id: 'irrigation',
    title: 'Irrigation',
    subtitle: 'Skip Today',
    Icon: Droplet,
    color: BLUE,
    bg: '#EFF6FF',
    iconFill: true,
  },
  {
    id: 'harvest',
    title: 'Harvest',
    subtitle: 'Complete Before 6 PM',
    Icon: Wheat,
    color: AMBER,
    bg: '#FEF9E7',
  },
];
const SAFETY_TIPS = [
  'Avoid fertilizer application during rainfall.',
  'Cover harvested produce before evening.',
  'Delay pesticide spraying after rainfall starts.',
];
function RainCurve() {
  const chartWidth = width - PAGE_PADDING * 2 - 30;
  const chartHeight = 90;
  const points = [
    {
      x: chartWidth * 0.02,
      y: chartHeight * 0.85,
    },
    {
      x: chartWidth * 0.2,
      y: chartHeight * 0.72,
    },
    {
      x: chartWidth * 0.38,
      y: chartHeight * 0.55,
    },
    {
      x: chartWidth * 0.56,
      y: chartHeight * 0.32,
    },
    {
      x: chartWidth * 0.74,
      y: chartHeight * 0.18,
    },
    {
      x: chartWidth * 0.96,
      y: chartHeight * 0.42,
    },
  ];
  const activePoint = points[4];
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (p.x - prev.x) / 2;
      const cp2y = p.y;
      return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
    })
    .join(' ');
  const fillD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${
    points[0].x
  } ${chartHeight} Z`;
  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Defs>
        <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BLUE} stopOpacity="0.25" />
          <Stop offset="1" stopColor={BLUE} stopOpacity="0" />
        </SvgGradient>
      </Defs>

      <Path d={fillD} fill="url(#grad)" />
      <Path
        d={pathD}
        stroke={BLUE}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />

      <Circle
        cx={activePoint.x}
        cy={activePoint.y}
        r={5}
        fill={BLUE}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
    </Svg>
  );
}
export default function RainfallDetailsScreen({ navigation }) {
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };
  const handleViewAlerts = () => {
    navigation.navigate('AIWeatherInsights');
  };
  const handleShare = () => {
    Alert.alert('Share', 'Sharing rainfall details...');
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.iconBtn}
        >
          <ChevronLeft size={rf(22)} color={DARK} strokeWidth={2.6} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Rainfall Details</Text>
          <View style={styles.headerSubRow}>
            <MapPin size={rf(11)} color={DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.headerSubText}>Yavatmal, Maharashtra</Text>
            <Text style={styles.headerDot}> · </Text>
            <Text style={styles.headerUpdated}>Updated Just Now</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.iconBtn}
        >
          <Share2 size={rf(18)} color={DARK} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
          style={styles.heroCard}
        >
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>RAIN PROBABILITY</Text>
              <Text style={styles.heroPercent}>82%</Text>

              <View style={styles.heroChip}>
                <Droplet
                  size={rf(11)}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  strokeWidth={2}
                />
                <Text style={styles.heroChipText}>
                  High Chance of Rain{'\n'}Today
                </Text>
              </View>
            </View>

            <CloudRain
              size={rf(88)}
              color="#FFFFFF"
              strokeWidth={1.8}
              style={styles.heroCloudIcon}
            />
          </View>

          <View style={styles.heroStatsRow}>
            {RAIN_STATS.map(stat => {
              const Icon = stat.Icon;
              return (
                <View key={stat.id} style={styles.heroStatBox}>
                  <Icon size={rf(15)} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.heroStatValue}>{stat.value}</Text>
                  <Text style={styles.heroStatLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <View style={styles.advisoryHeaderLeft}>
              <Text style={styles.advisoryTitle}>AI Rain Advisory</Text>
              <Text style={styles.advisorySubtitle}>
                Powered by KhetiMaster AI
              </Text>
            </View>

            <View style={styles.advisoryBotBox}>
              <Bot size={rf(20)} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </View>

          <View style={styles.advisoryList}>
            {AI_ADVISORY.map(item => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={styles.advisoryRow}>
                  <View style={styles.advisoryIconBox}>
                    <Icon size={rf(16)} color="#FFFFFF" strokeWidth={2.3} />
                  </View>

                  <View style={styles.advisoryTextBox}>
                    <Text style={styles.advisoryRowTitle}>{item.title}</Text>
                    <Text style={styles.advisoryRowSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.advisoryBadge,
                      {
                        backgroundColor: item.badgeBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.advisoryBadgeText,
                        {
                          color: item.badgeColor,
                        },
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.advisoryButton}>
            <Text style={styles.advisoryButtonText}>View Detailed Advice</Text>
            <ChevronRight size={rf(15)} color={DARK_GREEN} strokeWidth={2.6} />
          </TouchableOpacity>
        </View>

        {}
        <Text style={styles.sectionTitle}>Rain Timeline</Text>

        <View style={styles.timelineCard}>
          <View style={styles.timelineCurveWrap}>
            <RainCurve />
          </View>

          <View style={styles.timelineDataRow}>
            {TIMELINE_DATA.map(item => {
              const Icon = item.Icon;
              const isSun = item.Icon === Sun;
              return (
                <View key={item.id} style={styles.timelineDataCol}>
                  <Icon
                    size={rf(16)}
                    color={item.color}
                    fill={isSun ? item.color : 'none'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.timelineValue,
                      item.active && {
                        color: BLUE,
                      },
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>Rain Insights</Text>

        <View style={styles.insightsGrid}>
          {INSIGHTS.map(item => {
            const Icon = item.Icon;
            return (
              <View
                key={item.id}
                style={[
                  styles.insightCard,
                  {
                    backgroundColor: item.bg,
                    borderColor: item.border,
                  },
                ]}
              >
                <Icon
                  size={rf(22)}
                  color={item.color}
                  strokeWidth={2.3}
                  fill={item.iconFill ? item.color : 'none'}
                />
                <Text
                  style={[
                    styles.insightValue,
                    {
                      color: item.color,
                    },
                  ]}
                >
                  {item.value}
                </Text>
                <Text style={styles.insightLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>

        {}
        <Text style={styles.sectionTitle}>Today's Farm Impact</Text>

        <View style={styles.impactList}>
          {FARM_IMPACT.map(item => {
            const Icon = item.Icon;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.impactCard}
              >
                <View
                  style={[
                    styles.impactIconCircle,
                    {
                      backgroundColor: item.bg,
                    },
                  ]}
                >
                  <Icon
                    size={rf(18)}
                    color={item.color}
                    strokeWidth={2.3}
                    fill={item.iconFill ? item.color : 'none'}
                  />
                </View>

                <View style={styles.impactTextBox}>
                  <Text
                    style={[
                      styles.impactTitle,
                      {
                        color: item.color,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.impactSubtitle}>{item.subtitle}</Text>
                </View>

                <ChevronRight size={rf(16)} color="#94A3B8" strokeWidth={2.3} />
              </TouchableOpacity>
            );
          })}
        </View>

        {}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <AlertCircle size={rf(18)} color={ORANGE} strokeWidth={2.4} />
            <Text style={styles.safetyTitle}>Rain Safety</Text>
          </View>

          <View style={styles.safetyList}>
            {SAFETY_TIPS.map((tip, idx) => (
              <View key={idx} style={styles.safetyRow}>
                <View style={styles.safetyBullet} />
                <Text style={styles.safetyText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleViewAlerts}
          style={styles.primaryButton}
        >
          <Bell size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>View Weather Alerts</Text>
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
    minHeight: 74,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  iconBtn: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
  headerSubRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSubText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: MUTED,
  },
  headerDot: {
    fontSize: rf(9),
    color: MUTED,
  },
  headerUpdated: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 90,
    backgroundColor: PAGE_BG,
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
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
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    fontSize: rf(10),
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  heroPercent: {
    marginTop: 4,
    fontSize: rf(54),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    lineHeight: rf(60),
  },
  heroChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 180,
  },
  heroChipText: {
    fontSize: rf(10.5),
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: rf(14),
  },
  heroCloudIcon: {
    marginTop: 4,
  },
  heroStatsRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
  },
  heroStatBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    gap: 6,
  },
  heroStatValue: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: rf(9),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  advisoryCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: DARK_GREEN,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advisoryHeaderLeft: {
    flex: 1,
  },
  advisoryTitle: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  advisorySubtitle: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  advisoryBotBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryList: {
    marginTop: 14,
    gap: 8,
  },
  advisoryRow: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  advisoryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  advisoryRowTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  advisoryRowSubtitle: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  advisoryBadge: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    justifyContent: 'center',
  },
  advisoryBadgeText: {
    fontSize: rf(10),
    fontWeight: '900',
  },
  advisoryButton: {
    height: 46,
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  advisoryButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  timelineCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  timelineCurveWrap: {
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 20,
  },
  timelineDataRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDataCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  timelineValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  timelineTime: {
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  insightCard: {
    width: '48.5%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 108,
  },
  insightValue: {
    marginTop: 10,
    fontSize: rf(20),
    fontWeight: '900',
  },
  insightLabel: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '600',
    color: MUTED,
  },
  impactList: {
    gap: 10,
  },
  impactCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactTextBox: {
    flex: 1,
    marginLeft: 11,
  },
  impactTitle: {
    fontSize: rf(12),
    fontWeight: '900',
  },
  impactSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },
  safetyCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEF9E7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safetyTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#92400E',
  },
  safetyList: {
    marginTop: 10,
    gap: 8,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  safetyBullet: {
    width: 6,
    height: 6,
    marginTop: 5,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  safetyText: {
    flex: 1,
    fontSize: rf(10.5),
    lineHeight: rf(15),
    fontWeight: '600',
    color: '#78350F',
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
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
