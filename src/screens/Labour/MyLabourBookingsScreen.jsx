import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarCheck, UserPlus } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  HeroStat,
  TopInset,
} from '../../components/market/MarketHero';
import {
  ChipRow,
  EmptyState,
  LoadingState,
} from '../../components/market/MarketBits';
import { MARKET_COLORS as C } from '../../components/market/theme';
import LabourBookingCard from '../../components/labour/LabourBookingCard';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import { fetchMyLabourBookings } from '../../redux/slices/labourBookingSlice';
import { isAcceptedStatus } from '../../utils/labourFormat';

const STATUS_FILTERS = [
  { key: 'active', label: 'Upcoming' },
  { key: 'pending', label: 'Requested' },
  { key: 'accepted', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rejected', label: 'Declined' },
  { key: 'all', label: 'All' },
];

const PAGE_SIZE = 20;

export default function MyLabourBookingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.labourBooking.myBookings);

  const [status, setStatus] = useState('active');

  const params = useMemo(() => ({ status, limit: PAGE_SIZE }), [status]);

  const load = useCallback(
    () => dispatch(fetchMyLabourBookings({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    dispatch(
      fetchMyLabourBookings({
        params: { ...params, page: page + 1 },
        append: true,
      }),
    );
  };

  const waiting = items.filter(item => item.status === 'pending').length;
  const confirmed = items.filter(item => isAcceptedStatus(item.status)).length;
  const toRate = items.filter(item => item.canReview).length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : items}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <LabourBookingCard
              booking={item}
              onPress={() =>
                navigation.navigate(LABOUR_ROUTES.BOOKING_DETAILS, {
                  bookingId: item._id,
                })
              }
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <MarketHero
              compact
              gradient="blue"
              onBack={() => navigation.goBack()}
              eyebrow="Hired workers"
              title="My Bookings"
              subtitle="Workers you've booked for your farm"
              right={
                <GlassButton
                  onPress={() => navigation.navigate(LABOUR_ROUTES.HOME)}
                >
                  <UserPlus size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat value={waiting} label="Waiting" />
                <HeroStat value={confirmed} label="Confirmed" />
                <HeroStat
                  value={toRate || total}
                  label={toRate ? 'To rate' : 'Showing'}
                  highlight={toRate > 0}
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
            refreshing={loading && items.length > 0}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              title="Couldn't load your bookings"
              message={error}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<CalendarCheck size={30} color={C.green} />}
              title="No bookings here"
              message="Book a worker for harvesting, sowing, spraying and more."
              actionLabel="Find Workers"
              onAction={() => navigation.navigate(LABOUR_ROUTES.HOME)}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  header: { marginBottom: 14 },
  item: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  filters: { paddingHorizontal: 16, marginTop: 16 },
  footerLoader: { marginVertical: 16 },
});
