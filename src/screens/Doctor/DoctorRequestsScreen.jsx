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
import { CircleCheck, CircleX, Inbox } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero, { CareStat } from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareButton,
  CareChips,
  CareEmpty,
  CareLoading,
} from '../../components/doctor/CareBits';
import { CARE as C } from '../../components/doctor/careTheme';
import CareSheet from '../../components/doctor/CareSheet';
import ConsultationCard from '../../components/doctor/ConsultationCard';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import {
  fetchDoctorRequests,
  updateConsultation,
} from '../../redux/slices/doctorConsultationSlice';
import {
  addDaysToKey,
  dayKeyOf,
  todayInIndiaKey,
} from '../../utils/indiaSchedule';
import { isAcceptedStatus } from '../../utils/doctorFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'pending', get label() {
    return i18n.t('doctorRequests.new');
  } },
  { key: 'accepted', get label() {
    return i18n.t('doctorRequests.accepted');
  } },
  { key: 'active', get label() {
    return i18n.t('doctorRequests.allOpen');
  } },
  { key: 'completed', get label() {
    return i18n.t('doctorRequests.completed');
  } },
  { key: 'cancelled', get label() {
    return i18n.t('doctorRequests.cancelled');
  } },
  { key: 'rejected', get label() {
    return i18n.t('doctorRequests.declined');
  } },
  { key: 'all', get label() {
    return i18n.t('doctorRequests.all');
  } },
];

const PAGE_SIZE = 20;

