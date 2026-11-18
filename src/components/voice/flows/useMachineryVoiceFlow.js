import { useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';

import { useLocation } from '../../../context/LocationContext';
import { getAllMachineryApi } from '../../../api/machineryApi';
import { fetchMachineryMeta } from '../../../redux/slices/machinerySlice';
import { createMachineryBooking } from '../../../redux/slices/machineryBookingSlice';
import { MACHINERY_ROUTES } from '../../../constants/machineryRoutes';
import {
  buildRentalPayload,
  durationKind,
  estimateRental,
  formatRate,
  getRateOptions,
} from '../../../utils/machineryFormat';
import { todayInIndiaKey } from '../../../utils/labourFormat';
import { formatTime } from '../../../utils/indiaSchedule';
import {
  apiMessage,
  optionsFromList,
  placeFromLocation,
  spokenDay,
  t,
  useVoiceLanguage,
  vOpt as tOpt,
} from './flowHelpers';

/*
 * Hands-free "rent a machine":
 *   type of machine -> machine -> how to rent -> day -> how long ->
 *   (start time for hourly) -> confirm
 */
export default function useMachineryVoiceFlow(navigation) {
  const language = useVoiceLanguage();
  const store = useStore();
  const { location } = useLocation();
  const user = useSelector(state => state.auth.user);

  return useMemo(() => {
    const place = placeFromLocation(location, user);

    const loadMeta = async () => {
      if (!store.getState().machinery.meta.categories.length) {
        await store.dispatch(fetchMachineryMeta());
      }
      return store.getState().machinery.meta;
    };

    const rateOf = answers => answers.rate;
    const kindOf = answers => durationKind(rateOf(answers)?.unit);

    return {
      id: 'machinery',
      title: t('voiceFlow.machinery.title'),

      steps: [
        {
          key: 'category',
          title: t('voiceFlow.machinery.type'),
          type: 'choice',
          readOptions: true,
          options: async () => optionsFromList((await loadMeta()).categories),
          prompt: () => t('voiceFlow.machinery.askCategory'),
          label: value => tOpt(value),
        },
        {
          key: 'machine',
          title: t('voiceFlow.machinery.machine'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'category',
          emptyPrompt: answers =>
            t('voiceFlow.machinery.noMachines', {
              type: tOpt(answers.category),
            }),
          options: async answers => {
            const base = {
              category: answers.category,
              sort: 'rating',
              excludeMine: 'true',
              limit: 5,
            };

            let response = place.district
              ? await getAllMachineryApi({ ...base, district: place.district })
              : null;

            if (!response?.machinery?.length) {
              response = await getAllMachineryApi(base);
            }

            return (response?.machinery || [])
              .filter(machine => getRateOptions(machine).length)
              .map(machine => {
                const [first] = getRateOptions(machine);
                return {
                  value: machine,
                  label: machine.name,
                  spoken: `${machine.name}, ${formatRate(
                    first.amount,
                    first.unit,
                  )}`,
                };
              });
          },
          prompt: () => t('voiceFlow.machinery.askMachine'),
          label: machine => machine.name,
        },
        {
          key: 'rate',
          title: t('voiceFlow.machinery.rate'),
          type: 'choice',
          readOptions: true,
          autoSingle: true,
          options: async answers =>
            getRateOptions(answers.machine).map(rate => ({
              value: rate,
              label: `${rate.label} ${formatRate(rate.amount, rate.unit)}`,
              spoken: `${rate.label}, ${formatRate(rate.amount, rate.unit)}`,
              aliases: [
                rate.label,
                rate.pricingType === 'hourly' ? 'hour' : null,
                rate.pricingType === 'hourly' ? 'ghanta' : null,
                rate.pricingType === 'hourly' ? 'घंटा' : null,
                rate.pricingType === 'hourly' ? 'तास' : null,
                rate.pricingType === 'daily' ? 'day' : null,
                rate.pricingType === 'daily' ? 'din' : null,
                rate.pricingType === 'daily' ? 'दिन' : null,
                rate.pricingType === 'daily' ? 'दिवस' : null,
              ].filter(Boolean),
            })),
          prompt: () => t('voiceFlow.machinery.askRate'),
          label: rate => rate.label,
        },
        {
          key: 'date',
          title: t('voiceFlow.day'),
          type: 'date',
          prompt: () => t('voiceFlow.machinery.askDate'),
          label: value => spokenDay(value),
        },
        {
          key: 'duration',
          title: t('voiceFlow.machinery.duration'),
          type: 'number',
          min: 1,
          max: 1000,
          prompt: answers => {
            const kind = kindOf(answers);
            return kind === 'hours'
              ? t('voiceFlow.machinery.askHours')
              : kind === 'days'
              ? t('voiceFlow.machinery.askDays')
              : t('voiceFlow.machinery.askQuantity', {
                  unit: answers.rate?.unit || '',
                });
          },
          label: (value, _options) => String(value),
        },
        {
          key: 'startTime',
          title: t('voiceFlow.start'),
          type: 'time',
          optional: true,
          defaultValue: '08:00',
          when: answers => kindOf(answers) !== 'days',
          prompt: () => t('voiceFlow.machinery.askStart'),
          label: value => formatTime(value),
        },
      ],

      summary: answers => {
        const startTime = answers.startTime || '08:00';
        const estimate = estimateRental({
          option: answers.rate,
          duration: answers.duration,
          startTime,
        });

        return t('voiceFlow.machinery.summary', {
          name: answers.machine.name,
          rate: answers.rate.label,
          date: spokenDay(answers.date),
          duration: answers.duration,
          amount: estimate.total || 0,
        });
      },

      submit: async answers => {
        const meta = await loadMeta();
        const { machine, rate } = answers;

        const { payload, error } = buildRentalPayload(
          {
            machineryId: machine._id,
            bookingDate: answers.date,
            startTime: answers.startTime || '08:00',
            endTime: '',
            workType:
              rate.pricingType === 'custom' ? rate.label : tOpt(machine.category),
            duration: String(answers.duration),
            selectedImplement: '',
            village: place.village,
            district: place.district,
            state: place.state,
            address: '',
            farmSize: '',
            crop: '',
            paymentMethod: 'cod',
            farmerNotes: '',
          },
          {
            option: rate,
            maxDays: meta.maxBookingDays,
            maxHours: meta.maxBookingHours,
            today: todayInIndiaKey(),
          },
        );

        if (error) return { ok: false, message: error };

        try {
          const result = await store
            .dispatch(createMachineryBooking(payload))
            .unwrap();

          return {
            ok: true,
            message: t('voiceFlow.machinery.success', { name: machine.name }),
            doneLabel: t('voiceFlow.viewBooking'),
            onDone: () =>
              navigation.navigate(MACHINERY_ROUTES.BOOKING_DETAILS, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, location, user, navigation, store]);
}
