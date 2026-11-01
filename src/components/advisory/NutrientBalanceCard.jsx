import i18n from '../../translation/i18n';
import { useTranslation } from 'react-i18next';
import React, {useEffect, useMemo, useRef} from 'react';

import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

import Svg, {Circle} from 'react-native-svg';

import {Beaker, CheckCircle2, Info, Package, Wheat} from 'lucide-react-native';

import {
  COLORS,
  FERTILIZERS,
  computeFertilizerKgPerHa,
  hasMeaningfulNpk,
} from './advisoryTheme';

const NUTRIENTS = [
  {symbol: 'N', get label() {
      return i18n.t('advisory.nitrogen');
    }, field: 'nitrogenKgPerHa', color: '#E8A80C', soft: '#FFF6DF'},
  {symbol: 'P', get label() {
      return i18n.t('advisory.phosphorus');
    }, field: 'phosphorousKgPerHa', color: '#DC4A3D', soft: '#FDECEA'},
  {symbol: 'K', get label() {
      return i18n.t('advisory.potassium');
    }, field: 'potassiumKgPerHa', color: '#2F9E44', soft: '#E8F6EB'},
];

const ACRES_PER_HECTARE = 2.47105;

const RING_SIZE = 74;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/*
|--------------------------------------------------------------------------
| NUTRIENT RING
|--------------------------------------------------------------------------
|
| Ring fill = share of the stage target the crop already has.
|
*/

function NutrientRing({nutrient, current, required, applyMessage}) {
  const {t} = useTranslation();
  const progress = useRef(new Animated.Value(0)).current;

  const deficit = Math.max(0, required - current);
  const satisfied = deficit <= 0.05;
  const ratio = required > 0 ? Math.min(1, current / required) : 1;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, progress]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.ringTile}>
      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={nutrient.soft}
            strokeWidth={RING_STROKE}
            fill="none"
          />

          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={nutrient.color}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>

        <View style={styles.ringCenter}>
          <Text style={[styles.ringSymbol, {color: nutrient.color}]}>
            {nutrient.symbol}
          </Text>

          <Text style={styles.ringPercent}>{Math.round(ratio * 100)}%</Text>
        </View>
      </View>

      <Text style={styles.ringLabel}>{nutrient.label}</Text>

      <Text style={styles.ringNumbers}>
        <Text style={styles.ringCurrent}>{Math.round(current)}</Text>
        <Text style={styles.ringTarget}> / {Math.round(required)} kg/ha</Text>
      </Text>

      <View
        style={[
          styles.statusChip,
          {backgroundColor: satisfied ? COLORS.mintSoft : nutrient.soft},
        ]}>
        <Text
          style={[
            styles.statusChipText,
            {color: satisfied ? COLORS.green : nutrient.color},
          ]}
          numberOfLines={2}>
          {satisfied
            ? t('advisory.on_target')
            : applyMessage || t('advisory.short_kg_ha', {n: deficit.toFixed(0)})}
        </Text>
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| FERTILIZER ROW
|--------------------------------------------------------------------------
*/

