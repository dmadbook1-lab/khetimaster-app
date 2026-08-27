import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Heart,
  Star,
  MapPin,
  Clock3,
  BadgeCheck,
  CalendarDays,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#18B94D';
const DARK = '#121A2B';
const MUTED = '#7B8494';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function MachineryCard({
  machine,
  onPress,
  onBookPress,
  onFavouritePress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress?.(machine)}
      style={styles.card}
    >
      <ImageBackground
        source={machine.image}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
      >
        {machine.available && (
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Available Today</Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFavouritePress?.(machine)}
          style={styles.heartButton}
        >
          <Heart
            size={rf(21)}
            color={machine.favourite ? '#F97316' : '#94A3B8'}
            fill={machine.favourite ? '#FFF7ED' : '#FFFFFF'}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.name}>
            {machine.name}
          </Text>

          <View style={styles.hpBadge}>
            <Text style={styles.hpText}>{machine.horsepower}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Star size={rf(13)} color="#FACC15" fill="#FACC15" />

          <Text style={styles.rating}>{machine.rating}</Text>

          <Text style={styles.reviews}>({machine.reviews})</Text>

          <MapPin size={rf(13)} color="#94A3B8" strokeWidth={2.1} />

          <Text style={styles.infoText}>{machine.distance}</Text>

          <Clock3 size={rf(13)} color="#94A3B8" strokeWidth={2.1} />

          <Text style={styles.infoText}>{machine.readyTime}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.ownerRow}>
          <Image source={machine.ownerImage} style={styles.ownerImage} />

          <View style={styles.ownerDetails}>
            <View style={styles.ownerNameRow}>
              <Text style={styles.ownerName}>{machine.owner}</Text>

              {machine.ownerVerified && (
                <BadgeCheck
                  size={rf(14)}
                  color={BRIGHT_GREEN}
                  strokeWidth={2.4}
                />
              )}
            </View>

            <Text style={styles.ownerSubtitle}>Verified Owner</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View>
            <View style={styles.hourlyPriceRow}>
              <Text style={styles.price}>₹{machine.hourlyPrice}</Text>

              <Text style={styles.perHour}>/ Hour</Text>
            </View>

            <Text style={styles.dailyPrice}>
              {machine.dailyPrice.toLocaleString('en-IN')} / Day
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => onBookPress?.(machine)}
            style={styles.bookButton}
          >
            <CalendarDays size={rf(17)} color="#FFFFFF" strokeWidth={2.4} />

            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    marginBottom: 17,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDEE',
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  heroImage: {
    height: 177,
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  availableBadge: {
    position: 'absolute',
    left: 13,
    top: 12,
    height: 25,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#21C861',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  availableText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heartButton: {
    position: 'absolute',
    right: 13,
    top: 12,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },
  hpBadge: {
    height: 22,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hpText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#657080',
  },
  infoRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  rating: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  reviews: {
    marginRight: 5,
    fontSize: rf(9),
    fontWeight: '600',
    color: MUTED,
  },
  infoText: {
    marginRight: 5,
    fontSize: rf(9),
    fontWeight: '500',
    color: MUTED,
  },
  divider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: '#EEF1F2',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  ownerDetails: {
    flex: 1,
    marginLeft: 10,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ownerName: {
    fontSize: rf(11),
    fontWeight: '900',
    color: DARK,
  },
  ownerSubtitle: {
    marginTop: 4,
    fontSize: rf(9),
    fontWeight: '500',
    color: '#9AA3B0',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hourlyPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: rf(20),
    fontWeight: '900',
    color: GREEN,
  },
  perHour: {
    marginLeft: 4,
    fontSize: rf(10),
    color: MUTED,
    fontWeight: '500',
  },
  dailyPrice: {
    marginTop: 5,
    fontSize: rf(9),
    fontWeight: '500',
    color: '#A4ACB8',
  },
  bookButton: {
    height: 43,
    borderRadius: 10,
    paddingHorizontal: 17,
    backgroundColor: '#14AA49',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
