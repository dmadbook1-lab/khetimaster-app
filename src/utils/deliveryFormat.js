/*
|--------------------------------------------------------------------------
| DELIVERY FORMATTING / PAYLOAD HELPERS
|--------------------------------------------------------------------------
|
| Fare and distance here are estimates that mirror the server. The
| server's numbers (quote / booking) are what the customer pays.
|
*/

import i18n from 'i18next';

import {tOpt} from './tOpt';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const t = (key, options) => i18n.t(`delivery.${key}`, options);

/*
|--------------------------------------------------------------------------
| STATUS META
|--------------------------------------------------------------------------
*/

const meta = (key, color, bg) => ({
  get label() {
    return t(`status.${key}`);
  },
  color,
  bg,
});

export const TRIP_STATUS_META = {
  requested: meta('requested', '#B7791F', '#FFF6E0'),
  accepted: meta('accepted', '#2563EB', '#EAF1FF'),
  arrived: meta('arrived', '#7C3AED', '#F1EBFF'),
  picked_up: meta('picked_up', '#E8710A', '#FFF1E3'),
  delivered: meta('delivered', '#159447', '#EAF7EF'),
  rejected: meta('rejected', '#B42318', '#FDECEA'),
  cancelled: meta('cancelled', '#475467', '#EEF0F2'),
};

export const DRIVER_STATE_META = {
  available: meta('available', '#159447', '#EAF7EF'),
  on_trip: meta('on_trip', '#E8710A', '#FFF1E3'),
  offline: meta('offline', '#475467', '#EEF0F2'),
};

export const ACTIVE_TRIP_STATUSES = [
  'requested',
  'accepted',
  'arrived',
  'picked_up',
];

export const ON_TRIP_STATUSES = ['accepted', 'arrived', 'picked_up'];

// Timeline steps on the trip screen, in order.
export const TRIP_STEPS = [
  'requested',
  'accepted',
  'arrived',
  'picked_up',
  'delivered',
];

export const TRIP_STEP_TIME_KEY = {
  requested: 'createdAt',
  accepted: 'acceptedAt',
  arrived: 'arrivedAt',
  picked_up: 'pickedUpAt',
  delivered: 'deliveredAt',
};

/*
|--------------------------------------------------------------------------
| TIME (India)
|--------------------------------------------------------------------------
*/

const toIndian = value => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + IST_OFFSET_MS);
};

const dayNumber = indian => Math.floor(indian.getTime() / DAY_MS);

// '4:30 PM'
export const formatClock = value => {
  const indian = toIndian(value);
  if (!indian) return '';

  const hours = indian.getUTCHours();
  const minutes = String(indian.getUTCMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';

  return `${hours % 12 || 12}:${minutes} ${suffix}`;
};

// 'Today, 4:30 PM' | 'Tomorrow, 9:00 AM' | '24 Nov, 9:00 AM'
export const formatWhen = (value, now = Date.now()) => {
  const indian = toIndian(value);
  if (!indian) return '';

  const diff = dayNumber(indian) - dayNumber(new Date(now + IST_OFFSET_MS));
  const day =
    diff === 0
      ? i18n.t('common.today')
      : diff === 1
      ? i18n.t('common.tomorrow')
      : diff === -1
      ? t('yesterday')
      : `${indian.getUTCDate()} ${MONTHS[indian.getUTCMonth()]}`;

  return `${day}, ${formatClock(value)}`;
};

export const minutesUntil = (value, now = Date.now()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round((date.getTime() - now) / 60000);
};

// 45 -> '45 min', 70 -> '1 h 10 min'
export const formatMinutes = minutes => {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  if (value < 60) return t('minutes', {count: value});

  const hours = Math.floor(value / 60);
  const rest = value % 60;

  return rest
    ? t('hoursMinutes', {hours, minutes: rest})
    : t('hours', {hours});
};

export const formatKm = km => {
  const value = Number(km);
  if (!Number.isFinite(value)) return '';
  return `${value < 10 ? Math.round(value * 10) / 10 : Math.round(value)} km`;
};

export const formatWeight = kg => {
  const value = Number(kg) || 0;
  if (value >= 1000) return `${Math.round(value / 100) / 10} t`;
  return `${value} kg`;
};

/*
|--------------------------------------------------------------------------
| GEO / FARE
|--------------------------------------------------------------------------
*/

const toRadians = degrees => (degrees * Math.PI) / 180;

export const hasPoint = stop =>
  Number.isFinite(Number(stop?.lat)) &&
  Number.isFinite(Number(stop?.lng)) &&
  stop?.lat !== null &&
  stop?.lng !== null &&
  !(Number(stop.lat) === 0 && Number(stop.lng) === 0);

export const haversineKm = (from, to) => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * 6371 * Math.asin(Math.sqrt(a));
};

