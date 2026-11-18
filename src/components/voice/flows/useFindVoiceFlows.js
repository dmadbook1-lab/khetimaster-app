import { useMemo } from 'react';
import { useStore } from 'react-redux';

import { useLocation } from '../../../context/LocationContext';
import { getNurseryPlantsApi } from '../../../api/nurseryApi';
import { getMarketListingsApi } from '../../../api/marketApi';
import { addToNurseryCart } from '../../../redux/slices/nurseryCartSlice';
import { NURSERY_ROUTES } from '../../../constants/nurseryRoutes';
import { MARKET_ROUTES } from '../../../constants/marketRoutes';
import { WAREHOUSE_ROUTES } from '../../../constants/warehouseRoutes';
import {
  filterWarehouses,
  sortWarehouses,
  withDistances,
} from '../../../utils/warehouseData';
import { formatRupees } from '../../../utils/marketFormat';
import {
  apiMessage,
  t,
  useVoiceLanguage,
} from './flowHelpers';

/*
 * Voice flows for the buy / look-up screens: nursery, trade and warehouses.
 * They ask what the farmer is looking for, read the best matches and
 * either add to the cart (nursery) or open the one that was picked.
 */

const queryStep = (key, titleKey, promptKey) => ({
  key,
  title: t(titleKey),
  type: 'text',
  optional: true,
  defaultValue: '',
  prompt: () => t(promptKey),
  label: value => value,
});

/* NURSERY: say a plant -> pick -> how many -> add to cart */

export function useNurseryVoiceFlow(navigation) {
  const language = useVoiceLanguage();
  const store = useStore();

  return useMemo(
    () => ({
      id: 'nursery',
      title: t('voiceFlow.nursery.title'),

      steps: [
        queryStep(
          'query',
          'voiceFlow.nursery.search',
          'voiceFlow.nursery.askQuery',
        ),
        {
          key: 'plant',
          title: t('voiceFlow.nursery.plant'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'query',
          emptyPrompt: () => t('voiceFlow.nursery.noPlants'),
          options: async answers => {
            const response = await getNurseryPlantsApi({
              search: answers.query,
              excludeMine: 'true',
              limit: 5,
            });
            return (response?.data || [])
              .filter(plant => Number(plant.quantity) > 0)
              .map(plant => ({
                value: plant,
                label: plant.name,
                spoken: `${plant.name}, ${formatRupees(plant.price)}`,
              }));
          },
          prompt: () => t('voiceFlow.nursery.askPlant'),
          label: plant => plant.name,
        },
        {
          key: 'quantity',
          title: t('voiceFlow.nursery.quantity'),
          type: 'number',
          min: 1,
          max: 1000,
          optional: true,
          defaultValue: 1,
          prompt: () => t('voiceFlow.nursery.askQuantity'),
        },
      ],

      summary: answers =>
        t('voiceFlow.nursery.summary', {
          count: answers.quantity,
          name: answers.plant.name,
          amount: Math.round(answers.plant.price * answers.quantity),
        }),

      submit: async answers => {
        const quantity = Math.min(
          Number(answers.quantity) || 1,
          Number(answers.plant.quantity) || 1,
        );

        try {
          await store
            .dispatch(
              addToNurseryCart({ plantId: answers.plant._id, quantity }),
            )
            .unwrap();

          return {
            ok: true,
            message: t('voiceFlow.nursery.success', {
              name: answers.plant.name,
            }),
            doneLabel: t('voiceFlow.openCart'),
            onDone: () => navigation.navigate(NURSERY_ROUTES.CART),
          };
        } catch (failure) {
          return {
            ok: false,
            message: apiMessage(failure, t('voiceFlow.failed')),
          };
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, navigation, store],
  );
}

/* TRADE (market): say what you want -> pick -> open it */

export function useMarketVoiceFlow(navigation) {
  const language = useVoiceLanguage();

  return useMemo(
    () => ({
      id: 'market',
      title: t('voiceFlow.market.title'),
      noConfirm: true,

      steps: [
        queryStep(
          'query',
          'voiceFlow.market.search',
          'voiceFlow.market.askQuery',
        ),
        {
          key: 'listing',
          title: t('voiceFlow.market.listing'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'query',
          emptyPrompt: () => t('voiceFlow.market.noListings'),
          options: async answers => {
            const response = await getMarketListingsApi({
              search: answers.query,
              limit: 5,
            });
            return (response?.listings || []).map(listing => ({
              value: listing,
              label: listing.title,
              spoken: listing.title,
            }));
          },
          prompt: () => t('voiceFlow.market.askListing'),
          label: listing => listing.title,
        },
      ],

      summary: () => '',

      submit: async answers => ({
        ok: true,
        message: t('voiceFlow.market.opening', {
          name: answers.listing.title,
        }),
        doneLabel: t('voiceFlow.open'),
        onDone: () =>
          navigation.navigate(MARKET_ROUTES.LISTING_DETAILS, {
            listingId: answers.listing._id,
          }),
      }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, navigation],
  );
}

/* WAREHOUSE: say a place or name -> pick -> open it */

export function useWarehouseVoiceFlow(navigation) {
  const language = useVoiceLanguage();
  const { location } = useLocation();

  const latitude = location?.latitude;
  const longitude = location?.longitude;

  return useMemo(
    () => ({
      id: 'warehouse',
      title: t('voiceFlow.warehouse.title'),
      noConfirm: true,

      steps: [
        queryStep(
          'query',
          'voiceFlow.warehouse.search',
          'voiceFlow.warehouse.askQuery',
        ),
        {
          key: 'warehouse',
          title: t('voiceFlow.warehouse.warehouse'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'query',
          emptyPrompt: () => t('voiceFlow.warehouse.noWarehouses'),
          options: async answers => {
            const coords =
              typeof latitude === 'number' && typeof longitude === 'number'
                ? { latitude, longitude }
                : null;

            const found = sortWarehouses(
              filterWarehouses(withDistances(coords), {
                query: answers.query,
              }),
              coords ? 'nearest' : 'name',
            ).slice(0, 5);

            return found.map(item => ({
              value: item,
              label: item.name,
              spoken: item.name,
            }));
          },
          prompt: () => t('voiceFlow.warehouse.askWarehouse'),
          label: item => item.name,
        },
      ],

      summary: () => '',

      submit: async answers => ({
        ok: true,
        message: t('voiceFlow.warehouse.opening', {
          name: answers.warehouse.name,
        }),
        doneLabel: t('voiceFlow.open'),
        onDone: () =>
          navigation.navigate(WAREHOUSE_ROUTES.DETAILS, {
            warehouseId: answers.warehouse.id,
          }),
      }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, navigation, latitude, longitude],
  );
}
