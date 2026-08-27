import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  MapPin,
  CloudSun,
  Landmark,
  Users,
} from 'lucide-react-native';

import {useSelector} from 'react-redux';

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
import MoreServicesSection from '../../components/home/MoreServicesSection';

import {selectUser} from '../../redux/slices/authSlice';

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

export default function HomeScreen({navigation}) {
  const user = useSelector(selectUser);

  const userName =
    user?.fullName ||
    user?.name ||
    'User';

  const userDistrict =
    user?.district || '';

  const userState =
    user?.state || '';

  const location =
    userDistrict && userState
      ? `${userDistrict}, ${userState}`
      : userDistrict ||
        userState ||
        'Location unavailable';

  const quickActions = [
    {
      title: 'Hire Labour',
      image: require('../../assets/homescreen/labourr.png'),
      borderColor: '#A7F3D0',
      textColor: '#15803D',
      onPress: () =>
        navigation.navigate('LabourBooking'),
    },

    {
      title: ' Hire Tractor /\nMachinery',
      image: require('../../assets/homescreen/tractorr.png'),
      borderColor: '#BFDBFE',
      textColor: '#2563EB',
      onPress: () =>
        navigation.navigate('TractorBooking'),
    },

    {
      title: 'Marketplace',
      image: require('../../assets/homescreen/marketplacee.png'),
      borderColor: '#FED7AA',
      textColor: '#EA580C',
      onPress: () =>
        navigation.navigate('AgriProducts'),
    },

    {
      title: 'Mandi\nPrices',
      image: require('../../assets/homescreen/mandii.png'),
      borderColor: '#E9D5FF',
      textColor: '#9333EA',
      onPress: () =>
        navigation.navigate('MandiHome'),
    },

    {
      title: 'Loans /\nSupport',
      image: require('../../assets/homescreen/loan.png'),
      borderColor: '#FBCFE8',
      textColor: '#DB2777',
      onPress: () => {},
    },

    {
      title: 'Warehouse',
      image: require('../../assets/homescreen/warehouse.png'),
      borderColor: '#A7F3D0',
      textColor: '#059669',
      onPress: () => {},
    },

    {
      title: 'Nursery',
      image: require('../../assets/homescreen/nursery.png'),
      borderColor: '#BBF7D0',
      textColor: '#15803D',
      onPress: () => {},
    },

    {
      title: 'Shipping /\nDelivery',
      image: require('../../assets/homescreen/delivery.png'),
      borderColor: '#FED7AA',
      textColor: '#EA580C',
      onPress: () => {},
    },

    {
      title: 'Doctor/vet',
      image: require('../../assets/homescreen/doctor.png'),
      borderColor: '#BFDBFE',
      textColor: '#2563EB',
      onPress: () => {},
    },

    {
      title: 'AI Disease\nDetection',
      image: require('../../assets/homescreen/diseasee.png'),
      borderColor: '#BBF7D0',
      textColor: '#166534',
      onPress: () =>
        navigation.navigate('DiseaseDetection'),
    },

    {
      title: 'Govt.\nSchemes',
      image: require('../../assets/homescreen/govschemee.png'),
      borderColor: '#FECACA',
      textColor: '#DC2626',
      onPress: () =>
        navigation.navigate('GovernmentSchemes'),
    },

    {
      title: 'Knowledge\nCenter',
      image: require('../../assets/homescreen/knowledge.png'),
      borderColor: '#C7D2FE',
      textColor: '#4338CA',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <HomeHeader />

        <Text style={styles.greeting}>
          Good Morning, {userName}
        </Text>

        <View style={styles.locationRow}>
          <MapPin
            size={15}
            color={GREEN}
            strokeWidth={2.4}
          />

          <Text style={styles.locationText}>
            {location}
          </Text>
        </View>

        <WeatherCard />

        <VoiceAssistantCard />

        <SectionHeader
          title="My Farms"
          onPress={() =>
            navigation.navigate('MyFarms')
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.farmsRow}>

          <AddFarmCard
            onPress={() =>
              navigation.navigate('FarmMappingScreen')
            }
          />

          <FarmCard
            image={require('../../assets/homescreen/farm1.jpg')}
            title="Shinde Farm"
            crop="Cotton"
            area="5.10 Acres"
            status="Needs Attention"
            statusColor="#F97316"
            statusBg="#FFF7ED"
          />

          <FarmCard
            image={require('../../assets/homescreen/farm2.jpg')}
            title="Patil Farm"
            crop="Soybean"
            area="2.34 Acres"
            status="Healthy"
            statusColor="#16A34A"
            statusBg="#ECFDF5"
          />

        </ScrollView>

        <Text style={styles.quickTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickGrid}>
          {quickActions.map(item => (
            <QuickAction
              key={item.title}
              image={item.image}
              title={item.title}
              imageStyle={item.imageStyle}
              onPress={item.onPress}
            />
          ))}
        </View>

        <AIAdvisoryCard />

        <MoreServicesSection
          navigation={navigation}
        />

        <SectionHeader
          title="Today's Updates"
        />

        <UpdateCard
          Icon={CloudSun}
          title="WEATHER ALERT"
          text="Light to moderate rain expected tomorrow."
          color="#2563EB"
          bg="#EFF6FF"
          border="#BFDBFE"
        />

        <UpdateCard
          Icon={Landmark}
          title="GOVERNMENT SCHEME"
          text="PM Kisan 16th installment released. Check your payment status."
          color="#F97316"
          bg="#FFF7ED"
          border="#FED7AA"
        />

        <UpdateCard
          Icon={Users}
          title="COMMUNITY UPDATE"
          text="Join the discussion on organic farming practices."
          color="#9333EA"
          bg="#FAF5FF"
          border="#E9D5FF"
        />

      </ScrollView>

      <BottomTabBar
        navigation={navigation}
        active="Home"
      />

    </SafeAreaView>
  );
}

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
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '800',
  },

  farmsRow: {
    paddingRight: 24,
    gap: 16,
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