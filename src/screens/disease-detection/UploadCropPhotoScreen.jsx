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
  ShieldCheck,
  Check,
  Minus,
  AlertTriangle,
  Leaf,
  Sun,
  Hand,
  ScanLine,
  HelpCircle,
  ChevronDown,
  Image as ImageIcon,
  RefreshCw,
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
const AMBER = '#F59E0B';
const PURPLE = '#A855F7';
const BLUE = '#3B82F6';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

// ─── LOCAL IMAGE ASSETS ─────────────────────────────────────────
// Place these files in: assets/gov/
//   1. crop-photo.png       → main uploaded crop preview
//   2. sample-cotton.png    → sample "good photo" — cotton leaf
//   3. sample-rice.png      → sample "good photo" — rice leaf
//   4. sample-tomato.png    → sample "good photo" — tomato leaf
const CROP_PHOTO = require('../../assets/gov/crop-photo.png');
const SAMPLE_COTTON = require('../../assets/gov/sample-cotton.jpg');
const SAMPLE_RICE = require('../../assets/gov/sample-rice.jpg');
const SAMPLE_TOMATO = require('../../assets/gov/sample-tomato.jpg');
// ────────────────────────────────────────────────────────────────

const QUALITY_CHECKS = [
  {id: 'leaf', label: 'Leaf clearly visible', status: 'good', value: 'Good'},
  {id: 'lighting', label: 'Good lighting', status: 'good', value: 'Good'},
  {id: 'sharpness', label: 'Image sharpness', status: 'low', value: 'Low'},
];

const GUIDELINES = [
  {id: 'leaf', title: 'One affected leaf', Icon: Leaf, color: DARK_GREEN, bg: '#EAFBF0'},
  {id: 'daylight', title: 'Good daylight', Icon: Sun, color: ORANGE, bg: '#FFF7ED'},
  {id: 'steady', title: 'Keep camera steady', Icon: Hand, color: PURPLE, bg: '#F5F3FF'},
  {id: 'focus', title: 'Focus on damaged area', Icon: ScanLine, color: BLUE, bg: '#EFF6FF'},
];

const SAMPLE_IMAGES = [
  {id: 'cotton', name: 'Cotton', source: SAMPLE_COTTON},
  {id: 'rice', name: 'Rice', source: SAMPLE_RICE},
  {id: 'tomato', name: 'Tomato', source: SAMPLE_TOMATO},
];

