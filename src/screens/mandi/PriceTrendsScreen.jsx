import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Share2,
  ChevronDown,
  Leaf,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Lightbulb,
  ArrowRight,
  Bell,
  Share,
  Download,
} from 'lucide-react-native';

import ScreenHeader from '../../components/mandi/ScreenHeader';
import SparkLine from '../../components/mandi/SparkLine';
import {COLORS, rf, PAGE_PADDING, width} from '../../components/mandi/theme';

const RANGES = ['7 Days', '15 Days', '30 Days', '3 Months', '6 Months', '1 Year'];

const CHART_DATA = [6780, 6900, 7050, 7280, 7400, 7100, 6900, 7050, 7180, 7240];
const MONTHS = [
  {name: 'Aug', v: '6.6k', h: 0.65},
  {name: 'Sep', v: '6.8k', h: 0.72},
  {name: 'Oct', v: '7.1k', h: 0.85},
  {name: 'Nov', v: '7.3k', h: 0.95},
  {name: 'Dec', v: '7.0k', h: 0.80},
  {name: 'Jan', v: '7.2k', h: 0.90, active: true},
];

const NEARBY = [
  {name: 'Wardha APMC', price: '7,180', delta: '-60', up: false, dist: '32 km'},
  {name: 'Amravati APMC', price: '7,300', delta: '+60', up: true, dist: '58 km'},
  {name: 'Nagpur APMC', price: '7,150', delta: '-90', up: false, dist: '95 km'},
];

