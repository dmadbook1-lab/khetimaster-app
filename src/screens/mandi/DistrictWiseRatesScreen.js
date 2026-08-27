import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Share2,
  Calendar,
  MapPin,
  Building2,
  Store,
  ChevronDown,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Lightbulb,
  Rocket,
  BarChart3,
  Check,
} from 'lucide-react-native';

import {COLORS, rf, PAGE_PADDING} from '../../components/mandi/theme';

const STATES = ['Maharashtra', 'Gujarat', 'Punjab', 'Karnataka', 'Uttar Pradesh', 'Madhya Pradesh'];
const DISTRICTS = {
  Maharashtra: ['Nashik', 'Pune', 'Yavatmal', 'Nagpur', 'Aurangabad', 'Mumbai', 'Kolhapur'],
  Gujarat: ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara'],
  Punjab: ['Amritsar', 'Ludhiana', 'Jalandhar'],
  Karnataka: ['Bangalore', 'Mysore', 'Hubli'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior'],
};
const MARKETS = {
  Nashik: ['Nashik Main APMC', 'Lasalgaon APMC', 'Pimpalgaon APMC'],
  Yavatmal: ['Yavatmal APMC', 'Darwha APMC', 'Pusad APMC'],
  Pune: ['Pune Market Yard', 'Manchar APMC'],
};

const FILTERS = ['All', 'Cotton', 'Soybean', 'Wheat'];

const COMMODITIES = [
  {
    id: 'c1',
    name: 'Onion',
    market: 'Nashik Main APMC',
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200',
    change: '+12.3%',
    up: true,
    min: '1,700',
    modal: '1,920',
    max: '2,100',
    delta: '+ 210 from yesterday',
  },
  {
    id: 'c2',
    name: 'Tomato',
    market: 'Nashik Main APMC',
    img: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200',
    change: '+7.9%',
    up: true,
    min: '2,200',
    modal: '2,450',
    max: '2,800',
    delta: '+ 180 from yesterday',
  },
  {
    id: 'c3',
    name: 'Cotton',
    market: 'Nashik Main APMC',
    img: 'https://images.unsplash.com/photo-1594213114663-d5b1a3f4c765?w=200',
    change: '-1.7%',
    up: false,
    min: '6,500',
    modal: '6,800',
    max: '7,200',
    delta: '- 120 from yesterday',
  },
  {
    id: 'c4',
    name: 'Wheat',
    market: 'Nashik Main APMC',
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a1ec21?w=200',
    change: '+2.1%',
    up: true,
    min: '2,050',
    modal: '2,150',
    max: '2,250',
    delta: '+ 45 from yesterday',
  },
];

export default function DistrictWiseRatesScreen({navigation}) {
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [market, setMarket] = useState('Nashik Main APMC');
  const [filter, setFilter] = useState('All');

  const [pickerType, setPickerType] = useState(null); // 'state' | 'district' | 'market'

  const openPicker = type => setPickerType(type);
  const closePicker = () => setPickerType(null);

  const getPickerData = () => {
    if (pickerType === 'state') return STATES;
    if (pickerType === 'district') return DISTRICTS[state] || [];
    if (pickerType === 'market') return MARKETS[district] || ['Main APMC'];
    return [];
  };

  const getPickerTitle = () => {
    if (pickerType === 'state') return 'Select State';
    if (pickerType === 'district') return 'Select District';
    if (pickerType === 'market') return 'Select Market (Mandi)';
    return '';
  };

  const onPickItem = value => {
    if (pickerType === 'state') {
      setState(value);
      const firstDistrict = (DISTRICTS[value] || [])[0];
      setDistrict(firstDistrict || '');
      setMarket((MARKETS[firstDistrict] || ['Main APMC'])[0]);
    } else if (pickerType === 'district') {
      setDistrict(value);
      setMarket((MARKETS[value] || ['Main APMC'])[0]);
    } else if (pickerType === 'market') {
      setMarket(value);
    }
    closePicker();
  };

  const getCurrentValue = () => {
    if (pickerType === 'state') return state;
    if (pickerType === 'district') return district;
    if (pickerType === 'market') return market;
    return '';
  };

  const filtered =
    filter === 'All' ? COMMODITIES : COMMODITIES.filter(c => c.name === filter);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.iconBtn}
          activeOpacity={0.8}>
          <ArrowLeft size={rf(18)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={styles.headerTitle}>District-wise Rates</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
          <Share2 size={rf(16)} color={COLORS.DARK} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSub}>
        Select your location to view today's mandi prices.
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Location Selection Card */}
        <View style={styles.selectCard}>
          <View style={styles.dateRow}>
            <Calendar size={rf(14)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            <Text style={styles.dateText}>Wednesday, 18 June 2025</Text>
            <View style={styles.todayPill}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          </View>

          {/* State */}
          <Text style={styles.label}>State</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dropdown}
            onPress={() => openPicker('state')}>
            <MapPin size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.dropdownText}>{state}</Text>
            <ChevronDown size={rf(14)} color={COLORS.MUTED} strokeWidth={2.4} />
          </TouchableOpacity>

          {/* District */}
          <Text style={styles.label}>District</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dropdown}
            onPress={() => openPicker('district')}>
            <Building2 size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.dropdownText}>{district}</Text>
            <ChevronDown size={rf(14)} color={COLORS.MUTED} strokeWidth={2.4} />
          </TouchableOpacity>

          {/* Market */}
          <Text style={styles.label}>Market (Mandi)</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.dropdown, styles.dropdownActive]}
            onPress={() => openPicker('market')}>
            <Store size={rf(14)} color="#FFFFFF" strokeWidth={2.3} />
            <Text style={[styles.dropdownText, {color: '#FFFFFF'}]}>
              {market}
            </Text>
            <ChevronDown size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Updated */}
        <View style={styles.updatedRow}>
          <View style={styles.updatedLeft}>
            <Clock size={rf(12)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.updatedText}>Last updated: Today, 9:42 AM</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.refreshBtn}>
            <RefreshCw size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
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

        {/* Prices Header */}
        <View style={styles.pricesHead}>
          <Text style={styles.pricesTitle}>Today's Prices</Text>
          <Text style={styles.pricesCount}>{filtered.length} Commodities</Text>
        </View>

        {/* Cards */}
        {filtered.map(c => (
          <View key={c.id} style={styles.cCard}>
            <View style={styles.cHead}>
              <Image source={{uri: c.img}} style={styles.cImg} />
              <View style={{flex: 1}}>
                <Text style={styles.cName}>{c.name}</Text>
                <Text style={styles.cMarket}>{c.market}</Text>
              </View>
              <View
                style={[
                  styles.cChangePill,
                  {backgroundColor: c.up ? '#EAFBF0' : '#FEE2E2'},
                ]}>
                {c.up ? (
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
                    styles.cChangeText,
                    {color: c.up ? COLORS.DARK_GREEN : COLORS.RED},
                  ]}>
                  {c.change}
                </Text>
              </View>
            </View>

            <View style={styles.cPricesRow}>
              <View style={styles.cPriceCol}>
                <Text style={styles.cPriceLabel}>Min</Text>
                <Text style={styles.cPriceVal}>₹{c.min}</Text>
              </View>
              <View style={[styles.cPriceCol, styles.cPriceColActive]}>
                <Text style={[styles.cPriceLabel, {color: COLORS.DARK_GREEN}]}>Modal</Text>
                <Text style={[styles.cPriceVal, {color: COLORS.DARK_GREEN}]}>₹{c.modal}</Text>
              </View>
              <View style={styles.cPriceCol}>
                <Text style={styles.cPriceLabel}>Max</Text>
                <Text style={styles.cPriceVal}>₹{c.max}</Text>
              </View>
            </View>

            <View style={styles.cDeltaRow}>
              {c.up ? (
                <TrendingUp size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
              ) : (
                <TrendingDown size={rf(11)} color={COLORS.RED} strokeWidth={2.4} />
              )}
              <Text
                style={[
                  styles.cDeltaText,
                  {color: c.up ? COLORS.DARK_GREEN : COLORS.RED},
                ]}>
                {c.delta}
              </Text>
            </View>
          </View>
        ))}

        {/* Market Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Market Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Layers size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
              <Text style={styles.summaryVal}>24</Text>
              <Text style={styles.summaryLabel}>Total Crops</Text>
              <Text style={styles.summarySub}>in this mandi</Text>
            </View>
            <View style={styles.summaryBox}>
              <Lightbulb size={rf(16)} color="#B45309" strokeWidth={2.3} />
              <Text style={styles.summaryVal}>₹6,800</Text>
              <Text style={styles.summaryLabel}>Highest Price</Text>
              <Text style={styles.summarySub}>Cotton</Text>
            </View>
            <View style={styles.summaryBox}>
              <Rocket size={rf(16)} color={COLORS.BLUE} strokeWidth={2.3} />
              <Text style={styles.summaryVal}>+12.3%</Text>
              <Text style={styles.summaryLabel}>Most Increased</Text>
              <Text style={styles.summarySub}>Onion Today</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation?.goBack()}
          style={styles.compareBtn}>
          <BarChart3 size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.compareText}>Compare Markets</Text>
        </TouchableOpacity>
      </View>

      {/* Picker Modal */}
      <Modal
        visible={!!pickerType}
        transparent
        animationType="slide"
        onRequestClose={closePicker}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={closePicker}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
            <FlatList
              data={getPickerData()}
              keyExtractor={item => item}
              renderItem={({item}) => {
                const selected = getCurrentValue() === item;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onPickItem(item)}
                    style={[styles.modalItem, selected && styles.modalItemActive]}>
                    <Text
                      style={[
                        styles.modalItemText,
                        selected && {color: COLORS.DARK_GREEN, fontWeight: '900'},
                      ]}>
                      {item}
                    </Text>
                    {selected && (
                      <Check size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.modalSep} />}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  headerTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  headerSub: {
    marginTop: 4,
    paddingHorizontal: PAGE_PADDING,
    textAlign: 'center',
    fontSize: rf(11),
    color: COLORS.MUTED,
    fontWeight: '500',
    marginBottom: 6,
  },

  selectCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  dateRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12},
  dateText: {flex: 1, fontSize: rf(12), fontWeight: '900', color: COLORS.DARK_GREEN},
  todayPill: {
    paddingHorizontal: 10,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  todayText: {fontSize: rf(9.5), fontWeight: '900', color: COLORS.DARK_GREEN},
  label: {marginTop: 8, marginBottom: 6, fontSize: rf(10.5), fontWeight: '700', color: COLORS.MUTED},
  dropdown: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownActive: {backgroundColor: COLORS.DARK_GREEN},
  dropdownText: {flex: 1, fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},

  updatedRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  updatedLeft: {flexDirection: 'row', alignItems: 'center', gap: 5},
  updatedText: {fontSize: rf(10.5), fontWeight: '600', color: COLORS.MUTED},
  refreshBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK_GREEN},

  chipsRow: {gap: 8, paddingVertical: 2},
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  chipActive: {backgroundColor: COLORS.DARK_GREEN, borderColor: COLORS.DARK_GREEN},
  chipText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},
  chipTextActive: {color: '#FFFFFF'},

  pricesHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  pricesTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  pricesCount: {fontSize: rf(11), fontWeight: '600', color: COLORS.MUTED},

  cCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  cImg: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9'},
  cName: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  cMarket: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},
  cChangePill: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cChangeText: {fontSize: rf(10), fontWeight: '900'},

  cPricesRow: {marginTop: 12, flexDirection: 'row', gap: 6},
  cPriceCol: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  cPriceColActive: {backgroundColor: '#EAFBF0'},
  cPriceLabel: {fontSize: rf(9.5), fontWeight: '700', color: COLORS.MUTED},
  cPriceVal: {marginTop: 3, fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK},

  cDeltaRow: {marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4},
  cDeltaText: {fontSize: rf(10.5), fontWeight: '900'},

  summaryCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  summaryTitle: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK, marginBottom: 12},
  summaryRow: {flexDirection: 'row', gap: 8},
  summaryBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    gap: 3,
  },
  summaryVal: {marginTop: 4, fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  summaryLabel: {fontSize: rf(9), fontWeight: '600', color: COLORS.MUTED, textAlign: 'center'},
  summarySub: {fontSize: rf(9), fontWeight: '900', color: COLORS.DARK, textAlign: 'center'},

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
    backgroundColor: COLORS.ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },
  compareText: {fontSize: rf(13.5), fontWeight: '900', color: '#FFFFFF'},

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemActive: {backgroundColor: '#F0FDF4'},
  modalItemText: {fontSize: rf(12.5), fontWeight: '600', color: COLORS.DARK},
  modalSep: {height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 20},
});