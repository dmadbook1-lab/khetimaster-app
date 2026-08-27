import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  Crosshair,
  Route,
  UserRound,
} from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const GREEN = '#159447';
const DARK = '#1F2937';
const isSmall = width < 360;
const isShort = height < 700;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 3, Math.min(size * scale, size + 2));
};
export default function FarmMappingScreen({ navigation }) {
  const [selected, setSelected] = useState('draw');
  const handleContinue = () => {
    if (selected === 'walk') {
      navigation.navigate('walkaroundscreen');
    } else {
      navigation.navigate('Mapscreen');
    }
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <View style={styles.logoPill}>
            <Image
              source={require('../../assets/images/logoo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>Mapping Method</Text>
          <Text style={styles.progressStep}>Step 3 of 3</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.stepsRow}>
          {['Profile', 'Farm Info', 'Mapping'].map(item => (
            <View key={item} style={styles.stepItem}>
              <View style={styles.smallCheck}>
                <Check size={12} color="#FFFFFF" strokeWidth={4} />
              </View>
              <Text
                style={[
                  styles.stepItemText,
                  item === 'Mapping' && styles.stepActive,
                ]}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            How Would You Like to{'\n'}Map{' '}
            <Text style={styles.greenText}>Your Farm?</Text>
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Choose the method that works best for you.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelected('draw')}
          style={[
            styles.methodCard,
            selected === 'draw' && styles.methodActive,
          ]}
        >
          <View style={styles.mapMockGreen}>
            {selected === 'draw' && (
              <View style={styles.selectedBubble}>
                <Check size={16} color="#FFFFFF" strokeWidth={4} />
              </View>
            )}

            <View style={styles.polygonWrap}>
              <View style={styles.pointOne} />
              <View style={styles.pointTwo} />
              <View style={styles.pointThree} />
              <View style={styles.pointFour} />
              <Route size={64} color={GREEN} strokeWidth={1.8} />
            </View>

            <View style={styles.tapPill}>
              <Navigation size={14} color={DARK} />
              <Text style={styles.tapText}>Tap to draw</Text>
            </View>
          </View>

          <View style={styles.methodTitleRow}>
            <Text style={styles.methodTitle}>Draw on Map</Text>

            <View style={styles.recommended}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          </View>

          <Text style={styles.methodDesc}>
            Mark your farm boundary directly on the map. Best when you're not at
            the farm.
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Crosshair size={15} color="#6B7280" />
              <Text style={styles.featureText}>Works from anywhere</Text>
            </View>

            <View style={styles.featureItem}>
              <Clock size={15} color="#6B7280" />
              <Text style={styles.featureText}>~2 mins</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setSelected('walk');
            navigation.navigate('WalkAroundScreen');
          }}
          style={[
            styles.methodCard,
            selected === 'walk' && styles.methodActiveOrange,
          ]}
        >
          <View style={styles.mapMockOrange}>
            {selected === 'walk' && (
              <View style={styles.selectedBubbleOrange}>
                <Check size={16} color="#FFFFFF" strokeWidth={4} />
              </View>
            )}

            <View style={styles.routeOval}>
              <UserRound size={28} color="#2563EB" />
            </View>

            <View style={styles.gpsPill}>
              <Navigation size={14} color={DARK} />
              <Text style={styles.tapText}>GPS tracking</Text>
            </View>
          </View>

          <View style={styles.methodTitleRow}>
            <Text style={styles.methodTitle}>Walk Around Farm</Text>

            <View style={styles.accurate}>
              <Text style={styles.accurateText}>Most Accurate</Text>
            </View>
          </View>

          <Text style={styles.methodDesc}>
            Walk around the farm boundary and let GPS map it automatically.
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <MapPin size={15} color="#6B7280" />
              <Text style={styles.featureText}>Must be at farm</Text>
            </View>

            <View style={styles.featureItem}>
              <Crosshair size={15} color="#6B7280" />
              <Text style={styles.featureText}>Highest precision</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <ShieldCheck size={34} color="#2563EB" />
          <Text style={styles.infoText}>
            Once mapped, KhetiMaster will monitor your farm using satellite
            intelligence.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleContinue}>
          <LinearGradient
            colors={['#12833B', '#2ECC71']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight size={27} color="#FFFFFF" />
          </LinearGradient>
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
  scrollContent: {
    paddingHorizontal: isSmall ? 12 : 16,
    paddingBottom: 120,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoPill: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: isSmall ? 112 : 132,
    height: 30,
  },
  headerSpace: {
    width: 42,
  },
  progressTop: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: rf(14),
    color: '#9CA3AF',
    fontWeight: '800',
  },
  progressStep: {
    fontSize: rf(13),
    color: '#0F8A3D',
    fontWeight: '900',
  },
  progressTrack: {
    marginTop: 10,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#F0F1F3',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#16A34A',
  },
  stepsRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItemText: {
    fontSize: rf(13),
    color: '#6B7280',
    fontWeight: '700',
  },
  stepActive: {
    color: GREEN,
    fontWeight: '900',
  },
  titleWrap: {
    marginTop: isShort ? 28 : 34,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: isSmall ? 27 : 30,
    lineHeight: isSmall ? 34 : 38,
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  greenText: {
    color: GREEN,
  },
  subtitle: {
    marginTop: 12,
    fontSize: rf(17),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  methodCard: {
    marginTop: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    backgroundColor: '#FFFFFF',
    padding: isSmall ? 14 : 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  methodActive: {
    borderColor: GREEN,
    borderWidth: 2,
  },
  methodActiveOrange: {
    borderColor: '#FDBA74',
    borderWidth: 2,
  },
  mapMockGreen: {
    height: isSmall ? 136 : 150,
    borderRadius: 14,
    backgroundColor: '#ECFFF3',
    borderTopWidth: 8,
    borderTopColor: '#D7F8E4',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMockOrange: {
    height: isSmall ? 136 : 150,
    borderRadius: 14,
    backgroundColor: '#FFFDFB',
    borderWidth: 1,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBubble: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBubbleOrange: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  polygonWrap: {
    width: 150,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: GREEN,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(21,148,71,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },
  pointOne: {
    position: 'absolute',
    top: -5,
    left: 46,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  pointTwo: {
    position: 'absolute',
    top: 8,
    right: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  pointThree: {
    position: 'absolute',
    bottom: -5,
    right: 52,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  pointFour: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  tapPill: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    elevation: 4,
  },
  gpsPill: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    elevation: 4,
  },
  tapText: {
    fontSize: rf(12),
    color: DARK,
    fontWeight: '900',
  },
  routeOval: {
    width: 150,
    height: 68,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#F97316',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,115,22,0.06)',
  },
  methodTitleRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  methodTitle: {
    flex: 1,
    fontSize: rf(22),
    color: DARK,
    fontWeight: '900',
  },
  recommended: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: '#2ECC71',
  },
  recommendedText: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  accurate: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: '#FFF3E8',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  accurateText: {
    fontSize: rf(12),
    color: '#F97316',
    fontWeight: '900',
  },
  methodDesc: {
    marginTop: 12,
    fontSize: rf(15),
    lineHeight: rf(21),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  featureRow: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: rf(12),
    color: '#6B7280',
    fontWeight: '800',
  },
  infoBox: {
    marginTop: 30,
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7F9D8',
    backgroundColor: '#EFFFF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: rf(14),
    lineHeight: rf(19),
    color: '#087235',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: isSmall ? 12 : 16,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  button: {
    height: 66,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  buttonText: {
    fontSize: rf(21),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
