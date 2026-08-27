import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ChevronRight, Star} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const CARD_WIDTH = width * 0.34;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const products = [
  {
    title: 'Pioneer Soybean Seed',
    price: '980',
    unit: '/ Kg',
    rating: '4.6',
    reviews: '(128)',
    image: require('../../assets/bazar/product1.jpg'),
  },
  {
    title: 'IFFCO NPK 19:19:19',
    price: '1250',
    unit: '/ 50 Kg',
    rating: '4.7',
    reviews: '(96)',
    image: require('../../assets/bazar/product2.jpg'),
  },
  {
    title: 'Biovita Neem Oil',
    price: '450',
    unit: '/ 1L',
    rating: '4.5',
    reviews: '(74)',
    image: require('../../assets/bazar/product3.jpg'),
  },
];

export default function FeaturedProducts() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Featured Products</Text>

        <View style={styles.viewRow}>
          <Text style={styles.viewAll}>View All</Text>
          <ChevronRight size={16} color="#16883E" strokeWidth={2.6} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {products.map((item, index) => (
          <TouchableOpacity key={index} activeOpacity={0.9} style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />

            <Text numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{item.price}</Text>
              <Text style={styles.unit}> {item.unit}</Text>
            </View>

            <View style={styles.ratingRow}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviews}>{item.reviews}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 28,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: rf(20),
    color: '#111827',
    fontWeight: '900',
    letterSpacing: -0.35,
  },

  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAll: {
    fontSize: rf(12),
    color: '#16883E',
    fontWeight: '900',
  },

  row: {
    marginTop: 18,
    gap: 14,
    paddingRight: 24,
  },

  card: {
    width: CARD_WIDTH,
    height: 166,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 2,
  },

  image: {
    width: '100%',
    height: 72,
  },

  title: {
    marginTop: 8,
    fontSize: rf(11),
    lineHeight: rf(14),
    color: '#111827',
    fontWeight: '900',
  },

  priceRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  price: {
    fontSize: rf(14),
    color: '#111827',
    fontWeight: '900',
  },

  unit: {
    fontSize: rf(9),
    color: '#64748B',
    fontWeight: '700',
  },

  ratingRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  rating: {
    fontSize: rf(10),
    color: '#111827',
    fontWeight: '800',
  },

  reviews: {
    fontSize: rf(9),
    color: '#94A3B8',
    fontWeight: '700',
  },
});