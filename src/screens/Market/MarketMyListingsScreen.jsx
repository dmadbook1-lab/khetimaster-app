import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, Handshake, Plus, Store } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
import ListingCard from '../../components/market/ListingCard';
import {
  ChipRow,
  EmptyState,
  LoadingState,
} from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import { fetchMyMarketListings } from '../../redux/slices/marketSlice';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PAUSED', label: 'Paused' },
  { key: 'SOLD', label: 'Sold Out' },
];

export default function MarketMyListingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { myListings, myListingsLoading, myListingsError } = useSelector(
    state => state.market,
  );

  const [status, setStatus] = useState('all');
  // totals across every listing, captured whenever the unfiltered list loads
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    if (status === 'all' && !myListingsLoading && !myListingsError) {
      setTotals({
        active: myListings.filter(item => item.status === 'ACTIVE').length,
        sold: myListings.filter(item => item.status === 'SOLD').length,
        pending: myListings.reduce(
          (sum, item) => sum + (item.pendingOffers || 0),
          0,
        ),
      });
    }
  }, [status, myListings, myListingsLoading, myListingsError]);

  const load = useCallback(
    () => dispatch(fetchMyMarketListings(status)),
    [dispatch, status],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <ListingCard
        listing={item}
        showStatus
        onPress={() =>
          navigation.navigate(MARKET_ROUTES.LISTING_DETAILS, {
            listingId: item._id,
          })
        }
        footer={
          item.pendingOffers > 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.offerStrip}
              onPress={() =>
                navigation.navigate(MARKET_ROUTES.DEALS, {
                  listingId: item._id,
                  listingTitle: item.title,
                })
              }
            >
              <Handshake size={15} color={C.amber} />
              <Text style={styles.offerText}>
                {item.pendingOffers}{' '}
                {item.pendingOffers === 1 ? 'offer' : 'offers'} waiting for your
                reply
              </Text>
              <ChevronRight size={16} color={C.amber} />
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={myListingsLoading && !myListings.length ? [] : myListings}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <MarketHero
              compact
              onBack={() => navigation.goBack()}
              eyebrow="Your shop"
              title="My Listings"
              subtitle={
                totals?.pending
                  ? `${totals.pending} offers are waiting for your reply`
                  : 'Manage stock, prices and offers in one place'
              }
              right={
                <GlassButton
                  onPress={() => navigation.navigate(MARKET_ROUTES.SELL)}
                >
                  <Plus size={20} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat value={totals ? totals.active : '-'} label="Active" />
                <HeroStat value={totals ? totals.sold : '-'} label="Sold out" />
                <HeroStat
                  value={totals ? totals.pending : '-'}
                  label="Offers waiting"
                  highlight={totals?.pending > 0}
                />
              </View>
            </MarketHero>

            <View style={styles.filters}>
              <ChipRow
                options={STATUS_FILTERS}
                value={status}
                onChange={setStatus}
              />
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={myListingsLoading && myListings.length > 0}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          myListingsLoading ? (
            <LoadingState />
          ) : myListingsError ? (
            <EmptyState
              icon={<Store size={30} color={C.green} />}
              title="Couldn't load your listings"
              message={myListingsError}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Store size={30} color={C.green} />}
              title="No listings yet"
              message="List your crops, fruits, vegetables or farm equipment and get offers from buyers."
              actionLabel="Create Listing"
              onAction={() => navigation.navigate(MARKET_ROUTES.SELL)}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  item: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  filters: { paddingHorizontal: 16, marginTop: 16, marginBottom: 14 },
  offerStrip: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.lightAmber,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offerText: { flex: 1, fontSize: 12, fontWeight: '800', color: C.amber },
});
