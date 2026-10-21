import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchLabourMeta } from '../../redux/slices/labourerSlice';

/*
 * Options from GET /api/labourers/meta, loaded once and cached.
 */
export default function useLabourMeta() {
  const dispatch = useDispatch();
  const { meta, metaLoading, metaError } = useSelector(state => state.labourer);

  useEffect(() => {
    if (!meta.labourTypes.length && !metaLoading && !metaError) {
      dispatch(fetchLabourMeta());
    }
  }, [dispatch, meta.labourTypes.length, metaLoading, metaError]);

  return { ...meta, metaLoading, metaError };
}
