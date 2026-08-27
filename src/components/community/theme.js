import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

export const COLORS = {
  GREEN: '#16A34A',
  DARK_GREEN: '#16883E',
  BRIGHT_GREEN: '#1FC45A',
  DARK: '#172033',
  MUTED: '#7C8596',
  BORDER: '#E7EBED',
  PAGE_BG: '#FAFBFA',
  ORANGE: '#F97316',
  BLUE: '#3B82F6',
  AMBER: '#F59E0B',
  RED: '#EF4444',
  PURPLE: '#A855F7',
};

export const PAGE_PADDING = width * 0.037;

export const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export {width};