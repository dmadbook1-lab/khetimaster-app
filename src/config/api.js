import {API_BASE_URL, MANDI_API_KEY as ENV_MANDI_API_KEY} from '@env';

export const API_URLS = {
  main: API_BASE_URL,

  satellite: 'https://server.cropgenapp.com',

  smartAdvisory: 'https://server.cropgenapp.com',
};

export const SATELLITE_API_KEY =
  'CROPGEN_230498adklfjadsljf';

// data.gov.in key for mandi rates. Called straight from the app (not through
// our backend) because data.gov.in blocks/throttles our server's IP in
// production. MANDI_KEY is our own registered key (up to 1000 rows per call)
// and is the built-in default so release builds work even without .env;
// MANDI_API_KEY in .env overrides it. The key ships inside the app bundle
// either way (it is called from the device), so it is not a secret.
// MANDI_SAMPLE_KEY is data.gov.in's public sample key (10 rows per call,
// shared rate limit) - only used to warn if someone configures it.
const MANDI_KEY = '579b464db66ec23bdd0000014323ef38745b411f49756e65e273b098';
const MANDI_SAMPLE_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

export const MANDI_API_KEY = (ENV_MANDI_API_KEY || '').trim() || MANDI_KEY;

export const MANDI_USES_SAMPLE_KEY = MANDI_API_KEY === MANDI_SAMPLE_KEY;

export default API_URLS;