import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  ArrowRight,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  Search,
  ShieldCheck,
  Lock,
  BadgeCheck,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import MarketHero, {GlassButton, TopInset} from '../../components/market/MarketHero';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
  MARKET_SHADOW_STRONG,
} from '../../components/market/theme';
import {SchemeIcon, StatusPill, formatDate} from '../../components/gov/SchemeUi';
import {GOV_ROUTES} from '../../constants/govRoutes';
import {GOV_SCHEMES} from '../../data/govSchemes';
import {useGovData} from '../../utils/useGovData';
import {refreshSchemes, useSchemeStats} from '../../utils/schemeStore';
import {catLabelFromKey} from '../../utils/schemeLabels';

const HERO = require('../../assets/gov/hero.png');

export default function GovernmentSchemesScreen({navigation}) {
  const {t, i18n} = useTranslation();
  const {hasProfile, results, applications} = useGovData();
  const stats = useSchemeStats();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const all = GOV_SCHEMES;
  const popular = all.filter(x => x.popular);
  const recommended = hasProfile
    ? results.filter(r => r.status === 'eligible').slice(0, 6)
    : popular.slice(0, 3).map(scheme => ({scheme, status: null}));
  const eligibleCount = hasProfile
    ? results.filter(r => r.status === 'eligible').length
    : null;
  const countOf = st => applications.filter(a => a.status === st).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshSchemes(true);
    setRefreshing(false);
  };

  const go = (route, params) => navigation?.navigate(route, params);
  const search = () => go(GOV_ROUTES.LATEST_SCHEMES, {query: query.trim()});
  const maxCat = Math.max(1, ...(stats?.byCategory || []).map(c => c.count));

  const tiles = [
    {
      key: 'browse',
      Icon: BookOpen,
      bg: C.lightGreen,
      fg: C.green,
      title: t('govUi.tileBrowse'),
      sub: t('govUi.tileBrowseSub'),
      route: GOV_ROUTES.LATEST_SCHEMES,
    },
    {
      key: 'elig',
      Icon: CheckCircle2,
      bg: C.lightBlue,
      fg: C.blue,
      title: t('govUi.tileEligibility'),
      sub: t('govUi.tileEligibilitySub'),
      route: GOV_ROUTES.ELIGIBILITY_CHECK,
    },
    {
      key: 'apps',
      Icon: FolderOpen,
      bg: C.lightOrange,
      fg: C.orange,
      title: t('govUi.tileApplications'),
      sub: t('govUi.tileApplicationsSub'),
      route: GOV_ROUTES.MY_APPLICATIONS,
    },
  ];

  const statCards = [
    {v: stats?.total ?? all.length, l: t('govUi.statSchemes')},
    {v: stats?.byCategory?.length ?? '–', l: t('govUi.statCategories')},
    {v: stats?.updatedLast30Days ?? '–', l: t('govUi.statUpdated')},
    {v: eligibleCount ?? '–', l: t('govUi.statEligible'), hi: true},
  ];

  return (
    <View style={styles.container}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green} />
        }>
        <MarketHero
          image={HERO}
          onBack={() => navigation?.goBack()}
          eyebrow={t('govUi.heroEyebrow')}
          title={t('govUi.heroTitle')}
          subtitle={t('govUi.heroSub')}
          right={
            <GlassButton onPress={() => go(GOV_ROUTES.MY_APPLICATIONS)}>
              <FolderOpen size={19} color={C.white} />
            </GlassButton>
          }>
          <View style={styles.trustRow}>
            {[
              [ShieldCheck, t('govUi.trustOfficial')],
              [BadgeCheck, t('govUi.trustFree')],
              [Lock, t('govUi.trustPrivate')],
            ].map(([Icon, label]) => (
              <View key={label} style={styles.trustPill}>
                <Icon size={12} color="#BFF0D2" />
                <Text style={styles.trustText}>{label}</Text>
              </View>
            ))}
          </View>
        </MarketHero>

        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Search size={19} color={C.green} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={search}
              placeholder={t('govUi.searchPlaceholder')}
              placeholderTextColor={C.placeholder}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.ctaGrid}>
            {tiles.map(({key, Icon, bg, fg, title, sub, route}) => (
              <TouchableOpacity
                key={key}
                activeOpacity={0.88}
                style={styles.shortcut}
                onPress={() => go(route)}>
                <View style={[styles.shortcutIcon, {backgroundColor: bg}]}>
                  <Icon size={19} color={fg} />
                </View>
                <Text style={styles.shortcutTitle}>{title}</Text>
                <Text style={styles.shortcutText}>{sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LIVE STATISTICS */}
          <Text style={styles.sectionTitle}>{t('govUi.statsTitle')}</Text>
          <View style={styles.statGrid}>
            {statCards.map(s => (
              <View key={s.l} style={[styles.statCard, s.hi && styles.statCardHi]}>
                <Text style={[styles.statVal, s.hi && {color: C.white}]}>{s.v}</Text>
                <Text style={[styles.statLabel, s.hi && {color: '#D7F5E2'}]} numberOfLines={2}>
                  {s.l}
                </Text>
              </View>
            ))}
          </View>
          {!!stats?.byCategory?.length && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('govUi.statByCategory')}</Text>
              {stats.byCategory.slice(0, 6).map(c => (
                <View key={c.name} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {catLabelFromKey(t, c.name)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, {width: `${(c.count / maxCat) * 100}%`}]} />
                  </View>
                  <Text style={styles.barCount}>{c.count}</Text>
                </View>
              ))}
              {!!stats.lastUpdated && (
                <Text style={styles.updated}>
                  {t('govUi.statLastUpdated', {
                    date: formatDate(stats.lastUpdated, i18n.language),
                  })}
                </Text>
              )}
            </View>
          )}

          {/* RECOMMENDED */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitleInline}>{t('governmentSchemes.recommendedForYou')}</Text>
            <TouchableOpacity onPress={() => go(GOV_ROUTES.LATEST_SCHEMES)}>
              <Text style={styles.viewAll}>{t('common.view_all')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recRow}>
          {recommended.map(({scheme, status}) => (
            <TouchableOpacity
              key={scheme.id}
              activeOpacity={0.9}
              onPress={() => go(GOV_ROUTES.SCHEME_DETAIL, {id: scheme.id})}
              style={styles.recCard}>
              <SchemeIcon scheme={scheme} size={38} />
              <Text style={styles.recName} numberOfLines={2}>
                {scheme.name.split(' (')[0]}
              </Text>
              <Text style={styles.recDesc} numberOfLines={3}>
                {scheme.desc}
              </Text>
              <View style={{marginTop: 10, alignSelf: 'flex-start'}}>
                {status ? <StatusPill status={status} /> : null}
              </View>
              <View style={styles.recCtaRow}>
                <Text style={styles.recCtaText}>{t('common.view_details')}</Text>
                <ArrowRight size={12} color={C.dark} />
              </View>
            </TouchableOpacity>
          ))}
          {!hasProfile && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => go(GOV_ROUTES.ELIGIBILITY_CHECK)}
              style={[styles.recCard, {justifyContent: 'center', backgroundColor: C.lightGreen}]}>
              <CheckCircle2 size={22} color={C.green} />
              <Text style={styles.recName}>{t('govUi.getPersonalPicks')}</Text>
              <Text style={styles.recDesc}>{t('govUi.getPersonalPicksDesc')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('governmentSchemes.popularSchemes')}</Text>
          <View style={styles.listCard}>
            {popular.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.85}
                onPress={() => go(GOV_ROUTES.SCHEME_DETAIL, {id: p.id})}
                style={[styles.popRow, i !== popular.length - 1 && styles.popRowBorder]}>
                <SchemeIcon scheme={p} size={40} />
                <View style={{flex: 1}}>
                  <Text style={styles.popName}>{p.name}</Text>
                  <Text style={styles.popDesc} numberOfLines={2}>
                    {p.desc}
                  </Text>
                </View>
                <ChevronRight size={16} color={C.muted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* APPLICATIONS OVERVIEW */}
          <View style={[styles.card, {marginTop: 24}]}>
            <Text style={styles.cardTitle}>{t('governmentSchemes.myApplicationsOverview')}</Text>
            <Text style={styles.appDesc}>{t('governmentSchemes.trackAllYourSchemeApplications')}</Text>
            <View style={styles.appStatsRow}>
              {[
                ['approved', C.green, 'governmentSchemes.approved'],
                ['applied', C.orange, 'governmentSchemes.underReview'],
                ['rejected', C.red, 'governmentSchemes.rejected'],
              ].map(([st, color, key]) => (
                <View key={st} style={styles.appStat}>
                  <Text style={[styles.appStatVal, {color}]}>{countOf(st)}</Text>
                  <Text style={styles.appStatLabel}>{t(key)}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => go(GOV_ROUTES.MY_APPLICATIONS)}
              style={styles.trackBtn}>
              <Text style={styles.trackText}>{t('governmentSchemes.trackAllApplications')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scroll: {paddingBottom: 40},
  section: {paddingHorizontal: 16},
  searchWrap: {paddingHorizontal: 16, marginTop: 16},
  searchBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    ...MARKET_SHADOW_STRONG,
  },
  searchInput: {flex: 1, fontSize: 14, color: C.dark, paddingVertical: 0, fontWeight: '600'},
  trustRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14},
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  trustText: {color: C.white, fontSize: 10.5, fontWeight: '800'},
  ctaGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18},
  shortcut: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: 22,
    backgroundColor: C.white,
    padding: 15,
    minHeight: 124,
    ...MARKET_SHADOW,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {marginTop: 'auto', fontSize: 15, fontWeight: '900', color: C.dark},
  shortcutText: {fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2},
  sectionTitle: {marginTop: 24, marginBottom: 12, fontSize: 18, fontWeight: '900', color: C.dark},
  sectionTitleInline: {fontSize: 18, fontWeight: '900', color: C.dark},
  sectionHead: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {fontSize: 13, fontWeight: '900', color: C.green},
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  statCard: {
    width: '47.8%',
    flexGrow: 1,
    borderRadius: 18,
    backgroundColor: C.white,
    padding: 14,
    ...MARKET_SHADOW,
  },
  statCardHi: {backgroundColor: C.green},
  statVal: {fontSize: 26, fontWeight: '900', color: C.dark},
  statLabel: {marginTop: 2, fontSize: 11.5, fontWeight: '700', color: C.muted},
  card: {marginTop: 12, borderRadius: 22, backgroundColor: C.white, padding: 16, ...MARKET_SHADOW},
  cardTitle: {fontSize: 15, fontWeight: '900', color: C.dark},
  barRow: {marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10},
  barLabel: {width: 92, fontSize: 12, fontWeight: '700', color: C.text},
  barTrack: {flex: 1, height: 8, borderRadius: 4, backgroundColor: C.mint, overflow: 'hidden'},
  barFill: {height: 8, borderRadius: 4, backgroundColor: C.green},
  barCount: {width: 22, textAlign: 'right', fontSize: 12, fontWeight: '900', color: C.dark},
  updated: {marginTop: 12, fontSize: 11, fontWeight: '600', color: C.muted},
  recRow: {gap: 12, paddingHorizontal: 16, paddingVertical: 4},
  recCard: {width: 188, minHeight: 210, padding: 15, borderRadius: 22, backgroundColor: C.white, ...MARKET_SHADOW},
  recName: {marginTop: 12, fontSize: 14, fontWeight: '900', color: C.dark, lineHeight: 18},
  recDesc: {marginTop: 6, fontSize: 11.5, fontWeight: '500', color: C.muted, lineHeight: 15},
  recCtaRow: {marginTop: 'auto', paddingTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4},
  recCtaText: {fontSize: 12.5, fontWeight: '900', color: C.dark},
  listCard: {borderRadius: 22, backgroundColor: C.white, overflow: 'hidden', ...MARKET_SHADOW},
  popRow: {padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12},
  popRowBorder: {borderBottomWidth: 1, borderBottomColor: C.border},
  popName: {fontSize: 14, fontWeight: '900', color: C.dark},
  popDesc: {marginTop: 3, fontSize: 12, fontWeight: '500', color: C.muted},
  appDesc: {marginTop: 3, fontSize: 11.5, fontWeight: '500', color: C.muted},
  appStatsRow: {marginTop: 16, flexDirection: 'row'},
  appStat: {flex: 1, alignItems: 'center'},
  appStatVal: {fontSize: 24, fontWeight: '900'},
  appStatLabel: {marginTop: 4, fontSize: 10, fontWeight: '900', color: C.muted},
  trackBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackText: {fontSize: 13.5, fontWeight: '900', color: C.green},
});
