import React, {memo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Leaf, Tractor} from 'lucide-react-native';

import {MARKET_COLORS as C, MARKET_SHADOW} from './theme';
import {StatusPill} from './MarketBits';
import {
  DEAL_STATUS_META,
  describeDealState,
  formatPricePerUnit,
  formatQuantity,
  formatRupees,
  timeAgo,
} from '../../utils/marketFormat';

function DealCard({deal, onPress}) {
  const snapshot = deal.listingSnapshot || {};
  const image = deal.listing?.images?.[0] || snapshot.image;
  const counterparty = deal.myRole === 'BUYER' ? deal.seller : deal.buyer;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.card, deal.isMyTurn && styles.myTurnCard]}
      onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.imageBox}>
          {image ? (
            <Image source={{uri: image}} style={styles.image} />
          ) : snapshot.kind === 'EQUIPMENT' ? (
            <Tractor size={24} color={C.green} />
          ) : (
            <Leaf size={24} color={C.green} />
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.pillRow}>
            <Text style={[styles.role, deal.myRole === 'SELLER' && styles.roleSelling]}>
              {deal.myRole === 'BUYER' ? 'BUYING' : 'SELLING'}
            </Text>
            <StatusPill meta={DEAL_STATUS_META[deal.status]} />
            <Text style={styles.time}>{timeAgo(deal.updatedAt)}</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {snapshot.title}
          </Text>

          <Text style={styles.terms} numberOfLines={1}>
            {formatQuantity(deal.quantity, snapshot.unit)} ×{' '}
            {formatPricePerUnit(deal.pricePerUnit, snapshot.unit)}
          </Text>

          <Text style={styles.total}>{formatRupees(deal.totalAmount)}</Text>

          {!!counterparty?.fullName && (
            <Text style={styles.party} numberOfLines={1}>
              {deal.myRole === 'BUYER' ? 'Seller' : 'Buyer'}: {counterparty.fullName}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.stateRow, deal.isMyTurn && styles.stateRowMyTurn]}>
        <Text style={[styles.stateText, deal.isMyTurn && styles.stateTextMyTurn]}>
          {describeDealState(deal)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default memo(DealCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  myTurnCard: {borderColor: '#F3D58A'},
  row: {flexDirection: 'row', gap: 12},
  imageBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {width: '100%', height: '100%'},
  body: {flex: 1},
  pillRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  role: {
    fontSize: 9.5,
    fontWeight: '900',
    color: C.blue,
    backgroundColor: C.lightBlue,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  roleSelling: {color: C.green, backgroundColor: C.lightGreen},
  time: {marginLeft: 'auto', fontSize: 10.5, color: C.muted, fontWeight: '600'},
  title: {fontSize: 14, fontWeight: '900', color: C.dark, marginTop: 6},
  terms: {fontSize: 11.5, color: C.text, fontWeight: '700', marginTop: 2},
  total: {fontSize: 14, color: C.green, fontWeight: '900', marginTop: 2},
  party: {fontSize: 11, color: C.muted, fontWeight: '600', marginTop: 2},
  stateRow: {marginTop: 10, padding: 9, borderRadius: 10, backgroundColor: C.bg},
  stateRowMyTurn: {backgroundColor: C.lightAmber},
  stateText: {fontSize: 11.5, fontWeight: '700', color: C.muted},
  stateTextMyTurn: {color: C.amber, fontWeight: '900'},
});
