import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  CalendarClock,
  Hourglass,
  Lock,
  MapPin,
  Navigation,
  PackageCheck,
  Star,
  Weight,
} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';

import PersonAvatar from '../labour/PersonAvatar';
import VehicleBadge from './VehicleBadge';
import {vehicleLabel} from './vehicles';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../market/theme';
import {StatusPill} from '../market/MarketBits';
import {
  DRIVER_STATE_META,
  busyMinutesLeft,
  describeBusy,
  formatKm,
  formatMinutes,
  formatRate,
  formatWeight,
  formatWhen,
} from '../../utils/deliveryFormat';
import {formatRupees} from '../../utils/marketFormat';

/*
 * Driver row on the delivery browse screen.
 *
 * Every registered driver is shown. Drivers outside the customer's
 * district are greyed out with a lock and can't be booked.
 */
function PartnerCard({partner, onPress, onBook, fareEstimate}) {
  const {t} = useTranslation();
  const locked = !partner.canBook;
  const busy = partner.tripState === 'on_trip';
  const minutesLeft = busyMinutesLeft(partner);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, locked && styles.cardLocked]}
      onPress={onPress}>
      <View style={styles.top}>
        <View>
          <PersonAvatar
            name={partner.fullName}
            image={partner.profileImage}
            size={58}
            gradient={locked ? 'slate' : 'green'}
          />
          <VehicleBadge type={partner.vehicleType} size={26} style={styles.vehicleDot} />
        </View>

        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {partner.fullName}
            </Text>
            <StatusPill meta={DRIVER_STATE_META[partner.tripState]} />
          </View>

          <Text style={styles.vehicle} numberOfLines={1}>
            {vehicleLabel(partner.vehicleType)}
            {partner.vehicleName ? ` · ${partner.vehicleName}` : ''}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Star size={12} color={C.gold} fill={C.gold} />
              <Text style={styles.statText}>
                {partner.totalReviews
                  ? `${partner.rating} (${partner.totalReviews})`
                  : t('delivery.new')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Weight size={12} color={C.blue} />
              <Text style={styles.statText}>{formatWeight(partner.capacityKg)}</Text>
            </View>
            {partner.totalTrips > 0 && (
              <View style={styles.stat}>
                <PackageCheck size={12} color={C.green} />
                <Text style={styles.statText}>
                  {t('delivery.trips', {count: partner.totalTrips})}
                </Text>
              </View>
            )}
            {partner.distanceKm !== null && partner.distanceKm !== undefined && (
              <View style={styles.stat}>
                <Navigation size={12} color={C.orange} />
                <Text style={styles.statText}>
                  {t('delivery.away', {distance: formatKm(partner.distanceKm)})}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* WHY BUSY + FOR HOW LONG */}
      {busy && (
        <View style={styles.busyBox}>
          <Hourglass size={14} color={C.orange} />
          <View style={styles.flex}>
            <Text style={styles.busyTitle}>
              {t('delivery.busyFor', {time: formatMinutes(minutesLeft)})}
            </Text>
            <Text style={styles.busyText} numberOfLines={2}>
              {describeBusy(partner)}
            </Text>
          </View>
        </View>
      )}

      {!busy && partner.upcomingTrips > 0 && (
        <View style={[styles.busyBox, styles.upcomingBox]}>
          <CalendarClock size={14} color={C.blue} />
          <Text style={[styles.busyText, styles.flex]} numberOfLines={1}>
            {t('delivery.nextBooked', {
              count: partner.upcomingTrips,
              when: formatWhen(partner.nextPickupAt),
            })}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.flex}>
          <Text style={styles.price}>
            {fareEstimate ? formatRupees(fareEstimate) : formatRate(partner)}
            <Text style={styles.priceUnit}>
              {fareEstimate
                ? ` ${t('delivery.estimated')}`
                : ` · ${t('delivery.minFare', {amount: formatRupees(partner.minFare)})}`}
            </Text>
          </Text>
          <View style={styles.stat}>
            {locked ? (
              <Lock size={11} color={C.muted} />
            ) : (
              <MapPin size={11} color={C.green} />
            )}
            <Text
              style={[styles.location, !locked && styles.locationOk]}
              numberOfLines={1}>
              {locked
                ? t('delivery.outsideDistrict', {district: partner.district})
                : t('delivery.inYourDistrict', {
                    place: [partner.village, partner.district]
                      .filter(Boolean)
                      .join(', '),
                  })}
            </Text>
          </View>
        </View>

        {!!onBook && (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={locked}
            style={[styles.bookButton, locked && styles.bookDisabled]}
            onPress={onBook}>
            <Text style={[styles.bookText, locked && styles.bookTextDisabled]}>
              {locked
                ? t('delivery.view')
                : busy || partner.tripState === 'offline'
                ? t('delivery.schedule')
                : t('delivery.bookBtn')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(PartnerCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  cardLocked: {backgroundColor: '#FAFBFA', opacity: 0.86},
  top: {flexDirection: 'row', gap: 12, alignItems: 'center'},
  vehicleDot: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    borderWidth: 2,
    borderColor: C.white,
  },
  flex: {flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  name: {
    flexShrink: 1,
    fontSize: 15.5,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
  },
  vehicle: {fontSize: 12, fontWeight: '700', color: C.green, marginTop: 2},
  statsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6},
  stat: {flexDirection: 'row', alignItems: 'center', gap: 4},
  statText: {fontSize: 11, fontWeight: '700', color: C.text},

  busyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: C.lightOrange,
  },
  upcomingBox: {backgroundColor: C.lightBlue},
  busyTitle: {fontSize: 12, fontWeight: '900', color: C.orange},
  busyText: {fontSize: 11, fontWeight: '700', color: C.text, marginTop: 1},

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF1EF',
    gap: 10,
  },
  price: {fontSize: 16, fontWeight: '900', color: C.dark, letterSpacing: -0.3},
  priceUnit: {fontSize: 10.5, fontWeight: '700', color: C.muted},
  location: {flex: 1, fontSize: 11, color: C.muted, fontWeight: '700'},
  locationOk: {color: C.green},
  bookButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookDisabled: {backgroundColor: '#E8ECEA'},
  bookText: {color: C.white, fontSize: 13, fontWeight: '900'},
  bookTextDisabled: {color: C.muted},
});
