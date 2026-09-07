import React, { useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import TractorBookingHeader from '../../components/tractorbooking/TractorBookingHeader';
import BookingLocationBar from '../../components/tractorbooking/BookingLocationBar';
import MachineryHeroBanner from '../../components/tractorbooking/MachineryHeroBanner';
import OwnerRegistrationBanner from '../../components/tractorbooking/OwnerRegistrationBanner';
import MachineryBookingActions from '../../components/tractorbooking/MachineryBookingActions';
import MachineryCategories from '../../components/tractorbooking/MachineryCategories';
import AvailableMachinery from '../../components/tractorbooking/AvailableMachinery';

import { getAllMachinery } from '../../redux/slices/machinerySlice';
import { MACHINERY_CATEGORIES } from '../../components/tractorbooking/machineryData';

const { width } = Dimensions.get('window');
const GREEN = '#16883E';

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function TractorBookingScreen({ navigation }) {
  const dispatch = useDispatch();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Pull live records from state
  const { machinery: storeMachines, isLoadingAll } = useSelector(
    state => state.machinery || {},
  );

  const machinesList = Array.isArray(storeMachines) ? storeMachines : [];

  const loadAllMachineryList = useCallback(() => {
    dispatch(getAllMachinery({ availability: 'available' }));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadAllMachineryList();
    }, [loadAllMachineryList]),
  );

  // Dynamic filter computing local array
  const filteredMachines = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return machinesList.filter(item => {
      const isCategoryMatch =
        activeCategory === 'all' ||
        String(item.category).toLowerCase() === activeCategory.toLowerCase();
      
      const isSearchMatch =
        !query ||
        String(item.name).toLowerCase().includes(query) ||
        String(item.ownerName).toLowerCase().includes(query) ||
        String(item.brand).toLowerCase().includes(query);

      return isCategoryMatch && isSearchMatch;
    });
  }, [activeCategory, searchText, machinesList]);

  const handleFavouritePress = machine => {
    Alert.alert('Favourites', 'Added to your favorites list.');
  };

  const handleMachinePress = machine => {
    navigation.navigate('MachineryDetails', {
      machineryId: machine._id || machine.id,
      machine,
    });
  };

  const handleBookPress = machine => {
    navigation.navigate('MachineryBooking', { machine });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <TractorBookingHeader
          navigation={navigation}
          onNotificationPress={() =>
            Alert.alert('Notifications', 'You have no new notifications.')
          }
        />

        <BookingLocationBar
          onChangePress={() =>
            Alert.alert('Location', 'Location modification screen opening.')
          }
        />

        <MachineryHeroBanner
          onBookPress={() => {
            if (machinesList.length > 0) {
              navigation.navigate('MachineryBooking', {
                machine: machinesList[0],
              });
            } else {
              Alert.alert('Directory empty', 'No machinery available right now.');
            }
          }}
        />

        <OwnerRegistrationBanner
          onRegisterPress={() => navigation.navigate('ProvideServiceStep1')}
          onFreeBadgePress={() =>
            Alert.alert('Free Registration', 'Register your machinery with zero setup fees.')
          }
        />

        {/* Dynamic Booking & Request Navigation Actions */}
        <MachineryBookingActions navigation={navigation} />

        <MachineryCategories
          categories={MACHINERY_CATEGORIES}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          onSeeAllPress={() => setActiveCategory('all')}
        />

        {isLoadingAll && machinesList.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.loaderText}>Finding available machines...</Text>
          </View>
        ) : (
          <AvailableMachinery
            machines={filteredMachines}
            onSeeAllPress={() => Alert.alert('Directory', 'Showing nearby directory.')}
            onMachinePress={handleMachinePress}
            onBookPress={handleBookPress}
            onFavouritePress={handleFavouritePress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingTop: 2,
    paddingBottom: 36,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: rf(11),
    marginTop: 10,
  },
});