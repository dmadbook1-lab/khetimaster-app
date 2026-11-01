import './src/translation/i18n';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';

import AppNavigator from './src/navigation/AppNavigator';
import store from './src/redux/store';
import { LocationProvider } from './src/context/LocationContext';
import i18next, { i18nInitPromise } from './src/translation/i18n';
import { setAiGuruLanguage } from './src/redux/slices/aiGuruSlice';
import { normalizeLanguageCode } from './src/utils/languageUtils';

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    i18nInitPromise
      .then(() => {
        // AI Guru replies in the saved app language until the user picks another
        store.dispatch(
          setAiGuruLanguage(normalizeLanguageCode(i18next.language)),
        );
        setI18nReady(true);
      })
      .catch(err => {
        console.error('[i18n] bootstrap failed', err);
        setI18nReady(true);
      });
  }, []);

  return (
    <Provider store={store}>
      {i18nReady ? (
        <LocationProvider>
          <AppNavigator />
        </LocationProvider>
      ) : (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
      )}
    </Provider>
  );
}
