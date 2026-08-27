import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Star } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const products = [
  {
    name: 'IFFCO Urea',
    brand: 'IFFCO',
    price: '380',
    old: '420',
    rating: '4.7',
    image: require('../../assets/bazar/product2.jpg'),
  },
  {
    name: 'NPK 19-19-19',
    brand: 'IFFCO',
    price: '450',
    old: '560',
    rating: '4.9',
    image: require('../../assets/bazar/product3.jpg'),
  },
];
export default function SimilarProducts() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Similar Products</Text>

      <View style={styles.row}>
        {products.map((item, index) => (
          <View key={index} style={styles.card}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />

            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.brand}>{item.brand}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.old}>{item.old}</Text>
            </View>

            <View style={styles.ratingPill}>
              <Star size={10} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 36,
    paddingTop: 22,
    borderTopWidth: 8,
    borderTopColor: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  row: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - width * 0.074 - 12) / 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    padding: 12,
  },
  image: {
    width: '100%',
    height: 122,
    borderRadius: 8,
  },
  name: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  brand: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16A34A',
  },
  old: {
    fontSize: 11,
    color: '#CBD5E1',
    textDecorationLine: 'line-through',
  },
  ratingPill: {
    marginTop: 10,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    backgroundColor: '#FFFBEB',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  rating: {
    fontSize: 9,
    fontWeight: '900',
    color: '#92400E',
  },
});
