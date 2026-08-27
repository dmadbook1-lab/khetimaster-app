// LatestSchemesScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Users,
  CreditCard,
  Sprout,
  Droplet,
  Sun,
  Star,
  AlertCircle,
} from 'lucide-react-native';

import {COLORS, rf, PAGE_PADDING} from '../../components/gov/theme';
import {GOV_ROUTES} from '../../constants/govRoutes';

const CHIPS = ['All', 'Central', 'State', 'Subsidies'];

const SCHEMES = [
  {
    id: 's1',
    name: 'PM-KISAN Samman Nidhi',
    desc: 'Direct income support of\n₹6,000/year',
    icon: Users,
    iconBg: '#DCFCE7',
    iconColor: COLORS.DARK_GREEN,
    tags: [
      {label: 'Central', bg: '#DBEAFE', color: COLORS.BLUE},
      {label: 'Eligible', bg: '#DCFCE7', color: COLORS.DARK_GREEN},
    ],
  },
  {
    id: 's2',
    name: 'PM Fasal Bima Yojana',
    desc: 'Crop insurance against natural\ncalamities',
    icon: Users,
    iconBg: '#FFEDD5',
    iconColor: COLORS.ORANGE,
    tags: [
      {label: 'Insurance', bg: '#DBEAFE', color: COLORS.BLUE},
      {label: 'Recommended', bg: '#DCFCE7', color: COLORS.DARK_GREEN},
    ],
  },
  {
    id: 's3',
    name: 'Kisan Credit Card',
    desc: 'Low-interest agricultural loans at\n4%',
    icon: CreditCard,
    iconBg: '#FEF3C7',
    iconColor: COLORS.YELLOW,
    tags: [
      {label: 'Loan', bg: '#FFEDD5', color: COLORS.ORANGE},
      {label: 'Available', bg: '#DCFCE7', color: COLORS.DARK_GREEN},
    ],
  },
  {
    id: 's4',
    name: 'Soil Health Card Scheme',
    desc: 'Free soil testing &\nrecommendations',
    icon: Sprout,
    iconBg: '#DCFCE7',
    iconColor: COLORS.DARK_GREEN,
    tags: [
      {label: 'Soil', bg: '#FFEDD5', color: COLORS.ORANGE},
      {label: 'Available', bg: '#DCFCE7', color: COLORS.DARK_GREEN},
    ],
  },
  {
    id: 's5',
    name: 'PM Krishi Sinchai Yojana',
    desc: 'Irrigation subsidy & water access',
    icon: Droplet,
    iconBg: '#DBEAFE',
    iconColor: COLORS.BLUE,
    tags: [
      {label: 'Subsidy', bg: '#DBEAFE', color: COLORS.BLUE},
      {label: 'Available', bg: '#DCFCE7', color: COLORS.DARK_GREEN},
    ],
  },
  {
    id: 's6',
    name: 'Solar Pump Subsidy',
    desc: 'Solar-powered irrigation support',
    icon: Sun,
    iconBg: '#FFEDD5',
    iconColor: COLORS.ORANGE,
    tags: [
      {label: 'Energy', bg: '#FFEDD5', color: COLORS.ORANGE},
      {label: 'New', bg: '#FFE4E6', color: COLORS.RED},
    ],
  },
];

