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
import i18n from 'i18next';

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
  get petrol() {
    return i18n.t('machineryFormat.petrol');
  },
  get diesel() {
    return i18n.t('machineryFormat.diesel');
  },
  get electric() {
    return i18n.t('machineryFormat.electric');
  },
  get other() {
    return i18n.t('machineryFormat.other');
  },
};

export const PAYMENT_LABELS = {
  get cod() {
    return i18n.t('machineryFormat.cash');
  },
  get upi() {
    return i18n.t('machineryFormat.upi');
  },
  get card() {
    return i18n.t('machineryFormat.card');
  },
  get wallet() {
    return i18n.t('machineryFormat.wallet');
  },
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
      label: i18n.t('machineryFormat.byTheHour'),
      amount: Number(pricing.hourly),
      unit: 'hour',
    });
  }

  if (Number(pricing.daily) > 0) {
    options.push({
      key: 'daily',
      pricingType: 'daily',
      label: i18n.t('machineryFormat.fullDay'),
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
  return first ? formatRate(first.amount, first.unit) : i18n.t('machineryFormat.priceOnRequest');
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
  if (!option) return { error: i18n.t('machineryFormat.chooseHowYouWantTo') };

  const amount = Number(duration);
  const kind = durationKind(option.unit);

  if (kind === 'hours') {
    if (!Number.isFinite(amount) || amount <= 0 || amount > maxHours) {
      return { error: i18n.t('machineryFormat.hoursMustBeBetween0', {maxHours}) };
    }

    const start = parseTime(startTime);
    const endMinute = start === null ? null : start + Math.round(amount * 60);

    if (endMinute !== null && endMinute > MINUTES_PER_DAY) {
      return { error: i18n.t('machineryFormat.anHourlyBookingMustFinish') };
    }

    return { total: round2(option.amount * amount), endMinute };
  }

  if (kind === 'days') {
    if (!Number.isInteger(amount) || amount < 1 || amount > maxDays) {
      return { error: i18n.t('machineryFormat.numberOfDaysMustBe', {maxDays}) };
    }

    return { total: round2(option.amount * amount) };
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
    return {
      error: i18n.t('machineryFormat.enterAValidNumberOf', {v1: UNIT_LABELS[option.unit] || 'unit'}),
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
  if (!form.bookingDate) return { error: i18n.t('machineryFormat.chooseTheDate') };
  if (form.bookingDate < today)
    return { error: i18n.t('machineryFormat.theDateCannotBeIn') };

  const start = parseTime(form.startTime);
  if (start === null) return { error: i18n.t('machineryFormat.chooseAStartTime') };

  const kind = durationKind(option?.unit);
  const end =
    kind === 'quantity' && form.endTime ? parseTime(form.endTime) : null;

  if (kind === 'quantity' && form.endTime && end === null)
    return { error: i18n.t('machineryFormat.invalidEndTime') };
  if (end !== null && end <= start)
    return { error: i18n.t('machineryFormat.endTimeMustBeAfter') };

  const estimate = estimateRental({
    option,
    duration: form.duration,
    startTime: form.startTime,
    maxDays,
    maxHours,
  });
  if (estimate.error) return { error: estimate.error };

  if (!(form.workType || '').trim())
    return { error: i18n.t('machineryFormat.chooseTheTypeOfWork') };

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
        ? i18n.t('machineryFormat.waitingForTheOwnerTo')
        : i18n.t('machineryFormat.newRentalRequestConfirmOr');
    case 'confirmed':
    case 'accepted':
      if (started) return i18n.t('machineryFormat.workHasStartedMarkIt');
      return isFarmer
        ? i18n.t('machineryFormat.confirmedCallTheOwnerTo')
        : i18n.t('machineryFormat.confirmedReachTheFarmOn');
    case 'completed':
      return booking.canReview
        ? i18n.t('machineryFormat.workDoneRateTheMachine')
        : i18n.t('machineryFormat.workCompleted');
    case 'rejected':
      return isFarmer
        ? booking.rejectionReason || i18n.t('machineryFormat.theOwnerDeclinedThisRequest')
        : i18n.t('machineryFormat.youDeclinedThisRequest');
    case 'cancelled':
      if (booking.cancelledBy === 'system') {
        return booking.cancellationReason || i18n.t('machineryFormat.requestExpired');
      }
      return booking.cancelledBy === booking.myRole
        ? i18n.t('machineryFormat.youCancelledThisBooking')
        : i18n.t('machineryFormat.cancelledByThe', {v1: booking.cancelledBy || i18n.t('machineryFormat.otherSide')});
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
  if (!name) return { error: i18n.t('machineryFormat.enterTheMachineName'), field: 'name' };
  if (name.length > 100)
    return { error: i18n.t('machineryFormat.machineNameIsTooLong'), field: 'name' };

  const category = (form.category || '').trim();
  if (!category)
    return { error: i18n.t('machineryFormat.chooseTheTypeOfMachine'), field: 'category' };

  const modelYear = numberOrNull(form.modelYear);
  const maxYear = now.getFullYear() + 1;

  if (
    modelYear !== null &&
    (!Number.isInteger(modelYear) || modelYear < 1900 || modelYear > maxYear)
  ) {
    return { error: i18n.t('machineryFormat.enterAValidModelYear'), field: 'modelYear' };
  }

  const enginePower = numberOrNull(form.enginePowerValue);
  if (
    enginePower !== null &&
    (!Number.isFinite(enginePower) || enginePower < 0)
  ) {
    return {
      error: i18n.t('machineryFormat.enginePowerMustBeA'),
      field: 'enginePower',
    };
  }

  const hourly = numberOrNull(form.hourly) ?? 0;
  const daily = numberOrNull(form.daily) ?? 0;

  if (!Number.isFinite(hourly) || hourly < 0) {
    return {
      error: i18n.t('machineryFormat.hourlyPriceMustBeA'),
      field: 'pricing',
    };
  }

  if (!Number.isFinite(daily) || daily < 0) {
    return { error: i18n.t('machineryFormat.dailyPriceMustBeA'), field: 'pricing' };
  }

  const custom = [];

  for (const rate of form.customRates || []) {
    const rateName = (rate.name || '').trim();
    const amount = numberOrNull(rate.amount);

    if (!rateName && amount === null) continue;
    if (!rateName)
      return { error: i18n.t('machineryFormat.everyCustomPriceNeedsA'), field: 'pricing' };

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      return { error: i18n.t('machineryFormat.enterAPriceFor', {rateName}), field: 'pricing' };
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
      error: i18n.t('machineryFormat.setAtLeastOnePrice'),
      field: 'pricing',
    };
  }

  if (
    form.availableFrom &&
    form.availableUntil &&
    form.availableUntil < form.availableFrom
  ) {
    return {
      error: i18n.t('machineryFormat.availableUntilMustBeAfter'),
      field: 'availableUntil',
    };
  }

  const description = (form.description || '').trim();
  if (description.length > 500) {
    return {
      error: i18n.t('machineryFormat.descriptionMustBeAtMost'),
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
