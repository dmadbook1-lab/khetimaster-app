/*
|--------------------------------------------------------------------------
| MACHINERY RENTAL FORMATTING / PAYLOAD HELPERS
|--------------------------------------------------------------------------
|
| Prices are always calculated by the server. The estimate here mirrors
| its planBooking() so farmers see the number before sending a request.
|
*/

import {
  dayKeyOf,
  minutesToTime,
  parseTime,
  todayInIndiaKey,
} from './indiaSchedule';
import {
  AVAILABILITY_META,
  BOOKING_STATUS_META,
  isAcceptedStatus,
} from './labourFormat';

export { AVAILABILITY_META, BOOKING_STATUS_META, isAcceptedStatus };

export const DEFAULT_MAX_DAYS = 30;
export const DEFAULT_MAX_HOURS = 24;

const MINUTES_PER_DAY = 24 * 60;

export const UNIT_LABELS = {
  hour: 'hour',
  day: 'day',
  acre: 'acre',
  job: 'job',
  custom: 'booking',
};

export const FUEL_LABELS = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  electric: 'Electric',
  other: 'Other',
};

export const PAYMENT_LABELS = {
  cod: 'Cash',
  upi: 'UPI',
  card: 'Card',
  wallet: 'Wallet',
};

const DURATION_UNIT_LABELS = {
  hours: ['hour', 'hours'],
  days: ['day', 'days'],
  acres: ['acre', 'acres'],
  jobs: ['job', 'jobs'],
  custom: ['unit', 'units'],
};

const round2 = value => Math.round(value * 100) / 100;

export const formatRate = (amount, unit) =>
  `₹${round2(Number(amount) || 0)}/${UNIT_LABELS[unit] || unit}`;

export const formatDuration = (duration, durationUnit) => {
  const value = Number(duration) || 0;
  const [one, many] = DURATION_UNIT_LABELS[durationUnit] || ['unit', 'units'];

  return `${round2(value)} ${value === 1 ? one : many}`;
};

/*
 * Every way a machine can be rented: hourly, daily and each custom rate.
 */
export const getRateOptions = machinery => {
  const pricing = machinery?.pricing || {};
  const options = [];

  if (Number(pricing.hourly) > 0) {
    options.push({
      key: 'hourly',
      pricingType: 'hourly',
      label: 'By the hour',
      amount: Number(pricing.hourly),
      unit: 'hour',
    });
  }

  if (Number(pricing.daily) > 0) {
    options.push({
      key: 'daily',
      pricingType: 'daily',
      label: 'Full day',
      amount: Number(pricing.daily),
      unit: 'day',
    });
  }

  for (const rate of pricing.custom || []) {
    options.push({
      key: `custom:${rate._id || rate.name}`,
      pricingType: 'custom',
      customRateId: rate._id || null,
      customRateName: rate.name,
      label: rate.name,
      amount: Number(rate.amount),
      unit: rate.unit || 'custom',
    });
  }

  return options;
};

/*
 * "₹800/hour" - the headline price for cards.
 */
export const startingPrice = machinery => {
  const [first] = getRateOptions(machinery);
  return first ? formatRate(first.amount, first.unit) : 'Price on request';
};

/*
 * What the duration input means for a rate.
 *   hour -> hours on one day, day -> whole days, others -> quantity
 */
export const durationKind = unit => {
  if (unit === 'hour') return 'hours';
  if (unit === 'day') return 'days';
  return 'quantity';
};

/*
 * Mirrors the server's planBooking(). Returns {total, endMinute} or {error}.
 */
export const estimateRental = ({
  option,
  duration,
  startTime,
  maxDays = DEFAULT_MAX_DAYS,
  maxHours = DEFAULT_MAX_HOURS,
}) => {
  if (!option) return { error: 'Choose how you want to rent it' };

  const amount = Number(duration);
  const kind = durationKind(option.unit);

  if (kind === 'hours') {
    if (!Number.isFinite(amount) || amount <= 0 || amount > maxHours) {
      return { error: `Hours must be between 0 and ${maxHours}` };
    }

    const start = parseTime(startTime);
    const endMinute = start === null ? null : start + Math.round(amount * 60);

    if (endMinute !== null && endMinute > MINUTES_PER_DAY) {
      return { error: 'An hourly booking must finish on the same day' };
    }

    return { total: round2(option.amount * amount), endMinute };
  }

  if (kind === 'days') {
    if (!Number.isInteger(amount) || amount < 1 || amount > maxDays) {
      return { error: `Number of days must be between 1 and ${maxDays}` };
    }

    return { total: round2(option.amount * amount) };
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
    return {
      error: `Enter a valid number of ${UNIT_LABELS[option.unit] || 'unit'}s`,
    };
  }

  return { total: round2(option.amount * amount) };
};

