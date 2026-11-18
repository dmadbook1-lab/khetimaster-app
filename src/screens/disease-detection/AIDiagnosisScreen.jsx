import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowLeft,
  Share2,
  Check,
  Clock,
  ShieldCheck,
  MoreHorizontal,
  Maximize2,
  Sprout,
  Code2,
  Grid3x3,
  AlertTriangle,
  FileText,
  Camera,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {tOpt} from '../../utils/tOpt';
const { width } = Dimensions.get('window');
const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const PAGE_BG = '#FAFBFA';
const ORANGE = '#F97316';
const AMBER = '#F59E0B';
const PAGE_PADDING = width * 0.037;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const CROP_PHOTO = require('../../assets/gov/crop-photo.png');
const SUMMARY_ITEMS = [
  {
    id: 'crop',
    get label() {
    return i18n.t('common.crop');
  },
    value: 'Maize / Corn',
    Icon: Sprout,
  },
  {
    id: 'area',
    get label() {
    return i18n.t('aIDiagnosis.affectedArea');
  },
    value: '~35%',
    Icon: Grid3x3,
  },
  {
    id: 'disease',
    get label() {
    return i18n.t('aIDiagnosis.disease');
  },
    get value() {
    return i18n.t('aIDiagnosis.leafSpot');
  },
    Icon: Code2,
  },
  {
    id: 'severity',
    get label() {
    return i18n.t('aIDiagnosis.severity');
  },
    value: 'Moderate',
    Icon: AlertTriangle,
  },
];
export default function AIDiagnosisScreen({ navigation, route }) {
  const {t} = useTranslation();
  const confidence = 92;
  const CIRCLE_SIZE = 82;
  const STROKE_WIDTH = 8;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (confidence / 100) * CIRCUMFERENCE;
  const photoSource = route?.params?.photoUri
    ? {
        uri: route.params.photoUri,
      }
    : CROP_PHOTO;
  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };
  const handleViewDetails = () => {
    navigation.navigate('DiseaseInformation');
  };
  const handleAnalyzeAnother = () => {
    navigation?.navigate('DiseaseDetection');
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.iconButton}
        >
          <ArrowLeft size={rf(20)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>{t('aIDiagnosis.aiDiagnosis')}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
          <Share2 size={rf(18)} color={DARK} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.completedBanner}>
          <View style={styles.completedIcon}>
            <Check size={rf(14)} color="#FFFFFF" strokeWidth={3} />
          </View>
          <View style={styles.completedTextBox}>
            <Text style={styles.completedTitle}>{t('aIDiagnosis.analysisCompleted')}</Text>
            <Text style={styles.completedSubtitle}>
              {t('aIDiagnosis.diseaseDetectedSuccessfully')}
            </Text>
          </View>
          <MoreHorizontal size={rf(18)} color="#64748B" strokeWidth={2.2} />
        </View>

        {}
        <View style={styles.diagnosisCard}>
          <View style={styles.diagnosisTop}>
            <View style={styles.confidenceCircleWrap}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke="#E5E7EB"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={RADIUS}
                  stroke={BRIGHT_GREEN}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  rotation="-90"
                  origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.confidenceTextBox}>
                <Text style={styles.confidencePercent}>{confidence}%</Text>
                <Text style={styles.confidenceLabel}>{t('aIDiagnosis.confidence')}</Text>
              </View>
            </View>

            <View style={styles.diagnosisTextBox}>
              <Text style={styles.detectedLabel}>{t('aIDiagnosis.detected')}</Text>
              <Text style={styles.diseaseName}>{t('aIDiagnosis.leafSpot')}</Text>
              <Text style={styles.diseaseSubname}>{t('aIDiagnosis.alternariaLeafSpot')}</Text>

              <View style={styles.severityPill}>
                <View style={styles.severityDot} />
                <Text style={styles.severityText}>{t('aIDiagnosis.moderateInfection')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.diagnosisFooter}>
            <View style={styles.footerLeft}>
              <Clock size={rf(11)} color={MUTED} strokeWidth={2.2} />
              <Text style={styles.footerLeftText}>{t('aIDiagnosis.analyzedJustNow')}</Text>
            </View>

            <View style={styles.footerRight}>
              <ShieldCheck size={rf(11)} color={DARK_GREEN} strokeWidth={2.4} />
              <Text style={styles.footerRightText}>{t('aIDiagnosis.khetimasterAi')}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.affectedImageCard}>
          <Image
            source={photoSource}
            style={styles.affectedImage}
            resizeMode="cover"
          />

          <View style={styles.affectedBadge}>
            <View style={styles.affectedDot} />
            <Text style={styles.affectedText}>{t('aIDiagnosis.affectedArea')}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.expandButton}>
            <Maximize2 size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          {}
          <View style={styles.highlightCircle}>
            <View style={styles.highlightInnerDot} />
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>{t('aIDiagnosis.diagnosisSummary')}</Text>

        <View style={styles.summaryGrid}>
          {SUMMARY_ITEMS.map(item => {
            const Icon = item.Icon;
            return (
              <View key={item.id} style={styles.summaryCard}>
                <View style={styles.summaryIconCircle}>
                  <Icon size={rf(14)} color={DARK_GREEN} strokeWidth={2.3} />
                </View>
                <View style={styles.summaryTextBox}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{tOpt(item.value)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {}
        <Text style={styles.sectionTitle}>{t('aIDiagnosis.aboutThisDisease')}</Text>

        <Text style={styles.aboutText}>
          {t('aIDiagnosis.leafSpotIsAFungal')}
        </Text>

        {}
        <View style={styles.aiConfidenceCard}>
          <View style={styles.aiConfidenceTop}>
            <View style={styles.aiConfidenceIcon}>
              <ShieldCheck size={rf(16)} color={DARK_GREEN} strokeWidth={2.3} />
            </View>

            <View style={styles.aiConfidenceTextBox}>
              <Text style={styles.aiConfidenceTitle}>{t('aIDiagnosis.aiConfidence')}</Text>
              <Text style={styles.aiConfidenceSubtitle}>{t('aIDiagnosis.highConfidence')}</Text>
            </View>

            <Text style={styles.aiConfidencePercent}>92%</Text>
          </View>

          <View style={styles.confidenceBarBg}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: '92%',
                },
              ]}
            />
          </View>

          <Text style={styles.aiConfidenceCaption}>
            {t('aIDiagnosis.basedOnImageQualityAnd')}
          </Text>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleViewDetails}
          style={styles.primaryButton}
        >
          <FileText size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>{t('aIDiagnosis.viewDiseaseDetails')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleAnalyzeAnother}
          style={styles.secondaryButton}
        >
          <Camera size={rf(15)} color={DARK_GREEN} strokeWidth={2.4} />
          <Text style={styles.secondaryButtonText}>{t('aIDiagnosis.analyzeAnotherPhoto')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 61,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },
  iconButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBox: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 160,
    backgroundColor: PAGE_BG,
  },
  completedBanner: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  completedIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTextBox: {
    flex: 1,
  },
  completedTitle: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  completedSubtitle: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '500',
    color: '#4B5563',
  },
  diagnosisCard: {
    marginTop: 12,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  diagnosisTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  confidenceCircleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceTextBox: {
    position: 'absolute',
    alignItems: 'center',
  },
  confidencePercent: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  confidenceLabel: {
    marginTop: 1,
    fontSize: rf(7),
    fontWeight: '600',
    color: MUTED,
  },
  diagnosisTextBox: {
    flex: 1,
  },
  detectedLabel: {
    fontSize: rf(8),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  diseaseName: {
    marginTop: 4,
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
  },
  diseaseSubname: {
    marginTop: 2,
    fontSize: rf(10),
    fontStyle: 'italic',
    fontWeight: '500',
    color: MUTED,
  },
  severityPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  severityText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: ORANGE,
  },
  diagnosisFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerLeftText: {
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerRightText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  affectedImageCard: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  affectedImage: {
    width: '100%',
    height: 200,
  },
  affectedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  affectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  affectedText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCircle: {
    position: 'absolute',
    top: '38%',
    left: '38%',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2.5,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
  sectionTitle: {
    marginTop: 19,
    marginBottom: 10,
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  summaryCard: {
    width: '48.5%',
    minHeight: 58,
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#F5F8F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  summaryLabel: {
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },
  summaryValue: {
    marginTop: 2,
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  aboutText: {
    fontSize: rf(10),
    lineHeight: rf(16),
    fontWeight: '500',
    color: '#4B5563',
  },
  aiConfidenceCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
  },
  aiConfidenceTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiConfidenceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiConfidenceTextBox: {
    flex: 1,
    marginLeft: 11,
  },
  aiConfidenceTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiConfidenceSubtitle: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '500',
    color: '#D1FAE5',
  },
  aiConfidencePercent: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  confidenceBarBg: {
    height: 6,
    marginTop: 12,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  aiConfidenceCaption: {
    marginTop: 8,
    fontSize: rf(8),
    fontWeight: '500',
    color: '#D1FAE5',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
  },
  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  secondaryButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK_GREEN,
  },
});
