export const MACHINERY_CATEGORIES = [
  {
    id: 'tractor',
    label: 'Tractor',
    image: require('../../assets/machinery/category-tractor.png'),
  },
  {
    id: 'rotavator',
    label: 'Rotavator',
    image: require('../../assets/machinery/category-rotavator.png'),
  },
  {
    id: 'cultivator',
    label: 'Cultivator',
    image: require('../../assets/machinery/category-cultivator.png'),
  },
  {
    id: 'harvester',
    label: 'Harvester',
    image: require('../../assets/machinery/category-harvester.png'),
  },
  {
    id: 'trolley',
    label: 'Trolley',
    image: require('../../assets/machinery/category-trolley.png'),
  },
];

export const AVAILABLE_MACHINERY = [
  {
    id: 'sonalika-di-745',
    name: 'Sonalika DI 745',
    category: 'tractor',
    horsepower: '45 HP',
    rating: '4.8',
    reviews: 128,
    distance: '2.1 km Away',
    readyTime: 'Ready in 1h',
    owner: 'Patil Agro Services',
    ownerVerified: true,
    ownerImage: require('../../assets/machinery/owner-1.jpg'),
    hourlyPrice: 650,
    dailyPrice: 2500,
    available: true,
    favourite: false,
    image: require('../../assets/machinery/sonalika-di-745.jpg'),
  },
  {
    id: 'mahindra-575-di',
    name: 'Mahindra 575 DI',
    category: 'tractor',
    horsepower: '47 HP',
    rating: '4.6',
    reviews: 94,
    distance: '3.7 km Away',
    readyTime: 'Ready in 2h',
    owner: 'Shinde Farm Equipment',
    ownerVerified: true,
    ownerImage: require('../../assets/machinery/owner-2.jpg'),
    hourlyPrice: 580,
    dailyPrice: 2100,
    available: true,
    favourite: true,
    image: require('../../assets/machinery/mahindra-575-di.jpg'),
  },
];

export const RECENT_BOOKINGS = [
  {
    id: 'john-deere',
    name: 'John Deere 5050D',
    price: '₹700/hr',
    image: require('../../assets/machinery/recent-john-deere.jpg'),
  },
  {
    id: 'fieldking',
    name: 'Fieldking Rotavator',
    price: '₹450/hr',
    image: require('../../assets/machinery/recent-rotavator.jpg'),
  },
  {
    id: 'mini-harvester',
    name: 'Mini Harvester',
    price: '₹900/hr',
    image: require('../../assets/machinery/recent-harvester.jpg'),
  },
];