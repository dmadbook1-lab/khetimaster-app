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
import { CircleCheck, CircleX, Inbox, UserRound } from 'lucide-react-native';
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
import LabourBookingCard from '../../components/labour/LabourBookingCard';
import { LABOUR_ROUTES } from '../../constants/labourRoutes';
import {
  fetchLabourRequests,
  updateLabourBooking,
} from '../../redux/slices/labourBookingSlice';
import { fetchMyLabourerProfile } from '../../redux/slices/labourerSlice';
import { formatDateRange, isAcceptedStatus } from '../../utils/labourFormat';
import { formatRupees } from '../../utils/marketFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'active', get label() {
    return i18n.t('labourRequests.open');
  } },
  { key: 'pending', get label() {
    return i18n.t('labourRequests.new');
  } },
  { key: 'accepted', get label() {
    return i18n.t('labourRequests.accepted');
  } },
  { key: 'completed', get label() {
    return i18n.t('labourRequests.completed');
  } },
  { key: 'cancelled', get label() {
    return i18n.t('labourRequests.cancelled');
  } },
  { key: 'rejected', get label() {
    return i18n.t('labourRequests.declined');
  } },
  { key: 'all', get label() {
    return i18n.t('labourRequests.all');
  } },
];

const PAGE_SIZE = 20;

export default function LabourRequestsScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const toast = useToast();

  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.labourBooking.requests);
  const actionInProgress = useSelector(
    state => state.labourBooking.actionInProgress,
  );
  const { myProfileStatus } = useSelector(state => state.labourer);

  const [status, setStatus] = useState('active');
  // booking being declined in the sheet
  const [declining, setDeclining] = useState(null);
  const [sheetError, setSheetError] = useState(null);

  const params = useMemo(() => ({ status, limit: PAGE_SIZE }), [status]);

  const load = useCallback(
    () => dispatch(fetchLabourRequests({ params: { ...params, page: 1 } })),
    [dispatch, params],
  );

  useFocusEffect(
    useCallback(() => {
      load();
      dispatch(fetchMyLabourerProfile());
    }, [dispatch, load]),
  );

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    dispatch(
      fetchLabourRequests({
        params: { ...params, page: page + 1 },
        append: true,
      }),
    );
  };

  const accept = booking =>
    feedback.confirm({
      title: t('labourRequests.acceptThisWork'),
      message: t('labourRequests.forOnOtherRequestsFor', {workType: booking.workType, v2: booking.farmer?.fullName || t('labourRequests.theFarmer'), v3: formatDateRange(
        booking.bookingDate,
        booking.numberOfDays,
      ), v4: formatRupees(
        booking.totalAmount,
      )}),
      confirmLabel: t('labourRequests.acceptWork'),
      onConfirm: async () => {
        try {
          await dispatch(
            updateLabourBooking({ bookingId: booking._id, action: 'accept' }),
          ).unwrap();
          toast.show(t('labourRequests.acceptedTheFarmerCanNow'));
          // other requests on the same dates were auto-declined
          load();
        } catch (failure) {
          feedback.error('Could not accept', String(failure));
          load();
        }
      },
    });

  const handleDecline = async ({ text }) => {
    try {
      await dispatch(
        updateLabourBooking({
          bookingId: declining._id,
          action: 'reject',
          reason: text,
        }),
      ).unwrap();
      setDeclining(null);
      toast.show(t('labourRequests.requestDeclined'));
    } catch (failure) {
      setSheetError(String(failure));
    }
  };

  const newCount = items.filter(item => item.status === 'pending').length;
  const acceptedCount = items.filter(item =>
    isAcceptedStatus(item.status),
  ).length;
  const notRegistered = myProfileStatus === 'missing';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : notRegistered ? [] : items}
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
              footer={
                item.status === 'pending' ? (
                  <View style={styles.quickActions}>
                    <MarketButton
                      variant="danger"
                      label={t('labourRequests.decline')}
                      icon={<CircleX size={15} color={C.red} />}
                      disabled={!!actionInProgress}
                      onPress={() => {
                        setSheetError(null);
                        setDeclining(item);
                      }}
                      style={styles.quickButton}
                    />
                    <MarketButton
                      label={t('labourRequests.accept')}
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
              eyebrow={t('labourRequests.findWork')}
              title={t('labourRequests.workRequests')}
              subtitle={
                newCount
                  ? t('labourRequests.toHireYou', {newCount, v2: newCount === 1 ? t('labourRequests.farmerWants') : t('labourRequests.farmersWant')})
                  : t('labourRequests.farmersWhoWantToHire')
              }
              right={
                <GlassButton
                  onPress={() => navigation.navigate(LABOUR_ROUTES.MY_PROFILE)}
                >
                  <UserRound size={19} color={C.white} />
                </GlassButton>
              }
            >
              <View style={styles.statsRow}>
                <HeroStat
                  value={newCount}
                  label={t('labourRequests.new')}
                  highlight={newCount > 0}
                />
                <HeroStat value={acceptedCount} label={t('labourRequests.accepted')} />
                <HeroStat value={total} label={t('labourRequests.showing')} />
              </View>
            </MarketHero>

            {!notRegistered && (
              <View style={styles.filters}>
                <ChipRow
                  options={STATUS_FILTERS}
                  value={status}
                  onChange={setStatus}
                />
              </View>
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
          notRegistered ? (
            <EmptyState
              icon={<UserRound size={30} color={C.green} />}
              title={t('labourRequests.createYourWorkerProfile')}
              message={t('labourRequests.farmersCanOnlySendYou')}
              actionLabel={t('labourRequests.createProfile')}
              onAction={() => navigation.navigate(LABOUR_ROUTES.PROFILE_FORM)}
            />
          ) : loading ? (
            <LoadingState />
          ) : error ? (
            <EmptyState
              title={t('labourRequests.couldntLoadRequests')}
              message={error}
              actionLabel={t('labourRequests.tryAgain')}
              onAction={load}
            />
          ) : (
            <EmptyState
              icon={<Inbox size={30} color={C.green} />}
              title={t('labourRequests.noRequestsHere')}
              message={t('labourRequests.keepYourAvailabilityOnSo')}
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
        title={t('labourRequests.declineThisRequest')}
        description={t('labourRequests.theFarmerWillSeeThat')}
        placeholder={t('labourRequests.reasonOptionalEGAlready')}
        submitLabel={t('labourRequests.declineRequest')}
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
  filters: { paddingHorizontal: 16, marginTop: 16 },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickButton: { flex: 1, height: 44 },
  footerLoader: { marginVertical: 16 },
});
