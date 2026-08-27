import React from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {SlidersHorizontal} from 'lucide-react-native';

import ProductCard from './ProductCard';
import {allProducts} from './product';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function ProductGrid({navigation, startIndex = 0, hideHeader = false}) {
  const products = hideHeader ? allProducts.slice(startIndex) : allProducts.slice(0, 4);

  return (
    <View style={styles.wrapper}>
      {!hideHeader && (
        <View style={styles.sectionRow}>
          <Text style={styles.title}>All Products</Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.sortBtn}>
            <SlidersHorizontal size={14} color="#64748B" strokeWidth={2.4} />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.grid}>
        {products.map(item => (
          <ProductCard
            key={item.id}
            product={item}
            onPress={() => navigation.navigate('ProductDetails', {product: item})}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 34,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.35,
  },

  sortBtn: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  sortText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#64748B',
  },

  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
});