import React from 'react';
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
  Map,
  Grid3X3,
  PlusCircle,
  CircleDot,
  CloudSun,
  Sparkles,
  Check,
  Activity,
  Zap,
  BarChart3,
} from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const GREEN = '#159447';
const DARK = '#111827';
const isSmall = width < 360;
const isShort = height < 700;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 3, Math.min(size * scale, size + 2));
};
export default function FarmSuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF7" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/images/logoo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.heroWrap}>
          <Image
            source={require('../../assets/images/farmfinal.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.successPill}>
          <View style={styles.pillDot} />
          <Text style={styles.successPillText}>
            Farm Connected Successfully
          </Text>
        </View>

        <Text style={styles.title}>Your Farm Is Ready!</Text>

        <Text style={styles.subtitle}>
          KhetiMaster will now start monitoring your farm and provide weather
          updates, crop insights, and AI recommendations.
        </Text>

        <View style={styles.farmCard}>
          <View style={styles.farmHeader}>
            <View style={styles.mapIconBox}>
              <Map size={26} color="#FFFFFF" strokeWidth={2.4} />
            </View>

            <View style={styles.farmNameWrap}>
              <Text style={styles.smallLabel}>FARM NAME</Text>
              <Text style={styles.farmName}>Patil Farm</Text>
            </View>

            <View style={styles.activePill}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <CircleDot size={18} color={GREEN} />
              <View>
                <Text style={styles.detailLabel}>Crop</Text>
                <Text style={styles.detailValue}>Soybean</Text>
              </View>
            </View>

            <View style={styles.detailBox}>
              <Grid3X3 size={18} color={GREEN} />
              <View>
                <Text style={styles.detailLabel}>Area</Text>
                <Text style={styles.detailValue}>2.34 Acres</Text>
              </View>
            </View>
          </View>

          <View style={styles.monitorBox}>
            <View style={styles.monitorLeft}>
              <Zap size={17} color={GREEN} fill="rgba(21,148,71,0.12)" />
              <Text style={styles.monitorText}>Monitoring Activated</Text>
            </View>

            <BarChart3 size={23} color="#2ECC71" />
          </View>
        </View>

        <Text style={styles.nextTitle}>What Happens Next?</Text>

        <NextCard
          type="green"
          Icon={CircleDot}
          title="Satellite Monitoring Starts"
          text="Daily field scans to track crop health and growth."
        />

        <NextCard
          type="blue"
          Icon={CloudSun}
          title="Weather Alerts Enabled"
          text="Hyperlocal forecasts and storm warnings for your location."
        />

        <NextCard
          type="orange"
          Icon={Sparkles}
          title="AI Recommendations Activated"
          text="Smart crop advice based on your soil, weather and market data."
        />

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.replace('Home')}
        >
          <LinearGradient
            colors={['#138A3D', '#159447']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.dashboardBtn}
          >
            <Grid3X3 size={22} color="#FFFFFF" />
            <Text style={styles.dashboardText}>Go To Dashboard</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addFarmBtn}
          onPress={() => navigation.navigate('FarmDetails')}
        >
          <PlusCircle size={22} color="#138A3D" />
          <Text style={styles.addFarmText}>Add Another Farm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
function NextCard({ type, Icon, title, text }) {
  const theme =
    type === 'blue'
      ? {
          bg: '#EEF6FF',
          border: '#D8EAFE',
          iconBg: '#DBEAFE',
          icon: '#2563EB',
        }
      : type === 'orange'
      ? {
          bg: '#FFF7ED',
          border: '#FED7AA',
          iconBg: '#FFEDD5',
          icon: '#F97316',
        }
      : {
          bg: '#ECFFF3',
          border: '#C7F9D8',
          iconBg: '#DFF8E8',
          icon: GREEN,
        };
  return (
    <View
      style={[
        styles.nextCard,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.nextIconBox,
          {
            backgroundColor: theme.iconBg,
          },
        ]}
      >
        <Icon size={22} color={theme.icon} />
      </View>

      <View style={styles.nextContent}>
        <Text style={styles.nextCardTitle}>{title}</Text>
        <Text style={styles.nextCardText}>{text}</Text>
      </View>

      <View style={styles.nextCheck}>
        <Check size={15} color="#FFFFFF" strokeWidth={4} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FFF7',
  },
  scrollContent: {
    paddingHorizontal: isSmall ? 18 : 22,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: isShort ? 12 : 20,
  },
  heroImage: {
    width: width * 0.72,
    height: isShort ? height * 0.22 : height * 0.27,
  },
  successText: {
    marginTop: isShort ? 4 : 8,
    textAlign: 'center',
    color: '#5D8A28',
    fontSize: rf(10),
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  successPill: {
    alignSelf: 'center',
    marginTop: 32,
    height: 34,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#DFF8E8',
    borderWidth: 1,
    borderColor: '#98E6B6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 10,
  },
  successPillText: {
    fontSize: rf(13),
    color: '#0F8A3D',
    fontWeight: '900',
  },
  title: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: isSmall ? 26 : 30,
    lineHeight: isSmall ? 32 : 38,
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    alignSelf: 'center',
    marginTop: 18,
    maxWidth: width * 0.78,
    textAlign: 'center',
    fontSize: rf(15),
    lineHeight: rf(23),
    color: '#64748B',
    fontWeight: '500',
  },
  farmCard: {
    marginTop: 36,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    backgroundColor: '#FFFFFF',
    padding: isSmall ? 18 : 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmNameWrap: {
    flex: 1,
    marginLeft: 16,
  },
  smallLabel: {
    fontSize: rf(10),
    color: '#A0AEC0',
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  farmName: {
    marginTop: 3,
    fontSize: rf(17),
    color: DARK,
    fontWeight: '900',
  },
  activePill: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#DFF8E8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 7,
  },
  activeText: {
    fontSize: rf(12),
    color: GREEN,
    fontWeight: '900',
  },
  detailRow: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 12,
  },
  detailBox: {
    flex: 1,
    minHeight: 74,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmall ? 12 : 14,
    gap: 10,
  },
  detailLabel: {
    fontSize: rf(12),
    color: '#94A3B8',
    fontWeight: '700',
  },
  detailValue: {
    marginTop: 3,
    fontSize: rf(13.5),
    color: DARK,
    fontWeight: '900',
  },
  monitorBox: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EFFFF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
  },
  monitorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  monitorText: {
    fontSize: rf(13),
    color: GREEN,
    fontWeight: '900',
  },
  nextTitle: {
    marginTop: 40,
    marginBottom: 16,
    fontSize: rf(16),
    color: DARK,
    fontWeight: '900',
  },
  nextCard: {
    minHeight: 76,
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextContent: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  nextCardTitle: {
    fontSize: rf(13.5),
    color: DARK,
    fontWeight: '900',
  },
  nextCardText: {
    marginTop: 3,
    fontSize: rf(10.5),
    lineHeight: rf(14),
    color: '#64748B',
    fontWeight: '500',
  },
  nextCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardBtn: {
    marginTop: 26,
    height: 60,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    elevation: 6,
  },
  dashboardText: {
    fontSize: rf(17),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  logo: {
    width: width * 0.42,
    height: 55,
  },
  addFarmBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  addFarmText: {
    fontSize: rf(16),
    color: GREEN,
    fontWeight: '900',
  },
});
