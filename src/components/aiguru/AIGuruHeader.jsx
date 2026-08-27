import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Menu,
  Bot,
  ChevronDown,
  Trash2,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const DARK = '#151D2D';
const MUTED = '#7F8A9D';
const BORDER = '#E8EDF1';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

const LANGUAGES = [
  {
    id: 'en',
    short: 'EN',
    label: 'English',
  },
  {
    id: 'hi',
    short: 'हि',
    label: 'Hindi',
  },
  {
    id: 'mr',
    short: 'म',
    label: 'Marathi',
  },
];

export default function AIGuruHeader({
  navigation,
  onClearChat,
}) {
  const [activeLanguage, setActiveLanguage] =
    useState('en');

  const handleMenuPress = () => {
    navigation.navigate('Sidebar');
  };

  const handleLanguagePress = languageId => {
    setActiveLanguage(languageId);
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleMenuPress}
        style={styles.menuButton}>
        <Menu
          size={rf(24)}
          color={DARK}
          strokeWidth={2.3}
        />
      </TouchableOpacity>

      <View style={styles.titleArea}>
        <View style={styles.titleRow}>
          <View style={styles.aiIconBox}>
            <Bot
              size={rf(15)}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          </View>

          <Text style={styles.title}>
            AI Guru
          </Text>
        </View>

        <Text style={styles.subtitle}>
          YOUR SMART FARMING ASSISTANT
        </Text>
      </View>

      <View style={styles.rightActions}>
        <View style={styles.languageSelector}>
          {LANGUAGES.map(language => {
            const selected =
              activeLanguage === language.id;

            return (
              <TouchableOpacity
                key={language.id}
                activeOpacity={0.8}
                onPress={() =>
                  handleLanguagePress(language.id)
                }
                style={[
                  styles.languageItem,
                  selected &&
                    styles.selectedLanguageItem,
                ]}>
                <Text
                  style={[
                    styles.languageText,
                    selected &&
                      styles.selectedLanguageText,
                  ]}>
                  {language.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClearChat}
          style={styles.clearButton}>
          <Trash2
            size={rf(17)}
            color="#EF4444"
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 65,
    paddingHorizontal: width * 0.037,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  titleArea: {
    flex: 1,
    marginLeft: 13,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIconBox: {
    width: 23,
    height: 23,
    borderRadius: 6,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    marginLeft: 7,
    fontSize: rf(18),
    lineHeight: rf(22),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 3,
    fontSize: rf(8),
    lineHeight: rf(11),
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 1.25,
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  languageSelector: {
    height: 36,
    borderRadius: 18,
    padding: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },

  languageItem: {
    minWidth: 27,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedLanguageItem: {
    backgroundColor: GREEN,
  },

  languageText: {
    fontSize: rf(9),
    fontWeight: '800',
    color: '#9AA4B2',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },

  clearButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#FFF4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});