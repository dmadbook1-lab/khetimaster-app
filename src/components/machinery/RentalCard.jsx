import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, Clock, UserRound } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';
import { StatusPill } from '../market/MarketBits';
import { machineryImageSource } from './machineryImages';
import {
  BOOKING_STATUS_META,
  describeRentalState,
  formatDuration,
} from '../../utils/machineryFormat';
import {
  formatDateRange,
  formatDay,
  formatTimeRange,
} from '../../utils/indiaSchedule';
import { formatRupees } from '../../utils/marketFormat';

const scheduleLabel = booking => {
  if (booking.durationUnit === 'days') {
    return formatDateRange(booking.bookingDate, booking.duration);
  }
  return formatDay(booking.bookingDate);
};

/*
 * Rental row for "My Rentals" (farmer) and "Rental Requests" (owner).
 */
function RentalCard({ booking, onPress, footer }) {
  const machine = booking.machinery || {};
  const isOwner = booking.myRole === 'owner';
  const needsMe = isOwner && booking.status === 'pending';
  const other = isOwner ? booking.farmer : machine.owner;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, needsMe && styles.cardHighlight]}
      onPress={onPress}
    >
      <View style={styles.top}>
        <Image source={machineryImageSource(machine)} style={styles.image} />

        <View style={styles.flex}>
          <Text style={styles.name} numberOfLines={1}>
            {machine.name || 'Machine'}
          </Text>
          <Text style={styles.work} numberOfLines={1}>
            {booking.workType}
            {booking.selectedImplement ? ` · ${booking.selectedImplement}` : ''}
          </Text>
          <View style={styles.inline}>
            <UserRound size={11} color={C.muted} />
            <Text style={styles.person} numberOfLines={1}>
              {isOwner ? 'Farmer' : 'Owner'}:{' '}
              {other?.fullName || machine.ownerName || '—'}
            </Text>
          </View>
        </View>

        <StatusPill meta={BOOKING_STATUS_META[booking.status]} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.info}>
          <CalendarDays size={13} color={C.green} />
          <Text style={styles.infoText} numberOfLines={1}>
            {scheduleLabel(booking)}
          </Text>
        </View>
        <View style={styles.info}>
          <Clock size={13} color={C.blue} />
          <Text style={styles.infoText} numberOfLines={1}>
            {booking.durationUnit === 'days'
              ? formatDuration(booking.duration, 'days')
              : formatTimeRange(booking.startTime, booking.endTime)}
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text
          style={[styles.state, needsMe && styles.stateHighlight]}
          numberOfLines={2}
        >
          {describeRentalState(booking)}
        </Text>
        <Text style={styles.total}>{formatRupees(booking.totalAmount)}</Text>
      </View>

      {footer}
    </TouchableOpacity>
  );
}

export default memo(RentalCard);

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
  cardHighlight: { borderColor: '#F3D58A' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  image: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E3EEE7',
  },
  name: { fontSize: 15, fontWeight: '900', color: C.dark, letterSpacing: -0.2 },
  work: { fontSize: 12, fontWeight: '700', color: C.blue, marginTop: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  person: { flex: 1, fontSize: 11, fontWeight: '600', color: C.muted },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoText: { flex: 1, fontSize: 11.5, fontWeight: '800', color: C.text },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  state: { flex: 1, fontSize: 11.5, fontWeight: '700', color: C.muted },
  stateHighlight: { color: C.amber, fontWeight: '900' },
  total: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.3,
  },
});
