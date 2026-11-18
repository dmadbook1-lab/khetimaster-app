import { useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';

import { useLocation } from '../../../context/LocationContext';
import { getAllLabourersApi } from '../../../api/labourerApi';
import {
  fetchLabourMeta,
} from '../../../redux/slices/labourerSlice';
import { createLabourBooking } from '../../../redux/slices/labourBookingSlice';
import { LABOUR_ROUTES } from '../../../constants/labourRoutes';
import {
  buildBookingPayload,
  estimateTotal,
  formatTimeRange,
  formatWage,
  todayInIndiaKey,
} from '../../../utils/labourFormat';
import {
  SESSION_ALIASES,
  apiMessage,
  optionsFromList,
  placeFromLocation,
  spokenDay,
  t,
  useVoiceLanguage,
  vOpt as tOpt,
} from './flowHelpers';

const SESSIONS = {
  full: { start: '08:00', end: '17:00' },
  morning: { start: '07:00', end: '12:00' },
  afternoon: { start: '13:00', end: '18:00' },
};

/*
 * Hands-free "book labour":
 *   work type -> day -> number of days -> part of day -> worker -> confirm
 * Workers of the farmer's district come first; if there are none the
 * assistant looks everywhere.
 */
export default function useLabourVoiceFlow(navigation) {
  const language = useVoiceLanguage();
  const store = useStore();
  const { location } = useLocation();
  const user = useSelector(state => state.auth.user);

  return useMemo(() => {
    const place = placeFromLocation(location, user);

    const loadMeta = async () => {
      if (!store.getState().labourer.meta.labourTypes.length) {
        await store.dispatch(fetchLabourMeta());
      }
      return store.getState().labourer.meta;
    };

    return {
      id: 'labour',
      title: t('voiceFlow.labour.title'),

      steps: [
        {
          key: 'workType',
          title: t('voiceFlow.labour.work'),
          type: 'choice',
          readOptions: true,
          options: async () => optionsFromList((await loadMeta()).labourTypes),
          prompt: () => t('voiceFlow.labour.askWork'),
          label: value => tOpt(value),
        },
        {
          key: 'date',
          title: t('voiceFlow.day'),
          type: 'date',
          prompt: () => t('voiceFlow.labour.askDate'),
          label: value => spokenDay(value),
        },
        {
          key: 'days',
          title: t('voiceFlow.days'),
          type: 'number',
          min: 1,
          max: 90,
          optional: true,
          defaultValue: 1,
          prompt: () => t('voiceFlow.labour.askDays'),
          label: value => t('voiceFlow.daysCount', { count: value }),
        },
        {
          key: 'session',
          title: t('voiceFlow.time'),
          type: 'choice',
          options: async () =>
            [
              ['full', 'bookLabour.fullDay'],
              ['morning', 'bookLabour.morning'],
              ['afternoon', 'bookLabour.afternoon'],
            ].map(([value, key]) => ({
              value,
              label: t(key),
              aliases: SESSION_ALIASES[value],
            })),
          prompt: () => t('voiceFlow.labour.askSession'),
        },
        {
          key: 'worker',
          title: t('voiceFlow.labour.worker'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'workType',
          emptyPrompt: answers =>
            t('voiceFlow.labour.noWorkers', { work: tOpt(answers.workType) }),
          options: async answers => {
            const base = {
              labourType: answers.workType,
              sort: 'rating',
              limit: 5,
            };

            let response = place.district
              ? await getAllLabourersApi({ ...base, district: place.district })
              : null;

            if (!response?.labourers?.length) {
              response = await getAllLabourersApi(base);
            }

            return (response?.labourers || []).map(worker => ({
              value: worker,
              label: worker.fullName,
              spoken: `${worker.fullName}, ${formatWage(
                worker.expectedWage,
                worker.wageType,
              )}`,
            }));
          },
          prompt: () => t('voiceFlow.labour.askWorker'),
          label: worker => worker.fullName,
        },
      ],

      summary: answers => {
        const times = SESSIONS[answers.session];
        const total = estimateTotal({
          wage: answers.worker.expectedWage,
          wageType: answers.worker.wageType || 'daily',
          numberOfDays: answers.days,
          startTime: times.start,
          endTime: times.end,
        });

        return t('voiceFlow.labour.summary', {
          name: answers.worker.fullName,
          work: tOpt(answers.workType),
          date: spokenDay(answers.date),
          count: answers.days,
          time: formatTimeRange(times.start, times.end),
          amount: total,
        });
      },

      submit: async answers => {
        const times = SESSIONS[answers.session];
        const worker = answers.worker;
        const meta = await loadMeta();

        const { payload, error } = buildBookingPayload(
          {
            labourerId: worker._id,
            bookingDate: answers.date,
            numberOfDays: answers.days,
            startTime: times.start,
            endTime: times.end,
            workType: answers.workType,
            description: '',
            wage: worker.expectedWage ? String(worker.expectedWage) : '',
            wageType: worker.wageType || 'daily',
            village: place.village,
            district: place.district,
            state: place.state,
            address: '',
            farmerNotes: '',
          },
          { maxDays: meta.maxBookingDays, today: todayInIndiaKey() },
        );

        if (error) return { ok: false, message: error };

        try {
          const result = await store
            .dispatch(createLabourBooking(payload))
            .unwrap();

          return {
            ok: true,
            message: t('voiceFlow.labour.success', { name: worker.fullName }),
            doneLabel: t('voiceFlow.viewBooking'),
            onDone: () =>
              navigation.navigate(LABOUR_ROUTES.BOOKING_DETAILS, {
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
