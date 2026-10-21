import React, {memo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Bookmark, MapPin, Truck} from 'lucide-react-native';

import {MARKET_COLORS as C, MARKET_SHADOW} from './theme';
import {getKindMeta} from './kinds';
import {
  formatAmount,
  formatLocation,
  formatQuantity,
  getExpiryInfo,
  listingSubtitle,
} from '../../utils/marketFormat';

/*
 * Two-column browse card: photo with price overlay on top, details below.
 */
function ListingGridCard({listing, onPress, onToggleSave, width}) {
  const kind = getKindMeta(listing.kind);
  const image = listing.images?.[0];
  const subtitle = listingSubtitle(listing);
  const expiry = listing.kind === 'INPUTS' ? getExpiryInfo(listing.expiryDate) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, {width}]}
      onPress={onPress}>
      <View style={styles.imageBox}>
        <Image
          source={image ? {uri: image} : kind.image}
          style={[
            styles.image,
            !image && {backgroundColor: kind.bg},
            !image && kind.imageMode === 'contain' && styles.placeholderImage,
          ]}
          resizeMode={image ? 'cover' : kind.imageMode}
        />

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
          style={styles.imageShade}
        />

        <View style={styles.topBadges}>
          {listing.isOrganic ? (
            <Text style={[styles.badge, styles.organicBadge]}>Organic</Text>
          ) : expiry?.tone === 'soon' ? (
            <Text style={[styles.badge, styles.expiryBadge]}>{expiry.label}</Text>
          ) : (
            <Text style={[styles.badge, {color: kind.color}]}>{kind.label}</Text>
          )}

          {onToggleSave && (
            <TouchableOpacity
              hitSlop={8}
              activeOpacity={0.7}
              style={styles.saveButton}
              onPress={() => onToggleSave(listing)}>
              <Bookmark
                size={15}
                color={listing.isSaved ? C.green : C.dark}
                fill={listing.isSaved ? C.green : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.priceOverlay}>
          <Text style={styles.price} numberOfLines={1}>
            ₹{formatAmount(listing.pricePerUnit)}
            <Text style={styles.priceUnit}>/{listing.unit}</Text>
          </Text>
          {listing.isNegotiable && <Text style={styles.negotiable}>Negotiable</Text>}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        <Text style={styles.quantity} numberOfLines={1}>
          {formatQuantity(listing.quantity, listing.unit)} available
        </Text>

        <View style={styles.footer}>
          <MapPin size={11} color={C.muted} />
          <Text style={styles.location} numberOfLines={1}>
            {formatLocation(listing.location, {short: true}) || 'India'}
          </Text>
          {listing.deliveryAvailable && <Truck size={12} color={C.blue} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ListingGridCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...MARKET_SHADOW,
  },
  imageBox: {height: 150, backgroundColor: '#E3EEE7'},
  image: {width: '100%', height: '100%'},
  placeholderImage: {transform: [{scale: 0.78}]},
  imageShade: {position: 'absolute', left: 0, right: 0, bottom: 0, height: 70},
  topBadges: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    fontSize: 9.5,
    fontWeight: '900',
    color: C.green,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  organicBadge: {backgroundColor: C.green, color: C.white},
  expiryBadge: {backgroundColor: C.gold, color: '#3A2400'},
  saveButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceOverlay: {position: 'absolute', left: 10, right: 10, bottom: 8},
  price: {color: C.white, fontSize: 17, fontWeight: '900', letterSpacing: -0.3},
  priceUnit: {fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)'},
  negotiable: {color: '#FFE2A3', fontSize: 9.5, fontWeight: '800', marginTop: 1},

  body: {padding: 11, paddingTop: 10},
  title: {fontSize: 13, fontWeight: '900', color: C.dark, lineHeight: 17, minHeight: 34},
  subtitle: {fontSize: 10.5, color: C.muted, fontWeight: '600', marginTop: 3},
  quantity: {fontSize: 11, color: C.green, fontWeight: '800', marginTop: 6},
  footer: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6},
  location: {flex: 1, fontSize: 10.5, color: C.muted, fontWeight: '600'},
});
