import React from 'react';

import WeatherArt, { artKindFor } from './WeatherArt';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Wind,
} from 'lucide-react-native';

/*
 * Visual Crossing icon names -> icon, its colour and the sky gradient
 * used behind the weather hero.
 */
const VISUALS = {
  'clear-day': {
    Icon: Sun,
    color: '#F59E0B',
    sky: ['#0369A1', '#0EA5E9', '#7DD3FC'],
  },
  'clear-night': {
    Icon: Moon,
    color: '#E0E7FF',
    sky: ['#0B1026', '#1E2A5A', '#3B4A8C'],
  },
  'partly-cloudy-day': {
    Icon: CloudSun,
    color: '#F59E0B',
    sky: ['#075985', '#0284C7', '#93C5FD'],
  },
  'partly-cloudy-night': {
    Icon: CloudMoon,
    color: '#E0E7FF',
    sky: ['#0F172A', '#1E3A5F', '#475569'],
  },
  cloudy: {
    Icon: Cloud,
    color: '#94A3B8',
    sky: ['#334155', '#64748B', '#94A3B8'],
  },
  rain: {
    Icon: CloudRain,
    color: '#38BDF8',
    sky: ['#1E293B', '#334155', '#4B6B8A'],
  },
  thunder: {
    Icon: CloudLightning,
    color: '#FACC15',
    sky: ['#111827', '#312E81', '#4C1D95'],
  },
  snow: {
    Icon: CloudSnow,
    color: '#E0F2FE',
    sky: ['#334155', '#64748B', '#CBD5E1'],
  },
  fog: {
    Icon: CloudFog,
    color: '#CBD5E1',
    sky: ['#475569', '#64748B', '#94A3B8'],
  },
  wind: {
    Icon: Wind,
    color: '#7DD3FC',
    sky: ['#0C4A6E', '#0369A1', '#38BDF8'],
  },
};

export const weatherVisual = (icon, conditions) => {
  if (/thunder|storm/i.test(String(conditions || ''))) return VISUALS.thunder;
  return VISUALS[icon] || VISUALS['partly-cloudy-day'];
};

/*
 * Illustrated icon for a Visual Crossing icon name (see WeatherArt).
 */
export const WeatherIcon = React.memo(function WeatherIcon({
  icon,
  conditions,
  size = 24,
}) {
  return <WeatherArt kind={artKindFor(icon, conditions)} size={size} />;
});
