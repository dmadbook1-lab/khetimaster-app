import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  sendOtpApi,
  verifyOtpApi,
  completeProfileApi,
  updateProfileApi,
  getMeApi,
  logoutApi,
  refreshTokenApi,
} from '../../api/authApi';

import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../../utils/tokenStorage';

/*
|--------------------------------------------------------------------------
| SEND OTP
|--------------------------------------------------------------------------
*/

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await sendOtpApi(email);

      console.log(
        'SEND OTP RESPONSE:',
        response,
      );

      return response;
    } catch (error) {
      console.log(
        'SEND OTP ERROR:',
        error.response?.data || error.message,
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to send OTP',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| VERIFY OTP
|--------------------------------------------------------------------------
*/

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (
    { email, otp },
    { rejectWithValue },
  ) => {
    try {
      const response = await verifyOtpApi({
        email,
        otp,
      });

      console.log(
        'VERIFY OTP RESPONSE:',
        response,
      );

      if (
        response?.tokens?.accessToken &&
        response?.tokens?.refreshToken
      ) {
        await saveTokens({
          accessToken:
            response.tokens.accessToken,
          refreshToken:
            response.tokens.refreshToken,
        });

        console.log(
          'LOGIN TOKENS SAVED',
        );
      }

      return response;
    } catch (error) {
      console.log(
        'VERIFY OTP ERROR:',
        error.response?.data || error.message,
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Invalid OTP',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| COMPLETE PROFILE
|--------------------------------------------------------------------------
*/

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (
    profileData,
    { rejectWithValue },
  ) => {
    try {
      const response =
        await completeProfileApi(
          profileData,
        );

      console.log(
        'COMPLETE PROFILE RESPONSE:',
        response,
      );

      if (
        response?.tokens?.accessToken &&
        response?.tokens?.refreshToken
      ) {
        await saveTokens({
          accessToken:
            response.tokens.accessToken,
          refreshToken:
            response.tokens.refreshToken,
        });

        console.log(
          'PROFILE TOKENS SAVED',
        );
      }

      return response;
    } catch (error) {
      console.log(
        'COMPLETE PROFILE ERROR:',
        error.response?.data ||
          error.message,
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to complete profile',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
*/

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    profileData,
    { rejectWithValue },
  ) => {
    try {
      const response =
        await updateProfileApi(
          profileData,
        );

      console.log(
        'UPDATE PROFILE RESPONSE:',
        response,
      );

      return response;
    } catch (error) {
      console.log(
        'UPDATE PROFILE ERROR:',
        error.response?.data ||
          error.message,
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update profile',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

export const refreshAccessToken =
  createAsyncThunk(
    'auth/refreshAccessToken',
    async (
      _,
      { rejectWithValue },
    ) => {
      try {
        const refreshToken =
          await getRefreshToken();

        if (!refreshToken) {
          return rejectWithValue(
            'Refresh token not found',
          );
        }

        const response =
          await refreshTokenApi(
            refreshToken,
          );

        console.log(
          'REFRESH TOKEN RESPONSE:',
          response,
        );

        if (
          response?.tokens?.accessToken &&
          response?.tokens?.refreshToken
        ) {
          await saveTokens({
            accessToken:
              response.tokens.accessToken,
            refreshToken:
              response.tokens.refreshToken,
          });
        }

        return response;
      } catch (error) {
        console.log(
          'REFRESH TOKEN ERROR:',
          error.response?.data ||
            error.message,
        );

        await clearTokens();

        return rejectWithValue(
          error.response?.data?.message ||
            'Session expired',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET ME
|--------------------------------------------------------------------------
*/

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (
    _,
    { rejectWithValue },
  ) => {
    try {
      const accessToken =
        await getAccessToken();

      console.log(
        'GET ME ACCESS TOKEN:',
        accessToken
          ? 'TOKEN EXISTS'
          : 'NO TOKEN',
      );

      if (!accessToken) {
        return rejectWithValue(
          'Access token not found',
        );
      }

      const response =
        await getMeApi();

      console.log(
        'GET ME RESPONSE:',
        response,
      );

      return response;
    } catch (error) {
      console.log(
        'GET ME ERROR:',
        error.response?.data ||
          error.message,
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to get user',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logout = createAsyncThunk(
  'auth/logout',
  async (
    _,
    { rejectWithValue },
  ) => {
    try {
      const refreshToken =
        await getRefreshToken();

      if (refreshToken) {
        try {
          await logoutApi(
            refreshToken,
          );
        } catch (logoutError) {
          console.log(
            'BACKEND LOGOUT ERROR:',
            logoutError.response?.data ||
              logoutError.message,
          );
        }
      }

      await clearTokens();

      return true;
    } catch (error) {
      await clearTokens();

      return rejectWithValue(
        error.response?.data?.message ||
          'Logout failed',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  user: null,
  email: '',
  isAuthenticated: false,
  isNewUser: false,
  profileCompleted: false,
  isLoading: false,
  isInitialized: false,
  otpSent: false,
  error: null,
  message: '',
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    setEmail: (
      state,
      action,
    ) => {
      state.email =
        action.payload;
    },

    clearAuthError: state => {
      state.error = null;
    },

    resetOtpState: state => {
      state.otpSent = false;
      state.error = null;
      state.message = '';
    },

    clearAuthState: state => {
      state.user = null;
      state.email = '';
      state.isAuthenticated = false;
      state.isNewUser = false;
      state.profileCompleted = false;
      state.isLoading = false;
      state.otpSent = false;
      state.error = null;
      state.message = '';
    },
  },

  extraReducers: builder => {
    /*
    |--------------------------------------------------------------------------
    | SEND OTP
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        sendOtp.pending,
        state => {
          state.isLoading = true;
          state.error = null;
          state.message = '';
        },
      )

      .addCase(
        sendOtp.fulfilled,
        (
          state,
          action,
        ) => {
          state.isLoading = false;
          state.otpSent = true;
          state.message =
            action.payload?.message ||
            '';
          state.error = null;
        },
      )

      .addCase(
        sendOtp.rejected,
        (
          state,
          action,
        ) => {
          state.isLoading = false;
          state.otpSent = false;
          state.error =
            action.payload ||
            'Failed to send OTP';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | VERIFY OTP
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        verifyOtp.pending,
        state => {
          state.isLoading = true;
          state.error = null;
          state.message = '';
        },
      )

      .addCase(
        verifyOtp.fulfilled,
        (
          state,
          action,
        ) => {
          state.isLoading = false;

          const data =
            action.payload;

          if (data?.user?.email) {
            state.email =
              data.user.email;
          }

          if (data?.user) {
            state.user =
              data.user;
          }

          state.isNewUser =
            data?.isNewUser ??
            false;

          state.profileCompleted =
            data?.profileCompleted ??
            data?.user
              ?.profileCompleted ??
            false;

          const hasTokens =
            Boolean(
              data?.tokens
                ?.accessToken &&
                data?.tokens
                  ?.refreshToken,
            );

          state.isAuthenticated =
            hasTokens;

          state.message =
            data?.message || '';

          state.error = null;
        },
      )

      .addCase(
        verifyOtp.rejected,
        (
          state,
          action,
        ) => {
          state.isLoading = false;
          state.error =
            action.payload ||
            'Invalid OTP';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | COMPLETE PROFILE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        completeProfile.pending,
        state => {
          state.isLoading = true;
          state.error = null;
          state.message = '';
        },
      )

      .addCase(
        completeProfile.fulfilled,
        (
          state,
          action,
        ) => {
          state.isLoading = false;

          const data =
            action.payload;

          state.user =
            data?.user || null;

          if (data?.user?.email) {
            state.email =
              data.user.email;
          }

          state.profileCompleted =
            true;

          state.isAuthenticated =
            true;

          state.isNewUser =
            false;

          state.message =
            data?.message || '';

          state.error = null;
        },
      )

      .addCase(
        completeProfile.rejected,
        (
          state,
          action,
        ) => {
          state.isLoading = false;
          state.error =
            action.payload ||
            'Failed to complete profile';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | UPDATE PROFILE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        updateProfile.pending,
        state => {
          state.isLoading = true;
          state.error = null;
          state.message = '';
        },
      )

      .addCase(
        updateProfile.fulfilled,
        (
          state,
          action,
        ) => {
          state.isLoading = false;

          const data =
            action.payload;

          if (data?.user) {
            state.user =
              data.user;

            state.email =
              data.user.email ||
              state.email;

            state.profileCompleted =
              data.user
                .profileCompleted ??
              state.profileCompleted;
          }

          state.isAuthenticated =
            true;

          state.isNewUser =
            false;

          state.message =
            data?.message || '';

          state.error = null;
        },
      )

      .addCase(
        updateProfile.rejected,
        (
          state,
          action,
        ) => {
          state.isLoading = false;

          state.error =
            action.payload ||
            'Failed to update profile';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | REFRESH TOKEN
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        refreshAccessToken.pending,
        state => {
          state.isLoading = true;
          state.error = null;
        },
      )

      .addCase(
        refreshAccessToken.fulfilled,
        (
          state,
          action,
        ) => {
          state.isLoading = false;
          state.isAuthenticated =
            true;

          state.message =
            action.payload?.message ||
            '';

          state.error = null;
        },
      )

      .addCase(
        refreshAccessToken.rejected,
        state => {
          state.isLoading = false;
          state.user = null;
          state.isAuthenticated =
            false;
          state.isNewUser = false;
          state.profileCompleted =
            false;
          state.error =
            'Session expired';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | GET ME
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        getMe.pending,
        state => {
          state.isLoading = true;
          state.error = null;
        },
      )

      .addCase(
        getMe.fulfilled,
        (
          state,
          action,
        ) => {
          state.isLoading = false;

          const user =
            action.payload?.user;

          if (user) {
            state.user = user;
            state.email =
              user.email || '';
            state.profileCompleted =
              user.profileCompleted ??
              false;
          }

          state.isAuthenticated =
            true;

          state.isNewUser =
            false;

          state.isInitialized =
            true;

          state.error = null;
        },
      )

      .addCase(
        getMe.rejected,
        (
          state,
          action,
        ) => {
          state.isLoading = false;
          state.user = null;
          state.isAuthenticated =
            false;
          state.profileCompleted =
            false;
          state.isInitialized =
            true;

          state.error =
            action.payload ||
            'Failed to get user';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(
        logout.pending,
        state => {
          state.isLoading = true;
          state.error = null;
        },
      )

      .addCase(
        logout.fulfilled,
        state => {
          state.isLoading = false;
          state.user = null;
          state.email = '';
          state.isAuthenticated =
            false;
          state.isNewUser = false;
          state.profileCompleted =
            false;
          state.otpSent = false;
          state.message = '';
          state.error = null;
          state.isInitialized =
            true;
        },
      )

      .addCase(
        logout.rejected,
        state => {
          state.isLoading = false;
          state.user = null;
          state.email = '';
          state.isAuthenticated =
            false;
          state.isNewUser = false;
          state.profileCompleted =
            false;
          state.otpSent = false;
          state.message = '';
          state.error = null;
          state.isInitialized =
            true;
        },
      );
  },
});

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const {
  setEmail,
  clearAuthError,
  resetOtpState,
  clearAuthState,
} = authSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectUser = state =>
  state.auth.user;

export const selectIsAuthenticated =
  state =>
    state.auth.isAuthenticated;

export const selectIsLoading = state =>
  state.auth.isLoading;

export const selectAuthError = state =>
  state.auth.error;

export const selectAuthMessage = state =>
  state.auth.message;

export const selectIsNewUser = state =>
  state.auth.isNewUser;

export const selectProfileCompleted =
  state =>
    state.auth.profileCompleted;

export const selectEmail = state =>
  state.auth.email;

export const selectOtpSent = state =>
  state.auth.otpSent;

export const selectIsInitialized =
  state =>
    state.auth.isInitialized;

export default authSlice.reducer;