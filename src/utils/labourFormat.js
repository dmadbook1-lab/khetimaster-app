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
  daily: 'per day',
  hourly: 'per hour',
  monthly: 'per month',
};

export const AVAILABILITY_META = {
  available: { label: 'Available', color: '#159447', bg: '#EAF7EF' },
  busy: { label: 'Busy', color: '#B7791F', bg: '#FFF6E0' },
  unavailable: { label: 'Not available', color: '#475467', bg: '#EEF0F2' },
};

export const BOOKING_STATUS_META = {
  pending: { label: 'Requested', color: '#B7791F', bg: '#FFF6E0' },
  accepted: { label: 'Confirmed', color: '#2563EB', bg: '#EAF1FF' },
  confirmed: { label: 'Confirmed', color: '#2563EB', bg: '#EAF1FF' },
  completed: { label: 'Completed', color: '#159447', bg: '#EAF7EF' },
  rejected: { label: 'Declined', color: '#B42318', bg: '#FDECEA' },
  cancelled: { label: 'Cancelled', color: '#475467', bg: '#EEF0F2' },
};

export const isAcceptedStatus = status =>
  status === 'accepted' || status === 'confirmed';

export const formatWage = (wage, wageType = 'daily') => {
  const amount = Number(wage);
  if (!Number.isFinite(amount) || amount <= 0) return 'Wage not set';

  return `₹${Math.round(amount * 100) / 100} ${
    WAGE_TYPE_LABELS[wageType] || ''
  }`.trim();
};

export const formatExperience = (experience, unit = 'years') => {
  const value = Number(experience);
  if (!Number.isFinite(value) || value <= 0) return 'New';

  const label = unit === 'months' ? 'month' : 'year';
  return `${value} ${label}${value === 1 ? '' : 's'}`;
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
        ? 'Waiting for the worker to accept your request'
        : 'New work request - accept or decline it';
    case 'accepted':
    case 'confirmed':
      if (started) {
        return 'Work has started. Mark it completed when it is done';
      }
      return isFarmer
        ? 'Confirmed. Call the worker to share the exact location'
        : 'Confirmed. Reach the farm on time';
    case 'completed':
      return booking.canReview
        ? 'Work done. Rate the worker'
        : 'Work completed';
    case 'rejected':
      return isFarmer
        ? 'The worker declined this request'
        : 'You declined this request';
    case 'cancelled':
      if (booking.cancelledBy === 'system') {
        return booking.cancellationReason || 'Request expired';
      }
      return booking.cancelledBy === booking.myRole
        ? 'You cancelled this booking'
        : `Cancelled by the ${booking.cancelledBy || 'other side'}`;
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
  if (!form.bookingDate) return { error: 'Choose the work date' };
  if (form.bookingDate < today)
    return { error: 'The work date cannot be in the past' };

  const numberOfDays = Number(form.numberOfDays) || 1;

  if (
    !Number.isInteger(numberOfDays) ||
    numberOfDays < 1 ||
    numberOfDays > maxDays
  ) {
    return { error: `Number of days must be between 1 and ${maxDays}` };
  }

  const start = parseTime(form.startTime);
  if (start === null) return { error: 'Choose a start time' };

  const end = form.endTime ? parseTime(form.endTime) : null;
  if (form.endTime && end === null) return { error: 'Invalid end time' };
  if (end !== null && end <= start)
    return { error: 'End time must be after the start time' };

  if (form.wageType === 'hourly' && end === null) {
    return { error: 'Add an end time for hourly wages' };
  }

  if (!(form.workType || '').trim())
    return { error: 'Choose the type of work' };

  const wage = Number(form.wage);
  if (!Number.isFinite(wage) || wage <= 0)
    return { error: 'Enter a valid wage' };

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
  if (!fullName) return { error: 'Enter your full name', field: 'fullName' };

  const phoneNumber = (form.phoneNumber || '').trim();
  if (phoneNumber && !/^\+?[0-9\s-]{10,15}$/.test(phoneNumber)) {
    return { error: 'Enter a valid phone number', field: 'phoneNumber' };
  }

  const labourType = (form.labourType || '').trim();
  if (!labourType)
    return { error: 'Choose the main work you do', field: 'labourType' };

  const age = numberOrNull(form.age);
  if (age !== null && (!Number.isInteger(age) || age < 18 || age > 100)) {
    return { error: 'Age must be between 18 and 100', field: 'age' };
  }

  const experience = numberOrNull(form.experience) ?? 0;
  if (!Number.isFinite(experience) || experience < 0 || experience > 80) {
    return {
      error: 'Experience must be between 0 and 80',
      field: 'experience',
    };
  }

  const expectedWage = numberOrNull(form.expectedWage);
  if (
    expectedWage === null ||
    !Number.isFinite(expectedWage) ||
    expectedWage <= 0
  ) {
    return { error: 'Enter the wage you expect', field: 'expectedWage' };
  }

  if (
    form.availableFrom &&
    form.availableUntil &&
    form.availableUntil < form.availableFrom
  ) {
    return {
      error: '"Available until" must be after "available from"',
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
