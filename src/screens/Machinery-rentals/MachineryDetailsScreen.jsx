import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  BadgeCheck,
  Sparkles,
  Eye,
  Gauge,
  Fuel,
  Weight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Tractor,
  Leaf,
  Wrench,
  Phone,
  MessageSquare,
  ShieldCheck,
  Timer,
  FileCheck2,
  Headphones,
  CircleAlert,
} from 'lucide-react-native';

import { getMachineryById } from '../../redux/slices/machinerySlice';

const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#20C55A';
const DARK = '#111827';
const MUTED = '#64748B';
const PAGE_BG = '#F8FAF9';
const BORDER = '#E5E7EB';
const PAGE_PADDING = width * 0.037;

// Upscaled font scale utility
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 3));
};

const CALENDAR_DATES = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  if (day === 25) return { day, status: 'today' };
  if (day === 28 || day === 29) return { day, status: 'booked' };
  if (day >= 26) return { day, status: 'available' };
  return { day };
});

export default function MachineryDetailsScreen({ navigation, route }) {
  const dispatch = useDispatch();

  const machineryFromRoute = route?.params?.machine || route?.params?.machinery;
  const machineryId = route?.params?.machineryId || machineryFromRoute?._id;

  const { selectedMachinery, isLoading } = useSelector(
    state => state.machinery || {},
  );

  const [favourite, setFavourite] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('day');

  // Fetch full data if only ID was passed
  useEffect(() => {
    if (machineryId && !machineryFromRoute?.pricing) {
      dispatch(getMachineryById(machineryId));
    }
  }, [dispatch, machineryId, machineryFromRoute]);

  const machine = selectedMachinery || machineryFromRoute || {};

  const name = machine.name || 'Machinery';
  const category = machine.category || 'Tractor';
  const brand = machine.brand || '';
  const model = machine.model || '';
  const modelYear = machine.modelYear || '';
  const enginePower = machine.enginePower || {};
  const fuelType = machine.fuelType || 'diesel';
  const driveType = machine.driveType || '2WD';
  const supportedImplements = Array.isArray(machine.supportedImplements)
    ? machine.supportedImplements
    : [];
  const supportsImplements = machine.supportsImplements || false;
  const availability = machine.availability || 'available';
  const isAvailable = availability === 'available';
  const pricing = machine.pricing || {};
  const hourlyPrice = Number(pricing.hourly) || 0;
  const dailyPrice = Number(pricing.daily) || 0;
  const customPricing = Array.isArray(pricing.custom) ? pricing.custom : [];
  const rating = machine.rating || 0;
  const totalReviews = machine.totalReviews || 0;
  const totalJobsCompleted = machine.totalJobsCompleted || 0;
  const owner = machine.owner || {};
  const ownerName =
    machine.ownerName ||
    owner.fullName ||
    'Owner';
  const ownerPhone = owner.phoneNumber || '';
  const ownerImage = owner.profileImage;
  const state = machine.state || '';
  const district = machine.district || '';
  const village = machine.village || '';
  const address = machine.address || '';
  const description = machine.description || '';

  const location = [village, district, state].filter(Boolean).join(', ');
  
  // High fidelity local assets fallback
  const heroImage =
    Array.isArray(machine.images) && machine.images.length > 0
      ? { uri: machine.images[0] }
      : require('../../assets/machinery/sonalika-di-745.jpg');

  const ownerProfileImage = ownerImage 
    ? { uri: ownerImage } 
    : require('../../assets/machinery/owner-1.jpg');

  const estWorkTime = 3.5;
  const estRentalCost = Math.round(hourlyPrice * estWorkTime);

  const specificationData = useMemo(
    () =>
      [
        enginePower.value && {
          id: 'hp',
          value: `${enginePower.value} ${enginePower.unit || 'HP'}`,
          label: 'ENGINE POWER',
          Icon: Gauge,
          color: GREEN,
        },
        {
          id: 'drive',
          value: driveType,
          label: 'DRIVE TYPE',
          Icon: Tractor,
          color: '#2563EB',
        },
        {
          id: 'fuel',
          value: fuelType.charAt(0).toUpperCase() + fuelType.slice(1),
          label: 'FUEL TYPE',
          Icon: Fuel,
          color: '#F97316',
        },
        modelYear && {
          id: 'year',
          value: String(modelYear),
          label: 'MODEL YEAR',
          Icon: CalendarDays,
          color: '#16883E',
        },
        {
          id: 'availability',
          value: isAvailable ? 'Yes' : 'No',
          label: 'AVAILABLE',
          Icon: BadgeCheck,
          color: '#16A34A',
        },
        brand && {
          id: 'brand',
          value: brand,
          label: 'BRAND',
          Icon: Wrench,
          color: '#2563EB',
        },
      ].filter(Boolean),
    [machine],
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('TractorBooking');
    }
  };

  const handleBookNow = () => {
    if (!isAvailable) {
      Alert.alert('Unavailable', 'This machinery is not available for booking right now.');
      return;
    }
    if (hourlyPrice <= 0 && dailyPrice <= 0) {
      Alert.alert('Pricing Unavailable', 'This machinery does not have pricing set.');
      return;
    }
    navigation.navigate('MachineryBooking', {
      machine,
      selectedPlan,
    });
  };

  const handleCallOwner = () => {
    if (!ownerPhone) {
      Alert.alert('Contact Unavailable', 'Owner phone number is not available.');
      return;
    }
    Linking.openURL(`tel:${ownerPhone}`).catch(() =>
      Alert.alert('Error', 'Could not open dialer.'),
    );
  };

  const handleChatOwner = () => {
    Alert.alert('Chat', 'Chat functionality coming soon.');
  };

  if (isLoading && !machine.name) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Loading machinery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={heroImage}
          resizeMode="cover"
          style={styles.heroImage}>
          <LinearGradient
            colors={[
              'rgba(15,23,42,0.32)',
              'rgba(15,23,42,0.02)',
              'rgba(15,23,42,0.05)',
            ]}
            style={styles.heroOverlay}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBack}
            style={styles.heroCircleButton}>
            <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.heroRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFavourite(current => !current)}
              style={styles.heroCircleButton}>
              <Heart
                size={rf(21)}
                color={favourite ? '#EF4444' : DARK}
                fill={favourite ? '#EF4444' : 'transparent'}
                strokeWidth={2.3}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert('Share', 'Sharing options coming soon.')
              }
              style={styles.heroCircleButton}>
              <Share2 size={rf(20)} color={DARK} strokeWidth={2.3} />
            </TouchableOpacity>
          </View>

          {Array.isArray(machine.images) && machine.images.length > 1 && (
            <>
              <View style={styles.heroDots}>
                <View style={styles.heroActiveDot} />
                {machine.images.slice(1).map((_, idx) => (
                  <View key={idx} style={styles.heroDot} />
                ))}
              </View>
              <Text style={styles.imageCount}>
                1/{machine.images.length}
              </Text>
            </>
          )}
        </ImageBackground>

        <View style={styles.pageContent}>
          <View style={styles.machineInfoCard}>
            <Text style={styles.machineName}>{name}</Text>

            <View style={styles.machineInfoBadges}>
              <View
                style={[
                  styles.availablePill,
                  !isAvailable && { backgroundColor: '#FEE2E2' },
                ]}>
                <View
                  style={[
                    styles.availableDot,
                    !isAvailable && { backgroundColor: '#EF4444' },
                  ]}
                />
                <Text
                  style={[
                    styles.availablePillText,
                    !isAvailable && { color: '#DC2626' },
                  ]}>
                  {isAvailable ? 'Available Today' : 'Unavailable'}
                </Text>
              </View>

              {location ? (
                <View style={styles.distancePill}>
                  <MapPin size={rf(12)} color="#64748B" strokeWidth={2.3} />
                  <Text style={styles.distanceText} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.machineStatsRow}>
              <View style={styles.ratingInline}>
                <Star size={rf(15)} color="#FACC15" fill="#FACC15" />
                <Text style={styles.ratingValue}>
                  {rating > 0 ? rating.toFixed(1) : 'New'}
                </Text>
                {totalReviews > 0 && (
                  <Text style={styles.ratingReviews}>
                    {totalReviews} Reviews
                  </Text>
                )}
              </View>

              <Text style={styles.bookingCount}>
                {totalJobsCompleted} Jobs Completed
              </Text>
            </View>
          </View>

          {/* Owner Strip */}
          <View style={styles.ownerStrip}>
            <Image
              source={ownerProfileImage}
              style={styles.ownerSmallImage}
            />

            <View style={styles.ownerStripDetails}>
              <Text style={styles.ownerSmallName}>{ownerName}</Text>
              <Text style={styles.ownerSmallSub}>Owner & Operator</Text>
            </View>

            <View style={styles.verifiedPartnerPill}>
              <BadgeCheck size={rf(12)} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.verifiedPartnerText}>Verified</Text>
            </View>
          </View>

          {/* AI Recommendation */}
          <LinearGradient
            colors={['#16883E', '#0D7C35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recommendationCard}>
            <View style={styles.recommendationCircle} />

            <View style={styles.recommendationHeader}>
              <View style={styles.recommendedBadge}>
                <Sparkles size={rf(11)} color="#FFFFFF" strokeWidth={2.3} />
                <Text style={styles.recommendedBadgeText}>AI RECOMMENDED</Text>
              </View>

              <View style={styles.matchCircle}>
                <Text style={styles.matchValue}>98%</Text>
              </View>
            </View>

            <Text style={styles.recommendationTitle}>
              Best Match for Your Farm
            </Text>

            <View style={styles.recommendationStats}>
              <RecommendationStat Icon={Leaf} label="Soybean" />
              <RecommendationStat Icon={MapPin} label="2.34 Acres" />
              <RecommendationStat
                Icon={Gauge}
                label={enginePower.value ? `${enginePower.value} HP` : '45 HP'}
              />
            </View>

            <View style={styles.recommendationPriceRow}>
              <View style={styles.recommendationPriceBox}>
                <Text style={styles.recommendationLabel}>EST. WORK TIME</Text>
                <Text style={styles.recommendationValue}>{estWorkTime} Hours</Text>
              </View>

              <View style={styles.recommendationPriceBox}>
                <Text style={styles.recommendationLabel}>EST. RENTAL COST</Text>
                <Text style={styles.recommendationValue}>
                  ₹{estRentalCost.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() =>
                Alert.alert(
                  'AI Recommendation',
                  'This machine matches your crop and farm area.',
                )
              }
              style={styles.whyButton}>
              <Eye size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.whyButtonText}>Why this recommendation?</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Specifications */}
          <SectionTitle title="Specifications" />

          <View style={styles.specificationGrid}>
            {specificationData.map(item => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={styles.specificationCard}>
                  <Icon size={rf(19)} color={item.color} strokeWidth={2.2} />
                  <Text style={styles.specificationValue} numberOfLines={1}>
                    {item.value}
                  </Text>
                  <Text style={styles.specificationLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Supported Implements */}
          {supportsImplements && supportedImplements.length > 0 && (
            <>
              <Text style={styles.supportedLabel}>Supported Implements</Text>
              <View style={styles.supportedPills}>
                {supportedImplements.map(item => (
                  <View key={item} style={styles.supportedPill}>
                    <Text style={styles.supportedPillText}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Description */}
          {description ? (
            <>
              <SectionTitle title="About" />
              <View style={styles.aboutCard}>
                <Text style={styles.aboutText}>{description}</Text>
              </View>
            </>
          ) : null}

          {/* Pricing */}
          <SectionTitle title="Pricing" />

          <View style={styles.pricingRow}>
            {hourlyPrice > 0 && (
              <PricingCard
                label="PER HOUR"
                price={`₹${hourlyPrice}`}
                note="Min 1 hr"
                selected={selectedPlan === 'hour'}
                onPress={() => setSelectedPlan('hour')}
              />
            )}

            {dailyPrice > 0 && (
              <PricingCard
                label="PER DAY"
                price={`₹${dailyPrice.toLocaleString('en-IN')}`}
                note="Best Value"
                selected={selectedPlan === 'day'}
                recommended
                onPress={() => setSelectedPlan('day')}
              />
            )}

            {customPricing.length > 0 && (
              <PricingCard
                label="CUSTOM"
                price={`₹${customPricing[0].amount || 0}`}
                note={customPricing[0].name || 'Custom'}
                selected={selectedPlan === 'custom'}
                onPress={() => setSelectedPlan('custom')}
              />
            )}
          </View>

          {customPricing.length > 0 && (
            <View style={styles.customPricingList}>
              <Text style={styles.customPricingTitle}>Additional Pricing</Text>
              {customPricing.map((item, idx) => (
                <View key={idx} style={styles.customPricingRow}>
                  <Text style={styles.customPricingName}>{item.name}</Text>
                  <Text style={styles.customPricingAmount}>
                    ₹{item.amount}
                    {item.unit ? ` / ${item.unit}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.depositBanner}>
            <CircleAlert size={rf(18)} color="#A16207" strokeWidth={2.3} />
            <Text style={styles.depositText}>
              Refundable deposit may be required at booking
            </Text>
          </View>


          {/* Location */}
          {(location || address) && (
            <>
              <SectionTitle title="Location" />
              <View style={styles.locationCard}>
                <View style={styles.locationIconBox}>
                  <MapPin size={rf(21)} color={GREEN} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  {location ? (
                    <Text style={styles.locationText}>{location}</Text>
                  ) : null}
                  {address ? (
                    <Text style={styles.addressText}>{address}</Text>
                  ) : null}
                </View>
              </View>
            </>
          )}

          {/* Owner Profile */}
          <SectionTitle title="Owner Profile" />

          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <Image
                source={ownerProfileImage}
                style={styles.ownerImage}
              />

              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{ownerName}</Text>
                <View style={styles.verifiedOwnerBadge}>
                  <BadgeCheck size={rf(12)} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.verifiedOwnerText}>Verified Partner</Text>
                </View>
              </View>
            </View>

            <View style={styles.ownerStatsRow}>
              <OwnerStat
                value={rating > 0 ? rating.toFixed(1) : 'New'}
                label="Rating"
              />
              <OwnerStat
                value={String(totalJobsCompleted)}
                label="Jobs Done"
              />
              <OwnerStat value={String(totalReviews)} label="Reviews" />
            </View>

            <View style={styles.ownerActions}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={handleCallOwner}
                style={styles.callOwnerButton}>
                <Phone size={rf(17)} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.callOwnerText}>Call Owner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={handleChatOwner}
                style={styles.chatOwnerButton}>
                <MessageSquare
                  size={rf(17)}
                  color="#FFFFFF"
                  strokeWidth={2.4}
                />
                <Text style={styles.chatOwnerText}>Chat Owner</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety */}
          <View style={styles.sectionDivider} />

          <SectionTitle title="Safety & Service" />

          <View style={styles.safetyGrid}>
            <SafetyCard
              Icon={ShieldCheck}
              title="Verified"
              subtitle="Owner"
              color="#16A34A"
              background="#ECFDF3"
            />
            <SafetyCard
              Icon={Timer}
              title="On-Time"
              subtitle="Service"
              color="#2563EB"
              background="#EFF6FF"
            />
            <SafetyCard
              Icon={FileCheck2}
              title="Insurance"
              subtitle="Available"
              color="#F97316"
              background="#FFF7ED"
            />
            <SafetyCard
              Icon={Headphones}
              title="24/7 Support"
              subtitle=""
              color="#9333EA"
              background="#FAF5FF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          {hourlyPrice > 0 ? (
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>₹{hourlyPrice}</Text>
              <Text style={styles.bottomUnit}>/hr</Text>
            </View>
          ) : (
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>₹{dailyPrice}</Text>
              <Text style={styles.bottomUnit}>/day</Text>
            </View>
          )}

          {dailyPrice > 0 && hourlyPrice > 0 && (
            <Text style={styles.bottomDayPrice}>
              ₹{dailyPrice.toLocaleString('en-IN')} per day
            </Text>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleBookNow}
          style={[
            styles.bookNowButton,
            !isAvailable && { backgroundColor: '#9CA3AF' },
          ]}>
          <CalendarDays size={rf(18)} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.bookNowText}>
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function RecommendationStat({ Icon, label }) {
  return (
    <View style={styles.recommendationStat}>
      <Icon size={rf(15)} color="#D1FAE5" strokeWidth={2.2} />
      <Text style={styles.recommendationStatText}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, noMargin = false }) {
  return (
    <Text
      style={[styles.sectionTitle, noMargin && styles.sectionTitleNoMargin]}>
      {title}
    </Text>
  );
}

function PricingCard({ label, price, note, selected, recommended, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.pricingCard, selected && styles.selectedPricingCard]}>
      {recommended && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>BEST</Text>
        </View>
      )}
      <Text
        style={[styles.pricingLabel, selected && styles.selectedPricingText]}>
        {label}
      </Text>
      <Text
        style={[styles.pricingPrice, selected && styles.selectedPricingText]}>
        {price}
      </Text>
      <Text
        style={[styles.pricingNote, selected && styles.selectedPricingNote]}>
        {note}
      </Text>
    </TouchableOpacity>
  );
}


function LegendItem({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function OwnerStat({ value, label }) {
  return (
    <View style={styles.ownerStat}>
      <Text style={styles.ownerStatValue}>{value}</Text>
      <Text style={styles.ownerStatLabel}>{label}</Text>
    </View>
  );
}

function SafetyCard({ Icon, title, subtitle, color, background }) {
  return (
    <View style={styles.safetyCard}>
      <View style={[styles.safetyIconBox, { backgroundColor: background }]}>
        <Icon size={rf(18)} color={color} strokeWidth={2.3} />
      </View>
      <View style={styles.safetyTextBox}>
        <Text style={styles.safetyTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.safetySubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: rf(13), color: MUTED, fontWeight: '600' },
  scrollContent: { paddingBottom: 95, backgroundColor: PAGE_BG },
  heroImage: { width: '100%', height: width * 0.81 },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
  },
  heroRightActions: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    gap: 7,
  },
  heroDots: {
    position: 'absolute',
    bottom: 13,
    left: '50%',
    marginLeft: -16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  heroActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  imageCount: {
    position: 'absolute',
    right: 11,
    bottom: 10,
    fontSize: rf(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pageContent: { marginTop: -3, paddingHorizontal: PAGE_PADDING },
  machineInfoCard: {
    borderRadius: 14,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  machineName: { fontSize: rf(21), fontWeight: '900', color: DARK },
  machineInfoBadges: { marginTop: 10, flexDirection: 'row', gap: 8 },
  availablePill: {
    height: 25,
    borderRadius: 13,
    paddingHorizontal: 9,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRIGHT_GREEN,
  },
  availablePillText: { fontSize: rf(10), fontWeight: '800', color: GREEN },
  distancePill: {
    height: 25,
    borderRadius: 13,
    paddingHorizontal: 9,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  distanceText: { fontSize: rf(10), fontWeight: '700', color: '#64748B', flex: 1 },
  machineStatsRow: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: rf(12), fontWeight: '900', color: DARK },
  ratingReviews: { fontSize: rf(10), fontWeight: '500', color: MUTED },
  bookingCount: { fontSize: rf(10), fontWeight: '700', color: DARK },
  ownerStrip: {
    minHeight: 59,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerSmallImage: { width: 35, height: 35, borderRadius: 18 },
  ownerStripDetails: { flex: 1, marginLeft: 9 },
  ownerSmallName: { fontSize: rf(11), fontWeight: '900', color: DARK },
  ownerSmallSub: {
    marginTop: 2,
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  verifiedPartnerPill: {
    height: 22,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedPartnerText: { fontSize: rf(9), fontWeight: '800', color: '#FFFFFF' },
  recommendationCard: {
    minHeight: 198,
    marginTop: 14,
    borderRadius: 14,
    padding: 17,
    overflow: 'hidden',
  },
  recommendationCircle: {
    position: 'absolute',
    right: -34,
    top: -42,
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendedBadge: {
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.13)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  recommendedBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  matchCircle: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchValue: { fontSize: rf(10), fontWeight: '900', color: GREEN },
  recommendationTitle: {
    marginTop: 4,
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recommendationStats: { marginTop: 12, flexDirection: 'row', gap: 7 },
  recommendationStat: {
    flex: 1,
    height: 44,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationStatText: {
    marginTop: 3,
    fontSize: rf(8),
    fontWeight: '700',
    color: '#D1FAE5',
  },
  recommendationPriceRow: { marginTop: 10, flexDirection: 'row', gap: 7 },
  recommendationPriceBox: {
    flex: 1,
    height: 47,
    borderRadius: 7,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  recommendationLabel: {
    fontSize: rf(8),
    fontWeight: '600',
    color: '#BBF7D0',
  },
  recommendationValue: {
    marginTop: 3,
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  whyButton: {
    height: 34,
    marginTop: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  whyButtonText: { fontSize: rf(10), fontWeight: '800', color: '#FFFFFF' },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 13,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },
  sectionTitleNoMargin: { marginTop: 0, marginBottom: 0 },
  specificationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  specificationCard: {
    width: '31.5%',
    height: 75,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE4DF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  specificationValue: {
    marginTop: 3,
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },
  specificationLabel: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '700',
    color: MUTED,
    textAlign: 'center',
  },
  supportedLabel: {
    marginTop: 12,
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  supportedPills: { marginTop: 6, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  supportedPill: {
    height: 21,
    paddingHorizontal: 9,
    borderRadius: 4,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportedPillText: { fontSize: rf(8), fontWeight: '800', color: '#FFFFFF' },
  aboutCard: {
    borderRadius: 10,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  aboutText: {
    fontSize: rf(11),
    lineHeight: rf(17),
    color: '#4B5563',
    fontWeight: '500',
  },
  pricingRow: { flexDirection: 'row', gap: 8 },
  pricingCard: {
    flex: 1,
    height: 88,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  selectedPricingCard: { backgroundColor: GREEN, borderColor: GREEN },
  bestBadge: {
    position: 'absolute',
    right: 3,
    top: 3,
    height: 13,
    borderRadius: 3,
    paddingHorizontal: 4,
    backgroundColor: '#D1FAE5',
  },
  bestBadgeText: { fontSize: rf(6), fontWeight: '900', color: GREEN },
  pricingLabel: { fontSize: rf(8), fontWeight: '700', color: MUTED },
  pricingPrice: {
    marginTop: 5,
    fontSize: rf(15),
    fontWeight: '900',
    color: GREEN,
  },
  pricingNote: { marginTop: 4, fontSize: rf(8), fontWeight: '700', color: DARK },
  selectedPricingText: { color: '#FFFFFF' },
  selectedPricingNote: { color: '#D1FAE5' },
  customPricingList: {
    marginTop: 10,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  customPricingTitle: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
    marginBottom: 8,
  },
  customPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  customPricingName: { fontSize: rf(11), color: '#374151', fontWeight: '600' },
  customPricingAmount: { fontSize: rf(11), color: DARK, fontWeight: '900' },
  depositBanner: {
    minHeight: 44,
    marginTop: 9,
    borderRadius: 8,
    paddingHorizontal: 11,
    backgroundColor: '#FFF7DB',
    borderWidth: 1,
    borderColor: '#FDE7A3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depositText: {
    flex: 1,
    fontSize: rf(9),
    lineHeight: rf(13),
    fontWeight: '700',
    color: '#854D0E',
  },
  calendarCard: {
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonth: { fontSize: rf(11), fontWeight: '900', color: DARK },
  weekRow: { marginTop: 13, flexDirection: 'row' },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: rf(8),
    fontWeight: '800',
    color: MUTED,
  },
  calendarGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' },
  calendarDate: {
    width: `${100 / 7}%`,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCalendarDate: { backgroundColor: GREEN },
  availableCalendarDate: { backgroundColor: '#DDF4E5' },
  bookedCalendarDate: { backgroundColor: '#FECACA' },
  calendarDateText: { fontSize: rf(9), fontWeight: '700', color: DARK },
  selectedCalendarDateText: { color: '#FFFFFF', fontWeight: '900' },
  bookedCalendarDateText: { color: '#DC2626' },
  calendarLegend: { marginTop: 10, flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: rf(8), fontWeight: '700', color: MUTED },
  locationCard: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: { fontSize: rf(12), fontWeight: '900', color: DARK },
  addressText: {
    fontSize: rf(10),
    color: MUTED,
    marginTop: 3,
    lineHeight: rf(15),
  },
  ownerCard: {
    borderRadius: 13,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  ownerHeader: { flexDirection: 'row', alignItems: 'center' },
  ownerImage: { width: 47, height: 47, borderRadius: 24 },
  ownerDetails: { flex: 1, marginLeft: 11 },
  ownerName: { fontSize: rf(14), fontWeight: '900', color: DARK },
  verifiedOwnerBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 19,
    borderRadius: 4,
    paddingHorizontal: 7,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedOwnerText: { fontSize: rf(8), fontWeight: '800', color: '#FFFFFF' },
  ownerStatsRow: {
    marginTop: 12,
    flexDirection: 'row',
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
  },
  ownerStat: {
    flex: 1,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerStatValue: { fontSize: rf(11), fontWeight: '900', color: DARK },
  ownerStatLabel: {
    marginTop: 3,
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },
  ownerActions: { marginTop: 11, flexDirection: 'row', gap: 8 },
  callOwnerButton: {
    flex: 1,
    height: 38,
    borderRadius: 7,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  callOwnerText: { fontSize: rf(11), fontWeight: '900', color: '#FFFFFF' },
  chatOwnerButton: {
    flex: 1,
    height: 38,
    borderRadius: 7,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  chatOwnerText: { fontSize: rf(11), fontWeight: '900', color: '#FFFFFF' },
  sectionDivider: { height: 6, marginTop: 23, backgroundColor: '#EEF2F3' },
  safetyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 9,
  },
  safetyCard: {
    width: '48.5%',
    height: 56,
    borderRadius: 9,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyIconBox: {
    width: 31,
    height: 31,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyTextBox: { marginLeft: 8 },
  safetyTitle: { fontSize: rf(9), fontWeight: '900', color: DARK },
  safetySubtitle: {
    marginTop: 2,
    fontSize: rf(8),
    fontWeight: '700',
    color: DARK,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 71,
    paddingHorizontal: PAGE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
  bottomPrice: { fontSize: rf(21), fontWeight: '900', color: GREEN },
  bottomUnit: {
    marginLeft: 3,
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  bottomDayPrice: {
    marginTop: 1,
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },
  bookNowButton: {
    width: width * 0.43,
    height: 45,
    borderRadius: 10,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  bookNowText: { fontSize: rf(14), fontWeight: '900', color: '#FFFFFF' },
});