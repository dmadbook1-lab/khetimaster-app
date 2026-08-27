import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bell,
  Search,
  ArrowUpFromLine,
  TrendingUp,
  TrendingDown,
  Wheat,
  MapPin,
  LineChart,
  BellRing,
  Newspaper,
  Sprout,
  Bean,
  CircleDot,
} from 'lucide-react-native';

import ScreenHeader from '../../components/mandi/ScreenHeader';
import SectionTitle from '../../components/mandi/SectionTitle';
import AIInsightBanner from '../../components/mandi/AIInsightBanner';
import {COLORS, rf, PAGE_PADDING} from '../../components/mandi/theme';
import {MANDI_ROUTES} from '../../constants/mandiRoutes';

const QUICK_ACTIONS = [
  {
    id: 'today',
    label: "Today's\nPrices",
    icon: Wheat,
    bg: '#EAFBF0',
    iconColor: COLORS.DARK_GREEN,
    route: MANDI_ROUTES.TODAYS_PRICES,
  },
  {
    id: 'nearby',
    label: 'Nearby\nMarkets',
    icon: MapPin,
    bg: '#FEF9C3',
    iconColor: '#CA8A04',
    route: MANDI_ROUTES.NEARBY_MARKETS,
  },
  {
    id: 'trends',
    label: 'Price\nTrends',
    icon: LineChart,
    bg: '#DBEAFE',
    iconColor: '#2563EB',
    route: MANDI_ROUTES.PRICE_TRENDS,
  },
  {
    id: 'alerts',
    label: 'Price Alerts',
    icon: BellRing,
    bg: '#FCE7F3',
    iconColor: '#DB2777',
    route: MANDI_ROUTES.PRICE_ALERTS,
  },
  {
    id: 'updates',
    label: 'Market\nUpdates',
    icon: Newspaper,
    bg: '#FED7AA',
    iconColor: '#EA580C',
    route: MANDI_ROUTES.MARKET_UPDATES,
  },
];

const TOP_COMMODITIES = [
  {
    id: 'c1',
    name: 'Cotton',
    market: 'Ahmedabad Mandi',
    price: '6,800',
    change: '+120',
    up: true,
    icon: Sprout,
    iconBg: '#EAFBF0',
    iconColor: COLORS.DARK_GREEN,
  },
  {
    id: 'c2',
    name: 'Soybean',
    market: 'Indore Mandi',
    price: '4,350',
    change: '-80',
    up: false,
    icon: Bean,
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
  },
  {
    id: 'c3',
    name: 'Onion',
    market: 'Nashik Mandi',
    price: '1,920',
    change: '+210',
    up: true,
    icon: CircleDot,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    id: 'c4',
    name: 'Wheat',
    market: 'Delhi Mandi',
    price: '2,150',
    change: '+45',
    up: true,
    icon: Wheat,
    iconBg: '#FEF9C3',
    iconColor: '#CA8A04',
  },
];

