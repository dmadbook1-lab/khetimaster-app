import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Camera,
  ImageIcon,
  Smartphone,
  Info,
  Circle,
  Square,
  X,
  RotateCw,
  Scissors,
  ZoomIn,
  Pencil,
  CheckCircle,
  Mic,
  MapPin,
  Zap,
  Check,
  Send,
  MessageCircle,
} from 'lucide-react-native';
import { COLORS, rf, PAGE_PADDING } from '../../components/community/theme';
import { COMMUNITY_IMAGES } from '../../components/community/communityImages';
const TOTAL_STEPS = 5;
const CROPS = ['Tomato', 'Wheat', 'Rice', 'Cotton', 'Maize', 'Sugarcane'];
const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];
const CATEGORIES = ['Disease', 'Pest', 'Nutrition', 'Irrigation', 'Other'];
const PHOTO_TIPS = [
  {
    icon: '☀️',
    label: 'Take photo in daylight',
  },
  {
    icon: '🌿',
    label: 'Focus on affected leaves',
  },
  {
    icon: '🌱',
    label: 'Capture the whole plant',
  },
  {
    icon: '📷',
    label: 'Avoid blurry images',
  },
];
const DEMO_IMAGE = COMMUNITY_IMAGES.community5;
export default function AskWithPhotoScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [photoUri, setPhotoUri] = useState(null);
  const [annotationTool, setAnnotationTool] = useState('Circle');
  const [question, setQuestion] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedStage, setSelectedStage] = useState('Fruiting');
  const [selectedCategory, setSelectedCategory] = useState('Disease');
  const [aiEnabled, setAiEnabled] = useState(true);
  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      return true;
    }
    navigation?.goBack();
    return true;
  }, [step, navigation]);
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => sub.remove();
    }, [handleBack]),
  );
  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };
  const handleTakePhoto = () => {
    setPhotoUri(DEMO_IMAGE);
    handleNext();
  };
  const renderHeader = (title, subtitle) => (
    <View style={styles.headerBox}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backBtn}
        >
          <ArrowLeft size={rf(16)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        {Array.from({
          length: TOTAL_STEPS,
        }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressSeg, i < step && styles.progressSegActive]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step} of {TOTAL_STEPS}
      </Text>
    </View>
  );
  const renderStep1 = () => (
    <>
      {renderHeader(
        'Ask with Photo',
        'Upload a crop photo and ask the farming\ncommunity for help.',
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {}
        <View style={styles.card}>
          <View style={styles.uploadIconWrap}>
            <View style={styles.uploadIconCircle}>
              <Smartphone size={rf(38)} color={COLORS.DARK} strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.cardTitle}>Upload a Crop Photo</Text>
          <Text style={styles.cardSub}>
            Share a clear photo so the community can help identify the issue
          </Text>

          <View style={styles.uploadBtnRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleTakePhoto}
              style={styles.takePhotoBtn}
            >
              <Camera size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.takePhotoText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleTakePhoto}
              style={styles.galleryBtn}
            >
              <ImageIcon
                size={rf(16)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.4}
              />
              <Text style={styles.galleryText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconCircle}>
              <Info size={rf(12)} color={COLORS.ORANGE} strokeWidth={2.4} />
            </View>
            <Text style={styles.tipsTitle}>Photo Tips for Better Help</Text>
          </View>

          {PHOTO_TIPS.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{t.icon}</Text>
              <Text style={styles.tipLabel}>{t.label}</Text>
              <Check size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={3} />
            </View>
          ))}
        </View>

        {}
        <View style={styles.supportRow}>
          <Text style={styles.supportLabel}>Supported:</Text>
          {['JPG', 'PNG', 'HEIC'].map(f => (
            <View key={f} style={styles.formatChip}>
              <Text style={styles.formatChipText}>{f}</Text>
            </View>
          ))}
          <Text style={styles.supportLabel}>Max 10MB</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTakePhoto}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Upload Photo to Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
  const renderStep2 = () => (
    <>
      {renderHeader(
        'Preview & Annotate',
        'Crop, zoom or mark the affected area on\nyour photo.',
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {}
        <View style={styles.imageWrap}>
          <Image source={photoUri || DEMO_IMAGE} style={styles.previewImage} />
          <View style={styles.affectedBadge}>
            <View style={styles.affectedDot} />
            <Text style={styles.affectedBadgeText}>AFFECTED AREA MARKED</Text>
          </View>

          {}
          <View style={styles.markedOverlay}>
            <View style={styles.markedCenterDot} />
          </View>
        </View>

        {}
        <View style={styles.toolRow}>
          <TouchableOpacity activeOpacity={0.85} style={styles.toolChip}>
            <RotateCw size={rf(12)} color={COLORS.DARK} strokeWidth={2.4} />
            <Text style={styles.toolText}>Replace</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.toolChip}>
            <Scissors size={rf(12)} color={COLORS.DARK} strokeWidth={2.4} />
            <Text style={styles.toolText}>Crop</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.toolChip}>
            <ZoomIn size={rf(12)} color={COLORS.DARK} strokeWidth={2.4} />
            <Text style={styles.toolText}>Zoom</Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.markHeader}>
            <View style={styles.markIconCircle}>
              <Pencil size={rf(12)} color={COLORS.ORANGE} strokeWidth={2.4} />
            </View>
            <Text style={styles.markTitle}>Mark Affected Area</Text>
            <View style={styles.optionalPill}>
              <Text style={styles.optionalPillText}>Optional</Text>
            </View>
          </View>

          <Text style={styles.markSub}>
            Draw a circle or box around the area you want the community to look
            at.
          </Text>

          <View style={styles.annotToolRow}>
            {[
              {
                id: 'Circle',
                Icon: Circle,
                active: COLORS.ORANGE,
              },
              {
                id: 'Rectangle',
                Icon: Square,
                active: COLORS.DARK,
              },
              {
                id: 'Clear',
                Icon: X,
                active: COLORS.DARK,
              },
            ].map(t => {
              const Icon = t.Icon;
              const isActive = annotationTool === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.85}
                  onPress={() => setAnnotationTool(t.id)}
                  style={[
                    styles.annotBtn,
                    isActive && {
                      borderColor: COLORS.ORANGE,
                    },
                  ]}
                >
                  <Icon
                    size={rf(13)}
                    color={isActive ? COLORS.ORANGE : COLORS.DARK}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.annotBtnText,
                      isActive && {
                        color: COLORS.ORANGE,
                      },
                    ]}
                  >
                    {t.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <View style={styles.qualityCard}>
          <CheckCircle
            size={rf(15)}
            color={COLORS.DARK_GREEN}
            strokeWidth={2.4}
            fill="#EAFBF0"
          />
          <Text style={styles.qualityText}>Good photo quality detected</Text>
          <Text style={styles.qualityPercent}>92% clarity</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Continue to Question</Text>
        </TouchableOpacity>
      </View>
    </>
  );
  const renderStep3 = () => (
    <>
      {renderHeader(
        'Ask Your Question',
        'Describe the problem so the community\ncan help you better.',
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {}
        <View style={styles.attachedRow}>
          <Image source={photoUri || DEMO_IMAGE} style={styles.attachedThumb} />
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.attachedTitle}>Photo attached</Text>
            <Text style={styles.attachedSub}>
              Affected area marked · 1 photo
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.card}>
          <Text style={styles.labelReq}>
            Your Question{' '}
            <Text
              style={{
                color: COLORS.ORANGE,
              }}
            >
              *
            </Text>
          </Text>

          <View style={styles.questionInputWrap}>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="What is wrong with my tomato leaves? Yellow spots appearing since 3 days..."
              placeholderTextColor={COLORS.MUTED}
              multiline
              style={styles.questionInput}
            />
            <TouchableOpacity activeOpacity={0.85} style={styles.micBtn}>
              <Mic size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Tap mic icon to use voice input</Text>
        </View>

        {}
        <View style={styles.card}>
          <Text style={styles.blockTitle}>Crop & Stage</Text>

          <View style={styles.chipRow}>
            {CROPS.map(c => {
              const active = c === selectedCrop;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCrop(c)}
                  style={[styles.chip, active && styles.chipActiveGreen]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            style={[
              styles.blockTitle,
              {
                marginTop: 14,
              },
            ]}
          >
            Crop Stage
          </Text>
          <View style={styles.chipRow}>
            {STAGES.map(s => {
              const active = s === selectedStage;
              return (
                <TouchableOpacity
                  key={s}
                  activeOpacity={0.85}
                  onPress={() => setSelectedStage(s)}
                  style={[styles.chip, active && styles.chipActiveGreen]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <View style={styles.card}>
          <Text style={styles.blockTitle}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(c => {
              const active = c === selectedCategory;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCategory(c)}
                  style={[
                    styles.chip,
                    active && styles.chipActiveOrangeOutline,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && {
                        color: COLORS.ORANGE,
                      },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <View style={styles.card}>
          <Text style={styles.blockTitle}>
            Location <Text style={styles.optionalInline}>(Optional)</Text>
          </Text>
          <View style={styles.locRow}>
            <MapPin size={rf(13)} color={COLORS.MUTED} strokeWidth={2.4} />
            <Text style={styles.locText}>Pune, Maharashtra</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.detectText}>Detect</Text>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.card}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <Zap
                size={rf(14)}
                color={COLORS.DARK_GREEN}
                strokeWidth={2.4}
                fill={COLORS.DARK_GREEN}
              />
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.aiTitle}>AI Analysis</Text>
              <Text style={styles.aiSub}>Auto-detect possible issues</Text>
            </View>
            <Switch
              value={aiEnabled}
              onValueChange={setAiEnabled}
              trackColor={{
                false: '#CBD5E1',
                true: COLORS.DARK_GREEN,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {aiEnabled && (
            <View style={styles.aiResultCard}>
              <View style={styles.aiResultHeader}>
                <Zap
                  size={rf(11)}
                  color={COLORS.DARK_GREEN}
                  strokeWidth={2.4}
                />
                <Text style={styles.aiResultLabel}>AI ANALYSIS RESULT</Text>
              </View>

              <View style={styles.aiResultRow}>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text style={styles.aiPossibleLabel}>Possible Issue</Text>
                  <Text style={styles.aiIssueName}>
                    Early Blight (Alternaria{'\n'}solani)
                  </Text>
                </View>
                <View style={styles.aiConfidenceBox}>
                  <Text style={styles.aiConfLabel}>Confidence</Text>
                  <View style={styles.confBarWrap}>
                    <View
                      style={[
                        styles.confBar,
                        {
                          width: '78%',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.aiConfValue}>78%</Text>
                </View>
              </View>

              <Text style={styles.aiFootnote}>
                Community may confirm or suggest other possibilities.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>Continue to Community</Text>
        </TouchableOpacity>
      </View>
    </>
  );
  const renderStep4 = () => (
    <>
      {renderHeader(
        'Preview Post',
        'This is how your question will appear in the\nCommunity.',
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.livePreviewRow}>
          <View style={styles.livePreviewLine} />
          <Text style={styles.livePreviewText}>LIVE PREVIEW</Text>
          <View style={styles.livePreviewLine} />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewAvatar}>
              <Text
                style={{
                  fontSize: rf(20),
                }}
              >
                👤
              </Text>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.previewName}>Ramesh Patil</Text>
              <View style={styles.previewLocRow}>
                <MapPin size={rf(10)} color={COLORS.RED} strokeWidth={2.3} />
                <Text style={styles.previewLoc}>Pune, Maharashtra</Text>
              </View>
            </View>
            <View style={styles.diseaseTag}>
              <Text style={styles.diseaseTagText}>Disease</Text>
            </View>
          </View>

          <Text style={styles.previewTitle}>
            What is wrong with my tomato leaves?
          </Text>
          <Text style={styles.previewDesc}>
            Yellow spots appearing since 3 days on my tomato plants. The lower
            leaves are turning brown at the edges. Please help!
          </Text>

          <View style={styles.previewImageWrap}>
            <Image source={photoUri || DEMO_IMAGE} style={styles.previewImg} />
            <View style={styles.areaMarkedBadge}>
              <View style={styles.affectedDot} />
              <Text style={styles.affectedBadgeText}>Area marked</Text>
            </View>
          </View>

          <View style={styles.hashtagRow}>
            {['#TomatoDisease', '#EarlyBlight', '#Tomato', '#Fruiting'].map(
              tag => (
                <View key={tag} style={styles.hashChip}>
                  <Text style={styles.hashChipText}>{tag}</Text>
                </View>
              ),
            )}
          </View>

          <View style={styles.aiSuggestBox}>
            <Zap size={rf(12)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.aiSuggestText}>
              AI suggests: Early Blight (78% confidence)
            </Text>
          </View>

          <View style={styles.previewFooter}>
            <View style={styles.previewFooterItem}>
              <MessageCircle
                size={rf(12)}
                color={COLORS.MUTED}
                strokeWidth={2.2}
              />
              <Text style={styles.previewFooterText}>0 Answers</Text>
            </View>
            <View style={styles.previewFooterItem}>
              <Text style={styles.previewFooterText}>👁 Just now</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.editBtn}>
          <Pencil size={rf(13)} color={COLORS.DARK} strokeWidth={2.4} />
          <Text style={styles.editBtnText}>Edit Question</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          style={styles.primaryBtn}
        >
          <Send size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          <Text
            style={[
              styles.primaryBtnText,
              {
                marginLeft: 6,
              },
            ]}
          >
            Post Question
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
  const renderStep5 = () => (
    <>
      <View style={styles.successHeader}>
        <Text style={styles.successHeaderTitle}>KhetiMaster Community</Text>
      </View>

      <ScrollView contentContainerStyle={styles.successScroll}>
        <View style={styles.successCircleWrap}>
          {}
          <View
            style={[
              styles.confetti,
              {
                top: 20,
                left: 30,
                backgroundColor: COLORS.ORANGE,
              },
            ]}
          />
          <View
            style={[
              styles.confetti,
              {
                top: 40,
                right: 40,
                backgroundColor: COLORS.DARK_GREEN,
              },
            ]}
          />
          <View
            style={[
              styles.confetti,
              {
                bottom: 30,
                left: 20,
                backgroundColor: COLORS.ORANGE,
                transform: [
                  {
                    rotate: '45deg',
                  },
                ],
              },
            ]}
          />
          <View
            style={[
              styles.confetti,
              {
                bottom: 50,
                right: 20,
                backgroundColor: COLORS.DARK_GREEN,
                transform: [
                  {
                    rotate: '30deg',
                  },
                ],
              },
            ]}
          />
          <View
            style={[
              styles.confetti,
              {
                top: 10,
                right: 80,
                backgroundColor: COLORS.ORANGE,
              },
            ]}
          />

          <View style={styles.successOuterCircle}>
            <View style={styles.successInnerCircle}>
              <Check size={rf(38)} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
        </View>

        <Text style={styles.successTitle}>
          Your question has been{'\n'}shared successfully!
        </Text>
        <Text style={styles.successSub}>
          Farmers and experts in your area will be notified. You will receive
          answers soon.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValueGreen}>1.2K+</Text>
            <Text style={styles.statLabel}>Farmers{'\n'}nearby</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValueOrange}>~2 hrs</Text>
            <Text style={styles.statLabel}>Avg. response{'\n'}time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValueGreen}>AI</Text>
            <Text style={styles.statLabel}>Analysis{'\n'}ready</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation?.goBack()}
          style={styles.primaryBtnFull}
        >
          <MessageCircle size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
          <Text
            style={[
              styles.primaryBtnText,
              {
                marginLeft: 6,
              },
            ]}
          >
            View Discussion
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation?.goBack()}
          style={styles.secondaryBtnFull}
        >
          <ArrowLeft size={rf(13)} color={COLORS.DARK} strokeWidth={2.4} />
          <Text
            style={[
              styles.secondaryBtnText,
              {
                marginLeft: 6,
              },
            ]}
          >
            Back to Community
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
  scroll: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 6,
    paddingBottom: 110,
  },
  headerBox: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: rf(11),
    lineHeight: rf(15),
    color: COLORS.MUTED,
    fontWeight: '500',
  },
  progressRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 6,
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressSegActive: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: rf(10),
    fontWeight: '700',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  uploadIconWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  uploadIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  cardSub: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: rf(11),
    lineHeight: rf(15),
    color: COLORS.MUTED,
    fontWeight: '500',
  },
  uploadBtnRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  takePhotoBtn: {
    flex: 1,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  takePhotoText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  galleryBtn: {
    flex: 1,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.DARK_GREEN,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  galleryText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipsIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  tipRow: {
    marginTop: 10,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipEmoji: {
    fontSize: rf(13),
  },
  tipLabel: {
    flex: 1,
    fontSize: rf(11.5),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  supportRow: {
    marginTop: 16,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  supportLabel: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  formatChip: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
  },
  formatChipText: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: '#0369A1',
  },
  imageWrap: {
    marginTop: 6,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#000',
  },
  affectedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.DARK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  affectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ORANGE,
  },
  affectedBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  markedOverlay: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '55%',
    height: '55%',
    borderWidth: 2,
    borderColor: COLORS.ORANGE,
    borderStyle: 'dashed',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markedCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.ORANGE,
  },
  toolRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  toolChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toolText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  markHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markTitle: {
    flex: 1,
    fontSize: rf(13),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  optionalPill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  optionalPillText: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  markSub: {
    marginTop: 8,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  annotToolRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  annotBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  annotBtnText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  qualityCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    borderWidth: 1,
    borderColor: '#BBF0CC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityText: {
    flex: 1,
    fontSize: rf(11.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  qualityPercent: {
    fontSize: rf(10.5),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  attachedRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachedThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  attachedTitle: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  attachedSub: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  changeBtn: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  changeBtnText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  labelReq: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  questionInputWrap: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 90,
    position: 'relative',
  },
  questionInput: {
    flex: 1,
    fontSize: rf(11.5),
    color: COLORS.DARK,
    padding: 0,
    paddingRight: 40,
    textAlignVertical: 'top',
  },
  micBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  blockTitle: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  optionalInline: {
    fontSize: rf(11),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  chipActiveGreen: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  chipActiveOrangeOutline: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.ORANGE,
  },
  chipText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  locRow: {
    marginTop: 10,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locText: {
    flex: 1,
    fontSize: rf(11),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  detectText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  aiSub: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  aiResultCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EAFBF0',
    borderWidth: 1,
    borderColor: '#BBF0CC',
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiResultLabel: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    letterSpacing: 0.5,
  },
  aiResultRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
  },
  aiPossibleLabel: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  aiIssueName: {
    marginTop: 3,
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
    lineHeight: rf(16),
  },
  aiConfidenceBox: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 100,
  },
  aiConfLabel: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  confBarWrap: {
    width: 90,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1F3DE',
    overflow: 'hidden',
  },
  confBar: {
    height: '100%',
    backgroundColor: COLORS.DARK_GREEN,
    borderRadius: 3,
  },
  aiConfValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  aiFootnote: {
    marginTop: 10,
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
    lineHeight: rf(13),
  },
  livePreviewRow: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  livePreviewLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  livePreviewText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 1,
  },
  previewCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  previewLocRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewLoc: {
    fontSize: rf(9.5),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  diseaseTag: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
  },
  diseaseTagText: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.ORANGE,
  },
  previewTitle: {
    marginTop: 12,
    fontSize: rf(13.5),
    fontWeight: '900',
    color: COLORS.DARK,
    lineHeight: rf(18),
  },
  previewDesc: {
    marginTop: 6,
    fontSize: rf(11),
    lineHeight: rf(15.5),
    fontWeight: '500',
    color: COLORS.DARK,
  },
  previewImageWrap: {
    marginTop: 12,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  areaMarkedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.DARK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hashtagRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashChip: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  hashChipText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  aiSuggestBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiSuggestText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  previewFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 16,
  },
  previewFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewFooterText: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  editBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editBtnText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  successHeader: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  successHeaderTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  successScroll: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successCircleWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  successOuterCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: rf(20),
    fontWeight: '900',
    color: COLORS.DARK,
    lineHeight: rf(26),
  },
  successSub: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: rf(11.5),
    lineHeight: rf(16),
    fontWeight: '500',
    color: COLORS.MUTED,
    paddingHorizontal: 12,
  },
  statsRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  statValueGreen: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  statValueOrange: {
    fontSize: rf(15),
    fontWeight: '900',
    color: COLORS.ORANGE,
  },
  statLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
    lineHeight: rf(13),
  },
  primaryBtnFull: {
    marginTop: 24,
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  secondaryBtnFull: {
    marginTop: 10,
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: PAGE_PADDING,
    paddingBottom: 20,
    backgroundColor: COLORS.PAGE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
