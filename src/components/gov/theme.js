import {Dimensions, PixelRatio} from 'react-native';

const {width} = Dimensions.get('window');
const guidelineBaseWidth = 375;

export const rf = size => {
  const newSize = (size * width) / guidelineBaseWidth;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const PAGE_PADDING = 16;

export const COLORS = {
  PAGE_BG: '#F4F7F5',
  DARK: '#151C2B',
  MUTED: '#64748B',
  BORDER: '#E6EBE8',
  DARK_GREEN: '#159447',
  LIGHT_GREEN: '#EAFBF0',
  ORANGE: '#F97316',
  RED: '#EF4444',
  BLUE: '#2563EB',
  YELLOW: '#F59E0B',
  PURPLE: '#8B5CF6',
};