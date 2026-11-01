import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import {
  APP_DEFAULT_LANGUAGE_CODE,
  LANGUAGE_STORAGE_KEY,
} from '../constants/appLocaleDefaults';
import { i18nInitPromise } from '../translation/i18n';

export { APP_DEFAULT_LANGUAGE_CODE };

/**
 * Canonical app locales (picker order — English + 22 Indian languages)
 * @type {readonly string[]}
 */
export const APP_LOCALE_CODES = Object.freeze([
  'en',
  'hi',
  'mr',
  'as',
  'bn',
  'brx',
  'doi',
  'gu',
  'kn',
  'ks',
  'kok',
  'ml',
  'mni',
  'mai',
  'ne',
  'or',
  'pa',
  'sa',
  'sat',
  'sd',
  'ta',
  'te',
  'ur',
]);

const APP_LANGUAGE_LABELS = {
  en: { label: 'English', native: 'English' },
  as: { label: 'Assamese', native: 'অসমীয়া' },
  bn: { label: 'Bengali', native: 'বাংলা' },
  brx: { label: 'Bodo', native: 'बड़ो' },
  doi: { label: 'Dogri', native: 'डोगरी' },
  gu: { label: 'Gujarati', native: 'ગુજરાતી' },
  hi: { label: 'Hindi', native: 'हिन्दी' },
  kn: { label: 'Kannada', native: 'ಕನ್ನಡ' },
  ks: { label: 'Kashmiri', native: 'کٲشُر' },
  kok: { label: 'Konkani', native: 'कोंकणी' },
  ml: { label: 'Malayalam', native: 'മലയാളം' },
  mni: { label: 'Manipuri (Meitei)', native: 'মৈতৈলোন্' },
  mr: { label: 'Marathi', native: 'मराठी' },
  mai: { label: 'Maithili', native: 'मैथिली' },
  ne: { label: 'Nepali', native: 'नेपाली' },
  or: { label: 'Odia', native: 'ଓଡ଼ିଆ' },
  pa: { label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  sa: { label: 'Sanskrit', native: 'संस्कृतम्' },
  sat: { label: 'Santhali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  sd: { label: 'Sindhi', native: 'سنڌي' },
  ta: { label: 'Tamil', native: 'தமிழ்' },
  te: { label: 'Telugu', native: 'తెలుగు' },
  ur: { label: 'Urdu', native: 'اردو' },
};

/** Scripts written right-to-left */
const RTL_CODES = new Set(['ks', 'sd', 'ur']);

/**
 * Rows for the language picker (fixed list; not the full world list).
 * @returns {Array<{code: string, label: string, native: string}>}
 */
export const getAppLanguagePickerRows = () =>
  APP_LOCALE_CODES.map(code => ({
    code,
    ...APP_LANGUAGE_LABELS[code],
  }));

/**
 * @param {string} code
 * @returns {{label: string, native: string}}
 */
export const getLanguageLabel = code =>
  APP_LANGUAGE_LABELS[normalizeLanguageCode(code)] ||
  APP_LANGUAGE_LABELS[APP_DEFAULT_LANGUAGE_CODE];

export const isRtlLanguage = code => RTL_CODES.has(normalizeLanguageCode(code));

/**
 * Language mapping between i18n codes and backend language names
 */
const LANGUAGE_MAP = {
  en: 'english',
  as: 'assamese',
  bn: 'bengali',
  brx: 'bodo',
  doi: 'dogri',
  gu: 'gujarati',
  hi: 'hindi',
  kn: 'kannada',
  ks: 'kashmiri',
  kok: 'konkani',
  ml: 'malayalam',
  mni: 'manipuri',
  mr: 'marathi',
  mai: 'maithili',
  ne: 'nepali',
  or: 'odia',
  pa: 'punjabi',
  sa: 'sanskrit',
  sat: 'santhali',
  sd: 'sindhi',
  ta: 'tamil',
  te: 'telugu',
  ur: 'urdu',
};

/**
 * Reverse mapping: backend language names to i18n codes
 */
const BACKEND_TO_CODE_MAP = Object.fromEntries(
  Object.entries(LANGUAGE_MAP).map(([code, name]) => [name, code]),
);

/**
 * i18n may return `hi-IN` etc.; map to a bundled resource key.
 * @param {string} lang
 * @returns {string} supported code, or the app default
 */
export const normalizeLanguageCode = lang => {
  if (!lang || typeof lang !== 'string') {
    return APP_DEFAULT_LANGUAGE_CODE;
  }
  const raw = lang.toLowerCase().trim();
  if (LANGUAGE_MAP[raw] !== undefined) {
    return raw;
  }
  const base = raw.split('-')[0];
  return LANGUAGE_MAP[base] !== undefined ? base : APP_DEFAULT_LANGUAGE_CODE;
};

/**
 * Persist preference and switch i18n (await for navigation / critical paths).
 * @param {string} code
 * @returns {Promise<string>} resolved language code
 */
export const persistAndChangeLanguage = async code => {
  const resolved = normalizeLanguageCode(code);
  await i18nInitPromise;
  await i18next.changeLanguage(resolved);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
  return resolved;
};

/**
 * Fast UI switch: apply i18n immediately, persist later/background.
 * @param {string} code
 * @returns {Promise<string>} resolved language code
 */
export const changeLanguageFast = async code => {
  const resolved = normalizeLanguageCode(code);
  await i18nInitPromise;
  if (i18next.language !== resolved) {
    await i18next.changeLanguage(resolved);
  }
  return resolved;
};

/**
 * Persist language only (non-blocking caller preferred).
 * @param {string} code
 * @returns {Promise<string>} resolved language code
 */
export const persistLanguageOnly = async code => {
  const resolved = normalizeLanguageCode(code);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
  return resolved;
};

/**
 * True once the user has picked a language (first launch has none stored).
 * @returns {Promise<boolean>}
 */
export const hasChosenLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return Boolean(stored && LANGUAGE_MAP[stored]);
  } catch {
    return false;
  }
};