export default function PriceTrendsScreen({navigation}) {
  const [range, setRange] = useState('30 Days');
  const chartWidth = width - PAGE_PADDING * 4;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title="Price Trends"
        subtitle="Analyze crop price movement over time."
        onBack={() => navigation?.goBack()}
        rightIcon={Share2}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Selectors */}
        <View style={styles.dropRow}>
          <View style={styles.dropdown}>
            <Leaf size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            <Text style={styles.dropText}>Cotton</Text>
            <ChevronDown size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
          </View>
          <View style={styles.dropdown}>
            <MapPin size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            <Text style={styles.dropText}>Yavatmal</Text>
            <ChevronDown size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
          </View>
        </View>

        {/* Range Chips */}
        <View style={styles.rangeGrid}>
          {RANGES.map(r => {
            const active = r === range;
            return (
              <TouchableOpacity
                key={r}
                activeOpacity={0.85}
                onPress={() => setRange(r)}
                style={[styles.rangeChip, active && styles.rangeChipActive]}>
                <Text style={[styles.rangeText, active && {color: '#FFFFFF'}]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Hero */}
        <LinearGradient
          colors={['#158B3D', '#0F6D2E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Leaf size={rf(18)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.heroName}>Cotton</Text>
              <Text style={styles.heroLoc}>Yavatmal APMC</Text>
            </View>
            <View style={styles.bullishPill}>
              <TrendingUp size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.bullishText}>Bullish</Text>
            </View>
          </View>

          <Text style={styles.heroPrice}>7,240</Text>
          <Text style={styles.heroUnit}>per quintal (100 kg)</Text>

          <View style={styles.heroDelta}>
            <TrendingUp size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.heroDeltaText}>+ 140 (+1.97%)</Text>
            <Text style={styles.heroDeltaSub}>vs yesterday</Text>
          </View>
        </LinearGradient>

        {/* Price Chart */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Price Chart</Text>
            <View style={styles.chartLegend}>
              <View style={styles.chartPricePill}>
                <Text style={styles.chartPriceText}>₹7,400</Text>
              </View>
              <View style={styles.chartCropRow}>
                <View style={styles.chartDot} />
                <Text style={styles.chartCropText}>Cotton</Text>
              </View>
            </View>
          </View>

          <View style={{marginTop: 10, alignItems: 'center'}}>
            <SparkLine
              data={CHART_DATA}
              width={chartWidth}
              height={140}
              color={COLORS.DARK_GREEN}
              showFill
              markers={[
                {idx: 0, color: COLORS.RED},
                {idx: 4, color: COLORS.ORANGE},
                {idx: 9, color: COLORS.DARK_GREEN},
              ]}
            />
          </View>

          <View style={styles.chartBottomRow}>
            <View style={styles.chartBottomItem}>
              <View style={[styles.chartMarkDot, {backgroundColor: COLORS.ORANGE}]} />
              <Text style={styles.chartBottomText}>Highest: <Text style={{fontWeight: '900'}}>₹7,400</Text></Text>
            </View>
            <View style={styles.chartBottomItem}>
              <View style={[styles.chartMarkDot, {backgroundColor: COLORS.RED}]} />
              <Text style={styles.chartBottomText}>Lowest: <Text style={{fontWeight: '900'}}>₹6,780</Text></Text>
            </View>
            <View style={styles.chartBottomItem}>
              <View style={[styles.chartMarkDot, {backgroundColor: COLORS.DARK_GREEN}]} />
              <Text style={styles.chartBottomText}>Now: <Text style={{fontWeight: '900'}}>₹7,240</Text></Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            {label: 'Highest', value: '₹7,400', icon: ArrowUpRight, color: COLORS.DARK_GREEN, bg: '#EAFBF0'},
            {label: 'Average', value: '₹7,105', icon: BarChart2, color: COLORS.BLUE, bg: COLORS.BLUE_SOFT},
            {label: 'Lowest', value: '₹6,780', icon: ArrowDownRight, color: COLORS.RED, bg: COLORS.RED_SOFT},
            {label: 'Volatility', value: '4.2%', icon: TrendingUp, color: COLORS.PURPLE, bg: COLORS.PURPLE_SOFT},
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <View key={i} style={styles.statTile}>
                <View style={[styles.statIcon, {backgroundColor: s.bg}]}>
                  <Icon size={rf(13)} color={s.color} strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* AI Trend Analysis */}
        <LinearGradient
          colors={['#158B3D', '#0F6D2E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aiTrend}>
          <View style={styles.aiTrendHead}>
            <Lightbulb size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.aiTrendTitle}>AI Trend Analysis</Text>
          </View>
          <Text style={styles.aiTrendPowered}>Powered by KhetiMaster AI</Text>

          <View style={styles.aiTrendRow}>
            {[
              {label: 'MARKET\nTREND', value: 'Bullish', sub: '↑ Rising'},
              {label: 'EXPECTED\nMOVE', value: '+3–5%', sub: 'Next 7 days'},
              {label: 'BEST SELL', value: 'Thu–Fri', sub: '10–12 AM'},
            ].map((t, i) => (
              <View key={i} style={styles.aiTrendCard}>
                <Text style={styles.aiTrendLabel}>{t.label}</Text>
                <Text style={styles.aiTrendValue}>{t.value}</Text>
                <Text style={styles.aiTrendSub}>{t.sub}</Text>
              </View>
            ))}
          </View>

          <View style={styles.aiTrendNote}>
            <Text style={{fontSize: rf(13)}}>💡</Text>
            <Text style={styles.aiTrendNoteText}>
              Cotton prices are on an upward trend. Holding stock till Thursday may yield ₹200–350 more per quintal.
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.aiTrendBtn}>
            <Text style={styles.aiTrendBtnText}>View Detailed Analysis</Text>
            <ArrowRight size={rf(13)} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Monthly Comparison */}
        <View style={styles.card}>
          <View style={styles.monthHead}>
            <Text style={styles.chartTitle}>Monthly Comparison</Text>
            <Text style={styles.monthSub}>AVG PRICE / QUINTAL</Text>
          </View>
          <View style={styles.barsRow}>
            {MONTHS.map(m => (
              <View key={m.name} style={styles.barCol}>
                <Text style={styles.barValue}>₹{m.v}</Text>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={m.active ? ['#22A957', '#158B3D'] : ['#E5E7EB', '#E5E7EB']}
                    style={[styles.barFill, {height: `${m.h * 100}%`}]}
                  />
                </View>
                <Text style={[styles.barLabel, m.active && {color: COLORS.DARK_GREEN, fontWeight: '900'}]}>
                  {m.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nearby Market Comparison */}
        <Text style={styles.sectionTitle}>Nearby Market Comparison</Text>
        <View style={styles.nearbyHead}>
          <Text style={styles.nearbyLabel}>Nearby Markets</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.compareAll}>Compare All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: 10, paddingRight: 10}}>
          {NEARBY.map(n => (
            <View key={n.name} style={styles.nearbyCard}>
              <View style={styles.nearbyTop}>
                <MapPin size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
                <View style={[styles.deltaBox, {backgroundColor: n.up ? '#EAFBF0' : '#FEF2F2'}]}>
                  <Text style={{fontSize: rf(10), fontWeight: '900', color: n.up ? COLORS.DARK_GREEN : COLORS.RED}}>
                    {n.delta}
                  </Text>
                </View>
              </View>
              <Text style={styles.nearbyPrice}>₹{n.price}</Text>
              <Text style={styles.nearbyName}>{n.name}</Text>
              <View style={styles.nearbyDistRow}>
                <Text style={styles.nearbyDistIcon}>📍</Text>
                <Text style={styles.nearbyDist}>{n.dist}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaRow}>
          {[
            {label: 'Set Price Alert', icon: Bell, color: COLORS.DARK_GREEN, bg: '#EAFBF0'},
            {label: 'Share Trend', icon: Share, color: COLORS.ORANGE, bg: '#FFF7ED'},
            {label: 'Download Report', icon: Download, color: COLORS.PURPLE, bg: COLORS.PURPLE_SOFT},
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <TouchableOpacity key={i} activeOpacity={0.85} style={styles.qaCard}>
                <View style={[styles.qaIcon, {backgroundColor: a.bg}]}>
                  <Icon size={rf(15)} color={a.color} strokeWidth={2.4} />
                </View>
                <Text style={styles.qaLabel}>{a.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} style={styles.setAlertBtn}>
          <Bell size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.setAlertText}>Set Price Alert</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scroll: {padding: PAGE_PADDING, paddingBottom: 110, gap: 14},

  dropRow: {flexDirection: 'row', gap: 10},
  dropdown: {flex: 1, height: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', gap: 8},
  dropText: {flex: 1, fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},

  rangeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  rangeChip: {height: 32, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center'},
  rangeChipActive: {backgroundColor: COLORS.DARK},
  rangeText: {fontSize: rf(10.5), fontWeight: '900', color: COLORS.DARK},

  heroCard: {padding: 18, borderRadius: 16},
  heroTopRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  heroIcon: {width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center'},
  heroName: {fontSize: rf(15), fontWeight: '900', color: '#FFFFFF'},
  heroLoc: {marginTop: 2, fontSize: rf(11), fontWeight: '600', color: 'rgba(255,255,255,0.85)'},
  bullishPill: {height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', alignItems: 'center', gap: 4},
  bullishText: {fontSize: rf(10), fontWeight: '900', color: '#FFFFFF'},

  heroPrice: {marginTop: 16, fontSize: rf(38), fontWeight: '900', color: '#FFFFFF'},
  heroUnit: {marginTop: -2, fontSize: rf(11), fontWeight: '500', color: 'rgba(255,255,255,0.85)'},
  heroDelta: {marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', alignItems: 'center', gap: 6},
  heroDeltaText: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},
  heroDeltaSub: {fontSize: rf(10), fontWeight: '600', color: 'rgba(255,255,255,0.8)'},

  card: {padding: 14, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER},
  chartHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  chartTitle: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK},
  chartLegend: {flexDirection: 'row', alignItems: 'center', gap: 8},
  chartPricePill: {height: 22, paddingHorizontal: 8, borderRadius: 4, backgroundColor: '#FFF7ED', justifyContent: 'center'},
  chartPriceText: {fontSize: rf(10), fontWeight: '900', color: COLORS.ORANGE},
  chartCropRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  chartDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.DARK_GREEN},
  chartCropText: {fontSize: rf(10.5), fontWeight: '900', color: COLORS.DARK},

  chartBottomRow: {marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6},
  chartBottomItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  chartMarkDot: {width: 8, height: 8, borderRadius: 4},
  chartBottomText: {fontSize: rf(10), color: COLORS.MUTED, fontWeight: '600'},

  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statTile: {width: '48%', padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER, flexDirection: 'row', alignItems: 'center', gap: 10},
  statIcon: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  statLabel: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  statValue: {marginTop: 2, fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},

  aiTrend: {padding: 16, borderRadius: 16},
  aiTrendHead: {flexDirection: 'row', alignItems: 'center', gap: 6},
  aiTrendTitle: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  aiTrendPowered: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: 'rgba(255,255,255,0.8)'},
  aiTrendRow: {marginTop: 12, flexDirection: 'row', gap: 8},
  aiTrendCard: {flex: 1, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)'},
  aiTrendLabel: {fontSize: rf(9), fontWeight: '900', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3, lineHeight: rf(11)},
  aiTrendValue: {marginTop: 6, fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},
  aiTrendSub: {marginTop: 2, fontSize: rf(9), fontWeight: '500', color: 'rgba(255,255,255,0.75)'},

  aiTrendNote: {marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.15)', flexDirection: 'row', gap: 6},
  aiTrendNoteText: {flex: 1, fontSize: rf(11), lineHeight: rf(16), fontWeight: '500', color: '#FFFFFF'},

  aiTrendBtn: {marginTop: 12, height: 42, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6},
  aiTrendBtnText: {fontSize: rf(12), fontWeight: '900', color: '#FFFFFF'},

  monthHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  monthSub: {fontSize: rf(9), fontWeight: '900', color: COLORS.MUTED, letterSpacing: 0.5},
  barsRow: {marginTop: 14, flexDirection: 'row', gap: 8, height: 140, alignItems: 'flex-end'},
  barCol: {flex: 1, alignItems: 'center', gap: 4},
  barValue: {fontSize: rf(9), fontWeight: '700', color: COLORS.MUTED},
  barTrack: {width: '100%', height: 90, justifyContent: 'flex-end'},
  barFill: {width: '100%', borderRadius: 6},
  barLabel: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},

  sectionTitle: {marginTop: 8, fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  nearbyHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  nearbyLabel: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  compareAll: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
  nearbyCard: {width: 130, padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER},
  nearbyTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  deltaBox: {height: 20, paddingHorizontal: 6, borderRadius: 4, justifyContent: 'center'},
  nearbyPrice: {marginTop: 10, fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  nearbyName: {marginTop: 3, fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  nearbyDistRow: {marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 3},
  nearbyDistIcon: {fontSize: rf(9)},
  nearbyDist: {fontSize: rf(9.5), fontWeight: '600', color: COLORS.MUTED},

  qaRow: {flexDirection: 'row', gap: 10},
  qaCard: {flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER, alignItems: 'center', gap: 6},
  qaIcon: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  qaLabel: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK, textAlign: 'center'},

  footer: {position: 'absolute', left: 0, right: 0, bottom: 0, padding: PAGE_PADDING, paddingBottom: 18, backgroundColor: COLORS.PAGE_BG, borderTopWidth: 1, borderTopColor: '#F1F5F9'},
  setAlertBtn: {height: 54, borderRadius: 12, backgroundColor: COLORS.DARK_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: COLORS.DARK_GREEN, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 5}, elevation: 5},
  setAlertText: {fontSize: rf(13.5), fontWeight: '900', color: '#FFFFFF'},
});