/*
 * Booking form -> request body, or {error}.
 */
export const buildRentalPayload = (
  form,
  {
    option,
    maxDays = DEFAULT_MAX_DAYS,
    maxHours = DEFAULT_MAX_HOURS,
    today = todayInIndiaKey(),
  } = {},
) => {
  if (!form.bookingDate) return { error: 'Choose the date' };
  if (form.bookingDate < today)
    return { error: 'The date cannot be in the past' };

  const start = parseTime(form.startTime);
  if (start === null) return { error: 'Choose a start time' };

  const kind = durationKind(option?.unit);
  const end =
    kind === 'quantity' && form.endTime ? parseTime(form.endTime) : null;

  if (kind === 'quantity' && form.endTime && end === null)
    return { error: 'Invalid end time' };
  if (end !== null && end <= start)
    return { error: 'End time must be after the start time' };

  const estimate = estimateRental({
    option,
    duration: form.duration,
    startTime: form.startTime,
    maxDays,
    maxHours,
  });
  if (estimate.error) return { error: estimate.error };

  if (!(form.workType || '').trim())
    return { error: 'Choose the type of work' };

  const trim = value => (value || '').trim();

  const payload = {
    machinery: form.machineryId,
    bookingDate: form.bookingDate,
    startTime: minutesToTime(start),
    endTime: end === null ? '' : minutesToTime(end),
    workType: trim(form.workType),
    pricingType: option.pricingType,
    duration: Number(form.duration),
    selectedImplement: trim(form.selectedImplement),
    state: trim(form.state),
    district: trim(form.district),
    village: trim(form.village),
    address: trim(form.address),
    farmSize: trim(form.farmSize),
    crop: trim(form.crop),
    paymentMethod: form.paymentMethod || 'cod',
    farmerNotes: trim(form.farmerNotes),
  };

  if (option.pricingType === 'custom') {
    if (option.customRateId) payload.customRateId = option.customRateId;
    payload.customRateName = option.customRateName;
  }

  return { payload, estimate };
};

/*
 * Confirmed bookings (from the machine's bookedSlots) on a given day.
 */
export const slotsOnDay = (bookedSlots = [], dayKey) =>
  bookedSlots.filter(slot => {
    const start = dayKeyOf(slot.bookingDate);
    const end = dayKeyOf(slot.endDate) || start;
    return start && start <= dayKey && dayKey <= end;
  });

/*
 * One line on where a booking stands for the current user.
 */
