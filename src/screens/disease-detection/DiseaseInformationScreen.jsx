import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Share2,
  Info,
  Circle,
  Users,
  AlignLeft,
  TrendingUp,
  Droplet,
  Navigation,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Upload,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const BRIGHT_GREEN = '#1FC45A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const PAGE_BG = '#FAFBFA';
const ORANGE = '#F97316';
const BLUE = '#3B82F6';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

// ─── LOCAL IMAGE ASSET ──────────────────────────────────────────
// Uses the same crop preview from: assets/gov/crop-photo.png
const CROP_PHOTO = require('../../assets/gov/crop-photo.png');
// ────────────────────────────────────────────────────────────────

const SYMPTOMS = [
  {id: 'brown', title: 'Brown Spots', Icon: Circle, color: ORANGE, bg: '#FFF7ED'},
  {id: 'yellow', title: 'Yellow Leaves', Icon: Users, color: DARK_GREEN, bg: '#EAFBF0'},
  {id: 'dry', title: 'Dry Leaf Edges', Icon: AlignLeft, color: DARK_GREEN, bg: '#EAFBF0'},
  {id: 'growth', title: 'Reduced Growth', Icon: TrendingUp, color: DARK_GREEN, bg: '#EAFBF0'},
];

const CAUSES = [
  {id: 'humidity', title: 'High Humidity', Icon: Droplet, color: BLUE, bg: '#EFF6FF'},
  {id: 'irrigation', title: 'Excess Irrigation', Icon: Navigation, color: DARK_GREEN, bg: '#EAFBF0'},
  {id: 'fungal', title: 'Fungal Infection', Icon: Circle, color: ORANGE, bg: '#FFF7ED'},
  {id: 'residues', title: 'Infected Residues', Icon: Trash2, color: '#64748B', bg: '#F1F5F9'},
];

const AFFECTED_CROPS = ['Maize', 'Cotton', 'Soybean', 'Tomato', 'Chilli', 'Wheat'];

const PREVENTION_TIPS = [
  'Remove infected leaves and plant waste immediately.',
  'Avoid overhead irrigation; use drip irrigation instead.',
  'Ensure proper spacing between plants for air circulation.',
  'Rotate crops every season to break disease cycles.',
];

