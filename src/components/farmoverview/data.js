import {Droplets, ThermometerSun, Leaf, Activity} from 'lucide-react-native';
import i18n from 'i18next';

export const defaultFarm = {
  get title() {
    return i18n.t('data.patilFarm');
  },
  crop: 'Soybean',
  area: '2.34 Acres',
  location: 'Yavatmal, Maharashtra',
  sowingDate: '12 Jun 2025',
  soilType: 'Black Cotton Soil',
  image: require('../../assets/homescreen/farm2.jpg'),
};

export const stats = [
  {
    get label() {
    return i18n.t('data.moisture');
  },
    value: '68%',
    status: 'Normal',
    Icon: Droplets,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    get label() {
    return i18n.t('data.temperature');
  },
    value: '29°C',
    status: 'Good',
    Icon: ThermometerSun,
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    get label() {
    return i18n.t('data.ndvi');
  },
    value: '0.78',
    status: 'Healthy',
    Icon: Leaf,
    color: '#16883E',
    bg: '#ECFDF5',
  },
  {
    get label() {
    return i18n.t('data.growth');
  },
    value: '64%',
    status: 'On Track',
    Icon: Activity,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];