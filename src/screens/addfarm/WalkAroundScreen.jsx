// src/screens/WalkAroundScreen.jsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Info,
  Navigation,
  MapPin,
  Map,
  Droplets,
  Shield,
  Battery,
  Radio,
} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#16A34A';
const DARK = '#111827';
const MUTED = '#64748B';

const isSmall = width < 360;
const isShort = height < 700;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function WalkAroundScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.circleBtn}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={rf(22)} color="#1F2937" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.stepPill}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>STEP 2 OF 3</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.circleBtn}>
            <Info size={rf(21)} color="#94A3B8" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <Image
          source={require('../../assets/images/walkaround.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title}>Walk Around Your Farm</Text>

          <Text style={styles.subtitle}>
            Walk along the edge of your farm and{'\n'}
            KhetiMaster will automatically trace the{'\n'}
            boundary using GPS.
          </Text>

          <View style={styles.gpsCard}>
            <View style={styles.gpsIconWrap}>
              <Navigation
                size={rf(29)}
                color="#10B981"
                strokeWidth={2.3}
              />

              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            </View>

            <View style={styles.gpsTextWrap}>
              <Text style={styles.gpsTitle}>GPS Signal Strong</Text>
              <Text style={styles.gpsSub}>
                Accuracy ±1.2 meters · Ready to map
              </Text>
            </View>

            <View style={styles.signalWrap}>
              <View style={[styles.signalBar, {height: 11}]} />
              <View style={[styles.signalBar, {height: 16}]} />
              <View style={[styles.signalBar, {height: 22}]} />
              <View style={[styles.signalBar, {height: 28}]} />
            </View>
          </View>

          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <MapPin size={rf(15)} color="#F97316" strokeWidth={2.4} />
              <Text style={styles.tipsTitle}>Tips for Best Results</Text>
            </View>

            <View style={[styles.tipItem, styles.tipGreen]}>
              <View style={[styles.tipIconBox, styles.tipIconGreen]}>
                <Map size={rf(22)} color="#10B981" strokeWidth={2.4} />
              </View>
              <Text style={styles.tipText}>Stay near the field boundary</Text>
            </View>

            <View style={[styles.tipItem, styles.tipBlue]}>
              <View style={[styles.tipIconBox, styles.tipIconBlue]}>
                <Droplets size={rf(22)} color="#2563EB" strokeWidth={2.4} />
              </View>
              <Text style={styles.tipText}>Keep GPS enabled throughout</Text>
            </View>

            <View style={[styles.tipItem, styles.tipOrange]}>
              <View style={[styles.tipIconBox, styles.tipIconOrange]}>
                <Battery size={rf(22)} color="#F97316" strokeWidth={2.4} />
              </View>
              <Text style={styles.tipText}>Ensure sufficient battery charge</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('WalkAroundTrackingScreen')}>
          <LinearGradient
            colors={['#15803D', '#2ECC71']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.startButton}>
            <MapPin size={rf(21)} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.startText}>Start GPS Mapping</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.manualRow}>
          <Map size={rf(18)} color="#94A3B8" strokeWidth={2.2} />
          <Text style={styles.manualText}>Or use manual boundary instead</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Mapscreen')}>
            <Text style={styles.tapText}>Tap here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: height * 0.18,
  },

  header: {
    height: isSmall ? 68 : 78,
    paddingHorizontal: width * 0.045,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  circleBtn: {
    width: width * 0.092,
    height: width * 0.092,
    minWidth: 38,
    minHeight: 38,
    maxWidth: 44,
    maxHeight: 44,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepPill: {
    height: isSmall ? 30 : 32,
    paddingHorizontal: width * 0.04,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },

  stepText: {
    fontSize: rf(12),
    color: '#EA580C',
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  heroImage: {
    width: '100%',
    height: isShort ? height * 0.31 : height * 0.335,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  content: {
    paddingHorizontal: width * 0.045,
    alignItems: 'center',
  },

  title: {
    marginTop: isShort ? 26 : 32,
    fontSize: rf(23),
    lineHeight: rf(29),
    color: DARK,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.35,
  },

  subtitle: {
    marginTop: 14,
    fontSize: rf(15),
    lineHeight: rf(24),
    color: MUTED,
    fontWeight: '500',
    textAlign: 'center',
  },

  gpsCard: {
    width: '100%',
    marginTop: isShort ? 26 : 34,
    minHeight: isSmall ? 74 : 82,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
  },

  gpsIconWrap: {
    width: isSmall ? 48 : 56,
    height: isSmall ? 48 : 56,
    borderRadius: 999,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ECFDF5',
  },

  checkText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: -1,
  },

  gpsTextWrap: {
    flex: 1,
    marginLeft: width * 0.035,
  },

  gpsTitle: {
    fontSize: rf(15),
    color: '#064E3B',
    fontWeight: '900',
  },

  gpsSub: {
    marginTop: 3,
    fontSize: rf(12),
    lineHeight: rf(16),
    color: '#10B981',
    fontWeight: '700',
  },

  signalWrap: {
    width: 30,
    height: 34,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  signalBar: {
    width: 4,
    borderRadius: 10,
    backgroundColor: '#10B981',
  },

  tipsCard: {
    width: '100%',
    marginTop: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.05,
    paddingTop: 24,
    paddingBottom: 22,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },

  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },

  tipsTitle: {
    fontSize: rf(16),
    color: '#1F2937',
    fontWeight: '900',
  },

  tipItem: {
    width: '100%',
    minHeight: isSmall ? 58 : 64,
    borderRadius: 16,
    paddingHorizontal: width * 0.035,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  tipGreen: {
    backgroundColor: '#F0FDF4',
  },

  tipBlue: {
    backgroundColor: '#F3F8FF',
  },

  tipOrange: {
    backgroundColor: '#FFF8F1',
    marginBottom: 0,
  },

  tipIconBox: {
    width: isSmall ? 40 : 42,
    height: isSmall ? 40 : 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipIconGreen: {
    backgroundColor: '#DCFCE7',
  },

  tipIconBlue: {
    backgroundColor: '#DBEAFE',
  },

  tipIconOrange: {
    backgroundColor: '#FFEDD5',
  },

  tipText: {
    flex: 1,
    marginLeft: width * 0.035,
    fontSize: rf(14),
    lineHeight: rf(20),
    color: '#334155',
    fontWeight: '700',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.045,
    paddingTop: 14,
    paddingBottom: isSmall ? 12 : 16,
  },

  startButton: {
    height: isSmall ? 54 : 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#16A34A',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },

  startText: {
    fontSize: rf(16),
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  manualRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  manualText: {
    fontSize: rf(13),
    color: '#64748B',
    fontWeight: '700',
  },

  tapText: {
    fontSize: rf(13),
    color: '#15803D',
    fontWeight: '900',
  },
});