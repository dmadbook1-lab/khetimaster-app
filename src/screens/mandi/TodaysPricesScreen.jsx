import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  SlidersHorizontal,
  Home,
  Clock,
  Search,
  MapPin,
  RefreshCw,
  Gift,
  TrendingUp,
  Package,
  Bot,
  Bell,
  X,
  ChevronRight,
  BarChart3,
  History,
  Building,
} from 'lucide-react-native';

import {COLORS, rf, PAGE_PADDING} from '../../components/mandi/theme';
import {MANDI_ROUTES} from '../../constants/mandiRoutes';

const FILTERS = ['All', 'Food Grains', 'Pulses', 'Oil Seeds', 'Vegetables', 'Cash Crops'];

const PRICES = [
  {id: 'p1', name: 'Cotton', price: '7,240', min: '6,800', max: '7,650', delta: '+ 140', up: true, emoji: '🌿', bg: '#EAFBF0'},
  {id: 'p2', name: 'Wheat', price: '2,350', min: '2,200', max: '2,500', delta: '+ 80', up: true, emoji: '🌾', bg: '#FEF3C7'},
  {id: 'p3', name: 'Soybean', price: '4,820', min: '4,700', max: '4,950', delta: '- 60', up: false, emoji: '🫘', bg: '#FED7AA'},
  {id: 'p4', name: 'Maize', price: '1,940', min: '1,880', max: '2,020', delta: '+ 30', up: true, emoji: '🌽', bg: '#FEF9C3'},
  {id: 'p5', name: 'Onion', price: '1,200', min: '1,050', max: '1,380', delta: '- 100', up: false, emoji: '🧅', bg: '#FECACA'},
  {id: 'p6', name: 'Sunflower', price: '5,600', min: '5,400', max: '5,800', delta: '+ 200', up: true, emoji: '🌻', bg: '#FEF9C3'},
  {id: 'p7', name: 'Tur Dal', price: '9,100', min: '8,900', max: '9,300', delta: '+ 120', up: true, emoji: '🫛', bg: '#DCFCE7'},
  {id: 'p8', name: 'Tomato', price: '820', min: '780', max: '900', delta: '- 40', up: false, emoji: '🍅', bg: '#FECACA'},
];

