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

export const NURSERY_BANNER = require('../../assets/nursery/nursery-banner.png');

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

/*
 * Photo per category (server PLANT_CATEGORIES), shown on the category grid
 * and for listings without photos. Sellers can type any category, so
 * common plant names are matched by keyword ("Mango" -> fruit plants,
 * "Tulsi" -> medicinal); anything unknown gets the general nursery photo.
 */
const CATEGORY_IMAGES = {
  fruit: require('../../assets/nursery/fruit-plants.jpg'),
  vegetable: require('../../assets/nursery/vegetable-seedlings.jpg'),
  flowering: require('../../assets/nursery/flowering-plants.jpg'),
  medicinal: require('../../assets/nursery/medicinal-plants.jpg'),
  timber: require('../../assets/nursery/timber-trees.jpg'),
  plantation: require('../../assets/nursery/plantation-crops.jpg'),
  spice: require('../../assets/nursery/spice-plants.jpg'),
  ornamental: require('../../assets/nursery/ornamental-plants.jpg'),
  indoor: require('../../assets/nursery/indoor-plants.jpg'),
  grafted: require('../../assets/nursery/grafted-saplings.jpg'),
  seeds: require('../../assets/nursery/seeds.jpg'),
  other: require('../../assets/nursery/other.jpg'),
};

// First match wins: category words, then common plant names, then the
// generic "seedling" / "seed".
const IMAGE_KEYWORDS = [
  ['graft', 'grafted'],
  ['seeds', 'seeds'],
  ['vegetable', 'vegetable'],
  ['fruit', 'fruit'],
  ['flower', 'flowering'],
  ['medicin', 'medicinal'],
  ['herb', 'medicinal'],
  ['timber', 'timber'],
  ['plantation', 'plantation'],
  ['spice', 'spice'],
  ['ornamental', 'ornamental'],
  ['indoor', 'indoor'],
  ['house plant', 'indoor'],
  // plant names
  ['mango', 'fruit'], ['guava', 'fruit'], ['lemon', 'fruit'], ['orange', 'fruit'],
  ['pomegranate', 'fruit'], ['papaya', 'fruit'], ['chikoo', 'fruit'], ['sapota', 'fruit'],
  ['jackfruit', 'fruit'], ['custard apple', 'fruit'], ['amla', 'fruit'], ['apple', 'fruit'],
  ['tomato', 'vegetable'], ['chilli', 'vegetable'], ['brinjal', 'vegetable'],
  ['cabbage', 'vegetable'], ['cauliflower', 'vegetable'], ['capsicum', 'vegetable'],
  ['bell pepper', 'vegetable'],
  ['rose', 'flowering'], ['marigold', 'flowering'], ['hibiscus', 'flowering'],
  ['jasmine', 'flowering'], ['mogra', 'flowering'], ['chrysanthemum', 'flowering'],
  ['tulsi', 'medicinal'], ['aloe', 'medicinal'], ['neem', 'medicinal'],
  ['giloy', 'medicinal'], ['ashwagandha', 'medicinal'],
  ['teak', 'timber'], ['mahogany', 'timber'], ['sandalwood', 'timber'],
  ['bamboo', 'timber'], ['eucalyptus', 'timber'],
  ['coconut', 'plantation'], ['banana', 'plantation'], ['areca', 'plantation'],
  ['cashew', 'plantation'], ['coffee', 'plantation'], ['rubber', 'plantation'],
  ['pepper', 'spice'], ['cardamom', 'spice'], ['curry', 'spice'], ['clove', 'spice'],
  ['cinnamon', 'spice'], ['turmeric', 'spice'], ['ginger', 'spice'],
  ['croton', 'ornamental'], ['bougainvillea', 'ornamental'], ['palm', 'ornamental'],
  ['money plant', 'indoor'], ['snake plant', 'indoor'], ['succulent', 'indoor'],
  ['cactus', 'indoor'],
  // generic words last, so "Coconut seedling" stays a plantation crop
  ['seedling', 'vegetable'],
  ['seed', 'seeds'],
];

export const categoryImage = category => {
  const text = String(category || '').toLowerCase();
  const match = IMAGE_KEYWORDS.find(([keyword]) => text.includes(keyword));
  return CATEGORY_IMAGES[match ? match[1] : 'other'];
};

export const plantImageUri = plant =>
  plant?.images?.find(Boolean) || plant?.image || null;
