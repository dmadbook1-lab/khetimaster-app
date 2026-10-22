import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| PLACE ORDER (CHECKOUT)
|--------------------------------------------------------------------------
|
| Orders the whole cart, cash on delivery. Prices come from the server.
|
*/

export const createNurseryOrderApi = async deliveryAddress => {
  const response = await apiClient.post(API_ENDPOINTS.NURSERY_CREATE_ORDER, {
    deliveryAddress,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| BUYER
|--------------------------------------------------------------------------
|
| params: {status: active | all | PENDING | ... | CANCELLED, page, limit}
|
*/

export const getMyNurseryOrdersApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.NURSERY_ORDERS, {
    params,
  });

  return response.data;
};

// sellers' phone numbers are included once they confirm
export const getNurseryOrderByIdApi = async orderId => {
  const response = await apiClient.get(
    API_ENDPOINTS.NURSERY_ORDER_BY_ID(orderId),
  );

  return response.data;
};

export const cancelNurseryOrderApi = async (orderId, reason = '') => {
  const response = await apiClient.put(
    API_ENDPOINTS.NURSERY_CANCEL_ORDER(orderId),
    { reason },
  );

  return response.data;
};

export const reviewNurseryOrderItemApi = async (
  orderId,
  itemId,
  { rating, comment },
) => {
  const response = await apiClient.post(
    API_ENDPOINTS.NURSERY_REVIEW_ORDER_ITEM(orderId, itemId),
    { rating, comment },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| SELLER
|--------------------------------------------------------------------------
|
| Orders containing the seller's plants, with only their items,
| sellerSubtotal and sellerStatus. Default status: active.
|
*/

export const getSellerNurseryOrdersApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.NURSERY_SELLER_ORDERS, {
    params,
  });

  return response.data;
};

/*
 * status: CONFIRMED | DISPATCHED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED
 */
export const updateSellerNurseryOrderApi = async (
  orderId,
  status,
  reason = '',
) => {
  const response = await apiClient.patch(
    API_ENDPOINTS.NURSERY_SELLER_STATUS(orderId),
    { status, reason },
  );

  return response.data;
};
