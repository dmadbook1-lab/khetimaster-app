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
import { CalendarCheck, Tractor } from 'lucide-react-native';
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
import RentalCard from '../../components/machinery/RentalCard';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import { fetchMyMachineryBookings } from '../../redux/slices/machineryBookingSlice';
import { isAcceptedStatus } from '../../utils/machineryFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'active', get label() {
    return i18n.t('myMachineryBookings.upcoming');
  } },
  { key: 'pending', get label() {
    return i18n.t('myMachineryBookings.requested');
  } },
  { key: 'confirmed', get label() {
    return i18n.t('myMachineryBookings.confirmed');
  } },
  { key: 'completed', get label() {
    return i18n.t('myMachineryBookings.completed');
  } },
  { key: 'cancelled', get label() {
    return i18n.t('myMachineryBookings.cancelled');
  } },
  { key: 'rejected', get label() {
    return i18n.t('myMachineryBookings.declined');
  } },
  { key: 'all', get label() {
    return i18n.t('myMachineryBookings.all');
  } },
];

const PAGE_SIZE = 20;

export default function MyMachineryBookingsScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.machineryBooking.myBookings);

  const [status, setStatus] = useState('active');

  const params = useMemo(() => ({ status, limit: PAGE_SIZE }), [status]);

  const load = useCallback(
    () =>
      dispatch(fetchMyMachineryBookings({ params: { ...params, page: 1 } })),
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
      fetchMyMachineryBookings({
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
            <RentalCard
              booking={item}
              onPress={() =>
                navigation.navigate(MACHINERY_ROUTES.BOOKING_DETAILS, {
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
              eyebrow={t('myMachineryBookings.machinery')}
              title={t('myMachineryBookings.myRentals')}
              subtitle={t('myMachineryBookings.machinesYouveBookedForYour')}
              right={
                <GlassButton
                  onPress={() => navigation.navigate(MACHINERY_ROUTES.HOME)}
                >
                  <Tractor size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat value={waiting} label={t('myMachineryBookings.waiting')} />
                <HeroStat value={confirmed} label={t('myMachineryBookings.confirmed')} />
                <HeroStat
                  value={toRate || total}
                  label={toRate ? t('myMachineryBookings.toRate') : t('myMachineryBookings.showing')}
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
              title={t('myMachineryBookings.couldntLoadYourRentals')}
              message={error}
              actionLabel={t('myMachineryBookings.tryAgain')}
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<CalendarCheck size={30} color={C.green} />}
              title={t('myMachineryBookings.noRentalsHere')}
              message={t('myMachineryBookings.rentATractorRotavatorOr')}
              actionLabel={t('myMachineryBookings.findMachinery')}
              onAction={() => navigation.navigate(MACHINERY_ROUTES.HOME)}
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
