// src/screens/LanguageScreen.jsx

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Check, ShieldCheck} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#178C45';
const DARK = '#171B20';

const languages = [
  {id: 'mr', label: 'मराठी', flag: '🇮🇳'},
  {id: 'hi', label: 'हिंदी', flag: '🇮🇳'},
  {id: 'en', label: 'English', flag: '🇬🇧'},
];

const LanguageScreen = ({navigation}) => {
  const [selected, setSelected] = useState('en');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Hero Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/images/language.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Rounded Card */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>
            Choose Your{'\n'}
            <Text style={styles.greenText}>Language</Text>
          </Text>

          <Text style={styles.subtitle}>
            Select your preferred language to continue
          </Text>

          <View style={styles.list}>
            {languages.map(item => {
              const active = selected === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setSelected(item.id)}
                  style={[styles.langCard, active && styles.activeCard]}>
                  <View style={styles.langLeft}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text style={styles.langText}>{item.label}</Text>
                  </View>

                  {active && (
                    <View style={styles.checkCircle}>
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.replace('Login')}>
            <LinearGradient
              colors={['#178C45', '#25C866']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.button}>
              <Text style={styles.buttonText}>Continue</Text>
              <Text style={styles.arrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.noteRow}>
            <ShieldCheck size={15} color="#8FA0BA" strokeWidth={2.2} />
            <Text style={styles.noteText}>
              You can change this anytime in settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  imageWrapper: {
    width: width,
    height: height * 0.42,
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  contentCard: {
    marginTop: -36,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 28,
    minHeight: height * 0.62,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 6,
  },

  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  greenText: {
    color: '#23A85B',
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    textAlign: 'center',
  },

  list: {
    marginTop: 28,
  },

  langCard: {
    height: 70,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E1E7EF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeCard: {
    borderColor: GREEN,
    backgroundColor: '#EFFBF4',
  },

  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  flag: {
    fontSize: 22,
    marginRight: 20,
  },

  langText: {
    fontSize: 18,
    color: '#252A31',
    fontWeight: '800',
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    marginTop: 18,
    height: 62,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',

    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  arrow: {
    marginLeft: 12,
    fontSize: 26,
    color: '#FFFFFF',
  },

  noteRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noteText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#8FA0BA',
  },
});