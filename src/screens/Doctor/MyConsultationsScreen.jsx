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
import { CalendarCheck, Stethoscope } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import CareHero, {
  CareGlassButton,
  CareStat,
} from '../../components/doctor/CareHero';
import { TopInset } from '../../components/market/MarketHero';
import {
  CareChips,
  CareEmpty,
  CareLoading,
} from '../../components/doctor/CareBits';
import { CARE as C } from '../../components/doctor/careTheme';
import ConsultationCard from '../../components/doctor/ConsultationCard';
import { DOCTOR_ROUTES } from '../../constants/doctorRoutes';
import { fetchMyConsultations } from '../../redux/slices/doctorConsultationSlice';
import { todayInIndiaKey } from '../../utils/indiaSchedule';
import { isAcceptedStatus } from '../../utils/doctorFormat';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';

const STATUS_FILTERS = [
  { key: 'active', get label() {
    return i18n.t('myConsultations.upcoming');
  } },
  { key: 'pending', get label() {
    return i18n.t('myConsultations.requested');
  } },
  { key: 'accepted', get label() {
    return i18n.t('myConsultations.accepted');
  } },
  { key: 'completed', get label() {
    return i18n.t('myConsultations.completed');
  } },
  { key: 'cancelled', get label() {
    return i18n.t('myConsultations.cancelled');
  } },
  { key: 'rejected', get label() {
    return i18n.t('myConsultations.declined');
  } },
  { key: 'all', get label() {
    return i18n.t('myConsultations.all');
  } },
];

const PAGE_SIZE = 20;

export default function MyConsultationsScreen({ navigation }) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const todayKey = todayInIndiaKey();
  const { items, page, totalPages, total, loading, loadingMore, error } =
    useSelector(state => state.doctorConsultation.myConsultations);

  const [status, setStatus] = useState('active');

  const params = useMemo(() => ({ status, limit: PAGE_SIZE }), [status]);

  const load = useCallback(
    () => dispatch(fetchMyConsultations({ params: { ...params, page: 1 } })),
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
      fetchMyConsultations({
        params: { ...params, page: page + 1 },
        append: true,
      }),
    );
  };

  const waiting = items.filter(item => item.status === 'pending').length;
  const accepted = items.filter(item => isAcceptedStatus(item.status)).length;
  const toRate = items.filter(item => item.canReview).length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={loading && !items.length ? [] : items}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ConsultationCard
              consultation={item}
              todayKey={todayKey}
              onPress={() =>
                navigation.navigate(DOCTOR_ROUTES.CONSULTATION, {
                  consultationId: item._id,
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
            <CareHero
              compact
              onBack={() => navigation.goBack()}
              right={
                <CareGlassButton
                  onPress={() => navigation.navigate(DOCTOR_ROUTES.LIST)}
                >
                  <Stethoscope size={19} color={C.white} />
                </CareGlassButton>
              }
              eyebrow={t('myConsultations.yourHealthDesk')}
              title={t('myConsultations.consultations')}
              subtitle={t('myConsultations.requestsYouSentToVets')}
            >
              <View style={styles.statsRow}>
                <CareStat value={waiting} label={t('myConsultations.waiting')} />
                <CareStat value={accepted} label={t('myConsultations.accepted')} />
                <CareStat
                  value={toRate || total}
                  label={toRate ? t('myConsultations.toRate') : t('myConsultations.showing')}
                  highlight={toRate > 0}
                />
              </View>
            </CareHero>

            <CareChips
              scroll
              options={STATUS_FILTERS}
              value={status}
              onChange={setStatus}
              style={styles.filters}
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
              title={t('myConsultations.couldntLoadYourConsultations')}
              message={error}
              actionLabel={t('myConsultations.tryAgain')}
              onAction={load}
            />
          ) : (
            <CareEmpty
              icon={<CalendarCheck size={30} color={C.teal} />}
              title={t('myConsultations.noConsultationsHere')}
              message={t('myConsultations.bookAVetForYour')}
              actionLabel={t('myConsultations.findADoctor')}
              onAction={() => navigation.navigate(DOCTOR_ROUTES.LIST)}
            />
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={C.teal} style={styles.footerLoader} />
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
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  filters: { paddingHorizontal: 16, marginTop: 16 },
  footerLoader: { marginVertical: 16 },
});
