// src/screens/FarmSmartSuccessScreen.jsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Zap, Check, BookOpen, Grid2X2, Plus} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#64748B';
const LIGHT_GREEN = '#ECFDF5';

const isSmall = width < 360;
const isShort = height < 700;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function FarmSmartSuccessScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrap}>
          <Image
            source={require('../../assets/images/smart-farm-success.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎉</Text>
            <Text style={styles.badgeText}>Setup Complete</Text>
          </View>

          <Text style={styles.title}>Your Farm Is Now{'\n'}Smart</Text>

          <Text style={styles.subtitle}>
            KhetiMaster is now connected to your farm and ready to provide
            satellite monitoring, weather alerts, and AI-powered recommendations.
          </Text>

          <View style={styles.monitoringCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Zap size={rf(24)} color="#FFFFFF" strokeWidth={2.5} />
              </View>

              <Text style={styles.monitoringTitle}>
                Monitoring Activated
              </Text>
            </View>

            <View style={styles.featuresGrid}>
              <FeaturePill label="Satellite Monitoring" />
              <FeaturePill label="Weather Tracking" />
              <FeaturePill label="AI Advisory" />
              <FeaturePill label="Crop Intelligence" />
            </View>
          </View>

          <View style={styles.farmCard}>
            <View style={styles.farmIcon}>
              <BookOpen size={rf(26)} color="#FFFFFF" strokeWidth={2.3} />
            </View>

            <View style={styles.farmTextWrap}>
              <Text style={styles.farmName}>Patil Farm</Text>
              <Text style={styles.farmMeta}>Soybean · 2.34 Acres</Text>
            </View>

            <View style={styles.checkCircle}>
              <Check size={rf(20)} color="#FFFFFF" strokeWidth={3.5} />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.enterButton}
            onPress={() => navigation.navigate('Home')}>
            <Grid2X2 size={rf(20)} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.enterText}>Enter KhetiMaster</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addButton}
            onPress={() => navigation.navigate('FarmMappingScreen')}>
            <Plus size={rf(23)} color={DARK} strokeWidth={2.4} />
            <Text style={styles.addText}>Add Another Farm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeaturePill = ({label}) => {
  return (
    <View style={styles.featurePill}>
      <View style={styles.featureCheck}>
        <Check size={rf(12)} color="#FFFFFF" strokeWidth={4} />
      </View>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
  },

  heroWrap: {
    width: '100%',
    height: isShort ? height * 0.42 : height * 0.46,
    backgroundColor: '#F0FDF4',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  sheet: {
    marginTop: -42,
    minHeight: height * 0.6,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.055,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: -8},
    elevation: 8,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },

  badge: {
    alignSelf: 'center',
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeEmoji: {
    fontSize: rf(16),
    marginRight: 8,
  },

  badgeText: {
    fontSize: rf(14),
    color: GREEN,
    fontWeight: '900',
  },

  title: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: rf(29),
    lineHeight: rf(36),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: rf(14),
    lineHeight: rf(23),
    color: MUTED,
    fontWeight: '600',
  },

  monitoringCard: {
    marginTop: 24,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E5F8EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.05,
    paddingTop: 26,
    paddingBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monitoringTitle: {
    marginLeft: 14,
    fontSize: rf(18),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  featuresGrid: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  featurePill: {
    width: '48%',
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: LIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  featureCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  featureText: {
    flex: 1,
    fontSize: rf(11),
    color: DARK,
    fontWeight: '900',
  },

  farmCard: {
    marginTop: 16,
    minHeight: 84,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5F8EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  farmIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  farmTextWrap: {
    flex: 1,
    marginLeft: 14,
  },

  farmName: {
    fontSize: rf(18),
    color: DARK,
    fontWeight: '900',
  },

  farmMeta: {
    marginTop: 4,
    fontSize: rf(11),
    color: '#94A3B8',
    fontWeight: '700',
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },

  enterButton: {
    marginTop: 26,
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  enterText: {
    fontSize: rf(16),
    color: '#FFFFFF',
    fontWeight: '900',
  },

  addButton: {
    marginTop: 12,
    height: 56,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5F8EC',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  addText: {
    fontSize: rf(17),
    color: DARK,
    fontWeight: '900',
  },
});