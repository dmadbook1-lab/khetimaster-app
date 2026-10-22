import {
  addDaysToKey,
  dayKeyOf,
  formatDay,
  formatTime,
  minutesToTime,
  parseTime,
} from './indiaSchedule';
import { formatRupees } from './marketFormat';

/*
|--------------------------------------------------------------------------
| DOCTOR RULES
|--------------------------------------------------------------------------
|
| Mirrors the server (data/doctorOptions.js and the doctor controllers).
| Values from GET /api/doctors/meta win when loaded.
|
*/

export const DEFAULT_SLOT_MINUTES = 30;
export const MAX_CONSULTATION_IMAGES = 5;

// bookedSlots on the doctor page cover this many days
export const BOOKING_WINDOW_DAYS = 14;

// times offered in the slot picker (the server accepts any time)
export const SLOT_DAY_START = 8 * 60;
export const SLOT_DAY_END = 20 * 60;

export const DOCTOR_TYPE_META = {
  veterinarian: {
    label: 'Veterinarian',
    short: 'Vet',
    consultationType: 'veterinary',
    for: 'Animals & livestock',
  },
  agriculturalDoctor: {
    label: 'Crop Doctor',
    short: 'Crop doctor',
    consultationType: 'agricultural',
    for: 'Crops, soil & pests',
  },
};

export const CONSULTATION_TYPE_LABELS = {
  veterinary: 'Animal consultation',
  agricultural: 'Crop consultation',
};

export const STATUS_META = {
  pending: { label: 'Requested', color: '#B7791F', bg: '#FFF6E0' },
  accepted: { label: 'Accepted', color: '#0B7C76', bg: '#E1F5F3' },
  confirmed: { label: 'Accepted', color: '#0B7C76', bg: '#E1F5F3' },
  completed: { label: 'Completed', color: '#2563EB', bg: '#EAF1FF' },
  rejected: { label: 'Declined', color: '#B42318', bg: '#FDECEA' },
  cancelled: { label: 'Cancelled', color: '#475467', bg: '#EEF0F2' },
};

export const AVAILABILITY_META = {
  available: { label: 'Available', color: '#0B7C76', bg: '#E1F5F3' },
  busy: { label: 'Busy', color: '#B7791F', bg: '#FFF6E0' },
  unavailable: { label: 'Not available', color: '#B42318', bg: '#FDECEA' },
};

export const PAYMENT_LABELS = {
  cod: 'Cash',
  upi: 'UPI',
  card: 'Card',
  wallet: 'Wallet',
};

export const isAcceptedStatus = status =>
  status === 'accepted' || status === 'confirmed';

export const isActiveStatus = status =>
  status === 'pending' || isAcceptedStatus(status);

/*
|--------------------------------------------------------------------------
| DOCTOR DISPLAY
|--------------------------------------------------------------------------
*/

export const consultationTypeFor = doctor =>
  DOCTOR_TYPE_META[doctor?.doctorType]?.consultationType || 'veterinary';

export const isFreeDoctor = doctor =>
  doctor?.consultationFeeType === 'free' || !Number(doctor?.consultationFee);

export const feeLabel = doctor =>
  isFreeDoctor(doctor) ? 'Free' : formatRupees(doctor.consultationFee);

export const doctorPlace = doctor =>
  [doctor?.village, doctor?.district, doctor?.state].filter(Boolean).join(', ');

export const listText = (list, max = 3) => {
  const items = (list || []).filter(Boolean);
  if (items.length <= max) return items.join(' · ');
  return `${items.slice(0, max).join(' · ')} +${items.length - max}`;
};

/*
|--------------------------------------------------------------------------
| BOOKING DAYS AND SLOTS
|--------------------------------------------------------------------------
*/

/*
 * The next days the doctor can be booked, within availableFrom /
 * availableUntil. ['2026-10-22', ...]
 */
export const bookingDays = (doctor, todayKey, count = BOOKING_WINDOW_DAYS) => {
  const from = dayKeyOf(doctor?.availableFrom);
  const until = dayKeyOf(doctor?.availableUntil);
  const days = [];

  for (let index = 0; index < count; index += 1) {
    const key = addDaysToKey(todayKey, index);
    if ((from && key < from) || (until && key > until)) continue;
    days.push(key);
  }

  return days;
};

const slotWindow = slot => {
  const start = parseTime(slot.startTime) ?? 0;
  const end = slot.endTime
    ? parseTime(slot.endTime) ?? start + DEFAULT_SLOT_MINUTES
    : start + DEFAULT_SLOT_MINUTES;

  return [start, end];
};

/*
 * Time slots for a day. Each slot is booked when it overlaps an
 * accepted consultation, past when it has already started today.
 *
 * [{time: '08:00', minute, label: '8:00 AM', booked, past}]
 */
