import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  ArrowRight,
} from 'lucide-react-native';
import {COLORS, rf, PAGE_PADDING} from '../../components/gov/theme';
import {
  Screen,
  ScreenHeader,
  SchemeIcon,
  Pill,
  StatusPill,
  STATUS_STYLE,
} from '../../components/gov/SchemeUi';
import {GOV_ROUTES} from '../../constants/govRoutes';
import {getSchemeById} from '../../data/govSchemes';
import {checkScheme} from '../../utils/schemeEligibility';
import {useGovData, openOfficialSite} from '../../utils/useGovData';
import {useTranslation} from 'react-i18next';
import {catLabel, levelLabel} from '../../utils/schemeLabels';

const Section = ({title, children}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Bullets = ({items, color = COLORS.DARK_GREEN}) =>
  items.map((text, i) => (
    <View key={i} style={styles.bulletRow}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  ));

export default function SchemeDetailScreen({navigation, route}) {
  const {t} = useTranslation();
  const scheme = getSchemeById(route?.params?.id);
  const {profile, hasProfile, applications} = useGovData();

  if (!scheme) {
    return (
      <Screen>
        <ScreenHeader title={t('govUi.schemeTitle')} onBack={() => navigation?.goBack()} />
        <Text style={styles.missing}>{t('govUi.notFound')}</Text>
      </Screen>
    );
  }

  const result = hasProfile ? checkScheme(scheme, profile) : null;
  const tracked = applications.find(a => a.schemeId === scheme.id);

  return (
    <Screen>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader title={t('govUi.schemeDetails')} onBack={() => navigation?.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <SchemeIcon scheme={scheme} size={52} />
          <Text style={styles.name}>{scheme.name}</Text>
          <Text style={styles.desc}>{scheme.desc}</Text>
          <View style={styles.tags}>
            <Pill label={levelLabel(t, scheme.level)} bg="#DBEAFE" fg={COLORS.BLUE} />
            <Pill label={catLabel(t, scheme)} bg="#FFEDD5" fg={COLORS.ORANGE} />
            {result ? <StatusPill status={result.status} /> : null}
          </View>
        </View>

        {result ? (
          <Section title={t('govUi.yourEligibility')}>
            {result.checks.map((c, i) => {
              const Icon =
                c.result === true
                  ? CheckCircle2
                  : c.result === false
                  ? XCircle
                  : HelpCircle;
              const color =
                c.result === true
                  ? COLORS.DARK_GREEN
                  : c.result === false
                  ? COLORS.RED
                  : COLORS.YELLOW;
              return (
                <View key={i} style={styles.checkRow}>
                  <Icon size={rf(16)} color={color} strokeWidth={2.4} />
                  <Text style={styles.bulletText}>{c.label}</Text>
                </View>
              );
            })}
            <Text style={[styles.note, {color: STATUS_STYLE[result.status].fg}]}>
              {result.status === 'eligible'
                ? t('govUi.noteEligible')
                : result.status === 'maybe'
                ? t('govUi.noteMaybe')
                : t('govUi.noteNot')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate(GOV_ROUTES.ELIGIBILITY_CHECK)}>
              <Text style={styles.link}>{t('govUi.updateDetails')}</Text>
            </TouchableOpacity>
          </Section>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation?.navigate(GOV_ROUTES.ELIGIBILITY_CHECK)}
            style={styles.eligBanner}>
            <Text style={styles.eligBannerText}>
              {t('govUi.checkIfEligible')}
            </Text>
            <ArrowRight size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <Section title={t('govUi.benefits')}>
          <Bullets items={scheme.benefits} />
        </Section>

        <Section title={t('govUi.whoCanApply')}>
          <Bullets items={scheme.eligibility} />
        </Section>

        {scheme.exclusions.length > 0 && (
          <Section title={t('govUi.notEligibleIf')}>
            <Bullets items={scheme.exclusions} color={COLORS.RED} />
          </Section>
        )}

        <Section title={t('govUi.documentsNeeded')}>
          <Bullets items={scheme.documents} color={COLORS.BLUE} />
        </Section>

        <Section title={t('govUi.howToApply')}>
          {scheme.steps.map((s, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.bulletText}>{s}</Text>
            </View>
          ))}
        </Section>

        {scheme.helpline ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`tel:${scheme.helpline}`)}
            style={styles.helpline}>
            <Phone size={rf(16)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.helplineText}>
              {t('govUi.helpline', {number: scheme.helpline})}
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.disclaimer}>
          {t('govUi.disclaimer')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openOfficialSite(scheme.applyUrl)}
          style={styles.primaryBtn}>
          <ExternalLink size={rf(16)} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.primaryText}>{t('govUi.applyOfficial')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            navigation?.navigate(GOV_ROUTES.MY_APPLICATIONS, {
              trackSchemeId: scheme.id,
            })
          }
          style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>
            {tracked ? t('govUi.viewMyApplication') : t('govUi.iHaveApplied')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {padding: PAGE_PADDING, paddingBottom: 40, gap: 12},
  missing: {textAlign: 'center', marginTop: 60, color: COLORS.MUTED},
  hero: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 8,
  },
  name: {fontSize: rf(19), fontWeight: '900', color: COLORS.DARK},
  desc: {fontSize: rf(13), color: COLORS.MUTED, lineHeight: rf(18)},
  tags: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2},
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 8,
  },
  cardTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  bulletRow: {flexDirection: 'row', gap: 10, alignItems: 'flex-start'},
  checkRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  dot: {width: 6, height: 6, borderRadius: 3, marginTop: 7},
  bulletText: {
    flex: 1,
    fontSize: rf(13),
    color: COLORS.DARK,
    lineHeight: rf(19),
    fontWeight: '500',
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
  note: {fontSize: rf(12.5), fontWeight: '800', marginTop: 4},
  link: {fontSize: rf(12.5), fontWeight: '900', color: COLORS.DARK_GREEN},
  eligBanner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eligBannerText: {
    flex: 1,
    fontSize: rf(13),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  helpline: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helplineText: {fontSize: rf(13), fontWeight: '800', color: COLORS.DARK},
  disclaimer: {fontSize: rf(11.5), color: COLORS.MUTED, lineHeight: rf(16)},
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  secondaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK_GREEN},
});
