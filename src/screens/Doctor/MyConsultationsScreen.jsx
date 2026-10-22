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

const STATUS_FILTERS = [
  { key: 'active', label: 'Upcoming' },
  { key: 'pending', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'rejected', label: 'Declined' },
  { key: 'all', label: 'All' },
];

const PAGE_SIZE = 20;

export default function MyConsultationsScreen({ navigation }) {
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
              eyebrow="Your health desk"
              title="Consultations"
              subtitle="Requests you sent to vets and crop doctors"
            >
              <View style={styles.statsRow}>
                <CareStat value={waiting} label="Waiting" />
                <CareStat value={accepted} label="Accepted" />
                <CareStat
                  value={toRate || total}
                  label={toRate ? 'To rate' : 'Showing'}
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
              title="Couldn't load your consultations"
              message={error}
              actionLabel="Try Again"
              onAction={load}
            />
          ) : (
            <CareEmpty
              icon={<CalendarCheck size={30} color={C.teal} />}
              title="No consultations here"
              message="Book a vet for your animals or a crop doctor for your fields."
              actionLabel="Find a Doctor"
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
