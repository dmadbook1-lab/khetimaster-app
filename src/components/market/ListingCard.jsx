import React, {memo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Bookmark, MapPin, Truck} from 'lucide-react-native';

import {MARKET_COLORS as C, MARKET_SHADOW} from './theme';
import {getKindMeta} from './kinds';
import {StatusPill} from './MarketBits';
import {
  LISTING_STATUS_META,
  formatLocation,
  formatPricePerUnit,
  formatQuantity,
  getExpiryInfo,
  listingSubtitle,
  timeAgo,
} from '../../utils/marketFormat';

const EXPIRY_TONES = {
  expired: {color: C.red, bg: C.lightRed},
  soon: {color: C.amber, bg: C.lightAmber},
  ok: {color: C.muted, bg: C.bg},
};

/*
 * Horizontal listing row used on saved, seller and my listings screens.
 *
 * showStatus   -> show ACTIVE / PAUSED / SOLD pill (seller views)
 * onToggleSave -> show the bookmark button
 */
function ListingCard({listing, onPress, onToggleSave, showStatus, footer}) {
  const kind = getKindMeta(listing.kind);
  const image = listing.images?.[0];
  const location = formatLocation(listing.location, {short: true});
  const subtitle = listingSubtitle(listing);
  const expiry = listing.kind === 'INPUTS' ? getExpiryInfo(listing.expiryDate) : null;

  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.imageBox, {backgroundColor: kind.bg}]}>
          <Image
            source={image ? {uri: image} : kind.image}
            style={[styles.image, !image && kind.imageMode === 'contain' && styles.placeholder]}
            resizeMode={image ? 'cover' : kind.imageMode}
          />
          <View style={[styles.kindStrip, {backgroundColor: kind.color}]}>
            <Text style={styles.kindText}>{kind.label}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>

            {onToggleSave && (
              <TouchableOpacity
                hitSlop={10}
                activeOpacity={0.7}
                onPress={() => onToggleSave(listing)}>
                <Bookmark
                  size={19}
                  color={listing.isSaved ? C.green : C.muted}
                  fill={listing.isSaved ? C.green : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>

          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          <Text style={styles.price}>
            {formatPricePerUnit(listing.pricePerUnit, listing.unit)}
          </Text>

          <Text style={styles.meta} numberOfLines={1}>
            {formatQuantity(listing.quantity, listing.unit)} available
            {listing.isNegotiable ? ' · Negotiable' : ''}
          </Text>

          <View style={styles.bottomRow}>
            {showStatus && <StatusPill meta={LISTING_STATUS_META[listing.status]} />}

            {!!expiry && (
              <Text
                style={[
                  styles.expiry,
                  {color: EXPIRY_TONES[expiry.tone].color, backgroundColor: EXPIRY_TONES[expiry.tone].bg},
                ]}>
                {expiry.label}
              </Text>
            )}

            {!showStatus && !!location && (
              <View style={styles.inline}>
                <MapPin size={11} color={C.muted} />
                <Text style={styles.metaSmall} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            )}

            {listing.deliveryAvailable && <Truck size={12} color={C.blue} />}

            {!showStatus && !!listing.createdAt && (
              <Text style={styles.metaSmall}>{timeAgo(listing.createdAt)}</Text>
            )}
          </View>
        </View>
      </View>

      {footer}
    </TouchableOpacity>
  );
}

export default memo(ListingCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  row: {flexDirection: 'row', gap: 12},
  imageBox: {
    width: 100,
    height: 112,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {width: '100%', height: '100%'},
  placeholder: {transform: [{scale: 0.82}]},
  kindStrip: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 3},
  kindText: {color: C.white, fontSize: 9, fontWeight: '900', textAlign: 'center', letterSpacing: 0.4},
  body: {flex: 1},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  title: {flex: 1, fontSize: 14, fontWeight: '900', color: C.dark, letterSpacing: -0.2},
  subtitle: {fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 2},
  price: {fontSize: 16, fontWeight: '900', color: C.green, marginTop: 6, letterSpacing: -0.3},
  meta: {fontSize: 11, color: C.text, fontWeight: '700', marginTop: 2},
  bottomRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7, flexWrap: 'wrap'},
  inline: {flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1},
  metaSmall: {fontSize: 10.5, color: C.muted, fontWeight: '600'},
  expiry: {
    fontSize: 9.5,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
