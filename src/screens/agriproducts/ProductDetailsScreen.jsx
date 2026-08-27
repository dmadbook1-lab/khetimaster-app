import React from 'react';
import {ScrollView, StyleSheet, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import ProductDetailsHeader from '../../components/productdetails/ProductDetailsHeader';
import ProductImageGallery from '../../components/productdetails/ProductImageGallery';
import ProductInfoSection from '../../components/productdetails/ProductInfoSection';
import AIRecommendedCard from '../../components/productdetails/AIRecommendedCard';
import ProductBenefits from '../../components/productdetails/ProductBenefits';
import ApplicationGuide from '../../components/productdetails/ApplicationGuide';
import CustomerReviews from '../../components/productdetails/CustomerReviews';
import SimilarProducts from '../../components/productdetails/SimilarProducts';
import ProductBottomBar from '../../components/productdetails/ProductBottomBar';

const {width} = Dimensions.get('window');

export default function ProductDetailsScreen({navigation, route}) {
  const product = route?.params?.product;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ProductDetailsHeader navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <ProductImageGallery product={product} />

        <ProductInfoSection product={product} />

        <AIRecommendedCard />

        <ProductBenefits />

        <ApplicationGuide />

        <CustomerReviews />

        <SimilarProducts />
      </ScrollView>

            <ProductBottomBar navigation={navigation} />
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
    paddingBottom: 104,
  },
});