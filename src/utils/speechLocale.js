import i18n from 'i18next';
import { normalizeLanguageCode } from './languageUtils';

/*
 * One place that says which voice to speak and listen in for each app
 * language. Languages Android has no recogniser or voice for use the
 * closest one (Hindi), then English, so the assistant never goes silent.
 */
const LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
  or: 'or-IN',
  as: 'as-IN',
  ne: 'ne-NP',
  // no recogniser of their own: Hindi is the closest
  kok: 'hi-IN',
  doi: 'hi-IN',
  mai: 'hi-IN',
  brx: 'hi-IN',
  sa: 'hi-IN',
  sat: 'hi-IN',
  ks: 'ur-IN',
  sd: 'ur-IN',
  mni: 'bn-IN',
};

export const appLanguageCode = () =>
  normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);

export const speechLocaleFor = code => LOCALES[code] || 'en-IN';

export const currentSpeechLocale = () => speechLocaleFor(appLanguageCode());

// tried in order when a recogniser or voice is missing on the phone
export const speechLocaleChain = (code = appLanguageCode()) => {
  const first = speechLocaleFor(code);
  const chain = [first];
  if (first !== 'hi-IN' && first !== 'en-IN') chain.push('hi-IN');
  chain.push('en-IN');
  return [...new Set(chain)];
};
