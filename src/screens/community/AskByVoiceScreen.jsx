import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Mic,
  Square,
  Trash2,
  Pause,
  Check,
  Search,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS, rf, PAGE_PADDING } from '../../components/community/theme';
import { COMMUNITY_IMAGES } from '../../components/community/communityImages';
const TOTAL_STEPS = 3;
const HERO_IMG = COMMUNITY_IMAGES.community9;
const LANGUAGES = [
  {
    id: 'marathi',
    label: 'मराठी',
    sub: 'Marathi',
  },
  {
    id: 'hindi',
    label: 'हिन्दी',
    sub: 'Hindi',
  },
  {
    id: 'english',
    label: 'English',
    sub: 'English',
  },
  {
    id: 'auto',
    label: null,
    sub: 'Auto Detect',
    icon: Search,
  },
];
const WAVE_BARS = [
  8, 14, 22, 30, 40, 32, 26, 38, 44, 34, 24, 30, 42, 38, 28, 20, 14, 10, 16, 24,
  34, 30, 22, 14,
];
export default function AskByVoiceScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [seconds, setSeconds] = useState(23);
  const [isRecording, setIsRecording] = useState(true);
  const [selectedLang, setSelectedLang] = useState('hindi');
  const ripple = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.timing(ripple, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ).start();
    } else {
      ripple.stopAnimation();
    }
  }, [isRecording, ripple]);
  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);
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
  const rippleScale = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const rippleOpacity = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });
  const formatTime = s => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backRow}
        >
          <ArrowLeft
            size={rf(15)}
            color={COLORS.DARK_GREEN}
            strokeWidth={2.5}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.titleRow}>
        <View style={styles.titleIconCircle}>
          <Mic size={rf(18)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
        </View>
        <Text style={styles.titleText}>Ask by Voice</Text>
      </View>

      {}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <Image source={HERO_IMG} style={styles.heroImg} />

        {}
        <Text style={styles.heroTitle}>Speak your farming question.</Text>
        <Text style={styles.heroSub}>
          Explain your farming problem in your own language. AI will convert it
          to text.
        </Text>

        {}
        <View style={styles.recorderCard}>
          <Text style={styles.timer}>{formatTime(seconds)}</Text>

          {}
          <View style={styles.waveRow}>
            {WAVE_BARS.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    opacity: isRecording ? 1 : 0.4,
                  },
                ]}
              />
            ))}
          </View>

          {}
          <View style={styles.recBtnWrap}>
            <Animated.View
              style={[
                styles.ripple,
                {
                  transform: [
                    {
                      scale: rippleScale,
                    },
                  ],
                  opacity: rippleOpacity,
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsRecording(r => !r)}
              style={styles.recBtn}
            >
              {isRecording ? (
                <Square
                  size={rf(20)}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                  fill="#FFFFFF"
                />
              ) : (
                <Mic size={rf(22)} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.ctrlRow}>
            <TouchableOpacity activeOpacity={0.7} style={styles.ctrlItem}>
              <View style={styles.ctrlCircle}>
                <Trash2 size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
              </View>
              <Text style={styles.ctrlLabel}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsRecording(r => !r)}
              style={styles.ctrlItem}
            >
              <View style={styles.ctrlCircle}>
                <Pause size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
              </View>
              <Text style={styles.ctrlLabel}>Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.ctrlItem}>
              <View style={[styles.ctrlCircle, styles.ctrlCircleDone]}>
                <Check
                  size={rf(14)}
                  color={COLORS.DARK_GREEN}
                  strokeWidth={3}
                />
              </View>
              <Text
                style={[
                  styles.ctrlLabel,
                  {
                    color: COLORS.DARK_GREEN,
                  },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <Text style={styles.langLabel}>SELECT LANGUAGE</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map(l => {
            const active = l.id === selectedLang;
            const Icon = l.icon;
            return (
              <TouchableOpacity
                key={l.id}
                activeOpacity={0.85}
                onPress={() => setSelectedLang(l.id)}
                style={[styles.langCard, active && styles.langCardActive]}
              >
                {l.label ? (
                  <Text
                    style={[
                      styles.langLabelBig,
                      active && {
                        color: '#FFFFFF',
                      },
                    ]}
                  >
                    {l.label}
                  </Text>
                ) : (
                  Icon && (
                    <Icon
                      size={rf(15)}
                      color={active ? '#FFFFFF' : COLORS.MUTED}
                      strokeWidth={2.3}
                    />
                  )
                )}
                <Text
                  style={[
                    styles.langSub,
                    active && {
                      color: 'rgba(255,255,255,0.9)',
                    },
                  ]}
                >
                  {l.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation?.navigate('AIAnswer')}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryText}>Continue to Review</Text>
          <ArrowRight size={rf(15)} color="#FFFFFF" strokeWidth={2.5} />
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
  topBar: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 6,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  backText: {
    fontSize: rf(13),
    fontWeight: '700',
    color: COLORS.DARK_GREEN,
  },
  titleRow: {
    marginTop: 6,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: rf(19),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  progressRow: {
    marginTop: 14,
    paddingHorizontal: PAGE_PADDING,
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
  scroll: {
    paddingBottom: 130,
  },
  heroImg: {
    marginTop: 16,
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  heroTitle: {
    marginTop: 22,
    paddingHorizontal: PAGE_PADDING,
    fontSize: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  heroSub: {
    marginTop: 8,
    paddingHorizontal: PAGE_PADDING,
    fontSize: rf(12),
    lineHeight: rf(17),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  recorderCard: {
    marginTop: 20,
    marginHorizontal: PAGE_PADDING,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  timer: {
    fontSize: rf(15),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  waveRow: {
    marginTop: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.DARK_GREEN,
  },
  recBtnWrap: {
    marginTop: 20,
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.DARK_GREEN,
  },
  recBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },
  ctrlRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
  },
  ctrlItem: {
    alignItems: 'center',
    gap: 6,
  },
  ctrlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlCircleDone: {
    backgroundColor: '#EAFBF0',
  },
  ctrlLabel: {
    fontSize: rf(10.5),
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  langLabel: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: PAGE_PADDING,
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.6,
  },
  langRow: {
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    gap: 8,
  },
  langCard: {
    flex: 1,
    minHeight: 66,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  langCardActive: {
    backgroundColor: COLORS.DARK_GREEN,
    borderColor: COLORS.DARK_GREEN,
  },
  langLabelBig: {
    fontSize: rf(14),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  langSub: {
    fontSize: rf(10),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: PAGE_PADDING,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
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
    gap: 8,
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  primaryText: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
