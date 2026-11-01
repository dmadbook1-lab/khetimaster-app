import { useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { loadMyFarms, selectFarmFields } from '../redux/slices/farmFieldSlice';
import { fetchMyNurseryOrders } from '../redux/slices/nurseryOrderSlice';
import { fetchMyMachineryBookings } from '../redux/slices/machineryBookingSlice';
import { fetchMyLabourBookings } from '../redux/slices/labourBookingSlice';
import { fetchMyConsultations } from '../redux/slices/doctorConsultationSlice';
import { fetchMyMarketDeals } from '../redux/slices/marketDealSlice';
import { fetchAiGuruSessions, selectAiGuru } from '../redux/slices/aiGuruSlice';

// Booking / consultation states that still need the farmer's attention
const OPEN_BOOKING = ['pending', 'accepted', 'confirmed', 'ongoing', 'started'];
const CLOSED_ORDER = ['DELIVERED', 'CANCELLED'];
const OPEN_DEAL = ['PENDING', 'ACCEPTED'];

const countWhere = (items = [], test) => items.filter(test).length;

/*
 * Live numbers for the sidebar and profile: farms, acres, crops, and how
 * many orders / bookings / deals are still open. Refetches every time the
 * screen comes into focus; call `refresh` for pull-to-refresh.
 */
export default function useAccountSummary() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const farms = useSelector(selectFarmFields);
  const farmsLoading = useSelector(state => state.farmField.loading);
  const orders = useSelector(state => state.nurseryOrder.myOrders);
  const machinery = useSelector(state => state.machineryBooking.myBookings);
  const labour = useSelector(state => state.labourBooking.myBookings);
  const consultations = useSelector(
    state => state.doctorConsultation.myConsultations,
  );
  const deals = useSelector(state => state.marketDeal.deals);
  const { sessions } = useSelector(selectAiGuru);

  const userId = user?._id || user?.id || user?.userId;

  const refresh = useCallback(() => {
    if (!userId) return;

    dispatch(loadMyFarms(userId));
    dispatch(fetchMyNurseryOrders());
    dispatch(fetchMyMachineryBookings());
    dispatch(fetchMyLabourBookings());
    dispatch(fetchMyConsultations());
    dispatch(fetchMyMarketDeals());
    dispatch(fetchAiGuruSessions());
  }, [dispatch, userId]);

  useFocusEffect(refresh);

  const summary = useMemo(() => {
    const totalAcres = farms.reduce(
      (sum, farm) => sum + (Number(farm?.acre) || 0),
      0,
    );
    const crops = [
      ...new Set(
        farms
          .filter(farm => !farm?.isBarrenLand && farm?.cropName)
          .map(farm => String(farm.cropName).trim()),
      ),
    ];
    const isOpen = item =>
      OPEN_BOOKING.includes(String(item?.status).toLowerCase());

    return {
      farms,
      farmCount: farms.length,
      totalAcres,
      crops,
      activeOrders: countWhere(
        orders.items,
        item => !CLOSED_ORDER.includes(String(item?.status).toUpperCase()),
      ),
      totalOrders: orders.total || orders.items.length,
      activeMachinery: countWhere(machinery.items, isOpen),
      activeLabour: countWhere(labour.items, isOpen),
      activeConsultations: countWhere(consultations.items, isOpen),
      activeDeals: countWhere(deals, item =>
        OPEN_DEAL.includes(String(item?.status).toUpperCase()),
      ),
      aiChats: sessions.length,
    };
  }, [farms, orders, machinery, labour, consultations, deals, sessions]);

  const refreshing =
    farmsLoading ||
    orders.loading ||
    machinery.loading ||
    labour.loading ||
    consultations.loading;

  return { user, ...summary, refresh, refreshing };
}