// Same as the server: road distance ~ straight line x roadFactor.
export const estimateDistanceKm = (pickup, drop, roadFactor = 1.25) =>
  hasPoint(pickup) && hasPoint(drop)
    ? Math.round(
        haversineKm(
          {lat: Number(pickup.lat), lng: Number(pickup.lng)},
          {lat: Number(drop.lat), lng: Number(drop.lng)},
        ) *
          roadFactor *
          10,
      ) / 10
    : null;

export const estimateFare = (partner, distanceKm) => {
  const km = Number(distanceKm);
  if (!partner || !Number.isFinite(km) || km <= 0) return 0;

  const base = Number(partner.baseFare) || 0;
  const perKm = Number(partner.perKmRate) || 0;
  const min = Number(partner.minFare) || 0;

  return Math.round(Math.max(min, base + perKm * km) * 100) / 100;
};

export const formatRate = partner =>
  t('ratePerKm', {rate: Number(partner?.perKmRate) || 0});

/*
|--------------------------------------------------------------------------
| DESCRIPTIONS
|--------------------------------------------------------------------------
*/

export const stopLabel = stop =>
  [stop?.village, stop?.district].filter(Boolean).join(', ') ||
  stop?.address ||
  '';

/*
 * Why a driver is busy and until when, from the public currentTrip.
 *   'Carrying Fodder · Shirur → Pune · free by 4:30 PM'
 */
export const describeBusy = partner => {
  const trip = partner?.currentTrip;
  if (!trip) return '';

  const route = [trip.from, trip.to].filter(Boolean).join(' → ');
  const parts = [t('carrying', {goods: tOpt(trip.goodsType)})];
  if (route) parts.push(route);
  parts.push(t('freeBy', {time: formatClock(trip.busyUntil)}));

  return parts.join(' · ');
};

export const busyMinutesLeft = partner =>
  partner?.currentTrip
    ? Math.max(0, minutesUntil(partner.currentTrip.busyUntil) || 0)
    : 0;

/*
 * One line on where a trip stands for the current user.
 */
export const describeTripState = booking => {
  if (!booking) return '';

  const isCustomer = booking.myRole === 'customer';
  const name = isCustomer
    ? booking.partner?.fullName?.split(' ')[0] || t('driver')
    : booking.customer?.fullName?.split(' ')[0] || t('customer');

  switch (booking.status) {
    case 'requested':
      return isCustomer
        ? t('state.waitingDriver', {name})
        : booking.scheduleType === 'scheduled'
        ? t('state.newScheduled', {when: formatWhen(booking.pickupAt)})
        : t('state.newNow');
    case 'accepted':
      return isCustomer
        ? booking.scheduleType === 'scheduled' &&
          minutesUntil(booking.pickupAt) > 30
          ? t('state.confirmedFor', {name, when: formatWhen(booking.pickupAt)})
          : t('state.onTheWay', {name, time: formatClock(booking.pickupAt)})
        : t('state.goToPickup', {when: formatWhen(booking.pickupAt)});
    case 'arrived':
      return isCustomer
        ? t('state.arrived', {name})
        : t('state.loadGoods');
    case 'picked_up':
      return isCustomer
        ? t('state.inTransit', {time: formatClock(booking.estimatedDeliveryAt)})
        : t('state.driveToDrop');
    case 'delivered':
      return booking.canReview
        ? t('state.deliveredRate', {name})
        : t('state.deliveredAt', {when: formatWhen(booking.deliveredAt)});
    case 'rejected':
      return isCustomer
        ? booking.rejectionReason || t('state.declined', {name})
        : t('state.youDeclined');
    case 'cancelled':
      if (booking.cancelledBy === 'system') {
        return booking.cancellationReason || t('state.expired');
      }
      return booking.cancelledBy ===
        (isCustomer ? 'customer' : 'partner')
        ? t('state.youCancelled')
        : t('state.cancelledBy', {name});
    default:
      return '';
  }
};

/*
|--------------------------------------------------------------------------
| PAYLOADS
|--------------------------------------------------------------------------
*/

