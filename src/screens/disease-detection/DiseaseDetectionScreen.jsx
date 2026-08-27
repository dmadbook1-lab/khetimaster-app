import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Bell,
  ScanLine,
  Zap,
  Camera,
  Plus,
  CloudUpload,
  Image as ImageIcon,
  Sun,
  Focus,
  Square,
  Globe,
  Upload,
  Cpu,
  ShieldCheck,
  FlaskConical,
  Sparkles,
  ScanSearch,
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
const PURPLE = '#A855F7';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const PHOTO_TIPS = [
  {id: 'daylight', title: 'Capture in daylight', Icon: Sun},
  {id: 'focus', title: 'Focus on affected area', Icon: Focus},
  {id: 'blur', title: 'Avoid blurry photos', Icon: Square},
  {id: 'oneleaf', title: 'One leaf per photo', Icon: Globe},
];

const HOW_IT_WORKS = [
  {
    id: '01',
    step: '01',
    title: 'Upload Photo',
    subtitle: 'Take or select a crop image',
    Icon: Upload,
    color: DARK_GREEN,
    bg: '#EAFBF0',
  },
  {
    id: '02',
    step: '02',
    title: 'AI Detection',
    subtitle: 'Our AI scans for diseases',
    Icon: Cpu,
    color: BLUE,
    bg: '#EFF6FF',
  },
  {
    id: '03',
    step: '03',
    title: 'Diagnosis Result',
    subtitle: 'Accurate disease report',
    Icon: ShieldCheck,
    color: PURPLE,
    bg: '#F5F3FF',
  },
  {
    id: '04',
    step: '04',
    title: 'Treatment Suggestion',
    subtitle: 'Tailored cure & prevention',
    Icon: FlaskConical,
    color: ORANGE,
    bg: '#FFF7ED',
  },
];

const SUPPORTED_CROPS = [
  {id: 'cotton', name: 'Cotton', emoji: '🌸', selected: true},
  {id: 'soybean', name: 'Soybean', emoji: '🫘'},
  {id: 'rice', name: 'Rice', emoji: '🌾'},
  {id: 'wheat', name: 'Wheat', emoji: '🌱'},
  {id: 'tomato', name: 'Tomato', emoji: '🍅'},
  {id: 'chilli', name: 'Chilli', emoji: '🌶️'},
];

