import React, {useCallback, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  CalendarCheck,
  ChevronRight,
  FlaskConical,
  Languages,
  Leaf,
  Plus,
  ScanLine,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import MarketHero, {TopInset} from '../../components/market/MarketHero';
import {
  EmptyState,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../../components/market/theme';
import {SOIL_ROUTES} from '../../constants/soilRoutes';
import {getMySoilTestsApi} from '../../api/soilTestApi';
import {formatDate} from '../../components/gov/SchemeUi';

export const statusMeta = (t, status) =>
  status === 'completed'
    ? {label: t('soilTest.statusCompleted'), bg: C.lightGreen, color: C.green}
    : {label: t('soilTest.statusBooked'), bg: C.lightAmber, color: C.amber};

export default function SoilTestHomeScreen({navigation}) {
  const {t, i18n} = useTranslation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getMySoilTestsApi();
      setTests(res.data || []);
      setError(false);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const book = () => navigation.navigate(SOIL_ROUTES.BOOK);

  const steps = [
    [CalendarCheck, t('soilTest.how1'), t('soilTest.how1d'), C.lightGreen, C.green],
    [ScanLine, t('soilTest.how2'), t('soilTest.how2d'), C.lightBlue, C.blue],
    [Leaf, t('soilTest.how3'), t('soilTest.how3d'), C.lightOrange, C.orange],
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
          gradient="forest"
          onBack={() => navigation.goBack()}
          eyebrow={t('soilTest.eyebrow')}
          title={t('soilTest.heroTitle')}
          subtitle={t('soilTest.heroSub')}>
          <View style={styles.trustRow}>
            {[
              [FlaskConical, t('soilTest.trustLab')],
              [Leaf, t('soilTest.trustAdvice')],
              [Languages, t('soilTest.trustLang')],
            ].map(([Icon, label]) => (
              <View key={label} style={styles.trustPill}>
                <Icon size={12} color="#BFF0D2" />
                <Text style={styles.trustText}>{label}</Text>
              </View>
            ))}
          </View>
        </MarketHero>

        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={book}>
            <View style={styles.ctaIcon}>
              <Plus size={22} color={C.white} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.ctaTitle}>{t('soilTest.bookCta')}</Text>
              <Text style={styles.ctaSub}>{t('soilTest.bookCtaSub')}</Text>
            </View>
            <ChevronRight size={18} color={C.green} />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{t('soilTest.howTitle')}</Text>
          <View style={styles.card}>
            {steps.map(([Icon, title, desc, bg, fg], i) => (
              <View key={title} style={[styles.step, i > 0 && styles.stepBorder]}>
                <View style={[styles.stepIcon, {backgroundColor: bg}]}>
                  <Icon size={18} color={fg} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.stepTitle}>{title}</Text>
                  <Text style={styles.stepDesc}>{desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('soilTest.myTests')}</Text>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              icon={<FlaskConical size={26} color={C.muted} />}
              title={t('soilTest.loadError')}
              actionLabel={t('soilTest.retry')}
              onAction={load}
            />
          ) : tests.length === 0 ? (
            <EmptyState
              icon={<FlaskConical size={26} color={C.muted} />}
              title={t('soilTest.noTests')}
              message={t('soilTest.noTestsSub')}
              actionLabel={t('soilTest.bookCta')}
              onAction={book}
            />
          ) : (
            tests.map(test => (
              <TouchableOpacity
                key={test._id}
                activeOpacity={0.88}
                style={styles.testCard}
                onPress={() => navigation.navigate(SOIL_ROUTES.DETAILS, {id: test._id})}>
                <View style={styles.testTop}>
                  <View style={styles.flex}>
                    <Text style={styles.testTitle}>
                      {test.previousCrop} → {test.nextCrop}
                    </Text>
                    <Text style={styles.testMeta}>
                      {test.sampleId
                        ? `${t('soilTest.sampleId')}: ${test.sampleId}`
                        : t('soilTest.sampleIdPending')}
                    </Text>
                  </View>
                  <StatusPill meta={statusMeta(t, test.status)} />
                </View>
                <Text style={styles.testMeta}>
                  {test.city}, {test.state} · {test.farmSize}{' '}
                  {test.farmSizeUnit === 'Hectares' ? t('soilTest.hectares') : t('soilTest.acres')} ·{' '}
                  {formatDate(test.createdAt, i18n.language)}
                </Text>
              </TouchableOpacity>
            ))
          )}
          {tests.length > 0 && (
            <MarketButton
              variant="outline"
              label={t('soilTest.bookCta')}
              icon={<Plus size={16} color={C.green} />}
              onPress={book}
              style={styles.bookBtn}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scroll: {paddingBottom: 40},
  flex: {flex: 1},
  section: {paddingHorizontal: 16},
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
  cta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    backgroundColor: C.white,
    ...MARKET_SHADOW,
  },
  ctaIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {fontSize: 16, fontWeight: '900', color: C.dark},
  ctaSub: {marginTop: 2, fontSize: 12, fontWeight: '600', color: C.muted},
  sectionTitle: {marginTop: 24, marginBottom: 12, fontSize: 18, fontWeight: '900', color: C.dark},
  card: {borderRadius: 22, backgroundColor: C.white, ...MARKET_SHADOW},
  step: {flexDirection: 'row', gap: 12, padding: 16, alignItems: 'center'},
  stepBorder: {borderTopWidth: 1, borderTopColor: C.border},
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {fontSize: 14, fontWeight: '900', color: C.dark},
  stepDesc: {marginTop: 2, fontSize: 12, fontWeight: '500', color: C.muted, lineHeight: 17},
  testCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: C.white,
    gap: 8,
    ...MARKET_SHADOW,
  },
  testTop: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  testTitle: {fontSize: 15, fontWeight: '900', color: C.dark, textTransform: 'capitalize'},
  testMeta: {marginTop: 2, fontSize: 12, fontWeight: '600', color: C.muted},
  bookBtn: {marginTop: 4},
});
