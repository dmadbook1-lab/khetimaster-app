
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import {
  MapPin,
  CloudSun,
  Users,
} from 'lucide-react-native';

import HomeHeader from '../../components/home/HomeHeader';
import WeatherCard from '../../components/home/WeatherCard';
import AIAdvisoryCard from '../../components/home/AIAdvisoryCard';
import SectionHeader from '../../components/home/SectionHeader';
import FarmCard from '../../components/home/FarmCard';
import QuickAction from '../../components/home/QuickAction';
import UpdateCard from '../../components/home/UpdateCard';
import BottomTabBar from '../../common/BottomTabBar';
import AddFarmCard from '../../components/home/AddFarmCard';
import VoiceAssistantCard from '../../components/home/VoiceAssistantCard';
import VoiceAssistantModal from '../../components/voice/VoiceAssistantModal';
import {MARKET_ROUTES} from '../../constants/marketRoutes';
import {COMMUNITY_ROUTES} from '../../constants/communityRoutes';

import {selectUser} from '../../redux/slices/authSlice';

import {
  loadMyFarms,
  selectFarmFields,
} from '../../redux/slices/farmFieldSlice';

import {useLocation} from '../../context/LocationContext';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#64748B';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

/*
 * Greeting for the phone's local time.
 */
const greetingFor = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'home.good_morning';
  if (hour >= 12 && hour < 17) return 'home.good_afternoon';
  // evening runs through the night until 5 AM
  return 'home.good_evening';
};