export default function DoctorRequestsScreen({ navigation, route }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();
  const toast = useToast();
  const todayKey = todayInIndiaKey();

  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.doctorConsultation.requests);
  const { actionInProgress, actionTargetId } = useSelector(
    state => state.doctorConsultation,
  );

  const [status, setStatus] = useState(route.params?.status || 'pending');
  const [day, setDay] = useState(route.params?.day || 'any');
  const [declining, setDeclining] = useState(null);
  const [sheetError, setSheetError] = useState(null);

  const dayOptions = [
    { key: 'any', label: t('doctorRequests.anyDay') },
    { key: todayKey, label: t('common.today') },
    { key: addDaysToKey(todayKey, 1), label: t('common.tomorrow') },
  ];
  const dayKey = day === 'today' ? todayKey : day;

  const params = useMemo(
    () => ({
      status,
      date: dayKey === 'any' ? '' : dayKey,
      limit: PAGE_SIZE,
    }),
    [status, dayKey],
  );

  const load = useCallback(() => {
    const clean = Object.fromEntries(
      Object.entries({ ...params, page: 1 }).filter(([, value]) => value),
    );
    return dispatch(fetchDoctorRequests({ params: clean }));
  }, [dispatch, params]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages) return;
    const clean = Object.fromEntries(
      Object.entries({ ...params, page: page + 1 }).filter(
        ([, value]) => value,
      ),
    );
    dispatch(fetchDoctorRequests({ params: clean, append: true }));
  };

  const accept = consultation =>
    feedback.confirm({
      title: t('doctorRequests.acceptThisConsultation'),
      message:
        t('doctorRequests.youAndTheFarmerWill'),
      confirmLabel: t('doctorRequests.accept'),
      onConfirm: async () => {
        try {
          await dispatch(
            updateConsultation({
              consultationId: consultation._id,
              action: 'accept',
            }),
          ).unwrap();
          toast.show(t('doctorRequests.acceptedYouCanNowCall'));
          load();
        } catch (failure) {
          feedback.error('Could not accept', String(failure));
          load();
        }
      },
    });

  const decline = async ({ reason }) => {
    try {
      await dispatch(
        updateConsultation({
          consultationId: declining._id,
          action: 'reject',
          reason,
        }),
      ).unwrap();
      setDeclining(null);
      toast.show(t('doctorRequests.requestDeclined'));
      load();
    } catch (failure) {
      setSheetError(String(failure));
    }
  };

  const newCount = items.filter(item => item.status === 'pending').length;
  const todayCount = items.filter(
    item =>
      isAcceptedStatus(item.status) &&
      dayKeyOf(item.consultationDate) === todayKey,
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : items}
        keyExtractor={item => item._id}
        renderItem={({ item }) => {
          const busy = actionTargetId === item._id && !!actionInProgress;

          return (
            <View style={styles.item}>
              <ConsultationCard
                consultation={item}
                todayKey={todayKey}
                onPress={() =>
                  navigation.navigate(DOCTOR_ROUTES.CONSULTATION, {
                    consultationId: item._id,
                  })
                }
                footer={
                  item.status === 'pending' ? (
                    <View style={styles.quickRow}>
                      <CareButton
                        variant="danger"
                        label={t('doctorRequests.decline')}
                        icon={<CircleX size={15} color={C.red} />}
                        disabled={!!actionInProgress}
                        onPress={() => {
                          setSheetError(null);
                          setDeclining(item);
                        }}
                        style={styles.quickButton}
                      />
                      <CareButton
                        label={t('doctorRequests.accept')}
                        icon={<CircleCheck size={15} color={C.white} />}
                        loading={busy && actionInProgress === 'accept'}
                        disabled={!!actionInProgress}
                        onPress={() => accept(item)}
                        style={[styles.quickButton, styles.quickWide]}
                      />
                    </View>
                  ) : null
                }
              />
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <CareHero
              compact
              onBack={() => navigation.goBack()}
              gradient={newCount ? 'amber' : 'care'}
              eyebrow={t('doctorRequests.doctorDesk')}
              title={newCount ? t('doctorRequests.newRequests', {newCount}) : t('doctorRequests.requests')}
              subtitle={t('doctorRequests.acceptToSharePhoneNumbers')}
            >
              <View style={styles.statsRow}>
                <CareStat
                  value={newCount}
                  label={t('doctorRequests.new')}
                  highlight={newCount > 0}
                />
                <CareStat value={todayCount} label={t('common.today')} />
                <CareStat value={total} label={t('doctorRequests.showing')} />
              </View>
            </CareHero>

            <CareChips
              scroll
              options={STATUS_FILTERS}
              value={status}
              onChange={setStatus}
              style={styles.filters}
            />
            <CareChips
              scroll
              options={dayOptions}
              value={dayKey}
              onChange={setDay}
              style={styles.filtersSecond}
            />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading && items.length > 0}
            onRefresh={load}
            colors={[C.teal]}
            tintColor={C.teal}
          />
        }
        ListEmptyComponent={
          loading ? (
            <CareLoading />
          ) : error ? (
            <CareEmpty
              title={t('doctorRequests.couldntLoadRequests')}
              message={error}
              actionLabel={t('doctorRequests.tryAgain')}
              onAction={load}
            />
          ) : (
            <CareEmpty
              icon={<Inbox size={30} color={C.teal} />}
              title={status === 'pending' ? t('doctorRequests.noNewRequests') : t('doctorRequests.nothingHere')}
              message={t('doctorRequests.keepYourAvailabilityOnSo')}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={C.teal} style={styles.footerLoader} />
          ) : null
        }
      />

      <CareSheet
        visible={!!declining}
        title={t('doctorRequests.declineThisRequest')}
        description={t('doctorRequests.theFarmerWillSeeThat')}
        fields={[
          {
            key: 'reason',
            label: t('doctorRequests.reasonOptional'),
            placeholder: t('doctorRequests.eGIAmTravelling'),
            multiline: true,
          },
        ]}
        submitLabel={t('doctorRequests.declineRequest')}
        variant="danger"
        loading={actionInProgress === 'reject'}
        serverError={sheetError}
        onClose={() => setDeclining(null)}
        onSubmit={decline}
      />

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { paddingBottom: 40 },
  header: { marginBottom: 14 },
  item: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  filters: { paddingHorizontal: 16, marginTop: 16 },
  filtersSecond: { paddingHorizontal: 16, marginTop: 10 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickButton: { flex: 1, height: 44 },
  quickWide: { flex: 1.4 },
  footerLoader: { marginVertical: 16 },
});
