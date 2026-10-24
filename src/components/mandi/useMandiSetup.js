import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from '../../context/LocationContext';
import {
  fetchMandiCrops,
  fetchMandiStates,
  setMandiLocation,
} from '../../redux/slices/mandiSlice';

/*
 * Loads crops and states once, and starts from the phone's current
 * (GPS) location, not the profile address. The user can change it with
 * the location sheet.
 *
 * Returns {crops, cropsStatus, cropsError, states, location}.
 */
export default function useMandiSetup() {
  const dispatch = useDispatch();
  const { location: detected } = useLocation() || {};

  const { crops, cropsStatus, cropsError, states, location } = useSelector(
    state => state.mandi,
  );

  useEffect(() => {
    if (cropsStatus === 'idle') dispatch(fetchMandiCrops());
  }, [dispatch, cropsStatus]);

  useEffect(() => {
    if (!states.length) dispatch(fetchMandiStates());
  }, [dispatch, states.length]);

  useEffect(() => {
    if (location) return;

    const state = detected?.state;
    if (!state) return;

    dispatch(
      setMandiLocation({
        state,
        district: detected?.district || detected?.city || '',
      }),
    );
  }, [dispatch, location, detected]);

  return { crops, cropsStatus, cropsError, states, location };
}
