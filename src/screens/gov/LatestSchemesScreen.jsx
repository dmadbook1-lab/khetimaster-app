import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { COLORS, rf, PAGE_PADDING } from '../../components/gov/theme';
import { GOV_ROUTES } from '../../constants/govRoutes';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {tOpt} from '../../utils/tOpt';
const CHIPS = ['All', 'Central', 'State', 'Subsidies'];
const SCHEMES = [
  {
    id: 's1',
    name: 'PM-KISAN Samman Nidhi',
    get desc() {
    return i18n.t('latestSchemes.directIncomeSupportOf6');
  },
    icon: Users,
    iconBg: '#DCFCE7',
    iconColor: COLORS.DARK_GREEN,
    tags: [
      {
        get label() {
    return i18n.t('latestSchemes.central');
  },
        bg: '#DBEAFE',
        color: COLORS.BLUE,
      },
      {
        get label() {
    return i18n.t('latestSchemes.eligible');
  },
        bg: '#DCFCE7',
        color: COLORS.DARK_GREEN,
      },
    ],
  },
  {
    id: 's2',
    name: 'PM Fasal Bima Yojana',
    get desc() {
    return i18n.t('latestSchemes.cropInsuranceAgainstNaturalCalamities');
  },
    icon: Users,
    iconBg: '#FFEDD5',
    iconColor: COLORS.ORANGE,
    tags: [
      {
        get label() {
    return i18n.t('latestSchemes.insurance');
  },
        bg: '#DBEAFE',
        color: COLORS.BLUE,
      },
      {
        get label() {
    return i18n.t('latestSchemes.recommended');
  },
        bg: '#DCFCE7',
        color: COLORS.DARK_GREEN,
      },
    ],
  },
  {
    id: 's3',
    name: 'Kisan Credit Card',
    get desc() {
    return i18n.t('latestSchemes.lowInterestAgriculturalLoansAt');
  },
    icon: CreditCard,
    iconBg: '#FEF3C7',
    iconColor: COLORS.YELLOW,
    tags: [
      {
        get label() {
    return i18n.t('latestSchemes.loan');
  },
        bg: '#FFEDD5',
        color: COLORS.ORANGE,
      },
      {
        get label() {
    return i18n.t('latestSchemes.available');
  },
        bg: '#DCFCE7',
        color: COLORS.DARK_GREEN,
      },
    ],
  },
  {
    id: 's4',
    name: 'Soil Health Card Scheme',
    get desc() {
    return i18n.t('latestSchemes.freeSoilTestingRecommendations');
  },
    icon: Sprout,
    iconBg: '#DCFCE7',
    iconColor: COLORS.DARK_GREEN,
    tags: [
      {
        get label() {
    return i18n.t('latestSchemes.soil');
  },
        bg: '#FFEDD5',
        color: COLORS.ORANGE,
      },
      {
        get label() {
    return i18n.t('latestSchemes.available');
  },
        bg: '#DCFCE7',
        color: COLORS.DARK_GREEN,
      },
    ],
  },
  {
    id: 's5',
    name: 'PM Krishi Sinchai Yojana',
    get desc() {
    return i18n.t('latestSchemes.irrigationSubsidyWaterAccess');
  },
    icon: Droplet,
    iconBg: '#DBEAFE',
    iconColor: COLORS.BLUE,
    tags: [
      {
        get label() {
    return i18n.t('latestSchemes.subsidy');
  },
        bg: '#DBEAFE',
        color: COLORS.BLUE,
      },
      {
        get label() {
    return i18n.t('latestSchemes.available');
  },
        bg: '#DCFCE7',
        color: COLORS.DARK_GREEN,
      },
    ],
  },
  {
    id: 's6',
    name: 'Solar Pump Subsidy',
    get desc() {
    return i18n.t('latestSchemes.solarPoweredIrrigationSupport');
  },
    icon: Sun,
    iconBg: '#FFEDD5',
    iconColor: COLORS.ORANGE,
    tags: [
      {
        get label() {
    return i18n.t('latestSchemes.energy');
  },
        bg: '#FFEDD5',
        color: COLORS.ORANGE,
      },
      {
        get label() {
    return i18n.t('latestSchemes.new');
  },
        bg: '#FFE4E6',
        color: COLORS.RED,
      },
    ],
  },
];
export default function LatestSchemesScreen({ navigation }) {
  const {t} = useTranslation();
  const [chip, setChip] = useState('All');
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(18)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <Text style={styles.headerTitle}>{t('latestSchemes.latestAgricultureSchemes')}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <Bell size={rf(17)} color={COLORS.DARK} strokeWidth={2.4} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={rf(16)} color={COLORS.MUTED} strokeWidth={2.3} />
            <TextInput
              placeholder={t('latestSchemes.searchSchemes')}
              placeholderTextColor={COLORS.MUTED}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.filterBtn}>
            <SlidersHorizontal
              size={rf(16)}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        {}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CHIPS.map(c => {
            const active = chip === c;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.85}
                onPress={() => setChip(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {tOpt(c)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {}
        <View style={styles.popularHero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroPillOrange}>
              <Text style={styles.heroPillText}>{t('latestSchemes.mostPopular')}</Text>
            </View>
            <View style={styles.heroPillGreen}>
              <Text style={styles.heroPillText}>{t('latestSchemes.eligible2')}</Text>
            </View>
          </View>
          <Text style={styles.popularHeroTitle}>{t('latestSchemes.pmKisanSammanNidhi')}</Text>
          <Text style={styles.popularHeroDesc}>
            {t('latestSchemes.directIncomeSupportOf')}{'\n'}{t('latestSchemes.6000YearToAll')}{'\n'}
            {t('latestSchemes.landholdingFarmersAcross')}{'\n'}{t('latestSchemes.india')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {
                id: 's1',
              })
            }
            style={styles.popularHeroBtn}
          >
            <Text style={styles.popularHeroBtnText}>{t('latestSchemes.viewDetails')}</Text>
          </TouchableOpacity>

          {}
          <View style={styles.heroDecoIcon}>
            <AlertCircle
              size={rf(22)}
              color="rgba(255,255,255,0.4)"
              strokeWidth={2.4}
            />
          </View>
          <View style={styles.heroDecoBars}>
            <View
              style={[
                styles.heroBar,
                {
                  height: 30,
                },
              ]}
            />
            <View
              style={[
                styles.heroBar,
                {
                  height: 42,
                },
              ]}
            />
            <View
              style={[
                styles.heroBar,
                {
                  height: 20,
                },
              ]}
            />
            <View
              style={[
                styles.heroBar,
                {
                  height: 36,
                },
              ]}
            />
          </View>
        </View>

        {}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t('latestSchemes.allSchemes')}</Text>
          <Text style={styles.sectionCount}>{t('latestSchemes.schemes', {length: SCHEMES.length})}</Text>
        </View>

        {}
        {SCHEMES.map(s => {
          const Icon = s.icon;
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.9}
              onPress={() =>
                navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {
                  id: s.id,
                })
              }
              style={styles.sCard}
            >
              <View
                style={[
                  styles.sIcon,
                  {
                    backgroundColor: s.iconBg,
                  },
                ]}
              >
                <Icon size={rf(20)} color={s.iconColor} strokeWidth={2.3} />
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.sName}>{tOpt(s.name)}</Text>
                <Text style={styles.sDesc}>{s.desc}</Text>
                <View style={styles.sTagsRow}>
                  {s.tags.map((t, i) => (
                    <View
                      key={i}
                      style={[
                        styles.sTag,
                        {
                          backgroundColor: t.bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sTagText,
                          {
                            color: t.color,
                          },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <ChevronRight
                size={rf(16)}
                color={COLORS.MUTED}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          );
        })}

        {}
        <View style={styles.aiCard}>
          <View style={styles.aiHead}>
            <View style={styles.aiIconBox}>
              <Star
                size={rf(17)}
                color="#FFFFFF"
                strokeWidth={2.4}
                fill="#FFFFFF"
              />
            </View>
            <Text style={styles.aiTitle}>{t('latestSchemes.aiRecommendation')}</Text>
          </View>
          <Text style={styles.aiDesc}>
            {t('latestSchemes.basedOnYourFarmProfile')}
          </Text>
          <View style={styles.aiPillsRow}>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>{t('latestSchemes.pmKisan')}</Text>
            </View>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>{t('latestSchemes.pmfby')}</Text>
            </View>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>{t('latestSchemes.kisanCreditCard')}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate(GOV_ROUTES.ELIGIBILITY_CHECK)}
            style={styles.aiBtn}
          >
            <Text style={styles.aiBtnText}>{t('latestSchemes.checkEligibility')}</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 30,
    gap: 14,
  },
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
  headerTitle: {
    fontSize: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
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
  searchInput: {
    flex: 1,
    fontSize: rf(13),
    color: COLORS.DARK,
    padding: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    height: 38,
    paddingHorizontal: 20,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.DARK_GREEN,
    borderColor: COLORS.DARK_GREEN,
  },
  chipText: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  popularHero: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.DARK_GREEN,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 260,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: 6,
  },
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
  heroPillText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
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
  popularHeroBtnText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: COLORS.DARK,
  },
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
  sectionTitle: {
    fontSize: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  sectionCount: {
    fontSize: rf(12),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
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
  sName: {
    fontSize: rf(14.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  sDesc: {
    marginTop: 5,
    fontSize: rf(12),
    fontWeight: '500',
    color: COLORS.MUTED,
    lineHeight: rf(16),
  },
  sTagsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 6,
  },
  sTag: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sTagText: {
    fontSize: rf(10.5),
    fontWeight: '900',
  },
  aiCard: {
    marginTop: 6,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  aiHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: rf(15.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  aiDesc: {
    marginTop: 12,
    fontSize: rf(13),
    fontWeight: '500',
    color: COLORS.DARK,
    lineHeight: rf(18),
  },
  aiPillsRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiPill: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.DARK_GREEN,
    justifyContent: 'center',
  },
  aiPillText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtnText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
