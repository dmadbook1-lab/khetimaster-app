import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle} from 'react-native-svg';
import {
  ArrowLeft,
  Check,
  Clock,
  Menu,
  Cpu,
  Grid3x3,
  Palette,
  BarChart3,
  Bug,
  Leaf,
  Loader,
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
const RED = '#EF4444';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

// ─── LOCAL IMAGE ASSET ──────────────────────────────────────────
// Uses the same crop preview from: assets/gov/crop-photo.png
const CROP_PHOTO = require('../../assets/gov/crop-photo.png');
// ────────────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ANALYSIS_STEPS = [
  {id: '1', label: 'Image Uploaded', status: 'done'},
  {id: '2', label: 'Crop Detected', status: 'done'},
  {id: '3', label: 'Identifying Disease', status: 'running'},
  {id: '4', label: 'Comparing with Database', status: 'waiting'},
  {id: '5', label: 'Preparing Treatment', status: 'waiting'},
];

const ANALYZING_TAGS = [
  {id: 'texture', label: 'Leaf texture', Icon: Grid3x3, color: DARK_GREEN, bg: '#EAFBF0'},
  {id: 'color', label: 'Leaf color', Icon: Palette, color: BLUE, bg: '#EFF6FF'},
  {id: 'patterns', label: 'Disease patterns', Icon: BarChart3, color: PURPLE, bg: '#F5F3FF'},
  {id: 'pest', label: 'Pest damage', Icon: Bug, color: RED, bg: '#FEF2F2'},
  {id: 'health', label: 'Crop health', Icon: Leaf, color: ORANGE, bg: '#FFF7ED'},
];

