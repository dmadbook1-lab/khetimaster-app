import {
  buildPlantPayload,
  deliveryFeeFor,
  deriveOrderStatus,
  describeOrderState,
  formatAddress,
  freeDeliveryGap,
  groupItemsBySeller,
  itemStatusOf,
  stockInfo,
  validateAddress,
} from '../src/utils/nurseryFormat';

describe('delivery fee mirrors the server', () => {
  test('free from ₹500, ₹50 below', () => {
    expect(deliveryFeeFor(499)).toBe(50);
    expect(deliveryFeeFor(500)).toBe(0);
    expect(deliveryFeeFor(0)).toBe(0);
    expect(deliveryFeeFor(300, { fee: 40, freeAbove: 1000 })).toBe(40);
  });

  test('gap to free delivery', () => {
    expect(freeDeliveryGap(420)).toBe(80);
    expect(freeDeliveryGap(650)).toBe(0);
  });
});

describe('order status', () => {
  test('overall status is the least advanced active item', () => {
    expect(deriveOrderStatus(['DELIVERED', 'CONFIRMED'])).toBe('CONFIRMED');
    expect(deriveOrderStatus(['CANCELLED', 'DISPATCHED'])).toBe('DISPATCHED');
    expect(deriveOrderStatus(['CANCELLED', 'CANCELLED'])).toBe('CANCELLED');
  });

  test('older orders without item status use the order status', () => {
    expect(itemStatusOf({}, { orderStatus: 'DISPATCHED' })).toBe('DISPATCHED');
    expect(
      itemStatusOf({ status: 'DELIVERED' }, { orderStatus: 'PENDING' }),
    ).toBe('DELIVERED');
  });

  const order = {
    orderStatus: 'CONFIRMED',
    items: [
      {
        _id: 'a',
        seller: { userId: 's1', name: 'Green' },
        status: 'DISPATCHED',
        total: 200,
        quantity: 2,
      },
      {
        _id: 'b',
        seller: { userId: 's2', name: 'Roots', phoneNumber: '98' },
        status: 'CONFIRMED',
        total: 100,
        quantity: 1,
      },
      {
        _id: 'c',
        seller: { userId: 's1', name: 'Green' },
        status: 'CANCELLED',
        total: 50,
        quantity: 1,
      },
    ],
  };

  test('groups items by seller with their own status and subtotal', () => {
    const groups = groupItemsBySeller(order);
    expect(groups.map(group => group.sellerId)).toEqual(['s1', 's2']);
    expect(groups[0]).toMatchObject({ status: 'DISPATCHED', subtotal: 200 });
    expect(groups[1]).toMatchObject({ status: 'CONFIRMED', phoneNumber: '98' });
  });

  test('describes mixed and finished orders', () => {
    expect(describeOrderState(order)).toMatch(/different steps/);
    expect(
      describeOrderState({
        orderStatus: 'CANCELLED',
        cancelledBy: 'SELLER',
        items: [],
      }),
    ).toMatch(/seller/);
    expect(
      describeOrderState({
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
        items: [],
      }),
    ).toMatch(/paid/);
  });
});

describe('plant form', () => {
  const form = {
    name: ' Alphonso Mango ',
    category: 'Fruit Plants',
    price: '120.456',
    quantity: '25',
    description: '',
    images: ['a'],
    state: 'Maharashtra',
    district: 'Ratnagiri',
  };

  test('builds a trimmed payload with rounded price', () => {
    expect(buildPlantPayload(form).payload).toMatchObject({
      name: 'Alphonso Mango',
      price: 120.46,
      quantity: 25,
    });
  });

  test('price must be above zero and stock a whole number', () => {
    expect(buildPlantPayload({ ...form, price: '0' }).field).toBe('price');
    expect(buildPlantPayload({ ...form, quantity: '2.5' }).field).toBe(
      'quantity',
    );
    expect(buildPlantPayload({ ...form, quantity: '0' }).field).toBe(
      'quantity',
    );
    expect(
      buildPlantPayload({ ...form, quantity: '0' }, { isCreate: false }).payload
        .quantity,
    ).toBe(0);
  });

  test('name and category are required', () => {
    expect(buildPlantPayload({ ...form, name: ' ' }).field).toBe('name');
    expect(buildPlantPayload({ ...form, category: '' }).field).toBe('category');
  });

  test('stock labels', () => {
    expect(stockInfo(0).tone).toBe('out');
    expect(stockInfo(3).label).toBe('Only 3 left');
    expect(stockInfo(40).tone).toBe('ok');
  });
});

describe('delivery address', () => {
  const address = {
    fullName: 'Ravi',
    phoneNumber: '98765 43210',
    address: 'Near temple',
    village: 'Wai',
    district: 'Satara',
    state: 'Maharashtra',
    pincode: '412803',
  };

  test('accepts a valid address', () => {
    expect(validateAddress(address).address.fullName).toBe('Ravi');
    expect(formatAddress(address)).toBe(
      'Near temple, Wai, Satara, Maharashtra - 412803',
    );
  });

  test('checks phone and pincode like the server', () => {
    expect(validateAddress({ ...address, phoneNumber: '12345' }).field).toBe(
      'phoneNumber',
    );
    expect(validateAddress({ ...address, pincode: '4128' }).field).toBe(
      'pincode',
    );
    expect(validateAddress({ ...address, address: '' }).field).toBe('address');
  });
});
