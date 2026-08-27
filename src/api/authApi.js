import apiClient from './client';
import API_ENDPOINTS from './endpoints';

// SEND OTP

export const sendOtpApi = async email => {
  const response = await apiClient.post(
    API_ENDPOINTS.SEND_OTP,
    {
      email,
    },
  );

  return response.data;
};

// VERIFY OTP

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

// COMPLETE PROFILE


export const completeProfileApi = async profileData => {
  const response = await apiClient.post(
    API_ENDPOINTS.COMPLETE_PROFILE,
    profileData,
  );

  return response.data;
};

// REFRESH TOKEN

export const refreshTokenApi = async refreshToken => {
  const response = await apiClient.post(
    API_ENDPOINTS.REFRESH_TOKEN,
    {
      refreshToken,
    },
  );

  return response.data;
};

// GET CURRENT USER

export const getMeApi = async () => {
  const response = await apiClient.get(
    API_ENDPOINTS.ME,
  );

  return response.data;
};

// LOGOUT

export const logoutApi = async refreshToken => {
  const response = await apiClient.post(
    API_ENDPOINTS.LOGOUT,
    {
      refreshToken,
    },
  );

  return response.data;
};