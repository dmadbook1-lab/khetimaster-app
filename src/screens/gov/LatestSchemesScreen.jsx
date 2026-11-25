import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {Search, ArrowRight} from 'lucide-react-native';
import {COLORS, rf, PAGE_PADDING} from '../../components/gov/theme';
import {
  Screen,
  ScreenHeader,
  SchemeRow,
} from '../../components/gov/SchemeUi';
import {GOV_ROUTES} from '../../constants/govRoutes';
import {GOV_SCHEMES, SCHEME_CATEGORIES} from '../../data/govSchemes';
import {catLabelFromKey} from '../../utils/schemeLabels';
import {useGovData} from '../../utils/useGovData';
import {useTranslation} from 'react-i18next';

const ALL = 'All';
const ELIGIBLE = 'Eligible for me';

export default function LatestSchemesScreen({navigation, route}) {
  const {t} = useTranslation();
  const [chip, setChip] = useState(ALL);
  const [query, setQuery] = useState(route?.params?.query || '');
  const {hasProfile, statusOf} = useGovData();

  const chips = useMemo(() => {
    const used = SCHEME_CATEGORIES.filter(c =>
      GOV_SCHEMES.some(s => (s.categoryKey || s.category) === c),
    );
    return [ALL, ...(hasProfile ? [ELIGIBLE] : []), ...used];
  }, [hasProfile]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GOV_SCHEMES.filter(s => {
      if (chip === ELIGIBLE && statusOf(s.id) !== 'eligible') {
        return false;
      }
      if (chip !== ALL && chip !== ELIGIBLE && (s.categoryKey || s.category) !== chip) {
        return false;
      }
      if (!q) {
        return true;
      }
      return `${s.name} ${s.desc} ${s.category} ${s.categoryKey || ''}`
        .toLowerCase()
        .includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chip, query, hasProfile, statusOf, GOV_SCHEMES.length]);

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader
        title={t('govUi.browseTitle')}
        onBack={() => navigation?.goBack()}
      />

      <View style={styles.searchBox}>
        <Search size={rf(16)} color={COLORS.MUTED} strokeWidth={2.4} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('govUi.searchPlaceholder')}
          placeholderTextColor={COLORS.MUTED}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {chips.map(c => {
            const on = c === chip;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.85}
                onPress={() => setChip(c)}
                style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {c === ALL ? t('govUi.all') : c === ELIGIBLE ? t('govUi.eligibleForMe') : catLabelFromKey(t, c)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {!hasProfile && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate(GOV_ROUTES.ELIGIBILITY_CHECK)}
            style={styles.banner}>
            <Text style={styles.bannerText}>
              {t('govUi.answerFewQuestions')}
            </Text>
            <ArrowRight size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        {list.length === 0 ? (
          <Text style={styles.empty}>{t('govUi.noMatch')}</Text>
        ) : (
          list.map(s => (
            <SchemeRow
              key={s.id}
              scheme={s}
              status={statusOf(s.id)}
              onPress={() =>
                navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {id: s.id})
              }
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    marginHorizontal: PAGE_PADDING,
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: rf(13.5),
    color: COLORS.DARK,
    paddingVertical: 0,
  },
  chipsWrap: {height: 52},
  chips: {
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  chipOn: {backgroundColor: COLORS.DARK_GREEN, borderColor: COLORS.DARK_GREEN},
  chipText: {fontSize: rf(12.5), fontWeight: '800', color: COLORS.DARK},
  chipTextOn: {color: '#FFFFFF'},
  scroll: {padding: PAGE_PADDING, paddingTop: 4, paddingBottom: 30, gap: 10},
  banner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: rf(12.5),
    fontWeight: '700',
    color: COLORS.DARK_GREEN,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
});
