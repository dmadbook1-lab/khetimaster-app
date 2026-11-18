
import i18n from 'i18next';/*
 * Storage has its own look: steel blue with a harvest amber accent.
 */
export const WH = {
  navy: '#0F2A43',
  steel: '#1F5F8B',
  steelDark: '#174A6E',
  steelSoft: '#E6F0F8',
  amber: '#E8890C',
  amberDark: '#B45309',
  amberSoft: '#FFF3E0',
  teal: '#0A7C75',
  tealSoft: '#E3F5F3',
  green: '#16883E',
  greenSoft: '#E6F5EB',
  ink: '#101828',
  text: '#344054',
  muted: '#667085',
  placeholder: '#98A2B3',
  border: '#E3E9EF',
  line: '#EEF2F6',
  bg: '#F3F6F9',
  white: '#FFFFFF',
};

export const WH_GRADIENT = ['#0F2A43', '#1B4F76', '#2F7FA8'];

export const WH_SHADOW = {
  shadowColor: '#0F2A43',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const CATEGORY_META = {
  central: { get label() {
    return i18n.t('theme.centralGovt');
  }, color: WH.steel, bg: WH.steelSoft },
  state: { get label() {
    return i18n.t('theme.stateGovt');
  }, color: WH.teal, bg: WH.tealSoft },
  private: { get label() {
    return i18n.t('theme.private');
  }, color: WH.amberDark, bg: WH.amberSoft },
};

export const WAREHOUSE_ART = require('../../assets/homescreen/warehouse_hero.png');
