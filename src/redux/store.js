import {configureStore} from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import labourReducer from './slices/labourSlice';
import labourerReducer from './slices/labourerSlice';
import labourBookingReducer from './slices/labourBookingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
        labourer: labourerReducer,
            labour: labourReducer,
                labourBooking: labourBookingReducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

export default store;