export default function AIDetectionScreen({navigation, route}) {
  const [progress, setProgress] = useState(68);

  // Accept a photoUri from route params (from camera/gallery),
  // otherwise fall back to the bundled local crop photo.
  const photoSource = route?.params?.photoUri
    ? {uri: route.params.photoUri}
    : CROP_PHOTO;

  const spinValue = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const CIRCLE_SIZE = 145;
  const STROKE_WIDTH = 10;
  const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Auto-navigate after 4s (demo)
    const timer = setTimeout(() => {
      navigation?.replace('AIDiagnosis');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const handleBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };

  const handleCancel = () => {
    if (navigation?.canGoBack()) navigation.goBack();
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
          <Text style={styles.headerTitle}>AI Detection</Text>
        </View>

        <View style={styles.iconButtonPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Scanning image */}
        <View style={styles.imageCard}>
          <Image
            source={photoSource}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.scanningBadge}>
            <View style={styles.scanningDot} />
            <Text style={styles.scanningText}>Scanning...</Text>
          </View>

          {/* Scanning corners */}
          <View style={[styles.cornerScan, styles.cornerTL]} />
          <View style={[styles.cornerScan, styles.cornerTR]} />
          <View style={[styles.cornerScan, styles.cornerBL]} />
          <View style={[styles.cornerScan, styles.cornerBR]} />

          <View style={styles.imageMetaBox}>
            <Text style={styles.imageMetaText}>2.4 MP • Tomato Leaf</Text>
          </View>
        </View>

        {/* Progress circle */}
        <View style={styles.progressCard}>
          <View
            style={[styles.circleWrap, {width: CIRCLE_SIZE, height: CIRCLE_SIZE}]}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#E5E7EB"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={BRIGHT_GREEN}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                rotation="-90"
                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              />
            </Svg>

            <View style={styles.circleTextBox}>
              <Text style={styles.circlePercent}>{progress}%</Text>
              <View style={styles.aiActiveRow}>
                <View style={styles.aiActiveDot} />
                <Text style={styles.aiActiveText}>AI ACTIVE</Text>
              </View>
            </View>
          </View>

          <Text style={styles.analyzingTitle}>Analyzing Crop...</Text>
          <Text style={styles.analyzingSubtitle}>
            Please wait while AI processes your image
          </Text>
        </View>

        {/* Live Analysis */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <View style={styles.analysisHeaderIcon}>
              <Menu size={rf(15)} color={DARK_GREEN} strokeWidth={2.4} />
            </View>
            <Text style={styles.analysisTitle}>Live Analysis</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 3 OF 5</Text>
            </View>
          </View>

          <View style={styles.stepsList}>
            {ANALYSIS_STEPS.map(step => {
              const isDone = step.status === 'done';
              const isRunning = step.status === 'running';
              const isWaiting = step.status === 'waiting';

              return (
                <View key={step.id} style={styles.stepRow}>
                  {isDone && (
                    <View style={[styles.stepIcon, {backgroundColor: '#EAFBF0'}]}>
                      <Check size={rf(11)} color={DARK_GREEN} strokeWidth={3} />
                    </View>
                  )}

                  {isRunning && (
                    <Animated.View
                      style={[
                        styles.stepIcon,
                        {
                          backgroundColor: '#FFF7ED',
                          transform: [{rotate: spin}],
                        },
                      ]}>
                      <Loader size={rf(11)} color={ORANGE} strokeWidth={2.5} />
                    </Animated.View>
                  )}

                  {isWaiting && (
                    <View style={[styles.stepIcon, {backgroundColor: '#F1F5F9'}]}>
                      <Clock size={rf(11)} color="#94A3B8" strokeWidth={2.5} />
                    </View>
                  )}

                  <Text
                    style={[
                      styles.stepLabel,
                      isRunning && {color: ORANGE, fontWeight: '900'},
                      isWaiting && {color: '#94A3B8'},
                    ]}>
                    {step.label}
                  </Text>

                  <View
                    style={[
                      styles.stepStatusBadge,
                      isDone && {backgroundColor: '#EAFBF0'},
                      isRunning && {backgroundColor: '#FFF7ED'},
                      isWaiting && {backgroundColor: '#F1F5F9'},
                    ]}>
                    <Text
                      style={[
                        styles.stepStatusText,
                        isDone && {color: DARK_GREEN},
                        isRunning && {color: ORANGE},
                        isWaiting && {color: '#94A3B8'},
                      ]}>
                      {isDone ? 'Done' : isRunning ? 'Running' : 'Waiting'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* AI is analyzing tags */}
        <View style={styles.tagsCard}>
          <View style={styles.tagsHeader}>
            <View style={styles.tagsHeaderIcon}>
              <Cpu size={rf(15)} color={DARK_GREEN} strokeWidth={2.4} />
            </View>
            <Text style={styles.tagsTitle}>AI is analyzing:</Text>
          </View>

          <View style={styles.tagsRow}>
            {ANALYZING_TAGS.map(tag => {
              const Icon = tag.Icon;
              return (
                <View
                  key={tag.id}
                  style={[styles.tagPill, {backgroundColor: tag.bg}]}>
                  <Icon size={rf(11)} color={tag.color} strokeWidth={2.4} />
                  <Text style={[styles.tagText, {color: tag.color}]}>
                    {tag.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconCircle}>
            <Clock size={rf(15)} color={DARK_GREEN} strokeWidth={2.3} />
          </View>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoTitle}>
              Average detection time:{' '}
              <Text style={{color: DARK_GREEN}}>5–10 seconds</Text>
            </Text>
            <Text style={styles.infoSubtitle}>
              Please keep the app open while analysis completes.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCancel}
          style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel Analysis</Text>
        </TouchableOpacity>
      </ScrollView>
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
  iconButtonPlaceholder: {width: 39, height: 39},
  headerTextBox: {flex: 1, marginHorizontal: 12, alignItems: 'center'},
  headerTitle: {fontSize: rf(17), fontWeight: '900', color: DARK},

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 30,
    backgroundColor: PAGE_BG,
  },

  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {width: '100%', height: 200},

  scanningBadge: {
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
  scanningDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: BRIGHT_GREEN},
  scanningText: {fontSize: rf(8), fontWeight: '900', color: '#FFFFFF'},

  cornerScan: {position: 'absolute', width: 24, height: 24, borderColor: BRIGHT_GREEN},
  cornerTL: {top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3},
  cornerTR: {top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3},
  cornerBL: {bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3},
  cornerBR: {bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3},

  imageMetaBox: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },
  imageMetaText: {fontSize: rf(8), fontWeight: '700', color: '#FFFFFF'},

  progressCard: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  circleWrap: {alignItems: 'center', justifyContent: 'center'},
  circleTextBox: {position: 'absolute', alignItems: 'center'},
  circlePercent: {fontSize: rf(26), fontWeight: '900', color: DARK},
  aiActiveRow: {marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4},
  aiActiveDot: {width: 5, height: 5, borderRadius: 3, backgroundColor: BRIGHT_GREEN},
  aiActiveText: {fontSize: rf(8), fontWeight: '900', color: DARK_GREEN},

  analyzingTitle: {marginTop: 18, fontSize: rf(17), fontWeight: '900', color: DARK},
  analyzingSubtitle: {
    marginTop: 6,
    fontSize: rf(10),
    lineHeight: rf(15),
    fontWeight: '500',
    color: MUTED,
    textAlign: 'center',
  },

  analysisCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  analysisHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  analysisHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTitle: {flex: 1, fontSize: rf(13), fontWeight: '900', color: DARK},
  stepBadge: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  stepBadgeText: {fontSize: rf(8), fontWeight: '900', color: '#64748B'},

  stepsList: {marginTop: 14, gap: 14},
  stepRow: {flexDirection: 'row', alignItems: 'center'},
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {flex: 1, marginLeft: 11, fontSize: rf(10), fontWeight: '700', color: DARK},
  stepStatusBadge: {
    height: 20,
    paddingHorizontal: 9,
    borderRadius: 10,
    justifyContent: 'center',
  },
  stepStatusText: {fontSize: rf(8), fontWeight: '900'},

  tagsCard: {
    marginTop: 16,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  tagsHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  tagsHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsTitle: {fontSize: rf(13), fontWeight: '900', color: DARK},
  tagsRow: {marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  tagPill: {
    height: 30,
    paddingHorizontal: 11,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {fontSize: rf(9), fontWeight: '900'},

  infoBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBox: {flex: 1, marginLeft: 11},
  infoTitle: {fontSize: rf(10), fontWeight: '900', color: DARK},
  infoSubtitle: {
    marginTop: 3,
    fontSize: rf(9),
    lineHeight: rf(13),
    fontWeight: '500',
    color: MUTED,
  },

  cancelButton: {marginTop: 22, alignItems: 'center', paddingVertical: 10},
  cancelText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
    textDecorationLine: 'underline',
  },
});