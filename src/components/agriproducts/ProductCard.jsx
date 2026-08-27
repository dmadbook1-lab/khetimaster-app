import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Heart, ShoppingCart, Star } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function ProductCard({ product, compact = false, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, compact && styles.compactCard]}
    >
      {!!product.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>
      )}

      <TouchableOpacity activeOpacity={0.8} style={styles.heartBtn}>
        <Heart size={17} color="#64748B" strokeWidth={2.3} />
      </TouchableOpacity>

      <Image
        source={product.image}
        style={[styles.image, compact && styles.compactImage]}
        resizeMode="contain"
      />

      <Text style={styles.brand}>{product.brand}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>

      <View style={styles.ratingRow}>
        <Star size={12} color="#F97316" fill="#F97316" />
        <Text style={styles.rating}>{product.rating}</Text>
        <Text style={styles.reviews}>({product.reviews})</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{product.price}</Text>
        {!!product.discount && (
          <Text style={styles.discount}>{product.discount}</Text>
        )}
      </View>

      {!!product.oldPrice && (
        <Text style={styles.oldPrice}>{product.oldPrice}</Text>
      )}

      {!compact && (
        <TouchableOpacity activeOpacity={0.9} style={styles.cartBtn}>
          <ShoppingCart size={14} color={GREEN} strokeWidth={2.5} />
          <Text style={styles.cartText}>Add to Cart</Text>
        </TouchableOpacity>
      )}

      {compact && (
        <TouchableOpacity activeOpacity={0.9} style={styles.compactCartBtn}>
          <Text style={styles.compactCartText}>Add to Cart</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    width: (width - width * 0.074 - 16) / 2,
    minHeight: 286,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  compactCard: {
    width: width * 0.36,
    minHeight: 242,
  },
  badge: {
    position: 'absolute',
    left: 12,
    top: 12,
    height: 20,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: GREEN,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: rf(8),
    fontWeight: '900',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 112,
    marginTop: 18,
  },
  compactImage: {
    height: 106,
  },
  brand: {
    marginTop: 10,
    fontSize: rf(9),
    fontWeight: '900',
    color: '#CBD5E1',
  },
  name: {
    marginTop: 2,
    fontSize: rf(14),
    lineHeight: rf(17),
    fontWeight: '900',
    color: '#111827',
  },
  ratingRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#111827',
  },
  reviews: {
    fontSize: rf(10),
    fontWeight: '700',
    color: '#94A3B8',
  },
  priceRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#111827',
  },
  discount: {
    fontSize: rf(10),
    fontWeight: '900',
    color: GREEN,
  },
  oldPrice: {
    marginTop: 4,
    fontSize: rf(11),
    color: '#CBD5E1',
    fontWeight: '800',
    textDecorationLine: 'line-through',
  },
  cartBtn: {
    marginTop: 14,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cartText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },
  compactCartBtn: {
    marginTop: 12,
    height: 34,
    borderRadius: 11,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCartText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
