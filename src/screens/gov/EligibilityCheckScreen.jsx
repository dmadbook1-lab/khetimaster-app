import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {COLORS, rf, PAGE_PADDING} from '../../components/gov/theme';
import {Screen, ScreenHeader, SchemeRow} from '../../components/gov/SchemeUi';
import {GOV_ROUTES} from '../../constants/govRoutes';
import {
  EMPTY_PROFILE,
  ACRE_TO_HA,
  checkAllSchemes,
  sortByEligibility,
} from '../../utils/schemeEligibility';
import {loadGovProfile, saveGovProfile} from '../../utils/govStorage';
import {useSchemes} from '../../utils/schemeStore';
import {useTranslation} from 'react-i18next';

const LAND = [
  {v: 'owner', k: 'govUi.landOwn'},
  {v: 'tenant', k: 'govUi.landTenant'},
  {v: 'none', k: 'govUi.landNone'},
];
const GENDER = [
  {v: 'male', k: 'govUi.male'},
  {v: 'female', k: 'govUi.female'},
  {v: 'other', k: 'govUi.other'},
];
const CASTE = [
  {v: 'general', k: 'govUi.casteGeneral'},
  {v: 'obc', l: 'OBC'},
  {v: 'sc', l: 'SC'},
  {v: 'st', l: 'ST'},
];
const YESNO = [
  {v: true, k: 'govUi.yes'},
  {v: false, k: 'govUi.no'},
];
const ACTIVITIES = [
  {v: 'crops', k: 'govUi.actCrops'},
  {v: 'horticulture', k: 'govUi.actHorticulture'},
  {v: 'livestock', k: 'govUi.actLivestock'},
  {v: 'fisheries', k: 'govUi.actFisheries'},
  {v: 'processing', k: 'govUi.actProcessing'},
  {v: 'organic', k: 'govUi.actOrganic'},
];

