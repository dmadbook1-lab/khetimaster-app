import React, { useState } from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../../common/BottomTabBar';
import SatelliteHeader from '../../components/satellite/SatelliteHeader';
import SatelliteMapCard from '../../components/satellite/SatelliteMapCard';
import SatelliteIndexTabs from '../../components/satellite/SatelliteIndexTabs';
import CropHealthPanel from '../../components/satellite/CropHealthPanel';
import FarmInsightsGrid from '../../components/satellite/FarmInsightsGrid';
import ChangeDetectionCard from '../../components/satellite/ChangeDetectionCard';
import HistoricalViewCard from '../../components/satellite/HistoricalViewCard';
import SatelliteQuickActions from '../../components/satellite/SatelliteQuickActions';
const { width } = Dimensions.get('window');
export default function SatelliteViewScreen({ navigation, route }) {
  const [activeIndex, setActiveIndex] = useState('NDVI');
  const farm = route?.params?.farm || {
    title: 'Patil Farm',
    crop: 'Soybean',
    area: '2.34 Acres',
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SatelliteHeader
          title={farm.title}
          onBack={() => navigation.goBack()}
        />

        <SatelliteMapCard farm={farm} />

        <SatelliteIndexTabs
          activeIndex={activeIndex}
          onChange={setActiveIndex}
        />

        <CropHealthPanel />

        <FarmInsightsGrid />

        <ChangeDetectionCard />

        <HistoricalViewCard />

        <SatelliteQuickActions />
      </ScrollView>

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
    paddingHorizontal: width * 0.037,
    paddingBottom: 132,
  },
});
