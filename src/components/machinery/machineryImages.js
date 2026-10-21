/*
 * Photos for machinery categories from GET /api/machinery/meta. Used when
 * a listing has no photos of its own. category is free text, so unknown
 * values fall back to a tractor with an implement.
 */
const IMAGES = {
  tractor: require('../../assets/machinery/tractor-red.png'),
  rotavator: require('../../assets/machinery/rotavator-blue.png'),
  tillage: require('../../assets/machinery/recent-rotavator.jpg'),
  sowing: require('../../assets/machinery/sonalika-di-745.jpg'),
  sprayer: require('../../assets/machinery/recent-harvester.jpg'),
  harvest: require('../../assets/machinery/provide-hero-1.png'),
  general: require('../../assets/machinery/mahindra-575-di.jpg'),
};

const KEYWORDS = [
  ['rotavator', 'rotavator'],
  ['power tiller', 'tillage'],
  ['cultivator', 'tillage'],
  ['plough', 'tillage'],
  ['harrow', 'tillage'],
  ['seed', 'sowing'],
  ['planter', 'sowing'],
  ['transplant', 'sowing'],
  ['spray', 'sprayer'],
  ['harvest', 'harvest'],
  ['reaper', 'harvest'],
  ['thresher', 'harvest'],
  ['baler', 'harvest'],
  ['trolley', 'general'],
  ['tanker', 'general'],
  ['tractor', 'tractor'],
];

export const getMachineryCategoryImage = category => {
  const text = String(category || '').toLowerCase();
  const match = KEYWORDS.find(([keyword]) => text.includes(keyword));

  return IMAGES[match ? match[1] : 'general'];
};

/*
 * First photo of a listing as an Image source, or the category photo.
 */
export const machineryImageSource = machinery =>
  machinery?.images?.[0]
    ? { uri: machinery.images[0] }
    : getMachineryCategoryImage(machinery?.category);

export const MACHINERY_HERO_IMAGE = require('../../assets/machinery/sonalika-di-745.jpg');
export const OWNER_HERO_IMAGE = require('../../assets/machinery/provide-hero-1.png');
