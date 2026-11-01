import { LABOUR_ROUTES } from './labourRoutes';
import { MACHINERY_ROUTES } from './machineryRoutes';
import { DOCTOR_ROUTES } from './doctorRoutes';
import { NURSERY_ROUTES } from './nurseryRoutes';
import { MARKET_ROUTES } from './marketRoutes';
import { MANDI_ROUTES } from './mandiRoutes';
import { GOV_ROUTES } from './govRoutes';

/*
 * Buttons AI Guru adds under a reply come as { screen, label, params }.
 * Screen keys match the backend (src/ai-guru/tools/appScreens.js); this
 * maps each one to a navigation route and its params.
 */
const SCREENS = {
  home: () => ({ route: 'Home' }),
  my_farms: () => ({ route: 'MyFarms' }),
  add_farm: () => ({ route: 'FarmMappingScreen' }),
  farm_overview: ({ fieldId }, { farms }) => {
    const farm = farms.find(item => String(item?._id) === String(fieldId));
    return farm
      ? { route: 'FarmOverview', params: { farm, farmId: farm._id } }
      : { route: 'MyFarms' };
  },
  weather: () => ({ route: 'Weather' }),
  mandi: () => ({ route: MANDI_ROUTES.HOME }),
  mandi_crop: ({ cropId, cropName }) =>
    cropName
      ? {
          route: MANDI_ROUTES.CROP,
          params: {
            cropId: cropId || String(cropName).trim().toLowerCase(),
            cropName,
          },
        }
      : { route: MANDI_ROUTES.HOME },
  labour: () => ({ route: LABOUR_ROUTES.HOME }),
  labourer_details: ({ labourerId }) => ({
    route: LABOUR_ROUTES.LABOURER_DETAILS,
    params: { labourerId },
  }),
  my_labour_bookings: () => ({ route: LABOUR_ROUTES.MY_BOOKINGS }),
  machinery: () => ({ route: MACHINERY_ROUTES.HOME }),
  machinery_details: ({ machineryId }) => ({
    route: MACHINERY_ROUTES.DETAILS,
    params: { machineryId },
  }),
  my_machinery_bookings: () => ({ route: MACHINERY_ROUTES.MY_BOOKINGS }),
  doctors: () => ({ route: DOCTOR_ROUTES.HOME }),
  doctor_details: ({ doctorId }) => ({
    route: DOCTOR_ROUTES.PROFILE,
    params: { doctorId },
  }),
  my_consultations: () => ({ route: DOCTOR_ROUTES.MY_CONSULTATIONS }),
  nursery: () => ({ route: NURSERY_ROUTES.HOME }),
  nursery_plant: ({ plantId }) => ({
    route: NURSERY_ROUTES.PLANT,
    params: { plantId },
  }),
  nursery_orders: () => ({ route: NURSERY_ROUTES.ORDERS }),
  market: () => ({ route: MARKET_ROUTES.HOME }),
  market_listing: ({ listingId }) => ({
    route: MARKET_ROUTES.LISTING_DETAILS,
    params: { listingId },
  }),
  market_sell: () => ({ route: MARKET_ROUTES.SELL }),
  market_deals: () => ({ route: MARKET_ROUTES.DEALS }),
  disease_detection: () => ({ route: 'DiseaseDetection' }),
  news: () => ({ route: 'AgricultureNews' }),
  gov_schemes: () => ({ route: GOV_ROUTES.GOVERNMENT_SCHEMES }),
  drone: () => ({ route: 'DroneServices' }),
  agri_products: () => ({ route: 'AgriProducts' }),
  community: () => ({ route: 'Community' }),
  profile: () => ({ route: 'Profile' }),
};

/**
 * @param {{ screen: string, params?: object }} action
 * @param {{ farms?: object[] }} [options]
 * @returns {{ route: string, params?: object } | null}
 */
export function resolveAiGuruAction(action, { farms = [] } = {}) {
  const build = SCREENS[action?.screen];
  return build ? build(action.params || {}, { farms }) : null;
}