export default function DiseaseDetectionScreen({navigation}) {
  const [selectedCrop, setSelectedCrop] = useState('cotton');

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
      return;
    }
  };

  const handleTakePhoto = () => {
    Alert.alert('Take Photo', 'Camera will open here.');
  };

  const handleGallery = () => {
    Alert.alert('Gallery', 'Gallery will open here.');
  };

 const handleStartDetection = () => {
  navigation.navigate('UploadCropPhoto');
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
          <Text style={styles.headerTitle}>Disease Detection</Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            Identify crop diseases instantly using AI.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
          <Bell size={rf(19)} color={DARK} strokeWidth={2.2} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <LinearGradient
          colors={['#158B3D', '#18A84A']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Sparkles
            size={rf(90)}
            color="rgba(255,255,255,0.10)"
            strokeWidth={1.5}
            style={styles.heroSparkle}
          />

          <View style={styles.heroTopRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE AI ENGINE</Text>
            </View>

            <View style={styles.scanIconBox}>
              <ScanLine size={rf(22)} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            AI Crop Disease{'\n'}Detection
          </Text>

          <Text style={styles.heroSubtitle}>
            Upload a photo of your crop and receive instant disease
            identification and treatment recommendations.
          </Text>

          <View style={styles.heroFooter}>
            <View style={styles.heroFooterIcon}>
              <Zap
                size={rf(11)}
                color="#FFFFFF"
                fill="#FFFFFF"
                strokeWidth={2}
              />
            </View>
            <Text style={styles.heroFooterText}>
              Results in under 5 seconds
            </Text>
          </View>
        </LinearGradient>

        {/* Upload Card */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconWrap}>
            <View style={styles.uploadIconCircle}>
              <Camera size={rf(26)} color={DARK_GREEN} strokeWidth={2.2} />
            </View>
            <View style={styles.uploadPlusBadge}>
              <Plus size={rf(11)} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.uploadTitle}>Upload Crop Photo</Text>
          <Text style={styles.uploadSubtitle}>
            Take or choose a clear photo of a leaf, stem, fruit or flower.
          </Text>

          <View style={styles.dropZone}>
            <CloudUpload size={rf(30)} color={DARK_GREEN} strokeWidth={1.8} />
            <Text style={styles.dropZoneText}>
              Drag & drop or use buttons below
            </Text>
          </View>

          <View style={styles.uploadButtonRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleTakePhoto}
              style={styles.takePhotoButton}>
              <Camera size={rf(15)} color="#FFFFFF" strokeWidth={2.3} />
              <Text style={styles.takePhotoButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleGallery}
              style={styles.galleryButton}>
              <ImageIcon size={rf(15)} color={DARK_GREEN} strokeWidth={2.3} />
              <Text style={styles.galleryButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsHeaderIcon}>
              <Sparkles
                size={rf(14)}
                color="#FFFFFF"
                strokeWidth={2.4}
                fill="#FFFFFF"
              />
            </View>
            <Text style={styles.tipsHeaderTitle}>Photo Tips</Text>
          </View>

          <View style={styles.tipsGrid}>
            {PHOTO_TIPS.map(tip => {
              const Icon = tip.Icon;
              return (
                <View key={tip.id} style={styles.tipItem}>
                  <View style={styles.tipIconCircle}>
                    <Icon size={rf(13)} color={DARK_GREEN} strokeWidth={2} />
                  </View>
                  <Text style={styles.tipText}>{tip.title}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howCard}>
          <View style={styles.howHeader}>
            <Text style={styles.howTitle}>How It Works</Text>
            <Text style={styles.howSteps}>4 STEPS</Text>
          </View>

          <View style={styles.howList}>
            {HOW_IT_WORKS.map((item, index) => {
              const Icon = item.Icon;
              const isLast = index === HOW_IT_WORKS.length - 1;
              return (
                <View key={item.id} style={styles.howRow}>
                  <View style={styles.howIconColumn}>
                    <View
                      style={[
                        styles.howIconBox,
                        {backgroundColor: item.bg},
                      ]}>
                      <Icon
                        size={rf(17)}
                        color={item.color}
                        strokeWidth={2.2}
                      />
                    </View>
                    {!isLast && <View style={styles.howConnector} />}
                  </View>

                  <View style={styles.howTextBox}>
                    <View style={styles.howTitleRow}>
                      <View
                        style={[
                          styles.stepBadge,
                          {backgroundColor: item.color},
                        ]}>
                        <Text style={styles.stepBadgeText}>{item.step}</Text>
                      </View>
                      <Text style={styles.howStepTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.howStepSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Supported Crops */}
        <View style={styles.cropsHeader}>
          <Text style={styles.cropsTitle}>Supported Crops</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.cropsViewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cropsGrid}>
          {SUPPORTED_CROPS.map(crop => {
            const isSelected = selectedCrop === crop.id;
            return (
              <TouchableOpacity
                key={crop.id}
                activeOpacity={0.85}
                onPress={() => setSelectedCrop(crop.id)}
                style={[
                  styles.cropPill,
                  isSelected && styles.selectedCropPill,
                ]}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                <Text
                  style={[
                    styles.cropName,
                    isSelected && styles.selectedCropName,
                  ]}>
                  {crop.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity activeOpacity={0.85} style={styles.cropPill}>
            <Plus size={rf(11)} color={MUTED} strokeWidth={2.4} />
            <Text style={styles.cropName}>More</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleStartDetection}
          style={styles.detectButton}>
          <ScanSearch size={rf(18)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.detectButtonText}>Start Detection</Text>
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

  headerTextBox: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: rf(17),
    lineHeight: rf(21),
    fontWeight: '900',
    color: DARK,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 105,
    backgroundColor: PAGE_BG,
  },

  // Hero card
  heroCard: {
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },

  heroSparkle: {
    position: 'absolute',
    right: -10,
    bottom: 10,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  liveBadge: {
    height: 22,
    paddingHorizontal: 9,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRIGHT_GREEN,
  },

  liveBadgeText: {
    fontSize: rf(7),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  scanIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    marginTop: 18,
    fontSize: rf(22),
    lineHeight: rf(28),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroSubtitle: {
    marginTop: 8,
    fontSize: rf(10),
    lineHeight: rf(15),
    fontWeight: '500',
    color: '#D1FAE5',
  },

  heroFooter: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  heroFooterIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroFooterText: {
    fontSize: rf(9),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Upload card
  uploadCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },

  uploadIconWrap: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadPlusBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  uploadTitle: {
    marginTop: 12,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  uploadSubtitle: {
    marginTop: 6,
    fontSize: rf(10),
    lineHeight: rf(15),
    fontWeight: '500',
    color: MUTED,
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  dropZone: {
    width: '100%',
    minHeight: 110,
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#BBF0CC',
    backgroundColor: '#FAFDFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },

  dropZoneText: {
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  uploadButtonRow: {
    width: '100%',
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },

  takePhotoButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  takePhotoButtonText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  galleryButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  galleryButtonText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  // Tips card
  tipsCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  tipsHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '45deg'}],
  },

  tipsHeaderTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  tipsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  tipItem: {
    width: '48.5%',
    minHeight: 46,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F8F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  tipIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipText: {
    flex: 1,
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '800',
    color: DARK,
  },

  // How it works
  howCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  howHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  howTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  howSteps: {
    fontSize: rf(9),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  howList: {
    marginTop: 12,
  },

  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  howIconColumn: {
    width: 34,
    alignItems: 'center',
  },

  howIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  howConnector: {
    width: 1.5,
    height: 22,
    marginVertical: 4,
    borderStyle: 'dashed',
    borderLeftWidth: 1.5,
    borderLeftColor: '#D9DEE3',
  },

  howTextBox: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 18,
  },

  howTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  stepBadge: {
    minWidth: 22,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepBadgeText: {
    fontSize: rf(7),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  howStepTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },

  howStepSubtitle: {
    marginTop: 3,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },

  // Supported crops
  cropsHeader: {
    marginTop: 19,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cropsTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  cropsViewAll: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  cropPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  selectedCropPill: {
    backgroundColor: '#EAFBF0',
    borderColor: '#BBF0CC',
  },

  cropEmoji: {
    fontSize: rf(13),
  },

  cropName: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },

  selectedCropName: {
    color: DARK_GREEN,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 72,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  detectButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  detectButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});