import {
  buildMachineryPayload,
  buildRentalPayload,
  describeRentalState,
  estimateRental,
  formatDuration,
  getRateOptions,
  getRentalActions,
  slotsOnDay,
  startingPrice,
} from '../src/utils/machineryFormat';

const today = '2026-10-22';

const machine = {
  _id: 'm1',
  pricing: {
    hourly: 800,
    daily: 5000,
    custom: [
      {_id: 'r1', name: 'Rotavation', amount: 1200, unit: 'acre'},
      {_id: 'r2', name: 'Trolley trip', amount: 500, unit: 'job'},
    ],
  },
};

const options = getRateOptions(machine);
const option = key => options.find(item => item.key === key);

describe('rate options', () => {
  test('lists hourly, daily and each custom rate', () => {
    expect(options.map(item => item.key)).toEqual(['hourly', 'daily', 'custom:r1', 'custom:r2']);
    expect(startingPrice(machine)).toBe('₹800/hour');
  });

  test('skips prices the owner did not set', () => {
    expect(getRateOptions({pricing: {hourly: 0, daily: 3000, custom: []}})).toHaveLength(1);
    expect(startingPrice({pricing: {}})).toBe('Price on request');
  });
});

describe('estimateRental mirrors the server planBooking', () => {
  test('hourly must finish on the same day', () => {
    expect(estimateRental({option: option('hourly'), duration: 4, startTime: '08:00'})).toEqual({
      total: 3200,
      endMinute: 720,
    });
    expect(
      estimateRental({option: option('hourly'), duration: 5, startTime: '8:00 PM'}).error,
    ).toMatch(/same day/);
  });

  test('daily is whole days up to the limit', () => {
    expect(estimateRental({option: option('daily'), duration: 3}).total).toBe(15000);
    expect(estimateRental({option: option('daily'), duration: 1.5}).error).toMatch(/between 1 and 30/);
    expect(estimateRental({option: option('daily'), duration: 31}).error).toMatch(/between 1 and 30/);
  });

  test('custom rates multiply by quantity', () => {
    expect(estimateRental({option: option('custom:r1'), duration: 2.5}).total).toBe(3000);
    expect(estimateRental({option: option('custom:r1'), duration: 0}).error).toMatch(/acres/);
  });
});

describe('buildRentalPayload', () => {
  const form = {
    machineryId: 'm1',
    bookingDate: '2026-10-25',
    startTime: '7:30 AM',
    endTime: '',
    duration: '2',
    workType: 'Rotavation',
    paymentMethod: 'cod',
  };

  test('custom rates send the rate id and name', () => {
    const {payload} = buildRentalPayload(form, {option: option('custom:r1'), today});

    expect(payload).toMatchObject({
      machinery: 'm1',
      pricingType: 'custom',
      customRateId: 'r1',
      customRateName: 'Rotavation',
      duration: 2,
      startTime: '07:30',
      endTime: '',
    });
  });

  test('end time is only sent for acre / job rates', () => {
    const withEnd = {...form, endTime: '5:00 PM'};

    expect(buildRentalPayload(withEnd, {option: option('custom:r1'), today}).payload.endTime).toBe('17:00');
    expect(buildRentalPayload(withEnd, {option: option('hourly'), today}).payload.endTime).toBe('');
  });

  test.each([
    [{bookingDate: '2026-10-21'}, /past/],
    [{workType: ''}, /type of work/],
    [{startTime: ''}, /start time/],
  ])('rejects %p', (change, message) => {
    expect(buildRentalPayload({...form, ...change}, {option: option('hourly'), today}).error).toMatch(
      message,
    );
  });
});

describe('buildMachineryPayload', () => {
  const form = {
    name: ' Mahindra 575 ',
    category: 'Tractor',
    modelYear: '2020',
    hourly: '800',
    daily: '',
    customRates: [{name: 'Rotavation', amount: '1200', unit: 'acre'}, {name: '', amount: ''}],
    supportsImplements: false,
    supportedImplements: ['Rotavator'],
    enginePowerValue: '45',
    enginePowerUnit: 'HP',
  };

  test('builds pricing and drops empty custom rows', () => {
    const {payload} = buildMachineryPayload(form, {now: new Date('2026-10-22')});

    expect(payload).toMatchObject({
      name: 'Mahindra 575',
      modelYear: 2020,
      pricing: {hourly: 800, daily: 0, custom: [{name: 'Rotavation', amount: 1200, unit: 'acre'}]},
      enginePower: {value: 45, unit: 'HP'},
      supportedImplements: [],
    });
  });

  test.each([
    [{name: ''}, 'name'],
    [{category: ''}, 'category'],
    [{modelYear: '1800'}, 'modelYear'],
    [{hourly: '', customRates: []}, 'pricing'],
    [{customRates: [{name: 'Ploughing', amount: ''}]}, 'pricing'],
    [{availableFrom: '2026-11-10', availableUntil: '2026-11-01'}, 'availableUntil'],
  ])('reports which field is wrong for %p', (change, field) => {
    expect(buildMachineryPayload({...form, ...change}).field).toBe(field);
  });
});

describe('rental actions and state', () => {
  const booking = {status: 'pending', bookingDate: '2026-10-25T00:00:00.000Z'};

  test('owner confirms or declines; farmer can cancel', () => {
    expect(getRentalActions({...booking, myRole: 'owner'}, today)).toEqual(['reject', 'accept']);
    expect(getRentalActions({...booking, myRole: 'farmer'}, today)).toEqual(['cancel']);
  });

  test('completion only once the work date has come', () => {
    const confirmed = {...booking, status: 'confirmed', myRole: 'owner'};
    expect(getRentalActions(confirmed, today)).toEqual(['cancel']);
    expect(getRentalActions(confirmed, '2026-10-25')).toEqual(['cancel', 'complete']);
  });

  test('describes a declined request with the owner reason', () => {
    expect(
      describeRentalState({status: 'rejected', myRole: 'farmer', rejectionReason: 'Under repair'}),
    ).toBe('Under repair');
  });

  test('formats durations and finds booked days', () => {
    expect(formatDuration(1, 'days')).toBe('1 day');
    expect(formatDuration(2.5, 'acres')).toBe('2.5 acres');

    const slots = [{bookingDate: '2026-10-24T00:00:00.000Z', endDate: '2026-10-26T00:00:00.000Z'}];
    expect(slotsOnDay(slots, '2026-10-25')).toHaveLength(1);
    expect(slotsOnDay(slots, '2026-10-27')).toHaveLength(0);
  });
});
