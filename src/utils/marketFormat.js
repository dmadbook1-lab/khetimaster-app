
import i18n from 'i18next';/*
|--------------------------------------------------------------------------
| MARKETPLACE FORMATTING / PAYLOAD HELPERS
|--------------------------------------------------------------------------
*/

// keep in sync with DISCRETE_UNITS in the backend's marketCategories.js
export const DISCRETE_UNITS = ['piece', 'dozen', 'crate', 'bag', 'packet', 'bottle'];

export const isDiscreteUnit = unit => DISCRETE_UNITS.includes(unit);

export const CONDITION_LABELS = {
  get new() {
    return i18n.t('marketFormat.new');
  },
  get like_new() {
    return i18n.t('marketFormat.likeNew');
  },
  get good() {
    return i18n.t('marketFormat.good');
  },
  get fair() {
    return i18n.t('marketFormat.fair');
  },
  get needs_repair() {
    return i18n.t('marketFormat.needsRepair');
  },
};

export const GRADE_LABELS = {
  get A() {
    return i18n.t('marketFormat.gradeA');
  },
  get B() {
    return i18n.t('marketFormat.gradeB');
  },
  get C() {
    return i18n.t('marketFormat.gradeC');
  },
  get ungraded() {
    return i18n.t('marketFormat.ungraded');
  },
};

export const LISTING_STATUS_META = {
  ACTIVE: {get label() {
    return i18n.t('common.active');
  }, color: '#159447', bg: '#EAF7EF'},
  PAUSED: {get label() {
    return i18n.t('marketFormat.paused');
  }, color: '#B7791F', bg: '#FFF6E0'},
  SOLD: {get label() {
    return i18n.t('marketFormat.soldOut');
  }, color: '#475467', bg: '#EEF0F2'},
  DELETED: {get label() {
    return i18n.t('marketFormat.removed');
  }, color: '#B42318', bg: '#FDECEA'},
};

export const DEAL_STATUS_META = {
  PENDING: {get label() {
    return i18n.t('marketFormat.negotiating');
  }, color: '#B7791F', bg: '#FFF6E0'},
  ACCEPTED: {get label() {
    return i18n.t('marketFormat.accepted');
  }, color: '#2563EB', bg: '#EAF1FF'},
  COMPLETED: {get label() {
    return i18n.t('marketFormat.completed');
  }, color: '#159447', bg: '#EAF7EF'},
  REJECTED: {get label() {
    return i18n.t('marketFormat.rejected');
  }, color: '#B42318', bg: '#FDECEA'},
  CANCELLED: {get label() {
    return i18n.t('marketFormat.cancelled');
  }, color: '#475467', bg: '#EEF0F2'},
};

/*
 * Indian digit grouping (1,23,456.5) without relying on Intl.
 */
