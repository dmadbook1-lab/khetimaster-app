import {Droplets, ThermometerSun, Leaf, Activity} from 'lucide-react-native';

export const defaultFarm = {
  title: 'Patil Farm',
  crop: 'Soybean',
  area: '2.34 Acres',
  location: 'Yavatmal, Maharashtra',
  sowingDate: '12 Jun 2025',
  soilType: 'Black Cotton Soil',
  image: require('../../assets/homescreen/farm2.jpg'),
};

export const stats = [
  {
    label: 'Moisture',
    value: '68%',
    status: 'Normal',
    Icon: Droplets,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    label: 'Temperature',
    value: '29°C',
    status: 'Good',
    Icon: ThermometerSun,
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    label: 'NDVI',
    value: '0.78',
    status: 'Healthy',
    Icon: Leaf,
    color: '#16883E',
    bg: '#ECFDF5',
  },
  {
    label: 'Growth',
    value: '64%',
    status: 'On Track',
    Icon: Activity,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];