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
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'active', get label() {
    return i18n.t('machineryRequests.open');
  } },
  { key: 'pending', get label() {
    return i18n.t('machineryRequests.new');
  } },
  { key: 'confirmed', get label() {
    return i18n.t('machineryRequests.confirmed');
  } },
  { key: 'completed', get label() {
    return i18n.t('machineryRequests.completed');
  } },
  { key: 'cancelled', get label() {
    return i18n.t('machineryRequests.cancelled');
  } },
  { key: 'rejected', get label() {
    return i18n.t('machineryRequests.declined');
  } },
  { key: 'all', get label() {
    return i18n.t('machineryRequests.all');
  } },
];

const PAGE_SIZE = 20;

export default function MachineryRequestsScreen({ navigation, route }) {
  const {t} = useTranslation();
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
      title: t('machineryRequests.confirmThisRental'),
      message: t('machineryRequests.forOnOtherRequestsFor', {v1: booking.machinery?.name, v2: booking.farmer?.fullName || t('machineryRequests.theFarmer'), v3: formatDay(booking.bookingDate, { year: false }), v4: formatRupees(
        booking.totalAmount,
      )}),
      confirmLabel: t('machineryRequests.confirmRental'),
      onConfirm: async () => {
        try {
          await dispatch(
            updateMachineryBooking({
              bookingId: booking._id,
              action: 'accept',
            }),
          ).unwrap();
          toast.show(t('machineryRequests.confirmedTheFarmerCanNow'));
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
      toast.show(t('machineryRequests.requestDeclined'));
    } catch (failure) {
      setSheetError(String(failure));
    }
  };

  const machineOptions = useMemo(
    () => [
      { key: '', label: t('machineryRequests.allMachines') },
      ...mine.map(machine => ({ key: machine._id, label: machine.name })),
    ],
    [mine, t],
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
                      label={t('machineryRequests.decline')}
                      icon={<CircleX size={15} color={C.red} />}
                      disabled={!!actionInProgress}
                      onPress={() => {
                        setSheetError(null);
                        setDeclining(item);
                      }}
                      style={styles.quickButton}
                    />
                    <MarketButton
                      label={t('common.confirm')}
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
              eyebrow={t('machineryRequests.machineOwner')}
              title={t('machineryRequests.rentalRequests')}
              subtitle={
                newCount
                  ? t('machineryRequests.toRentYourMachines', {newCount, v2: newCount === 1 ? t('machineryRequests.farmerWants') : t('machineryRequests.farmersWant')})
                  : t('machineryRequests.farmersWhoWantToRent')
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
                  label={t('machineryRequests.new')}
                  highlight={newCount > 0}
                />
                <HeroStat value={confirmedCount} label={t('machineryRequests.confirmed')} />
                <HeroStat value={total} label={t('machineryRequests.showing')} />
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
              title={t('machineryRequests.listYourFirstMachine')}
              message={t('machineryRequests.farmersCanSendYouRental')}
              actionLabel={t('machineryRequests.addMachine')}
              onAction={() => navigation.navigate(MACHINERY_ROUTES.FORM)}
            />
          ) : loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              title={t('machineryRequests.couldntLoadRequests')}
              message={error}
              actionLabel={t('machineryRequests.tryAgain')}
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Inbox size={30} color={C.green} />}
              title={t('machineryRequests.noRequestsHere')}
              message={t('machineryRequests.keepYourMachinesAvailableSo')}
              actionLabel={t('machineryRequests.addAnotherMachine')}
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
        title={t('machineryRequests.declineThisRequest')}
        description={t('machineryRequests.theFarmerWillSeeThat')}
        placeholder={t('machineryRequests.reasonOptionalEGMachine')}
        submitLabel={t('machineryRequests.declineRequest')}
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
