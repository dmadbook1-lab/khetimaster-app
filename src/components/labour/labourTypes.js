/*
 * Photos for the labour types from GET /api/labourers/meta. Types the
 * app doesn't know (labourType is free text) fall back to a general one.
 */
const IMAGES = {
  general: require('../../assets/labour/farmer-1.jpg'),
  harvesting: require('../../assets/labour/harvesting.jpg'),
  sowing: require('../../assets/labour/sowing.jpg'),
  weeding: require('../../assets/labour/weeding.jpg'),
  irrigation: require('../../assets/labour/irrigation.jpg'),
  tractor: require('../../assets/labour/tractor.jpg'),
  livestock: require('../../assets/labour/livestock.jpg'),
  gardening: require('../../assets/labour/gardening.jpg'),
  worker: require('../../assets/labour/worker-1.jpg'),
};

const KEYWORDS = [
  ['harvest', 'harvesting'],
  ['sow', 'sowing'],
  ['plant', 'sowing'],
  ['transplant', 'sowing'],
  ['weed', 'weeding'],
  ['irrigat', 'irrigation'],
  ['spray', 'gardening'],
  ['fertilizer', 'gardening'],
  ['tractor', 'tractor'],
  ['machine', 'tractor'],
  ['land', 'tractor'],
  ['cattle', 'livestock'],
  ['dairy', 'livestock'],
  ['fruit', 'gardening'],
  ['prun', 'gardening'],
  ['loading', 'worker'],
];

export const getLabourTypeImage = type => {
  const text = String(type || '').toLowerCase();
  const match = KEYWORDS.find(([keyword]) => text.includes(keyword));

  return IMAGES[match ? match[1] : 'general'];
};

export const LABOUR_BANNER = require('../../assets/labour/labour-banner.png');
export const WORKER_HERO_IMAGE = require('../../assets/labour/hero6.jpg');
