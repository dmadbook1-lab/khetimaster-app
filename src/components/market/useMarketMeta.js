import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {fetchMarketMeta} from '../../redux/slices/marketSlice';

/*
 * Categories, units, conditions and grades from GET /api/market/meta.
 * Loaded once and cached in the store.
 */
export default function useMarketMeta() {
  const dispatch = useDispatch();
  const {meta, metaLoading, metaError} = useSelector(state => state.market);

  useEffect(() => {
    if (!meta.categories.length && !metaLoading && !metaError) {
      dispatch(fetchMarketMeta());
    }
  }, [dispatch, meta.categories.length, metaLoading, metaError]);

  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        meta.categories.map(category => [category.key, category.label]),
      ),
    [meta.categories],
  );

  return {
    ...meta,
    categoryLabels,
    metaLoading,
    metaError,
    retry: () => dispatch(fetchMarketMeta()),
  };
}
