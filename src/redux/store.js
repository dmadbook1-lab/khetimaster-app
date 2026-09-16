import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import labourReducer from './slices/labourSlice';
import labourerReducer from './slices/labourerSlice';
import labourBookingReducer from './slices/labourBookingSlice';

import machineryReducer from './slices/machinerySlice';
import machineryBookingReducer from './slices/machineryBookingSlice';

import doctorReducer from './slices/doctorSlice';
import doctorConsultationReducer from './slices/doctorConsultationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,

    labourer: labourerReducer,
    labour: labourReducer,
    labourBooking: labourBookingReducer,

    machinery: machineryReducer,
    machineryBooking:
      machineryBookingReducer,

    doctor: doctorReducer,
    doctorConsultation:
      doctorConsultationReducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

export default store;