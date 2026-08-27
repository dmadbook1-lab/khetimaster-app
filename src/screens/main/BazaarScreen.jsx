import React from 'react';
import {ScrollView, StyleSheet, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import BottomTabBar from '../../common/BottomTabBar';

import BazaarHeader from '../../components/bazaar/BazaarHeader';
import BazaarHero from '../../components/bazaar/BazaarHero';
import ServicesGrid from '../../components/bazaar/ServicesGrid';
import BazaarStats from '../../components/bazaar/BazaarStats';
import FeaturedProducts from '../../components/bazaar/FeaturedProducts';
import BazaarRecentActivity from '../../components/bazaar/BazaarRecentActivity';

const {width} = Dimensions.get('window');

export default function BazaarScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <BazaarHeader />
        <BazaarHero />

        <ServicesGrid navigation={navigation} />

        <BazaarStats />
        <FeaturedProducts />
        <BazaarRecentActivity />
      </ScrollView>

      <BottomTabBar navigation={navigation} active="Bazaar" />
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
});