// GovernmentSchemesScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Bell,
  ArrowRight,
  Users,
  Wallet,
  CreditCard,
  ChevronRight,
  Sprout,
  Droplet,
  Megaphone,
  Landmark,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react-native';

import {COLORS, rf, PAGE_PADDING} from '../../components/gov/theme';
import {GOV_ROUTES} from '../../constants/govRoutes';

const RECOMMENDED = [
  {
    id: 'r1',
    name: 'PM-KISAN',
    desc: 'Income Support for\nFarmers',
    status: 'Eligible',
    statusBg: '#DCFCE7',
    statusColor: COLORS.DARK_GREEN,
    cta: 'Apply Now',
    icon: Users,
    iconBg: '#DCFCE7',
    iconColor: COLORS.DARK_GREEN,
  },
  {
    id: 'r2',
    name: 'PM Fasal Bima\nYojana',
    desc: 'Crop Insurance\nScheme',
    status: 'New',
    statusBg: '#FFF7ED',
    statusColor: COLORS.ORANGE,
    cta: 'View Details',
    icon: Users,
    iconBg: '#FFEDD5',
    iconColor: COLORS.ORANGE,
  },
  {
    id: 'r3',
    name: 'Kisan Credit\nCard',
    desc: 'Low Interest Farm Loan',
    status: 'Recommended',
    statusBg: '#DBEAFE',
    statusColor: COLORS.BLUE,
    cta: 'Apply Now',
    icon: CreditCard,
    iconBg: '#DBEAFE',
    iconColor: COLORS.BLUE,
  },
];

const POPULAR = [
  {id: 'p1', name: 'PM-Kisan Samman Nidhi', desc: 'Income support of ₹6,000...', icon: Wallet, bg: '#DCFCE7', color: COLORS.DARK_GREEN},
  {id: 'p2', name: 'PM Fasal Bima Yojana', desc: 'Crop insurance scheme for...', icon: Users, bg: '#FFEDD5', color: COLORS.ORANGE},
  {id: 'p3', name: 'Kisan Credit Card (KCC)', desc: 'Easy credit for farmers at...', icon: CreditCard, bg: '#DBEAFE', color: COLORS.BLUE},
  {id: 'p4', name: 'Soil Health Card Scheme', desc: 'Improve soil health and...', icon: Sprout, bg: '#F3E8FF', color: COLORS.PURPLE},
  {id: 'p5', name: 'PM Krishi Sinchai Yojana', desc: 'Financial assistance for...', icon: Droplet, bg: '#DBEAFE', color: COLORS.BLUE},
];

