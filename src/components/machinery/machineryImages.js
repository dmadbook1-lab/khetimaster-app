/*
 * Photo for each machinery category from GET /api/machinery/meta (the
 * backend's MACHINERY_CATEGORIES). Used on the category grid and for
 * listings without photos of their own. category is free text, so it is
 * matched by keyword; anything unknown ("Other") falls back to a tractor.
 */
const IMAGES = {
  tractor: require('../../assets/machinery/categories/tractor.jpg'),
  rotavator: require('../../assets/machinery/categories/rotavator.jpg'),
  cultivator: require('../../assets/machinery/categories/cultivator.jpg'),
  plough: require('../../assets/machinery/categories/plough.jpg'),
  harrow: require('../../assets/machinery/categories/harrow.jpg'),
  seedDrill: require('../../assets/machinery/categories/seed-drill.jpg'),
  planter: require('../../assets/machinery/categories/planter.jpg'),
  transplanter: require('../../assets/machinery/categories/transplanter.jpg'),
  combineHarvester: require('../../assets/machinery/categories/combine-harvester.jpg'),
  reaper: require('../../assets/machinery/categories/reaper.jpg'),
  thresher: require('../../assets/machinery/categories/thresher.jpg'),
  baler: require('../../assets/machinery/categories/baler.jpg'),
  sprayer: require('../../assets/machinery/categories/sprayer.jpg'),
  powerTiller: require('../../assets/machinery/categories/power-tiller.jpg'),
  trolley: require('../../assets/machinery/categories/tractor-trolley.jpg'),
  tanker: require('../../assets/machinery/categories/water-tanker.jpg'),
  jcb: require('../../assets/machinery/categories/jcb.jpg'),
};

/*
 * First match wins, so specific words come before the words they contain:
 * "Tractor Trolley" -> trolley (not tractor), "Transplanter" -> transplanter
 * (not planter), "Power Tiller" -> power tiller.
 */
const KEYWORDS = [
  ['trolley', 'trolley'],
  ['tanker', 'tanker'],
  ['transplant', 'transplanter'],
  ['power tiller', 'powerTiller'],
  ['tiller', 'powerTiller'],
  ['rotavator', 'rotavator'],
  ['rotary', 'rotavator'],
  ['cultivator', 'cultivator'],
  ['harrow', 'harrow'],
  ['plough', 'plough'],
  ['plow', 'plough'],
  ['ridger', 'plough'],
  ['leveller', 'harrow'],
  ['seed', 'seedDrill'],
  ['drill', 'seedDrill'],
  ['planter', 'planter'],
  ['combine', 'combineHarvester'],
  ['harvest', 'combineHarvester'],
  ['reaper', 'reaper'],
  ['thresher', 'thresher'],
  ['baler', 'baler'],
  ['spray', 'sprayer'],
  ['jcb', 'jcb'],
  ['excavator', 'jcb'],
  ['backhoe', 'jcb'],
  ['loader', 'jcb'],
  ['tractor', 'tractor'],
];

export const getMachineryCategoryImage = category => {
  const text = String(category || '').toLowerCase();
  const match = KEYWORDS.find(([keyword]) => text.includes(keyword));

  return IMAGES[match ? match[1] : 'tractor'];
};

/*
 * First photo of a listing as an Image source, or the category photo.
 */
export const machineryImageSource = machinery =>
  machinery?.images?.[0]
    ? { uri: machinery.images[0] }
    : getMachineryCategoryImage(machinery?.category);

export const OWNER_HERO_IMAGE = require('../../assets/machinery/provide-hero-1.png');

export const MACHINERY_BANNER = require('../../assets/machinery/machinery-banner.png');