function FertilizerRow({fert, kgPerHa, gap, acres, isLast}) {
  const {t} = useTranslation();
  const kgPerAcre = kgPerHa / ACRES_PER_HECTARE;
  const total = acres ? kgPerAcre * acres : null;

  return (
    <View style={[styles.fertRow, !isLast && styles.fertRowDivider]}>
      <View style={[styles.fertBadge, {backgroundColor: `${fert.color}1A`}]}>
        <Package size={17} color={fert.color} strokeWidth={2.3} />
      </View>

      <View style={styles.fertInfo}>
        <Text style={styles.fertName}>{fert.name}</Text>

        <Text style={styles.fertGrade} numberOfLines={1}>
          {fert.grade}
        </Text>

        <Text style={[styles.fertGap, {color: fert.color}]}>
          {t('advisory.fills_gap', {n: Math.round(gap), nutrient: fert.nutrient})}
        </Text>
      </View>

      <View style={styles.fertDose}>
        <Text style={[styles.fertKg, {color: fert.color}]}>
          {kgPerAcre.toFixed(1)}
          <Text style={styles.fertUnit}> {t('units.kg_per_acre')}</Text>
        </Text>

        {total != null ? (
          <Text style={styles.fertTotal}>{t('advisory.kg_for_farm', {n: total.toFixed(1)})}</Text>
        ) : null}
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

export default function NutrientBalanceCard({npkManagement, farmAcre}) {
  const { t } = useTranslation();
  const display = npkManagement?.display;
  const view = display?.view || 'chart';

  const available = useMemo(
    () => npkManagement?.available ?? {},
    [npkManagement?.available],
  );
  const required = useMemo(
    () => npkManagement?.required ?? {},
    [npkManagement?.required],
  );

  const fertilizer = useMemo(
    () => computeFertilizerKgPerHa(available, required),
    [available, required],
  );

  const applyMessages = useMemo(() => {
    const map = {};

    (display?.nutrients || []).forEach(item => {
      map[item.symbol] = item.applyMessage;
    });

    return map;
  }, [display?.nutrients]);

  const recommendation = String(npkManagement?.recommendation ?? '').trim();
  const acres = Number(farmAcre) || Number(display?.fieldAcre) || null;
  const meaningful = hasMeaningfulNpk(npkManagement);

  if (!npkManagement || (!meaningful && !display?.bannerTitle && !recommendation)) {
    return null;
  }

  const fromSatellite = npkManagement?.factorSource === 'satellite';
  const neededFertilizers = FERTILIZERS.filter(f => fertilizer[f.key] > 0);

  const onTargetCount = NUTRIENTS.filter(
    n =>
      (Number(required[n.field]) || 0) - (Number(available[n.field]) || 0) <= 0.05,
  ).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Beaker size={18} color={COLORS.green} strokeWidth={2.3} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{t('advisory.soil_nutrients')}</Text>

          <Text style={styles.subtitle} numberOfLines={1}>
            {display?.growthStageLabel
              ? t('advisory.npk_target_for', {stage: display.growthStageLabel})
              : t('advisory.npk_bbch')}
          </Text>
        </View>

        {fromSatellite ? (
          <View style={styles.sourceChip}>
            <Text style={styles.sourceText}>🛰️ {t('farms.satellite')}</Text>
          </View>
        ) : null}
      </View>

      {/* ====================================================
          HARVEST / ZERO BASELINE BANNER
      ==================================================== */}

      {view !== 'chart' && display?.bannerTitle ? (
        <View style={styles.banner}>
          <Wheat size={18} color="#B7791F" strokeWidth={2.2} />

          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{display.bannerTitle}</Text>

            {display.bannerDescription ? (
              <Text style={styles.bannerBody}>{display.bannerDescription}</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {view !== 'chart' && Array.isArray(display?.statusCards)
        ? display.statusCards.map(card => (
            <View key={card.key} style={styles.statusCard}>
              <Text style={styles.statusTitle}>{card.title}</Text>
              <Text style={styles.statusBody}>{card.body}</Text>
            </View>
          ))
        : null}

      {/* ====================================================
          NPK RINGS
      ==================================================== */}

      {view === 'chart' && meaningful ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryStrong}>
                {t('advisory.n_of_3', {n: onTargetCount})}
              </Text>{' '}
              {t('advisory.nutrients_on_target')}
            </Text>

            <View style={styles.summaryDots}>
              {NUTRIENTS.map((n, i) => (
                <View
                  key={n.symbol}
                  style={[
                    styles.summaryDot,
                    i < onTargetCount && styles.summaryDotOn,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.rings}>
            {NUTRIENTS.map(nutrient => (
              <NutrientRing
                key={nutrient.symbol}
                nutrient={nutrient}
                current={Number(available[nutrient.field]) || 0}
                required={Number(required[nutrient.field]) || 0}
                applyMessage={applyMessages[nutrient.symbol]}
              />
            ))}
          </View>

          {/* ================================================
              FERTILIZER
          ================================================ */}

          <View style={styles.fertHeader}>
            <Text style={styles.sectionTitle}>{t('advisory.fertilizer_to_apply')}</Text>

            {acres ? (
              <Text style={styles.fertHeaderMeta}>
                for {acres.toFixed(2)} acres
              </Text>
            ) : null}
          </View>

          {neededFertilizers.length ? (
            <View style={styles.fertList}>
              {neededFertilizers.map((fert, index) => (
                <FertilizerRow
                  key={fert.key}
                  fert={fert}
                  kgPerHa={fertilizer[fert.key]}
                  gap={fertilizer[fert.deficitKey]}
                  acres={acres}
                  isLast={index === neededFertilizers.length - 1}
                />
              ))}
            </View>
          ) : (
            <View style={styles.allGood}>
              <CheckCircle2 size={16} color={COLORS.green} strokeWidth={2.4} />

              <Text style={styles.allGoodText}>
                {t('advisory.all_on_target')}
              </Text>
            </View>
          )}
        </>
      ) : null}

      {recommendation ? (
        <View style={styles.note}>
          <Info size={14} color={COLORS.green} strokeWidth={2.3} />

          <Text style={styles.noteText}>{recommendation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  sourceChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#EEF4FF',
  },

  sourceText: {
    color: '#2F5BD3',
    fontSize: 9,
    fontWeight: '900',
  },

  banner: {
    flexDirection: 'row',
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F7E3B5',
  },

  bannerText: {
    flex: 1,
    marginLeft: 10,
  },

  bannerTitle: {
    color: '#7A4E0B',
    fontSize: 12,
    fontWeight: '900',
  },

  bannerBody: {
    color: '#8A6420',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  statusCard: {
    marginTop: 8,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#F7F9F8',
  },

  statusTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
  },

  statusBody: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#E4EFE7',
  },

  summaryText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },

  summaryStrong: {
    color: COLORS.text,
    fontWeight: '900',
  },

  summaryDots: {
    flexDirection: 'row',
    marginLeft: 8,
  },

  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    backgroundColor: '#D9E2DC',
  },

  summaryDotOn: {
    backgroundColor: COLORS.green,
  },

  rings: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -4,
  },

  ringTile: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#FAFBFA',
    borderWidth: 1,
    borderColor: '#EEF2EF',
  },

  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },

  ringSymbol: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },

  ringPercent: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
  },

  ringLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 8,
  },

  ringNumbers: {
    marginTop: 2,
  },

  ringCurrent: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },

  ringTarget: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
  },

  statusChip: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusChipText: {
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },

  fertHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },

  fertHeaderMeta: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },

  fertList: {
    borderRadius: 16,
    backgroundColor: '#FAFBFA',
    borderWidth: 1,
    borderColor: '#EEF2EF',
    paddingHorizontal: 12,
  },

  fertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  fertRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFEC',
  },

  fertBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  fertInfo: {
    flex: 1,
    minWidth: 0,
  },

  fertName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },

  fertGrade: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },

  fertGap: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
  },

  fertDose: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  fertKg: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  fertUnit: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0,
  },

  fertTotal: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },

  allGood: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 13,
    backgroundColor: COLORS.mintSoft,
  },

  allGoodText: {
    flex: 1,
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
  },

  note: {
    flexDirection: 'row',
    marginTop: 14,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#F4FAF6',
    borderWidth: 1,
    borderColor: '#E1EFE6',
  },

  noteText: {
    flex: 1,
    color: '#344E41',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
