import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Bot,
  CircleCheck,
  House,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GREEN = '#15803D';
const DARK = '#111827';
const MUTED = '#6B7280';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

/*
 * What each upcoming feature will do, plus a question AI Guru can already
 * help with in the meantime.
 */
// text lives under comingSoon.<feature> (title, description, point1-3, question)
const FEATURES = {
  warehouse: { image: require('../../assets/homescreen/warehousee.png') },
  delivery: { image: require('../../assets/homescreen/Deliveryy.png') },
  disease: { image: require('../../assets/homescreen/dis.png') },
  schemes: { image: require('../../assets/homescreen/govv.png') },
};

function useLoop(duration, delay = 0) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration, delay]);
  return value;
}

function FadeIn({ delay = 0, style, children }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Ripple({ delay }) {
  const wave = useLoop(1600, delay);
  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          opacity: wave.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 0],
          }),
          transform: [
            {
              scale: wave.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.45],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/*
 * params: feature (warehouse | delivery | disease | schemes)
 */
export default function ComingSoonScreen({ navigation, route }) {
  const { t } = useTranslation();
  const featureId = FEATURES[route?.params?.feature]
    ? route.params.feature
    : 'warehouse';
  const feature = {
    ...FEATURES[featureId],
    title: t(`comingSoon.${featureId}.title`),
    description: t(`comingSoon.${featureId}.description`),
    points: [1, 2, 3].map(n => t(`comingSoon.${featureId}.point${n}`)),
    question: t(`comingSoon.${featureId}.question`),
  };
  const float = useLoop(2200);

  const askAiGuru = () =>
    navigation.navigate('AIGuru', {
      question: feature.question,
      source: 'coming-soon',
      newChat: true,
    });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.topBar}>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.3} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeIn>
          <LinearGradient
            colors={['#22C55E', '#15803D', '#0F5E2C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroCircleBig} />
            <View style={styles.heroCircleSmall} />

            <View style={styles.visual}>
              <Ripple delay={0} />
              <Ripple delay={800} />
              <Animated.View
                style={[
                  styles.imageCircle,
                  {
                    transform: [
                      {
                        translateY: float.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-5, 5],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={feature.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            <View style={styles.soonPill}>
              <Sparkles size={rf(13)} color="#FDE68A" strokeWidth={2.4} />
              <Text style={styles.soonText}>{t('comingSoon.badge')}</Text>
            </View>
          </LinearGradient>
        </FadeIn>

        <FadeIn delay={120}>
          <Text style={styles.title}>{feature.title}</Text>
          <Text style={styles.description}>{feature.description}</Text>
        </FadeIn>

        <FadeIn delay={200}>
          <Text style={styles.sectionTitle}>{t('comingSoon.what_you_can_do')}</Text>
        </FadeIn>

        {feature.points.map((point, index) => (
          <FadeIn key={point} delay={260 + index * 90} style={styles.point}>
            <View style={styles.pointIcon}>
              <CircleCheck size={rf(18)} color={GREEN} strokeWidth={2.3} />
            </View>
            <Text style={styles.pointText}>{point}</Text>
          </FadeIn>
        ))}

        <FadeIn delay={560} style={styles.noteBox}>
          <Text style={styles.noteText}>
            {t('comingSoon.note')}
          </Text>
        </FadeIn>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={askAiGuru}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Bot size={rf(19)} color="#FFFFFF" strokeWidth={2.3} />
          <Text style={styles.primaryText}>{t('comingSoon.ask_now')}</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <House size={rf(18)} color={GREEN} strokeWidth={2.3} />
          <Text style={styles.secondaryText}>{t('common.back_to_home')}</Text>
        </Pressable>
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
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  hero: {
    height: 250,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroCircleBig: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -80,
    top: -90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    left: -50,
    bottom: -60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  visual: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  imageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#052E16',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  image: {
    width: 78,
    height: 78,
  },
  soonPill: {
    marginTop: 14,
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soonText: {
    fontSize: rf(11),
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#FFFFFF',
  },
  title: {
    marginTop: 24,
    fontSize: rf(26),
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.6,
  },
  description: {
    marginTop: 8,
    fontSize: rf(15),
    lineHeight: rf(22),
    color: MUTED,
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: rf(16),
    fontWeight: '800',
    color: DARK,
  },
  point: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F4F9F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    flex: 1,
    fontSize: rf(14),
    lineHeight: rf(20),
    fontWeight: '600',
    color: DARK,
  },
  noteBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BBE5C7',
  },
  noteText: {
    fontSize: rf(13),
    lineHeight: rf(19),
    color: MUTED,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  primary: {
    height: 54,
    borderRadius: 27,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontSize: rf(16),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondary: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#BBE5C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: {
    fontSize: rf(15),
    fontWeight: '800',
    color: GREEN,
  },
  pressed: {
    opacity: 0.85,
  },
});
