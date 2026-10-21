import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeCheck, MapPin, Star, User } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHeader from '../../components/market/MarketHeader';
import MarketHero, {
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
import ListingCard from '../../components/market/ListingCard';
import { EmptyState, LoadingState } from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import { MARKET_ROUTES } from '../../constants/marketRoutes';
import {
  clearMarketSellerProfile,
  fetchMarketSellerProfile,
} from '../../redux/slices/marketSlice';
import { formatLocation, timeAgo } from '../../utils/marketFormat';

function Stars({ rating, size = 12 }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(value => (
        <Star
          key={value}
          size={size}
          color="#F5A524"
          fill={value <= Math.round(rating) ? '#F5A524' : 'transparent'}
        />
      ))}
    </View>
  );
}

export default function MarketSellerProfileScreen({ navigation, route }) {
  const { sellerId } = route.params;
  const dispatch = useDispatch();
  const { sellerProfile, sellerLoading, sellerError } = useSelector(
    state => state.market,
  );

  useEffect(() => {
    dispatch(fetchMarketSellerProfile(sellerId));

    return () => {
      dispatch(clearMarketSellerProfile());
    };
  }, [dispatch, sellerId]);

  const seller = sellerProfile?.seller;
  const stats = seller?.stats || {};
  const listings = sellerProfile?.listings || [];
  const reviews = sellerProfile?.reviews || [];

  if (!seller) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MarketHeader title="Seller" onBack={() => navigation.goBack()} />
        {sellerError ? (
          <EmptyState
            title="Seller not available"
            message={sellerError}
            actionLabel="Go Back"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const header = (
    <View>
      <MarketHero gradient="forest" onBack={() => navigation.goBack()}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <User size={32} color={C.green} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={2}>
              {seller.fullName || 'Farmer'}
            </Text>
            {!!formatLocation(seller) && (
              <View style={styles.inline}>
                <MapPin size={12} color="#BFF0D2" />
                <Text style={styles.location} numberOfLines={1}>
                  {formatLocation(seller)}
                </Text>
              </View>
            )}
            {!!seller.createdAt && (
              <Text style={styles.memberSince}>
                On KhetiMaster since{' '}
                {new Date(seller.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <HeroStat
            value={stats.totalReviews ? `★ ${stats.averageRating}` : 'New'}
            label={`${stats.totalReviews || 0} reviews`}
            highlight={stats.totalReviews > 0}
          />
          <HeroStat value={stats.completedDeals || 0} label="Deals done" />
          <HeroStat value={listings.length} label="Listings" />
        </View>
      </MarketHero>

      <View style={styles.body}>
        {reviews.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {reviews.slice(0, 5).map((review, index) => (
              <View
                key={`${review.createdAt}-${index}`}
                style={styles.reviewCard}
              >
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewer}>
                    {review.buyer?.fullName || 'Buyer'}
                  </Text>
                  <Stars rating={review.rating} />
                </View>
                <Text style={styles.reviewItem}>
                  Bought {review.item} · {timeAgo(review.createdAt)}
                </Text>
                {!!review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
          </>
        )}

        <View style={styles.inline}>
          <BadgeCheck size={17} color={C.green} />
          <Text style={styles.sectionTitle}>Listings from this seller</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={listings}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.body}>
            <ListingCard
              listing={item}
              onPress={() =>
                navigation.push(MARKET_ROUTES.LISTING_DETAILS, {
                  listingId: item._id,
                })
              }
            />
          </View>
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={sellerLoading}
            onRefresh={() => dispatch(fetchMarketSellerProfile(sellerId))}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active listings right now.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { flexDirection: 'row', gap: 1, marginTop: 2 },

  flex: { flex: 1 },
  body: { paddingHorizontal: 16 },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -0.5,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  memberSince: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontWeight: '600',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    marginTop: 22,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...MARKET_SHADOW,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewer: { fontSize: 13, fontWeight: '800', color: C.dark },
  reviewItem: { fontSize: 11, color: C.muted, marginTop: 3, fontWeight: '600' },
  reviewComment: {
    fontSize: 12.5,
    color: C.text,
    marginTop: 6,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 12.5,
    color: C.muted,
    textAlign: 'center',
    marginTop: 20,
  },
});
