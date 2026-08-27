import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Bell,
  Calendar,
  Sun,
  Check,
  ArrowRight,
} from 'lucide-react-native';

import ScreenHeader from '../../components/mandi/ScreenHeader';
import CreatePriceAlertModal from './CreatePriceAlertModal';
import {COLORS, rf, PAGE_PADDING} from '../../components/mandi/theme';

const ACTIVE = [
  {id: 'a1', crop: 'Wheat', market: 'Azadpur Mandi, Delhi', target: '2,400', current: '2,180', active: true, dir: 'Above'},
  {id: 'a2', crop: 'Soybean', market: 'Indore Mandi, MP', target: '5,200', current: '5,350', active: true, dir: 'Above'},
  {id: 'a3', crop: 'Cotton', market: 'Rajkot Mandi, Gujarat', target: '6,800', current: '6,420', active: false, dir: 'Above'},
];

const TRIGGERED = [
  {id: 't1', crop: 'Rice', market: 'Patna Mandi, Bihar', price: '3,650', delta: '+4.2%', date: '12 Jun 2025'},
  {id: 't2', crop: 'Onion', market: 'Lasalgaon Mandi, MH', price: '1,900', delta: '+7.8%', date: '10 Jun 2025'},
];

export default function PriceAlertsScreen({navigation}) {
  const [alerts, setAlerts] = useState(ACTIVE);
  const [modalOpen, setModalOpen] = useState(false);

  const toggle = id =>
    setAlerts(prev => prev.map(a => (a.id === id ? {...a, active: !a.active} : a)));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScreenHeader
        title="Price Alerts"
        subtitle="Get notified when crop prices reach your target."
        onBack={() => navigation?.goBack()}
        rightIcon={SlidersHorizontal}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={['#158B3D', '#0F6D2E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <View style={styles.heroLabelRow}>
            <View style={styles.heroDotRing}><View style={styles.heroDotInner} /></View>
            <Text style={styles.heroLabel}>SMART ALERTS</Text>
          </View>
          <Text style={styles.heroTitle}>Smart Price Alerts</Text>
          <Text style={styles.heroSub}>
            Never miss the perfect selling moment. Set your target and we'll alert you instantly.
          </Text>
          <TouchableOpacity activeOpacity={0.9} style={styles.createBtn} onPress={() => setModalOpen(true)}>
            <Plus size={rf(14)} color={COLORS.DARK_GREEN} strokeWidth={2.5} />
            <Text style={styles.createText}>Create Alert</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Active Alerts */}
        <View style={styles.headRow}>
          <View>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            <Text style={styles.sectionSub}>{alerts.length} alerts running</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {alerts.map(a => (
          <View key={a.id} style={styles.alertCard}>
            <View style={styles.alertHead}>
              <View style={styles.cropIcon}>
                <Text style={{fontSize: rf(15)}}>📖</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.alertCrop}>{a.crop}</Text>
                <Text style={styles.alertMarket}>{a.market}</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ACTIVE</Text>
              </View>
              <Switch
                value={a.active}
                onValueChange={() => toggle(a.id)}
                trackColor={{false: '#CBD5E1', true: COLORS.DARK_GREEN}}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Target Price</Text>
                <Text style={styles.priceValueGreen}>₹{a.target}</Text>
                <Text style={styles.priceSub}>Notify {a.dir}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Current Price</Text>
                <Text style={styles.priceValueDark}>₹{a.current}</Text>
                <Text style={styles.priceSub}>Per Quintal</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity activeOpacity={0.85} style={styles.editBtn}>
                <Pencil size={rf(12)} color={COLORS.DARK} strokeWidth={2.4} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={styles.delBtn}>
                <Trash2 size={rf(12)} color={COLORS.RED} strokeWidth={2.4} />
                <Text style={styles.delText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Triggered Alerts */}
        <View style={styles.headRow}>
          <View>
            <Text style={styles.sectionTitle}>Triggered Alerts</Text>
            <Text style={styles.sectionSub}>Recent activity</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>History</Text>
          </TouchableOpacity>
        </View>

        {TRIGGERED.map(t => (
          <View key={t.id} style={styles.tCard}>
            <View style={styles.tHead}>
              <View style={styles.tIcon}>
                <Bell size={rf(14)} color={COLORS.ORANGE} strokeWidth={2.3} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.tCrop}>{t.crop}</Text>
                <Text style={styles.tMarket}>{t.market}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.tPrice}>₹{t.price}</Text>
                <Text style={styles.tDelta}>{t.delta}</Text>
              </View>
            </View>

            <View style={styles.tFooter}>
              <View style={styles.tDateRow}>
                <Calendar size={rf(10)} color={COLORS.MUTED} strokeWidth={2.3} />
                <Text style={styles.tDate}>{t.date}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85} style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* AI Recommendation */}
        <View style={styles.aiCard}>
          <View style={styles.aiHead}>
            <View style={styles.aiIcon}>
              <Sun size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.aiTitle}>AI Recommendation</Text>
              <Text style={styles.aiSub}>Based on market trends</Text>
            </View>
            <View style={styles.newPill}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          </View>

          <Text style={styles.aiBody}>
            Wheat prices are expected to rise 8–12% over the next 2 weeks based on seasonal demand. Ideal target:
          </Text>

          <View style={styles.targetRow}>
            <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>Min Target</Text>
              <Text style={styles.targetValGreen}>₹2,350</Text>
            </View>
            <ArrowRight size={rf(14)} color={COLORS.MUTED} strokeWidth={2.4} />
            <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>Max Target</Text>
              <Text style={styles.targetValOrange}>₹2,620</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.applyBtn}>
            <Check size={rf(14)} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={styles.applyText}>Apply Suggestion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Alert Modal */}
      <CreatePriceAlertModal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scroll: {padding: PAGE_PADDING, paddingBottom: 40, gap: 14},

  hero: {padding: 20, borderRadius: 20},
  heroLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  heroDotRing: {width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center'},
  heroDotInner: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF'},
  heroLabel: {fontSize: rf(10.5), fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5},
  heroTitle: {marginTop: 10, fontSize: rf(20), fontWeight: '900', color: '#FFFFFF'},
  heroSub: {marginTop: 8, fontSize: rf(11.5), lineHeight: rf(16.5), fontWeight: '500', color: 'rgba(255,255,255,0.9)'},
  createBtn: {marginTop: 16, alignSelf: 'flex-start', height: 42, paddingHorizontal: 18, borderRadius: 21, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6},
  createText: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK_GREEN},

  headRow: {marginTop: 6, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'},
  sectionTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  sectionSub: {marginTop: 2, fontSize: rf(10.5), fontWeight: '600', color: COLORS.MUTED},
  seeAll: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},

  alertCard: {padding: 14, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER},
  alertHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  cropIcon: {width: 38, height: 38, borderRadius: 10, backgroundColor: '#EAFBF0', alignItems: 'center', justifyContent: 'center'},
  alertCrop: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK},
  alertMarket: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},
  activePill: {height: 22, paddingHorizontal: 8, borderRadius: 4, backgroundColor: '#EAFBF0', justifyContent: 'center'},
  activePillText: {fontSize: rf(9), fontWeight: '900', color: COLORS.DARK_GREEN, letterSpacing: 0.5},

  priceRow: {marginTop: 12, flexDirection: 'row', gap: 10},
  priceBox: {flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#F8FAFC'},
  priceLabel: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  priceValueGreen: {marginTop: 4, fontSize: rf(16), fontWeight: '900', color: COLORS.DARK_GREEN},
  priceValueDark: {marginTop: 4, fontSize: rf(16), fontWeight: '900', color: COLORS.DARK},
  priceSub: {marginTop: 2, fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},

  actionRow: {marginTop: 12, flexDirection: 'row', gap: 8},
  editBtn: {flex: 1, height: 38, borderRadius: 19, borderWidth: 1, borderColor: COLORS.BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5},
  editText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK},
  delBtn: {flex: 1, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5},
  delText: {fontSize: rf(11), fontWeight: '900', color: COLORS.RED},

  tCard: {padding: 14, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER},
  tHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  tIcon: {width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center'},
  tCrop: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  tMarket: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},
  tPrice: {fontSize: rf(14), fontWeight: '900', color: COLORS.ORANGE},
  tDelta: {marginTop: 2, fontSize: rf(10), fontWeight: '900', color: COLORS.ORANGE},
  tFooter: {marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  tDateRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  tDate: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  viewDetailsBtn: {height: 32, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.BORDER, justifyContent: 'center'},
  viewDetailsText: {fontSize: rf(10.5), fontWeight: '900', color: COLORS.DARK},

  aiCard: {padding: 16, borderRadius: 16, backgroundColor: '#F0FBF3', borderWidth: 1, borderColor: '#BBF0CC'},
  aiHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  aiIcon: {width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.DARK_GREEN, alignItems: 'center', justifyContent: 'center'},
  aiTitle: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK_GREEN},
  aiSub: {marginTop: 2, fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},
  newPill: {height: 22, paddingHorizontal: 10, borderRadius: 11, backgroundColor: COLORS.DARK_GREEN, justifyContent: 'center'},
  newText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5},
  aiBody: {marginTop: 12, fontSize: rf(11.5), lineHeight: rf(17), fontWeight: '500', color: COLORS.DARK},

  targetRow: {marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8},
  targetBox: {flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.BORDER},
  targetLabel: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  targetValGreen: {marginTop: 4, fontSize: rf(15), fontWeight: '900', color: COLORS.DARK_GREEN},
  targetValOrange: {marginTop: 4, fontSize: rf(15), fontWeight: '900', color: COLORS.ORANGE},

  applyBtn: {marginTop: 14, height: 50, borderRadius: 25, backgroundColor: COLORS.DARK_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6},
  applyText: {fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},
});