export const buildTimeSlots = ({
  dayKey,
  todayKey,
  nowMinutes = 0,
  bookedSlots = [],
  slotMinutes = DEFAULT_SLOT_MINUTES,
  dayStart = SLOT_DAY_START,
  dayEnd = SLOT_DAY_END,
}) => {
  const taken = bookedSlots
    .filter(slot => dayKeyOf(slot.consultationDate) === dayKey)
    .map(slotWindow);

  const slots = [];

  for (
    let minute = dayStart;
    minute + slotMinutes <= dayEnd;
    minute += slotMinutes
  ) {
    const end = minute + slotMinutes;

    slots.push({
      time: minutesToTime(minute),
      minute,
      label: formatTime(minutesToTime(minute)),
      booked: taken.some(([start, stop]) => minute < stop && start < end),
      past: dayKey === todayKey && minute < nowMinutes,
    });
  }

  return slots;
};

export const bookedCountOn = (bookedSlots, dayKey) =>
  (bookedSlots || []).filter(slot => dayKeyOf(slot.consultationDate) === dayKey)
    .length;

/*
|--------------------------------------------------------------------------
| CONSULTATION REQUEST
|--------------------------------------------------------------------------
|
| buildConsultationPayload(form, {doctor, todayKey, nowMinutes})
|   -> {payload} | {error, field}
|
| Fee is never sent; the server takes it from the doctor.
|
*/

const trim = value => (typeof value === 'string' ? value.trim() : '');

