jest.mock('../src/data/warehouses.json', () => ({
  prepared: '2026-11-03',
  sources: ['https://example.gov.in/list'],
  warehouses: [
    {
      id: 'a',
      name: 'Takhatpur',
      category: 'state',
      state: 'Chhattisgarh',
      district: 'Bilaspur',
      commodity: 'Foodgrains',
      source: 0,
      lat: 22.13,
      lng: 81.87,
    },
    {
      id: 'b',
      name: 'Raipur CWC-1',
      category: 'central',
      state: 'Chhattisgarh',
      district: 'Raipur',
      commodity: 'Wheat and rice',
      source: 0,
      lat: 21.25,
      lng: 81.63,
      capacity: 9000,
      phones: ['9876543210'],
    },
    {
      id: 'c',
      name: 'Aurangabad MIDC',
      category: 'state',
      state: 'Maharashtra',
      district: 'Aurangabad',
      commodity: 'Foodgrains',
      source: 0,
      lat: 19.87,
      lng: 75.34,
      capacity: 15280,
    },
    {
      id: 'd',
      name: 'Lalabazar',
      category: 'central',
      state: 'Assam',
      district: '',
      commodity: 'Foodgrains',
      source: 0,
      lat: null,
      lng: null,
    },
  ],
}));

const {
  OTHER_DISTRICT,
  WAREHOUSES,
  dialUrl,
  directionsUrl,
  filterWarehouses,
  formatCapacity,
  formatDistance,
  inRegion,
  listDistricts,
  listStates,
  matchDetectedRegion,
  nearbyWarehouses,
  sortWarehouses,
  withDistances,
} = require('../src/utils/warehouseData');

const bilaspur = { latitude: 22.08, longitude: 82.14 };

describe('nearby', () => {
  test('orders by distance and leaves unlocated records last', () => {
    const list = sortWarehouses(withDistances(bilaspur), 'nearest');

    expect(list.map(item => item.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(list[0].distanceKm).toBeGreaterThan(20);
    expect(list[0].distanceKm).toBeLessThan(40);
    expect(list[3].distanceKm).toBeNull();
  });

  test('falls back to the closest records when few are within range', () => {
    const list = nearbyWarehouses(withDistances(bilaspur));

    expect(list.length).toBe(WAREHOUSES.length);
    expect(list[0].id).toBe('a');
  });

  test('no coordinates means no distances', () => {
    expect(withDistances(null).every(i => i.distanceKm === null)).toBe(true);
  });
});

describe('state and district choice', () => {
  test('lists states and districts with counts', () => {
    expect(listStates()).toContainEqual({ name: 'Chhattisgarh', count: 2 });
    expect(listDistricts('Chhattisgarh')).toEqual([
      { name: 'Bilaspur', count: 1 },
      { name: 'Raipur', count: 1 },
    ]);
  });

  test('records with no district stay reachable', () => {
    expect(listDistricts('Assam')).toEqual([
      { name: OTHER_DISTRICT, count: 1 },
    ]);
    expect(
      inRegion(WAREHOUSES, { state: 'Assam', district: OTHER_DISTRICT }),
    ).toHaveLength(1);
  });

  test('an empty district means the whole state', () => {
    expect(
      inRegion(WAREHOUSES, { state: 'Chhattisgarh', district: '' }),
    ).toHaveLength(2);
  });

  test('matches detected names, including renamed districts', () => {
    expect(
      matchDetectedRegion({
        state: 'Maharashtra',
        district: 'Chhatrapati Sambhajinagar District',
      }),
    ).toEqual({ state: 'Maharashtra', district: 'Aurangabad' });
    expect(matchDetectedRegion({ state: 'Goa', district: 'North Goa' })).toEqual(
      { state: '', district: '' },
    );
  });
});

describe('filter and sort', () => {
  test('filters by category, phone and every search word', () => {
    expect(
      filterWarehouses(WAREHOUSES, { category: 'central' }).map(i => i.id),
    ).toEqual(['b', 'd']);
    expect(
      filterWarehouses(WAREHOUSES, { phoneOnly: true }).map(i => i.id),
    ).toEqual(['b']);
    expect(
      filterWarehouses(WAREHOUSES, { query: 'raipur wheat' }).map(i => i.id),
    ).toEqual(['b']);
    expect(filterWarehouses(WAREHOUSES, { query: 'raipur sugar' })).toEqual([]);
  });

  test('largest capacity comes first, unpublished last', () => {
    expect(sortWarehouses(WAREHOUSES, 'capacity').map(i => i.id)).toEqual([
      'c',
      'b',
      'd',
      'a',
    ]);
  });
});

describe('display', () => {
  test('distances read as approximate', () => {
    expect(formatDistance(null)).toBe('');
    expect(formatDistance(0.4)).toBe('Under 1 km');
    expect(formatDistance(7.26)).toBe('≈ 7.3 km');
    expect(formatDistance(42.6)).toBe('≈ 43 km');
  });

  test('formats capacity, phone and map links', () => {
    expect(formatCapacity()).toBe('');
    expect(formatCapacity(900)).toBe('900 MT');
    expect(dialUrl('0240-2381294')).toBe('tel:02402381294');
    expect(directionsUrl(WAREHOUSES[0])).toContain(
      encodeURIComponent('Takhatpur, Bilaspur, Chhattisgarh'),
    );
  });
});
