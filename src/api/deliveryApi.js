import apiClient from './client';

/*
|--------------------------------------------------------------------------
| DELIVERY PARTNERS
|--------------------------------------------------------------------------
*/

// vehicleTypes (with default rates), goodsTypes, paymentMethods, settings
export const getDeliveryMetaApi = async () => {
  const response = await apiClient.get('/api/delivery/partners/meta');
  return response.data;
};

/*
 * district (pickup district), scope (all | district), search, vehicleType,
 * minCapacity, onlineOnly, lat, lng,
 * sort (recommended | rating | price | capacity | newest), page, limit
 */
export const getDeliveryPartnersApi = async params => {
  const response = await apiClient.get('/api/delivery/partners', {params});
  return response.data;
};

// params: {district, lat, lng} for the "in your district" flag and distance
export const getDeliveryPartnerByIdApi = async (partnerId, params) => {
  const response = await apiClient.get(`/api/delivery/partners/${partnerId}`, {
    params,
  });
  return response.data;
};

export const getMyDeliveryPartnerApi = async () => {
  const response = await apiClient.get('/api/delivery/partners/me');
  return response.data;
};

export const createDeliveryPartnerApi = async data => {
  const response = await apiClient.post('/api/delivery/partners', data);
  return response.data;
};

export const updateDeliveryPartnerApi = async data => {
  const response = await apiClient.put('/api/delivery/partners/me', data);
  return response.data;
};

export const setDeliveryOnlineApi = async (isOnline, location) => {
  const response = await apiClient.patch('/api/delivery/partners/me/online', {
    isOnline,
    location,
  });
  return response.data;
};

export const updateDeliveryLocationApi = async ({lat, lng}) => {
  const response = await apiClient.patch('/api/delivery/partners/me/location', {
    lat,
    lng,
  });
  return response.data;
};

export const deactivateDeliveryPartnerApi = async () => {
  const response = await apiClient.delete('/api/delivery/partners/me');
  return response.data;
};

export const activateDeliveryPartnerApi = async () => {
  const response = await apiClient.patch('/api/delivery/partners/me/activate');
  return response.data;
};

/*
|--------------------------------------------------------------------------
| DELIVERY BOOKINGS
|--------------------------------------------------------------------------
|
| Body: {partnerId, pickup: {address, village, district, state, lat, lng,
|        contactName, contactPhone}, drop: {...}, distanceKm, goodsType,
|        weightKg, description, scheduleType: now | scheduled, pickupAt,
|        paymentMethod: cod | upi, customerNotes}
|
*/

export const getDeliveryQuoteApi = async data => {
  const response = await apiClient.post('/api/delivery/bookings/quote', data);
  return response.data;
};

export const createDeliveryBookingApi = async data => {
  const response = await apiClient.post('/api/delivery/bookings', data);
  return response.data;
};

// params: {status: active | past | all | <status>, page, limit}
export const getMyDeliveriesApi = async params => {
  const response = await apiClient.get('/api/delivery/bookings/my-bookings', {
    params,
  });
  return response.data;
};

export const getDeliveryRequestsApi = async params => {
  const response = await apiClient.get('/api/delivery/bookings/requests', {
    params,
  });
  return response.data;
};

export const getDeliveryBookingApi = async bookingId => {
  const response = await apiClient.get(`/api/delivery/bookings/${bookingId}`);
  return response.data;
};

const ACTION_PATHS = {
  accept: 'accept',
  reject: 'reject',
  cancel: 'cancel',
  arrived: 'arrived',
  picked_up: 'picked-up',
  deliver: 'deliver',
};

// action: accept | reject | cancel | arrived | picked_up | deliver
export const updateDeliveryBookingApi = async (bookingId, action, body = {}) => {
  const response = await apiClient.patch(
    `/api/delivery/bookings/${bookingId}/${ACTION_PATHS[action]}`,
    body,
  );
  return response.data;
};

export const reviewDeliveryBookingApi = async (bookingId, {rating, comment}) => {
  const response = await apiClient.post(
    `/api/delivery/bookings/${bookingId}/review`,
    {rating, comment},
  );
  return response.data;
};
