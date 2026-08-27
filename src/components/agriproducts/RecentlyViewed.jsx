import React from 'react';
import {View, Text, ScrollView, Image, StyleSheet, Dimensions} from 'react-native';
import {Star} from 'lucide-react-native';

import {recentlyViewed} from './product';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function RecentlyViewed() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.title}>Recently Viewed</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {recentlyViewed.map(item => (
          <View key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />

            <Text numberOfLines={2} style={styles.name}>
              {item.name}
            </Text>

            <View style={styles.bottomRow}>
              <Text style={styles.price}>{item.price}</Text>

              <View style={styles.ratingRow}>
                <Star size={11} color="#F97316" fill="#F97316" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 38,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#111827',
  },

  seeAll: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#16883E',
  },

  row: {
    marginTop: 18,
    gap: 14,
    paddingRight: 20,
  },

  card: {
    width: width * 0.31,
    height: 132,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  image: {
    width: '100%',
    height: 60,
  },

  name: {
    marginTop: 7,
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '900',
    color: '#111827',
  },

  bottomRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  price: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#16883E',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  rating: {
    fontSize: rf(9),
    fontWeight: '800',
    color: '#64748B',
  },
});