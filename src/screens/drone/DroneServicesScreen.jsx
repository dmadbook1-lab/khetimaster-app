import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Bell,
  MapPin,
  ChevronDown,
  Search,
  Mic,
  SlidersHorizontal,
  Calendar,
  FlaskConical,
  Sparkles,
  Grid3x3,
  ArrowRight,
  Star,
  BadgeCheck,
  Droplet,
  Check,
  Zap,
  Shield,
} from 'lucide-react-native';
import BottomTabBar from '../../common/BottomTabBar';
const { width } = Dimensions.get('window');
const GREEN = '#16A34A';
const DARK_GREEN = '#15803D';
const DARK = '#111827';
const MUTED = '#64748B';
const BORDER = '#E5E7EB';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const CATEGORIES = [
  {
    id: 'pesticide',
    label: 'Pesticide\nSpraying',
    Icon: Calendar,
    active: true,
  },
  {
    id: 'fertilizer',
    label: 'Liquid\nFertilizer',
    Icon: FlaskConical,
  },
  {
    id: 'micro',
    label: 'Micronutrient\nSpray',
    Icon: Sparkles,
  },
  {
    id: 'survey',
    label: 'Crop Survey',
    Icon: Grid3x3,
  },
];
const OPERATORS = [
  {
    id: '1',
    name: 'SkyAgri Drone Services',
    initials: 'SA',
    pilot: 'Rahul Patil',
    role: 'Certified Drone Pilot',
    distance: '3.5 km away',
    availability: 'Available Today',
    rating: 4.9,
    reviews: 186,
    price: '750',
    image: require('../../assets/drone/hero.jpg'),
    certified: true,
  },
  {
    id: '2',
    name: 'AgroWings Services',
    initials: 'AW',
    pilot: 'Suresh Desai',
    role: 'Senior Drone Pilot',
    distance: '5.2 km away',
    availability: 'Tomorrow',
    rating: 4.7,
    reviews: 124,
    price: '700',
    image: require('../../assets/drone/operator-2.png'),
    certified: true,
  },
];
const BENEFITS = [
  {
    Icon: Droplet,
    color: '#3B82F6',
    bg: '#EFF6FF',
    title: 'Saves Water',
    desc: 'Up to 90% less water vs\nmanual spraying',
  },
  {
    Icon: Check,
    color: GREEN,
    bg: '#ECFDF5',
    title: 'Uniform Spraying',
    desc: 'RTK GPS ensures even\ncoverage',
  },
  {
    Icon: Zap,
    color: '#F97316',
    bg: '#FFF7ED',
    title: 'Fast Operation',
    desc: '10 acres/hour, done in\nminutes',
  },
  {
    Icon: Shield,
    color: '#9333EA',
    bg: '#FAF5FF',
    title: 'Reduced Exposure',
    desc: 'Zero chemical contact\nfor farmers',
  },
];
export default function DroneServicesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drone Services</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={rf(20)} color={DARK} strokeWidth={2.2} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.locationBar}>
          <MapPin size={rf(15)} color={GREEN} strokeWidth={2.4} />
          <Text style={styles.locationText}>Aurangabad, Maharashtra</Text>
          <View
            style={{
              flex: 1,
            }}
          />
          <Text style={styles.changeText}>Change</Text>
          <ChevronDown size={rf(14)} color={GREEN} strokeWidth={2.4} />
        </View>

        {}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={rf(17)} color={MUTED} strokeWidth={2.2} />
            <TextInput
              placeholder="Search drone services..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            <Mic size={rf(17)} color={MUTED} strokeWidth={2.2} />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal
              size={rf(17)}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        {}
        <ImageBackground
          source={require('../../assets/drone/hero.jpg')}
          style={styles.heroBanner}
          imageStyle={{
            borderRadius: 18,
          }}
        >
          <LinearGradient
            colors={['rgba(21,128,61,0.85)', 'rgba(21,128,61,0.5)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroPill}>
            <Sparkles size={rf(11)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.heroPillText}>AI-POWERED PRECISION</Text>
          </View>
          <Text style={styles.heroTitle}>Smart Drone{'\n'}Services</Text>
          <Text style={styles.heroDesc}>
            Precision spraying for{'\n'}healthier crops with trained{'\n'}drone
            operators.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('BookDroneService')}
            style={styles.heroBtn}
          >
            <Calendar size={rf(14)} color={DARK_GREEN} strokeWidth={2.4} />
            <Text style={styles.heroBtnText}>Book Drone Service</Text>
          </TouchableOpacity>
        </ImageBackground>

        {}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Categories</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>
        <View style={styles.catRow}>
          {CATEGORIES.map(c => {
            const Icon = c.Icon;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catCard, c.active && styles.catCardActive]}
              >
                <Icon
                  size={rf(22)}
                  color={c.active ? '#FFFFFF' : DARK}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.catLabel,
                    c.active && {
                      color: '#FFFFFF',
                    },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {}
        <LinearGradient colors={['#16A34A', '#15803D']} style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconWrap}>
              <Sparkles size={rf(18)} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >
              <Text style={styles.aiTitle}>AI Spray Recommendation</Text>
              <Text style={styles.aiSubtitle}>
                Based on crop health & weather
              </Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.aiGrid}>
            <AIStat label="FARM" value="Patil Farm" />
            <AIStat label="CROP" value="Soybean" />
          </View>
          <View style={styles.aiGrid}>
            <AIStat label="AREA" value="2.34 Acres" />
            <AIStat label="SERVICE" value="Pesticide Spray" />
          </View>

          <View style={styles.aiDateCard}>
            <Text style={styles.aiDateLabel}>RECOMMENDED DATE</Text>
            <View style={styles.aiDateRow}>
              <Text style={styles.aiDateValue}>Tomorrow Morning</Text>
              <Text style={styles.aiDateTime}>6:00-8:00 AM</Text>
            </View>
          </View>

          <View style={styles.aiMetrics}>
            <AIMetric value="35" unit="Min" label="EST. DURATION" />
            <View style={styles.aiVDivider} />
            <AIMetric value="90%" label="WATER SAVED" />
            <View style={styles.aiVDivider} />
            <AIMetric value="95%" label="ACCURACY" />
          </View>

          <View style={styles.aiCostRow}>
            <View>
              <Text style={styles.aiCostLabel}>Estimated Cost</Text>
              <Text style={styles.aiCostValue}>₹1,850</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('BookDroneService')}
              style={styles.aiViewBtn}
            >
              <Text style={styles.aiViewText}>View Recommendation</Text>
              <ArrowRight size={rf(14)} color={DARK_GREEN} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Operators</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        {OPERATORS.map(op => (
          <TouchableOpacity
            key={op.id}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('DroneServiceDetails', {
                operator: op,
              })
            }
            style={styles.opCard}
          >
            <ImageBackground
              source={op.image}
              style={styles.opImage}
              imageStyle={{
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            >
              <View style={styles.opDistPill}>
                <MapPin size={rf(10)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.opDistText}>{op.distance}</Text>
              </View>
              <View style={styles.opAvailPill}>
                <View style={styles.opAvailDot} />
                <Text style={styles.opAvailText}>{op.availability}</Text>
              </View>
              <View style={styles.opInitialWrap}>
                <View style={styles.opInitial}>
                  <Text style={styles.opInitialText}>{op.initials}</Text>
                </View>
                <Text style={styles.opNameOnImg}>{op.name}</Text>
              </View>
            </ImageBackground>

            <View style={styles.opBody}>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.opPilot}>{op.pilot}</Text>
                <View style={styles.opRoleRow}>
                  <Text style={styles.opRole}>{op.role}</Text>
                  <View style={styles.dgcaPill}>
                    <BadgeCheck size={rf(11)} color={GREEN} strokeWidth={2.4} />
                    <Text style={styles.dgcaText}>DGCA</Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  alignItems: 'flex-end',
                }}
              >
                <View style={styles.ratingRow}>
                  <Star
                    size={rf(13)}
                    color="#F59E0B"
                    fill="#F59E0B"
                    strokeWidth={1.5}
                  />
                  <Text style={styles.ratingText}>{op.rating}</Text>
                  <Text style={styles.reviewText}>({op.reviews})</Text>
                </View>
              </View>
            </View>

            <View style={styles.opFooter}>
              <View>
                <Text style={styles.opPrice}>
                  ₹{op.price}
                  <Text style={styles.opUnit}> / Acre</Text>
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('BookDroneService', {
                    operator: op,
                  })
                }
                style={styles.bookNowBtn}
              >
                <Calendar size={rf(13)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.bookNowText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {}
        <Text
          style={[
            styles.sectionTitle,
            {
              marginTop: 22,
              marginBottom: 14,
            },
          ]}
        >
          Why Drone Services?
        </Text>
        <View style={styles.benefitsGrid}>
          {BENEFITS.map(b => {
            const Icon = b.Icon;
            return (
              <View key={b.title} style={styles.benefitCard}>
                <View
                  style={[
                    styles.benefitIcon,
                    {
                      backgroundColor: b.bg,
                    },
                  ]}
                >
                  <Icon size={rf(18)} color={b.color} strokeWidth={2.4} />
                </View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomTabBar navigation={navigation} active="Bazaar" />
    </SafeAreaView>
  );
}
const AIStat = ({ label, value }) => (
  <View style={styles.aiStatBox}>
    <Text style={styles.aiStatLabel}>{label}</Text>
    <Text style={styles.aiStatValue}>{value}</Text>
  </View>
);
const AIMetric = ({ value, unit, label }) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
    }}
  >
    <Text style={styles.aiMetricValue}>
      {value}
      {unit && (
        <Text
          style={{
            fontSize: rf(11),
          }}
        >
          {' '}
          {unit}
        </Text>
      )}
    </Text>
    <Text style={styles.aiMetricLabel}>{label}</Text>
  </View>
);
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.037,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
  },
  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingBottom: 110,
  },
  locationBar: {
    marginTop: 6,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  locationText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: DARK,
  },
  changeText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: GREEN,
    marginRight: 4,
  },
  searchRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: rf(13),
    color: DARK,
    padding: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBanner: {
    marginTop: 14,
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'flex-start',
  },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  heroPillText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroTitle: {
    marginTop: 10,
    fontSize: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: rf(28),
  },
  heroDesc: {
    marginTop: 6,
    fontSize: rf(11),
    color: '#FFFFFF',
    lineHeight: rf(15),
    opacity: 0.95,
    fontWeight: '600',
  },
  heroBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBtnText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  seeAll: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  catRow: {
    flexDirection: 'row',
    gap: 9,
  },
  catCard: {
    flex: 1,
    aspectRatio: 0.95,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  catCardActive: {
    backgroundColor: DARK_GREEN,
  },
  catLabel: {
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
    lineHeight: rf(13),
  },
  aiCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiSubtitle: {
    marginTop: 2,
    fontSize: rf(10),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  aiStatBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  aiStatLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  aiStatValue: {
    marginTop: 2,
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiDateCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  aiDateLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  aiDateRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiDateValue: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiDateTime: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#FEF08A',
  },
  aiMetrics: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  aiVDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  aiMetricValue: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiMetricLabel: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  aiCostRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCostLabel: {
    fontSize: rf(10),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  aiCostValue: {
    fontSize: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiViewBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiViewText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  opCard: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  opImage: {
    height: 160,
    padding: 12,
    justifyContent: 'flex-start',
  },
  opDistPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  opDistText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  opAvailPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 9,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  opAvailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  opAvailText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK,
  },
  opInitialWrap: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  opInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opInitialText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  opNameOnImg: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  opBody: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  opPilot: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  opRoleRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  opRole: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  dgcaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ECFDF5',
  },
  dgcaText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  reviewText: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  opFooter: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opPrice: {
    fontSize: rf(18),
    fontWeight: '900',
    color: GREEN,
  },
  opUnit: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  bookNowBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookNowText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  benefitCard: {
    width: (width - width * 0.074 - 10) / 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    marginTop: 10,
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  benefitDesc: {
    marginTop: 3,
    fontSize: rf(10),
    color: MUTED,
    lineHeight: rf(14),
    fontWeight: '500',
  },
});
