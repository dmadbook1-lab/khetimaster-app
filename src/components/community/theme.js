import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
  GREEN: '#16883E',
  DARK_GREEN: '#14532D',
  BRIGHT_GREEN: '#2E9D4F',
  DARK: '#1F2A22',
  MUTED: '#64748B',
  BORDER: '#DDEBE2',
  PAGE_BG: '#F4F8F5',
  ORANGE: '#F97316',
  BLUE: '#3B82F6',
  AMBER: '#F59E0B',
  RED: '#EF4444',
  PURPLE: '#A855F7',
  LIKE: '#E11D48',
  INK: '#0B0F14',
};

export const FIELD = {
  DEEP: '#14532D',
  FOREST: '#16883E',
  LEAF: '#2E9D4F',
  SPROUT: '#E8F4E9',
  SOIL: '#F4F8F5',
  CARD: '#FFFFFF',
  LINE: '#DDEBE2',
  WHEAT: '#E3A33B',
  WHEAT_SOFT: '#F0F7ED',
  CLAY: '#C65D3B',
  INK: '#1F2A22',
  BARK: '#64748B',
};

// Ring around avatars of people with recent reels
export const STORY_RING = ['#F2C14E', '#2E9D4F'];

// Background tints for avatars without a photo
export const AVATAR_TINTS = [
  '#1E6B3A',
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
