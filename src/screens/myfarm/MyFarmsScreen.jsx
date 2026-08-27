import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import BottomTabBar from '../../common/BottomTabBar';
import MyFarmsHeader from '../../components/myfarms/MyFarmsHeader';
import FarmSearchBar from '../../components/myfarms/FarmSearchBar';
import FarmOverviewCard from '../../components/myfarms/FarmOverviewCard';
import FarmFilterChips from '../../components/myfarms/FarmFilterChips';
import FarmGridCard from '../../components/myfarms/FarmGridCard';
import AddFarmGridCard from '../../components/myfarms/AddFarmGridCard';
import { farms, filters } from '../../components/myfarms/data';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#98A2B3';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function MyFarmsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MyFarmsHeader />

        <FarmSearchBar />

        <FarmOverviewCard />

        <FarmFilterChips
          filters={filters}
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>All Farms</Text>
          <Text style={styles.countText}>6 registered</Text>
        </View>

        <View style={styles.grid}>
          {farms.map((farm, index) => (
            <FarmGridCard key={index} farm={farm} navigation={navigation} />
          ))}

          <AddFarmGridCard
            onPress={() => navigation.navigate('FarmMappingScreen')}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('FarmMappingScreen')}
        style={styles.floatingAdd}
      >
        <Plus size={30} color="#FFFFFF" strokeWidth={2.8} />
      </TouchableOpacity>

      <BottomTabBar navigation={navigation} active="MyFarms" />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: width * 0.055,
    paddingTop: 16,
    paddingBottom: 140,
  },
  sectionRow: {
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.35,
  },
  countText: {
    fontSize: rf(12),
    fontWeight: '800',
    color: MUTED,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  floatingAdd: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 12,
  },
});
