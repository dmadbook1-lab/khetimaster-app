import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Heart,
  Star,
  MapPin,
  CalendarDays,
  CircleCheck,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const BRIGHT_GREEN = '#18B94D';
const DARK = '#121A2B';
const MUTED = '#64748B';
const BORDER = '#E9EDEE';

// Upscaled font scale utility
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 1, Math.min(size * scale, size + 2));
};

// Calculate 2-column tile width
const TILE_WIDTH = (width - width * 0.037 * 2 - 12) / 2;

export default function MachineryCard({
  machine = {},
  onPress,
  onBookPress,
  onFavouritePress,
}) {
  const isAvailable =
    machine.availability === 'available' && machine.isActive !== false;

  const imageUri =
    Array.isArray(machine.images) && machine.images.length > 0
      ? { uri: machine.images[0] }
      : require('../../assets/machinery/sonalika-di-745.jpg');

  const name = machine.name || 'Machinery';
  const category = machine.category || 'Tractor';

  const location =
    [machine.village, machine.district].filter(Boolean).join(', ') ||
    'Location not set';

  const hourlyPrice = Number(machine.pricing?.hourly) || 0;
  const dailyPrice = Number(machine.pricing?.daily) || 0;
  const rating = Number(machine.rating) || 0;

  const horsepower = machine.enginePower?.value
    ? `${machine.enginePower.value} ${machine.enginePower.unit || 'HP'}`
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress?.(machine)}
      style={styles.tileCard}
    >
      {/* IMAGE CONTAINER */}
      <View style={styles.imageWrap}>
        <Image source={imageUri} style={styles.image} resizeMode="cover" />

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            isAvailable ? styles.statusOn : styles.statusOff,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isAvailable ? styles.statusDotOn : styles.statusDotOff,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isAvailable ? styles.statusTextOn : styles.statusTextOff,
            ]}
          >
            {isAvailable ? 'Available' : 'Busy'}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFavouritePress?.(machine)}
          style={styles.favButton}
        >
          <Heart
            size={rf(16)}
            color={machine.favourite ? '#EF4444' : '#64748B'}
            fill={machine.favourite ? '#EF4444' : 'transparent'}
            strokeWidth={2.3}
          />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* Category & Rating */}
        <View style={styles.metaRow}>
          <Text style={styles.category} numberOfLines={1}>
            {horsepower ? `${category} • ${horsepower}` : category}
          </Text>

          {rating > 0 && (
            <View style={styles.ratingBox}>
              <Star size={rf(11)} color="#FACC15" fill="#FACC15" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Machinery Name */}
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin size={rf(13)} color="#64748B" strokeWidth={2.2} />
          <Text numberOfLines={1} style={styles.locationText}>
            {location}
          </Text>
        </View>

        {/* Price & Book Action */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            {hourlyPrice > 0 ? (
              <Text style={styles.priceText}>
                ₹{hourlyPrice}
                <Text style={styles.priceUnit}>/hr</Text>
              </Text>
            ) : dailyPrice > 0 ? (
              <Text style={styles.priceText}>
                ₹{dailyPrice}
                <Text style={styles.priceUnit}>/day</Text>
              </Text>
            ) : (
              <Text style={styles.priceText}>On Request</Text>
            )}

            {dailyPrice > 0 && hourlyPrice > 0 && (
              <Text style={styles.subPriceText}>
                ₹{dailyPrice.toLocaleString('en-IN')}/day
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onBookPress?.(machine)}
            disabled={!isAvailable}
            style={[
              styles.bookBtn,
              !isAvailable && styles.bookBtnDisabled,
            ]}
          >
            <CalendarDays size={rf(14)} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.bookBtnText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tileCard: {
    width: TILE_WIDTH,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrap: {
    width: '100%',
    height: 125,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusOn: {
    backgroundColor: '#EAFBF0',
  },
  statusOff: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusDotOn: {
    backgroundColor: BRIGHT_GREEN,
  },
  statusDotOff: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: rf(8),
    fontWeight: '800',
  },
  statusTextOn: {
    color: GREEN,
  },
  statusTextOff: {
    color: '#DC2626',
  },
  favButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  category: {
    flex: 1,
    fontSize: rf(10),
    color: '#16883E',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: DARK,
  },
  name: {
    marginTop: 4,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
    lineHeight: rf(19),
  },
  locationRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: rf(16),
    fontWeight: '900',
    color: GREEN,
  },
  priceUnit: {
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '600',
  },
  subPriceText: {
    fontSize: rf(9),
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  bookBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: BRIGHT_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bookBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: rf(11),
    fontWeight: '900',
  },
});