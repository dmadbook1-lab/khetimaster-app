import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  RotateCw,
  TrendingUp,
  Bell,
  History,
  Share2,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react-native';
import SparkLine from '../../components/mandi/SparkLine';
import { COLORS, rf, PAGE_PADDING, width } from '../../components/mandi/theme';
const DATA = [7000, 7050, 7100, 7180, 7220, 7240];
const NEARBY = [
  {
    name: 'WARDHA APMC',
    price: '7,180',
    delta: '-60',
    up: false,
    dist: '32 km',
  },
  {
    name: 'AMRAVATI APMC',
    price: '7,300',
    delta: '+60',
    up: true,
    dist: '58 km',
  },
  {
    name: 'NAGPUR APMC',
    price: '7,150',
    delta: '-90',
    up: false,
    dist: '95 km',
  },
];
export default function CommodityDetailScreen({ navigation }) {
  const chartWidth = width - PAGE_PADDING * 4;
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation?.goBack()}
          style={styles.topBackBtn}
        >
          <ArrowLeft size={rf(16)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <Text style={styles.topTitle}>Cotton Prices</Text>
          <View style={styles.topSubRow}>
            <MapPin size={rf(10)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            <Text style={styles.topSub}>Yavatmal APMC</Text>
            <RotateCw size={rf(9)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.topSubMuted}>Updated 09:30 AM</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.topBackBtn}>
          <Bookmark size={rf(15)} color={COLORS.DARK} strokeWidth={2.3} />
        </TouchableOpacity>
      </View>

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
          style={styles.hero}
        >
          <View style={styles.heroHead}>
            <View style={styles.heroIcon}>
              <MapPin
                size={rf(15)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.3}
              />
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.heroName}>Cotton</Text>
              <Text style={styles.heroLoc}>Yavatmal APMC</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <View style={styles.heroPriceRow}>
            <Text style={styles.heroPriceRupee}>₹</Text>
            <Text style={styles.heroPrice}>7,240</Text>
          </View>
          <Text style={styles.heroUnit}>per quintal (100 kg)</Text>

          <View style={styles.heroDelta}>
            <TrendingUp size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.heroDeltaText}>+ 140 (1.97%)</Text>
            <Text style={styles.heroDeltaSub}>vs yesterday</Text>
          </View>
        </LinearGradient>

        {}
        <View style={styles.mmRow}>
          <View
            style={[
              styles.mmBox,
              {
                backgroundColor: '#EAFBF0',
              },
            ]}
          >
            <Text
              style={[
                styles.mmLabel,
                {
                  color: COLORS.DARK_GREEN,
                },
              ]}
            >
              Min Price
            </Text>
            <Text
              style={[
                styles.mmVal,
                {
                  color: COLORS.DARK_GREEN,
                },
              ]}
            >
              ₹6,800
            </Text>
          </View>
          <View
            style={[
              styles.mmBox,
              {
                backgroundColor: '#FFF7ED',
              },
            ]}
          >
            <Text
              style={[
                styles.mmLabel,
                {
                  color: COLORS.ORANGE,
                },
              ]}
            >
              Avg Price
            </Text>
            <Text
              style={[
                styles.mmVal,
                {
                  color: COLORS.ORANGE,
                },
              ]}
            >
              ₹7,240
            </Text>
          </View>
          <View
            style={[
              styles.mmBox,
              {
                backgroundColor: '#FCE7F3',
              },
            ]}
          >
            <Text
              style={[
                styles.mmLabel,
                {
                  color: '#DB2777',
                },
              ]}
            >
              Max Price
            </Text>
            <Text
              style={[
                styles.mmVal,
                {
                  color: '#DB2777',
                },
              ]}
            >
              ₹7,650
            </Text>
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.chartHead}>
            <Text style={styles.chartTitle}>Today's Trend</Text>
            <View style={styles.chartLegend}>
              <View style={styles.chartDot} />
              <Text style={styles.chartLegendText}>Cotton, Yavatmal</Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
              alignItems: 'center',
            }}
          >
            <SparkLine
              data={DATA}
              width={chartWidth}
              height={120}
              color={COLORS.DARK_GREEN}
              showFill
              markers={[
                {
                  idx: 5,
                  color: COLORS.DARK_GREEN,
                },
              ]}
            />
          </View>
          <View style={styles.timeAxis}>
            {['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', 'Now'].map((t, i) => (
              <Text
                key={t}
                style={[
                  styles.timeLabel,
                  i === 5 && {
                    color: COLORS.DARK_GREEN,
                    fontWeight: '900',
                  },
                ]}
              >
                {t}
              </Text>
            ))}
          </View>
          <View style={styles.legendBottom}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: COLORS.DARK_GREEN,
                  },
                ]}
              />
              <Text style={styles.legendText}>Now: ₹7,240</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: COLORS.ORANGE,
                  },
                ]}
              />
              <Text style={styles.legendText}>Morning: ₹6,980</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: COLORS.BLUE,
                  },
                ]}
              />
              <Text style={styles.legendText}>Afternoon: ₹7,180</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.headRow}>
          <Text style={styles.sectionTitle}>Nearby Markets</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>Compare All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
          }}
        >
          {NEARBY.map(n => (
            <View key={n.name} style={styles.nearbyCard}>
              <View style={styles.nearbyTop}>
                <View style={styles.pinCircle}>
                  <MapPin
                    size={rf(11)}
                    color={COLORS.DARK_GREEN}
                    strokeWidth={2.4}
                  />
                </View>
                <View
                  style={[
                    styles.deltaBox,
                    {
                      backgroundColor: n.up ? '#EAFBF0' : '#FEF2F2',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: rf(10),
                      fontWeight: '900',
                      color: n.up ? COLORS.DARK_GREEN : COLORS.RED,
                    }}
                  >
                    {n.delta}
                  </Text>
                </View>
              </View>
              <Text style={styles.nearbyPrice}>₹{n.price}</Text>
              <Text style={styles.nearbyName}>{n.name}</Text>
              <View style={styles.distRow}>
                <Text
                  style={{
                    fontSize: rf(9),
                  }}
                >
                  ✈️
                </Text>
                <Text style={styles.distText}>{n.dist}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

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
          style={styles.aiCard}
        >
          <View style={styles.aiHead}>
            <View style={styles.aiIcon}>
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
              <Text style={styles.aiTitle}>AI Market Insight</Text>
              <Text style={styles.aiSub}>Powered by KhetiMaster AI</Text>
            </View>
            <View style={styles.aiLivePill}>
              <Text style={styles.aiLiveText}>Live</Text>
            </View>
          </View>

          <View style={styles.aiTwo}>
            <View style={styles.aiTile}>
              <View style={styles.aiTileHead}>
                <TrendingUp size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.aiTileLabel}>Expected Trend</Text>
              </View>
              <Text style={styles.aiTileValue}>Bullish ↑</Text>
              <Text style={styles.aiTileSub}>Next 3 days</Text>
            </View>
            <View style={styles.aiTile}>
              <View style={styles.aiTileHead}>
                <Clock size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.aiTileLabel}>Best Sell Time</Text>
              </View>
              <Text style={styles.aiTileValue}>Tomorrow</Text>
              <Text style={styles.aiTileSub}>10 AM – 12 PM</Text>
            </View>
          </View>

          <View style={styles.aiNoteRow}>
            <Text
              style={{
                fontSize: rf(12),
              }}
            >
              ℹ️
            </Text>
            <Text style={styles.aiNoteText}>
              Cotton prices are rising due to lower arrivals. Consider holding
              stock for 1–2 days for better returns.
            </Text>
          </View>
        </LinearGradient>

        {}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.qaRow}>
          {[
            {
              label: 'Set Alert',
              icon: Bell,
              color: COLORS.DARK_GREEN,
              bg: '#EAFBF0',
            },
            {
              label: 'History',
              icon: History,
              color: COLORS.BLUE,
              bg: COLORS.BLUE_SOFT,
            },
            {
              label: 'Nearby',
              icon: MapPin,
              color: COLORS.ORANGE,
              bg: COLORS.ORANGE_SOFT,
            },
            {
              label: 'Share',
              icon: Share2,
              color: COLORS.PURPLE,
              bg: COLORS.PURPLE_SOFT,
            },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                style={styles.qaCol}
              >
                <View
                  style={[
                    styles.qaIcon,
                    {
                      backgroundColor: a.bg,
                    },
                  ]}
                >
                  <Icon size={rf(15)} color={a.color} strokeWidth={2.4} />
                </View>
                <Text style={styles.qaLabel}>{a.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {}
        <Text style={styles.sectionTitle}>Related News</Text>
        <View style={styles.newsCard}>
          <View style={styles.newsImgWrap}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800',
              }}
              style={styles.newsImg}
            />
            <View style={styles.newsBadge}>
              <Text style={styles.newsBadgeText}>Market Update</Text>
            </View>
          </View>
          <View style={styles.newsBody}>
            <Text style={styles.newsMeta}>TODAY, 08:45 AM • AGRI MARKETS</Text>
            <Text style={styles.newsTitle}>
              Cotton arrivals drop 18% in Vidarbha; prices expected to rise
              through week-end
            </Text>
            <Text style={styles.newsDesc}>
              Lower cotton arrivals at major Vidarbha APMCs have pushed spot
              prices up by ₹100–₹200/quintal this week. Traders expect the trend
              to continue amid firm export demand.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.readArticleRow}
            >
              <Text style={styles.readArticleText}>Read Full Article</Text>
              <ArrowRight
                size={rf(13)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {}
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
  topBar: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  topBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  topSubRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topSub: {
    fontSize: rf(10),
    fontWeight: '700',
    color: COLORS.DARK_GREEN,
  },
  topSubMuted: {
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  scroll: {
    padding: PAGE_PADDING,
    paddingBottom: 110,
    gap: 14,
  },
  hero: {
    padding: 18,
    borderRadius: 16,
  },
  heroHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroLoc: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  livePill: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroPriceRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroPriceRupee: {
    fontSize: rf(28),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroPrice: {
    fontSize: rf(42),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  heroUnit: {
    marginTop: -2,
    fontSize: rf(11),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  heroDelta: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDeltaText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroDeltaSub: {
    fontSize: rf(10),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  mmRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mmBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  mmLabel: {
    fontSize: rf(10),
    fontWeight: '900',
  },
  mmVal: {
    marginTop: 4,
    fontSize: rf(14),
    fontWeight: '900',
  },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.DARK_GREEN,
  },
  chartLegendText: {
    fontSize: rf(10.5),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  timeAxis: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  legendBottom: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  seeAll: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  nearbyCard: {
    width: 130,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  nearbyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaBox: {
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 4,
    justifyContent: 'center',
  },
  nearbyPrice: {
    marginTop: 10,
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  nearbyName: {
    marginTop: 3,
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.3,
  },
  distRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distText: {
    fontSize: rf(9.5),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  aiCard: {
    padding: 16,
    borderRadius: 16,
  },
  aiHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiSub: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  aiLivePill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
  },
  aiLiveText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiTwo: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  aiTile: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  aiTileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiTileLabel: {
    fontSize: rf(10),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  aiTileValue: {
    marginTop: 6,
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiTileSub: {
    marginTop: 2,
    fontSize: rf(9.5),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  aiNoteRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    flexDirection: 'row',
    gap: 6,
  },
  aiNoteText: {
    flex: 1,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  qaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qaCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  newsCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  newsImgWrap: {
    position: 'relative',
  },
  newsImg: {
    width: '100%',
    height: 170,
    backgroundColor: '#F1F5F9',
  },
  newsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
  },
  newsBadgeText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  newsBody: {
    padding: 14,
  },
  newsMeta: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  newsTitle: {
    marginTop: 8,
    fontSize: rf(14),
    lineHeight: rf(19),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  newsDesc: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(15.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  readArticleRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  readArticleText: {
    fontSize: rf(11.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: PAGE_PADDING,
    paddingBottom: 18,
    backgroundColor: COLORS.PAGE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  setAlertBtn: {
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
  setAlertText: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
