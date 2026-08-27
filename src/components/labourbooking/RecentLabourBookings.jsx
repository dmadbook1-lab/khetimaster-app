import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function RecentLabourBookings({
  bookings,
  onSeeAllPress,
  onPress,
}) {
  return (
    <View
      style={{
        marginTop: 20,
      }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Bookings</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>See All ›</Text>
        </TouchableOpacity>
      </View>

      {bookings.map(booking => (
        <TouchableOpacity
          key={booking.id}
          activeOpacity={0.88}
          onPress={() => onPress(booking)}
          style={styles.card}
        >
          <Image source={booking.image} style={styles.image} />

          <View style={styles.content}>
            <Text style={styles.name}>{booking.name}</Text>
            <Text style={styles.activity}>
              {booking.activity} · {booking.date}
            </Text>
          </View>

          <Text style={styles.price}>{booking.price}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#172033',
  },
  seeAll: {
    fontSize: rf(10),
    fontWeight: '800',
    color: '#16A34A',
  },
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  content: {
    flex: 1,
    marginLeft: 11,
  },
  name: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#172033',
  },
  activity: {
    marginTop: 3,
    fontSize: rf(9),
    color: '#7C8596',
    fontWeight: '500',
  },
  price: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#16A34A',
  },
});