export default function UploadCropPhotoScreen({navigation, route}) {
  const [helpExpanded, setHelpExpanded] = useState(true);

  // Accept a photoUri from route params (from camera/gallery),
  // otherwise fall back to the bundled local preview.
  const photoSource = route?.params?.photoUri
    ? {uri: route.params.photoUri}
    : CROP_PHOTO;

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Change Photo', 'Choose a new photo.');
  };

  const handleDetectDisease = () => {
    navigation.navigate('AIDetection');
  };

  const handleRetakePhoto = () => {
    Alert.alert('Retake Photo', 'Camera will reopen.');
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
          <Text style={styles.headerTitle}>Upload Crop Photo</Text>
          <Text numberOfLines={2} style={styles.headerSubtitle}>
            Take a clear photo of the affected crop part.
          </Text>
        </View>

        <View style={styles.iconButtonPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Photo Preview Card */}
        <View style={styles.photoCard}>
          <Image
            source={photoSource}
            style={styles.photoImage}
            resizeMode="cover"
          />

          {/* Photo Selected Badge */}
          <View style={styles.photoSelectedBadge}>
            <View style={styles.photoSelectedDot} />
            <Text style={styles.photoSelectedText}>Photo Selected</Text>
          </View>

          {/* Corner Brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Bottom row - filename + change photo */}
          <View style={styles.photoBottomRow}>
            <View style={styles.filenameBox}>
              <Text style={styles.filenameText}>
                tomato_leaf_01.jpg • 2.4 MB
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleChangePhoto}
              style={styles.changePhotoButton}>
              <ImageIcon size={rf(13)} color="#FFFFFF" strokeWidth={2.3} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Quality Card */}
        <View style={styles.qualityCard}>
          <View style={styles.qualityHeader}>
            <ShieldCheck size={rf(18)} color={DARK_GREEN} strokeWidth={2.3} />
            <Text style={styles.qualityTitle}>Photo Quality</Text>
            <View style={styles.passedBadge}>
              <Text style={styles.passedText}>2/3 Passed</Text>
            </View>
          </View>

          <View style={styles.qualityList}>
            {QUALITY_CHECKS.map(item => {
              const isGood = item.status === 'good';
              return (
                <View key={item.id} style={styles.qualityRow}>
                  <View
                    style={[
                      styles.qualityCheckIcon,
                      {backgroundColor: isGood ? '#EAFBF0' : '#FFF7ED'},
                    ]}>
                    {isGood ? (
                      <Check size={rf(11)} color={DARK_GREEN} strokeWidth={3} />
                    ) : (
                      <Minus size={rf(11)} color={ORANGE} strokeWidth={3} />
                    )}
                  </View>

                  <Text style={styles.qualityLabel}>{item.label}</Text>

                  <Text
                    style={[
                      styles.qualityValue,
                      {color: isGood ? DARK_GREEN : ORANGE},
                    ]}>
                    {item.value}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.warningBox}>
            <AlertTriangle
              size={rf(15)}
              color={AMBER}
              strokeWidth={2.3}
              style={{marginTop: 1}}
            />
            <Text style={styles.warningText}>
              Image sharpness is low. For best results, retake the photo with a
              steady hand in good light.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Photo Guidelines</Text>

        <View style={styles.guidelinesGrid}>
          {GUIDELINES.map(item => {
            const Icon = item.Icon;
            return (
              <View key={item.id} style={styles.guidelineCard}>
                <View
                  style={[
                    styles.guidelineIconCircle,
                    {backgroundColor: item.bg},
                  ]}>
                  <Icon size={rf(17)} color={item.color} strokeWidth={2.2} />
                </View>
                <Text style={styles.guidelineText}>{item.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Need Help Card */}
        <View style={styles.helpCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setHelpExpanded(prev => !prev)}
            style={styles.helpHeader}>
            <View style={styles.helpIconCircle}>
              <HelpCircle size={rf(17)} color={DARK_GREEN} strokeWidth={2.3} />
            </View>

            <View style={styles.helpTextBox}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpSubtitle}>
                View sample images for better detection accuracy.
              </Text>
            </View>

            <ChevronDown
              size={rf(18)}
              color="#94A3B8"
              strokeWidth={2.3}
              style={{
                transform: [{rotate: helpExpanded ? '180deg' : '0deg'}],
              }}
            />
          </TouchableOpacity>

          {helpExpanded && (
            <View style={styles.helpContent}>
              <Text style={styles.helpSectionTitle}>GOOD PHOTO EXAMPLES:</Text>

              <View style={styles.samplesRow}>
                {SAMPLE_IMAGES.map(sample => (
                  <View key={sample.id} style={styles.sampleCard}>
                    <Image
                      source={sample.source}
                      style={styles.sampleImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.sampleName}>{sample.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleDetectDisease}
          style={styles.detectButton}>
          <ScanLine size={rf(17)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.detectButtonText}>Detect Disease</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleRetakePhoto}
          style={styles.retakeButton}>
          <RefreshCw size={rf(15)} color={DARK_GREEN} strokeWidth={2.4} />
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},

  header: {
    minHeight: 66,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {width: 39, height: 39},
  headerTextBox: {flex: 1, marginHorizontal: 12, alignItems: 'center'},
  headerTitle: {fontSize: rf(17), lineHeight: rf(21), fontWeight: '900', color: DARK},
  headerSubtitle: {
    marginTop: 3,
    fontSize: rf(9),
    lineHeight: rf(13),
    fontWeight: '500',
    color: MUTED,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 155,
    backgroundColor: PAGE_BG,
  },

  photoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  photoImage: {width: '100%', height: 220},

  photoSelectedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoSelectedDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: BRIGHT_GREEN},
  photoSelectedText: {fontSize: rf(8), fontWeight: '900', color: '#FFFFFF'},

  corner: {position: 'absolute', width: 22, height: 22, borderColor: '#FFFFFF'},
  cornerTL: {top: 44, left: 30, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4},
  cornerTR: {top: 44, right: 30, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4},
  cornerBL: {bottom: 62, left: 30, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4},
  cornerBR: {bottom: 62, right: 30, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4},

  photoBottomRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filenameBox: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
  },
  filenameText: {fontSize: rf(8), fontWeight: '600', color: '#FFFFFF'},
  changePhotoButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 7,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changePhotoText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},

  qualityCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  qualityHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  qualityTitle: {flex: 1, fontSize: rf(13), fontWeight: '900', color: DARK},
  passedBadge: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  passedText: {fontSize: rf(8), fontWeight: '800', color: '#64748B'},

  qualityList: {marginTop: 12, gap: 12},
  qualityRow: {flexDirection: 'row', alignItems: 'center'},
  qualityCheckIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityLabel: {flex: 1, marginLeft: 10, fontSize: rf(10), fontWeight: '600', color: DARK},
  qualityValue: {fontSize: rf(10), fontWeight: '900'},

  warningBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF9E7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: rf(9),
    lineHeight: rf(13),
    fontWeight: '500',
    color: '#92400E',
  },

  sectionTitle: {marginTop: 19, marginBottom: 10, fontSize: rf(14), fontWeight: '900', color: DARK},

  guidelinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  guidelineCard: {
    width: '48.5%',
    minHeight: 96,
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineText: {
    marginTop: 8,
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },

  helpCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  helpHeader: {flexDirection: 'row', alignItems: 'center'},
  helpIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTextBox: {flex: 1, marginLeft: 11},
  helpTitle: {fontSize: rf(12), fontWeight: '900', color: DARK},
  helpSubtitle: {marginTop: 3, fontSize: rf(9), lineHeight: rf(13), fontWeight: '500', color: MUTED},

  helpContent: {marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#EEF1F2'},
  helpSectionTitle: {fontSize: rf(8), fontWeight: '900', color: '#98A1AF', marginBottom: 10},

  samplesRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  sampleCard: {flex: 1, alignItems: 'center'},
  sampleImage: {width: '100%', height: 78, borderRadius: 8, backgroundColor: '#F1F5F9'},
  sampleName: {marginTop: 6, fontSize: rf(9), fontWeight: '800', color: DARK},

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
  detectButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  detectButtonText: {fontSize: rf(13), fontWeight: '900', color: '#FFFFFF'},
  retakeButton: {
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
  retakeButtonText: {fontSize: rf(12), fontWeight: '900', color: DARK_GREEN},
});