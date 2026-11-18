/*
|--------------------------------------------------------------------------
| LABOUR BOOKING FORMATTING / PAYLOAD HELPERS
|--------------------------------------------------------------------------
|
| Date and time helpers live in indiaSchedule.js and are re-exported
| here so labour code can import everything from one place.
|
*/

import {
  toDayKey,
  todayInIndiaKey,
  dayKeyOf,
  addDaysToKey,
  formatDay,
  formatDateRange,
  parseTime,
  minutesToTime,
  formatTime,
  formatTimeRange,
} from './indiaSchedule';
import i18n from 'i18next';

export {
  toDayKey,
  todayInIndiaKey,
  dayKeyOf,
  addDaysToKey,
  formatDay,
  formatDateRange,
  parseTime,
  minutesToTime,
  formatTime,
  formatTimeRange,
};

export const DEFAULT_MAX_BOOKING_DAYS = 90;

export const WAGE_TYPE_LABELS = {
  get daily() {
    return i18n.t('labourFormat.perDay');
  },
  get hourly() {
    return i18n.t('labourFormat.perHour');
  },
  get monthly() {
    return i18n.t('labourFormat.perMonth');
  },
};

export const AVAILABILITY_META = {
  available: { get label() {
    return i18n.t('labourFormat.available');
  }, color: '#159447', bg: '#EAF7EF' },
  busy: { get label() {
    return i18n.t('labourFormat.busy');
  }, color: '#B7791F', bg: '#FFF6E0' },
  unavailable: { get label() {
    return i18n.t('labourFormat.notAvailable');
  }, color: '#475467', bg: '#EEF0F2' },
};

export const BOOKING_STATUS_META = {
  pending: { get label() {
    return i18n.t('labourFormat.requested');
  }, color: '#B7791F', bg: '#FFF6E0' },
  accepted: { get label() {
    return i18n.t('labourFormat.confirmed');
  }, color: '#2563EB', bg: '#EAF1FF' },
  confirmed: { get label() {
    return i18n.t('labourFormat.confirmed');
  }, color: '#2563EB', bg: '#EAF1FF' },
  completed: { get label() {
    return i18n.t('labourFormat.completed');
  }, color: '#159447', bg: '#EAF7EF' },
  rejected: { get label() {
    return i18n.t('labourFormat.declined');
  }, color: '#B42318', bg: '#FDECEA' },
  cancelled: { get label() {
    return i18n.t('labourFormat.cancelled');
  }, color: '#475467', bg: '#EEF0F2' },
};

export const isAcceptedStatus = status =>
  status === 'accepted' || status === 'confirmed';

export const formatWage = (wage, wageType = 'daily') => {
  const amount = Number(wage);
  if (!Number.isFinite(amount) || amount <= 0) return i18n.t('labourFormat.wageNotSet');

  return `₹${Math.round(amount * 100) / 100} ${
    WAGE_TYPE_LABELS[wageType] || ''
  }`.trim();
};

export const formatExperience = (experience, unit = 'years') => {
  const value = Number(experience);
  if (!Number.isFinite(value) || value <= 0) return i18n.t('plural.new');

  const label =
    unit === 'months'
      ? i18n.t(value === 1 ? 'plural.month' : 'plural.months')
      : i18n.t(value === 1 ? 'plural.year' : 'plural.years');
  return `${value} ${label}`;
};

/*
 * Same formula as the server's calculateTotal. Only an estimate in the
 * app - the server's totalAmount is what gets shown after booking.
 */
export const estimateTotal = ({
  wage,
  wageType,
  numberOfDays,
  startTime,
  endTime,
}) => {
  const amount = Number(wage);
  const days = Number(numberOfDays) || 1;

  if (!Number.isFinite(amount) || amount <= 0) return 0;

  if (wageType === 'hourly') {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (start === null || end === null || end <= start) return 0;

    return Math.round(amount * ((end - start) / 60) * days * 100) / 100;
  }

  if (wageType === 'monthly') {
    return Math.round(amount * Math.ceil(days / 30) * 100) / 100;
  }

  return Math.round(amount * days * 100) / 100;
};

export const formatLabourLocation = (party = {}) =>
  [party?.village, party?.taluka, party?.district, party?.state]
    .filter(Boolean)
    .join(', ');

/*
 * One line on where a booking stands for the current user.
 */
export const describeBookingState = (booking, today = todayInIndiaKey()) => {
  if (!booking) return '';

  const isFarmer = booking.myRole === 'farmer';
  const started = (dayKeyOf(booking.bookingDate) || '') <= today;

  switch (booking.status) {
    case 'pending':
      return isFarmer
        ? i18n.t('labourFormat.waitingForTheWorkerTo')
        : i18n.t('labourFormat.newWorkRequestAcceptOr');
    case 'accepted':
    case 'confirmed':
      if (started) {
        return i18n.t('labourFormat.workHasStartedMarkIt');
      }
      return isFarmer
        ? i18n.t('labourFormat.confirmedCallTheWorkerTo')
        : i18n.t('labourFormat.confirmedReachTheFarmOn');
    case 'completed':
      return booking.canReview
        ? i18n.t('labourFormat.workDoneRateTheWorker')
        : i18n.t('labourFormat.workCompleted');
    case 'rejected':
      return isFarmer
        ? i18n.t('labourFormat.theWorkerDeclinedThisRequest')
        : i18n.t('labourFormat.youDeclinedThisRequest');
    case 'cancelled':
      if (booking.cancelledBy === 'system') {
        return booking.cancellationReason || i18n.t('labourFormat.requestExpired');
      }
      return booking.cancelledBy === booking.myRole
        ? i18n.t('labourFormat.youCancelledThisBooking')
        : i18n.t('labourFormat.cancelledByThe', {v1: booking.cancelledBy || i18n.t('labourFormat.otherSide')});
    default:
      return '';
  }
};

