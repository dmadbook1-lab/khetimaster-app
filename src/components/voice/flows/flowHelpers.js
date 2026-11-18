import i18n from '../../../translation/i18n';
import useAppLanguage from '../../../translation/useAppLanguage';
import { optKey } from '../../../utils/tOpt';
import { formatDay } from '../../../utils/indiaSchedule';

/*
 * Small pieces shared by the voice booking flows.
 */

// spoken words people use for the three day parts, per language
export const SESSION_ALIASES = {
  full: ['full day', 'whole day', 'full', 'poora din', 'pura din', 'पूरा दिन', 'पूरा', 'दिन भर', 'पूर्ण दिवस', 'पूर्ण', 'दिवसभर', 'संपूर्ण दिवस', 'फुल डे', 'फुल'],
  morning: ['morning', 'subah', 'सुबह', 'सकाळ', 'सकाळी', 'मॉर्निंग'],
  afternoon: ['afternoon', 'evening', 'dopahar', 'shaam', 'दोपहर', 'शाम', 'दुपार', 'संध्याकाळ', 'आफ्टरनून', 'इवनिंग'],
};

/*
 * The assistant talks in the app language - the one language of the whole
 * app. useVoiceLanguage() reads it and every t() / vOpt() below then
 * answers in that language.
 */
let voiceLanguage = 'en';

export const getVoiceLanguage = () => voiceLanguage;

export const useVoiceLanguage = () => {
  voiceLanguage = useAppLanguage();
  return voiceLanguage;
};

export const t = (key, vars) => i18n.t(key, { ...vars, lng: voiceLanguage });

// crop / work / category names in the voice language
export const vOpt = value =>
  value === null || value === undefined || value === ''
    ? value
    : i18n.t(`opt.${optKey(value)}`, {
        defaultValue: String(value),
        lng: voiceLanguage,
      });

export const optionsFromList = (list = []) =>
  list.map(item => ({
    value: item,
    label: vOpt(item),
    aliases: [String(item)],
  }));

// "8 November" style date for the answer pill and the spoken summary
export const spokenDay = key => formatDay(key, { weekday: true, year: false });

export const placeFromLocation = (location = {}, user = {}) => ({
  state: location?.state || user?.state || '',
  district: location?.district || user?.district || '',
  village: user?.village || '',
});

export const apiMessage = (failure, fallback) =>
  failure?.message || failure?.response?.data?.message || fallback;
