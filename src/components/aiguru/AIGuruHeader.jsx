import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Menu, History, Sparkles } from 'lucide-react-native';
import {
  COLORS,
  GRADIENT,
  GUTTER,
  Glass,
  PressableScale,
  rf,
  useLoop,
} from './theme';
import useAppLanguage from '../../translation/useAppLanguage';
import { getLanguageLabel } from '../../utils/languageUtils';

const BASE_LANGUAGES = [
  { id: 'en', short: 'EN', label: 'English' },
  { id: 'hi', short: 'हि', label: 'Hindi' },
  { id: 'mr', short: 'म', label: 'Marathi' },
];
const LANG_ITEM = 30;

// Space the floating header takes; the chat scrolls underneath it
export const HEADER_HEIGHT = 74;

/*
 * language / onLanguageChange: the language AI Guru replies in.
 */
export default function AIGuruHeader({
  navigation,
  language: activeLanguage = 'en',
  onLanguageChange,
  onHistoryPress,
}) {
  const appLanguage = useAppLanguage();
  // the app language is always offered, even when it isn't one of the base three
  const LANGUAGES = useMemo(() => {
    if (BASE_LANGUAGES.some(language => language.id === appLanguage)) {
      return BASE_LANGUAGES;
    }
    const { label, native } = getLanguageLabel(appLanguage);
    return [
      ...BASE_LANGUAGES,
      { id: appLanguage, short: Array.from(native)[0], label },
    ];
  }, [appLanguage]);
  const activeIndex = Math.max(
    0,
    LANGUAGES.findIndex(language => language.id === activeLanguage),
  );
  const pill = useRef(new Animated.Value(activeIndex)).current;
  const pulse = useLoop(1600, { yoyo: false });

  useEffect(() => {
    Animated.spring(pill, {
      toValue: activeIndex,
      useNativeDriver: true,
      speed: 20,
      bounciness: 7,
    }).start();
  }, [pill, activeIndex]);

  return (
    <View style={styles.wrap}>
      <Glass style={styles.header}>
        <PressableScale
          accessibilityLabel="Open menu"
          onPress={() => navigation.navigate('Sidebar')}
          style={styles.iconButton}
        >
          <Menu size={rf(20)} color={COLORS.text} strokeWidth={2.2} />
        </PressableScale>

        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Sparkles size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
        </LinearGradient>

        <View style={styles.titleArea}>
          <Text numberOfLines={1} style={styles.title}>
            AI Guru
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDotWrap}>
              <Animated.View
                style={[
                  styles.statusPulse,
                  {
                    opacity: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 0],
                    }),
                    transform: [
                      {
                        scale: pulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 2.6],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <View style={styles.languageSelector}>
          <Animated.View
            style={[
              styles.languagePill,
              {
                transform: [
                  {
                    translateX: pill.interpolate({
                      inputRange: [0, LANGUAGES.length - 1],
                      outputRange: [0, LANG_ITEM * (LANGUAGES.length - 1)],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {LANGUAGES.map(language => {
            const selected = activeLanguage === language.id;
            return (
              <Pressable
                key={language.id}
                accessibilityLabel={language.label}
                onPress={() => onLanguageChange?.(language.id)}
                style={styles.languageItem}
              >
                <Text
                  style={[
                    styles.languageText,
                    selected && styles.selectedLanguageText,
                  ]}
                >
                  {language.short}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PressableScale
          accessibilityLabel="Chat history"
          onPress={onHistoryPress}
          style={styles.iconButton}
        >
          <History size={rf(19)} color={COLORS.text} strokeWidth={2.2} />
        </PressableScale>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: HEADER_HEIGHT,
    paddingHorizontal: GUTTER,
    paddingTop: 6,
    paddingBottom: 8,
    zIndex: 10,
  },
  header: {
    flex: 1,
    borderRadius: 30,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    shadowColor: '#0F3D22',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: rf(17),
    lineHeight: rf(21),
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDotWrap: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPulse: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: rf(11),
    fontWeight: '600',
    color: COLORS.green,
  },
  languageSelector: {
    height: 38,
    padding: 3,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  languagePill: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: LANG_ITEM,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  languageItem: {
    width: LANG_ITEM,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.muted,
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
});
