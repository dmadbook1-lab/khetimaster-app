import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ShoppingCart, Zap } from 'lucide-react-native';
const { width } = Dimensions.get('window');
export default function ProductDetailsScreen({ navigation }) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity activeOpacity={0.9} style={styles.cartBtn}>
        <ShoppingCart size={18} color="#16883E" />
        <Text style={styles.cartText}>Add to Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.buyBtn}
        onPress={() => navigation.navigate('Checkout')}
      >
        <Zap size={18} color="#FFFFFF" />
        <Text style={styles.buyText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    paddingHorizontal: width * 0.055,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 12,
  },
  cartBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#16883E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cartText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#16883E',
  },
  buyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
