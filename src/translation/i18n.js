import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import as from './locales/as.json';
import bn from './locales/bn.json';
import brx from './locales/brx.json';
import doi from './locales/doi.json';
import en from './locales/en.json';
import gu from './locales/gu.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ks from './locales/ks.json';
import kok from './locales/kok.json';
import ml from './locales/ml.json';
import mni from './locales/mni.json';
import mr from './locales/mr.json';
import mai from './locales/mai.json';
import ne from './locales/ne.json';
import or from './locales/or.json';
import pa from './locales/pa.json';
import sa from './locales/sa.json';
import sat from './locales/sat.json';
import sd from './locales/sd.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import ur from './locales/ur.json';

import {
  APP_DEFAULT_LANGUAGE_CODE,
  LANGUAGE_STORAGE_KEY,
} from '../constants/appLocaleDefaults';

export const resources = {
  as: { translation: as },
  bn: { translation: bn },
  brx: { translation: brx },
  doi: { translation: doi },
  en: { translation: en },
  gu: { translation: gu },
  hi: { translation: hi },
  kn: { translation: kn },
  ks: { translation: ks },
  kok: { translation: kok },
  ml: { translation: ml },
  mni: { translation: mni },
  mr: { translation: mr },
  mai: { translation: mai },
  ne: { translation: ne },
  or: { translation: or },
  pa: { translation: pa },
  sa: { translation: sa },
  sat: { translation: sat },
  sd: { translation: sd },
  ta: { translation: ta },
  te: { translation: te },
  ur: { translation: ur },
};

const loadLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && resources[storedLanguage]) {
      return storedLanguage;
    }
    return APP_DEFAULT_LANGUAGE_CODE;
  } catch (error) {
    console.error('Error loading language from AsyncStorage:', error);
    return APP_DEFAULT_LANGUAGE_CODE;
  }
};

const initializeI18next = async () => {
  const lng = await loadLanguage();
  await i18next.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: APP_DEFAULT_LANGUAGE_CODE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

/** Await before relying on t() / changeLanguage (App.jsx gates rendering on it) */
export const i18nInitPromise = initializeI18next();

export default i18next;
