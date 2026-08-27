import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Star, Minus, Plus, Zap } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function ProductInfoSection({ product }) {
  const [selectedPack, setSelectedPack] = useState('50 kg');
  const [qty, setQty] = useState(1);
  return (
    <View style={styles.wrapper}>
      <View style={styles.brandRow}>
        <Text style={styles.brandTag}>IFFCO</Text>
        <Text style={styles.category}>Fertilizer</Text>
      </View>

      <Text style={styles.title}>
        {product?.name || 'IFFCO DAP Fertilizer'}
      </Text>

      <View style={styles.ratingRow}>
        <View style={styles.ratingPill}>
          <Star size={13} color="#F97316" fill="#F97316" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>

        <Text style={styles.meta}>1,240 Reviews</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>5,200+ Sold</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>₹ 1,350</Text>
        <Text style={styles.oldPrice}>1,499</Text>
      </View>

      <Text style={styles.save}>You save ₹149 on this order!</Text>

      <Text style={styles.label}>Pack Size</Text>

      <View style={styles.packRow}>
        {['5 kg', '50 kg', '100 kg'].map(size => {
          const active = selectedPack === size;
          return (
            <TouchableOpacity
              key={size}
              activeOpacity={0.8}
              onPress={() => setSelectedPack(size)}
              style={[styles.packChip, active && styles.activePack]}
            >
              <Text style={[styles.packText, active && styles.activePackText]}>
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.qtyRow}>
        <View style={styles.qtyBox}>
          <TouchableOpacity
            onPress={() => setQty(Math.max(1, qty - 1))}
            style={styles.qtyBtn}
          >
            <Minus size={16} color="#64748B" />
          </TouchableOpacity>

          <Text style={styles.qty}>{qty}</Text>

          <TouchableOpacity
            onPress={() => setQty(qty + 1)}
            style={styles.qtyBtn}
          >
            <Plus size={16} color={GREEN} />
          </TouchableOpacity>
        </View>

        <View style={styles.deliveryPill}>
          <Zap size={12} color="#F97316" />
          <Text style={styles.deliveryText}>Delivery by Tomorrow</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#DCFCE7',
    color: GREEN,
    fontSize: rf(9),
    fontWeight: '900',
  },
  category: {
    fontSize: rf(11),
    fontWeight: '700',
    color: '#CBD5E1',
  },
  title: {
    marginTop: 8,
    fontSize: rf(20),
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.45,
  },
  ratingRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingPill: {
    height: 24,
    borderRadius: 7,
    paddingHorizontal: 8,
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#92400E',
  },
  meta: {
    marginLeft: 8,
    fontSize: rf(12),
    fontWeight: '700',
    color: '#64748B',
  },
  dot: {
    marginLeft: 8,
    color: '#CBD5E1',
  },
  priceRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: rf(28),
    lineHeight: rf(32),
    fontWeight: '900',
    color: GREEN,
  },
  oldPrice: {
    marginLeft: 12,
    fontSize: rf(18),
    fontWeight: '800',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  save: {
    marginTop: 4,
    fontSize: rf(12),
    fontWeight: '800',
    color: '#EF4444',
  },
  label: {
    marginTop: 22,
    fontSize: rf(13),
    fontWeight: '900',
    color: '#111827',
  },
  packRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  packChip: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePack: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  packText: {
    fontSize: rf(11),
    fontWeight: '800',
    color: '#64748B',
  },
  activePackText: {
    color: '#FFFFFF',
  },
  qtyRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyBox: {
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: rf(14),
    fontWeight: '900',
    color: '#111827',
  },
  deliveryPill: {
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: '#FFF7ED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deliveryText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#F97316',
  },
});