export const describeRentalState = (booking, today = todayInIndiaKey()) => {
  if (!booking) return '';

  const isFarmer = booking.myRole === 'farmer';
  const started = (dayKeyOf(booking.bookingDate) || '') <= today;

  switch (booking.status) {
    case 'pending':
      return isFarmer
        ? 'Waiting for the owner to confirm'
        : 'New rental request - confirm or decline it';
    case 'confirmed':
    case 'accepted':
      if (started) return 'Work has started. Mark it completed when it is done';
      return isFarmer
        ? 'Confirmed. Call the owner to share the exact field location'
        : 'Confirmed. Reach the farm on time with the machine';
    case 'completed':
      return booking.canReview
        ? 'Work done. Rate the machine and owner'
        : 'Work completed';
    case 'rejected':
      return isFarmer
        ? booking.rejectionReason || 'The owner declined this request'
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
 * Actions the current user can take. Mirrors the server.
 */
export const getRentalActions = (booking, today = todayInIndiaKey()) => {
  if (!booking) return [];

  const isOwner = booking.myRole === 'owner';
  const started = (dayKeyOf(booking.bookingDate) || '') <= today;
  const actions = [];

  if (booking.status === 'pending') {
    if (isOwner) actions.push('reject', 'accept');
    else actions.push('cancel');
  }

  if (isAcceptedStatus(booking.status)) {
    actions.push('cancel');
    if (started) actions.push('complete');
  }

  if (booking.status === 'completed' && booking.canReview) {
    actions.push('review');
  }

  return actions;
};

/*
|--------------------------------------------------------------------------
| OWNER: MACHINE FORM
|--------------------------------------------------------------------------
*/

const numberOrNull = value => {
  const text = String(value ?? '').trim();
  return text ? Number(text) : null;
};

/*
 * Machine form -> request body, or {error, field}. Mirrors the server's
 * buildMachineryFields / buildPricing.
 */
export const buildMachineryPayload = (form, { now = new Date() } = {}) => {
  const name = (form.name || '').trim();
  if (!name) return { error: 'Enter the machine name', field: 'name' };
  if (name.length > 100)
    return { error: 'Machine name is too long', field: 'name' };

  const category = (form.category || '').trim();
  if (!category)
    return { error: 'Choose the type of machine', field: 'category' };

  const modelYear = numberOrNull(form.modelYear);
  const maxYear = now.getFullYear() + 1;

  if (
    modelYear !== null &&
    (!Number.isInteger(modelYear) || modelYear < 1900 || modelYear > maxYear)
  ) {
    return { error: 'Enter a valid model year', field: 'modelYear' };
  }

  const enginePower = numberOrNull(form.enginePowerValue);
  if (
    enginePower !== null &&
    (!Number.isFinite(enginePower) || enginePower < 0)
  ) {
    return {
      error: 'Engine power must be a positive number',
      field: 'enginePower',
    };
  }

  const hourly = numberOrNull(form.hourly) ?? 0;
  const daily = numberOrNull(form.daily) ?? 0;

  if (!Number.isFinite(hourly) || hourly < 0) {
    return {
      error: 'Hourly price must be a positive number',
      field: 'pricing',
    };
  }

  if (!Number.isFinite(daily) || daily < 0) {
    return { error: 'Daily price must be a positive number', field: 'pricing' };
  }

  const custom = [];

  for (const rate of form.customRates || []) {
    const rateName = (rate.name || '').trim();
    const amount = numberOrNull(rate.amount);

    if (!rateName && amount === null) continue;
    if (!rateName)
      return { error: 'Every custom price needs a name', field: 'pricing' };

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      return { error: `Enter a price for "${rateName}"`, field: 'pricing' };
    }

    custom.push({
      ...(rate._id ? { _id: rate._id } : {}),
      name: rateName,
      amount,
      unit: rate.unit || 'acre',
    });
  }

  if (hourly <= 0 && daily <= 0 && custom.length === 0) {
    return {
      error: 'Set at least one price: hourly, daily or a custom rate',
      field: 'pricing',
    };
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

  const description = (form.description || '').trim();
  if (description.length > 500) {
    return {
      error: 'Description must be at most 500 characters',
      field: 'description',
    };
  }

  const trim = value => (value || '').trim();
  const supportsImplements = Boolean(form.supportsImplements);

  const payload = {
    name,
    category,
    brand: trim(form.brand),
    model: trim(form.model),
    modelYear,
    images: form.images || [],
    description,
    supportsImplements,
    supportedImplements: supportsImplements
      ? form.supportedImplements || []
      : [],
    availability: form.availability || 'available',
    availableFrom: form.availableFrom || null,
    availableUntil: form.availableUntil || null,
    pricing: { hourly, daily, custom },
    state: trim(form.state),
    district: trim(form.district),
    village: trim(form.village),
    address: trim(form.address),
    ownerNotes: trim(form.ownerNotes),
  };

  if (trim(form.ownerName)) payload.ownerName = trim(form.ownerName);
  if (enginePower !== null) {
    payload.enginePower = {
      value: enginePower,
      unit: form.enginePowerUnit || 'HP',
    };
  }
  if (form.fuelType) payload.fuelType = form.fuelType;
  if (form.driveType) payload.driveType = form.driveType;

  return { payload };
};
