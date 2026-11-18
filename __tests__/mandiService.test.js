import axios from 'axios';

import {
  clearMandiCache,
  getMandiRates,
  isMandiRateLimited,
  pickOneDay,
} from '../src/api/mandiService';
import { addDaysToKey, todayInIndiaKey } from '../src/utils/indiaSchedule';

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@env', () => ({ MANDI_API_KEY: 'test-key' }), { virtual: true });

const gov = iso => iso.split('-').reverse().join('/');

const row = (iso, market, price) => ({
  state: 'Kerala',
  district: 'Ernakulam',
  market,
  commodity: 'Tomato',
  variety: 'Local',
  grade: 'FAQ',
  arrival_date: gov(iso),
  min_price: String(price - 100),
  max_price: String(price + 100),
  modal_price: String(price),
});

const today = todayInIndiaKey();
const yesterday = addDaysToKey(today, -1);

beforeEach(async () => {
  jest.useRealTimers();
  axios.get.mockReset();
  await clearMandiCache();
});

describe('pickOneDay', () => {
  const r = iso => ({ arrivalDateISO: iso });

  it('prefers today', () => {
    const out = pickOneDay([r(yesterday), r(today), r(today)], today, '2000-01-01');
    expect(out).toHaveLength(2);
    expect(out.every(x => x.arrivalDateISO === today)).toBe(true);
  });

  it('falls back to the newest earlier day and never mixes days', () => {
    const older = addDaysToKey(today, -3);
    const out = pickOneDay([r(older), r(yesterday)], today, addDaysToKey(today, -7));
    expect(out.map(x => x.arrivalDateISO)).toEqual([yesterday]);
  });

  it('drops days older than the limit', () => {
    const old = addDaysToKey(today, -10);
    expect(pickOneDay([r(old)], today, addDaysToKey(today, -7))).toEqual([]);
  });
});

describe('getMandiRates', () => {
  it('returns only today from the live feed', async () => {
    axios.get.mockResolvedValue({
      data: {
        total: 3,
        records: [row(today, 'Aluva', 1500), row(today, 'Kochi', 1700), row(yesterday, 'Aluva', 1400)],
      },
    });

    const res = await getMandiRates({ crop: 'Tomato', state: 'Kerala' });

    expect(res.date).toBe(today);
    expect(res.isToday).toBe(true);
    expect(res.total).toBe(2);
    expect(res.data.every(x => x.arrivalDateISO === today)).toBe(true);
  });

  it('serves the cache without calling data.gov.in again', async () => {
    axios.get.mockResolvedValue({ data: { total: 1, records: [row(today, 'Aluva', 1500)] } });

    await getMandiRates({ crop: 'Tomato', state: 'Kerala' });
    const calls = axios.get.mock.calls.length;
    await getMandiRates({ crop: 'Tomato', state: 'Kerala', sort: 'price_desc' });

    expect(axios.get.mock.calls.length).toBe(calls);
  });

  it('falls back to the latest earlier day from the historical dataset', async () => {
    axios.get.mockImplementation(url =>
      Promise.resolve({
        data: url.includes('35985678')
          ? { total: 1, records: [row(yesterday, 'Aluva', 1400)] }
          : { total: 0, records: [] },
      }),
    );

    const res = await getMandiRates({ crop: 'Tomato', state: 'Kerala' });

    expect(res.source).toBe('historical_latest');
    expect(res.date).toBe(yesterday);
    expect(res.isToday).toBe(false);
  });

  it('does not retry a 429 and pauses further calls', async () => {
    axios.get.mockRejectedValue({ response: { status: 429 } });

    await expect(getMandiRates({ crop: 'Tomato', state: 'Kerala' })).rejects.toMatchObject({
      status: 429,
      code: 'MANDI_RATE_LIMITED',
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(isMandiRateLimited()).toBe(true);

    await expect(getMandiRates({ crop: 'Onion', state: 'Kerala' })).rejects.toMatchObject({
      status: 429,
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
