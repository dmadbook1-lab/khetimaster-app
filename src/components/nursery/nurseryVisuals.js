import {
  Apple,
  Carrot,
  Flower2,
  HeartPulse,
  Leaf,
  Scissors,
  Sprout,
  TreePalm,
  TreePine,
  Trees,
  Wheat,
} from 'lucide-react-native';

export const NURSERY_HERO_IMAGE = require('../../assets/homescreen/nursery.png');

/*
 * Icon and colours per suggested category (server PLANT_CATEGORIES).
 * Categories are free text, so anything else gets the default.
 */
const CATEGORY_VISUALS = {
  'fruit plants': { icon: Apple, color: '#C2410C', bg: '#FFEDD5' },
  'vegetable seedlings': { icon: Carrot, color: '#B45309', bg: '#FEF3C7' },
  'flowering plants': { icon: Flower2, color: '#BE185D', bg: '#FCE7F3' },
  'medicinal plants': { icon: HeartPulse, color: '#0F766E', bg: '#CCFBF1' },
  'timber trees': { icon: TreePine, color: '#166534', bg: '#DCFCE7' },
  'plantation crops': { icon: TreePalm, color: '#4D7C0F', bg: '#ECFCCB' },
  'spice plants': { icon: Leaf, color: '#9A3412', bg: '#FFE4D6' },
  'ornamental plants': { icon: Trees, color: '#6D28D9', bg: '#EDE9FE' },
  'indoor plants': { icon: Sprout, color: '#0E7490', bg: '#CFFAFE' },
  'grafted saplings': { icon: Scissors, color: '#1D4ED8', bg: '#DBEAFE' },
  seeds: { icon: Wheat, color: '#A16207', bg: '#FEF9C3' },
};

const DEFAULT_VISUAL = { icon: Sprout, color: '#159447', bg: '#EAF7EF' };

export const categoryVisual = category =>
  CATEGORY_VISUALS[
    String(category || '')
      .trim()
      .toLowerCase()
  ] || DEFAULT_VISUAL;

export const plantImageUri = plant =>
  plant?.images?.find(Boolean) || plant?.image || null;
