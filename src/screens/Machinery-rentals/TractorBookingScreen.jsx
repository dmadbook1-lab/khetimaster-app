import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TractorBookingHeader from '../../components/tractorbooking/TractorBookingHeader';
import BookingLocationBar from '../../components/tractorbooking/BookingLocationBar';
import MachineryHeroBanner from '../../components/tractorbooking/MachineryHeroBanner';
import OwnerRegistrationBanner from '../../components/tractorbooking/OwnerRegistrationBanner';
import MachinerySearchBar from '../../components/tractorbooking/MachinerySearchBar';
import MachineryCategories from '../../components/tractorbooking/MachineryCategories';
import MachineryRecommendation from '../../components/tractorbooking/MachineryRecommendation';
import AvailableMachinery from '../../components/tractorbooking/AvailableMachinery';
import RecentBookings from '../../components/tractorbooking/RecentBookings';
import {
  MACHINERY_CATEGORIES,
  AVAILABLE_MACHINERY,
  RECENT_BOOKINGS,
} from '../../components/tractorbooking/machineryData';
const { width } = Dimensions.get('window');
export default function TractorBookingScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('tractor');
  const [searchText, setSearchText] = useState('');
  const [machines, setMachines] = useState(AVAILABLE_MACHINERY);
  const filteredMachines = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return machines.filter(machine => {
      const categoryMatched =
        activeCategory === 'all' || machine.category === activeCategory;
      const searchMatched =
        !search ||
        machine.name.toLowerCase().includes(search) ||
        machine.owner.toLowerCase().includes(search);
      return categoryMatched && searchMatched;
    });
  }, [activeCategory, searchText, machines]);
  const handleFavouritePress = machine => {
    setMachines(currentMachines =>
      currentMachines.map(item =>
        item.id === machine.id
          ? {
              ...item,
              favourite: !item.favourite,
            }
          : item,
      ),
    );
  };
  const handleMachinePress = machine => {
    navigation.navigate('MachineryDetails', {
      machine,
    });
  };
  const handleBookPress = machine => {
    navigation.navigate('MachineryBooking', {
      machine,
    });
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
            Alert.alert(
              'Notifications',
              'You have no new machinery notifications.',
            )
          }
        />

        <BookingLocationBar
          onChangePress={() =>
            Alert.alert(
              'Change Location',
              'Location selection can be opened here.',
            )
          }
        />

        <MachineryHeroBanner
          onBookPress={() => {
            const recommendedMachine = machines[0];
            navigation.navigate('MachineryBooking', {
              machine: recommendedMachine,
            });
          }}
        />

        <OwnerRegistrationBanner
          onRegisterPress={() => navigation.navigate('ProvideServiceStep1')}
          onFreeBadgePress={() =>
            Alert.alert('Free Registration', 'मोफत नोंदणी - कोणताही खर्च नाही')
          }
        />

        <MachinerySearchBar
          value={searchText}
          onChangeText={setSearchText}
          onMicPress={() =>
            Alert.alert(
              'Voice Search',
              'Voice-based machinery search can be connected here.',
            )
          }
          onFilterPress={() =>
            Alert.alert(
              'Filters',
              'Price, distance, horsepower and availability filters can be opened here.',
            )
          }
        />

        <MachineryCategories
          categories={MACHINERY_CATEGORIES}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          onSeeAllPress={() =>
            Alert.alert(
              'Categories',
              'All machinery categories can be displayed here.',
            )
          }
        />

        <MachineryRecommendation
          onViewPress={() =>
            navigation.navigate('MachineryDetails', {
              machine: machines[0],
              recommended: true,
            })
          }
        />

        <AvailableMachinery
          machines={filteredMachines}
          onSeeAllPress={() =>
            Alert.alert(
              'Available Machinery',
              'All nearby machinery can be displayed here.',
            )
          }
          onMachinePress={handleMachinePress}
          onBookPress={handleBookPress}
          onFavouritePress={handleFavouritePress}
        />

        <RecentBookings
          bookings={RECENT_BOOKINGS}
          onSeeAllPress={() =>
            Alert.alert(
              'Recent Bookings',
              'Complete booking history can be displayed here.',
            )
          }
          onPress={booking =>
            Alert.alert(
              booking.name,
              `${booking.name} was recently booked at ${booking.price}.`,
            )
          }
        />
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
});
