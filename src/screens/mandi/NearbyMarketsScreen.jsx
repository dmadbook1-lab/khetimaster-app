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
  Bell,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Building,
  Navigation2,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Bot,
  BarChart3,
  Map,
  X,
  Clock,
  Phone,
  Info,
} from 'lucide-react-native';

import ScreenHeader from '../../components/mandi/ScreenHeader';
import FilterChips from '../../components/mandi/FilterChips';
import {COLORS, rf, PAGE_PADDING} from '../../components/mandi/theme';
import {MANDI_ROUTES} from '../../constants/mandiRoutes';

const CHIPS = ['Nearest', 'Highest Price', 'Open Now', 'Cotton'];

const MARKETS = [
  {
    id: 'm1',
    name: 'Yavatmal APMC',
    dist: '1.2 km',
    status: 'OPEN',
    rating: 5,
    tag: 'NEAREST',
    address: 'Main Road, Yavatmal, Maharashtra 445001',
    hours: '6:00 AM - 8:00 PM',
    phone: '+91 7232-244-500',
    prices: [
      {crop: 'Cotton', emoji: '🌿', value: '7,250', min: '6,800', max: '7,650', delta: '+120', up: true},
      {crop: 'Soybean', emoji: '🫘', value: '5,020', min: '4,700', max: '5,200', delta: '-40', up: false},
      {crop: 'Wheat', emoji: '🌾', value: '2,350', min: '2,200', max: '2,500', delta: '+45', up: true},
    ],
  },
  {
    id: 'm2',
    name: 'Darwha APMC',
    dist: '12 km',
    status: 'OPEN',
    rating: 4,
    address: 'Darwha Road, Yavatmal District, Maharashtra',
    hours: '6:00 AM - 7:30 PM',
    phone: '+91 7233-222-100',
    prices: [
      {crop: 'Cotton', emoji: '🌿', value: '7,310', min: '6,900', max: '7,700', delta: '+180', up: true},
      {crop: 'Soybean', emoji: '🫘', value: '5,080', min: '4,750', max: '5,250', delta: '+60', up: true},
      {crop: 'Tur Dal', emoji: '🫛', value: '9,100', min: '8,900', max: '9,300', delta: '+120', up: true},
    ],
  },
];

