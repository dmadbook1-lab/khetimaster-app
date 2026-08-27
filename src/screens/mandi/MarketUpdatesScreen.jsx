import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Search,
  Zap,
  Store,
  Landmark,
  Cloud,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Bell,
} from 'lucide-react-native';
import ScreenHeader from '../../components/mandi/ScreenHeader';
import FilterChips from '../../components/mandi/FilterChips';
import { COLORS, rf, PAGE_PADDING } from '../../components/mandi/theme';
const CHIPS = ['All', 'Market', 'Government', 'Weather'];
const UPDATES = [
  {
    id: 'u1',
    category: 'Government',
    icon: Landmark,
    color: COLORS.BLUE,
    bg: COLORS.BLUE_SOFT,
    time: '3 hrs ago',
    title:
      'MSP for Kharif 2025 announced — paddy at ₹2,300/qtl, up 5.4% from last year',
    desc: 'Cabinet approves higher minimum support prices for 14 Kharif crops ahead of sowing season.',
  },
  {
    id: 'u2',
    category: 'Weather',
    icon: Cloud,
    color: COLORS.BLUE,
    bg: COLORS.BLUE_SOFT,
    time: '5 hrs ago',
    title:
      'Southwest monsoon to arrive early in Maharashtra — onion farmers on alert',
    desc: 'IMD forecasts above-normal rainfall in key onion-producing belts, growers advised to harvest early.',
  },
  {
    id: 'u3',
    category: 'Export',
    icon: Store,
    color: COLORS.ORANGE,
    bg: COLORS.ORANGE_SOFT,
    time: '7 hrs ago',
    title:
      'India rice export ban partially lifted — basmati shipments resume to Gulf markets',
    desc: 'Government eases restrictions on premium basmati varieties; traders expect 12% price recovery.',
  },
  {
    id: 'u4',
    category: 'Market',
    icon: TrendingUp,
    color: COLORS.DARK_GREEN,
    bg: COLORS.GREEN_SOFT,
    time: '9 hrs ago',
    title:
      'Cotton arrivals at Rajkot Mandi hit 3-month high, prices under pressure',
    desc: 'Over 40,000 bales arrived in last 48 hours; buyers cautious amid weaker export demand from China.',
  },
];
const GAINERS = [
  {
    name: 'Wheat',
    pct: '+3.2%',
  },
  {
    name: 'Rice',
    pct: '+1.8%',
  },
  {
    name: 'Maize',
    pct: '+2.1%',
  },
];
const LOSERS = [
  {
    name: 'Onion',
    pct: '-3.1%',
  },
  {
    name: 'Tomato',
    pct: '-5.4%',
  },
  {
    name: 'Cotton',
    pct: '-0.9%',
  },
];
const GOV_UPDATES = [
  {
    id: 'g1',
    title: 'PM-KISAN',
    badge: 'NEW',
    badgeColor: COLORS.DARK_GREEN,
    desc: '17th installment of ₹2,000 released to 9.6 crore farmers.',
  },
  {
    id: 'g2',
    title: 'MSP Kharif 2025',
    badge: 'UPDATE',
    badgeColor: COLORS.ORANGE,
    desc: 'Paddy MSP raised to ₹2,300/qtl — highest ever increase of 5.4%.',
  },
  {
    id: 'g3',
    title: 'PM-KUSUM Subsidy',
    desc: 'Solar pump subsidy applications open till 30 June 2025.',
  },
  {
    id: 'g4',
    title: 'APMC Notices',
    badge: 'ALERT',
    badgeColor: COLORS.RED,
    desc: 'Azadpur & Indore mandi holiday on 20 Jun. Plan arrivals accordingly.',
  },
];
const TRENDING = [
  {
    name: 'Wheat',
    price: '2,380',
    change: '+3.2%',
    up: true,
  },
  {
    name: 'Rice',
    price: '3,720',
    change: '+1.8%',
    up: true,
  },
  {
    name: 'Soybean',
    price: '5,100',
    change: '-2.0%',
    up: false,
  },
];
export default function MarketUpdatesScreen({ navigation }) {
  const [chip, setChip] = useState('All');
  const [dailyOn, setDailyOn] = useState(true);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title="Market Updates"
        subtitle="Latest agricultural market news and price updates."
        onBack={() => navigation?.goBack()}
        rightIcon={Search}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <LinearGradient
          colors={['#158B3D', '#0F6D2E']}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={styles.diCard}
        >
          <View style={styles.diHead}>
            <View style={styles.diIconBox}>
              <Zap
                size={rf(13)}
                color="#FFFFFF"
                strokeWidth={2.4}
                fill="#FFFFFF"
              />
            </View>
            <Text style={styles.diLabel}>DAILY INTELLIGENCE</Text>
            <View
              style={{
                flex: 1,
              }}
            />
            <Switch
              value={dailyOn}
              onValueChange={setDailyOn}
              trackColor={{
                false: '#CBD5E1',
                true: COLORS.ORANGE,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.diTitle}>Daily Market Intelligence</Text>
          <Text style={styles.diSub}>
            Stay updated with mandi prices, crop demand, government
            announcements and weather impacts.
          </Text>
          <View style={styles.diTiles}>
            {['Markets', 'Crops', 'Alerts'].map(t => (
              <View key={t} style={styles.diTile}>
                <Text style={styles.diTileText}>{t}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {}
        <View style={styles.dateCard}>
          <View style={styles.dateLeft}>
            <View style={styles.calIcon}>
              <Calendar
                size={rf(13)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.3}
              />
            </View>
            <View>
              <Text style={styles.dateTop}>Today</Text>
              <Text style={styles.dateBottom}>Wednesday, 18 June 2025</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.changeDateBtn}>
            <Text style={styles.changeDateText}>Change Date</Text>
          </TouchableOpacity>
        </View>

        {}
        <FilterChips
          options={CHIPS}
          value={chip}
          onChange={setChip}
          style={{
            paddingHorizontal: 0,
          }}
        />

        {}
        <Text style={styles.sectionTitle}>Featured Update</Text>
        <View style={styles.featuredCard}>
          <View style={styles.featuredImgWrap}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
              }}
              style={styles.featuredImg}
            />
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <View style={styles.featuredTime}>
              <Text
                style={{
                  fontSize: rf(9),
                }}
              >
                🕐
              </Text>
              <Text style={styles.featuredTimeText}>1 hr ago</Text>
            </View>
          </View>
          <View style={styles.featuredBody}>
            <View style={styles.marketPill}>
              <Text style={styles.marketPillText}>Market</Text>
            </View>
            <Text style={styles.featuredTitle}>
              Rabi crop arrivals surge — wheat prices expected to test ₹2,500
              this week at major mandis
            </Text>
            <Text style={styles.featuredDesc}>
              Major mandis including Azadpur and Indore report 18% higher
              arrivals compared to last week, pushing prices upward as export
              demand picks up.
            </Text>
            <TouchableOpacity activeOpacity={0.9} style={styles.readStoryBtn}>
              <Text style={styles.readStoryText}>Read Full Story</Text>
              <ArrowRight size={rf(13)} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.headRow}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {UPDATES.map(u => {
          const Icon = u.icon;
          return (
            <View key={u.id} style={styles.updateCard}>
              <View style={styles.updateHead}>
                <View
                  style={[
                    styles.updateIcon,
                    {
                      backgroundColor: u.bg,
                    },
                  ]}
                >
                  <Icon size={rf(13)} color={u.color} strokeWidth={2.3} />
                </View>
                <Text style={styles.updateCat}>{u.category}</Text>
                <View
                  style={{
                    flex: 1,
                  }}
                />
                <Text style={styles.updateTime}>{u.time}</Text>
              </View>
              <Text style={styles.updateTitle}>{u.title}</Text>
              <Text style={styles.updateDesc}>{u.desc}</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>Read More →</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHead}>
            <View style={styles.summaryIcon}>
              <Zap
                size={rf(13)}
                color="#FFFFFF"
                strokeWidth={2.4}
                fill="#FFFFFF"
              />
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.summaryTitle}>AI Daily Summary</Text>
              <Text style={styles.summarySub}>Powered by KhetiMaster AI</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.gainLossRow}>
            <View
              style={[
                styles.gainLossBox,
                {
                  backgroundColor: '#EAFBF0',
                },
              ]}
            >
              <View style={styles.gainLossHead}>
                <TrendingUp
                  size={rf(11)}
                  color={COLORS.DARK_GREEN}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.gainLossTitle,
                    {
                      color: COLORS.DARK_GREEN,
                    },
                  ]}
                >
                  Top Gainers
                </Text>
              </View>
              {GAINERS.map(g => (
                <View key={g.name} style={styles.gainLossRowItem}>
                  <Text style={styles.gainLossName}>{g.name}</Text>
                  <Text
                    style={[
                      styles.gainLossPct,
                      {
                        color: COLORS.DARK_GREEN,
                      },
                    ]}
                  >
                    {g.pct}
                  </Text>
                </View>
              ))}
            </View>
            <View
              style={[
                styles.gainLossBox,
                {
                  backgroundColor: '#FEF2F2',
                },
              ]}
            >
              <View style={styles.gainLossHead}>
                <TrendingDown
                  size={rf(11)}
                  color={COLORS.RED}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.gainLossTitle,
                    {
                      color: COLORS.RED,
                    },
                  ]}
                >
                  Top Losers
                </Text>
              </View>
              {LOSERS.map(l => (
                <View key={l.name} style={styles.gainLossRowItem}>
                  <Text style={styles.gainLossName}>{l.name}</Text>
                  <Text
                    style={[
                      styles.gainLossPct,
                      {
                        color: COLORS.RED,
                      },
                    ]}
                  >
                    {l.pct}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.trendBox}>
            <View style={styles.trendHead}>
              <Zap size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
              <Text style={styles.trendHeadText}>Market Trend</Text>
            </View>
            <Text style={styles.trendText}>
              Overall markets are showing a bullish trend with cereal crops
              leading the rally. Oilseeds facing headwinds from lower global
              prices. Vegetables remain volatile.
            </Text>
          </View>

          <View style={styles.holdBox}>
            <Text style={styles.holdText}>
              Hold wheat stocks for 7–10 days. Consider early harvest of rabi
              onion crops given weather forecast. Favorable time to sell cotton
              at current prices.
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.viewAnalysisBtn}>
            <Text
              style={{
                fontSize: rf(11),
              }}
            >
              📊
            </Text>
            <Text style={styles.viewAnalysisText}>View Full Analysis</Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.headRow}>
          <View style={styles.govHead}>
            <View style={styles.govIcon}>
              <Landmark size={rf(13)} color={COLORS.BLUE} strokeWidth={2.3} />
            </View>
            <Text style={styles.govTitle}>Government{'\n'}Updates</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.govSub}>Schemes, policies & announcements</Text>

        {GOV_UPDATES.map(g => (
          <TouchableOpacity
            key={g.id}
            activeOpacity={0.85}
            style={styles.govCard}
          >
            <View style={styles.govCardIcon}>
              <Text
                style={{
                  fontSize: rf(14),
                }}
              >
                📋
              </Text>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <View style={styles.govNameRow}>
                <Text style={styles.govName}>{g.title}</Text>
                {g.badge && (
                  <View
                    style={[
                      styles.govBadge,
                      {
                        backgroundColor: g.badgeColor,
                      },
                    ]}
                  >
                    <Text style={styles.govBadgeText}>{g.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.govDesc}>{g.desc}</Text>
            </View>
            <ChevronRight
              size={rf(14)}
              color={COLORS.MUTED}
              strokeWidth={2.3}
            />
          </TouchableOpacity>
        ))}

        {}
        <View style={styles.headRow}>
          <Text style={styles.sectionTitle}>Trending Today</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>All Prices</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.trendRow}>
          {TRENDING.map(t => (
            <View key={t.name} style={styles.trendCard}>
              <Text style={styles.trendName}>{t.name}</Text>
              <Text style={styles.trendPrice}>₹{t.price}</Text>
              <View style={styles.trendDeltaRow}>
                {t.up ? (
                  <TrendingUp
                    size={rf(10)}
                    color={COLORS.DARK_GREEN}
                    strokeWidth={2.4}
                  />
                ) : (
                  <TrendingDown
                    size={rf(10)}
                    color={COLORS.RED}
                    strokeWidth={2.4}
                  />
                )}
                <Text
                  style={{
                    fontSize: rf(10),
                    fontWeight: '900',
                    color: t.up ? COLORS.DARK_GREEN : COLORS.RED,
                  }}
                >
                  {t.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {}
        <TouchableOpacity activeOpacity={0.9} style={styles.enableBtn}>
          <Bell size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.enableText}>Enable Daily Updates</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
  scroll: {
    padding: PAGE_PADDING,
    paddingBottom: 40,
    gap: 14,
  },
  diCard: {
    padding: 18,
    borderRadius: 16,
  },
  diHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diLabel: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  diTitle: {
    marginTop: 12,
    fontSize: rf(20),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  diSub: {
    marginTop: 6,
    fontSize: rf(11.5),
    lineHeight: rf(16),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  diTiles: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  diTile: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diTileText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dateCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  calIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTop: {
    fontSize: rf(11.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  dateBottom: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  changeDateBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  changeDateText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  sectionTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  featuredCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  featuredImgWrap: {
    position: 'relative',
  },
  featuredImg: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
  },
  featuredBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  featuredTime: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredTimeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  featuredBody: {
    padding: 14,
  },
  marketPill: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  marketPillText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  featuredTitle: {
    marginTop: 10,
    fontSize: rf(14),
    lineHeight: rf(19),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  featuredDesc: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(15.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  readStoryBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  readStoryText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  updateCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  updateHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateCat: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  updateTime: {
    fontSize: rf(9.5),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  updateTitle: {
    marginTop: 10,
    fontSize: rf(13),
    lineHeight: rf(18),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  updateDesc: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(15.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  readMoreBtn: {
    marginTop: 10,
  },
  readMoreText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F0FBF3',
    borderWidth: 1,
    borderColor: '#BBF0CC',
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  summarySub: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  livePill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  gainLossRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  gainLossBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
  },
  gainLossHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  gainLossTitle: {
    fontSize: rf(11),
    fontWeight: '900',
  },
  gainLossRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gainLossName: {
    fontSize: rf(11),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  gainLossPct: {
    fontSize: rf(11),
    fontWeight: '900',
  },
  trendBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  trendHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  trendHeadText: {
    fontSize: rf(11.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  trendText: {
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: COLORS.DARK,
  },
  holdBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
  },
  holdText: {
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  viewAnalysisBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.DARK_GREEN,
  },
  viewAnalysisText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  govHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  govIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  govTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
    lineHeight: rf(18),
  },
  govSub: {
    marginTop: -8,
    fontSize: rf(10.5),
    fontWeight: '500',
    color: COLORS.MUTED,
    paddingLeft: 38,
  },
  govCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  govCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  govNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  govName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  govBadge: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 4,
    justifyContent: 'center',
  },
  govBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  govDesc: {
    marginTop: 3,
    fontSize: rf(10),
    lineHeight: rf(14),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  trendRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trendCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    gap: 3,
  },
  trendName: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  trendPrice: {
    marginTop: 4,
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  trendDeltaRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  enableBtn: {
    marginTop: 10,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  enableText: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
