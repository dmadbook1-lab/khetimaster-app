import { Dimensions } from 'react-native';
import { WH, WH_SHADOW } from '../warehouse/theme';

const { width } = Dimensions.get('window');

/*
 * Community shares the Storage look: steel blue with a harvest amber accent.
 * Token names predate that palette, so GREEN, FOREST etc. are now steel blues.
 */
export const COLORS = {
  GREEN: WH.steel,
  DARK_GREEN: WH.steelDark,
  BRIGHT_GREEN: '#2F7FA8',
  DARK: WH.ink,
  MUTED: WH.muted,
  BORDER: WH.border,
  PAGE_BG: WH.bg,
  ORANGE: WH.amber,
  BLUE: WH.steel,
  AMBER: WH.amber,
  RED: '#EF4444',
  PURPLE: '#A855F7',
  LIKE: '#E11D48',
  INK: '#0B0F14',
};

export const FIELD = {
  DEEP: WH.navy,
  FOREST: WH.steel,
  LEAF: '#2F7FA8',
  SPROUT: WH.steelSoft,
  SOIL: WH.bg,
  CARD: WH.white,
  LINE: WH.border,
  WHEAT: WH.amber,
  WHEAT_DEEP: WH.amberDark,
  WHEAT_SOFT: WH.amberSoft,
  CLAY: '#C65D3B',
  INK: WH.ink,
  BARK: WH.muted,
};

// Feed cards sit inset from the screen edge, like the other marketplaces
export const CARD_GUTTER = 16;
export const CARD_RADIUS = 22;
export const CARD_SHADOW = WH_SHADOW;

// Ring around avatars of people with recent reels
export const STORY_RING = ['#FBBF24', '#2F7FA8'];

// Background tints for avatars without a photo
export const AVATAR_TINTS = [
  WH.steel,
  '#0E7490',
  '#C65D3B',
  '#8A6D1F',
  '#6D5BA8',
  '#0D9488',
  '#B45309',
];

export const PAGE_PADDING = width * 0.037;

export const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export { width };
