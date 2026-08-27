import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const productImage = require('../../assets/bazar/product1.jpg');

const gallery = [
  productImage,
  require('../../assets/bazar/product2.jpg'),
  require('../../assets/bazar/product3.jpg'),
  require('../../assets/bazar/agri.png'),
];

export default function ProductImageGallery({product}) {
  const [activeImage, setActiveImage] = useState(product?.image || productImage);

  return (
    <>
      <View style={styles.mainCard}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>10% OFF</Text>
        </View>

        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>● In Stock</Text>
        </View>

        <Image source={activeImage} style={styles.mainImage} resizeMode="contain" />

        <View style={styles.dots}>
          <View style={styles.activeDot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.thumbnailRow}>
        {gallery.map((img, index) => {
          const active = activeImage === img;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => setActiveImage(img)}
              style={[styles.thumbBox, active && styles.activeThumb]}>
              <Image source={img} style={styles.thumbImage} resizeMode="cover" />
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    marginTop: 10,
    height: 292,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  mainImage: {
    width: '78%',
    height: '78%',
  },

  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    height: 24,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    zIndex: 5,
  },

  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  stockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    zIndex: 5,
  },

  stockText: {
    color: '#16883E',
    fontSize: 10,
    fontWeight: '900',
  },

  dots: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 5,
  },

  activeDot: {
    width: 22,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  thumbnailRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },

  thumbBox: {
    width: 62,
    height: 62,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  activeThumb: {
    borderWidth: 2,
    borderColor: '#16883E',
  },

  thumbImage: {
    width: '100%',
    height: '100%',
  },
});