export default function HomeScreen({navigation}) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const [voiceAssistantVisible, setVoiceAssistantVisible] = useState(false);
  const [greeting, setGreeting] = useState(greetingFor);

  // keep the greeting right while the app stays open or comes back
  useEffect(() => {
    const timer = setInterval(() => setGreeting(greetingFor()), 60000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setGreeting(greetingFor());
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  const handleVoiceClose = useCallback(() => {
    setVoiceAssistantVisible(false);
  }, []);

  const handleVoiceNavigation = useCallback(
    (routeName, params) => {
      setVoiceAssistantVisible(false);
      navigation.navigate(routeName, params);
    },
    [navigation],
  );

  // ==================================================
  // USER
  // ==================================================

  const user = useSelector(selectUser);

  const userId =
    user?._id ||
    user?.id ||
    user?.userId;

  const userName =
    user?.fullName ||
    user?.name ||
    t('common.farmer');

  // ==================================================
  // LIVE FARM DATA
  // ==================================================

  const farmsFromRedux = useSelector(selectFarmFields);

  const displayedFarms = useMemo(() => {
    return Array.isArray(farmsFromRedux)
      ? farmsFromRedux
      : [];
  }, [farmsFromRedux]);

  // Refresh the farms whenever Home gains focus.
  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return undefined;
      }

      dispatch(loadMyFarms(userId)).catch(error => {
        console.warn('Unable to refresh farms:', error);
      });

      return undefined;
    }, [dispatch, userId]),
  );

  // ==================================================
  // LOCATION
  // ==================================================

  const {
    location: currentLocation,
    loading: locationLoading,
  } = useLocation();

  const locationText = locationLoading
    ? 'Detecting location...'
    : currentLocation?.district &&
      currentLocation?.state
    ? `${currentLocation.district}, ${currentLocation.state}`
    : currentLocation?.city &&
      currentLocation?.state
    ? `${currentLocation.city}, ${currentLocation.state}`
    : currentLocation?.state
    ? currentLocation.state
    : t('home.location_unavailable');

  // ==================================================
  // QUICK ACTIONS
  // ==================================================

  const quickActions = [
    {
      title: t('home.qa_hire_labour'),
      image: require('../../assets/homescreen/labour.png'),
      onPress: () => navigation.navigate('LabourBooking'),
    },
    {
      title: t('home.qa_hire_machinery'),
      image: require('../../assets/homescreen/tractorr.png'),
      onPress: () => navigation.navigate('TractorBooking'),
    },
    {
      title: t('home.qa_agri_products'),
      image: require('../../assets/homescreen/Agrii.png'),
      onPress: () => navigation.navigate('AgriProducts'),
    },
    {
      title: t('home.qa_mandi_prices'),
      image: require('../../assets/homescreen/mand.png'),
      onPress: () => navigation.navigate('MandiHome'),
    },
    {
      title: t('home.qa_trade'),
      image: require('../../assets/homescreen/traders.png'),
      onPress: () => navigation.navigate(MARKET_ROUTES.HOME),
    },
    {
      title: t('home.qa_nursery'),
      image: require('../../assets/homescreen/nu.png'),
      onPress: () => navigation.navigate('NurseryHome'),
    },
    {
      title: t('home.qa_doctor'),
      image: require('../../assets/homescreen/duuu.png'),
      onPress: () => navigation.navigate('DoctorMain'),
    },
    {
      title: t('home.qa_community'),
      image: require('../../assets/homescreen/community.png'),
      onPress: () => navigation.navigate(COMMUNITY_ROUTES.HOME),
    },
    {
      title: t('home.qa_knowledge'),
      image: require('../../assets/homescreen/knowledge.png'),
      onPress: () => navigation.navigate('AgricultureNews'),
    },

    // Not built yet: each opens the Coming Soon screen for that feature
    {
      title: t('home.qa_warehouse'),
      image: require('../../assets/homescreen/warehousee.png'),
      onPress: () => navigation.navigate('ComingSoon', { feature: 'warehouse' }),
    },
    {
      title: t('home.qa_delivery'),
      image: require('../../assets/homescreen/Deliveryy.png'),
      onPress: () => navigation.navigate('ComingSoon', { feature: 'delivery' }),
    },
    {
      title: t('home.qa_disease'),
      image: require('../../assets/homescreen/dis.png'),
      onPress: () => navigation.navigate('ComingSoon', { feature: 'disease' }),
    },
    {
      title: t('home.qa_schemes'),
      image: require('../../assets/homescreen/govv.png'),
      onPress: () => navigation.navigate('ComingSoon', { feature: 'schemes' }),
    },
  ];

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleAddFarm = useCallback(() => {
    navigation.navigate('FarmMappingScreen');
  }, [navigation]);

  const handleFarmPress = useCallback(
    farm => {
      // Use the existing My Farms screen so this works
      // without assuming a separate FarmDetails route.
      navigation.navigate('MyFarms');
    },
    [navigation],
  );

  // ==================================================
  // UI
  // ==================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}

        <HomeHeader />

        {/* GREETING */}

        <Text style={styles.greeting}>
          {t(greeting)}, {userName}
        </Text>

        {/* LOCATION */}

        <View style={styles.locationRow}>
          <MapPin
            size={15}
            color={GREEN}
            strokeWidth={2.4}
          />

          <Text
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {locationText}
          </Text>
        </View>

        {/* WEATHER */}

        <WeatherCard />

        {/* VOICE ASSISTANT */}

        <VoiceAssistantCard
          onPress={() => setVoiceAssistantVisible(true)}
        />

        {/* AI ADVISORY */}

       

        {/* MY FARMS */}

        <SectionHeader
          title={t('home.my_farms')}
          onPress={() => navigation.navigate('MyFarms')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.farmsRow}>

          {/* Always show Add Farm first */}

          <AddFarmCard onPress={handleAddFarm} />

          {/* Farms fetched for the logged-in user */}

          {displayedFarms.map((farm, index) => (
            <FarmCard
              key={
                farm?._id ||
                farm?.id ||
                `farm-${index}`
              }
              farm={farm}
              onPress={() => handleFarmPress(farm)}
            />
          ))}

        </ScrollView>

        {displayedFarms.length === 0 && (
          <Text style={styles.noFarmsText}>
            {t('home.no_farms')}
          </Text>
        )}

        {/* QUICK ACTIONS */}

        <Text style={styles.quickTitle}>
          {t('home.quick_actions')}
        </Text>

        <View style={styles.quickGrid}>
          {quickActions.map(item => (
            <QuickAction
              key={item.image}
              image={item.image}
              title={item.title}
              onPress={item.onPress}
            />
          ))}
        </View>
         <AIAdvisoryCard />

        {/* TODAY'S UPDATES */}

        <SectionHeader title={t('home.todays_updates')} />

        <UpdateCard
          Icon={CloudSun}
          title={t('home.weather_alert')}
          text={t('home.weather_alert_text')}
          color="#2563EB"
          bg="#EFF6FF"
          border="#BFDBFE"
        />

        {/*
        <UpdateCard
          Icon={Landmark}
          title="GOVERNMENT SCHEME"
          text="PM Kisan 16th installment released. Check your payment status."
          color="#F97316"
          bg="#FFF7ED"
          border="#FED7AA"
        />
        */}

        <UpdateCard
          Icon={Users}
          title={t('home.community_update')}
          text={t('home.community_update_text')}
          color="#9333EA"
          bg="#FAF5FF"
          border="#E9D5FF"
        />

      </ScrollView>

      {/* BOTTOM TAB */}

      <BottomTabBar
        navigation={navigation}
        active="Home"
      />

      <VoiceAssistantModal
        visible={voiceAssistantVisible}
        onClose={handleVoiceClose}
        onNavigate={handleVoiceNavigation}
      />
    </SafeAreaView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: width * 0.055,
    paddingTop: 6,
    paddingBottom: 130,
  },

  greeting: {
    marginTop: 14,
    fontSize: rf(24),
    lineHeight: rf(30),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.45,
  },

  locationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  locationText: {
    flex: 1,
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '800',
  },

  farmsRow: {
    paddingRight: 24,
    paddingVertical: 8,
    gap: 16,
  },

  noFarmsText: {
    marginTop: 5,
    marginBottom: 4,
    color: MUTED,
    fontSize: rf(12),
    fontWeight: '600',
  },

  quickTitle: {
    marginTop: 36,
    marginBottom: 20,
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    marginBottom: 18,
  },
});