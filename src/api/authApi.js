
import apiClient from './client';

import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| SEND OTP
|--------------------------------------------------------------------------
*/

export const sendOtpApi = async email => {
  try {
    console.log(
      'LOGIN URL HIT:',
      apiClient.getUri({ url: API_ENDPOINTS.SEND_OTP }),
    );
    console.log('OTP REQUEST BODY:', { email });
    console.log('OTP REQUEST HEADERS:', {
      'Content-Type': 'application/json',
    });

    const response = await apiClient.post(
      API_ENDPOINTS.SEND_OTP,
      {
        email,
      },
    );

    console.log('OTP RESPONSE:', response.data);

    return response.data;
  } catch (error) {
    console.log('OTP ERROR STATUS:', error.response?.status);
    console.log('OTP ERROR DATA:', error.response?.data);
    console.log('OTP ERROR MESSAGE:', error.message);

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY OTP
|--------------------------------------------------------------------------
*/

export const verifyOtpApi = async ({
  email,
  otp,
}) => {
  const response = await apiClient.post(
    API_ENDPOINTS.VERIFY_OTP,
    {
      email,
      otp,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| COMPLETE PROFILE
|--------------------------------------------------------------------------
*/

export const completeProfileApi =
  async profileData => {
    const response =
      await apiClient.post(
        API_ENDPOINTS.COMPLETE_PROFILE,
        profileData,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/

export const updateProfileApi =
  async profileData => {
    const response =
      await apiClient.put(
        API_ENDPOINTS.UPDATE_PROFILE,
        profileData,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| REFRESH TOKEN
|--------------------------------------------------------------------------
*/

export const refreshTokenApi =
  async refreshToken => {
    const response =
      await apiClient.post(
        API_ENDPOINTS.REFRESH_TOKEN,
        {
          refreshToken,
        },
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/

export const getMeApi = async () => {
  const response =
    await apiClient.get(
      API_ENDPOINTS.ME,
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logoutApi =
  async refreshToken => {
    const response =
      await apiClient.post(
        API_ENDPOINTS.LOGOUT,
        {
          refreshToken,
        },
      );

    return response.data;
  };