/**
 * Get current language code from AsyncStorage or i18next
 * @returns {Promise<string>} Language code (e.g. 'hi', 'bn')
 */
export const getCurrentLanguageCode = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLang && LANGUAGE_MAP[storedLang]) {
      return storedLang;
    }
    return normalizeLanguageCode(i18next.language);
  } catch (error) {
    console.error('Error getting current language code:', error);
    return APP_DEFAULT_LANGUAGE_CODE;
  }
};

/**
 * Convert i18n language code to backend language name
 * @param {string} code
 * @returns {string} Backend language name (e.g. 'hindi', 'bengali')
 */
export const codeToBackendLanguage = code => {
  if (!code) {
    return LANGUAGE_MAP[APP_DEFAULT_LANGUAGE_CODE];
  }
  const lowerCode = code.toLowerCase().trim();
  if (LANGUAGE_MAP[lowerCode]) {
    return LANGUAGE_MAP[lowerCode];
  }
  if (BACKEND_TO_CODE_MAP[lowerCode]) {
    return lowerCode;
  }
  return LANGUAGE_MAP[APP_DEFAULT_LANGUAGE_CODE];
};

/**
 * Convert backend language name to i18n code
 * @param {string} language
 * @returns {string} i18n language code
 */
export const backendLanguageToCode = language => {
  if (!language) {
    return APP_DEFAULT_LANGUAGE_CODE;
  }
  const lowerLang = language.toLowerCase().trim();
  if (BACKEND_TO_CODE_MAP[lowerLang]) {
    return BACKEND_TO_CODE_MAP[lowerLang];
  }
  return normalizeLanguageCode(lowerLang);
};

/**
 * Validate if language code is supported
 * @param {string} code - Language code
 * @returns {boolean}
 */
export const isLanguageSupported = code => !!LANGUAGE_MAP[code?.toLowerCase()];

/**
 * Get all supported languages
 * @returns {Array} Array of {code, name} objects
 */
export const getSupportedLanguages = () =>
  Object.entries(LANGUAGE_MAP).map(([code, name]) => ({
    code,
    name,
  }));
