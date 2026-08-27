import React from 'react';
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
  Share2,
  Check,
  X,
  AlertTriangle,
  Bot,
  ArrowRight,
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

const RECOMMENDATIONS = [
  {
    id: 'spray',
    emoji: '🌿',
    title: 'Spraying',
    description: 'Complete spraying before 3 PM for best results.',
    badge: 'Recommended',
    badgeIcon: '✅',
    badgeColor: DARK_GREEN,
    badgeBg: '#EAFBF0',
    pill: 'Best Time: 8:00 AM – 3:00 PM',
    pillColor: DARK_GREEN,
    pillBg: '#EAFBF0',
  },
  {
    id: 'irrigation',
    emoji: '💧',
    title: 'Irrigation',
    description: 'Expected rainfall is sufficient. No irrigation needed.',
    badge: 'Skip Today',
    badgeIcon: '❌',
    badgeColor: BLUE,
    badgeBg: '#EFF6FF',
    pill: 'Natural Rain Sufficient',
    pillColor: BLUE,
    pillBg: '#EFF6FF',
  },
  {
    id: 'harvest',
    emoji: '🌾',
    title: 'Harvest',
    description: 'Rain is expected after sunset. Complete harvest early.',
    badge: 'Finish Before Evening',
    badgeIcon: '⚠️',
    badgeColor: ORANGE,
    badgeBg: '#FFF7ED',
    pill: 'Deadline: Before 6 PM',
    pillColor: ORANGE,
    pillBg: '#FFEDD5',
  },
  {
    id: 'field',
    emoji: '🚜',
    title: 'Field Work',
    description: 'Low wind and comfortable temperature through afternoon.',
    badge: 'Good Conditions',
    badgeIcon: '✅',
    badgeColor: DARK_GREEN,
    badgeBg: '#EAFBF0',
    pill: 'Ideal Until 5 PM',
    pillColor: DARK_GREEN,
    pillBg: '#EAFBF0',
  },
];

const REASONS = [
  'Rain expected tonight after 6:30 PM',
  'Moderate wind speed — safe for spraying till noon',
  'Soil moisture is already sufficient from yesterday',
];

