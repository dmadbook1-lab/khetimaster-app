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
import { CircleCheck, CircleX, Inbox, Warehouse } from 'lucide-react-native';
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
  MarketButton,
} from '../../components/market/MarketBits';
import NoteSheet from '../../components/market/NoteSheet';
import { MARKET_COLORS as C } from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import RentalCard from '../../components/machinery/RentalCard';
import { MACHINERY_ROUTES } from '../../constants/machineryRoutes';
import {
  fetchMachineryRequests,
  updateMachineryBooking,
} from '../../redux/slices/machineryBookingSlice';
import { fetchMyMachinery } from '../../redux/slices/machinerySlice';
import { isAcceptedStatus } from '../../utils/machineryFormat';
import { formatDay } from '../../utils/indiaSchedule';
import { formatRupees } from '../../utils/marketFormat';

const STATUS_FILTERS = [
  { key: 'active', label: 'Open' },
  { key: 'pending', label: 'New' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rejected', label: 'Declined' },
  { key: 'all', label: 'All' },
];

const PAGE_SIZE = 20;

export default function MachineryRequestsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.machineryBooking.requests);
  const actionInProgress = useSelector(
    state => state.machineryBooking.actionInProgress,
  );
  const { mine, mineStatus } = useSelector(state => state.machinery);

  const [status, setStatus] = useState('active');
  const [machineryId, setMachineryId] = useState(
    route?.params?.machineryId || '',
  );
  // booking being declined in the sheet
  const [declining, setDeclining] = useState(null);
  const [sheetError, setSheetError] = useState(null);

  const params = useMemo(
    () => ({ status, machineryId, limit: PAGE_SIZE }),
    [status, machineryId],
  );

  const load = useCallback(
    () => dispatch(fetchMachineryRequests({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useFocusEffect(
    useCallback(() => {
      load();
      dispatch(fetchMyMachinery());
    }, [dispatch, load]),
  );

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    dispatch(
      fetchMachineryRequests({
        params: { ...params, page: page + 1 },
        append: true,
      }),
    );
  };

  const accept = booking =>
    feedback.confirm({
      title: 'Confirm this rental?',
      message: `${booking.machinery?.name} for ${
        booking.farmer?.fullName || 'the farmer'
      } on ${formatDay(booking.bookingDate, { year: false })}, ${formatRupees(
        booking.totalAmount,
      )}. Other requests for the same time will be declined.`,
      confirmLabel: 'Confirm Rental',
      onConfirm: async () => {
        try {
          await dispatch(
            updateMachineryBooking({
              bookingId: booking._id,
              action: 'accept',
            }),
          ).unwrap();
          toast.show('Confirmed. The farmer can now call you.');
          // overlapping requests were declined automatically
          load();
        } catch (failure) {
          feedback.error('Could not confirm', String(failure));
          load();
        }
      },
    });

  const handleDecline = async ({ text }) => {
    try {
      await dispatch(
        updateMachineryBooking({
          bookingId: declining._id,
          action: 'reject',
          note: text,
        }),
      ).unwrap();
      setDeclining(null);
      toast.show('Request declined');
    } catch (failure) {
      setSheetError(String(failure));
    }
  };

  const machineOptions = useMemo(
    () => [
      { key: '', label: 'All machines' },
      ...mine.map(machine => ({ key: machine._id, label: machine.name })),
    ],
    [mine],
  );

  const newCount = items.filter(item => item.status === 'pending').length;
  const confirmedCount = items.filter(item =>
    isAcceptedStatus(item.status),
  ).length;
  const noMachines = mineStatus === 'loaded' && mine.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : noMachines ? [] : items}
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
              footer={
                item.status === 'pending' ? (
                  <View style={styles.quickActions}>
                    <MarketButton
                      variant="danger"
                      label="Decline"
                      icon={<CircleX size={15} color={C.red} />}
                      disabled={!!actionInProgress}
                      onPress={() => {
                        setSheetError(null);
                        setDeclining(item);
                      }}
                      style={styles.quickButton}
                    />
                    <MarketButton
                      label="Confirm"
                      icon={<CircleCheck size={15} color={C.white} />}
                      disabled={!!actionInProgress}
                      onPress={() => accept(item)}
                      style={styles.quickButton}
                    />
                  </View>
                ) : null
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
              gradient="amber"
              onBack={() => navigation.goBack()}
              eyebrow="Machine owner"
              title="Rental Requests"
              subtitle={
                newCount
                  ? `${newCount} ${
                      newCount === 1 ? 'farmer wants' : 'farmers want'
                    } to rent your machines`
                  : 'Farmers who want to rent your machines'
              }
              right={
                <GlassButton
                  onPress={() =>
                    navigation.navigate(MACHINERY_ROUTES.MY_MACHINERY)
                  }
                >
                  <Warehouse size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat
                  value={newCount}
                  label="New"
                  highlight={newCount > 0}
                />
                <HeroStat value={confirmedCount} label="Confirmed" />
                <HeroStat value={total} label="Showing" />
              </View>
            </MarketHero>

            {!noMachines && (
              <>
                {mine.length > 1 && (
                  <View style={styles.filters}>
                    <ChipRow
                      options={machineOptions}
                      value={machineryId}
                      onChange={setMachineryId}
                    />
                  </View>
                )}
                <View style={styles.filters}>
                  <ChipRow
                    options={STATUS_FILTERS}
                    value={status}
                    onChange={setStatus}
                  />
                </View>
              </>
            )}
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
          noMachines ? (
            <EmptyState
              icon={<Warehouse size={30} color={C.green} />}
              title="List your first machine"
              message="Farmers can send you rental requests once your machine is listed."
              actionLabel="Add Machine"
              onAction={() => navigation.navigate(MACHINERY_ROUTES.FORM)}
            />
          ) : loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              title="Couldn't load requests"
              message={error}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Inbox size={30} color={C.green} />}
              title="No requests here"
              message="Keep your machines available so farmers nearby can book them."
              actionLabel="Add Another Machine"
              onAction={() => navigation.navigate(MACHINERY_ROUTES.FORM)}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={C.green} style={styles.footerLoader} />
          ) : null
        }
      />

      <NoteSheet
        visible={!!declining}
        title="Decline this request?"
        description="The farmer will see that you declined. Add a reason if you like."
        placeholder="Reason (optional), e.g. Machine under repair"
        submitLabel="Decline Request"
        variant="danger"
        loading={actionInProgress === 'reject'}
        serverError={sheetError}
        onClose={() => setDeclining(null)}
        onSubmit={handleDecline}
      />

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} bottomOffset={30} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  header: { marginBottom: 14 },
  item: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  filters: { paddingHorizontal: 16, marginTop: 14 },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickButton: { flex: 1, height: 44 },
  footerLoader: { marginVertical: 16 },
});