export const formatAmount = value => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0';
  }

  const rounded = Math.round(number * 100) / 100;
  const [whole, fraction] = Math.abs(rounded).toString().split('.');

  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`
    : lastThree;

  const sign = rounded < 0 ? '-' : '';
  const decimals = fraction ? `.${fraction.padEnd(2, '0')}` : '';

  return `${sign}${grouped}${decimals}`;
};

export const formatRupees = value => `₹${formatAmount(value)}`;

export const formatQuantity = (quantity, unit) => {
  const number = Number(quantity);
  const shown = Number.isFinite(number)
    ? String(Math.round(number * 1000) / 1000)
    : '0';

  return unit ? `${shown} ${unit}` : shown;
};

export const formatPricePerUnit = (price, unit) =>
  unit ? `${formatRupees(price)}/${unit}` : formatRupees(price);

export const formatLocation = (location = {}, {short = false} = {}) => {
  const parts = short
    ? [location?.village || location?.taluka, location?.district]
    : [
        location?.village,
        location?.taluka,
        location?.district,
        location?.state,
      ];

  return parts.filter(Boolean).join(', ');
};

export const formatDate = (value, {withDay = true} = {}) => {
  const time = value ? new Date(value).getTime() : NaN;

  if (!Number.isFinite(time)) {
    return null;
  }

  return new Date(time).toLocaleDateString('en-IN', {
    ...(withDay && {day: 'numeric'}),
    month: 'short',
    year: 'numeric',
  });
};

const DAY_MS = 24 * 60 * 60 * 1000;

/*
 * Expiry status of an input (fertilizer, pesticide...).
 * Returns null when there is no expiry date.
 *
 * tone: expired | soon (30 days or less) | ok
 */
export const getExpiryInfo = (expiryDate, now = Date.now()) => {
  const time = expiryDate ? new Date(expiryDate).getTime() : NaN;

  if (!Number.isFinite(time)) {
    return null;
  }

  if (time <= now) {
    return {tone: 'expired', label: i18n.t('marketFormat.expired')};
  }

  const days = Math.ceil((time - now) / DAY_MS);

  if (days <= 30) {
    return {
      tone: 'soon',
      label: days === 1 ? i18n.t('marketFormat.expiresTomorrow') : i18n.t('marketFormat.expiresInDays', {days}),
    };
  }

  return {tone: 'ok', label: i18n.t('marketFormat.exp', {v1: formatDate(time, {withDay: false})})};
};

/*
 * Short "brand · model · year" style line for listing cards.
 */
export const listingSubtitle = listing => {
  if (!listing) return '';

  const parts =
    listing.kind === 'EQUIPMENT'
      ? [listing.brand, listing.model, listing.modelYear, CONDITION_LABELS[listing.condition]]
      : listing.kind === 'INPUTS'
      ? [listing.brand, listing.composition, listing.packSize]
      : [
          listing.variety,
          listing.grade && listing.grade !== 'ungraded' ? `Grade ${listing.grade}` : null,
        ];

  return parts.filter(Boolean).join(' · ');
};

export const timeAgo = (date, now = Date.now()) => {
  const time = new Date(date).getTime();

  if (!Number.isFinite(time)) {
    return '';
  }

  const seconds = Math.max(0, Math.floor((now - time) / 1000));

  if (seconds < 60) return i18n.t('common.just_now');

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(time).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/*
 * One-line description of where a deal stands for the current user.
 */
export const describeDealState = deal => {
  if (!deal) {
    return '';
  }

  const otherSide = deal.myRole === 'BUYER' ? 'seller' : 'buyer';

  switch (deal.status) {
    case 'PENDING':
      return deal.isMyTurn
        ? i18n.t('marketFormat.yourResponseIsNeeded')
        : i18n.t('marketFormat.waitingForTheToRespond', {otherSide});
    case 'ACCEPTED':
      return deal.myRole === 'SELLER'
        ? i18n.t('marketFormat.handOverTheGoodsThen')
        : i18n.t('marketFormat.contactTheSellerToArrange');
    case 'COMPLETED':
      return i18n.t('marketFormat.dealCompleted');
    case 'REJECTED':
      return i18n.t('marketFormat.offerWasRejected');
    case 'CANCELLED':
      return deal.cancelledBy === 'SYSTEM'
        ? deal.closingReason || i18n.t('marketFormat.closedAutomatically')
        : i18n.t('marketFormat.dealWasCancelled');
    default:
      return '';
  }
};

/*
 * Turns a number-ish form value into a number, or null when blank.
 */
const toNumber = value => {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  if (!text) return null;

  return Number(text);
};

/*
 * Builds the create / update request body from the sell form.
 *
 * On create, empty location fields are left out so the backend falls
 * back to the seller's profile location. On update every location field
 * is sent so the seller can clear one.
 */
export const buildListingPayload = (form, {isCreate = true} = {}) => {
  const payload = {
    category: form.category,
    title: (form.title || '').trim(),
    description: (form.description || '').trim(),
    images: form.images || [],
    unit: form.unit,
    quantity: toNumber(form.quantity),
    minOrderQuantity: toNumber(form.minOrderQuantity),
    pricePerUnit: toNumber(form.pricePerUnit),
    isNegotiable: Boolean(form.isNegotiable),
    deliveryAvailable: Boolean(form.deliveryAvailable),
    deliveryNotes: form.deliveryAvailable
      ? (form.deliveryNotes || '').trim()
      : '',
  };

  if (form.kind === 'PRODUCE') {
    payload.variety = (form.variety || '').trim();
    payload.grade = form.grade || 'ungraded';
    payload.isOrganic = Boolean(form.isOrganic);
    payload.harvestDate = form.harvestDate || null;
  }

  if (form.kind === 'EQUIPMENT') {
    payload.brand = (form.brand || '').trim();
    payload.model = (form.model || '').trim();
    payload.modelYear = toNumber(form.modelYear);
    payload.condition = form.condition;
    payload.usageHours = toNumber(form.usageHours);
  }

  if (form.kind === 'INPUTS') {
    payload.brand = (form.brand || '').trim();
    payload.composition = (form.composition || '').trim();
    payload.packSize = (form.packSize || '').trim();
    payload.isSealed = Boolean(form.isSealed);
    payload.manufacturingDate = form.manufacturingDate || null;
    payload.expiryDate = form.expiryDate || null;
  }

  const location = {};

  for (const key of ['state', 'district', 'taluka', 'village', 'pincode']) {
    const value = (form.location?.[key] || '').trim();

    if (value || !isCreate) {
      location[key] = value;
    }
  }

  if (Object.keys(location).length) {
    payload.location = location;
  }

  return payload;
};

/*
 * Client-side checks that mirror the backend, so farmers get the
 * message before a round trip. Returns an error message or null.
 *
 * category: the selected category from /api/market/meta, used for
 * requiresExpiry on chemicals.
 */
export const validateListingForm = (
  form,
  {isCreate = true, category = null, now = Date.now()} = {},
) => {
  if (!form.category) return i18n.t('marketFormat.pleaseChooseACategory');
  if (!(form.title || '').trim()) return i18n.t('marketFormat.pleaseEnterATitle');

  // on update 0 is allowed: the backend marks the listing sold out
  const quantity = toNumber(form.quantity);
  if (
    quantity === null ||
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    (isCreate && quantity === 0)
  ) {
    return i18n.t('marketFormat.pleaseEnterTheQuantityAvailable');
  }

  if (isDiscreteUnit(form.unit) && !Number.isInteger(quantity)) {
    return i18n.t('marketFormat.quantityMustBeAWhole', {unit: form.unit});
  }

  const price = toNumber(form.pricePerUnit);
  if (price === null || !Number.isFinite(price) || price <= 0) {
    return i18n.t('marketFormat.pleaseEnterAValidPrice');
  }

  const minOrder = toNumber(form.minOrderQuantity);
  if (minOrder !== null && (!Number.isFinite(minOrder) || minOrder < 0)) {
    return i18n.t('marketFormat.minimumOrderMustBeA');
  }

  if (form.kind === 'EQUIPMENT') {
    if (!form.condition) return i18n.t('marketFormat.pleaseChooseTheEquipmentCondition');

    const year = toNumber(form.modelYear);
    const maxYear = new Date().getFullYear() + 1;

    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > maxYear)) {
      return i18n.t('marketFormat.pleaseEnterAValidModel');
    }
  }

  if (form.kind === 'INPUTS') {
    const expiry = form.expiryDate ? new Date(form.expiryDate).getTime() : null;
    const manufacturing = form.manufacturingDate
      ? new Date(form.manufacturingDate).getTime()
      : null;

    if (category?.requiresExpiry && !expiry) {
      return i18n.t('marketFormat.expiryDateIsRequiredFor', {v1: category.label.toLowerCase()});
    }

    if (expiry !== null && expiry <= now) {
      return i18n.t('marketFormat.expiredProductsCannotBeListed');
    }

    if (manufacturing !== null && manufacturing > now) {
      return i18n.t('marketFormat.manufacturingDateCannotBeIn');
    }

    if (expiry !== null && manufacturing !== null && expiry <= manufacturing) {
      return i18n.t('marketFormat.expiryDateMustBeAfter');
    }
  }

  return null;
};

/*
 * Mirrors the backend quantity rules for an offer / counter offer.
 */
export const validateOfferQuantity = (quantity, listing) => {
  const value = Number(quantity);

  if (!String(quantity ?? '').trim() || !Number.isFinite(value) || value <= 0) {
    return i18n.t('marketFormat.enterAValidQuantity');
  }

  if (isDiscreteUnit(listing.unit) && !Number.isInteger(value)) {
    return i18n.t('marketFormat.quantityMustBeAWhole', {unit: listing.unit});
  }

  if (listing.available !== undefined && value > listing.available + 0.0005) {
    return i18n.t('marketFormat.onlyAvailable', {v1: formatQuantity(listing.available, listing.unit)});
  }

  const minimum = Math.min(listing.minOrderQuantity || 0, listing.available ?? Infinity);

  if (value + 0.0005 < minimum) {
    return i18n.t('marketFormat.minimumOrderIs', {v1: formatQuantity(minimum, listing.unit)});
  }

  return null;
};