/*
 * Actions the current user can take on a booking. Mirrors the server.
 */
export const getBookingActions = (booking, today = todayInIndiaKey()) => {
  if (!booking) return [];

  const isFarmer = booking.myRole === 'farmer';
  const accepted = isAcceptedStatus(booking.status);
  const started = (dayKeyOf(booking.bookingDate) || '') <= today;
  const actions = [];

  if (booking.status === 'pending') {
    if (isFarmer) actions.push('cancel');
    else actions.push('reject', 'accept');
  }

  if (accepted) {
    actions.push('cancel');
    if (started) actions.push('complete');
  }

  if (booking.status === 'completed' && booking.canReview) {
    actions.push('review');
  }

  return actions;
};

/*
 * Booking form -> request body, or {error}.
 */
export const buildBookingPayload = (
  form,
  { maxDays = DEFAULT_MAX_BOOKING_DAYS, today = todayInIndiaKey() } = {},
) => {
  if (!form.bookingDate) return { error: i18n.t('labourFormat.chooseTheWorkDate') };
  if (form.bookingDate < today)
    return { error: i18n.t('labourFormat.theWorkDateCannotBe') };

  const numberOfDays = Number(form.numberOfDays) || 1;

  if (
    !Number.isInteger(numberOfDays) ||
    numberOfDays < 1 ||
    numberOfDays > maxDays
  ) {
    return { error: i18n.t('labourFormat.numberOfDaysMustBe', {maxDays}) };
  }

  const start = parseTime(form.startTime);
  if (start === null) return { error: i18n.t('labourFormat.chooseAStartTime') };

  const end = form.endTime ? parseTime(form.endTime) : null;
  if (form.endTime && end === null) return { error: i18n.t('labourFormat.invalidEndTime') };
  if (end !== null && end <= start)
    return { error: i18n.t('labourFormat.endTimeMustBeAfter') };

  if (form.wageType === 'hourly' && end === null) {
    return { error: i18n.t('labourFormat.addAnEndTimeFor') };
  }

  if (!(form.workType || '').trim())
    return { error: i18n.t('labourFormat.chooseTheTypeOfWork') };

  const wage = Number(form.wage);
  if (!Number.isFinite(wage) || wage <= 0)
    return { error: i18n.t('labourFormat.enterAValidWage') };

  const trim = value => (value || '').trim();

  return {
    payload: {
      labourerId: form.labourerId,
      bookingDate: form.bookingDate,
      numberOfDays,
      startTime: minutesToTime(start),
      endTime: end === null ? '' : minutesToTime(end),
      workType: trim(form.workType),
      description: trim(form.description),
      wage,
      wageType: form.wageType,
      state: trim(form.state),
      district: trim(form.district),
      village: trim(form.village),
      address: trim(form.address),
      farmerNotes: trim(form.farmerNotes),
    },
  };
};

const numberOrNull = value => {
  const text = String(value ?? '').trim();
  return text ? Number(text) : null;
};

/*
 * Labourer profile form -> request body, or {error, field}. Mirrors the
 * server's checks so the message shows before a round trip.
 */
export const buildLabourerPayload = form => {
  const fullName = (form.fullName || '').trim();
  if (!fullName) return { error: i18n.t('labourFormat.enterYourFullName'), field: 'fullName' };

  const phoneNumber = (form.phoneNumber || '').trim();
  if (phoneNumber && !/^\+?[0-9\s-]{10,15}$/.test(phoneNumber)) {
    return { error: i18n.t('labourFormat.enterAValidPhoneNumber'), field: 'phoneNumber' };
  }

  const labourType = (form.labourType || '').trim();
  if (!labourType)
    return { error: i18n.t('labourFormat.chooseTheMainWorkYou'), field: 'labourType' };

  const age = numberOrNull(form.age);
  if (age !== null && (!Number.isInteger(age) || age < 18 || age > 100)) {
    return { error: i18n.t('labourFormat.ageMustBeBetween18'), field: 'age' };
  }

  const experience = numberOrNull(form.experience) ?? 0;
  if (!Number.isFinite(experience) || experience < 0 || experience > 80) {
    return {
      error: i18n.t('labourFormat.experienceMustBeBetween0'),
      field: 'experience',
    };
  }

  const expectedWage = numberOrNull(form.expectedWage);
  if (
    expectedWage === null ||
    !Number.isFinite(expectedWage) ||
    expectedWage <= 0
  ) {
    return { error: i18n.t('labourFormat.enterTheWageYouExpect'), field: 'expectedWage' };
  }

  if (
    form.availableFrom &&
    form.availableUntil &&
    form.availableUntil < form.availableFrom
  ) {
    return {
      error: i18n.t('labourFormat.availableUntilMustBeAfter'),
      field: 'availableUntil',
    };
  }

  const list = values => [
    ...new Set((values || []).map(value => value.trim()).filter(Boolean)),
  ];

  const payload = {
    fullName,
    phoneNumber,
    profileImage: form.profileImage || '',
    labourType,
    skills: list(form.skills),
    preferredWork: list(form.preferredWork),
    languages: list(form.languages),
    experience,
    experienceUnit: form.experienceUnit || 'years',
    expectedWage,
    wageType: form.wageType || 'daily',
    availability: form.availability || 'available',
    availableFrom: form.availableFrom || null,
    availableUntil: form.availableUntil || null,
    age,
    state: (form.state || '').trim(),
    district: (form.district || '').trim(),
    taluka: (form.taluka || '').trim(),
    village: (form.village || '').trim(),
  };

  if (form.gender) payload.gender = form.gender;

  return { payload };
};