export default function TodaysPricesScreen({navigation}) {
  const [filter, setFilter] = useState('All');
  const [priceModal, setPriceModal] = useState(null);

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
        <View style={{flex: 1, marginLeft: 8}}>
          <Text style={styles.headerTitle}>Today's Prices</Text>
          <View style={styles.headerSubRow}>
            <Home size={rf(10)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.headerSub}>Today's Market Prices</Text>
            <View style={styles.dot} />
            <Clock size={rf(10)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.headerSub}>Today • 09:30 AM</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <SlidersHorizontal size={rf(16)} color={COLORS.DARK} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
          <TextInput
            placeholder="Search crop.."
            placeholderTextColor={COLORS.MUTED}
            style={styles.searchInput}
          />
        </View>

        {/* Current Market */}
        <View style={styles.marketCard}>
          <View style={styles.marketIcon}>
            <MapPin size={rf(15)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.marketLabel}>CURRENT MARKET</Text>
            <Text style={styles.marketName}>Yavatmal APMC</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation?.navigate(MANDI_ROUTES.DISTRICT_WISE_RATES)}
            style={styles.changeBtn}>
            <RefreshCw size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.85}
                onPress={() => setFilter(f)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Price Cards */}
        {PRICES.map(p => (
          <View key={p.id} style={styles.pCard}>
            <View style={styles.pTopRow}>
              <View style={[styles.pIcon, {backgroundColor: p.bg}]}>
                <Text style={{fontSize: rf(20)}}>{p.emoji}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.pName}>{p.name}</Text>
                <Text style={styles.pPrice}>
                  ₹{p.price}
                  <Text style={styles.pUnit}> /qtl</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.pDeltaPill,
                  {backgroundColor: p.up ? '#EAFBF0' : '#FEE2E2'},
                ]}>
                <Text
                  style={[
                    styles.pDeltaText,
                    {color: p.up ? COLORS.DARK_GREEN : COLORS.RED},
                  ]}>
                  {p.delta}
                </Text>
              </View>
            </View>

            <View style={styles.pBottomRow}>
              <View>
                <Text style={styles.pMinLabel}>Min</Text>
                <Text style={styles.pMinVal}>₹{p.min}</Text>
              </View>
              <View style={{marginLeft: 20}}>
                <Text style={styles.pMinLabel}>Max</Text>
                <Text style={styles.pMinVal}>₹{p.max}</Text>
              </View>
              <View style={{flex: 1}} />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPriceModal(p)}
                style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <ChevronRight size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Market Summary */}
        <Text style={styles.summaryTitle}>Market Summary</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryIconBox, {backgroundColor: '#FED7AA'}]}>
              <Gift size={rf(15)} color="#B45309" strokeWidth={2.3} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryLabel}>Highest Price</Text>
              <Text style={styles.summaryVal}>
                Tur Dal <Text style={styles.summarySub}>9,100/qtl</Text>
              </Text>
            </View>
          </View>

          <View style={[styles.summaryRow, styles.summaryRowGreen]}>
            <View style={[styles.summaryIconBox, {backgroundColor: '#DCFCE7'}]}>
              <TrendingUp size={rf(15)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryLabel}>Biggest Increase</Text>
              <Text style={styles.summaryVal}>
                Sunflower <Text style={{color: COLORS.DARK_GREEN}}>+ 200 (3.7%)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryIconBox, {backgroundColor: '#E9D5FF'}]}>
              <Package size={rf(15)} color="#7C3AED" strokeWidth={2.3} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryLabel}>Most Traded</Text>
              <Text style={styles.summaryVal}>
                Cotton <Text style={styles.summarySub}>2,450 quintals</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* AI Market Insight */}
        <LinearGradient
          colors={['#158B3D', '#0F6D2E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aiCard}>
          <View style={styles.aiHead}>
            <View style={styles.aiIconBox}>
              <Bot size={rf(15)} color="#FFFFFF" strokeWidth={2.3} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.aiTitle}>AI Market Insight</Text>
              <Text style={styles.aiSub}>Powered by KhetiMaster AI</Text>
            </View>
            <View style={styles.liveDot}>
              <View style={styles.liveCircle} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <View style={styles.aiRow}>
            <View style={styles.aiTile}>
              <View style={styles.aiTileHead}>
                <TrendingUp size={rf(11)} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
                <Text style={styles.aiTileLabel}>Expected Trend</Text>
              </View>
              <Text style={styles.aiTileVal}>Bullish ↑</Text>
              <Text style={styles.aiTileSub}>Next 3 days</Text>
            </View>

            <View style={styles.aiTile}>
              <View style={styles.aiTileHead}>
                <Clock size={rf(11)} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
                <Text style={styles.aiTileLabel}>Best Sell Time</Text>
              </View>
              <Text style={styles.aiTileVal}>Tomorrow</Text>
              <Text style={styles.aiTileSub}>10 AM - 12 PM</Text>
            </View>
          </View>

          <View style={styles.aiNote}>
            <Text style={{fontSize: rf(11)}}>💡</Text>
            <Text style={styles.aiNoteText}>
              Cotton prices are rising due to lower arrivals. Consider holding stock
              for 1-2 days for better returns.
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <Text style={styles.qaTitle}>Quick Actions</Text>
        <View style={styles.qaRow}>
          <TouchableOpacity activeOpacity={0.85} style={styles.qaCard}>
            <View style={styles.qaIconBox}>
              <BarChart3 size={rf(16)} color={COLORS.BLUE} strokeWidth={2.3} />
            </View>
            <Text style={styles.qaLabel}>Price History</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} style={styles.qaCard}>
            <View style={[styles.qaIconBox, {backgroundColor: '#DCFCE7'}]}>
              <Bell size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            </View>
            <Text style={styles.qaLabel}>Set Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation?.navigate(MANDI_ROUTES.NEARBY_MARKETS)}
            style={styles.qaCard}>
            <View style={[styles.qaIconBox, {backgroundColor: '#DBEAFE'}]}>
              <MapPin size={rf(16)} color={COLORS.BLUE} strokeWidth={2.3} />
            </View>
            <Text style={styles.qaLabel}>Nearby Markets</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation?.navigate(MANDI_ROUTES.NEARBY_MARKETS)}
          style={styles.compareBtn}>
          <BarChart3 size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.compareText}>Compare Markets</Text>
        </TouchableOpacity>
      </View>

      {/* Price Details Modal */}
      <Modal
        visible={!!priceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPriceModal(null)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPriceModal(null)}
          style={styles.modalBackdrop}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {priceModal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalHeaderIcon, {backgroundColor: priceModal.bg}]}>
                    <Text style={{fontSize: rf(22)}}>{priceModal.emoji}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.modalTitle}>{priceModal.name}</Text>
                    <View style={styles.modalMetaRow}>
                      <Building size={rf(11)} color={COLORS.MUTED} strokeWidth={2.3} />
                      <Text style={styles.modalMeta}>Yavatmal APMC</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPriceModal(null)}
                    style={styles.modalCloseBtn}>
                    <X size={rf(16)} color={COLORS.DARK} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBigPrice}>
                  <Text style={styles.modalBigPriceLabel}>Today's Modal Price</Text>
                  <Text style={styles.modalBigPriceVal}>
                    ₹{priceModal.price}
                    <Text style={styles.modalBigPriceUnit}> /qtl</Text>
                  </Text>
                  <View
                    style={[
                      styles.modalDeltaPill,
                      {backgroundColor: priceModal.up ? '#EAFBF0' : '#FEE2E2'},
                    ]}>
                    {priceModal.up ? (
                      <TrendingUp size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
                    ) : (
                      <TrendingUp
                        size={rf(11)}
                        color={COLORS.RED}
                        strokeWidth={2.4}
                        style={{transform: [{rotate: '180deg'}]}}
                      />
                    )}
                    <Text
                      style={[
                        styles.modalDeltaText,
                        {color: priceModal.up ? COLORS.DARK_GREEN : COLORS.RED},
                      ]}>
                      {priceModal.delta} from yesterday
                    </Text>
                  </View>
                </View>

                <View style={styles.modalStatsRow}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Min Price</Text>
                    <Text style={styles.modalStatVal}>₹{priceModal.min}</Text>
                  </View>
                  <View style={[styles.modalStat, styles.modalStatActive]}>
                    <Text style={[styles.modalStatLabel, {color: COLORS.DARK_GREEN}]}>Modal</Text>
                    <Text style={[styles.modalStatVal, {color: COLORS.DARK_GREEN}]}>
                      ₹{priceModal.price}
                    </Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Max Price</Text>
                    <Text style={styles.modalStatVal}>₹{priceModal.max}</Text>
                  </View>
                </View>

                <View style={styles.modalInfoBox}>
                  <Text style={styles.modalInfoTitle}>Market Info</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Market Hours</Text>
                    <Text style={styles.modalInfoVal}>6:00 AM - 8:00 PM</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Last Updated</Text>
                    <Text style={styles.modalInfoVal}>Today, 09:30 AM</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Unit</Text>
                    <Text style={styles.modalInfoVal}>Per Quintal (100 kg)</Text>
                  </View>
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPriceModal(null)}
                    style={styles.modalHistoryBtn}>
                    <History size={rf(13)} color={COLORS.DARK} strokeWidth={2.4} />
                    <Text style={styles.modalHistoryText}>Price History</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setPriceModal(null);
                      navigation?.navigate(MANDI_ROUTES.NEARBY_MARKETS);
                    }}
                    style={styles.modalCompareBtn}>
                    <BarChart3 size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.modalCompareText}>Compare</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scroll: {padding: PAGE_PADDING, paddingBottom: 110, gap: 12},

  header: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.PAGE_BG,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  headerTitle: {fontSize: rf(16), fontWeight: '900', color: COLORS.DARK},
  headerSubRow: {marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 4},
  headerSub: {fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},
  dot: {width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.MUTED, marginHorizontal: 2},

  searchBox: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {flex: 1, fontSize: rf(12), color: COLORS.DARK, padding: 0},

  marketCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marketIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketLabel: {fontSize: rf(9), fontWeight: '700', color: COLORS.MUTED, letterSpacing: 0.5},
  marketName: {marginTop: 2, fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK},
  changeBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},

  chipsRow: {gap: 8, paddingVertical: 2},
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  chipActive: {backgroundColor: COLORS.DARK_GREEN},
  chipText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},
  chipTextActive: {color: '#FFFFFF'},

  pCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  pTopRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  pIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pName: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  pPrice: {marginTop: 2, fontSize: rf(17), fontWeight: '900', color: COLORS.DARK},
  pUnit: {fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},
  pDeltaPill: {
    paddingHorizontal: 10,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pDeltaText: {fontSize: rf(10), fontWeight: '900'},

  pBottomRow: {marginTop: 12, flexDirection: 'row', alignItems: 'center'},
  pMinLabel: {fontSize: rf(9.5), fontWeight: '600', color: COLORS.MUTED},
  pMinVal: {marginTop: 2, fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  viewDetailsBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},

  summaryTitle: {marginTop: 8, fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  summaryCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  summaryRow: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  summaryRowGreen: {backgroundColor: '#F0FDF4'},
  summaryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  summaryVal: {marginTop: 2, fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK},
  summarySub: {fontSize: rf(11), fontWeight: '600', color: COLORS.MUTED},

  aiCard: {padding: 16, borderRadius: 16, marginTop: 6},
  aiHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  aiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {fontSize: rf(13.5), fontWeight: '900', color: '#FFFFFF'},
  aiSub: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: 'rgba(255,255,255,0.85)'},
  liveDot: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveCircle: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF'},
  liveText: {fontSize: rf(9.5), fontWeight: '900', color: '#FFFFFF'},

  aiRow: {marginTop: 14, flexDirection: 'row', gap: 8},
  aiTile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  aiTileHead: {flexDirection: 'row', alignItems: 'center', gap: 4},
  aiTileLabel: {fontSize: rf(9.5), fontWeight: '700', color: 'rgba(255,255,255,0.85)'},
  aiTileVal: {marginTop: 6, fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  aiTileSub: {marginTop: 2, fontSize: rf(9.5), fontWeight: '500', color: 'rgba(255,255,255,0.75)'},

  aiNote: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  aiNoteText: {flex: 1, fontSize: rf(11), fontWeight: '500', color: '#FFFFFF', lineHeight: rf(16)},

  qaTitle: {marginTop: 8, fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  qaRow: {flexDirection: 'row', gap: 8},
  qaCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    gap: 8,
  },
  qaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {fontSize: rf(10.5), fontWeight: '700', color: COLORS.DARK, textAlign: 'center'},

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
  compareBtn: {
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
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },
  compareText: {fontSize: rf(13.5), fontWeight: '900', color: '#FFFFFF'},

  // Modal
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: 20,
    maxHeight: '85%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  modalHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  modalHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {fontSize: rf(16), fontWeight: '900', color: COLORS.DARK},
  modalMetaRow: {marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 4},
  modalMeta: {fontSize: rf(11), fontWeight: '600', color: COLORS.MUTED},
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBigPrice: {
    marginTop: 16,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
  },
  modalBigPriceLabel: {fontSize: rf(10.5), fontWeight: '700', color: COLORS.MUTED, letterSpacing: 0.5},
  modalBigPriceVal: {marginTop: 6, fontSize: rf(30), fontWeight: '900', color: COLORS.DARK_GREEN},
  modalBigPriceUnit: {fontSize: rf(12), fontWeight: '500', color: COLORS.MUTED},
  modalDeltaPill: {
    marginTop: 10,
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalDeltaText: {fontSize: rf(11), fontWeight: '900'},

  modalStatsRow: {marginTop: 14, flexDirection: 'row', gap: 6},
  modalStat: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  modalStatActive: {backgroundColor: '#EAFBF0'},
  modalStatLabel: {fontSize: rf(10), fontWeight: '700', color: COLORS.MUTED},
  modalStatVal: {marginTop: 4, fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},

  modalInfoBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalInfoTitle: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK, marginBottom: 8},
  modalInfoRow: {
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInfoLabel: {fontSize: rf(11), fontWeight: '600', color: COLORS.MUTED},
  modalInfoVal: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},

  modalBtnRow: {marginTop: 16, flexDirection: 'row', gap: 8},
  modalHistoryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalHistoryText: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  modalCompareBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalCompareText: {fontSize: rf(12), fontWeight: '900', color: '#FFFFFF'},
});