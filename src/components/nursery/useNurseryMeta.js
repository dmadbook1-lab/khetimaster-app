import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchNurseryMeta } from '../../redux/slices/nurserySlice';

/*
 * Options from GET /api/nursery/meta, loaded once and cached.
 */
export default function useNurseryMeta() {
  const dispatch = useDispatch();
  const { meta, metaLoading, metaError } = useSelector(state => state.nursery);

  useEffect(() => {
    if (!meta.categories.length && !metaLoading && !metaError) {
      dispatch(fetchNurseryMeta());
    }
  }, [dispatch, meta.categories.length, metaLoading, metaError]);

  return { ...meta, metaLoading, metaError };
}
