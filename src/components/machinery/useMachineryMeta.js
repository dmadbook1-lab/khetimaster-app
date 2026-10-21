import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMachineryMeta } from '../../redux/slices/machinerySlice';

/*
 * Options from GET /api/machinery/meta, loaded once and cached.
 */
export default function useMachineryMeta() {
  const dispatch = useDispatch();
  const { meta, metaLoading, metaError } = useSelector(
    state => state.machinery,
  );

  useEffect(() => {
    if (!meta.categories.length && !metaLoading && !metaError) {
      dispatch(fetchMachineryMeta());
    }
  }, [dispatch, meta.categories.length, metaLoading, metaError]);

  return { ...meta, metaLoading, metaError };
}