export default function DiseaseInformationScreen({navigation, route}) {
  const [selectedCrop, setSelectedCrop] = useState('Maize');

  // Accept a diseaseImage from route params, otherwise fall back to local asset.
  const diseaseSource = route?.params?.diseaseImage
    ? {uri: route.params.diseaseImage}
    : CROP_PHOTO;

  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };

  const handleViewTreatment = () => {
    Alert.alert('View Treatment', 'Opening treatment details...');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          style={styles.iconButton}>
          <ArrowLeft size={rf(20)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Disease Information</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
          <Share2 size={rf(18)} color={DARK} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Disease Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardLeft}>
            <View style={styles.fungalPill}>
              <Text style={styles.fungalPillText}>Fungal Disease</Text>
            </View>

            <Text style={styles.diseaseName}>Leaf Spot</Text>
            <Text style={styles.diseaseSubname}>Alternaria alternata</Text>

            <View style={styles.tagsRow}>
              <View style={[styles.tagPill, {backgroundColor: '#FFF7ED'}]}>
                <View style={[styles.tagDot, {backgroundColor: ORANGE}]} />
                <Text style={[styles.tagText, {color: ORANGE}]}>Moderate</Text>
              </View>

              <View style={[styles.tagPill, {backgroundColor: '#EAFBF0'}]}>
                <Text style={[styles.tagIcon, {color: DARK_GREEN}]}>▲</Text>
                <Text style={[styles.tagText, {color: DARK_GREEN}]}>Maize</Text>
              </View>
            </View>
          </View>

          <Image
            source={diseaseSource}
            style={styles.headerCardImage}
            resizeMode="cover"
          />
        </View>

        {/* About This Disease */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIconCircle}>
              <Info size={rf(15)} color={DARK_GREEN} strokeWidth={2.3} />
            </View>
            <Text style={styles.aboutTitle}>About This Disease</Text>
          </View>

          <Text style={styles.aboutParagraph}>
            Leaf Spot disease is caused by the fungus{' '}
            <Text style={styles.italicText}>Alternaria alternata</Text>. It
            commonly attacks the leaves of crops and weakens the plant over time.
          </Text>

          <Text style={styles.aboutParagraph}>
            The disease spreads through water droplets, wind, and infected plant
            material. Warm and humid conditions make it grow faster.
          </Text>

          <Text style={styles.aboutParagraph}>
            If left untreated, it can reduce crop yield by up to 40%. Early
            detection and timely action can save your harvest.
          </Text>
        </View>

        {/* Symptoms */}
        <Text style={styles.sectionTitle}>Symptoms</Text>

        <View style={styles.gridRow}>
          {SYMPTOMS.map(item => {
            const Icon = item.Icon;
            return (
              <View key={item.id} style={styles.symptomCard}>
                <View style={[styles.gridIconCircle, {backgroundColor: item.bg}]}>
                  <Icon size={rf(15)} color={item.color} strokeWidth={2.3} />
                </View>
                <Text style={styles.symptomText}>{item.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Causes */}
        <Text style={styles.sectionTitle}>Causes</Text>

        <View style={styles.causesRow}>
          {CAUSES.map(item => {
            const Icon = item.Icon;
            return (
              <View key={item.id} style={styles.causeCard}>
                <View style={[styles.gridIconCircle, {backgroundColor: item.bg}]}>
                  <Icon size={rf(14)} color={item.color} strokeWidth={2.3} />
                </View>
                <Text style={styles.causeText}>{item.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Affected Crops */}
        <Text style={styles.sectionTitle}>Affected Crops</Text>

        <View style={styles.cropsRow}>
          {AFFECTED_CROPS.map(crop => {
            const isSelected = crop === selectedCrop;
            return (
              <TouchableOpacity
                key={crop}
                activeOpacity={0.85}
                onPress={() => setSelectedCrop(crop)}
                style={[styles.cropPill, isSelected && styles.selectedCropPill]}>
                <Text
                  style={[
                    styles.cropText,
                    isSelected && styles.selectedCropText,
                  ]}>
                  {crop}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Disease Spread */}
        <View style={styles.spreadCard}>
          <View style={styles.spreadHeader}>
            <View style={styles.spreadIconCircle}>
              <AlertCircle size={rf(15)} color={ORANGE} strokeWidth={2.4} />
            </View>
            <Text style={styles.spreadTitle}>Disease Spread</Text>
          </View>

          <View style={styles.spreadBarRow}>
            <View style={[styles.spreadSegment, {backgroundColor: '#DCFCE7'}]} />
            <View style={[styles.spreadSegment, {backgroundColor: ORANGE}]} />
            <View style={[styles.spreadSegment, {backgroundColor: '#F1F5F9'}]} />
          </View>

          <View style={styles.spreadLabelsRow}>
            <Text style={styles.spreadLabel}>Low</Text>
            <View style={styles.spreadMediumBox}>
              <Text style={styles.spreadMediumLabel}>Medium</Text>
              <View style={styles.spreadDot} />
            </View>
            <Text style={styles.spreadLabel}>High</Text>
          </View>
        </View>

        {/* Prevention Tips */}
        <View style={styles.preventionCard}>
          <View style={styles.preventionHeader}>
            <View style={styles.preventionIconCircle}>
              <ShieldCheck size={rf(15)} color={DARK_GREEN} strokeWidth={2.4} />
            </View>
            <Text style={styles.preventionTitle}>Prevention Tips</Text>
          </View>

          <View style={styles.tipsList}>
            {PREVENTION_TIPS.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleViewTreatment}
          style={styles.primaryButton}>
          <Upload size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>View Treatment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleBack}
          style={styles.secondaryButton}>
          <ArrowLeft size={rf(15)} color={DARK_GREEN} strokeWidth={2.4} />
          <Text style={styles.secondaryButtonText}>Back to Result</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},

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
  headerTextBox: {flex: 1, marginHorizontal: 12, alignItems: 'center'},
  headerTitle: {fontSize: rf(17), fontWeight: '900', color: DARK},

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 160,
    backgroundColor: PAGE_BG,
  },

  headerCard: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCardLeft: {flex: 1},
  fungalPill: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  fungalPillText: {fontSize: rf(8), fontWeight: '900', color: DARK_GREEN},
  diseaseName: {marginTop: 8, fontSize: rf(20), fontWeight: '900', color: DARK},
  diseaseSubname: {
    marginTop: 2,
    fontSize: rf(10),
    fontStyle: 'italic',
    fontWeight: '500',
    color: MUTED,
  },
  tagsRow: {marginTop: 10, flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  tagPill: {
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tagDot: {width: 6, height: 6, borderRadius: 3},
  tagIcon: {fontSize: rf(8), fontWeight: '900'},
  tagText: {fontSize: rf(9), fontWeight: '900'},
  headerCardImage: {
    width: 100,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },

  aboutCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  aboutIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: {fontSize: rf(13), fontWeight: '900', color: DARK},
  aboutParagraph: {
    marginTop: 10,
    fontSize: rf(10),
    lineHeight: rf(16),
    fontWeight: '500',
    color: '#4B5563',
  },
  italicText: {fontStyle: 'italic', fontWeight: '700'},

  sectionTitle: {
    marginTop: 19,
    marginBottom: 10,
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  symptomCard: {
    width: '48.5%',
    minHeight: 62,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gridIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomText: {
    flex: 1,
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '900',
    color: DARK,
  },

  causesRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 6},
  causeCard: {
    flex: 1,
    minHeight: 78,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  causeText: {
    marginTop: 6,
    fontSize: rf(8),
    lineHeight: rf(11),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },

  cropsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  cropPill: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
  },
  selectedCropPill: {backgroundColor: DARK_GREEN, borderColor: DARK_GREEN},
  cropText: {fontSize: rf(10), fontWeight: '900', color: DARK},
  selectedCropText: {color: '#FFFFFF'},

  spreadCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  spreadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  spreadIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spreadTitle: {fontSize: rf(13), fontWeight: '900', color: DARK},
  spreadBarRow: {flexDirection: 'row', gap: 6, marginBottom: 8},
  spreadSegment: {flex: 1, height: 6, borderRadius: 3},
  spreadLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spreadLabel: {
    flex: 1,
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
    textAlign: 'left',
  },
  spreadMediumBox: {flex: 1, alignItems: 'center'},
  spreadMediumLabel: {fontSize: rf(9), fontWeight: '900', color: ORANGE},
  spreadDot: {
    marginTop: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },

  preventionCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: DARK_GREEN,
  },
  preventionHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  preventionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preventionTitle: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  tipsList: {marginTop: 14, gap: 10},
  tipRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  tipBullet: {
    marginTop: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  tipText: {
    flex: 1,
    fontSize: rf(10),
    lineHeight: rf(15),
    fontWeight: '700',
    color: '#FFFFFF',
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
  primaryButtonText: {fontSize: rf(12), fontWeight: '900', color: '#FFFFFF'},
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
  secondaryButtonText: {fontSize: rf(12), fontWeight: '900', color: DARK_GREEN},
});