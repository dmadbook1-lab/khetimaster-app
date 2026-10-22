import {
  Apple,
  Bean,
  Carrot,
  Coins,
  Droplet,
  Flame,
  Sprout,
  Wheat,
} from 'lucide-react-native';

/*
 * Icon and colours per crop category (server mandiCrops.js).
 */
const CATEGORY_VISUALS = {
  Vegetables: { icon: Carrot, color: '#C2410C', bg: '#FFEDD5' },
  Cereals: { icon: Wheat, color: '#A16207', bg: '#FEF9C3' },
  Pulses: { icon: Bean, color: '#9A3412', bg: '#FFE4D6' },
  Oilseeds: { icon: Droplet, color: '#B45309', bg: '#FEF3C7' },
  'Cash Crops': { icon: Coins, color: '#0F766E', bg: '#CCFBF1' },
  Spices: { icon: Flame, color: '#B91C1C', bg: '#FEE2E2' },
  Fruits: { icon: Apple, color: '#BE185D', bg: '#FCE7F3' },
};

const DEFAULT_VISUAL = { icon: Sprout, color: '#159447', bg: '#EAF7EF' };

export const cropVisual = category =>
  CATEGORY_VISUALS[category] || DEFAULT_VISUAL;

export const MANDI_BANNER = require('../../assets/mandi/mandi-banner.png');
