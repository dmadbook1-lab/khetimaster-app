import {
  buildListingPayload,
  describeDealState,
  formatAmount,
  formatPricePerUnit,
  getExpiryInfo,
  listingSubtitle,
  validateListingForm,
  validateOfferQuantity,
} from '../src/utils/marketFormat';

const produceForm = overrides => ({
  kind: 'PRODUCE',
  category: 'oilseeds',
  title: '  Soybean JS-335 ',
  description: '',
  images: [],
  unit: 'quintal',
  quantity: '25',
  minOrderQuantity: '',
  pricePerUnit: '4500',
  isNegotiable: true,
  variety: 'JS-335',
  grade: 'A',
  isOrganic: false,
  harvestDate: null,
  deliveryAvailable: false,
  deliveryNotes: 'ignored when delivery is off',
  location: {state: 'Maharashtra', district: '', taluka: '', village: '', pincode: ''},
  ...overrides,
});

describe('formatAmount', () => {
  test.each([
    [0, '0'],
    [999, '999'],
    [4500, '4,500'],
    [123456, '1,23,456'],
    [12345678.5, '1,23,45,678.50'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatAmount(value)).toBe(expected);
  });

  test('prices include the unit', () => {
    expect(formatPricePerUnit(4500, 'quintal')).toBe('₹4,500/quintal');
  });
});

describe('buildListingPayload', () => {
  test('omits empty location fields on create so the profile location is used', () => {
    const payload = buildListingPayload(produceForm(), {isCreate: true});

    expect(payload.location).toEqual({state: 'Maharashtra'});
    expect(payload.title).toBe('Soybean JS-335');
    expect(payload.quantity).toBe(25);
    expect(payload.minOrderQuantity).toBeNull();
    expect(payload.deliveryNotes).toBe('');
    expect(payload).not.toHaveProperty('brand');
  });

  test('sends every location field on update so one can be cleared', () => {
    const payload = buildListingPayload(produceForm(), {isCreate: false});

    expect(Object.keys(payload.location)).toEqual([
      'state',
      'district',
      'taluka',
      'village',
      'pincode',
    ]);
  });

  test('sends equipment fields only for equipment', () => {
    const payload = buildListingPayload(
      produceForm({
        kind: 'EQUIPMENT',
        category: 'tractor',
        unit: 'piece',
        quantity: '1',
        brand: 'Mahindra',
        model: '575',
        modelYear: '2019',
        condition: 'good',
        usageHours: '',
      }),
    );

    expect(payload).toMatchObject({brand: 'Mahindra', modelYear: 2019, usageHours: null});
    expect(payload).not.toHaveProperty('variety');
  });
});

describe('validateListingForm', () => {
  test('accepts a complete produce listing', () => {
    expect(validateListingForm(produceForm())).toBeNull();
  });

  test('requires whole numbers for discrete units', () => {
    expect(validateListingForm(produceForm({unit: 'bag', quantity: '2.5'}))).toMatch(
      /whole number/,
    );
  });

  test('allows quantity 0 only when editing', () => {
    expect(validateListingForm(produceForm({quantity: '0'}))).not.toBeNull();
    expect(validateListingForm(produceForm({quantity: '0'}), {isCreate: false})).toBeNull();
  });

  test('requires a condition for equipment', () => {
    expect(
      validateListingForm(produceForm({kind: 'EQUIPMENT', condition: null})),
    ).toMatch(/condition/);
  });
});

describe('validateOfferQuantity', () => {
  const listing = {unit: 'quintal', available: 10, minOrderQuantity: 5};

  test('enforces stock and minimum order', () => {
    expect(validateOfferQuantity('12', listing)).toMatch(/Only 10 quintal/);
    expect(validateOfferQuantity('3', listing)).toMatch(/Minimum order is 5/);
    expect(validateOfferQuantity('6', listing)).toBeNull();
  });

  test('lets the buyer take the remainder when less than the minimum is left', () => {
    expect(validateOfferQuantity('3', {...listing, available: 3})).toBeNull();
  });
});

describe('describeDealState', () => {
  test('tells the user when it is their turn', () => {
    expect(describeDealState({status: 'PENDING', isMyTurn: true, myRole: 'SELLER'})).toBe(
      'Your response is needed',
    );
    expect(describeDealState({status: 'PENDING', isMyTurn: false, myRole: 'BUYER'})).toBe(
      'Waiting for the seller to respond',
    );
  });
});

describe('farm inputs', () => {
  const now = new Date('2026-10-22T00:00:00Z').getTime();
  const day = 24 * 60 * 60 * 1000;
  const insecticides = {key: 'insecticides', label: 'Insecticides', requiresExpiry: true};

  const inputsForm = overrides =>
    produceForm({
      kind: 'INPUTS',
      category: 'insecticides',
      unit: 'bottle',
      quantity: '20',
      brand: 'Bayer',
      composition: 'Imidacloprid 17.8% SL',
      packSize: '250 ml',
      isSealed: true,
      manufacturingDate: new Date(now - 90 * day).toISOString(),
      expiryDate: new Date(now + 400 * day).toISOString(),
      ...overrides,
    });

  test('sends input fields only for inputs', () => {
    const payload = buildListingPayload(inputsForm());

    expect(payload).toMatchObject({
      brand: 'Bayer',
      composition: 'Imidacloprid 17.8% SL',
      packSize: '250 ml',
      isSealed: true,
    });
    expect(payload).not.toHaveProperty('variety');
    expect(payload).not.toHaveProperty('model');
  });

  test('accepts a valid chemical listing', () => {
    expect(validateListingForm(inputsForm(), {category: insecticides, now})).toBeNull();
  });

  test('requires an expiry date for chemicals', () => {
    expect(
      validateListingForm(inputsForm({expiryDate: null}), {category: insecticides, now}),
    ).toMatch(/Expiry date is required for insecticides/);
  });

  test('rejects expired products and bad date order', () => {
    expect(
      validateListingForm(inputsForm({expiryDate: new Date(now - day).toISOString()}), {
        category: insecticides,
        now,
      }),
    ).toMatch(/Expired products/);

    expect(
      validateListingForm(
        inputsForm({
          manufacturingDate: new Date(now - 10 * day).toISOString(),
          expiryDate: new Date(now - 20 * day + 40 * day).toISOString(),
        }),
        {category: insecticides, now},
      ),
    ).toBeNull();

    expect(
      validateListingForm(inputsForm({manufacturingDate: new Date(now + day).toISOString()}), {
        category: insecticides,
        now,
      }),
    ).toMatch(/future/);
  });

  test('bottles and packets must be whole numbers', () => {
    expect(validateListingForm(inputsForm({quantity: '1.5'}), {category: insecticides, now})).toMatch(
      /whole number/,
    );
  });

  test('describes how close a product is to expiry', () => {
    expect(getExpiryInfo(null, now)).toBeNull();
    expect(getExpiryInfo(new Date(now - day), now)).toMatchObject({tone: 'expired'});
    expect(getExpiryInfo(new Date(now + 10 * day), now)).toEqual({
      tone: 'soon',
      label: 'Expires in 10 days',
    });
    expect(getExpiryInfo(new Date(now + 200 * day), now)).toMatchObject({tone: 'ok'});
  });

  test('card subtitle uses brand, composition and pack size', () => {
    expect(listingSubtitle(inputsForm())).toBe('Bayer · Imidacloprid 17.8% SL · 250 ml');
  });
});
