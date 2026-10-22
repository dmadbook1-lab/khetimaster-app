import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchDoctorMeta } from '../../redux/slices/doctorSlice';

/*
 * Options from GET /api/doctors/meta, loaded once and cached.
 */
export default function useDoctorMeta() {
  const dispatch = useDispatch();
  const { meta, metaLoaded, metaLoading, metaError } = useSelector(
    state => state.doctor,
  );

  useEffect(() => {
    if (!metaLoaded && !metaLoading && !metaError) {
      dispatch(fetchDoctorMeta());
    }
  }, [dispatch, metaLoaded, metaLoading, metaError]);

  return { ...meta, metaLoading, metaError };
}
