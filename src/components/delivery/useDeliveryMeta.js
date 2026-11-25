import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {fetchDeliveryMeta} from '../../redux/slices/deliverySlice';

// Used when the meta endpoint fails or returns no vehicles, so a driver can
// always pick a vehicle type. Rates are only suggestions the driver can edit.
export const FALLBACK_VEHICLE_TYPES = [
  {key: 'bike', capacityKg: 20, baseFare: 30, perKmRate: 8, minFare: 40},
  {key: 'auto', capacityKg: 300, baseFare: 80, perKmRate: 14, minFare: 120},
  {key: 'mini_truck', capacityKg: 750, baseFare: 150, perKmRate: 18, minFare: 250},
  {key: 'pickup', capacityKg: 1500, baseFare: 250, perKmRate: 22, minFare: 400},
  {key: 'tractor_trolley', capacityKg: 3000, baseFare: 400, perKmRate: 28, minFare: 600},
  {key: 'truck', capacityKg: 8000, baseFare: 800, perKmRate: 40, minFare: 1200},
];

/*
 * Options from GET /api/delivery/partners/meta, loaded once and cached.
 */
export default function useDeliveryMeta() {
  const dispatch = useDispatch();
  const {meta, metaLoading, metaError} = useSelector(state => state.delivery);

  useEffect(() => {
    if (!meta.vehicleTypes.length && !metaLoading && !metaError) {
      dispatch(fetchDeliveryMeta());
    }
  }, [dispatch, meta.vehicleTypes.length, metaLoading, metaError]);

  const vehicleTypes = meta.vehicleTypes.length ? meta.vehicleTypes : FALLBACK_VEHICLE_TYPES;

  return {...meta, vehicleTypes, metaLoading, metaError};
}
