import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| CART
|--------------------------------------------------------------------------
|
| Every call returns the whole cart:
| {items, unavailableItems, subtotal, deliveryFee, total, totalItems}
|
*/

export const getNurseryCartApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.NURSERY_CART);

  return response.data;
};

export const addToNurseryCartApi = async ({ plantId, quantity = 1 }) => {
  const response = await apiClient.post(API_ENDPOINTS.NURSERY_ADD_TO_CART, {
    plantId,
    quantity,
  });

  return response.data;
};

export const updateNurseryCartItemApi = async (itemId, quantity) => {
  const response = await apiClient.put(
    API_ENDPOINTS.NURSERY_UPDATE_CART_ITEM(itemId),
    { quantity },
  );

  return response.data;
};

export const removeNurseryCartItemApi = async itemId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.NURSERY_REMOVE_CART_ITEM(itemId),
  );

  return response.data;
};

export const clearNurseryCartApi = async () => {
  const response = await apiClient.delete(API_ENDPOINTS.NURSERY_CLEAR_CART);

  return response.data;
};
