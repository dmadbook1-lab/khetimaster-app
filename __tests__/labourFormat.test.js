import {
  addDaysToKey,
  buildBookingPayload,
  buildLabourerPayload,
  dayKeyOf,
  describeBookingState,
  estimateTotal,
  formatDateRange,
  formatDay,
  formatTime,
  getBookingActions,
  parseTime,
  todayInIndiaKey,
} from '../src/utils/labourFormat';

const today = '2026-10-22';

describe('dates', () => {
  test('today follows Indian time, not UTC', () => {
    // 20:00 UTC on the 21st is 01:30 on the 22nd in India
    expect(todayInIndiaKey(Date.UTC(2026, 9, 21, 20, 0))).toBe('2026-10-22');
    expect(todayInIndiaKey(Date.UTC(2026, 9, 21, 18, 0))).toBe('2026-10-21');
  });

  test('stored booking days are read as UTC midnight', () => {
    expect(dayKeyOf('2026-10-25T00:00:00.000Z')).toBe('2026-10-25');
    expect(formatDay('2026-10-25T00:00:00.000Z')).toBe('Sun, 25 Oct 2026');
  });

  test('multi-day ranges cross month ends', () => {
    expect(addDaysToKey('2026-10-30', 3)).toBe('2026-11-02');
    expect(formatDateRange('2026-10-30', 4)).toBe('30 Oct - 2 Nov 2026');
    expect(formatDateRange('2026-10-30', 1)).toBe('Fri, 30 Oct 2026');
  });
});

describe('times', () => {
  test.each([
    ['08:00', 480],
    ['8:30 AM', 510],
    ['12 PM', 720],
    ['12:15 AM', 15],
    ['17:45', 1065],
    ['25:00', null],
    ['8', null],
  ])('parses %p', (value, minutes) => {
    expect(parseTime(value)).toBe(minutes);
  });

  test('shows 12 hour times', () => {
    expect(formatTime('17:30')).toBe('5:30 PM');
    expect(formatTime('00:00')).toBe('12:00 AM');
  });
});

describe('estimateTotal mirrors the server formula', () => {
  test('daily, hourly and monthly wages', () => {
    expect(estimateTotal({wage: 500, wageType: 'daily', numberOfDays: 3})).toBe(1500);
    expect(
      estimateTotal({
        wage: 80,
        wageType: 'hourly',
        numberOfDays: 2,
        startTime: '08:00',
        endTime: '12:30',
      }),
    ).toBe(720);
    expect(estimateTotal({wage: 12000, wageType: 'monthly', numberOfDays: 31})).toBe(24000);
  });
});

describe('buildBookingPayload', () => {
  const form = {
    labourerId: 'abc',
    bookingDate: '2026-10-25',
    numberOfDays: 2,
    startTime: '8:00 AM',
    endTime: '5:00 PM',
    workType: ' Harvesting ',
    wage: '500',
    wageType: 'daily',
  };

  test('sends 24 hour times and trimmed text', () => {
    const {payload} = buildBookingPayload(form, {today});

    expect(payload).toMatchObject({
      bookingDate: '2026-10-25',
      numberOfDays: 2,
      startTime: '08:00',
      endTime: '17:00',
      workType: 'Harvesting',
      wage: 500,
    });
  });

  test.each([
    [{bookingDate: '2026-10-21'}, /past/],
    [{numberOfDays: 120}, /between 1 and 90/],
    [{endTime: '07:00'}, /after the start/],
    [{wageType: 'hourly', endTime: ''}, /end time for hourly/],
    [{workType: ''}, /type of work/],
    [{wage: '0'}, /valid wage/],
  ])('rejects %p', (change, message) => {
    expect(buildBookingPayload({...form, ...change}, {today}).error).toMatch(message);
  });
});

describe('buildLabourerPayload', () => {
  const form = {
    fullName: ' Ramesh Patil ',
    phoneNumber: '9876543210',
    labourType: 'Harvesting',
    skills: ['Sickle work', ' Sickle work ', ''],
    expectedWage: '450',
    age: '',
    experience: '',
  };

  test('cleans up the profile', () => {
    const {payload} = buildLabourerPayload(form);

    expect(payload).toMatchObject({
      fullName: 'Ramesh Patil',
      skills: ['Sickle work'],
      age: null,
      experience: 0,
      expectedWage: 450,
    });
    expect(payload).not.toHaveProperty('gender');
  });

  test.each([
    [{age: '16'}, /between 18 and 100/],
    [{phoneNumber: '123'}, /valid phone/],
    [{labourType: ''}, /main work/],
    [{expectedWage: ''}, /wage you expect/],
    [{availableFrom: '2026-11-10', availableUntil: '2026-11-01'}, /must be after/],
  ])('rejects %p', (change, message) => {
    expect(buildLabourerPayload({...form, ...change}).error).toMatch(message);
  });
});

describe('booking actions by role', () => {
  const booking = {status: 'pending', bookingDate: '2026-10-25T00:00:00.000Z'};

  test('a labourer accepts or declines; a farmer can only cancel a request', () => {
    expect(getBookingActions({...booking, myRole: 'labourer'}, today)).toEqual(['reject', 'accept']);
    expect(getBookingActions({...booking, myRole: 'farmer'}, today)).toEqual(['cancel']);
  });

  test('completing is only offered once the work has started', () => {
    const accepted = {...booking, status: 'accepted', myRole: 'farmer'};

    expect(getBookingActions(accepted, today)).toEqual(['cancel']);
    expect(getBookingActions(accepted, '2026-10-25')).toEqual(['cancel', 'complete']);
  });

  test('farmer reviews completed work once', () => {
    expect(
      getBookingActions({...booking, status: 'completed', myRole: 'farmer', canReview: true}, today),
    ).toEqual(['review']);
    expect(getBookingActions({...booking, status: 'completed', myRole: 'farmer'}, today)).toEqual(
      [],
    );
  });

  test('describes expired requests with the server reason', () => {
    expect(
      describeBookingState({
        status: 'cancelled',
        cancelledBy: 'system',
        cancellationReason: 'Request expired',
        myRole: 'farmer',
      }),
    ).toBe('Request expired');
  });
});