export default function AIWeatherInsightsScreen({navigation}) {
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing AI insights...');
  };

  const handleAskAI = () => {
    navigation.navigate('AIGuru');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.iconBtn}>
          <ChevronLeft size={rf(22)} color={DARK} strokeWidth={2.6} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>AI Weather Insights</Text>
          <Text style={styles.headerSubtitle}>
            SMART FARMING RECOMMENDATIONS BY KHETIMASTER AI
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.iconBtn}>
          <Share2 size={rf(18)} color={DARK} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* HERO - Farming Score */}
        <LinearGradient
          colors={['#22A957', '#158B3D', '#0F6E30']}
          locations={[0, 0.55, 1]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.glowTopRight} />
          <View style={styles.glowBottomLeft} />

          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Today's Farming Score</Text>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>92</Text>
                <Text style={styles.scoreOutOf}>/100</Text>
              </View>

              <View style={styles.excellentPill}>
                <View style={styles.excellentDot} />
                <Text style={styles.excellentText}>
                  Excellent Farming Conditions
                </Text>
              </View>

              <Text style={styles.heroDescription}>
                Great weather for most{'\n'}farming activities today.
              </Text>
            </View>

            <Image
              source={require('../../assets/weather/ai.png')}
              style={styles.aiImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Today's Recommendations</Text>

        <View style={styles.recommendationsList}>
          {RECOMMENDATIONS.map(item => (
            <View key={item.id} style={styles.recCard}>
              <View style={styles.recTopRow}>
                <View style={styles.recTitleRow}>
                  <Text style={styles.recEmoji}>{item.emoji}</Text>
                  <Text style={styles.recTitle}>{item.title}</Text>
                </View>

                <View
                  style={[
                    styles.recBadge,
                    {backgroundColor: item.badgeBg},
                  ]}>
                  <Text style={styles.recBadgeIcon}>{item.badgeIcon}</Text>
                  <Text
                    style={[
                      styles.recBadgeText,
                      {color: item.badgeColor},
                    ]}>
                    {item.badge}
                  </Text>
                </View>
              </View>

              <Text style={styles.recDescription}>{item.description}</Text>

              <View
                style={[styles.recPill, {backgroundColor: item.pillBg}]}>
                <Text
                  style={[styles.recPillText, {color: item.pillColor}]}>
                  {item.pill}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weather Warning */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <AlertTriangle
              size={rf(18)}
              color={ORANGE}
              strokeWidth={2.4}
            />
            <Text style={styles.warningTitle}>Weather Warning</Text>
          </View>

          <Text style={styles.warningMain}>
            Heavy rainfall expected after 6:30 PM.
          </Text>
          <Text style={styles.warningSub}>
            Avoid pesticide spraying after evening.
          </Text>
        </View>

        {/* Why this recommendation */}
        <View style={styles.whyCard}>
          <View style={styles.whyHeader}>
            <View style={styles.whyIconCircle}>
              <Bot size={rf(16)} color={DARK_GREEN} strokeWidth={2.4} />
            </View>
            <Text style={styles.whyTitle}>Why this recommendation?</Text>
          </View>

          <View style={styles.whyList}>
            {REASONS.map((reason, idx) => (
              <View key={idx} style={styles.whyRow}>
                <View style={styles.whyBullet} />
                <Text style={styles.whyText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleAskAI}
          style={styles.primaryButton}>
          <View style={styles.primaryButtonIconBox}>
            <Bot size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.primaryButtonText}>Ask AI About My Farm</Text>
          <ArrowRight
            size={rf(16)}
            color="#FFFFFF"
            strokeWidth={2.6}
            style={styles.primaryButtonArrow}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},

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

  headerTextBox: {flex: 1, marginHorizontal: 12, alignItems: 'center'},

  headerTitle: {fontSize: rf(18), fontWeight: '900', color: DARK},

  headerSubtitle: {
    marginTop: 3,
    fontSize: rf(8.5),
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 90,
    backgroundColor: PAGE_BG,
  },

  // Hero
  heroCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: DARK_GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },

  glowTopRight: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  glowBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -70,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroLeft: {flex: 1},

  heroLabel: {
    fontSize: rf(11),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  scoreRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },

  scoreValue: {
    fontSize: rf(54),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    lineHeight: rf(58),
  },

  scoreOutOf: {
    marginBottom: 10,
    fontSize: rf(14),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },

  excellentPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 210,
  },

  excellentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRIGHT_GREEN,
  },

  excellentText: {
    flex: 1,
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroDescription: {
    marginTop: 12,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },

  aiImage: {
    width: 120,
    height: 140,
    marginLeft: 4,
  },

  // Sections
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  // Recommendations
  recommendationsList: {gap: 12},

  recCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  recTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  recEmoji: {fontSize: rf(18)},

  recTitle: {fontSize: rf(14), fontWeight: '900', color: DARK},

  recBadge: {
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  recBadgeIcon: {fontSize: rf(9)},

  recBadgeText: {fontSize: rf(10), fontWeight: '900'},

  recDescription: {
    marginTop: 10,
    fontSize: rf(10.5),
    lineHeight: rf(15),
    fontWeight: '500',
    color: MUTED,
  },

  recPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 11,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },

  recPillText: {fontSize: rf(10), fontWeight: '900'},

  // Warning
  warningCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  warningTitle: {fontSize: rf(13), fontWeight: '900', color: '#9A3412'},

  warningMain: {
    marginTop: 8,
    fontSize: rf(12),
    fontWeight: '900',
    color: '#9A3412',
  },

  warningSub: {
    marginTop: 3,
    fontSize: rf(10.5),
    fontWeight: '500',
    color: '#B45309',
  },

  // Why card
  whyCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F0FBF3',
    borderWidth: 1,
    borderColor: '#C9EED6',
  },

  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  whyIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9EED6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  whyTitle: {fontSize: rf(13), fontWeight: '900', color: DARK},

  whyList: {marginTop: 12, gap: 10},

  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  whyBullet: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK_GREEN,
  },

  whyText: {
    flex: 1,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '600',
    color: DARK,
  },

  // Bottom Bar
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
    height: 54,
    borderRadius: 14,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
    shadowColor: DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 5,
  },

  primaryButtonIconBox: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  primaryButtonArrow: {
    position: 'absolute',
    right: 18,
  },
});