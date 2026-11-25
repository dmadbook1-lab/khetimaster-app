import {Bike, CarFront, Container, Tractor, Truck} from 'lucide-react-native';
import i18n from 'i18next';

/*
 * Icon and colours for each vehicle type from GET /api/delivery/partners/meta.
 */
export const VEHICLE_STYLE = {
  bike: {icon: Bike, color: '#2563EB', bg: '#EAF1FF'},
  auto: {icon: CarFront, color: '#B7791F', bg: '#FFF6E0'},
  mini_truck: {icon: Truck, color: '#159447', bg: '#EAF7EF'},
  pickup: {icon: Truck, color: '#0E7490', bg: '#E3F6FA'},
  tractor_trolley: {icon: Tractor, color: '#E8710A', bg: '#FFF1E3'},
  truck: {icon: Container, color: '#7C3AED', bg: '#F1EBFF'},
};

export const vehicleStyle = key => VEHICLE_STYLE[key] || VEHICLE_STYLE.mini_truck;

/*
 * Picture for each vehicle type in the "Choose a vehicle" grid. Types without
 * an entry show their icon instead. To add one, put a transparent PNG
 * (about 300×200) in src/assets/delivery/ and map it here, e.g.
 *   truck: require('../../assets/delivery/truck.png'),
 */
export const VEHICLE_IMAGE = {};

export const vehicleLabel = key =>
  i18n.t(`delivery.vehicle.${key}`, {defaultValue: key || ''});
