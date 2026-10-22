import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, MapPin, Store } from 'lucide-react-native';

import { MARKET_COLORS as C, MARKET_SHADOW } from '../market/theme';
import { StatusPill } from '../market/MarketBits';
import { PlantImage } from './NurseryBits';
import { formatRupees } from '../../utils/marketFormat';
import { formatDay } from '../../utils/indiaSchedule';
import {
  ORDER_STATUS_META,
  describeOrderState,
  describeSellerState,
  groupItemsBySeller,
  itemCount,
} from '../../utils/nurseryFormat';

const itemsSummary = items => {
  const names = items.map(item => item.name);
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
};

/*
 * Order row. role 'buyer' shows the order (all sellers), 'seller' a
 * seller view (only their items, sellerStatus, buyer's place).
 */
function NurseryOrderCard({ order, role = 'buyer', onPress, footer }) {
  const isSeller = role === 'seller';
  const items = order.items || [];
  const status = isSeller ? order.sellerStatus : order.orderStatus;
  const needsMe = isSeller && status === 'PENDING';
  const sellers = isSeller ? [] : groupItemsBySeller(order);
  const amount = isSeller ? order.sellerSubtotal : order.total;
  const place = [
    order.deliveryAddress?.village,
    order.deliveryAddress?.district,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, needsMe && styles.cardHighlight]}
      onPress={onPress}
    >
      <View style={styles.top}>
        <View style={styles.thumbs}>
          {items.slice(0, 3).map((item, index) => (
            <PlantImage
              key={item._id || index}
              plant={item}
              style={[styles.thumb, index > 0 && styles.thumbStacked]}
              iconSize={18}
            />
          ))}
        </View>

        <View style={styles.flex}>
          <Text style={styles.title} numberOfLines={1}>
            {itemsSummary(items)}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {itemCount(items)} plants · Order #
            {String(order._id).slice(-6).toUpperCase()}
          </Text>
        </View>

        <StatusPill meta={ORDER_STATUS_META[status]} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.info}>
          <CalendarDays size={13} color={C.green} />
          <Text style={styles.infoText} numberOfLines={1}>
            {formatDay(order.createdAt, { weekday: false })}
          </Text>
        </View>
        <View style={styles.info}>
          {isSeller ? (
            <MapPin size={13} color={C.blue} />
          ) : (
            <Store size={13} color={C.blue} />
          )}
          <Text style={styles.infoText} numberOfLines={1}>
            {isSeller
              ? place || order.deliveryAddress?.fullName || 'Buyer'
              : sellers.length > 1
              ? `${sellers.length} sellers`
              : sellers[0]?.sellerName || 'Seller'}
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text
          style={[styles.state, needsMe && styles.stateHighlight]}
          numberOfLines={2}
        >
          {isSeller ? describeSellerState(status) : describeOrderState(order)}
        </Text>
        <Text style={styles.total}>{formatRupees(amount)}</Text>
      </View>

      {footer}
    </TouchableOpacity>
  );
}

export default memo(NurseryOrderCard);

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
  thumbs: { flexDirection: 'row' },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.white,
  },
  thumbStacked: { marginLeft: -22 },
  title: {
    fontSize: 14.5,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: -0.2,
  },
  sub: { fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 2 },
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
