import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| CREATE COD ORDER
|--------------------------------------------------------------------------
*/

export const createNurseryOrderApi =
  async deliveryAddress => {
    const response =
      await apiClient.post(
        API_ENDPOINTS.NURSERY_CREATE_ORDER,
        {
          deliveryAddress,
          paymentMethod: 'COD',
        },
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/

export const getMyNurseryOrdersApi =
  async () => {
    const response =
      await apiClient.get(
        API_ENDPOINTS.NURSERY_ORDERS,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET ORDER BY ID
|--------------------------------------------------------------------------
*/

export const getNurseryOrderByIdApi =
  async orderId => {
    const response =
      await apiClient.get(
        API_ENDPOINTS.NURSERY_ORDER_BY_ID(
          orderId,
        ),
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
*/

export const cancelNurseryOrderApi =
  async orderId => {
    const response =
      await apiClient.put(
        API_ENDPOINTS.NURSERY_CANCEL_ORDER(
          orderId,
        ),
      );

    return response.data;
  };