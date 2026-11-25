import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {
  ArrowRight,
  IndianRupee,
  Inbox,
  PackageCheck,
  Pencil,
  Power,
  Star,
  Truck,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import MarketHero, {GlassButton, HeroStat, TopInset} from '../../components/market/MarketHero';
import {EmptyState, LoadingState, MarketButton, SegmentTabs} from '../../components/market/MarketBits';
import {MARKET_COLORS as C, MARKET_SHADOW} from '../../components/market/theme';
import FeedbackModal, {useFeedbackModal} from '../../components/common/FeedbackModal';
import DeliveryBookingCard from '../../components/delivery/DeliveryBookingCard';
import VehicleBadge from '../../components/delivery/VehicleBadge';
import {vehicleLabel} from '../../components/delivery/vehicles';
import {DELIVERY_ROUTES} from '../../constants/deliveryRoutes';
import {updateDeliveryLocationApi} from '../../api/deliveryApi';
import {
  fetchDeliveryRequests,
  fetchMyDeliveryPartner,
  setDeliveryOnline,
  setDeliveryPartnerActive,
  updateDeliveryBooking,
} from '../../redux/slices/deliverySlice';
import getCurrentCoordinates from '../../utils/getCurrentCoordinates';
import {formatWeight} from '../../utils/deliveryFormat';
import {formatRupees} from '../../utils/marketFormat';

const LOCATION_MS = 60000;
const POLL_MS = 20000;

const TAB_STATUS = {requests: 'requested', trips: 'on_trip', history: 'past'};

export default function DriverDashboardScreen({navigation}) {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const feedback = useFeedbackModal();

  const {myPartner, myPartnerStatus, togglingOnline, requests, updating} = useSelector(
    state => state.delivery,
  );

  const [tab, setTab] = useState('requests');
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(
    () =>
      Promise.all([
        dispatch(fetchMyDeliveryPartner()),
        dispatch(fetchDeliveryRequests({params: {status: TAB_STATUS[tab], limit: 50}})),
      ]),
    [dispatch, tab],
  );

  useFocusEffect(
    useCallback(() => {
      loadAll();
      // new requests arrive while the driver is watching
      const timer = setInterval(loadAll, POLL_MS);
      return () => clearInterval(timer);
    }, [loadAll]),
  );

  // Not registered yet -> registration form.
  useEffect(() => {
    if (myPartnerStatus === 'missing') {
      navigation.replace(DELIVERY_ROUTES.DRIVER_FORM);
    }
  }, [myPartnerStatus, navigation]);

  const isOnline = !!myPartner?.isOnline;
  const isActive = myPartner?.isActive !== false;

  /*
   * While online, share location so customers see how far away the
   * driver is.
   */
  useEffect(() => {
    if (!isOnline) return undefined;

    let stopped = false;
    const push = async () => {
      const coords = await getCurrentCoordinates();
      if (!stopped && coords) {
        updateDeliveryLocationApi({lat: coords.latitude, lng: coords.longitude}).catch(() => {});
      }
    };

    push();
    const timer = setInterval(push, LOCATION_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [isOnline]);

  const toggleOnline = async value => {
    try {
      let location;
      if (value) {
        const coords = await getCurrentCoordinates();
        if (coords) location = {lat: coords.latitude, lng: coords.longitude};
      }
      await dispatch(setDeliveryOnline({isOnline: value, location})).unwrap();
      dispatch(fetchDeliveryRequests({params: {status: TAB_STATUS[tab], limit: 50}}));
    } catch (message) {
      feedback.error(t('delivery.driverDash.statusFailed'), message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const quickAction = (booking, action) => {
    const accept = action === 'accept';
    feedback.confirm({
      title: accept ? t('delivery.trip.acceptTitle') : t('delivery.trip.rejectTitle'),
      message: accept
        ? t('delivery.driverDash.acceptQuick', {amount: formatRupees(booking.totalAmount)})
        : t('delivery.trip.rejectText'),
      confirmLabel: accept ? t('delivery.trip.accept') : t('delivery.trip.reject'),
      destructive: !accept,
      onConfirm: async () => {
        try {
          await dispatch(updateDeliveryBooking({bookingId: booking._id, action})).unwrap();
          await loadAll();
          if (accept) navigation.navigate(DELIVERY_ROUTES.TRIP, {bookingId: booking._id});
        } catch (message) {
          feedback.error(t('delivery.trip.actionFailed'), message);
        }
      },
    });
  };

  const toggleActive = () => {
    feedback.confirm({
      title: isActive ? t('delivery.driverDash.deactivateTitle') : t('delivery.driverDash.activateTitle'),
      message: isActive ? t('delivery.driverDash.deactivateText') : t('delivery.driverDash.activateText'),
      confirmLabel: isActive ? t('delivery.driverDash.deactivate') : t('delivery.driverDash.activate'),
      destructive: isActive,
      onConfirm: async () => {
        try {
          await dispatch(setDeliveryPartnerActive(!isActive)).unwrap();
        } catch (message) {
          feedback.error(t('delivery.driverDash.statusFailed'), message);
        }
      },
    });
  };

  if (!myPartner) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <TopInset />
        {myPartnerStatus === 'error' ? (
          <EmptyState
            icon={<Truck size={30} color={C.green} />}
            title={t('delivery.driverDash.loadFailed')}
            actionLabel={t('delivery.tryAgain')}
            onAction={loadAll}
          />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const earnings = myPartner.earnings || {};

  const header = (
    <View>
      <MarketHero
        gradient={isOnline ? 'green' : 'slate'}
        onBack={() => navigation.goBack()}
        eyebrow={t('delivery.driverDash.eyebrow')}
        title={myPartner.fullName}
        subtitle={`${vehicleLabel(myPartner.vehicleType)} · ${myPartner.vehicleNumber} · ${formatWeight(
          myPartner.capacityKg,
        )}`}
        right={
          <GlassButton onPress={() => navigation.navigate(DELIVERY_ROUTES.DRIVER_FORM)}>
            <Pencil size={18} color={C.white} />
          </GlassButton>
        }>
        <View style={styles.statRow}>
          <HeroStat value={formatRupees(earnings.today || 0)} label={t('delivery.driverDash.today')} highlight />
          <HeroStat value={earnings.tripsToday || 0} label={t('delivery.driverDash.tripsToday')} />
          <HeroStat
            value={myPartner.totalReviews ? `${myPartner.rating}★` : '—'}
            label={t('delivery.driverDash.rating')}
          />
        </View>
      </MarketHero>

      <View style={styles.section}>
        {/* ONLINE SWITCH */}
        <View style={[styles.onlineCard, isOnline && styles.onlineCardOn]}>
          <View style={[styles.powerIcon, isOnline && styles.powerIconOn]}>
            <Power size={20} color={isOnline ? C.white : C.muted} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.onlineTitle}>
              {!isActive
                ? t('delivery.driverDash.inactive')
                : isOnline
                ? t('delivery.driverDash.online')
                : t('delivery.driverDash.offline')}
            </Text>
            <Text style={styles.onlineText}>
              {!isActive
                ? t('delivery.driverDash.inactiveText')
                : isOnline
                ? t('delivery.driverDash.onlineText', {district: myPartner.district})
                : t('delivery.driverDash.offlineText')}
            </Text>
          </View>
          {togglingOnline ? (
            <ActivityIndicator color={C.green} />
          ) : (
            <Switch
              value={isOnline}
              disabled={!isActive}
              onValueChange={toggleOnline}
              trackColor={{false: '#D0D7D3', true: '#8ED9AA'}}
              thumbColor={isOnline ? C.green : '#FFFFFF'}
            />
          )}
        </View>

        {/* CURRENT TRIP */}
        {!!myPartner.currentTripId && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.currentTrip}
            onPress={() =>
              navigation.navigate(DELIVERY_ROUTES.TRIP, {bookingId: myPartner.currentTripId})
            }>
            <Truck size={20} color={C.white} />
            <Text style={styles.currentText}>{t('delivery.driverDash.currentTrip')}</Text>
            <ArrowRight size={16} color={C.white} />
          </TouchableOpacity>
        )}

        {/* TOTALS */}
        <View style={styles.totals}>
          <View style={styles.totalBox}>
            <IndianRupee size={16} color={C.green} />
            <Text style={styles.totalValue}>{formatRupees(earnings.total || 0)}</Text>
            <Text style={styles.totalLabel}>{t('delivery.driverDash.totalEarned')}</Text>
          </View>
          <View style={styles.totalBox}>
            <PackageCheck size={16} color={C.blue} />
            <Text style={styles.totalValue}>{myPartner.totalTrips || 0}</Text>
            <Text style={styles.totalLabel}>{t('delivery.details.tripsDone')}</Text>
          </View>
          <View style={styles.totalBox}>
            <Star size={16} color={C.gold} />
            <Text style={styles.totalValue}>{myPartner.totalReviews || 0}</Text>
            <Text style={styles.totalLabel}>{t('delivery.driverDash.ratings')}</Text>
          </View>
        </View>

        <View style={styles.vehicleRow}>
          <VehicleBadge type={myPartner.vehicleType} size={36} />
          <Text style={styles.vehicleText}>
            {t('delivery.driverDash.rates', {
              base: formatRupees(myPartner.baseFare),
              perKm: formatRupees(myPartner.perKmRate),
              min: formatRupees(myPartner.minFare),
            })}
          </Text>
        </View>

        <View style={styles.tabs}>
          <SegmentTabs
            value={tab}
            onChange={setTab}
            options={[
              {
                key: 'requests',
                label: myPartner.pendingRequests
                  ? t('delivery.driverDash.requestsCount', {count: myPartner.pendingRequests})
                  : t('delivery.driverDash.requests'),
              },
              {key: 'trips', label: t('delivery.driverDash.trips')},
              {key: 'history', label: t('delivery.driverDash.history')},
            ]}
          />
        </View>
      </View>
    </View>
  );

  const footer = (
    <View style={styles.section}>
      <TouchableOpacity style={styles.deactivate} onPress={toggleActive}>
        <Text style={[styles.deactivateText, !isActive && styles.activateText]}>
          {isActive ? t('delivery.driverDash.deactivate') : t('delivery.driverDash.activate')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <FlatList
        data={requests.loading && !refreshing && !requests.items.length ? [] : requests.items}
        keyExtractor={item => item._id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[C.green]} tintColor={C.white} />
        }
        renderItem={({item}) => (
          <View style={styles.item}>
            <DeliveryBookingCard
              booking={item}
              onPress={() => navigation.navigate(DELIVERY_ROUTES.TRIP, {bookingId: item._id})}
              footer={
                item.status === 'requested' ? (
                  <View style={styles.quickRow}>
                    <MarketButton
                      label={t('delivery.trip.reject')}
                      variant="outline"
                      disabled={updating}
                      onPress={() => quickAction(item, 'reject')}
                      style={styles.flex}
                    />
                    <MarketButton
                      label={t('delivery.trip.accept')}
                      disabled={updating}
                      onPress={() => quickAction(item, 'accept')}
                      style={styles.flex}
                    />
                  </View>
                ) : null
              }
            />
          </View>
        )}
        ListEmptyComponent={
          requests.loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={<Inbox size={30} color={C.green} />}
              title={
                requests.error
                  ? t('delivery.driverDash.loadFailed')
                  : t(`delivery.driverDash.empty.${tab}`)
              }
              message={
                requests.error ||
                (tab === 'requests' && !isOnline
                  ? t('delivery.driverDash.goOnlineHint')
                  : t('delivery.driverDash.emptyText'))
              }
            />
          )
        }
      />
      <FeedbackModal {...feedback.modalProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  list: {paddingBottom: 40},
  section: {paddingHorizontal: 16},
  item: {paddingHorizontal: 16},
  flex: {flex: 1},
  statRow: {flexDirection: 'row', gap: 8, marginTop: 16},

  onlineCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    ...MARKET_SHADOW,
  },
  onlineCardOn: {borderColor: C.green, backgroundColor: C.lightGreen},
  powerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF1EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerIconOn: {backgroundColor: C.green},
  onlineTitle: {fontSize: 15, fontWeight: '900', color: C.dark},
  onlineText: {fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 2, lineHeight: 16},

  currentTrip: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: C.orange,
  },
  currentText: {flex: 1, color: C.white, fontSize: 14, fontWeight: '900'},

  totals: {flexDirection: 'row', gap: 10, marginTop: 12},
  totalBox: {flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 12, ...MARKET_SHADOW},
  totalValue: {fontSize: 15, fontWeight: '900', color: C.dark, marginTop: 6},
  totalLabel: {fontSize: 10.5, fontWeight: '700', color: C.muted, marginTop: 2},

  vehicleRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.white,
  },
  vehicleText: {flex: 1, fontSize: 11.5, fontWeight: '700', color: C.text, lineHeight: 16},

  tabs: {marginTop: 18, marginBottom: 14},
  quickRow: {flexDirection: 'row', gap: 10, marginTop: 12},
  deactivate: {alignItems: 'center', paddingVertical: 16},
  deactivateText: {fontSize: 12.5, fontWeight: '800', color: C.red},
  activateText: {color: C.green},
});
