import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from '../../context/LocationContext';
import { fetchLocalWeather } from '../../redux/slices/weatherSlice';

/*
 * Weather for the phone's location, shared by the home card and the
 * Weather screens. Loads once the location is known; repeat calls
 * within 15 minutes are served from the store.
 *
 * Returns {data, status, error, place, locationLoading,
 *          locationMissing, refresh, refreshLocation}
 */
export default function useLocalWeather() {
  const dispatch = useDispatch();
  const {
    location,
    loading: locationLoading,
    refreshLocation,
  } = useLocation() || {};
  const local = useSelector(state => state.weather.local);

  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const hasCoords =
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    latitude !== null &&
    longitude !== null;

  useEffect(() => {
    if (hasCoords) dispatch(fetchLocalWeather({ latitude, longitude }));
  }, [dispatch, hasCoords, latitude, longitude]);

  const refresh = useCallback(() => {
    if (hasCoords) {
      return dispatch(fetchLocalWeather({ latitude, longitude, force: true }));
    }
    refreshLocation?.();
    return Promise.resolve();
  }, [dispatch, hasCoords, latitude, longitude, refreshLocation]);

  const place =
    location?.city ||
    location?.district ||
    String(local.data?.address || '').split(',')[0] ||
    'Your location';

  return {
    data: local.data,
    status: local.status,
    error: local.error,
    fetchedAt: local.fetchedAt,
    place,
    locationLoading: Boolean(locationLoading),
    locationMissing: !locationLoading && !hasCoords,
    refresh,
    refreshLocation,
  };
}
