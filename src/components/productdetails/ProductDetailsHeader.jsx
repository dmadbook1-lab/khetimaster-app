import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ArrowLeft, Heart, Share2, ShoppingCart } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function ProductDetailsHeader({ navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <ArrowLeft size={22} color="#111827" strokeWidth={2.5} />
      </TouchableOpacity>

      <Text style={styles.title}>Product Details</Text>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <Heart size={20} color="#111827" strokeWidth={2.3} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <Share2 size={20} color="#111827" strokeWidth={2.3} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
          <ShoppingCart size={20} color="#111827" strokeWidth={2.3} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 58,
    paddingHorizontal: width * 0.037,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    marginLeft: 12,
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 1,
    top: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: rf(9),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
