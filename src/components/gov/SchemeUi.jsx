import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import MarketHero, {TopInset} from '../market/MarketHero';
import {MARKET_SHADOW} from '../market/theme';
import {catLabel, levelLabel} from '../../utils/schemeLabels';
import {
  ChevronRight,
  Users,
  Shield,
  CreditCard,
  Sprout,
  Droplet,
  Sun,
  Wallet,
  Store,
  Warehouse,
  Tractor,
  Fish,
  Factory,
  Leaf,
} from 'lucide-react-native';
import {COLORS, rf, PAGE_PADDING} from './theme';

const ICONS = {
  users: Users,
  shield: Shield,
  credit: CreditCard,
  sprout: Sprout,
  droplet: Droplet,
  sun: Sun,
  wallet: Wallet,
  store: Store,
  warehouse: Warehouse,
  tractor: Tractor,
  fish: Fish,
  factory: Factory,
  leaf: Leaf,
};

const PALETTE = {
  green: {bg: '#DCFCE7', fg: COLORS.DARK_GREEN},
  orange: {bg: '#FFEDD5', fg: COLORS.ORANGE},
  blue: {bg: '#DBEAFE', fg: COLORS.BLUE},
  yellow: {bg: '#FEF3C7', fg: COLORS.YELLOW},
  purple: {bg: '#F3E8FF', fg: COLORS.PURPLE},
};

export const STATUS_STYLE = {
  eligible: {bg: '#DCFCE7', fg: COLORS.DARK_GREEN, key: 'govUi.statusEligible'},
  maybe: {bg: '#FEF3C7', fg: '#B45309', key: 'govUi.statusMaybe'},
  not_eligible: {bg: '#FEE2E2', fg: COLORS.RED, key: 'govUi.statusNotEligible'},
};

export function SchemeIcon({scheme, size = 40}) {
  const Icon = ICONS[scheme.icon] || Users;
  const c = PALETTE[scheme.color] || PALETTE.green;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 3.2,
        backgroundColor: c.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon size={size * 0.45} color={c.fg} strokeWidth={2.3} />
    </View>
  );
}

export function Pill({label, bg, fg}) {
  return (
    <View style={[styles.pill, {backgroundColor: bg}]}>
      <Text style={[styles.pillText, {color: fg}]}>{label}</Text>
    </View>
  );
}

export function StatusPill({status}) {
  const {t} = useTranslation();
  const s = STATUS_STYLE[status];
  return s ? <Pill label={t(s.key)} bg={s.bg} fg={s.fg} /> : null;
}

export function SchemeRow({scheme, status, onPress}) {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.row}>
      <SchemeIcon scheme={scheme} />
      <View style={{flex: 1}}>
        <Text style={styles.rowName}>{scheme.name}</Text>
        <Text style={styles.rowDesc} numberOfLines={2}>
          {scheme.desc}
        </Text>
        <View style={styles.tagRow}>
          <Pill label={levelLabel(t, scheme.level)} bg="#DBEAFE" fg={COLORS.BLUE} />
          <Pill label={catLabel(t, scheme)} bg="#FFEDD5" fg={COLORS.ORANGE} />
          {status ? <StatusPill status={status} /> : null}
        </View>
      </View>
      <ChevronRight size={rf(16)} color={COLORS.MUTED} strokeWidth={2.4} />
    </TouchableOpacity>
  );
}

// Same green hero as the Labour / Machinery screens, compact for inner pages.
export function ScreenHeader({title, onBack}) {
  return <MarketHero compact title={title} onBack={onBack} />;
}

export function Screen({children}) {
  return (
    <View style={styles.safe}>
      <TopInset />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

export const formatDate = (iso, lang = 'en') => {
  try {
    const locale = lang.startsWith('hi') ? 'hi-IN' : lang.startsWith('mr') ? 'mr-IN' : 'en-IN';
    return new Date(iso).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.PAGE_BG},
  flex: {flex: 1},
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  row: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    ...MARKET_SHADOW,
  },
  rowName: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  rowDesc: {
    marginTop: 3,
    fontSize: rf(12),
    fontWeight: '500',
    color: COLORS.MUTED,
    lineHeight: rf(16),
  },
  tagRow: {marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  pill: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
  },
  pillText: {fontSize: rf(10.5), fontWeight: '900'},
});
