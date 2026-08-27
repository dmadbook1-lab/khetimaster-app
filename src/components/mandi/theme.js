import {Dimensions, PixelRatio} from 'react-native';

const {width, height} = Dimensions.get('window');

// Responsive font scaling
const scale = width / 375;
export const rf = size => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const PAGE_PADDING = 16;
export {width, height};

export const COLORS = {
  DARK_GREEN: '#158B3D',
  GREEN_BRIGHT: '#22A957',
  GREEN_SOFT: '#EAFBF0',
  ORANGE: '#F97316',
  ORANGE_SOFT: '#FFF7ED',
  RED: '#EF4444',
  RED_SOFT: '#FEF2F2',
  BLUE: '#3B82F6',
  BLUE_SOFT: '#EFF6FF',
  PURPLE: '#8B5CF6',
  PURPLE_SOFT: '#F5F3FF',
  YELLOW: '#EAB308',
  YELLOW_SOFT: '#FEF9C3',
  PINK_SOFT: '#FCE7F3',

  DARK: '#0F172A',
  MUTED: '#64748B',
  BORDER: '#E5E7EB',
  PAGE_BG: '#F8FAFC',
};