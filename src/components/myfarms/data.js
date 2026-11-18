
import i18n from 'i18next';export const filters = [
  'All',
  'Healthy',
  'Need Attention',
  'Soybean',
  'Cotton',
  'Tomato',
];

export const farms = [
  {
    get title() {
    return i18n.t('data.patilFarm');
  },
    crop: 'Soybean',
    area: '2.34 Acres',
    status: 'Healthy',
    statusType: 'healthy',
    image: require('../../assets/homescreen/farm2.jpg'),
  },
  {
    get title() {
    return i18n.t('data.shindeFarm');
  },
    crop: 'Cotton',
    area: '5.10 Acres',
    status: 'Need\nAttention',
    statusType: 'attention',
    image: require('../../assets/homescreen/farm1.jpg'),
  },
  {
    get title() {
    return i18n.t('data.eastFarm');
  },
    crop: 'Tomato',
    area: '1.20 Acres',
    status: 'Healthy',
    statusType: 'healthy',
    image: require('../../assets/homescreen/farm2.jpg'),
  },
  {
    get title() {
    return i18n.t('data.jadhavFarm');
  },
    crop: 'Soybean',
    area: '3.80 Acres',
    status: 'Healthy',
    statusType: 'healthy',
    image: require('../../assets/homescreen/farm2.jpg'),
  },
  {
    get title() {
    return i18n.t('data.northField');
  },
    crop: 'Cotton',
    area: '4.06 Acres',
    status: 'Healthy',
    statusType: 'healthy',
    image: require('../../assets/homescreen/farm2.jpg'),
  },
];