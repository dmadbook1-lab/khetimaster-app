import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {FlaskConical, RefreshCw} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import MarketHero, {TopInset} from '../../components/market/MarketHero';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  MarketButton,
  StatusPill,
} from '../../components/market/MarketBits';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../../components/market/theme';
import {getSoilTestApi, refreshSoilTestApi} from '../../api/soilTestApi';
import {formatDate} from '../../components/gov/SchemeUi';
import {microsOf, phBand, pickText, planOf} from '../../utils/soilReport';
import {statusMeta} from './SoilTestHomeScreen';

const Stat = ({label, value, sub, hi}) => (
  <View style={[styles.stat, hi && styles.statHi]}>
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {!!sub && <Text style={styles.statSub}>{sub}</Text>}
  </View>
);

export default function SoilTestDetailScreen({navigation, route}) {
  const {t, i18n} = useTranslation();
  const id = route?.params?.id;
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getSoilTestApi(id);
      setTest(res.data);
      setMissing(false);
    } catch (e) {
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const check = async () => {
    setChecking(true);
    setNote('');
    try {
      const res = await refreshSoilTestApi(id);
      setTest(res.data);
      if (res.data.status !== 'completed') {
        setNote(t('soilTest.stillWaiting'));
      }
    } catch (e) {
      setNote(t('soilTest.checkFailed'));
    } finally {
      setChecking(false);
    }
  };

  const report = test?.report;
  const lang = i18n.language;
  const plan = planOf(report);
  const micros = microsOf(report);
  const band = phBand(report?.ph);

  return (
    <View style={styles.container}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={checking} onRefresh={test?.status === 'booked' ? check : load} tintColor={C.green} />
        }>
        <MarketHero
          compact
          gradient="forest"
          onBack={() => navigation.goBack()}
          title={t('soilTest.detailTitle')}
          subtitle={test?.sampleId ? `${t('soilTest.sampleId')}: ${test.sampleId}` : undefined}
        />

        {loading ? (
          <LoadingState />
        ) : missing || !test ? (
          <EmptyState
            icon={<FlaskConical size={26} color={C.muted} />}
            title={t('soilTest.notFound')}
          />
        ) : (
          <View style={styles.body}>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>
                  {test.previousCrop} → {test.nextCrop}
                </Text>
                <StatusPill meta={statusMeta(t, test.status)} />
              </View>
              <InfoRow label={t('soilTest.farmerLabel')} value={`${test.firstName} ${test.lastName}`} />
              <InfoRow label={t('soilTest.location')} value={`${test.city}, ${test.state} ${test.pincode}`} />
              <InfoRow
                label={t('soilTest.farmLabel')}
                value={`${test.farmSize} ${test.farmSizeUnit === 'Hectares' ? t('soilTest.hectares') : t('soilTest.acres')}`}
              />
              <InfoRow label={t('soilTest.bookedOn')} value={formatDate(test.createdAt, lang)} />
              {!!report?.entity_name && (
                <InfoRow label={t('soilTest.testedBy')} value={report.entity_name} />
              )}
            </View>

            {test.status !== 'completed' ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('soilTest.notReadyTitle')}</Text>
                <Text style={styles.muted}>{t('soilTest.notReadyMsg')}</Text>
                {!!note && <Text style={styles.note}>{note}</Text>}
                {!!test.sampleId && (
                  <MarketButton
                    label={t('soilTest.checkReport')}
                    icon={<RefreshCw size={16} color={C.white} />}
                    loading={checking}
                    onPress={check}
                    style={styles.checkBtn}
                  />
                )}
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>{t('soilTest.nutrients')}</Text>
                <View style={styles.statGrid}>
                  <Stat label={t('soilTest.nitrogen')} value={report.nitrogen ?? '–'} />
                  <Stat label={t('soilTest.phosphorus')} value={report.phosphorus ?? '–'} />
                  <Stat label={t('soilTest.potassium')} value={report.potassium ?? '–'} />
                  <Stat
                    hi
                    label={t('soilTest.ph')}
                    value={report.ph ?? '–'}
                    sub={band ? t(`soilTest.${band}`) : undefined}
                  />
                </View>

                {micros.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>{t('soilTest.micronutrients')}</Text>
                    <View style={styles.statGrid}>
                      {micros.map(k => (
                        <Stat key={k} label={t(`soilTest.${k}`)} value={report[k]} />
                      ))}
                    </View>
                  </>
                )}

                <Text style={styles.sectionTitle}>
                  {plan.crop
                    ? t('soilTest.planTitle', {crop: plan.crop})
                    : t('soilTest.planTitleNoCrop')}
                </Text>
                {plan.stages.length === 0 ? (
                  <Text style={styles.muted}>{t('soilTest.noPlan')}</Text>
                ) : (
                  plan.stages.map((stage, i) => (
                    <View key={`${stage.order}-${i}`} style={styles.card}>
                      <View style={styles.stageHead}>
                        <View style={styles.stageNum}>
                          <Text style={styles.stageNumText}>{stage.order ?? i + 1}</Text>
                        </View>
                        <Text style={styles.cardTitle}>{pickText(stage.orderName, lang)}</Text>
                      </View>
                      {(stage.prescription || []).map((p, j) => (
                        <View key={j} style={[styles.rx, j > 0 && styles.rxBorder]}>
                          <Text style={styles.rxInput}>{pickText(p.input, lang)}</Text>
                          <Text style={styles.rxDose}>
                            {t('soilTest.dose')}: {p.perSessionDose} {pickText(p.unit, lang)}
                          </Text>
                          <Text style={styles.muted}>
                            {t('soilTest.method')}: {pickText(p.method, lang)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
                <Text style={styles.disclaimer}>{t('soilTest.reportDisclaimer')}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scroll: {paddingBottom: 40},
  body: {paddingHorizontal: 16, paddingTop: 16, gap: 12},
  card: {borderRadius: 22, backgroundColor: C.white, padding: 16, gap: 8, ...MARKET_SHADOW},
  cardHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  cardTitle: {flex: 1, fontSize: 15, fontWeight: '900', color: C.dark, textTransform: 'capitalize'},
  muted: {fontSize: 12.5, fontWeight: '500', color: C.muted, lineHeight: 18},
  note: {fontSize: 12.5, fontWeight: '800', color: C.amber},
  checkBtn: {marginTop: 6},
  sectionTitle: {marginTop: 12, fontSize: 18, fontWeight: '900', color: C.dark},
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  stat: {width: '47.8%', flexGrow: 1, borderRadius: 18, backgroundColor: C.white, padding: 14, ...MARKET_SHADOW},
  statHi: {backgroundColor: C.lightGreen},
  statVal: {fontSize: 24, fontWeight: '900', color: C.dark},
  statLabel: {marginTop: 2, fontSize: 12, fontWeight: '700', color: C.muted},
  statSub: {marginTop: 4, fontSize: 11.5, fontWeight: '900', color: C.green},
  stageHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  stageNum: {width: 26, height: 26, borderRadius: 13, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center'},
  stageNumText: {fontSize: 12, fontWeight: '900', color: C.greenDeep},
  rx: {gap: 3, paddingTop: 4},
  rxBorder: {borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10},
  rxInput: {fontSize: 14, fontWeight: '900', color: C.dark},
  rxDose: {fontSize: 13, fontWeight: '800', color: C.green},
  disclaimer: {fontSize: 11.5, color: C.muted, lineHeight: 16},
});
