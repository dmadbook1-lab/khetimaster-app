import { useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';

import { useLocation } from '../../../context/LocationContext';
import { getDeliveryPartnersApi } from '../../../api/deliveryApi';
import {
  createDeliveryBooking,
  fetchDeliveryMeta,
} from '../../../redux/slices/deliverySlice';
import { DELIVERY_ROUTES } from '../../../constants/deliveryRoutes';
import {
  buildDeliveryPayload,
  estimateFare,
  formatWeight,
} from '../../../utils/deliveryFormat';
import {
  apiMessage,
  optionsFromList,
  placeFromLocation,
  t,
  useVoiceLanguage,
  vOpt,
} from './flowHelpers';

const vehicleName = key =>
  t(`delivery.vehicle.${key}`, { defaultValue: String(key || '') });

/*
 * Hands-free "send goods":
 *   vehicle -> goods -> weight -> drop place -> distance -> driver -> confirm
 * Pickup is where the farmer is now (GPS / profile). Only drivers of the
 * pickup district who are free right now are offered, so the booking is an
 * immediate "pickup now" request, paid to the driver on delivery.
 */
export default function useDeliveryVoiceFlow(navigation) {
  const language = useVoiceLanguage();
  const store = useStore();
  const { location } = useLocation();
  const user = useSelector(state => state.auth.user);

  return useMemo(() => {
    const place = placeFromLocation(location, user);
    const origin =
      location?.latitude && location?.longitude
        ? { lat: location.latitude, lng: location.longitude }
        : null;

    const loadMeta = async () => {
      if (!store.getState().delivery.meta.vehicleTypes.length) {
        await store.dispatch(fetchDeliveryMeta());
      }
      return store.getState().delivery.meta;
    };

    const pickupStop = () => ({
      address: '',
      village: place.village || location?.city || '',
      district: place.district,
      state: place.state,
      lat: origin?.lat ?? null,
      lng: origin?.lng ?? null,
      contactName: user?.fullName || '',
      contactPhone: user?.phoneNumber || '',
    });

    const dropStop = text => ({
      address: text,
      village: '',
      district: '',
      state: '',
      lat: null,
      lng: null,
      contactName: '',
      contactPhone: '',
    });

    const fareFor = answers =>
      estimateFare(answers.driver, answers.distance) ||
      Number(answers.driver?.minFare) ||
      0;

    return {
      id: 'delivery',
      title: t('voiceFlow.delivery.title'),

      steps: [
        {
          key: 'vehicle',
          title: t('voiceFlow.delivery.vehicle'),
          type: 'choice',
          readOptions: true,
          options: async () =>
            (await loadMeta()).vehicleTypes.map(vehicle => ({
              value: vehicle.key,
              label: vehicleName(vehicle.key),
              // English name and API key also match ("truck", "tractor trolley")
              aliases: [
                vehicle.key,
                vehicle.key.replace(/_/g, ' '),
                t(`delivery.vehicle.${vehicle.key}`, { lng: 'en' }),
              ],
            })),
          prompt: () => t('voiceFlow.delivery.askVehicle'),
          label: value => vehicleName(value),
        },
        {
          key: 'goods',
          title: t('voiceFlow.delivery.goods'),
          type: 'choice',
          readOptions: true,
          options: async () => optionsFromList((await loadMeta()).goodsTypes),
          prompt: () => t('voiceFlow.delivery.askGoods'),
          label: value => vOpt(value),
        },
        {
          key: 'weight',
          title: t('voiceFlow.delivery.weight'),
          type: 'number',
          min: 1,
          max: 50000,
          optional: true,
          defaultValue: 0,
          prompt: () => t('voiceFlow.delivery.askWeight'),
          label: value =>
            value ? formatWeight(value) : t('voiceFlow.delivery.weightUnknown'),
        },
        {
          key: 'drop',
          title: t('voiceFlow.delivery.drop'),
          type: 'text',
          prompt: () => t('voiceFlow.delivery.askDrop'),
          label: value => (value.length > 40 ? `${value.slice(0, 40)}…` : value),
        },
        {
          key: 'distance',
          title: t('voiceFlow.delivery.distance'),
          type: 'number',
          min: 1,
          max: 1000,
          prompt: () => t('voiceFlow.delivery.askDistance'),
          label: value => t('delivery.kmValue', { n: value }),
        },
        {
          key: 'driver',
          title: t('voiceFlow.delivery.driver'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'vehicle',
          emptyPrompt: answers =>
            t('voiceFlow.delivery.noDrivers', {
              vehicle: vehicleName(answers.vehicle),
              district: place.district || '—',
            }),
          options: async answers => {
            const response = await getDeliveryPartnersApi({
              district: place.district,
              scope: 'district',
              vehicleType: answers.vehicle,
              sort: 'recommended',
              lat: origin?.lat,
              lng: origin?.lng,
              limit: 10,
            });

            const weight = Number(answers.weight) || 0;

            return (response?.partners || [])
              .filter(
                driver =>
                  driver.tripState === 'available' &&
                  (!weight || Number(driver.capacityKg) >= weight),
              )
              .slice(0, 5)
              .map(driver => {
                const fare =
                  estimateFare(driver, answers.distance) ||
                  Number(driver.minFare) ||
                  0;
                return {
                  value: driver,
                  label: driver.fullName,
                  spoken: t('voiceFlow.delivery.driverOption', {
                    name: driver.fullName,
                    amount: fare,
                  }),
                };
              });
          },
          prompt: () => t('voiceFlow.delivery.askDriver'),
          label: driver => driver.fullName,
        },
      ],

      summary: answers =>
        t('voiceFlow.delivery.summary', {
          goods: vOpt(answers.goods),
          name: answers.driver.fullName,
          vehicle: vehicleName(answers.vehicle),
          to: answers.drop,
          km: answers.distance,
          amount: fareFor(answers),
        }),

      submit: async answers => {
        const meta = await loadMeta();
        const driver = answers.driver;

        const { payload, error } = buildDeliveryPayload(
          {
            partnerId: driver._id,
            pickup: pickupStop(),
            drop: dropStop(answers.drop),
            distanceKm: String(answers.distance),
            goodsType: answers.goods,
            weightKg: answers.weight ? String(answers.weight) : '',
            description: '',
            scheduleType: 'now',
            pickupAt: '',
            paymentMethod: 'cod',
            customerNotes: '',
          },
          { partner: driver, settings: meta.settings },
        );

        if (error) return { ok: false, message: error };

        try {
          const result = await store
            .dispatch(createDeliveryBooking(payload))
            .unwrap();

          return {
            ok: true,
            message: t('voiceFlow.delivery.success', { name: driver.fullName }),
            doneLabel: t('voiceFlow.delivery.track'),
            onDone: () =>
              navigation.navigate(DELIVERY_ROUTES.TRIP, {
                bookingId: result.booking._id,
              }),
          };
        } catch (failure) {
          return {
            ok: false,
            message: apiMessage(failure, t('voiceFlow.failed')),
          };
        }
      },
    };
    // rebuild when the app language changes so prompts are in that language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, location, user, navigation, store]);
}
