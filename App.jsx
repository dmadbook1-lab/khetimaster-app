import React from 'react';
import {Provider} from 'react-redux';

import AppNavigator from './src/navigation/AppNavigator';
import store from './src/redux/store';
import {LocationProvider} from './src/context/LocationContext';

export default function App() {
  return (
    <Provider store={store}>
      <LocationProvider>
        <AppNavigator />
      </LocationProvider>
    </Provider>
  );
}