const ACTIVE_ALERTS = [
  {
    id: 'a1',
    name: 'Cotton',
    target: '7,000',
    status: 'Active',
    statusBg: '#EAFBF0',
    statusColor: COLORS.DARK_GREEN,
    icon: Sprout,
    iconBg: '#EAFBF0',
    iconColor: COLORS.DARK_GREEN,
  },
  {
    id: 'a2',
    name: 'Onion',
    target: '2,200',
    status: 'Watching',
    statusBg: '#FEF3C7',
    statusColor: '#B45309',
    icon: CircleDot,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
];

export default function MandiRatesScreen({navigation}) {
  const goTo = route => navigation?.navigate(route);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title="Mandi Rates"
        subtitle="Know today's market prices and sell at the right time."
        onBack={() => navigation?.goBack()}
        rightIcon={Bell}
        rightBadge
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero Banner - full bleed image with green overlay */}
        <ImageBackground
          source={require('../../assets/gov/mandi-hero.png')}
          style={styles.heroWrap}
          imageStyle={styles.heroImgBg}
          resizeMode="cover">
          {/* Green gradient overlay - stronger on left, fades toward right */}
          <LinearGradient
            colors={[
              'rgba(15, 109, 46, 0.95)',
              'rgba(21, 139, 61, 0.82)',
              'rgba(21, 139, 61, 0.35)',
              'rgba(21, 139, 61, 0.15)',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.heroOverlay}>
            <Text style={styles.heroLabel}>MANDI BHAV</Text>
            <Text style={styles.heroTitle}>Market Prices</Text>

            <View style={{marginTop: 10, gap: 6}}>
              {["Today's Prices", 'Nearby Markets', 'Price Trends'].map(t => (
                <View key={t} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{t}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.checkBtn}>
              <Text style={styles.checkBtnText}>Check Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ImageBackground>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
            <TextInput
              placeholder="Search crop (Cotton, Soybean, Onion...)"
              placeholderTextColor={COLORS.MUTED}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
            <ArrowUpFromLine size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.qaTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.qaRow}>
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => goTo(a.route)}
                style={[styles.qaCard, {backgroundColor: a.bg}]}>
                <View style={styles.qaIconWrap}>
                  <Icon size={rf(22)} color={a.iconColor} strokeWidth={2.3} />
                </View>
                <Text style={styles.qaLabel}>{a.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Top Commodity Prices */}
        <View style={{marginTop: 8}}>
          <SectionTitle
            title="Top Commodity Prices"
            right="View All"
            onRightPress={() => goTo(MANDI_ROUTES.TODAYS_PRICES)}
          />
          {TOP_COMMODITIES.map(c => {
            const Icon = c.icon;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                onPress={() => goTo(MANDI_ROUTES.COMMODITY_DETAIL)}
                style={styles.commRow}>
                <View style={[styles.commIconCircle, {backgroundColor: c.iconBg}]}>
                  <Icon size={rf(18)} color={c.iconColor} strokeWidth={2.3} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.commName}>{c.name}</Text>
                  <Text style={styles.commMarket}>{c.market}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.commPrice}>₹{c.price}</Text>
                  <View style={styles.commChangeRow}>
                    {c.up ? (
                      <TrendingUp size={rf(10)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
                    ) : (
                      <TrendingDown size={rf(10)} color={COLORS.RED} strokeWidth={2.4} />
                    )}
                    <Text style={[styles.commChange, {color: c.up ? COLORS.DARK_GREEN : COLORS.RED}]}>
                      {c.change}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Alerts */}
        <View style={{marginTop: 12}}>
          <SectionTitle
            title="Price Alerts"
            right="+ Add Alert"
            onRightPress={() => goTo(MANDI_ROUTES.PRICE_ALERTS)}
          />
          {ACTIVE_ALERTS.map(a => {
            const Icon = a.icon;
            return (
              <View key={a.id} style={styles.alertRow}>
                <View style={[styles.alertIconCircle, {backgroundColor: a.iconBg}]}>
                  <Icon size={rf(18)} color={a.iconColor} strokeWidth={2.3} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.alertName}>{a.name}</Text>
                  <Text style={styles.alertTarget}>Target: ₹{a.target}</Text>
                </View>
                <View style={[styles.statusPill, {backgroundColor: a.statusBg}]}>
                  <Text style={[styles.statusText, {color: a.statusColor}]}>{a.status}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* AI Insight */}
        <View style={{marginTop: 20}}>
          <AIInsightBanner
            label="AI MARKET INSIGHT"
            title="Cotton prices likely to rise 8–12% this week"
            desc="Based on procurement trends & weather forecasts in Gujarat & Maharashtra."
            ctaLabel="View Full Analysis"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scroll: {padding: PAGE_PADDING, paddingBottom: 40, gap: 4},

  // HERO - full bleed background image
  heroWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 210,
    backgroundColor: '#0F6D2E',
  },
  heroImgBg: {
    borderRadius: 16,
  },
  heroOverlay: {
    flex: 1,
    padding: 20,
    minHeight: 210,
    justifyContent: 'flex-start',
  },
  heroLabel: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: rf(24),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bulletRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  bullet: {width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.ORANGE},
  bulletText: {fontSize: rf(12), fontWeight: '600', color: '#FFFFFF'},
  checkBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  checkBtnText: {fontSize: rf(12.5), fontWeight: '900', color: '#FFFFFF'},

  searchRow: {marginTop: 16, flexDirection: 'row', gap: 8, alignItems: 'center'},
  searchBox: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {flex: 1, fontSize: rf(11.5), color: COLORS.DARK, padding: 0},
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qaTitle: {marginTop: 20, marginBottom: 12, fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  qaRow: {gap: 10, paddingRight: 10},
  qaCard: {
    width: 96,
    height: 100,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
  },
  qaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK, textAlign: 'center', lineHeight: rf(13)},

  commRow: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commName: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  commMarket: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},
  commPrice: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  commChangeRow: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2},
  commChange: {fontSize: rf(10), fontWeight: '900'},

  alertRow: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertName: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK},
  alertTarget: {marginTop: 2, fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  statusPill: {height: 24, paddingHorizontal: 10, borderRadius: 12, justifyContent: 'center'},
  statusText: {fontSize: rf(10), fontWeight: '900'},
});