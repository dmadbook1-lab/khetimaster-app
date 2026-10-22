import {
  bestGain,
  formatPerKg,
  formatQuintal,
  groupCrops,
  percentDiff,
  scopeLabel,
  scopeParams,
  searchCrops,
  shortPrice,
  topMarkets,
  trendDates,
} from '../src/utils/mandiFormat';

const crops = [
  {
    id: 'onion',
    name: 'Onion',
    commodity: 'Onion',
    aliases: ['kanda', 'pyaz'],
    category: 'Vegetables',
  },
  {
    id: 'arhar',
    name: 'Arhar / Tur',
    commodity: 'Red gram/Arhar/Tur(whole)',
    aliases: ['tur'],
    category: 'Pulses',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    commodity: 'Wheat',
    aliases: ['gehun'],
    category: 'Cereals',
  },
];

describe('prices', () => {
  test('quintal and per kg', () => {
    expect(formatQuintal(2450)).toBe('₹2,450');
    expect(formatPerKg(2450)).toBe('₹24.5/kg');
    expect(formatPerKg(null)).toBe('—');
    expect(shortPrice(2450)).toBe('2.5k');
    expect(shortPrice(125000)).toBe('1.3L');
  });

  test('percent difference and best gain', () => {
    expect(percentDiff(2600, 2000)).toBe(30);
    expect(percentDiff(1, 0)).toBeNull();
    expect(
      bestGain({ averageModalPrice: 2000, highestModal: { modalPrice: 2500 } }),
    ).toEqual({ amount: 500, percent: 25 });
  });
});

describe('crops', () => {
  test('groups in category order', () => {
    expect(groupCrops(crops).map(group => group.category)).toEqual([
      'Vegetables',
      'Cereals',
      'Pulses',
    ]);
  });

  test('searches names and local aliases', () => {
    expect(searchCrops(crops, 'kanda')[0].id).toBe('onion');
    expect(searchCrops(crops, 'TUR')[0].id).toBe('arhar');
    expect(searchCrops(crops, '')).toHaveLength(3);
  });
});

describe('scope', () => {
  const location = { state: 'Maharashtra', district: 'Nashik' };

  test('builds query params', () => {
    expect(scopeParams('district', location)).toEqual(location);
    expect(scopeParams('state', location)).toEqual({ state: 'Maharashtra' });
    expect(scopeParams('india', location)).toEqual({});
    // no district chosen: falls back to the state
    expect(scopeParams('district', { state: 'Goa' })).toEqual({ state: 'Goa' });
  });

  test('labels', () => {
    expect(scopeLabel('district', location)).toBe('Nashik');
    expect(scopeLabel('state', location)).toBe('Maharashtra');
    expect(scopeLabel('india', location)).toBe('All India');
  });
});

describe('charts', () => {
  test('trend dates end yesterday, oldest first', () => {
    expect(trendDates('2026-10-22', 3)).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
    ]);
  });

  test('top markets keep the best variety per market', () => {
    const records = [
      {
        market: 'Lasalgaon',
        district: 'Nashik',
        state: 'MH',
        modalPrice: 2000,
      },
      {
        market: 'Lasalgaon',
        district: 'Nashik',
        state: 'MH',
        modalPrice: 2400,
      },
      {
        market: 'Pimpalgaon',
        district: 'Nashik',
        state: 'MH',
        modalPrice: 2200,
      },
      { market: 'Yeola', district: 'Nashik', state: 'MH', modalPrice: null },
    ];
    expect(
      topMarkets(records).map(item => [item.market, item.modalPrice]),
    ).toEqual([
      ['Lasalgaon', 2400],
      ['Pimpalgaon', 2200],
    ]);
  });
});
