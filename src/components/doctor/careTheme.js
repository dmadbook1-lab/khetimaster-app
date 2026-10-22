/*
 * Doctor consultations have their own clinic look: teal and navy
 * instead of the marketplace greens.
 */
export const CARE = {
  teal: '#0E9F96',
  tealDark: '#0A7C75',
  tealDeep: '#06514D',
  tealSoft: '#E3F5F3',
  mint: '#CFF0EC',
  navy: '#0B2545',
  ink: '#101828',
  text: '#344054',
  muted: '#667085',
  placeholder: '#98A2B3',
  border: '#E1EAE9',
  bg: '#F3F8F8',
  input: '#F8FBFB',
  white: '#FFFFFF',
  coral: '#F26B5B',
  coralSoft: '#FEEDEA',
  amber: '#B7791F',
  amberSoft: '#FFF6E0',
  blue: '#2563EB',
  blueSoft: '#EAF1FF',
  red: '#B42318',
  redSoft: '#FDECEA',
  olive: '#4D7C0F',
  oliveSoft: '#EEF6DF',
  gold: '#F5A524',
};

/*
 * Hero card gradients, darkest first so white text stays readable.
 */
export const CARE_GRADIENTS = {
  care: ['#0B2545', '#0A5E63', '#0E9F96'],
  vet: ['#08344A', '#0B6F7A', '#14B8A6'],
  crop: ['#1F3A0E', '#3F6B12', '#7CB518'],
  amber: ['#4A2600', '#9A5200', '#E8890C'],
  blue: ['#0B2350', '#1D4DB0', '#3B7BF0'],
  slate: ['#1E2530', '#3A4452', '#5B6678'],
  coral: ['#4A0D08', '#A1281B', '#F26B5B'],
};

export const CARE_SHADOW = {
  shadowColor: '#0B2545',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const CARE_SHADOW_STRONG = {
  shadowColor: '#0B2545',
  shadowOpacity: 0.2,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 12 },
  elevation: 8,
};

export const DOCTOR_BANNER = require('../../assets/doctor/doctor-banner.png');