export default function NearbyMarketsScreen({navigation}) {
  const [chip, setChip] = useState('Nearest');
  const [priceModal, setPriceModal] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title="Nearby Markets"
        subtitle="Discover nearby APMC markets and compare today's crop prices."
        onBack={() => navigation?.goBack()}
        rightIcon={Bell}
        rightBadge
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Location */}
        <View style={styles.locCard}>
          <View style={styles.locIcon}>
            <MapPin size={rf(15)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.locLabel}>Your Location</Text>
            <Text style={styles.locName}>Yavatmal, Maharashtra</Text>
            <View style={styles.locDotRow}>
              <View style={styles.locDot} />
              <Text style={styles.locSub}>Location detected successfully</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.changeBtn}
            onPress={() => navigation?.navigate(MANDI_ROUTES.DISTRICT_WISE_RATES)}>
            <Text style={styles.changeText}>← CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
            <TextInput
              placeholder="Search market or city..."
              placeholderTextColor={COLORS.MUTED}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
            <SlidersHorizontal size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Chips */}
        <FilterChips options={CHIPS} value={chip} onChange={setChip} style={{paddingHorizontal: 0}} />

        {/* Header */}
        <View style={styles.head}>
          <Text style={styles.headTitle}>Nearby Markets</Text>
          <Text style={styles.headSub}>3 markets found</Text>
        </View>

        {/* Market Cards */}
        {MARKETS.map(m => (
          <View key={m.id} style={styles.mCard}>
            <View style={styles.mHead}>
              <View style={styles.mIcon}>
                <Building size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
              </View>
              <View style={{flex: 1}}>
                <View style={styles.mNameRow}>
                  <Text style={styles.mName}>{m.name}</Text>
                  {m.tag && (
                    <View style={styles.nearestPill}>
                      <Text style={styles.nearestText}>{m.tag}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.mMetaRow}>
                  <MapPin size={rf(10)} color={COLORS.MUTED} strokeWidth={2.3} />
                  <Text style={styles.mDist}>{m.dist}</Text>
                  <View style={styles.openPill}>
                    <Text style={styles.openText}>{m.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={rf(11)}
                    color={s <= m.rating ? COLORS.ORANGE : '#E5E7EB'}
                    fill={s <= m.rating ? COLORS.ORANGE : '#E5E7EB'}
                    strokeWidth={2}
                  />
                ))}
              </View>
            </View>

            <View style={styles.mPricesBox}>
              <Text style={styles.mPricesLabel}>TODAY'S TOP PRICES</Text>
              {m.prices.slice(0, 2).map((p, i) => (
                <View key={i} style={styles.mPriceRow}>
                  <Text style={{fontSize: rf(13)}}>{p.emoji}</Text>
                  <Text style={styles.mPriceName}>{p.crop}</Text>
                  <View style={{flex: 1}} />
                  <Text style={styles.mPriceVal}>
                    ₹{p.value}
                    <Text style={styles.mPriceUnit}>/Qtl</Text>
                  </Text>
                  <View style={styles.mPriceDelta}>
                    {p.up ? (
                      <TrendingUp size={rf(10)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
                    ) : (
                      <TrendingDown size={rf(10)} color={COLORS.RED} strokeWidth={2.4} />
                    )}
                    <Text
                      style={{
                        fontSize: rf(9.5),
                        fontWeight: '900',
                        color: p.up ? COLORS.DARK_GREEN : COLORS.RED,
                      }}>
                      {p.delta}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.mBtnRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setPriceModal(m)}
                style={styles.viewPricesBtn}>
                <Text style={styles.viewPricesEmoji}>💡</Text>
                <Text style={styles.viewPricesText}>View Prices</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={styles.directionsBtn}>
                <Navigation2 size={rf(12)} color={COLORS.DARK} strokeWidth={2.3} />
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={styles.chevronBtn}>
                <ChevronRight size={rf(14)} color={COLORS.DARK} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Map View */}
        <Text style={styles.mapTitle}>Map View</Text>
        <View style={styles.mapCard}>
          <View style={styles.mapImage}>
            <View style={styles.mapYouAre}>
              <View style={styles.mapDotBlue} />
              <Text style={styles.mapYouText}>You are here</Text>
            </View>
            <View style={styles.mapMarketsPill}>
              <Text style={styles.mapMarketsText}>3 Markets</Text>
            </View>
            <MapPin
              size={rf(30)}
              color={COLORS.DARK_GREEN}
              fill={COLORS.DARK_GREEN}
              strokeWidth={2}
              style={styles.mapPin1}
            />
            <MapPin
              size={rf(30)}
              color={COLORS.DARK_GREEN}
              fill={COLORS.DARK_GREEN}
              strokeWidth={2}
              style={styles.mapPin2}
            />

            <TouchableOpacity activeOpacity={0.9} style={styles.mapOpenBtn}>
              <Map size={rf(12)} color={COLORS.DARK} strokeWidth={2.3} />
              <Text style={styles.mapOpenText}>Tap to Open Full Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Suggestion */}
        <LinearGradient
          colors={['#158B3D', '#0F6D2E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aiCard}>
          <View style={styles.aiHead}>
            <View style={styles.aiIconBox}>
              <Bot size={rf(14)} color="#FFFFFF" strokeWidth={2.3} />
            </View>
            <Text style={styles.aiLabel}>AI SUGGESTION</Text>
          </View>
          <Text style={styles.aiTitle}>
            Cotton prices are highest today at Darwha APMC
          </Text>
          <Text style={styles.aiDesc}>
            Potential earnings:{' '}
            <Text style={{fontWeight: '900'}}>+₹60 per quintal</Text> compared to
            your nearest market.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate(MANDI_ROUTES.DISTRICT_WISE_RATES)}
            style={styles.aiBtn}>
            <BarChart3 size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.aiBtnText}>Compare Markets</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} style={styles.browseBtn}>
          <Map size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.browseText}>Browse All Markets</Text>
        </TouchableOpacity>
      </View>

      {/* View Prices Modal */}
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
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 20}}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderIcon}>
                    <Building size={rf(18)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.modalTitle}>{priceModal.name}</Text>
                    <View style={styles.modalMetaRow}>
                      <MapPin size={rf(10)} color={COLORS.MUTED} strokeWidth={2.3} />
                      <Text style={styles.modalMeta}>{priceModal.dist}</Text>
                      <View style={styles.openPill}>
                        <Text style={styles.openText}>{priceModal.status}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPriceModal(null)}
                    style={styles.modalCloseBtn}>
                    <X size={rf(16)} color={COLORS.DARK} strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>

                {/* Rating */}
                <View style={styles.modalRatingRow}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={rf(13)}
                      color={s <= priceModal.rating ? COLORS.ORANGE : '#E5E7EB'}
                      fill={s <= priceModal.rating ? COLORS.ORANGE : '#E5E7EB'}
                      strokeWidth={2}
                    />
                  ))}
                  <Text style={styles.modalRatingText}>
                    {priceModal.rating}.0 Rating
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <MapPin size={rf(12)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
                    <Text style={styles.modalInfoText}>{priceModal.address}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Clock size={rf(12)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
                    <Text style={styles.modalInfoText}>{priceModal.hours}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Phone size={rf(12)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
                    <Text style={styles.modalInfoText}>{priceModal.phone}</Text>
                  </View>
                </View>

                {/* All Prices */}
                <View style={styles.modalPricesHead}>
                  <Text style={styles.modalPricesTitle}>Today's All Prices</Text>
                  <Text style={styles.modalPricesCount}>
                    {priceModal.prices.length} Commodities
                  </Text>
                </View>

                {priceModal.prices.map((p, i) => (
                  <View key={i} style={styles.modalPriceCard}>
                    <View style={styles.modalPriceHeadRow}>
                      <Text style={{fontSize: rf(18)}}>{p.emoji}</Text>
                      <Text style={styles.modalPriceCropName}>{p.crop}</Text>
                      <View style={{flex: 1}} />
                      <View
                        style={[
                          styles.modalDeltaPill,
                          {backgroundColor: p.up ? '#EAFBF0' : '#FEE2E2'},
                        ]}>
                        {p.up ? (
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
                          style={[
                            styles.modalDeltaText,
                            {color: p.up ? COLORS.DARK_GREEN : COLORS.RED},
                          ]}>
                          {p.delta}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalPriceColsRow}>
                      <View style={styles.modalPriceCol}>
                        <Text style={styles.modalPriceColLabel}>Min</Text>
                        <Text style={styles.modalPriceColVal}>₹{p.min}</Text>
                      </View>
                      <View
                        style={[
                          styles.modalPriceCol,
                          styles.modalPriceColActive,
                        ]}>
                        <Text
                          style={[
                            styles.modalPriceColLabel,
                            {color: COLORS.DARK_GREEN},
                          ]}>
                          Modal
                        </Text>
                        <Text
                          style={[
                            styles.modalPriceColVal,
                            {color: COLORS.DARK_GREEN},
                          ]}>
                          ₹{p.value}
                        </Text>
                      </View>
                      <View style={styles.modalPriceCol}>
                        <Text style={styles.modalPriceColLabel}>Max</Text>
                        <Text style={styles.modalPriceColVal}>₹{p.max}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Info Note */}
                <View style={styles.modalNoteRow}>
                  <Info size={rf(12)} color={COLORS.MUTED} strokeWidth={2.3} />
                  <Text style={styles.modalNoteText}>
                    Prices are per quintal (100 kg). Updated at 09:30 AM today.
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.modalDirBtn}>
                    <Navigation2 size={rf(13)} color={COLORS.DARK} strokeWidth={2.3} />
                    <Text style={styles.modalDirText}>Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setPriceModal(null);
                      navigation?.navigate(MANDI_ROUTES.DISTRICT_WISE_RATES);
                    }}
                    style={styles.modalCompareBtn}>
                    <BarChart3 size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.modalCompareText}>Compare Markets</Text>
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

  locCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locLabel: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  locName: {marginTop: 2, fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  locDotRow: {marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 4},
  locDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.DARK_GREEN},
  locSub: {fontSize: rf(9.5), fontWeight: '600', color: COLORS.DARK_GREEN},
  changeBtn: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {fontSize: rf(9.5), fontWeight: '900', color: COLORS.DARK},

  searchRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
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
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  head: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  headSub: {fontSize: rf(11), fontWeight: '600', color: COLORS.MUTED},

  mCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  mHead: {flexDirection: 'row', gap: 10, alignItems: 'flex-start'},
  mIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mNameRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  mName: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  nearestPill: {
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
  },
  nearestText: {fontSize: rf(8.5), fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5},
  mMetaRow: {marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6},
  mDist: {fontSize: rf(10.5), fontWeight: '600', color: COLORS.MUTED},
  openPill: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  openText: {fontSize: rf(8.5), fontWeight: '900', color: COLORS.DARK_GREEN},
  starRow: {flexDirection: 'row', gap: 1},

  mPricesBox: {marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#F8FAFC'},
  mPricesLabel: {
    fontSize: rf(9),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6},
  mPriceName: {fontSize: rf(11.5), fontWeight: '700', color: COLORS.DARK},
  mPriceVal: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK},
  mPriceUnit: {fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},
  mPriceDelta: {flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 6},

  mBtnRow: {marginTop: 12, flexDirection: 'row', gap: 8},
  viewPricesBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  viewPricesEmoji: {fontSize: rf(11)},
  viewPricesText: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},
  directionsBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  directionsText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},
  chevronBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapTitle: {marginTop: 4, fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  mapCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  mapImage: {height: 170, backgroundColor: '#E5E7EB', position: 'relative'},
  mapYouAre: {
    position: 'absolute',
    top: 12,
    left: 12,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mapDotBlue: {width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.BLUE},
  mapYouText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK},
  mapMarketsPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: COLORS.DARK_GREEN,
    justifyContent: 'center',
  },
  mapMarketsText: {fontSize: rf(10), fontWeight: '900', color: '#FFFFFF'},
  mapPin1: {position: 'absolute', top: 50, left: '35%'},
  mapPin2: {position: 'absolute', top: 100, left: '58%'},
  mapOpenBtn: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mapOpenText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},

  aiCard: {padding: 16, borderRadius: 16},
  aiHead: {flexDirection: 'row', alignItems: 'center', gap: 8},
  aiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: rf(10),
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  aiTitle: {
    marginTop: 10,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: rf(19),
  },
  aiDesc: {
    marginTop: 8,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },
  aiBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  aiBtnText: {fontSize: rf(11.5), fontWeight: '900', color: '#FFFFFF'},

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
  browseBtn: {
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
  browseText: {fontSize: rf(13.5), fontWeight: '900', color: '#FFFFFF'},

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  modalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  modalMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalMeta: {fontSize: rf(10.5), fontWeight: '600', color: COLORS.MUTED},
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRatingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalRatingText: {
    marginLeft: 6,
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  modalInfoCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoText: {
    flex: 1,
    fontSize: rf(11),
    fontWeight: '600',
    color: COLORS.DARK,
  },
  modalPricesHead: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalPricesTitle: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  modalPricesCount: {fontSize: rf(10.5), fontWeight: '600', color: COLORS.MUTED},
  modalPriceCard: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
  },
  modalPriceHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalPriceCropName: {
    fontSize: rf(13),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  modalDeltaPill: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  modalDeltaText: {fontSize: rf(10), fontWeight: '900'},
  modalPriceColsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 6,
  },
  modalPriceCol: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  modalPriceColActive: {backgroundColor: '#EAFBF0'},
  modalPriceColLabel: {
    fontSize: rf(9.5),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  modalPriceColVal: {
    marginTop: 3,
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  modalNoteRow: {
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalNoteText: {
    flex: 1,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
    fontStyle: 'italic',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalDirBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalDirText: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  modalCompareBtn: {
    flex: 1.4,
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