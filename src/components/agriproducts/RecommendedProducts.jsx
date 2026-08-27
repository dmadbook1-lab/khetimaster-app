import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Leaf } from 'lucide-react-native';
import ProductCard from './ProductCard';
import { recommendedProducts } from './product';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function RecommendedProducts({ navigation }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <Leaf size={18} color="#FFFFFF" fill="#FFFFFF" />
          </View>

          <View>
            <Text style={styles.title}>Recommended For Your Crop</Text>
            <Text style={styles.subtitle}>AI picks for Soybean farmers</Text>
          </View>
        </View>

        <Text style={styles.seeAll}>See All</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {recommendedProducts.map(item => (
          <ProductCard
            key={item.id}
            product={item}
            compact
            onPress={() =>
              navigation.navigate('ProductDetails', {
                product: item,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 22,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 3,
    fontSize: rf(11),
    fontWeight: '700',
    color: '#94A3B8',
  },
  seeAll: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  row: {
    marginTop: 16,
    gap: 14,
    paddingRight: 20,
  },
});
