import axios from 'axios';

/*
|--------------------------------------------------------------------------
| LOCAL WEATHER (Visual Crossing)
|--------------------------------------------------------------------------
|
| Current conditions, 15 days and their hours for a point, in metric
| units (°C, km/h, mm). Same key the farm weather already uses.
|
| The key ships inside the app; moving this call behind the KhetiMaster
| backend would keep it private.
|
*/

const VISUAL_CROSSING_KEY = 'NAJUNXK89Y3ZLPJL3NYH6BS4E';

const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export const getLocalWeatherApi = async ({ latitude, longitude }) => {
  const response = await axios.get(`${BASE_URL}/${latitude},${longitude}`, {
    params: {
      key: VISUAL_CROSSING_KEY,
      unitGroup: 'metric',
      include: 'current,days,hours,alerts',
      contentType: 'json',
    },
    timeout: 20000,
  });

  return response.data;
};
