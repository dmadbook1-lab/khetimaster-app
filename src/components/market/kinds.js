import {MARKET_COLORS as C} from './theme';
import i18n from 'i18next';

/*
 * Display info for each listing kind from /api/market/meta.
 */
export const KIND_META = {
  PRODUCE: {
    key: 'PRODUCE',
    get label() {
    return i18n.t('kinds.produce');
  },
    get tagline() {
    return i18n.t('kinds.cropsFruitsVegetables');
  },
    image: require('../../assets/homescreen/mand.png'),
    // illustration has its own background, so it fills the tile
    imageMode: 'cover',
    color: C.green,
    bg: C.lightGreen,
    defaultUnit: 'quintal',
  },
  EQUIPMENT: {
    key: 'EQUIPMENT',
    get label() {
    return i18n.t('kinds.equipment');
  },
    get tagline() {
    return i18n.t('kinds.tractorsImplementsTools');
  },
    image: require('../../assets/bazar/tractor.png'),
    imageMode: 'contain',
    color: C.blue,
    bg: C.lightBlue,
    defaultUnit: 'piece',
  },
  INPUTS: {
    key: 'INPUTS',
    get label() {
    return i18n.t('kinds.farmInputs');
  },
    get tagline() {
    return i18n.t('kinds.fertilizersCropProtection');
  },
    image: require('../../assets/bazar/agri.png'),
    imageMode: 'contain',
    color: C.orange,
    bg: C.lightOrange,
    defaultUnit: 'bag',
  },
};

export const KIND_ORDER = ['PRODUCE', 'EQUIPMENT', 'INPUTS'];

export const getKindMeta = kind => KIND_META[kind] || KIND_META.PRODUCE;