export default function GovernmentSchemesScreen({navigation}) {
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
          <Text style={styles.headerTitle}>Government Schemes</Text>
          <Text style={styles.headerSub}>सरकारी योजनाएं</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <Bell size={rf(17)} color={COLORS.DARK} strokeWidth={2.4} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Hero Banner */}
        <ImageBackground
          source={require('../../assets/gov/hero.png')}
          style={styles.hero}
          imageStyle={styles.heroImg}>
          <LinearGradient
            colors={['rgba(6,78,32,0.95)', 'rgba(17,111,52,0.7)', 'rgba(17,111,52,0.1)']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.heroGrad}>
            <View style={styles.heroIconBox}>
              <Landmark size={rf(20)} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <Text style={styles.heroTitle}>Government{'\n'}Assistance Hub</Text>
            <Text style={styles.heroDesc}>
              Discover agricultural schemes,{'\n'}subsidies, insurance and financial{'\n'}support for your farm.
            </Text>

            <View style={styles.heroBtnRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation?.navigate(GOV_ROUTES.ELIGIBILITY_CHECK)}
                style={styles.heroCheckBtn}>
                <Text style={styles.heroCheckText}>Check Eligibility</Text>
                <ArrowRight size={rf(14)} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation?.navigate('LatestSchemes')}
                style={styles.heroBrowseBtn}>
                <Text style={styles.heroBrowseText}>Browse Schemes</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Recommended For You */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.navigate(GOV_ROUTES.LATEST_SCHEMES)}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recRow}>
          {RECOMMENDED.map(r => {
            const Icon = r.icon;
            return (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.9}
                onPress={() => navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {id: r.id})}
                style={styles.recCard}>
                <View style={[styles.recIcon, {backgroundColor: r.iconBg}]}>
                  <Icon size={rf(17)} color={r.iconColor} strokeWidth={2.3} />
                </View>
                <Text style={styles.recName}>{r.name}</Text>
                <Text style={styles.recDesc}>{r.desc}</Text>
                <View style={[styles.recStatus, {backgroundColor: r.statusBg}]}>
                  {r.status === 'Eligible' && (
                    <CheckCircle2
                      size={rf(12)}
                      color={r.statusColor}
                      strokeWidth={2.4}
                    />
                  )}
                  <Text style={[styles.recStatusText, {color: r.statusColor}]}>
                    {r.status}
                  </Text>
                </View>
                <View style={styles.recDivider} />
                <View style={styles.recCtaRow}>
                  <Text style={styles.recCtaText}>{r.cta}</Text>
                  <ArrowRight size={rf(12)} color={COLORS.DARK} strokeWidth={2.4} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Popular Schemes */}
        <Text style={[styles.sectionTitle, {marginTop: 6}]}>Popular Schemes</Text>
        <View style={styles.popularCard}>
          {POPULAR.map((p, i) => {
            const Icon = p.icon;
            return (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.85}
                onPress={() => navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {id: p.id})}
                style={[
                  styles.popRow,
                  i !== POPULAR.length - 1 && styles.popRowBorder,
                ]}>
                <View style={[styles.popIcon, {backgroundColor: p.bg}]}>
                  <Icon size={rf(16)} color={p.color} strokeWidth={2.3} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.popName}>{p.name}</Text>
                  <Text style={styles.popDesc}>{p.desc}</Text>
                </View>
                <ChevronRight size={rf(16)} color={COLORS.MUTED} strokeWidth={2.4} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Latest Updates */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.updatesRow}>
          {/* Update 1 - PM Kisan */}
          <View style={[styles.updateCard, {backgroundColor: '#F0FDF4'}]}>
            <View style={styles.updatePillRow}>
              <View style={[styles.updateIconSm, {backgroundColor: COLORS.DARK_GREEN}]}>
                <Megaphone size={rf(12)} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={[styles.updatePill, {backgroundColor: '#DCFCE7'}]}>
                <Text style={[styles.updatePillText, {color: COLORS.DARK_GREEN}]}>
                  PM-KISAN
                </Text>
              </View>
            </View>
            <Text style={styles.updateTitle}>15th Installment Released</Text>
            <Text style={styles.updateDesc}>₹2,000 credited to farmers'{'\n'}bank accounts.</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.updateLink}>Read More →</Text>
            </TouchableOpacity>
            <Image
              source={require('../../assets/gov/pmkisan.png')}
              style={styles.updateImg}
              resizeMode="contain"
            />
          </View>

          {/* Update 2 - Solar Pump */}
          <View style={[styles.updateCard, {backgroundColor: '#EFF6FF'}]}>
            <View style={styles.updatePillRow}>
              <View style={[styles.updateIconSm, {backgroundColor: COLORS.BLUE}]}>
                <Landmark size={rf(12)} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={[styles.updatePill, {backgroundColor: '#DBEAFE'}]}>
                <Text style={[styles.updatePillText, {color: COLORS.BLUE}]}>
                  NEW SUBSIDY
                </Text>
              </View>
            </View>
            <Text style={styles.updateTitle}>Solar Pump Subsidy</Text>
            <Text style={styles.updateDesc}>Up to 90% subsidy for solar{'\n'}pump installation.</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={[styles.updateLink, {color: COLORS.BLUE}]}>Read More →</Text>
            </TouchableOpacity>
            <Image
              source={require('../../assets/gov/solar.png')}
              style={styles.updateImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* My Applications Overview */}
        <View style={styles.appCard}>
          <View style={styles.appHead}>
            <View style={styles.appIconBox}>
              <FolderOpen size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.appTitle}>My Applications Overview</Text>
              <Text style={styles.appDesc}>Track all your scheme applications in one place</Text>
            </View>
          </View>

          <View style={styles.appStatsRow}>
            <View style={styles.appStat}>
              <Text style={[styles.appStatVal, {color: COLORS.DARK}]}>2</Text>
              <View style={styles.appStatUnderline} />
              <Text style={styles.appStatLabel}>APPROVED</Text>
            </View>
            <View style={styles.appStat}>
              <Text style={[styles.appStatVal, {color: COLORS.ORANGE}]}>1</Text>
              <Text style={styles.appStatLabel}>UNDER REVIEW</Text>
            </View>
            <View style={styles.appStat}>
              <Text style={[styles.appStatVal, {color: COLORS.RED}]}>0</Text>
              <Text style={styles.appStatLabel}>REJECTED</Text>
            </View>
            <ChevronRight size={rf(16)} color={COLORS.MUTED} strokeWidth={2.4} />
          </View>

          <View style={styles.appDivider} />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation?.navigate(GOV_ROUTES.MY_APPLICATIONS)}
            style={styles.trackBtn}>
            <Text style={styles.trackText}>Track All Applications →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  scroll: {padding: PAGE_PADDING, paddingBottom: 30, gap: 16},

  header: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.PAGE_BG,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},
  headerTitle: {fontSize: rf(17), fontWeight: '900', color: COLORS.DARK},
  headerSub: {marginTop: 2, fontSize: rf(11), fontWeight: '500', color: COLORS.MUTED},

  // Hero
  hero: {minHeight: 230, borderRadius: 16, overflow: 'hidden'},
  heroImg: {borderRadius: 16},
  heroGrad: {flex: 1, padding: 18, justifyContent: 'space-between', minHeight: 230},
  heroIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 8,
    fontSize: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: rf(28),
  },
  heroDesc: {
    marginTop: 8,
    fontSize: rf(12),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    lineHeight: rf(17),
  },
  heroBtnRow: {marginTop: 14, flexDirection: 'row', gap: 8},
  heroCheckBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCheckText: {fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},
  heroBrowseBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrowseText: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK_GREEN},

  // Sections
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {fontSize: rf(17), fontWeight: '900', color: COLORS.DARK},
  viewAll: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK_GREEN},

  // Recommended - increased card height
  recRow: {gap: 10, paddingRight: 10, paddingVertical: 2},
  recCard: {
    width: 180,
    minHeight: 200,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  recIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recName: {marginTop: 12, fontSize: rf(14), fontWeight: '900', color: COLORS.DARK, lineHeight: rf(18)},
  recDesc: {marginTop: 6, fontSize: rf(11.5), fontWeight: '500', color: COLORS.MUTED, lineHeight: rf(15)},
  recStatus: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recStatusText: {fontSize: rf(11), fontWeight: '900'},
  recDivider: {marginTop: 12, height: 1, backgroundColor: COLORS.BORDER},
  recCtaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recCtaText: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK},

  // Popular
  popularCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  popRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  popRowBorder: {borderBottomWidth: 1, borderBottomColor: COLORS.BORDER},
  popIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popName: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  popDesc: {marginTop: 3, fontSize: rf(12), fontWeight: '500', color: COLORS.MUTED},

  // Updates - increased min height
  updatesRow: {flexDirection: 'row', gap: 10},
  updateCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    minHeight: 210,
    overflow: 'hidden',
    position: 'relative',
  },
  updatePillRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  updateIconSm: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatePill: {paddingHorizontal: 8, height: 22, borderRadius: 4, justifyContent: 'center'},
  updatePillText: {fontSize: rf(10), fontWeight: '900', letterSpacing: 0.5},
  updateTitle: {
    marginTop: 12,
    fontSize: rf(14),
    fontWeight: '900',
    color: COLORS.DARK,
    lineHeight: rf(18),
  },
  updateDesc: {marginTop: 6, fontSize: rf(11.5), fontWeight: '500', color: COLORS.MUTED, lineHeight: rf(15)},
  updateLink: {marginTop: 10, fontSize: rf(12), fontWeight: '900', color: COLORS.DARK_GREEN},
  updateImg: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 64,
    height: 64,
  },

  // Applications
  appCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  appHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  appIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  appDesc: {marginTop: 3, fontSize: rf(11.5), fontWeight: '500', color: COLORS.MUTED, lineHeight: rf(15)},

  appStatsRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appStat: {flex: 1, alignItems: 'center'},
  appStatVal: {fontSize: rf(22), fontWeight: '900'},
  appStatUnderline: {marginTop: 3, width: 28, height: 2, backgroundColor: COLORS.DARK, borderRadius: 1},
  appStatLabel: {marginTop: 5, fontSize: rf(9.5), fontWeight: '900', color: COLORS.MUTED, letterSpacing: 0.5},

  appDivider: {marginTop: 16, height: 1, backgroundColor: COLORS.BORDER},
  trackBtn: {
    marginTop: 14,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackText: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK_GREEN},
});