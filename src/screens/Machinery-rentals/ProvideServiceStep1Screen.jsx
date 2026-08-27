import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Tractor,
  Coins,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = s => Math.max(s - 2, Math.min((s * width) / 390, s + 2));
export default function ProvideServiceStep1Screen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#111" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provide Service</Text>
        <View style={styles.stepWrap}>
          <Text style={styles.stepText}>Step 1 of 4</Text>
          <View style={styles.progressRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../assets/machinery/provide-hero-1.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.centerWrap}>
          <View style={styles.heroIcon}>
            <Tractor size={22} color="#1B7A2E" strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Have Machinery?</Text>
          <Text style={styles.subtitle}>
            Rent your farm machinery to{'\n'}nearby farmers with ease.
          </Text>
          <View style={styles.line} />
        </View>

        <FeatureCard Icon={Coins} title="Extra Income" sub="Earn from home" />
        <FeatureCard
          Icon={MapPin}
          title="Nearby Bookings"
          sub="Get orders from your village"
        />
        <FeatureCard
          Icon={ShieldCheck}
          title="Free Registration"
          sub="No charges at all"
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('ProvideServiceStep2')}
        >
          <Text style={styles.primaryText}>Get Started</Text>
          <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View
          style={{
            height: 40,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const FeatureCard = ({ Icon, title, sub }) => (
  <View style={styles.card}>
    <View style={styles.iconCircle}>
      <Icon size={22} color="#1B7A2E" strokeWidth={2} />
    </View>
    <View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </View>
  </View>
);
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: '#111',
  },
  stepWrap: {
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: rf(11),
    color: '#888',
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8E8E8',
  },
  dotActive: {
    backgroundColor: '#1B7A2E',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 6,
  },
  heroImage: {
    width: '100%',
    height: 230,
    borderRadius: 24,
    backgroundColor: '#EAF1DC',
  },
  centerWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(26),
    fontWeight: '900',
    color: '#111',
    marginTop: 10,
  },
  subtitle: {
    fontSize: rf(13),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  line: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    marginTop: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: rf(15),
    fontWeight: '800',
    color: '#111',
  },
  cardSub: {
    fontSize: rf(12),
    color: '#6B7280',
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: '#1B7A2E',
    height: 54,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '800',
  },
  skipBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#6B7280',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: rf(13),
  },
});
