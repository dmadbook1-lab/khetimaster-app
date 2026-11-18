import { formatRupees } from './marketFormat';
import i18n from 'i18next';

/*
|--------------------------------------------------------------------------
| NURSERY RULES
|--------------------------------------------------------------------------
|
| Mirrors the server (data/nurseryOptions.js and the nursery
| controllers). Values from GET /api/nursery/meta win when loaded.
|
*/

export const ORDER_FLOW = [
  'PENDING',
  'CONFIRMED',
  'DISPATCHED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

export const DEFAULT_DELIVERY = { fee: 50, freeAbove: 500 };

export const MAX_PLANT_IMAGES = 10;

export const ORDER_STATUS_META = {
  PENDING: { get label() {
    return i18n.t('nurseryFormat.placed');
  }, color: '#B7791F', bg: '#FFF6E0' },
  CONFIRMED: { get label() {
    return i18n.t('nurseryFormat.confirmed');
  }, color: '#2563EB', bg: '#EAF1FF' },
  DISPATCHED: { get label() {
    return i18n.t('nurseryFormat.dispatched');
  }, color: '#7C3AED', bg: '#F1EAFE' },
  OUT_FOR_DELIVERY: {
    get label() {
    return i18n.t('nurseryFormat.outForDelivery');
  },
    color: '#E8710A',
    bg: '#FFF1E3',
  },
  DELIVERED: { get label() {
    return i18n.t('nurseryFormat.delivered');
  }, color: '#159447', bg: '#EAF7EF' },
  CANCELLED: { get label() {
    return i18n.t('nurseryFormat.cancelled');
  }, color: '#B42318', bg: '#FDECEA' },
};

// short labels for the progress tracker
export const TRACKER_LABELS = {
  get PENDING() {
    return i18n.t('nurseryFormat.placed');
  },
  get CONFIRMED() {
    return i18n.t('nurseryFormat.confirmed');
  },
  get DISPATCHED() {
    return i18n.t('nurseryFormat.dispatched');
  },
  get OUT_FOR_DELIVERY() {
    return i18n.t('nurseryFormat.onTheWay');
  },
  get DELIVERED() {
    return i18n.t('nurseryFormat.delivered');
  },
};

// what the seller's main button does for each status
export const SELLER_NEXT_STEP = {
  PENDING: { status: 'CONFIRMED', get label() {
    return i18n.t('nurseryFormat.confirmOrder');
  } },
  CONFIRMED: { status: 'DISPATCHED', get label() {
    return i18n.t('nurseryFormat.markDispatched');
  } },
  DISPATCHED: { status: 'OUT_FOR_DELIVERY', get label() {
    return i18n.t('nurseryFormat.outForDelivery2');
  } },
  OUT_FOR_DELIVERY: { status: 'DELIVERED', get label() {
    return i18n.t('nurseryFormat.markDelivered');
  } },
};

/*
|--------------------------------------------------------------------------
| DELIVERY
|--------------------------------------------------------------------------
*/

export const deliveryFeeFor = (subtotal, delivery = DEFAULT_DELIVERY) => {
  if (!subtotal) return 0;
  return subtotal >= delivery.freeAbove ? 0 : delivery.fee;
};

/*
 * How much more the buyer has to add for free delivery (0 when free).
 */
export const freeDeliveryGap = (subtotal, delivery = DEFAULT_DELIVERY) =>
  subtotal >= delivery.freeAbove
    ? 0
    : Math.round((delivery.freeAbove - subtotal) * 100) / 100;

/*
|--------------------------------------------------------------------------
| STATUS HELPERS
|--------------------------------------------------------------------------
*/

export const itemStatusOf = (item, order) =>
  item?.status || order?.orderStatus || 'PENDING';

export const isCancellable = status => CANCELLABLE_STATUSES.includes(status);

/*
 * The status shown for an order. The server derives orderStatus from
 * the items; this does the same for orders patched on the client.
 */
export const deriveOrderStatus = statuses => {
  const active = statuses.filter(status => status !== 'CANCELLED');
  if (!active.length) return 'CANCELLED';

  return ORDER_FLOW[
    Math.min(...active.map(status => ORDER_FLOW.indexOf(status)))
  ];
};

/*
 * Position on the tracker (0-4), or -1 when cancelled.
 */
export const trackerIndex = status => ORDER_FLOW.indexOf(status);

/*
 * Buyer order items grouped by seller, in order of appearance.
 * [{sellerId, sellerName, phoneNumber, status, items, subtotal}]
 */
export const groupItemsBySeller = order => {
  const groups = new Map();

  for (const item of order?.items || []) {
    const sellerId = String(item.seller?.userId || 'unknown');

    if (!groups.has(sellerId)) {
      groups.set(sellerId, {
        sellerId,
        sellerName: item.seller?.name || 'Seller',
        phoneNumber: item.seller?.phoneNumber || null,
        items: [],
        subtotal: 0,
      });
    }

    const group = groups.get(sellerId);
    group.items.push(item);
    if (!group.phoneNumber && item.seller?.phoneNumber) {
      group.phoneNumber = item.seller.phoneNumber;
    }
    if (itemStatusOf(item, order) !== 'CANCELLED') {
      group.subtotal += Number(item.total) || 0;
    }
  }

  return [...groups.values()].map(group => ({
    ...group,
    status: deriveOrderStatus(
      group.items.map(item => itemStatusOf(item, order)),
    ),
  }));
};

export const itemCount = items =>
  (items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

/*
 * One line telling the buyer where the order stands.
 */
export const describeOrderState = order => {
  const status = order?.orderStatus;
  const sellers = groupItemsBySeller(order);
  const mixed =
    sellers.length > 1 && new Set(sellers.map(group => group.status)).size > 1;

  if (status === 'CANCELLED') {
    return order.cancelledBy === 'SELLER'
      ? i18n.t('nurseryFormat.cancelledByTheSellerNothing')
      : i18n.t('nurseryFormat.youCancelledThisOrderNothing');
  }

  if (status === 'DELIVERED') {
    return order.paymentStatus === 'PAID'
      ? i18n.t('nurseryFormat.deliveredAndPaidEnjoyYour')
      : i18n.t('nurseryFormat.deliveredEnjoyYourPlants');
  }

  if (mixed) {
    return i18n.t('nurseryFormat.yourSellersAreAtDifferent');
  }

  return {
    PENDING: i18n.t('nurseryFormat.waitingForTheSellerTo'),
    CONFIRMED: i18n.t('nurseryFormat.confirmedTheSellerIsPacking'),
    DISPATCHED: i18n.t('nurseryFormat.dispatchedYourPlantsAreOn'),
    OUT_FOR_DELIVERY: i18n.t('nurseryFormat.outForDeliveryKeepCash'),
  }[status];
};

/*
 * One line telling the seller what to do next.
 */
export const describeSellerState = sellerStatus =>
  ({
    PENDING: i18n.t('nurseryFormat.newOrderConfirmItSo'),
    CONFIRMED: i18n.t('nurseryFormat.confirmedPackAndDispatchThe'),
    DISPATCHED: i18n.t('nurseryFormat.dispatchedMarkItWhenIt'),
    OUT_FOR_DELIVERY: i18n.t('nurseryFormat.outForDeliveryMarkDelivered'),
    DELIVERED: i18n.t('nurseryFormat.deliveredPaymentCollectedOnDelivery'),
    CANCELLED: i18n.t('nurseryFormat.cancelledStockWasPutBack'),
  }[sellerStatus] || '');

/*
|--------------------------------------------------------------------------
| PLANT DISPLAY
|--------------------------------------------------------------------------
*/

export const stockInfo = quantity => {
  const count = Number(quantity) || 0;

  if (count <= 0) return { label: i18n.t('nurseryFormat.outOfStock'), tone: 'out' };
  if (count <= 5) return { label: i18n.t('nurseryFormat.onlyLeft', {count}), tone: 'low' };
  return { label: i18n.t('nurseryFormat.inStock', {count}), tone: 'ok' };
};

export const plantLocation = plant =>
  [plant?.location?.district, plant?.location?.state]
    .filter(Boolean)
    .join(', ');

export const formatPrice = value => formatRupees(value);

/*
|--------------------------------------------------------------------------
| PLANT FORM
|--------------------------------------------------------------------------
|
| buildPlantPayload(form, {isCreate}) -> {payload} | {error, field}
| Same rules as the server's buildPlantFields.
|
*/

const trim = value => (typeof value === 'string' ? value.trim() : '');

export const buildPlantPayload = (form, { isCreate = true } = {}) => {
  const name = trim(form.name);
  const category = trim(form.category);
  const description = trim(form.description);

  if (!name) return { error: i18n.t('nurseryFormat.pleaseEnterThePlantName'), field: 'name' };
  if (name.length > 100) {
    return {
      error: i18n.t('nurseryFormat.plantNameMustBeAt'),
      field: 'name',
    };
  }

  if (!category) {
    return { error: i18n.t('nurseryFormat.pleaseChooseACategory'), field: 'category' };
  }
  if (category.length > 100) {
    return {
      error: i18n.t('nurseryFormat.categoryMustBeAtMost'),
      field: 'category',
    };
  }

  const priceText = trim(String(form.price ?? ''));
  const price = Number(priceText);

  if (!priceText || !Number.isFinite(price) || price <= 0) {
    return { error: i18n.t('nurseryFormat.priceMustBeMoreThan'), field: 'price' };
  }

  const quantityText = trim(String(form.quantity ?? ''));
  const quantity = Number(quantityText);

  if (!quantityText || !Number.isInteger(quantity) || quantity < 0) {
    return {
      error: i18n.t('nurseryFormat.stockMustBeAWhole'),
      field: 'quantity',
    };
  }

  if (isCreate && quantity === 0) {
    return { error: i18n.t('nurseryFormat.stockMustBeAtLeast'), field: 'quantity' };
  }

  if (description.length > 1000) {
    return {
      error: i18n.t('nurseryFormat.descriptionMustBeAtMost'),
      field: 'description',
    };
  }

  const images = (form.images || []).filter(Boolean);

  if (images.length > MAX_PLANT_IMAGES) {
    return {
      error: i18n.t('nurseryFormat.youCanAddAtMost', {MAX_PLANT_IMAGES}),
      field: 'images',
    };
  }

  return {
    payload: {
      name,
      category,
      description,
      images,
      price: Math.round(price * 100) / 100,
      quantity,
      state: trim(form.state),
      district: trim(form.district),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELIVERY ADDRESS
|--------------------------------------------------------------------------
|
| validateAddress(address) -> {address} | {error, field}
|
*/

export const validateAddress = input => {
  const address = {
    fullName: trim(input.fullName),
    phoneNumber: trim(input.phoneNumber),
    address: trim(input.address),
    village: trim(input.village),
    taluka: trim(input.taluka),
    district: trim(input.district),
    state: trim(input.state),
    pincode: trim(input.pincode),
  };

  if (!address.fullName) {
    return { error: i18n.t('nurseryFormat.pleaseEnterTheReceiverName'), field: 'fullName' };
  }
  if (!/^\+?[0-9\s-]{10,15}$/.test(address.phoneNumber)) {
    return {
      error: i18n.t('nurseryFormat.pleaseEnterAValid10'),
      field: 'phoneNumber',
    };
  }
  if (!address.address) {
    return {
      error: i18n.t('nurseryFormat.pleaseEnterTheHouseStreet'),
      field: 'address',
    };
  }
  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: i18n.t('nurseryFormat.pincodeMustBe6Digits'), field: 'pincode' };
  }

  return { address };
};

export const formatAddress = address =>
  [
    address?.address,
    address?.village,
    address?.taluka,
    address?.district,
    address?.state,
  ]
    .filter(Boolean)
    .join(', ') + (address?.pincode ? ` - ${address.pincode}` : '');
