import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MapPin,
  Clock3,
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
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#20C55A';
const DARK = '#111827';
const MUTED = '#64748B';
const PAGE_BG = '#F8FAF9';
const BORDER = '#E5E7EB';
const ORANGE = '#F97316';
const PAGE_PADDING = width * 0.037;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const DEFAULT_MACHINE = {
  id: 'sonalika-di-745',
  name: 'Sonalika DI 745',
  horsepower: '45 HP',
  driveType: '2WD',
  fuelType: 'Diesel',
  liftingCapacity: '1800 kg',
  availability: 'Available',
  engine: '3 Cyl.',
  rating: '4.8',
  reviews: 128,
  bookings: '250+',
  distance: '2.1 km Away',
  hourlyPrice: 650,
  dailyPrice: 2500,
  weeklyPrice: 14000,
  owner: 'Patil Agro Services',
  ownerSince: '3 yrs',
  image: require('../../assets/machinery/sonalika-di-745.jpg'),
  ownerImage: require('../../assets/machinery/owner-1.jpg'),
};
const IMPLEMENTS = [
  {
    id: 'rotavator',
    label: 'Rotavator',
    Icon: Tractor,
    color: '#16883E',
    background: '#ECFDF3',
  },
  {
    id: 'cultivator',
    label: 'Cultivator',
    Icon: Wrench,
    color: '#2563EB',
    background: '#EFF6FF',
  },
  {
    id: 'seed-drill',
    label: 'Seed Drill',
    Icon: Leaf,
    color: '#F97316',
    background: '#FFF7ED',
  },
  {
    id: 'trailer',
    label: 'Trailer',
    Icon: Tractor,
    color: '#9333EA',
    background: '#FAF5FF',
  },
];
const REVIEWS = [
  {
    id: 'review-1',
    name: 'Ramesh Deshmukh',
    date: '12 June 2026',
    rating: '5.0',
    text: 'Excellent tractor service! The Sonalika was in perfect condition and the operator was very professional. Completed my 2.5 acre field in just 3 hours.',
  },
  {
    id: 'review-2',
    name: 'Suresh Jadhav',
    date: '8 June 2026',
    rating: '4.5',
    text: 'Good service, on-time arrival. The rotavator attachment worked well for my soybean field preparation. Would book again.',
  },
];
const CALENDAR_DATES = [
  {
    day: 1,
  },
  {
    day: 2,
  },
  {
    day: 3,
  },
  {
    day: 4,
  },
  {
    day: 5,
  },
  {
    day: 6,
  },
  {
    day: 7,
  },
  {
    day: 8,
  },
  {
    day: 9,
  },
  {
    day: 10,
  },
  {
    day: 11,
  },
  {
    day: 12,
  },
  {
    day: 13,
  },
  {
    day: 14,
  },
  {
    day: 15,
  },
  {
    day: 16,
  },
  {
    day: 17,
  },
  {
    day: 18,
  },
  {
    day: 19,
  },
  {
    day: 20,
  },
  {
    day: 21,
  },
  {
    day: 22,
  },
  {
    day: 23,
  },
  {
    day: 24,
  },
  {
    day: 25,
    status: 'today',
  },
  {
    day: 26,
    status: 'available',
  },
  {
    day: 27,
    status: 'available',
  },
  {
    day: 28,
    status: 'booked',
  },
  {
    day: 29,
    status: 'booked',
  },
  {
    day: 30,
    status: 'available',
  },
];
export default function MachineryDetailsScreen({ navigation, route }) {
  const machine = route?.params?.machine || DEFAULT_MACHINE;
  const [favourite, setFavourite] = useState(Boolean(machine?.favourite));
  const [selectedPlan, setSelectedPlan] = useState('day');
  const specificationData = useMemo(
    () => [
      {
        id: 'hp',
        value: machine.horsepower || '45 HP',
        label: 'ENGINE POWER',
        Icon: Gauge,
        color: GREEN,
      },
      {
        id: 'drive',
        value: machine.driveType || '2WD',
        label: 'DRIVE TYPE',
        Icon: Tractor,
        color: '#2563EB',
      },
      {
        id: 'fuel',
        value: machine.fuelType || 'Diesel',
        label: 'FUEL TYPE',
        Icon: Fuel,
        color: '#F97316',
      },
      {
        id: 'lift',
        value: machine.liftingCapacity || '1800 kg',
        label: 'HYDRAULIC LIFT',
        Icon: Weight,
        color: '#16883E',
      },
      {
        id: 'availability',
        value: machine.availability || 'Available',
        label: 'PTO',
        Icon: Tractor,
        color: '#16A34A',
      },
      {
        id: 'engine',
        value: machine.engine || '3 Cyl.',
        label: 'ENGINE',
        Icon: Gauge,
        color: '#2563EB',
      },
    ],
    [machine],
  );
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('TractorBooking');
  };
  const handleBookNow = () => {
    navigation.navigate('MachineryBooking', {
      machine,
      selectedPlan,
    });
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={machine.image}
          resizeMode="cover"
          style={styles.heroImage}
        >
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
            style={styles.heroCircleButton}
          >
            <ArrowLeft size={rf(21)} color={DARK} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.heroRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFavourite(current => !current)}
              style={styles.heroCircleButton}
            >
              <Heart
                size={rf(20)}
                color={favourite ? '#EF4444' : DARK}
                fill={favourite ? '#EF4444' : 'transparent'}
                strokeWidth={2.3}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Share Machinery',
                  'Sharing options can be opened here.',
                )
              }
              style={styles.heroCircleButton}
            >
              <Share2 size={rf(19)} color={DARK} strokeWidth={2.3} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroDots}>
            <View style={styles.heroActiveDot} />
            <View style={styles.heroDot} />
            <View style={styles.heroDot} />
          </View>

          <Text style={styles.imageCount}>1/4</Text>
        </ImageBackground>

        <View style={styles.pageContent}>
          <View style={styles.machineInfoCard}>
            <Text style={styles.machineName}>{machine.name}</Text>

            <View style={styles.machineInfoBadges}>
              <View style={styles.availablePill}>
                <View style={styles.availableDot} />

                <Text style={styles.availablePillText}>Available Today</Text>
              </View>

              <View style={styles.distancePill}>
                <MapPin size={rf(11)} color="#64748B" strokeWidth={2.3} />

                <Text style={styles.distanceText}>
                  {machine.distance || '2.1 km Away'}
                </Text>
              </View>
            </View>

            <View style={styles.machineStatsRow}>
              <View style={styles.ratingInline}>
                <Star size={rf(14)} color="#FACC15" fill="#FACC15" />

                <Text style={styles.ratingValue}>
                  {machine.rating || '4.8'}
                </Text>

                <Text style={styles.ratingReviews}>
                  {machine.reviews || 128} Reviews
                </Text>
              </View>

              <Text style={styles.bookingCount}>
                {machine.bookings || '250+'} Bookings
              </Text>
            </View>
          </View>

          <View style={styles.ownerStrip}>
            <Image source={machine.ownerImage} style={styles.ownerSmallImage} />

            <View style={styles.ownerStripDetails}>
              <Text style={styles.ownerSmallName}>
                {machine.owner || 'Patil Agro Services'}
              </Text>

              <Text style={styles.ownerSmallSub}>Owner & Operator</Text>
            </View>

            <View style={styles.verifiedPartnerPill}>
              <BadgeCheck size={rf(11)} color="#FFFFFF" strokeWidth={2.5} />

              <Text style={styles.verifiedPartnerText}>Verified Partner</Text>
            </View>
          </View>

          <LinearGradient
            colors={['#16883E', '#0D7C35']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.recommendationCard}
          >
            <View style={styles.recommendationCircle} />

            <View style={styles.recommendationHeader}>
              <View style={styles.recommendedBadge}>
                <Sparkles size={rf(10)} color="#FFFFFF" strokeWidth={2.3} />

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

              <RecommendationStat Icon={Gauge} label="45 HP Rec." />
            </View>

            <View style={styles.recommendationPriceRow}>
              <View style={styles.recommendationPriceBox}>
                <Text style={styles.recommendationLabel}>EST. WORK TIME</Text>

                <Text style={styles.recommendationValue}>3.5 Hours</Text>
              </View>

              <View style={styles.recommendationPriceBox}>
                <Text style={styles.recommendationLabel}>EST. RENTAL COST</Text>

                <Text style={styles.recommendationValue}>₹2,300</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() =>
                Alert.alert(
                  'AI Recommendation',
                  'This machine matches your crop, farm area and estimated work requirement.',
                )
              }
              style={styles.whyButton}
            >
              <Eye size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />

              <Text style={styles.whyButtonText}>Why this recommendation?</Text>
            </TouchableOpacity>
          </LinearGradient>

          <SectionTitle title="Specifications" />

          <View style={styles.specificationGrid}>
            {specificationData.map(item => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={styles.specificationCard}>
                  <Icon size={rf(18)} color={item.color} strokeWidth={2.2} />

                  <Text style={styles.specificationValue}>{item.value}</Text>

                  <Text style={styles.specificationLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.supportedLabel}>Supported Implements</Text>

          <View style={styles.supportedPills}>
            {['Rotavator', 'Cultivator', 'Trailer'].map(item => (
              <View key={item} style={styles.supportedPill}>
                <Text style={styles.supportedPillText}>{item}</Text>
              </View>
            ))}
          </View>

          <SectionTitle title="Pricing" />

          <View style={styles.pricingRow}>
            <PricingCard
              label="PER HOUR"
              price={`₹${machine.hourlyPrice || 650}`}
              note="Min 2 hrs"
              selected={selectedPlan === 'hour'}
              onPress={() => setSelectedPlan('hour')}
            />

            <PricingCard
              label="PER DAY"
              price={`₹${Number(machine.dailyPrice || 2500).toLocaleString(
                'en-IN',
              )}`}
              note="Best Value"
              selected={selectedPlan === 'day'}
              recommended
              onPress={() => setSelectedPlan('day')}
            />

            <PricingCard
              label="PER WEEK"
              price={`₹${Number(machine.weeklyPrice || 14000).toLocaleString(
                'en-IN',
              )}`}
              note="Save ₹3,500"
              selected={selectedPlan === 'week'}
              onPress={() => setSelectedPlan('week')}
            />
          </View>

          <View style={styles.depositBanner}>
            <CircleAlert size={rf(17)} color="#A16207" strokeWidth={2.3} />

            <Text style={styles.depositText}>
              Refundable deposit of ₹2,000 required at booking
            </Text>
          </View>

          <CalendarCard />

          <SectionTitle title="Included Implements" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.implementRow}
          >
            {IMPLEMENTS.map(item => {
              const Icon = item.Icon;
              return (
                <View key={item.id} style={styles.implementCard}>
                  <View
                    style={[
                      styles.implementIconBox,
                      {
                        backgroundColor: item.background,
                      },
                    ]}
                  >
                    <Icon size={rf(20)} color={item.color} strokeWidth={2.2} />
                  </View>

                  <Text style={styles.implementLabel}>{item.label}</Text>
                </View>
              );
            })}
          </ScrollView>

          <SectionTitle title="Owner Profile" />

          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <Image source={machine.ownerImage} style={styles.ownerImage} />

              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>
                  {machine.owner || 'Patil Agro Services'}
                </Text>

                <View style={styles.verifiedOwnerBadge}>
                  <BadgeCheck size={rf(11)} color="#FFFFFF" strokeWidth={2.5} />

                  <Text style={styles.verifiedOwnerText}>Verified Partner</Text>
                </View>
              </View>
            </View>

            <View style={styles.ownerStatsRow}>
              <OwnerStat value={machine.rating || '4.8'} label="Rating" />

              <OwnerStat value={machine.bookings || '250+'} label="Bookings" />

              <OwnerStat
                value={machine.ownerSince || '3 yrs'}
                label="On Platform"
              />
            </View>

            <View style={styles.ownerActions}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() =>
                  Alert.alert('Call Owner', 'Calling Patil Agro Services...')
                }
                style={styles.callOwnerButton}
              >
                <Phone size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />

                <Text style={styles.callOwnerText}>Call Seller</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() =>
                  Alert.alert('Chat Owner', 'Opening machinery owner chat.')
                }
                style={styles.chatOwnerButton}
              >
                <MessageSquare
                  size={rf(16)}
                  color="#FFFFFF"
                  strokeWidth={2.4}
                />

                <Text style={styles.chatOwnerText}>Chat Seller</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.reviewHeader}>
            <SectionTitle title="Customer Reviews" noMargin />

            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.seeAllReviews}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingSummary}>
            <View style={styles.ratingScoreBox}>
              <Text style={styles.largeRating}>4.8</Text>

              <View style={styles.largeStars}>
                {[1, 2, 3, 4, 5].map(item => (
                  <Star
                    key={item}
                    size={rf(11)}
                    color="#FACC15"
                    fill="#FACC15"
                  />
                ))}
              </View>

              <Text style={styles.reviewCountText}>128 Reviews</Text>
            </View>

            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((rating, index) => (
                <View key={rating} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarNumber}>{rating}</Text>

                  <View style={styles.ratingBarBackground}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        {
                          width: `${[88, 62, 31, 14, 5][index]}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {REVIEWS.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}

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
              title="24-7 Support"
              subtitle=""
              color="#9333EA"
              background="#FAF5FF"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>
              ₹{machine.hourlyPrice || 650}
            </Text>

            <Text style={styles.bottomUnit}>/hr</Text>
          </View>

          <Text style={styles.bottomDayPrice}>
            ₹{Number(machine.dailyPrice || 2500).toLocaleString('en-IN')} per
            day
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleBookNow}
          style={styles.bookNowButton}
        >
          <CalendarDays size={rf(17)} color="#FFFFFF" strokeWidth={2.4} />

          <Text style={styles.bookNowText}>Book Now</Text>
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
      style={[styles.sectionTitle, noMargin && styles.sectionTitleNoMargin]}
    >
      {title}
    </Text>
  );
}
function PricingCard({ label, price, note, selected, recommended, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.pricingCard, selected && styles.selectedPricingCard]}
    >
      {recommended && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>BEST</Text>
        </View>
      )}

      <Text
        style={[styles.pricingLabel, selected && styles.selectedPricingText]}
      >
        {label}
      </Text>

      <Text
        style={[styles.pricingPrice, selected && styles.selectedPricingText]}
      >
        {price}
      </Text>

      <Text
        style={[styles.pricingNote, selected && styles.selectedPricingNote]}
      >
        {note}
      </Text>
    </TouchableOpacity>
  );
}
function CalendarCard() {
  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity activeOpacity={0.8} style={styles.calendarArrow}>
          <ChevronLeft size={rf(18)} color={DARK} strokeWidth={2.3} />
        </TouchableOpacity>

        <Text style={styles.calendarMonth}>June 2026</Text>

        <TouchableOpacity activeOpacity={0.8} style={styles.calendarArrow}>
          <ChevronRight size={rf(18)} color={DARK} strokeWidth={2.3} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {CALENDAR_DATES.map(item => (
          <TouchableOpacity
            key={item.day}
            activeOpacity={0.8}
            style={[
              styles.calendarDate,
              item.status === 'today' && styles.todayCalendarDate,
              item.status === 'available' && styles.availableCalendarDate,
              item.status === 'booked' && styles.bookedCalendarDate,
            ]}
          >
            <Text
              style={[
                styles.calendarDateText,
                item.status === 'today' && styles.selectedCalendarDateText,
                item.status === 'booked' && styles.bookedCalendarDateText,
              ]}
            >
              {item.day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.calendarLegend}>
        <LegendItem color="#16883E" label="Today" />

        <LegendItem color="#D8F0E1" label="Available" />

        <LegendItem color="#FECACA" label="Booked" />
      </View>
    </View>
  );
}
function LegendItem({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
          },
        ]}
      />

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
function ReviewCard({ review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.reviewerAvatar}>
          <Text style={styles.reviewerAvatarText}>{review.name.charAt(0)}</Text>
        </View>

        <View style={styles.reviewerDetails}>
          <Text style={styles.reviewerName}>{review.name}</Text>

          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>

        <Star size={rf(11)} color="#FACC15" fill="#FACC15" />

        <Text style={styles.reviewRating}>{review.rating}</Text>
      </View>

      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  );
}
function SafetyCard({ Icon, title, subtitle, color, background }) {
  return (
    <View style={styles.safetyCard}>
      <View
        style={[
          styles.safetyIconBox,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Icon size={rf(17)} color={color} strokeWidth={2.3} />
      </View>

      <View style={styles.safetyTextBox}>
        <Text style={styles.safetyTitle}>{title}</Text>

        {!!subtitle && <Text style={styles.safetySubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 95,
    backgroundColor: PAGE_BG,
  },
  heroImage: {
    width: '100%',
    height: width * 0.81,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroCircleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: rf(9),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pageContent: {
    marginTop: -3,
    paddingHorizontal: PAGE_PADDING,
  },
  machineInfoCard: {
    borderRadius: 14,
    padding: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  machineName: {
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
  },
  machineInfoBadges: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
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
  availablePillText: {
    fontSize: rf(9),
    fontWeight: '800',
    color: GREEN,
  },
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
  },
  distanceText: {
    fontSize: rf(9),
    fontWeight: '700',
    color: '#64748B',
  },
  machineStatsRow: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  ratingReviews: {
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },
  bookingCount: {
    fontSize: rf(9),
    fontWeight: '700',
    color: DARK,
  },
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
  ownerSmallImage: {
    width: 35,
    height: 35,
    borderRadius: 18,
  },
  ownerStripDetails: {
    flex: 1,
    marginLeft: 9,
  },
  ownerSmallName: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  ownerSmallSub: {
    marginTop: 2,
    fontSize: rf(8),
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
  verifiedPartnerText: {
    fontSize: rf(8),
    fontWeight: '800',
    color: '#FFFFFF',
  },
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
    fontSize: rf(7),
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
  matchValue: {
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },
  recommendationTitle: {
    marginTop: 4,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recommendationStats: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 7,
  },
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
    fontSize: rf(7),
    fontWeight: '700',
    color: '#D1FAE5',
  },
  recommendationPriceRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 7,
  },
  recommendationPriceBox: {
    flex: 1,
    height: 47,
    borderRadius: 7,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  recommendationLabel: {
    fontSize: rf(7),
    fontWeight: '600',
    color: '#BBF7D0',
  },
  recommendationValue: {
    marginTop: 3,
    fontSize: rf(11),
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
  whyButtonText: {
    fontSize: rf(9),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 13,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  sectionTitleNoMargin: {
    marginTop: 0,
    marginBottom: 0,
  },
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
  },
  specificationValue: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  specificationLabel: {
    marginTop: 2,
    fontSize: rf(6),
    fontWeight: '700',
    color: MUTED,
  },
  supportedLabel: {
    marginTop: 12,
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },
  supportedPills: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 6,
  },
  supportedPill: {
    height: 21,
    paddingHorizontal: 9,
    borderRadius: 4,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportedPillText: {
    fontSize: rf(7),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 8,
  },
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
  selectedPricingCard: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  bestBadge: {
    position: 'absolute',
    right: 3,
    top: 3,
    height: 13,
    borderRadius: 3,
    paddingHorizontal: 4,
    backgroundColor: '#D1FAE5',
  },
  bestBadgeText: {
    fontSize: rf(5),
    fontWeight: '900',
    color: GREEN,
  },
  pricingLabel: {
    fontSize: rf(7),
    fontWeight: '700',
    color: MUTED,
  },
  pricingPrice: {
    marginTop: 5,
    fontSize: rf(14),
    fontWeight: '900',
    color: GREEN,
  },
  pricingNote: {
    marginTop: 4,
    fontSize: rf(7),
    fontWeight: '700',
    color: DARK,
  },
  selectedPricingText: {
    color: '#FFFFFF',
  },
  selectedPricingNote: {
    color: '#D1FAE5',
  },
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
    fontSize: rf(8),
    lineHeight: rf(12),
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
  calendarMonth: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  weekRow: {
    marginTop: 13,
    flexDirection: 'row',
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: rf(7),
    fontWeight: '800',
    color: MUTED,
  },
  calendarGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDate: {
    width: `${100 / 7}%`,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCalendarDate: {
    backgroundColor: GREEN,
  },
  availableCalendarDate: {
    backgroundColor: '#DDF4E5',
  },
  bookedCalendarDate: {
    backgroundColor: '#FECACA',
  },
  calendarDateText: {
    fontSize: rf(8),
    fontWeight: '700',
    color: DARK,
  },
  selectedCalendarDateText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  bookedCalendarDateText: {
    color: '#DC2626',
  },
  calendarLegend: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: rf(7),
    fontWeight: '700',
    color: MUTED,
  },
  implementRow: {
    paddingRight: 10,
    gap: 9,
  },
  implementCard: {
    width: 74,
    height: 65,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  implementIconBox: {
    width: 31,
    height: 31,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  implementLabel: {
    marginTop: 5,
    fontSize: rf(7),
    fontWeight: '800',
    color: DARK,
  },
  ownerCard: {
    borderRadius: 13,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 47,
    height: 47,
    borderRadius: 24,
  },
  ownerDetails: {
    flex: 1,
    marginLeft: 11,
  },
  ownerName: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
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
  verifiedOwnerText: {
    fontSize: rf(7),
    fontWeight: '800',
    color: '#FFFFFF',
  },
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
  ownerStatValue: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  ownerStatLabel: {
    marginTop: 3,
    fontSize: rf(7),
    fontWeight: '600',
    color: MUTED,
  },
  ownerActions: {
    marginTop: 11,
    flexDirection: 'row',
    gap: 8,
  },
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
  callOwnerText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },
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
  chatOwnerText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reviewHeader: {
    marginTop: 27,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllReviews: {
    fontSize: rf(8),
    fontWeight: '900',
    color: GREEN,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScoreBox: {
    width: '32%',
  },
  largeRating: {
    fontSize: rf(31),
    lineHeight: rf(35),
    fontWeight: '900',
    color: DARK,
  },
  largeStars: {
    marginTop: 2,
    flexDirection: 'row',
  },
  reviewCountText: {
    marginTop: 4,
    fontSize: rf(7),
    fontWeight: '700',
    color: ORANGE,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBarRow: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBarNumber: {
    width: 13,
    fontSize: rf(7),
    fontWeight: '700',
    color: MUTED,
  },
  ratingBarBackground: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FBBF24',
  },
  reviewCard: {
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
  reviewerDetails: {
    flex: 1,
    marginLeft: 8,
  },
  reviewerName: {
    fontSize: rf(8),
    fontWeight: '900',
    color: DARK,
  },
  reviewDate: {
    marginTop: 2,
    fontSize: rf(6),
    fontWeight: '600',
    color: MUTED,
  },
  reviewRating: {
    marginLeft: 3,
    fontSize: rf(8),
    fontWeight: '900',
    color: DARK,
  },
  reviewText: {
    marginTop: 9,
    fontSize: rf(8),
    lineHeight: rf(12),
    fontWeight: '500',
    color: '#475569',
  },
  sectionDivider: {
    height: 6,
    marginTop: 23,
    backgroundColor: '#EEF2F3',
  },
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
  safetyTextBox: {
    marginLeft: 8,
  },
  safetyTitle: {
    fontSize: rf(8),
    fontWeight: '900',
    color: DARK,
  },
  safetySubtitle: {
    marginTop: 2,
    fontSize: rf(7),
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
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: rf(19),
    fontWeight: '900',
    color: GREEN,
  },
  bottomUnit: {
    marginLeft: 3,
    fontSize: rf(8),
    fontWeight: '600',
    color: MUTED,
  },
  bottomDayPrice: {
    marginTop: 1,
    fontSize: rf(7),
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
  bookNowText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
