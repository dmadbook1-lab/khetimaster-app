import i18n from '../translation/i18n';
import { MANDI_ROUTES } from '../constants/mandiRoutes';
import { MARKET_ROUTES } from '../constants/marketRoutes';

const COMMANDS = [
  {
    id: 'labour',
    route: 'LabourBooking',
    message: 'voice.open_labour',
    phrases: [
      'labour',
      'labor',
      'workers',
      'mazdoor',
      'majdur',
      'mujhe labour chahiye',
      'mujhe labor chahiye',
      'labour chahiye',
      'labor chahiye',
      'mazdoor chahiye',
      'majdur chahiye',
      'mujhe majdoor chahiye',
      'need labour',
      'need labor',
      'hire labour',
      'hire workers',
      'labour hiring',
      'labour booking',
      'open labour',
      'workers chahiye',
    ],
  },
  {
    id: 'mandi',
    route: MANDI_ROUTES.HOME,
    message: 'voice.open_mandi',
    phrases: [
      'mandi',
      'rates',
      'prices',
      'bhav',
      'bhaav',
      'mandi ke bhav dikhao',
      'mandi ke bhaav dikhao',
      'mandi ka bhav dikhao',
      'mandi ke rate dikhao',
      'mandi bhav',
      'mandi bhaav',
      'mandi rates',
      'mandi rate',
      'mandi price',
      'mandi prices',
      'show mandi prices',
      'show mandi rates',
      'i want to see mandi prices',
      'i want to see mandi rates',
      'mujhe mandi ke bhav dekhne hain',
      'mujhe mandi rates dekhne hain',
      'pyaaz ka bhav',
      'pyaj ka bhav',
      'onion price',
      'crop prices',
      'fasal ka bhav',
      'open mandi',
    ],
  },
  {
    id: 'tractor',
    route: 'TractorBooking',
    message: 'voice.open_machinery',
    phrases: [
      'tractor',
      'machinery',
      'machine',
      'tractor book karna hai',
      'tractor booking karni hai',
      'tractor chahiye',
      'tractor rent par chahiye',
      'tractor kiraye par chahiye',
      'book tractor',
      'rent a tractor',
      'hire tractor',
      'tractor booking',
      'open tractor',
      'machinery booking',
      'farm machinery',
      'agricultural machinery',
      'machine chahiye',
    ],
  },
  {
    id: 'doctor',
    route: 'DoctorMain',
    message: 'voice.open_vet',
    phrases: [
      'doctor',
      'vet',
      'mujhe doctor chahiye',
      'pashu doctor chahiye',
      'pashuon ka doctor',
      'vet chahiye',
      'veterinary doctor',
      'need a vet',
      'animal doctor',
      'open doctor',
      'doctor booking',
    ],
  },
  {
    id: 'farms',
    route: 'MyFarms',
    message: 'voice.open_farms',
    phrases: [
      'farm',
      'farms',
      'khet',
      'mere khet dikhao',
      'mera khet dikhao',
      'mere farm dikhao',
      'my farms',
      'show my farms',
      'my fields',
      'open my farm',
      'farm details',
      'khet dikhao',
    ],
  },
  {
    id: 'crop-monitoring',
    route: 'DiseaseDetection',
    message: 'voice.open_crop_services',
    phrases: [
      'crop',
      'crops',
      'fasal',
      'fasal ki health dikhao',
      'fasal ki sehat dikhao',
      'crop health',
      'check my crop',
      'crop monitoring',
      'satellite monitoring',
      'open crop monitoring',
      'check crop health',
      'disease detection',
      'fasal ki bimari',
    ],
  },
  {
    id: 'nursery',
    route: 'NurseryHome',
    message: 'voice.open_nursery',
    phrases: [
      'nursery',
      'plants',
      'paudhe',
      'paudha',
      'nursery kholo',
      'nursery open karo',
      'paudhe kharidne hain',
      'paudhe chahiye',
      'plants kharidne hain',
      'buy plants',
      'open nursery',
      'plant nursery',
    ],
  },
  {
    id: 'profile',
    route: 'Profile',
    message: 'voice.open_profile',
    phrases: [
      'profile',
      'meri profile kholo',
      'profile kholo',
      'my profile',
      'open my profile',
      'open profile',
    ],
  },
  {
    id: 'agri-products',
    route: 'AgriProducts',
    message: 'voice.open_agri_products',
    phrases: [
      'products',
      'product',
      'agri products',
      'agriculture products',
      'farming products',
      'kheti ke saman',
      'kheti ka saman',
      'open products',
      'buy farming products',
    ],
  },
  {
    id: 'government-schemes',
    route: 'GovernmentSchemes',
    message: 'voice.open_schemes',
    phrases: [
      'schemes',
      'scheme',
      'yojana',
      'yojna',
      'government schemes',
      'govt schemes',
      'sarkari yojana',
      'sarkari yojna',
      'government yojana',
      'open schemes',
    ],
  },
  {
    id: 'knowledge-center',
    route: 'AgricultureNews',
    message: 'voice.open_knowledge',
    phrases: [
      'news',
      'articles',
      'knowledge center',
      'agriculture news',
      'farming news',
      'kheti ki jankari',
      'kheti ki jaankari',
      'open articles',
      'open knowledge center',
    ],
  },
];

