import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  BadgeCheck,
  MapPin,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
  Gauge,
  Droplet,
  Clock,
  Zap,
  Navigation,
  Ruler,
  Check,
  ArrowRight,
} from 'lucide-react-native';
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
const SPECS = [
  {
    Icon: Gauge,
    value: '10 Acres/Hr',
    label: 'COVERAGE',
  },
  {
    Icon: Droplet,
    value: '16 Litres',
    label: 'TANK SIZE',
  },
  {
    Icon: Clock,
    value: '25 Min',
    label: 'FLIGHT TIME',
  },
  {
    Icon: Zap,
    value: '2 Min',
    label: 'BATTERY SWAP',
  },
  {
    Icon: Navigation,
    value: 'RTK GPS',
    label: 'NAVIGATION',
  },
  {
    Icon: Ruler,
    value: '6-8 m',
    label: 'SPRAY WIDTH',
  },
];
const SERVICES_TAGS = [
  'Pesticide Spraying',
  'Crop Survey',
  'Liquid Fertilizer',
  'Micronutrient Spray',
  'Aerial Mapping',
];
const REVIEWS = [
  {
    name: 'Santosh Kumar',
    time: '2 days ago · Wheat Farm, 4.5 Acres',
    text: 'Excellent service! Rahul was on time and the drone completed spraying 4.5 acres in under 40 minutes. Saved a lot of water compared to manual spraying.',
    rating: 5,
  },
  {
    name: 'Meena Devi',
    time: '1 week ago · Soybean, 3 Acres',
    text: 'Very professional team. The AI recommendation was spot on — spraying at early morning gave excellent results. Will definitely book again for next season!',
    rating: 5,
  },
  {
    name: 'Vijay Rao',
    time: '2 weeks ago · Cotton, 6 Acres',
    text: 'Good service overall. Drone equipment was top quality. Would be great if they had early morning slots available on weekends too.',
    rating: 4,
  },
];
const INCLUDES = [
  {
    Icon: BadgeCheck,
    label: 'Certified Pilot',
  },
  {
    Icon: Zap,
    label: 'Drone Equipment',
  },
  {
    Icon: Check,
    label: 'Safety Gear',
  },
  {
    Icon: Sparkles,
    label: 'Spray Report',
  },
];
export default function DroneServiceDetailsScreen({ navigation }) {
  const [fav, setFav] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {}
        <ImageBackground
          source={require('../../assets/drone/detail-hero.jpg')}
          style={styles.hero}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.circleBtn}
            >
              <ArrowLeft size={rf(20)} color={DARK} strokeWidth={2.4} />
            </TouchableOpacity>
            <Text style={styles.heroTitle}>Drone Service Details</Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => setFav(!fav)}
                style={styles.circleBtn}
              >
                <Heart
                  size={rf(18)}
                  color={fav ? '#EF4444' : DARK}
                  fill={fav ? '#EF4444' : 'none'}
                  strokeWidth={2.4}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn}>
                <Share2 size={rf(18)} color={DARK} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </ImageBackground>

        {}
        <View style={styles.thumbRow}>
          {[1, 2, 3, 4].map(i => (
            <Image
              key={i}
              source={require('../../assets/drone/detail-hero.jpg')}
              style={styles.thumb}
            />
          ))}
        </View>

        {}
        <View style={styles.content}>
          <Text style={styles.serviceName}>SkyAgri Drone Services</Text>
          <View style={styles.badgeRow}>
            <View style={styles.starPill}>
              <Star
                size={rf(12)}
                color="#F59E0B"
                fill="#F59E0B"
                strokeWidth={1.5}
              />
              <Text style={styles.starText}>
                4.9 <Text style={styles.reviewCount}>(186 Reviews)</Text>
              </Text>
            </View>
            <View style={styles.dgcaLg}>
              <BadgeCheck size={rf(12)} color={GREEN} strokeWidth={2.4} />
              <Text style={styles.dgcaLgText}>DGCA CERTIFIED</Text>
            </View>
          </View>

          <View style={styles.miniRow}>
            <View style={styles.miniCard}>
              <MapPin size={rf(13)} color={GREEN} strokeWidth={2.4} />
              <View
                style={{
                  marginLeft: 8,
                }}
              >
                <Text style={styles.miniLabel}>DISTANCE</Text>
                <Text style={styles.miniValue}>3.5 km</Text>
              </View>
            </View>
            <View style={styles.miniCard}>
              <Calendar size={rf(13)} color={GREEN} strokeWidth={2.4} />
              <View
                style={{
                  marginLeft: 8,
                }}
              >
                <Text style={styles.miniLabel}>STATUS</Text>
                <Text
                  style={[
                    styles.miniValue,
                    {
                      color: GREEN,
                    },
                  ]}
                >
                  Available Today
                </Text>
              </View>
            </View>
          </View>

          {}
          <View style={styles.aiTitleRow}>
            <Sparkles size={rf(15)} color={GREEN} strokeWidth={2.4} />
            <Text style={styles.aiTitleTxt}>AI Spray Recommendation</Text>
          </View>

          <LinearGradient colors={['#16A34A', '#15803D']} style={styles.aiCard}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={styles.aiCardIcon}>
                <Sparkles size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View
                style={{
                  marginLeft: 10,
                  flex: 1,
                }}
              >
                <Text style={styles.aiCardTitle}>Smart Recommendation</Text>
                <Text style={styles.aiCardSub}>Patil Farm · Soybean</Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 14,
                gap: 30,
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.aiFieldLabel}>FARM</Text>
                <Text style={styles.aiFieldValue}>Patil Farm</Text>
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.aiFieldLabel}>CROP</Text>
                <Text style={styles.aiFieldValue}>Soybean</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                gap: 30,
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.aiFieldLabel}>AREA</Text>
                <Text style={styles.aiFieldValue}>2.34 Acres</Text>
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.aiFieldLabel}>SERVICE</Text>
                <Text style={styles.aiFieldValue}>Pesticide Spray</Text>
              </View>
            </View>

            <View style={styles.aiTimeCard}>
              <Text style={styles.aiTimeLabel}>BEST TIME</Text>
              <Text style={styles.aiTimeValue}>Tomorrow - 6:00-8:00 AM</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 10,
              }}
            >
              <View style={styles.aiMiniStat}>
                <Text style={styles.aiMiniVal}>35 Min</Text>
                <Text style={styles.aiMiniLbl}>Est. Duration</Text>
              </View>
              <View style={styles.aiMiniStat}>
                <Text style={styles.aiMiniVal}>90%</Text>
                <Text style={styles.aiMiniLbl}>Water Saving</Text>
              </View>
            </View>

            <View style={styles.aiEstRow}>
              <View>
                <Text style={styles.aiEstLbl}>Estimated Cost</Text>
                <Text style={styles.aiEstSub}>for 2.34 Acres</Text>
              </View>
              <Text style={styles.aiEstPrice}>₹1,850</Text>
            </View>

            <TouchableOpacity style={styles.whyBtn}>
              <Text style={styles.whyBtnText}>ⓘ Why this recommendation?</Text>
            </TouchableOpacity>
          </LinearGradient>

          {}
          <Text style={styles.sectionH}>Drone Specifications</Text>
          <View style={styles.specGrid}>
            {SPECS.map(s => {
              const Icon = s.Icon;
              return (
                <View key={s.label} style={styles.specCard}>
                  <Icon size={rf(18)} color={GREEN} strokeWidth={2.2} />
                  <Text style={styles.specValue}>{s.value}</Text>
                  <Text style={styles.specLabel}>{s.label}</Text>
                </View>
              );
            })}
          </View>

          {}
          <Text style={styles.sectionH}>Supported Services</Text>
          <View style={styles.tagRow}>
            {SERVICES_TAGS.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          {}
          <Text style={styles.sectionH}>Operator Profile</Text>
          <View style={styles.opProfCard}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Image
                source={require('../../assets/drone/hero.jpg')}
                style={styles.opAvatar}
              />
              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                }}
              >
                <Text style={styles.opProfName}>Rahul Patil</Text>
                <Text style={styles.opProfRole}>Certified Drone Pilot</Text>
                <View style={styles.opProfMeta}>
                  <Star
                    size={rf(11)}
                    color="#F59E0B"
                    fill="#F59E0B"
                    strokeWidth={1.5}
                  />
                  <Text style={styles.opProfMetaText}>4.9</Text>
                  <Text style={styles.opProfDot}>·</Text>
                  <Text style={styles.opProfMetaText}>520 SERVICES</Text>
                  <Text style={styles.opProfDot}>·</Text>
                  <Text style={styles.opProfMetaText}>5 YRS EXP.</Text>
                </View>
              </View>
              <View style={styles.dgcaCorner}>
                <Text style={styles.dgcaCornerText}>DGCA</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                marginTop: 12,
              }}
            >
              <TouchableOpacity style={styles.callBtn}>
                <Phone size={rf(14)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chatBtn}>
                <MessageCircle
                  size={rf(14)}
                  color={DARK_GREEN}
                  strokeWidth={2.4}
                />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {}
          <View style={styles.reviewHead}>
            <Text style={styles.sectionH}>Customer Reviews</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Star
                size={rf(12)}
                color="#F59E0B"
                fill="#F59E0B"
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontSize: rf(12),
                  fontWeight: '900',
                  color: DARK,
                }}
              >
                4.9
              </Text>
              <Text
                style={{
                  fontSize: rf(11),
                  color: MUTED,
                  fontWeight: '600',
                }}
              >
                (186)
              </Text>
            </View>
          </View>

          {REVIEWS.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={styles.revAvatar} />
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                  }}
                >
                  <Text style={styles.revName}>{r.name}</Text>
                  <Text style={styles.revTime}>{r.time}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                  }}
                >
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={rf(11)}
                      color={s <= r.rating ? '#F59E0B' : '#E5E7EB'}
                      fill={s <= r.rating ? '#F59E0B' : '#E5E7EB'}
                      strokeWidth={1.5}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.revText}>{r.text}</Text>
              <View style={styles.verifiedRow}>
                <BadgeCheck size={rf(12)} color={GREEN} strokeWidth={2.4} />
                <Text style={styles.verifiedText}>Verified Booking</Text>
              </View>
            </View>
          ))}

          {}
          <Text style={styles.sectionH}>Pricing</Text>
          <View style={styles.priceBox}>
            <Text style={styles.bigPrice}>
              ₹750 <Text style={styles.bigPriceUnit}>/ Acre</Text>
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>Minimum Booking</Text>
              <Text style={styles.priceVal}>2 Acres (₹1,500)</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>Travel Charge</Text>
              <Text
                style={[
                  styles.priceVal,
                  {
                    color: GREEN,
                  },
                ]}
              >
                Free within 5 km
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>Equipment & Safety</Text>
              <Text
                style={[
                  styles.priceVal,
                  {
                    color: GREEN,
                  },
                ]}
              >
                Included
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceKey}>Spray Report</Text>
              <Text
                style={[
                  styles.priceVal,
                  {
                    color: GREEN,
                  },
                ]}
              >
                Free PDF Report
              </Text>
            </View>
          </View>

          {}
          <Text style={styles.sectionH}>Service Includes</Text>
          <View style={styles.incGrid}>
            {INCLUDES.map(i => {
              const Icon = i.Icon;
              return (
                <View key={i.label} style={styles.incCard}>
                  <Icon size={rf(15)} color={GREEN} strokeWidth={2.4} />
                  <Text style={styles.incText}>{i.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.footerLbl}>Starting from</Text>
          <Text style={styles.footerPrice}>
            ₹750 <Text style={styles.footerUnit}>/ Acre</Text>
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('BookDroneService')}
          style={styles.bookBtn}
        >
          <Calendar size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.bookBtnText}>Book Service</Text>
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
  hero: {
    height: 240,
    justifyContent: 'space-between',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  thumbRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: width * 0.037,
  },
  serviceName: {
    fontSize: rf(22),
    fontWeight: '900',
    color: DARK,
  },
  badgeRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFBEB',
  },
  starText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  reviewCount: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  dgcaLg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
  },
  dgcaLgText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: GREEN,
    letterSpacing: 0.3,
  },
  miniRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  miniCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: MUTED,
  },
  miniValue: {
    marginTop: 2,
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  aiTitleRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitleTxt: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  aiCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
  },
  aiCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiCardSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  aiFieldLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  aiFieldValue: {
    marginTop: 2,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiTimeCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  aiTimeLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  aiTimeValue: {
    marginTop: 3,
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiMiniStat: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  aiMiniVal: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiMiniLbl: {
    marginTop: 2,
    fontSize: rf(9),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  aiEstRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiEstLbl: {
    fontSize: rf(10),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  aiEstSub: {
    fontSize: rf(9),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  aiEstPrice: {
    fontSize: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  whyBtn: {
    marginTop: 12,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyBtnText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionH: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specCard: {
    width: (width - width * 0.074 - 16) / 3,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    gap: 4,
  },
  specValue: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
    marginTop: 4,
  },
  specLabel: {
    fontSize: rf(8),
    color: MUTED,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: DARK,
  },
  opProfCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: BORDER,
  },
  opAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
  },
  opProfName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  opProfRole: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  opProfMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  opProfMetaText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: DARK,
  },
  opProfDot: {
    fontSize: rf(10),
    color: MUTED,
  },
  dgcaCorner: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dgcaCornerText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },
  callBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callBtnText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  chatBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chatBtnText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK_GREEN,
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: BORDER,
  },
  revAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  revName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  revTime: {
    marginTop: 2,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  revText: {
    marginTop: 10,
    fontSize: rf(11),
    color: DARK,
    lineHeight: rf(16),
    fontWeight: '500',
  },
  verifiedRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: GREEN,
  },
  priceBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: BORDER,
  },
  bigPrice: {
    fontSize: rf(28),
    fontWeight: '900',
    color: GREEN,
  },
  bigPriceUnit: {
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '600',
  },
  priceRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceKey: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '600',
  },
  priceVal: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  incGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  incCard: {
    width: (width - width * 0.074 - 8) / 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLbl: {
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '600',
  },
  footerPrice: {
    marginTop: 2,
    fontSize: rf(18),
    fontWeight: '900',
    color: GREEN,
  },
  footerUnit: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  bookBtn: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookBtnText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
