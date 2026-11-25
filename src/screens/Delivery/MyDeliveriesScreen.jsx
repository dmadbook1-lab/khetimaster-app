import React, {useCallback, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {Package} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import MarketHeader from '../../components/market/MarketHeader';
import {EmptyState, LoadingState, SegmentTabs} from '../../components/market/MarketBits';
import {MARKET_COLORS as C} from '../../components/market/theme';
import DeliveryBookingCard from '../../components/delivery/DeliveryBookingCard';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {fetchMyDeliveries} from '../../redux/slices/deliverySlice';

/*
 * Customer's deliveries: active (requested -> picked up) and past.
 */
export default function MyDeliveriesScreen({navigation}) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {items, loading, error} = useSelector(state => state.delivery.myDeliveries);

  const [tab, setTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    () => dispatch(fetchMyDeliveries({params: {status: tab, limit: 50}})),
    [dispatch, tab],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <MarketHeader
        title={t('delivery.my.title')}
        subtitle={t('delivery.my.subtitle')}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.tabs}>
        <SegmentTabs
          value={tab}
          onChange={setTab}
          options={[
            {key: 'active', label: t('delivery.my.active')},
            {key: 'past', label: t('delivery.my.past')},
          ]}
        />
      </View>

      <FlatList
        data={loading && !refreshing ? [] : items}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <DeliveryBookingCard
            booking={item}
            onPress={() => navigation.navigate(DELIVERY_ROUTES.TRIP, {bookingId: item._id})}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[C.green]} />
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={<Package size={30} color={C.green} />}
              title={
                error
                  ? t('delivery.my.loadFailed')
                  : tab === 'active'
                  ? t('delivery.my.noActive')
                  : t('delivery.my.noPast')
              }
              message={error || t('delivery.my.emptyText')}
              actionLabel={error ? t('delivery.tryAgain') : t('delivery.my.bookNow')}
              onAction={error ? load : () => navigation.navigate(DELIVERY_ROUTES.HOME)}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  tabs: {paddingHorizontal: 16, paddingTop: 14},
  list: {padding: 16, paddingBottom: 40},
});
