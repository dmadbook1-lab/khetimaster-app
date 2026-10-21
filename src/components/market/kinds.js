import {MARKET_COLORS as C} from './theme';

/*
 * Display info for each listing kind from /api/market/meta.
 */
export const KIND_META = {
  PRODUCE: {
    key: 'PRODUCE',
    label: 'Produce',
    tagline: 'Crops, fruits & vegetables',
    image: require('../../assets/homescreen/mand.png'),
    // illustration has its own background, so it fills the tile
    imageMode: 'cover',
    color: C.green,
    bg: C.lightGreen,
    defaultUnit: 'quintal',
  },
  EQUIPMENT: {
    key: 'EQUIPMENT',
    label: 'Equipment',
    tagline: 'Tractors, implements & tools',
    image: require('../../assets/bazar/tractor.png'),
    imageMode: 'contain',
    color: C.blue,
    bg: C.lightBlue,
    defaultUnit: 'piece',
  },
  INPUTS: {
    key: 'INPUTS',
    label: 'Farm Inputs',
    tagline: 'Fertilizers & crop protection',
    image: require('../../assets/bazar/agri.png'),
    imageMode: 'contain',
    color: C.orange,
    bg: C.lightOrange,
    defaultUnit: 'bag',
  },
};

export const KIND_ORDER = ['PRODUCE', 'EQUIPMENT', 'INPUTS'];

export const getKindMeta = kind => KIND_META[kind] || KIND_META.PRODUCE;
