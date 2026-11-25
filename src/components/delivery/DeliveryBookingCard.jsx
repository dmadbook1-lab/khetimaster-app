import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CalendarClock, Package} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';

import RouteStops from './RouteStops';
import VehicleBadge from './VehicleBadge';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../market/theme';
import {StatusPill} from '../market/MarketBits';
import {
  TRIP_STATUS_META,
  describeTripState,
  formatKm,
  formatWeight,
  formatWhen,
} from '../../utils/deliveryFormat';
import {formatRupees} from '../../utils/marketFormat';
import {tOpt} from '../../utils/tOpt';

/*
 * Trip row for "My deliveries" (customer) and the driver dashboard.
 * Shows the other side of the booking.
 */
function DeliveryBookingCard({booking, onPress, footer}) {
  const {t} = useTranslation();
  const isCustomer = booking.myRole === 'customer';
  const other = isCustomer ? booking.partner : booking.customer;
  const needsMe = !isCustomer && booking.status === 'requested';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, needsMe && styles.cardHighlight]}
      onPress={onPress}>
      <View style={styles.top}>
        <VehicleBadge type={booking.vehicleType} size={42} />
        <View style={styles.flex}>
          <Text style={styles.name} numberOfLines={1}>
            {other?.fullName || (isCustomer ? t('delivery.driver') : t('delivery.customer'))}
          </Text>
          <View style={styles.inline}>
            <CalendarClock size={12} color={C.muted} />
            <Text style={styles.when} numberOfLines={1}>
              {booking.scheduleType === 'now' && booking.status === 'requested'
                ? t('delivery.pickupNow')
                : formatWhen(booking.pickupAt)}
            </Text>
          </View>
        </View>
        <StatusPill meta={TRIP_STATUS_META[booking.status]} />
      </View>

      <View style={styles.route}>
        <RouteStops pickup={booking.pickup} drop={booking.drop} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.chip}>
          <Package size={12} color={C.green} />
          <Text style={styles.chipText} numberOfLines={1}>
            {tOpt(booking.goodsType)}
            {booking.weightKg ? ` · ${formatWeight(booking.weightKg)}` : ''}
          </Text>
        </View>
        <Text style={styles.distance}>{formatKm(booking.distanceKm)}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={[styles.state, needsMe && styles.stateHighlight]} numberOfLines={2}>
          {describeTripState(booking)}
        </Text>
        <Text style={styles.total}>{formatRupees(booking.totalAmount)}</Text>
      </View>

      {footer}
    </TouchableOpacity>
  );
}

export default memo(DeliveryBookingCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...MARKET_SHADOW,
  },
  cardHighlight: {borderColor: '#F3D58A'},
  top: {flexDirection: 'row', alignItems: 'center', gap: 12},
  flex: {flex: 1},
  inline: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3},
  name: {fontSize: 15, fontWeight: '900', color: C.dark, letterSpacing: -0.2},
  when: {fontSize: 11.5, fontWeight: '700', color: C.muted},
  route: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.bg,
  },
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10},
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {flex: 1, fontSize: 11.5, fontWeight: '800', color: C.text},
  distance: {fontSize: 11.5, fontWeight: '900', color: C.blue},
  bottom: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10},
  state: {flex: 1, fontSize: 11.5, fontWeight: '700', color: C.muted},
  stateHighlight: {color: C.amber, fontWeight: '900'},
  total: {fontSize: 16, fontWeight: '900', color: C.dark, letterSpacing: -0.3},
});
