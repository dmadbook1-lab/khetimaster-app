import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft, Check, Search, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setAiGuruLanguage } from '../../redux/slices/aiGuruSlice';
import {
  changeLanguageFast,
  getAppLanguagePickerRows,
  normalizeLanguageCode,
  persistLanguageOnly,
} from '../../utils/languageUtils';
const { width, height } = Dimensions.get('window');
const GREEN = '#178C45';
const DARK = '#171B20';

/*
 * Two modes, like CropGen:
 * - onboarding (default): tapping previews the language live, Continue saves
 *   it and replaces this screen with `redirectTo` (Login by default)
 * - settings ({ fromSettings: true }): tapping saves it and goes back
 */
const LanguageScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const fromSettings = route?.params?.fromSettings === true;
  const redirectTo = route?.params?.redirectTo || 'Login';

  const languages = useMemo(() => getAppLanguagePickerRows(), []);
  const [selected, setSelected] = useState(() =>
    normalizeLanguageCode(i18n.language),
  );
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setSelected(normalizeLanguageCode(i18n.language));
  }, [i18n.language]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return languages;
    }
    return languages.filter(
      l =>
        l.label.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.includes(q),
    );
  }, [languages, search]);

  const applyAndPersistLanguage = useCallback(
    async code => {
      setApplying(true);
      try {
        const resolved = await changeLanguageFast(code);
        await persistLanguageOnly(resolved);
        // AI Guru and farm advisory reply in the app language by default
        dispatch(setAiGuruLanguage(resolved));
        if (fromSettings) {
          navigation.goBack();
        } else {
          navigation.replace(redirectTo);
        }
      } catch (err) {
        console.warn('[i18n] applyAndPersistLanguage', err);
      } finally {
        setApplying(false);
      }
    },
    [dispatch, fromSettings, navigation, redirectTo],
  );

  const onSelectLanguage = useCallback(
    code => {
      if (!code || applying) {
        return;
      }
      setSelected(code);
      if (fromSettings) {
        applyAndPersistLanguage(code);
        return;
      }
      // live preview so the rest of this screen switches immediately
      changeLanguageFast(code).catch(() => {});
    },
    [applyAndPersistLanguage, applying, fromSettings],
  );

  const handleContinue = () => {
    if (selected && !applying) {
      applyAndPersistLanguage(selected);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {fromSettings && (
        <View style={styles.settingsHeader}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={23} color="#087235" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.settingsTitle}>
            {t('language.settings_title')}
          </Text>
          <View style={styles.backBtn} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {!fromSettings && (
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/images/language.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={[styles.contentCard, fromSettings && styles.flatCard]}>
          {fromSettings ? (
            <Text style={styles.subtitle}>
              {t('language.settings_subtitle')}
            </Text>
          ) : (
            <>
              <Text style={styles.title}>
                {t('language.title_line1')}
                {'\n'}
                <Text style={styles.greenText}>
                  {t('language.title_line2')}
                </Text>
              </Text>

              <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
            </>
          )}

          <View style={styles.searchBox}>
            <Search size={18} color="#8FA0BA" strokeWidth={2.2} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('language.search_placeholder')}
              placeholderTextColor="#A7B0C2"
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="off"
            />
          </View>

          <View style={styles.list}>
            {filtered.length === 0 ? (
              <Text style={styles.empty}>{t('language.empty')}</Text>
            ) : (
              filtered.map(item => {
                const active = selected === item.code;
                const showSub = item.label !== item.native;
                return (
                  <TouchableOpacity
                    key={item.code}
                    activeOpacity={0.85}
                    onPress={() => onSelectLanguage(item.code)}
                    style={[styles.langCard, active && styles.activeCard]}
                  >
                    <View style={styles.langLeft}>
                      <View
                        style={[styles.codeBadge, active && styles.codeBadgeOn]}
                      >
                        <Text style={styles.codeText}>
                          {item.code.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.langTextWrap}>
                        <Text style={styles.langText} numberOfLines={1}>
                          {item.native}
                        </Text>
                        {showSub && (
                          <Text style={styles.langSub} numberOfLines={1}>
                            {item.label}
                          </Text>
                        )}
                      </View>
                    </View>

                    {active && (
                      <View style={styles.checkCircle}>
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {!fromSettings && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleContinue}
            disabled={!selected || applying}
          >
            <LinearGradient
              colors={['#178C45', '#25C866']}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{t('common.continue')}</Text>
              <Text style={styles.arrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.noteRow}>
            <ShieldCheck size={15} color="#8FA0BA" strokeWidth={2.2} />
            <Text style={styles.noteText}>{t('language.note')}</Text>
          </View>
        </View>
      )}

      {applying && (
        <View style={styles.loaderOverlay} pointerEvents="auto">
          <View style={styles.loaderPill}>
            <ActivityIndicator size="small" color={GREEN} />
            <Text style={styles.loaderText}>{t('language.applying')}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
export default LanguageScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F3',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  imageWrapper: {
    width: width,
    height: height * 0.3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    marginTop: -36,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 6,
  },
  flatCard: {
    marginTop: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  greenText: {
    color: '#23A85B',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    textAlign: 'center',
  },
  searchBox: {
    marginTop: 22,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E1E7EF',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: DARK,
    paddingVertical: 0,
  },
  list: {
    marginTop: 18,
  },
  empty: {
    textAlign: 'center',
    color: '#8FA0BA',
    padding: 16,
  },
  langCard: {
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E1E7EF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeCard: {
    borderColor: GREEN,
    backgroundColor: '#EFFBF4',
  },
  langLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBadge: {
    minWidth: 46,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 16,
  },
  codeBadgeOn: {
    backgroundColor: '#D7F5E3',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '900',
    color: GREEN,
  },
  langTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  langText: {
    fontSize: 18,
    color: '#252A31',
    fontWeight: '800',
  },
  langSub: {
    marginTop: 2,
    fontSize: 13,
    color: '#8FA0BA',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  button: {
    height: 62,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  arrow: {
    marginLeft: 12,
    fontSize: 26,
    color: '#FFFFFF',
  },
  noteRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#8FA0BA',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 100,
  },
  loaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E8E6',
    elevation: 6,
  },
  loaderText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: GREEN,
  },
});