export default function LatestSchemesScreen({navigation}) {
  const [chip, setChip] = useState('All');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
          style={styles.iconBtn}>
          <ArrowLeft size={rf(18)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={styles.headerTitle}>Latest Agriculture Schemes</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <Bell size={rf(17)} color={COLORS.DARK} strokeWidth={2.4} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={rf(16)} color={COLORS.MUTED} strokeWidth={2.3} />
            <TextInput
              placeholder="Search schemes..."
              placeholderTextColor={COLORS.MUTED}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
            <SlidersHorizontal size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {CHIPS.map(c => {
            const active = chip === c;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.85}
                onPress={() => setChip(c)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero - Most Popular */}
        <View style={styles.popularHero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroPillOrange}>
              <Text style={styles.heroPillText}>MOST POPULAR</Text>
            </View>
            <View style={styles.heroPillGreen}>
              <Text style={styles.heroPillText}>ELIGIBLE</Text>
            </View>
          </View>
          <Text style={styles.popularHeroTitle}>PM-KISAN Samman Nidhi</Text>
          <Text style={styles.popularHeroDesc}>
            Direct income support of{'\n'}₹6,000/year to all eligible{'\n'}landholding farmers across{'\n'}India.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {id: 's1'})}
            style={styles.popularHeroBtn}>
            <Text style={styles.popularHeroBtnText}>View Details →</Text>
          </TouchableOpacity>

          {/* Decorative icons */}
          <View style={styles.heroDecoIcon}>
            <AlertCircle size={rf(22)} color="rgba(255,255,255,0.4)" strokeWidth={2.4} />
          </View>
          <View style={styles.heroDecoBars}>
            <View style={[styles.heroBar, {height: 30}]} />
            <View style={[styles.heroBar, {height: 42}]} />
            <View style={[styles.heroBar, {height: 20}]} />
            <View style={[styles.heroBar, {height: 36}]} />
          </View>
        </View>

        {/* All Schemes Header */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>All Schemes</Text>
          <Text style={styles.sectionCount}>{SCHEMES.length} schemes</Text>
        </View>

        {/* Scheme Cards */}
        {SCHEMES.map(s => {
          const Icon = s.icon;
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.9}
              onPress={() => navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {id: s.id})}
              style={styles.sCard}>
              <View style={[styles.sIcon, {backgroundColor: s.iconBg}]}>
                <Icon size={rf(20)} color={s.iconColor} strokeWidth={2.3} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.sName}>{s.name}</Text>
                <Text style={styles.sDesc}>{s.desc}</Text>
                <View style={styles.sTagsRow}>
                  {s.tags.map((t, i) => (
                    <View
                      key={i}
                      style={[styles.sTag, {backgroundColor: t.bg}]}>
                      <Text style={[styles.sTagText, {color: t.color}]}>
                        {t.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <ChevronRight size={rf(16)} color={COLORS.MUTED} strokeWidth={2.4} />
            </TouchableOpacity>
          );
        })}

        {/* AI Recommendation */}
        <View style={styles.aiCard}>
          <View style={styles.aiHead}>
            <View style={styles.aiIconBox}>
              <Star size={rf(17)} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />
            </View>
            <Text style={styles.aiTitle}>AI Recommendation</Text>
          </View>
          <Text style={styles.aiDesc}>
            Based on your farm profile, you are eligible for:
          </Text>
          <View style={styles.aiPillsRow}>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>PM-KISAN</Text>
            </View>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>PMFBY</Text>
            </View>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>Kisan Credit Card</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate(GOV_ROUTES.ELIGIBILITY_CHECK)}
            style={styles.aiBtn}>
            <Text style={styles.aiBtnText}>Check Eligibility</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scroll: {padding: PAGE_PADDING, paddingBottom: 30, gap: 14},

  header: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.PAGE_BG,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.ORANGE,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerTitle: {fontSize: rf(17), fontWeight: '900', color: COLORS.DARK},

  searchRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  searchBox: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {flex: 1, fontSize: rf(13), color: COLORS.DARK, padding: 0},
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipsRow: {gap: 8, paddingVertical: 2},
  chip: {
    height: 38,
    paddingHorizontal: 20,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  chipActive: {backgroundColor: COLORS.DARK_GREEN, borderColor: COLORS.DARK_GREEN},
  chipText: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK},
  chipTextActive: {color: '#FFFFFF'},

  // Popular Hero - increased min height so bars/icons don't overlap
  popularHero: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.DARK_GREEN,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 260,
  },
  heroTopRow: {flexDirection: 'row', gap: 6},
  heroPillOrange: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 4,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
  },
  heroPillGreen: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#0B7A2E',
    justifyContent: 'center',
  },
  heroPillText: {fontSize: rf(10), fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5},
  popularHeroTitle: {
    marginTop: 14,
    fontSize: rf(19),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  popularHeroDesc: {
    marginTop: 10,
    fontSize: rf(13),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    lineHeight: rf(18),
  },
  popularHeroBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  popularHeroBtnText: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  heroDecoIcon: {
    position: 'absolute',
    top: 44,
    right: 30,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDecoBars: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  heroBar: {
    width: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {fontSize: rf(17), fontWeight: '900', color: COLORS.DARK},
  sectionCount: {fontSize: rf(12), fontWeight: '600', color: COLORS.MUTED},

  sCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 100,
  },
  sIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sName: {fontSize: rf(14.5), fontWeight: '900', color: COLORS.DARK},
  sDesc: {marginTop: 5, fontSize: rf(12), fontWeight: '500', color: COLORS.MUTED, lineHeight: rf(16)},
  sTagsRow: {marginTop: 10, flexDirection: 'row', gap: 6},
  sTag: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sTagText: {fontSize: rf(10.5), fontWeight: '900'},

  // AI Recommendation
  aiCard: {
    marginTop: 6,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  aiHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  aiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {fontSize: rf(15.5), fontWeight: '900', color: COLORS.DARK},
  aiDesc: {marginTop: 12, fontSize: rf(13), fontWeight: '500', color: COLORS.DARK, lineHeight: rf(18)},
  aiPillsRow: {marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  aiPill: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.DARK_GREEN,
    justifyContent: 'center',
  },
  aiPillText: {fontSize: rf(12), fontWeight: '900', color: '#FFFFFF'},
  aiBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtnText: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
});