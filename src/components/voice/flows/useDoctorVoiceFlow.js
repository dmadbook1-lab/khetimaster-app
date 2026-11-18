import { useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';

import { useLocation } from '../../../context/LocationContext';
import { getAllDoctorsApi, getDoctorByIdApi } from '../../../api/doctorApi';
import { fetchDoctorMeta } from '../../../redux/slices/doctorSlice';
import { createConsultation } from '../../../redux/slices/doctorConsultationSlice';
import { DOCTOR_ROUTES } from '../../../constants/doctorRoutes';
import {
  bookingDays,
  buildConsultationPayload,
  buildTimeSlots,
  consultationTypeFor,
  feeLabel,
} from '../../../utils/doctorFormat';
import { todayInIndiaKey } from '../../../utils/labourFormat';
import { formatTime } from '../../../utils/indiaSchedule';
import {
  matchOption,
  parseChoiceIndex,
  parseClockTime,
  parseDateKey,
} from '../../../utils/voiceParsers';
import {
  apiMessage,
  optionsFromList,
  placeFromLocation,
  spokenDay,
  t,
  useVoiceLanguage,
  vOpt as tOpt,
} from './flowHelpers';

const nowMinutesInIndia = () => {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.getUTCHours() * 60 + now.getUTCMinutes();
};

/*
 * Hands-free "see a doctor" (animal or crop):
 *   kind of doctor -> doctor -> day -> time -> problem ->
 *   (animal / crop details) -> what is wrong -> confirm
 */
export default function useDoctorVoiceFlow(navigation) {
  const language = useVoiceLanguage();
  const store = useStore();
  const { location } = useLocation();
  const user = useSelector(state => state.auth.user);

  return useMemo(() => {
    const place = placeFromLocation(location, user);
    const todayKey = todayInIndiaKey();

    // full doctor pages (with booked slots), kept for this run
    const doctorCache = {};

    const loadMeta = async () => {
      if (!store.getState().doctor.metaLoaded) {
        await store.dispatch(fetchDoctorMeta());
      }
      return store.getState().doctor.meta;
    };

    const fullDoctor = async doctor => {
      if (!doctorCache[doctor._id]) {
        const response = await getDoctorByIdApi(doctor._id);
        doctorCache[doctor._id] = response?.doctor || doctor;
      }
      return doctorCache[doctor._id];
    };

    const isVet = answers =>
      consultationTypeFor(answers.doctor) === 'veterinary';

    return {
      id: 'doctor',
      title: t('voiceFlow.doctor.title'),

      steps: [
        {
          key: 'doctorType',
          title: t('voiceFlow.doctor.kind'),
          type: 'choice',
          options: async () => [
            {
              value: 'veterinarian',
              label: t('doctorFormat.veterinarian'),
              aliases: [
                'vet', 'veterinary', 'animal', 'cow', 'buffalo', 'goat',
                'pashu', 'janwar', 'पशु', 'जनावर', 'जानवर', 'गाय', 'भैंस',
                'पशु चिकित्सक', 'पशुवैद्य', 'प्राणी',
              ],
            },
            {
              value: 'agriculturalDoctor',
              label: t('doctorFormat.cropDoctor'),
              aliases: [
                'crop', 'plant', 'agriculture', 'agricultural', 'farm',
                'fasal', 'paudha', 'फसल', 'पौधा', 'खेती', 'पीक', 'शेती',
                'कृषि', 'कृषी',
              ],
            },
          ],
          prompt: () => t('voiceFlow.doctor.askKind'),
        },
        {
          key: 'doctor',
          title: t('voiceFlow.doctor.doctor'),
          type: 'choice',
          readOptions: true,
          emptyGoTo: 'doctorType',
          emptyPrompt: () => t('voiceFlow.doctor.noDoctors'),
          options: async answers => {
            const base = {
              doctorType: answers.doctorType,
              sort: 'rating',
              limit: 5,
            };

            let response = place.district
              ? await getAllDoctorsApi({ ...base, district: place.district })
              : null;

            if (!response?.doctors?.length) {
              response = await getAllDoctorsApi(base);
            }

            return (response?.doctors || []).map(doctor => ({
              value: doctor,
              label: doctor.fullName,
              spoken: `${doctor.fullName}, ${feeLabel(doctor)}`,
            }));
          },
          prompt: () => t('voiceFlow.doctor.askDoctor'),
          label: doctor => doctor.fullName,
        },
        {
          key: 'date',
          title: t('voiceFlow.day'),
          type: 'custom',
          prompt: () => t('voiceFlow.doctor.askDate'),
          parse: (text, { answers }) => {
            const key = parseDateKey(text, todayKey);
            if (!key) return null;
            return bookingDays(answers.doctor, todayKey).includes(key)
              ? key
              : null;
          },
          label: value => spokenDay(value),
        },
        {
          key: 'startTime',
          title: t('voiceFlow.time'),
          type: 'custom',
          emptyGoTo: 'date',
          emptyPrompt: () => t('voiceFlow.doctor.noSlots'),
          options: async answers => {
            const doctor = await fullDoctor(answers.doctor);
            return buildTimeSlots({
              dayKey: answers.date,
              todayKey,
              nowMinutes: nowMinutesInIndia(),
              bookedSlots: doctor.bookedSlots || [],
            })
              .filter(slot => !slot.booked && !slot.past)
              .map(slot => ({ value: slot.time, label: slot.label }));
          },
          prompt: (answers, options) =>
            t('voiceFlow.doctor.askTime', {
              examples: (options || [])
                .slice(0, 3)
                .map(option => option.label)
                .join(', '),
            }),
          parse: (text, { options }) => {
            const time = parseClockTime(text);
            const direct = options.find(option => option.value === time);
            if (direct) return direct.value;

            // "9" said when only 9:30 is free: take the closest later slot
            if (time) {
              const later = options.find(option => option.value >= time);
              if (later && later.value.slice(0, 2) === time.slice(0, 2)) {
                return later.value;
              }
            }

            const byName = matchOption(text, options);
            if (byName) return byName.value;
            const index = parseChoiceIndex(text, options.length);
            return index && /first|second|third|पहला|दूसरा|तीसरा|पहिला|दुसरा|तिसरा/i.test(text)
              ? options[index - 1].value
              : null;
          },
          label: value => formatTime(value),
        },
        {
          key: 'problemType',
          title: t('voiceFlow.doctor.problem'),
          type: 'choice',
          readOptions: true,
          options: async answers => {
            const meta = await loadMeta();
            const list =
              meta.problemTypes?.[consultationTypeFor(answers.doctor)] || [];
            return optionsFromList(list);
          },
          prompt: () => t('voiceFlow.doctor.askProblem'),
          label: value => tOpt(value),
        },
        {
          key: 'animalType',
          title: t('voiceFlow.doctor.animal'),
          type: 'choice',
          readOptions: true,
          when: isVet,
          optional: true,
          defaultValue: '',
          options: async () => optionsFromList((await loadMeta()).animalTypes),
          prompt: () => t('voiceFlow.doctor.askAnimal'),
          label: value => tOpt(value),
        },
        {
          key: 'animalCount',
          title: t('voiceFlow.doctor.animals'),
          type: 'number',
          min: 1,
          max: 10000,
          optional: true,
          defaultValue: 1,
          when: isVet,
          prompt: () => t('voiceFlow.doctor.askCount'),
        },
        {
          key: 'cropName',
          title: t('voiceFlow.doctor.crop'),
          type: 'text',
          optional: true,
          defaultValue: '',
          when: answers => !isVet(answers),
          prompt: () => t('voiceFlow.doctor.askCrop'),
        },
        {
          key: 'symptoms',
          title: t('voiceFlow.doctor.symptoms'),
          type: 'text',
          prompt: () => t('voiceFlow.doctor.askSymptoms'),
          label: value => (value.length > 40 ? `${value.slice(0, 40)}…` : value),
        },
      ],

      summary: answers =>
        t('voiceFlow.doctor.summary', {
          name: answers.doctor.fullName,
          date: spokenDay(answers.date),
          time: formatTime(answers.startTime),
          problem: tOpt(answers.problemType),
          fee: feeLabel(answers.doctor),
        }),

      submit: async answers => {
        const { payload, error } = buildConsultationPayload(
          {
            consultationDate: answers.date,
            startTime: answers.startTime,
            problemType: answers.problemType,
            animalType: answers.animalType || '',
            animalCount: String(answers.animalCount ?? 1),
            animalAge: '',
            cropName: answers.cropName || '',
            symptoms: answers.symptoms,
            description: '',
            images: [],
            village: place.village,
            district: place.district,
            state: place.state,
            address: '',
            paymentMethod: 'cod',
            farmerNotes: '',
          },
          {
            doctor: answers.doctor,
            todayKey,
            nowMinutes: nowMinutesInIndia(),
          },
        );

        if (error) return { ok: false, message: error };

        try {
          const result = await store
            .dispatch(createConsultation(payload))
            .unwrap();

          return {
            ok: true,
            message: t('voiceFlow.doctor.success', {
              name: answers.doctor.fullName,
            }),
            doneLabel: t('voiceFlow.viewRequest'),
            onDone: () =>
              navigation.navigate(DOCTOR_ROUTES.CONSULTATION, {
                consultationId: result?.consultation?._id,
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
