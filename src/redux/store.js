import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import labourReducer from './slices/labourSlice';
import labourerReducer from './slices/labourerSlice';
import labourBookingReducer from './slices/labourBookingSlice';
import machineryReducer from './slices/machinerySlice';
import machineryBookingReducer from './slices/machineryBookingSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    labourer: labourerReducer,
    labour: labourReducer,
    labourBooking: labourBookingReducer,
        machinery: machineryReducer,

    machineryBooking:
      machineryBookingReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});
export default store;
