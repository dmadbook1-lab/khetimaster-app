import {configureStore} from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';

import labourReducer from './slices/labourSlice';
import labourerReducer from './slices/labourerSlice';
import labourBookingReducer from './slices/labourBookingSlice';

import machineryReducer from './slices/machinerySlice';
import machineryBookingReducer from './slices/machineryBookingSlice';

import doctorReducer from './slices/doctorSlice';
import doctorConsultationReducer from './slices/doctorConsultationSlice';

import articleReducer from './slices/articleSlice';
import mandiReducer from './slices/mandiSlice';

// Nursery
import nurseryReducer from './slices/nurserySlice';
import nurseryCartReducer from './slices/nurseryCartSlice';
import nurseryOrderReducer from './slices/nurseryOrderSlice';
import farmFieldReducer from './slices/farmFieldSlice';
// import cropMonitoringReducer from './slices/cropMonitoringSlice';
import cropReducer from './slices/cropSlice';
import satelliteReducer from './slices/satelliteSlice';
import weatherReducer from './slices/weatherSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,

    labourer: labourerReducer,
    labour: labourReducer,
    labourBooking: labourBookingReducer,

    machinery: machineryReducer,
    machineryBooking: machineryBookingReducer,

    doctor: doctorReducer,
    doctorConsultation: doctorConsultationReducer,

    articles: articleReducer,
    farmField: farmFieldReducer,
      satellite: satelliteReducer,
          weather: weatherReducer,
              crop: cropReducer,

    mandi: mandiReducer,

    // =========================================
    // NURSERY
    // =========================================

    nursery: nurseryReducer,
    nurseryCart: nurseryCartReducer,
    nurseryOrder: nurseryOrderReducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

export default store;