export const buildConsultationPayload = (
  form,
  { doctor, todayKey, nowMinutes = 0 },
) => {
  const consultationType = consultationTypeFor(doctor);

  if (!form.consultationDate) {
    return { error: 'Please choose a day', field: 'consultationDate' };
  }
  if (form.consultationDate < todayKey) {
    return { error: 'This day has already passed', field: 'consultationDate' };
  }

  const startMinute = parseTime(form.startTime);

  if (startMinute === null) {
    return { error: 'Please choose a time', field: 'startTime' };
  }
  if (form.consultationDate === todayKey && startMinute < nowMinutes) {
    return {
      error: 'This time has already passed today',
      field: 'startTime',
    };
  }

  if (!trim(form.problemType)) {
    return { error: 'Please choose the problem', field: 'problemType' };
  }

  const animalCountText = trim(String(form.animalCount ?? ''));
  const animalCount = animalCountText ? Number(animalCountText) : 0;

  if (
    consultationType === 'veterinary' &&
    (!Number.isInteger(animalCount) || animalCount < 0 || animalCount > 10000)
  ) {
    return {
      error: 'Number of animals must be a whole number',
      field: 'animalCount',
    };
  }

  if (!trim(form.symptoms) && !trim(form.description)) {
    return {
      error: 'Please describe what you see so the doctor can prepare',
      field: 'symptoms',
    };
  }

  const images = (form.images || []).filter(Boolean);

  if (images.length > MAX_CONSULTATION_IMAGES) {
    return {
      error: `You can add at most ${MAX_CONSULTATION_IMAGES} photos`,
      field: 'images',
    };
  }

  const isVet = consultationType === 'veterinary';

  return {
    payload: {
      doctorId: doctor._id,
      consultationDate: form.consultationDate,
      startTime: minutesToTime(startMinute),
      consultationType,
      problemType: trim(form.problemType),
      symptoms: trim(form.symptoms),
      description: trim(form.description),
      ...(isVet
        ? {
            animalType: trim(form.animalType),
            animalCount,
            animalAge: trim(form.animalAge),
          }
        : { cropName: trim(form.cropName) }),
      images,
      village: trim(form.village),
      district: trim(form.district),
      state: trim(form.state),
      address: trim(form.address),
      paymentMethod: form.paymentMethod || 'cod',
      farmerNotes: trim(form.farmerNotes),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DOCTOR PROFILE
|--------------------------------------------------------------------------
|
| buildDoctorProfilePayload(form) -> {payload} | {error, field}
| Same rules as the server's buildDoctorFields.
|
*/

export const buildDoctorProfilePayload = form => {
  const fullName = trim(form.fullName);

  if (!fullName) return { error: 'Please enter your name', field: 'fullName' };
  if (fullName.length > 100) {
    return { error: 'Name must be at most 100 characters', field: 'fullName' };
  }

  if (!DOCTOR_TYPE_META[form.doctorType]) {
    return {
      error: 'Please choose what kind of doctor you are',
      field: 'doctorType',
    };
  }

  const phoneNumber = trim(form.phoneNumber);
  if (phoneNumber && !/^\+?[0-9\s-]{10,15}$/.test(phoneNumber)) {
    return { error: 'Please enter a valid phone number', field: 'phoneNumber' };
  }

  const email = trim(form.email).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email', field: 'email' };
  }

  for (const [key, label] of [
    ['specialization', 'specializations'],
    ['qualification', 'qualifications'],
    ['languages', 'languages'],
  ]) {
    if ((form[key] || []).length > 20) {
      return { error: `You can add at most 20 ${label}`, field: key };
    }
  }

  if (!(form.specialization || []).length) {
    return {
      error: 'Please choose at least one specialization',
      field: 'specialization',
    };
  }

  const about = trim(form.about);
  if (about.length > 1000) {
    return { error: 'About must be at most 1000 characters', field: 'about' };
  }

  const isFree = form.consultationFeeType === 'free';
  const feeText = trim(String(form.consultationFee ?? ''));
  const fee = feeText ? Number(feeText) : 0;

  if (!isFree && (!Number.isFinite(fee) || fee < 0)) {
    return { error: 'Please enter a valid fee', field: 'consultationFee' };
  }
  if (!isFree && fee === 0) {
    return {
      error: 'Enter your fee, or choose "Free consultation"',
      field: 'consultationFee',
    };
  }

  const availableFrom = form.availableFrom || null;
  const availableUntil = form.availableUntil || null;

  if (availableFrom && availableUntil && availableUntil < availableFrom) {
    return {
      error: '"Until" must be after "from"',
      field: 'availableUntil',
    };
  }

  return {
    payload: {
      fullName,
      doctorType: form.doctorType,
      phoneNumber,
      email,
      profileImage: trim(form.profileImage),
      doctorateCertificate: trim(form.doctorateCertificate),
      specialization: form.specialization || [],
      qualification: form.qualification || [],
      languages: form.languages || [],
      about,
      consultationFeeType: isFree ? 'free' : 'perConsultation',
      consultationFee: isFree ? 0 : Math.round(fee * 100) / 100,
      availability: form.availability || 'available',
      availableFrom,
      availableUntil,
      village: trim(form.village),
      district: trim(form.district),
      state: trim(form.state),
      address: trim(form.address),
    },
  };
};

/*
|--------------------------------------------------------------------------
| CONSULTATION STATE
|--------------------------------------------------------------------------
*/

export const canCompleteOn = (consultation, todayKey) =>
  isAcceptedStatus(consultation?.status) &&
  dayKeyOf(consultation.consultationDate) <= todayKey;

/*
 * What the current user can do now. Order = importance.
 */
export const getConsultationActions = (consultation, todayKey) => {
  if (!consultation) return [];

  const { status, myRole } = consultation;
  const actions = [];

  if (myRole === 'doctor') {
    if (status === 'pending') actions.push('accept', 'reject');
    if (canCompleteOn(consultation, todayKey)) actions.push('complete');
    if (isAcceptedStatus(status) || status === 'completed')
      actions.push('notes');
    if (isAcceptedStatus(status)) actions.push('cancel');
  } else if (myRole === 'farmer') {
    if (consultation.canReview) actions.push('review');
    if (canCompleteOn(consultation, todayKey)) actions.push('complete');
    if (isActiveStatus(status)) actions.push('cancel');
  }

  return actions;
};

export const describeConsultationState = (consultation, todayKey) => {
  const { status, myRole, cancelledBy } = consultation;
  const isDoctor = myRole === 'doctor';
  const day = dayKeyOf(consultation.consultationDate);
  const when =
    day === todayKey ? 'today' : `on ${formatDay(day, { year: false })}`;

  switch (status) {
    case 'pending':
      return isDoctor
        ? 'New request. Accept it to share phone numbers.'
        : 'Waiting for the doctor to accept.';
    case 'accepted':
    case 'confirmed':
      if (day <= todayKey) {
        return isDoctor
          ? 'Consultation is due. Mark it completed with your diagnosis.'
          : 'Consultation is due. The doctor will call or visit.';
      }
      return `Accepted. Consultation ${when} at ${formatTime(
        consultation.startTime,
      )}.`;
    case 'completed':
      return consultation.canReview
        ? 'Completed. Please rate the doctor.'
        : 'Completed.';
    case 'rejected':
      return isDoctor ? 'You declined this request.' : 'The doctor declined.';
    case 'cancelled':
      if (cancelledBy === 'system') return 'Expired: no reply before the date.';
      if (cancelledBy === myRole) return 'You cancelled this consultation.';
      return isDoctor ? 'The farmer cancelled.' : 'The doctor cancelled.';
    default:
      return '';
  }
};

export const closingReason = consultation =>
  consultation.status === 'rejected'
    ? consultation.rejectionReason || consultation.cancellationReason
    : consultation.status === 'cancelled'
    ? consultation.cancellationReason
    : '';
