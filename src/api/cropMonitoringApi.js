import axios from 'axios';
import {SATELLITE_API_KEY} from '@env';

/*
|--------------------------------------------------------------------------
| SATELLITE API
|--------------------------------------------------------------------------
*/

const SATELLITE_API_BASE_URL =
  'https://server.cropgenapp.com';

const satelliteApi = axios.create({
  baseURL: SATELLITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': SATELLITE_API_KEY,
  },
});

/*
|--------------------------------------------------------------------------
| SATELLITE AVAILABILITY
|--------------------------------------------------------------------------
*/

export const getSatelliteAvailabilityApi = async ({
  geometry,
  startDate,
  endDate,
}) => {
  if (!geometry) {
    throw new Error('Farm geometry is required');
  }

  if (!startDate) {
    throw new Error('Start date is required');
  }

  if (!endDate) {
    throw new Error('End date is required');
  }

  const payload = {
    geometry,
    start_date: startDate,
    end_date: endDate,
  };

  console.log(
    '[Satellite Availability] Payload:',
    JSON.stringify(payload, null, 2),
  );

  try {
    const response = await satelliteApi.post(
      '/v4/api/availability/',
      payload,
    );

    console.log(
      '[Satellite Availability] Status:',
      response.status,
    );

    return response.data;
  } catch (error) {
    console.log(
      '[Satellite Availability] Error:',
      error?.response?.status,
      error?.response?.data,
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| SATELLITE INDEX
|--------------------------------------------------------------------------
*/

export const getSatelliteIndexApi = async ({
  geometry,
  date,
  indexName,
}) => {
  if (!geometry) {
    throw new Error('Farm geometry is required');
  }

  if (!date) {
    throw new Error('Satellite date is required');
  }

  if (!indexName) {
    throw new Error('Satellite index is required');
  }

  /*
  |--------------------------------------------------------------------------
  | EXACT REQUEST BODY EXPECTED BY BACKEND
  |--------------------------------------------------------------------------
  */

  const payload = {
    geometry: {
      type: 'Polygon',
      coordinates: geometry.coordinates,
    },

    date: date,

    index_name: indexName,

    provider: 'both',

    satellite: 's2',

    width: 256,

    height: 256,

    supersample: 1,

    smooth: false,

    gaussian_sigma: 1,
  };

  console.log('==========================================');
  console.log('[Satellite Index] URL:');
  console.log(
    `${SATELLITE_API_BASE_URL}/v4/api/calculate/index`,
  );

  console.log('[Satellite Index] Payload:');
  console.log(JSON.stringify(payload, null, 2));

  console.log('==========================================');

  try {
    const response = await satelliteApi.post(
      '/v4/api/calculate/index',
      payload,
    );

    console.log(
      '[Satellite Index] SUCCESS:',
      response.status,
    );

    return response.data;
  } catch (error) {
    console.log('==========================================');
    console.log('[Satellite Index] FAILED');
    console.log(
      'Status:',
      error?.response?.status,
    );
    console.log(
      'Response:',
      JSON.stringify(
        error?.response?.data,
        null,
        2,
      ),
    );
    console.log(
      'Message:',
      error?.message,
    );
    console.log('==========================================');

    throw error;
  }
};

export default satelliteApi;