const trim = value => String(value ?? '').trim();
const PHONE = /^\+?[0-9\s-]{10,15}$/;

const cleanStop = stop => ({
  address: trim(stop.address),
  village: trim(stop.village),
  district: trim(stop.district),
  state: trim(stop.state),
  lat: hasPoint(stop) ? Number(stop.lat) : null,
  lng: hasPoint(stop) ? Number(stop.lng) : null,
  contactName: trim(stop.contactName),
  contactPhone: trim(stop.contactPhone),
});

/*
 * Booking form -> request body, or {error}.
 */
export const buildDeliveryPayload = (form, {partner, settings = {}} = {}) => {
  const pickup = cleanStop(form.pickup || {});
  const drop = cleanStop(form.drop || {});

  if (!pickup.address && !pickup.village) return {error: t('err.pickupAddress')};
  if (!pickup.district) return {error: t('err.pickupDistrict')};
  if (!drop.address && !drop.village) return {error: t('err.dropAddress')};

  if (pickup.contactPhone && !PHONE.test(pickup.contactPhone)) {
    return {error: t('err.phone')};
  }
  if (drop.contactPhone && !PHONE.test(drop.contactPhone)) {
    return {error: t('err.phone')};
  }

  const gpsKm = estimateDistanceKm(pickup, drop, settings.roadFactor);
  const manualKm = Number(form.distanceKm);

  if (gpsKm === null && (!Number.isFinite(manualKm) || manualKm <= 0)) {
    return {error: t('err.distance')};
  }

  if (!trim(form.goodsType)) return {error: t('err.goods')};

  const weightKg = Number(form.weightKg || 0);
  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return {error: t('err.weight')};
  }
  if (partner && weightKg > partner.capacityKg) {
    return {error: t('err.capacity', {capacity: partner.capacityKg})};
  }

  if (form.scheduleType === 'scheduled') {
    const lead = settings.minScheduleLeadMinutes || 30;
    if (!form.pickupAt || minutesUntil(form.pickupAt) < lead - 1) {
      return {error: t('err.scheduleLead', {minutes: lead})};
    }
  }

  return {
    payload: {
      partnerId: form.partnerId,
      pickup,
      drop,
      distanceKm: gpsKm === null ? manualKm : undefined,
      goodsType: trim(form.goodsType),
      weightKg,
      description: trim(form.description),
      scheduleType: form.scheduleType === 'scheduled' ? 'scheduled' : 'now',
      pickupAt:
        form.scheduleType === 'scheduled'
          ? new Date(form.pickupAt).toISOString()
          : undefined,
      paymentMethod: form.paymentMethod || 'cod',
      customerNotes: trim(form.customerNotes),
    },
  };
};

/*
 * Driver registration form -> request body, or {error, field}.
 */
export const buildPartnerPayload = form => {
  const fullName = trim(form.fullName);
  if (!fullName) return {error: t('err.name'), field: 'fullName'};

  const phoneNumber = trim(form.phoneNumber);
  if (!PHONE.test(phoneNumber)) {
    return {error: t('err.phone'), field: 'phoneNumber'};
  }

  if (!form.vehicleType) return {error: t('err.vehicle'), field: 'vehicleType'};

  const vehicleNumber = trim(form.vehicleNumber).toUpperCase();
  if (!/^[A-Z0-9\s-]{4,20}$/.test(vehicleNumber)) {
    return {error: t('err.vehicleNumber'), field: 'vehicleNumber'};
  }

  const numbers = {};
  for (const [key, min, max] of [
    ['capacityKg', 1, 50000],
    ['baseFare', 0, 100000],
    ['perKmRate', 0, 1000],
    ['minFare', 0, 100000],
  ]) {
    const value = Number(form[key]);
    if (trim(form[key]) === '' || !Number.isFinite(value) || value < min || value > max) {
      return {error: t('err.number', {min, max}), field: key};
    }
    numbers[key] = value;
  }

  if (!trim(form.district)) return {error: t('err.district'), field: 'district'};

  const payload = {
    fullName,
    phoneNumber,
    vehicleType: form.vehicleType,
    vehicleName: trim(form.vehicleName),
    vehicleNumber,
    ...numbers,
    state: trim(form.state),
    district: trim(form.district),
    taluka: trim(form.taluka),
    village: trim(form.village),
    about: trim(form.about),
    languages: (form.languages || []).map(trim).filter(Boolean),
  };

  if (hasPoint(form.location)) payload.location = form.location;

  return {payload};
};
