import React, { useState } from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../../common/BottomTabBar';
import AgriHeader from '../../components/agriproducts/AgriHeader';
import AgriSearchBar from '../../components/agriproducts/AgriSearchBar';
import AgriHeroBanner from '../../components/agriproducts/AgriHeroBanner';
import AgriCategoryTabs from '../../components/agriproducts/AgriCategoryTabs';
import RecommendedProducts from '../../components/agriproducts/RecommendedProducts';
import ProductGrid from '../../components/agriproducts/ProductGrid';
import SaleBanner from '../../components/agriproducts/SaleBanner';
import RecentlyViewed from '../../components/agriproducts/RecentlyViewed';
import { categoryTabs } from '../../components/agriproducts/product';
const { width } = Dimensions.get('window');
export default function AgriProductsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('fertilizers');
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AgriHeader navigation={navigation} />

        <AgriSearchBar />

        <AgriHeroBanner />

        <AgriCategoryTabs
          tabs={categoryTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <RecommendedProducts navigation={navigation} />

        <ProductGrid navigation={navigation} />

        <SaleBanner />

        <ProductGrid navigation={navigation} startIndex={4} hideHeader />

        <RecentlyViewed />
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
    paddingHorizontal: width * 0.037,
    paddingTop: 6,
    paddingBottom: 130,
  },
});