const Chips = ({options, value, onChange, multi}) => {
  const {t} = useTranslation();
  return (
  <View style={styles.chipRow}>
    {options.map(o => {
      const on = multi ? value.includes(o.v) : value === o.v;
      return (
        <TouchableOpacity
          key={String(o.v)}
          activeOpacity={0.85}
          onPress={() =>
            multi
              ? onChange(on ? value.filter(x => x !== o.v) : [...value, o.v])
              : onChange(on ? (o.v === true || o.v === false ? null : '') : o.v)
          }
          style={[styles.chip, on && styles.chipOn]}>
          <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.k ? t(o.k) : o.l}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
  );
};

const Field = ({label, hint, children}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    {children}
  </View>
);

const toNumber = s => {
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export default function EligibilityCheckScreen({navigation}) {
  const {t} = useTranslation();
  useSchemes();
  const [p, setP] = useState(EMPTY_PROFILE);
  const [landInput, setLandInput] = useState('');
  const [unit, setUnit] = useState('acre');
  const [ageInput, setAgeInput] = useState('');
  const [results, setResults] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const saved = await loadGovProfile();
      if (saved) {
        setP(saved);
        if (saved.landHa !== null && saved.landHa !== undefined) {
          setLandInput(String(+(saved.landHa / ACRE_TO_HA).toFixed(2)));
        }
        if (saved.age !== null && saved.age !== undefined) {
          setAgeInput(String(saved.age));
        }
      }
    })();
  }, []);

  const set = (k, v) => setP(prev => ({...prev, [k]: v}));

  const submit = async () => {
    const n = toNumber(landInput);
    const age = toNumber(ageInput);
    const profile = {
      ...p,
      landHa: n === null ? null : unit === 'acre' ? n * ACRE_TO_HA : n,
      age: age === null ? null : Math.round(age),
    };
    setP(profile);
    await saveGovProfile(profile);
    setResults(sortByEligibility(checkAllSchemes(profile)));
    setTimeout(() => scrollRef.current?.scrollTo({y: 0, animated: true}), 50);
  };

  const eligibleCount = results
    ? results.filter(r => r.status === 'eligible').length
    : 0;
  const maybeCount = results
    ? results.filter(r => r.status === 'maybe').length
    : 0;

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader title={t('govUi.eligTitle')} onBack={() => navigation?.goBack()} />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          {results && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>
                {t(eligibleCount === 1 ? 'govUi.resultCountOne' : 'govUi.resultCountMany', {count: eligibleCount})}
              </Text>
              {maybeCount > 0 && (
                <Text style={styles.resultSub}>
                  {t('govUi.resultMore', {count: maybeCount})}
                </Text>
              )}
              <View style={{gap: 10, marginTop: 12}}>
                {results.map(r => (
                  <SchemeRow
                    key={r.scheme.id}
                    scheme={r.scheme}
                    status={r.status}
                    onPress={() =>
                      navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {
                        id: r.scheme.id,
                      })
                    }
                  />
                ))}
              </View>
            </View>
          )}

          <Text style={styles.intro}>
            {t('govUi.eligIntro')}
          </Text>

          <Field label={t('govUi.land')}>
            <Chips options={LAND} value={p.landStatus} onChange={v => set('landStatus', v)} />
          </Field>

          {p.landStatus !== 'none' && (
            <Field label={t('govUi.landSize')}>
              <View style={styles.inline}>
                <TextInput
                  value={landInput}
                  onChangeText={setLandInput}
                  keyboardType="decimal-pad"
                  placeholder={t('govUi.landPlaceholder')}
                  placeholderTextColor={COLORS.MUTED}
                  style={[styles.input, {flex: 1}]}
                />
                <Chips
                  options={[
                    {v: 'acre', k: 'govUi.acre'},
                    {v: 'ha', k: 'govUi.hectare'},
                  ]}
                  value={unit}
                  onChange={v => v && setUnit(v)}
                />
              </View>
            </Field>
          )}

          <Field label={t('govUi.age')}>
            <TextInput
              value={ageInput}
              onChangeText={setAgeInput}
              keyboardType="number-pad"
              maxLength={3}
              placeholder={t('govUi.agePlaceholder')}
              placeholderTextColor={COLORS.MUTED}
              style={styles.input}
            />
          </Field>

          <Field label={t('govUi.gender')}>
            <Chips options={GENDER} value={p.gender} onChange={v => set('gender', v)} />
          </Field>

          <Field label={t('govUi.caste')}>
            <Chips options={CASTE} value={p.caste} onChange={v => set('caste', v)} />
          </Field>

          <Field label={t('govUi.taxQuestion')}>
            <Chips options={YESNO} value={p.incomeTaxPayer} onChange={v => set('incomeTaxPayer', v)} />
          </Field>

          <Field
            label={t('govUi.govtQuestion')}
            hint={t('govUi.govtHint')}>
            <Chips options={YESNO} value={p.govtJob} onChange={v => set('govtJob', v)} />
          </Field>

          <Field label={t('govUi.activities')}>
            <Chips multi options={ACTIVITIES} value={p.activities} onChange={v => set('activities', v)} />
          </Field>

          <TouchableOpacity activeOpacity={0.9} onPress={submit} style={styles.btn}>
            <Text style={styles.btnText}>
              {results ? t('govUi.updateResults') : t('govUi.checkMine')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            {t('govUi.eligDisclaimer')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {padding: PAGE_PADDING, paddingBottom: 50, gap: 16},
  intro: {fontSize: rf(12.5), color: COLORS.MUTED, lineHeight: rf(17)},
  field: {gap: 8},
  label: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  hint: {fontSize: rf(11.5), color: COLORS.MUTED},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  chipOn: {backgroundColor: COLORS.DARK_GREEN, borderColor: COLORS.DARK_GREEN},
  chipText: {fontSize: rf(12.5), fontWeight: '800', color: COLORS.DARK},
  chipTextOn: {color: '#FFFFFF'},
  inline: {flexDirection: 'row', alignItems: 'center', gap: 8},
  input: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    fontSize: rf(14),
    color: COLORS.DARK,
  },
  btn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  disclaimer: {fontSize: rf(11.5), color: COLORS.MUTED, lineHeight: rf(16)},
  resultBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultTitle: {fontSize: rf(16), fontWeight: '900', color: COLORS.DARK_GREEN},
  resultSub: {marginTop: 4, fontSize: rf(12), color: COLORS.MUTED},
});
