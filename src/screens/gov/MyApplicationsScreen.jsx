import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {ExternalLink, Trash2, Plus} from 'lucide-react-native';
import {COLORS, rf, PAGE_PADDING} from '../../components/gov/theme';
import {
  Screen,
  ScreenHeader,
  SchemeIcon,
  Pill,
  formatDate,
} from '../../components/gov/SchemeUi';
import {GOV_ROUTES} from '../../constants/govRoutes';
import {GOV_SCHEMES, getSchemeById} from '../../data/govSchemes';
import {
  APPLICATION_STATUS as S,
  loadApplications,
  upsertApplication,
  removeApplication,
} from '../../utils/govStorage';
import {openOfficialSite} from '../../utils/useGovData';
import {useSchemes} from '../../utils/schemeStore';
import {useTranslation} from 'react-i18next';

const STATUS_META = {
  [S.APPLIED]: {key: 'governmentSchemes.underReview', bg: '#FFEDD5', fg: COLORS.ORANGE},
  [S.APPROVED]: {key: 'governmentSchemes.approved', bg: '#DCFCE7', fg: COLORS.DARK_GREEN},
  [S.REJECTED]: {key: 'governmentSchemes.rejected', bg: '#FEE2E2', fg: COLORS.RED},
};

export default function MyApplicationsScreen({navigation, route}) {
  const {t, i18n} = useTranslation();
  useSchemes();
  const trackId = route?.params?.trackSchemeId;
  const [apps, setApps] = useState([]);
  const [adding, setAdding] = useState(!!trackId);
  const [schemeId, setSchemeId] = useState(trackId || null);
  const [status, setStatus] = useState(S.APPLIED);
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');

  const refresh = useCallback(async () => setApps(await loadApplications()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const startEdit = app => {
    setSchemeId(app.schemeId);
    setStatus(app.status);
    setRef(app.referenceNo || '');
    setNotes(app.notes || '');
    setAdding(true);
  };

  // Opened from a scheme's "track it" button: preload an existing record.
  useEffect(() => {
    if (!trackId) {
      return;
    }
    (async () => {
      const existing = (await loadApplications()).find(a => a.schemeId === trackId);
      if (existing) {
        startEdit(existing);
      }
    })();
  }, [trackId]);

  const reset = () => {
    setAdding(false);
    setSchemeId(null);
    setStatus(S.APPLIED);
    setRef('');
    setNotes('');
  };

  const save = async () => {
    if (!schemeId) {
      Alert.alert(t('govUi.chooseScheme'), t('govUi.chooseSchemeMsg'));
      return;
    }
    setApps(
      await upsertApplication({
        schemeId,
        status,
        referenceNo: ref.trim(),
        notes: notes.trim(),
      }),
    );
    reset();
  };

  const remove = app => {
    const scheme = getSchemeById(app.schemeId);
    Alert.alert(t('govUi.removeQ'), scheme?.name || '', [
      {text: t('govUi.cancel'), style: 'cancel'},
      {
        text: t('govUi.remove'),
        style: 'destructive',
        onPress: async () => setApps(await removeApplication(app.schemeId)),
      },
    ]);
  };

  const count = st => apps.filter(a => a.status === st).length;

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader title={t('govUi.appsTitle')} onBack={() => navigation?.goBack()} />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <View style={styles.statsRow}>
            {[S.APPROVED, S.APPLIED, S.REJECTED].map(st => (
              <View key={st} style={styles.stat}>
                <Text style={[styles.statVal, {color: STATUS_META[st].fg}]}>
                  {count(st)}
                </Text>
                <Text style={styles.statLabel}>{t(STATUS_META[st].key)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.note}>
            {t('govUi.appsNote')}
          </Text>

          {adding ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>{t('govUi.formScheme')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 8}}>
                {GOV_SCHEMES.map(s => {
                  const on = s.id === schemeId;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSchemeId(s.id)}
                      style={[styles.chip, on && styles.chipOn]}>
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>
                        {s.name.split(' (')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.formTitle}>{t('govUi.formStatus')}</Text>
              <View style={styles.chipWrap}>
                {Object.keys(STATUS_META).map(st => {
                  const on = st === status;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setStatus(st)}
                      style={[styles.chip, on && styles.chipOn]}>
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>
                        {t(STATUS_META[st].key)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                value={ref}
                onChangeText={setRef}
                placeholder={t('govUi.refPlaceholder')}
                placeholderTextColor={COLORS.MUTED}
                style={styles.input}
              />
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={t('govUi.notesPlaceholder')}
                placeholderTextColor={COLORS.MUTED}
                style={[styles.input, {height: 70, textAlignVertical: 'top', paddingTop: 10}]}
                multiline
              />
              <View style={styles.formBtns}>
                <TouchableOpacity onPress={reset} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>{t('govUi.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={save} style={styles.saveBtn}>
                  <Text style={styles.saveText}>{t('govUi.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setAdding(true)}
              style={styles.addBtn}>
              <Plus size={rf(16)} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.addText}>{t('govUi.trackApplication')}</Text>
            </TouchableOpacity>
          )}

          {apps.length === 0 && !adding ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t('govUi.noApps')}</Text>
              <Text style={styles.emptySub}>
                {t('govUi.noAppsSub')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate(GOV_ROUTES.LATEST_SCHEMES)}>
                <Text style={styles.link}>{t('govUi.tileBrowse')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            apps.map(app => {
              const scheme = getSchemeById(app.schemeId);
              if (!scheme) {
                return null;
              }
              const m = STATUS_META[app.status] || STATUS_META[S.APPLIED];
              return (
                <View key={app.schemeId} style={styles.appCard}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation?.navigate(GOV_ROUTES.SCHEME_DETAIL, {
                        id: scheme.id,
                      })
                    }
                    style={styles.appHead}>
                    <SchemeIcon scheme={scheme} size={38} />
                    <View style={{flex: 1}}>
                      <Text style={styles.appName}>{scheme.name}</Text>
                      <Text style={styles.appMeta}>
                        {t('govUi.appliedOn', {date: formatDate(app.appliedAt, i18n.language)})}
                        {app.referenceNo ? `  ·  ${t('govUi.refNo', {ref: app.referenceNo})}` : ''}
                      </Text>
                    </View>
                    <Pill label={t(m.key)} bg={m.bg} fg={m.fg} />
                  </TouchableOpacity>
                  {app.notes ? <Text style={styles.appNotes}>{app.notes}</Text> : null}
                  <View style={styles.appActions}>
                    <TouchableOpacity
                      onPress={() => openOfficialSite(scheme.officialUrl)}
                      style={styles.action}>
                      <ExternalLink size={rf(14)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
                      <Text style={styles.actionText}>{t('govUi.checkOnline')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => startEdit(app)} style={styles.action}>
                      <Text style={styles.actionText}>{t('govUi.update')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => remove(app)} style={styles.action}>
                      <Trash2 size={rf(14)} color={COLORS.RED} strokeWidth={2.4} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {padding: PAGE_PADDING, paddingBottom: 40, gap: 12},
  statsRow: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  stat: {flex: 1, alignItems: 'center'},
  statVal: {fontSize: rf(24), fontWeight: '900'},
  statLabel: {marginTop: 2, fontSize: rf(11), fontWeight: '800', color: COLORS.MUTED},
  note: {fontSize: rf(11.5), color: COLORS.MUTED, lineHeight: rf(16)},
  addBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addText: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  form: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 10,
  },
  formTitle: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
  },
  chipOn: {backgroundColor: COLORS.DARK_GREEN, borderColor: COLORS.DARK_GREEN},
  chipText: {fontSize: rf(12), fontWeight: '800', color: COLORS.DARK},
  chipTextOn: {color: '#FFFFFF'},
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    fontSize: rf(13),
    color: COLORS.DARK,
  },
  formBtns: {flexDirection: 'row', gap: 10},
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {fontWeight: '900', color: COLORS.DARK},
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {fontWeight: '900', color: '#FFFFFF'},
  emptyBox: {alignItems: 'center', padding: 24, gap: 6},
  emptyTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  emptySub: {fontSize: rf(12.5), color: COLORS.MUTED, textAlign: 'center'},
  link: {marginTop: 6, fontSize: rf(13), fontWeight: '900', color: COLORS.DARK_GREEN},
  appCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 10,
  },
  appHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  appName: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK},
  appMeta: {marginTop: 2, fontSize: rf(11), color: COLORS.MUTED},
  appNotes: {fontSize: rf(12), color: COLORS.DARK},
  appActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 10,
  },
  action: {flexDirection: 'row', alignItems: 'center', gap: 5},
  actionText: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK_GREEN},
});
