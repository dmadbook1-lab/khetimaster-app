import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function RecentBookings({ bookings, onSeeAllPress, onPress }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Bookings</Text>

        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {bookings.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => onPress?.(item)}
            style={styles.card}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.content}>
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.price}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 3,
  },
  header: {
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#121A2B',
  },
  seeAll: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
  row: {
    paddingRight: 18,
    gap: 12,
  },
  card: {
    width: width * 0.32,
    minHeight: 143,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECEE',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 96,
  },
  content: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  name: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#121A2B',
  },
  price: {
    marginTop: 4,
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },
});