COMMANDS.push({
  id: 'trade',
  route: MARKET_ROUTES.HOME,
  message: 'voice.open_trade',
  phrases: [
    'trade',
    'trading',
    'trader',
    'traders',
    'commodity',
    'commodities',
    'kheti market',
    'marketplace',
    'buy and sell',
    'sell my crop',
    'sell crop',
    'fasal bechni hai',
    'fasal bechna hai',
    'maal bechna hai',
    'vyapari',
  ],
});

/*
 * "<crop> ka bhav" / "<crop> price" opens that crop's mandi prices.
 * Keys are mandi crop ids (backend data/mandiCrops.js).
 */
const CROP_WORDS = {
  onion: ['onion', 'pyaz', 'pyaaz', 'pyaj', 'kanda'],
  tomato: ['tomato', 'tamatar'],
  potato: ['potato', 'aloo', 'alu', 'batata'],
  wheat: ['wheat', 'gehun', 'gehu', 'gahu'],
  rice: ['rice', 'chawal'],
  paddy: ['paddy', 'dhan'],
  maize: ['maize', 'makka', 'corn'],
  soybean: ['soybean', 'soyabean', 'soya'],
  cotton: ['cotton', 'kapas', 'kapus'],
  gram: ['chana', 'gram', 'harbhara'],
  arhar: ['arhar', 'tur', 'toor'],
  moong: ['moong', 'mung'],
  urad: ['urad'],
  groundnut: ['groundnut', 'moongphali', 'shengdana', 'peanut'],
  mustard: ['mustard', 'sarson'],
  sugarcane: ['sugarcane', 'ganna'],
  chilli: ['chilli', 'mirchi'],
  turmeric: ['turmeric', 'haldi', 'halad'],
  garlic: ['garlic', 'lahsun', 'lasun'],
  bajra: ['bajra'],
  jowar: ['jowar', 'jwari'],
  banana: ['banana', 'kela', 'keli'],
  grapes: ['grapes', 'angoor', 'draksha'],
  pomegranate: ['pomegranate', 'anar', 'dalimb'],
  cauliflower: ['cauliflower', 'gobi'],
  brinjal: ['brinjal', 'baingan', 'vangi'],
};

const PRICE_WORDS = [
  'bhav',
  'bhaav',
  'bhao',
  'rate',
  'rates',
  'price',
  'prices',
  'daam',
  'dam',
  'kimat',
  'keemat',
  'mandi',
];

const CROP_NAMES = {
  arhar: 'Arhar / Tur',
  gram: 'Gram (Chana)',
};

function findCropPrice(normalized) {
  const words = normalized.split(' ');

  if (!PRICE_WORDS.some(word => words.includes(word))) {
    return null;
  }

  for (const [cropId, names] of Object.entries(CROP_WORDS)) {
    if (names.some(name => words.includes(name))) {
      const cropName =
        CROP_NAMES[cropId] || cropId.charAt(0).toUpperCase() + cropId.slice(1);

      return {
        type: 'navigate',
        id: `mandi-${cropId}`,
        route: MANDI_ROUTES.CROP,
        params: { cropId, cropName },
        message: i18n.t('voice.open_crop_prices', {
          crop: i18n.exists(`crops.${cropId}`) ? i18n.t(`crops.${cropId}`) : cropName,
        }),
      };
    }
  }

  return null;
}

const CANCEL_PHRASES = [
  'cancel',
  'close assistant',
  'stop listening',
  'band karo',
  'band kar do',
  'bas karo',
  'rehne do',
  'ruko',
];

const GREETING_PHRASES = [
  'hello',
  'hi',
  'hey',
  'namaste',
  'namaskar',
  'good morning',
  'good afternoon',
  'good evening',
  'how are you',
];

export function normalizeSpeech(value = '') {
  return String(value)
    .toLocaleLowerCase('en-IN')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phraseMatches(transcript, phrase) {
  return (
    transcript === phrase ||
    transcript.startsWith(`${phrase} `) ||
    transcript.endsWith(` ${phrase}`) ||
    transcript.includes(` ${phrase} `)
  );
}

export function resolveVoiceCommand(transcript = '') {
  const normalized = normalizeSpeech(transcript);

  if (!normalized) {
    return { type: 'empty' };
  }

  if (
    CANCEL_PHRASES.some(raw => phraseMatches(normalized, normalizeSpeech(raw)))
  ) {
    return { type: 'cancel' };
  }

  const cropPrice = findCropPrice(normalized);

  if (cropPrice) {
    return cropPrice;
  }

  const matches = COMMANDS.flatMap(command =>
    command.phrases.map(rawPhrase => ({
      command,
      phrase: normalizeSpeech(rawPhrase),
    })),
  )
    .filter(item => phraseMatches(normalized, item.phrase))
    .sort((a, b) => b.phrase.length - a.phrase.length);

  if (matches.length === 0) {
    if (
      GREETING_PHRASES.some(phrase =>
        phraseMatches(normalized, normalizeSpeech(phrase)),
      )
    ) {
      return {
        type: 'greeting',
        response: i18n.t('voice.greeting'),
      };
    }

    return { type: 'unknown', transcript };
  }

  const command = matches[0].command;

  return {
    type: 'navigate',
    id: command.id,
    route: command.route,
    message: i18n.t(command.message),
  };
}

export default COMMANDS;
