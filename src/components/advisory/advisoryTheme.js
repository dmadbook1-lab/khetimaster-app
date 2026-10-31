import {
  CloudLightning,
  Droplets,
  FlaskConical,
  Leaf,
  ScanSearch,
  ShieldAlert,
  SprayCan,
} from 'lucide-react-native';

/*
|--------------------------------------------------------------------------
| SHARED TOKENS
|--------------------------------------------------------------------------
*/

export const COLORS = {
  forest: '#0D6B30',
  forestDeep: '#07431E',
  green: '#16883E',
  mint: '#6EE7A2',
  mintSoft: '#EAF7EF',
  text: '#142018',
  muted: '#728078',
  border: '#E7ECE9',
  surface: '#FFFFFF',
  page: '#F5F8F6',
  track: '#EEF2EF',
};

/*
|--------------------------------------------------------------------------
| CROP HEALTH
|--------------------------------------------------------------------------
|
| Same bands as CropGen (excellent ≥85, good ≥70, moderate ≥50, poor ≥30).
|
*/

export const getHealthBand = score => {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return {
      key: 'unknown',
      label: 'Awaiting data',
      color: '#9AA5A0',
      soft: '#F1F4F2',
    };
  }

  if (value >= 85) {
    return {key: 'excellent', label: 'Excellent', color: '#0FA958', soft: '#E3F9EC'};
  }

  if (value >= 70) {
    return {key: 'good', label: 'Good', color: '#4CB944', soft: '#EAF7E6'};
  }

  if (value >= 50) {
    return {key: 'moderate', label: 'Moderate', color: '#E3A21A', soft: '#FFF6E0'};
  }

  if (value >= 30) {
    return {key: 'poor', label: 'Poor', color: '#EA6A2F', soft: '#FFEDE4'};
  }

  return {key: 'critical', label: 'Critical', color: '#D93636', soft: '#FFE9E9'};
};

/*
|--------------------------------------------------------------------------
| GROWTH STAGES
|--------------------------------------------------------------------------
|
| CropGen's 5-step timeline: BBCH 0–9 sowing, 10–39 vegetative,
| 40–69 flowering, 70–89 fruit / grain, 90+ harvest.
|
*/

export const GROWTH_STEPS = [
  {key: 'sowing', label: 'Sowing', emoji: '🌱', fromBbch: 0},
  {key: 'growth', label: 'Growth', emoji: '🌿', fromBbch: 10},
  {key: 'flower', label: 'Flower', emoji: '🌼', fromBbch: 40},
  {key: 'fruit', label: 'Fruit', emoji: '🌾', fromBbch: 70},
  {key: 'harvest', label: 'Harvest', emoji: '🧺', fromBbch: 90},
];

export const getGrowthStepIndex = bbch => {
  const value = Number(bbch) || 0;

  if (value >= 90) return 4;
  if (value >= 70) return 3;
  if (value >= 40) return 2;
  if (value >= 10) return 1;

  return 0;
};

export const SIGNAL_LABELS = {
  gdd: 'Heat units',
  calendar: 'Crop age',
  ndvi: 'Satellite NDVI',
};

/*
|--------------------------------------------------------------------------
| ACTIVITIES
|--------------------------------------------------------------------------
*/

export const ACTIVITY_UI = {
  SPRAY: {icon: SprayCan, color: '#2563EB', soft: '#EAF1FF', tag: 'Spray'},
  FERTIGATION: {icon: FlaskConical, color: '#16883E', soft: '#E8F7EE', tag: 'Fertigation'},
  IRRIGATION: {icon: Droplets, color: '#0891B2', soft: '#E3F6FA', tag: 'Irrigation'},
  WEATHER: {icon: CloudLightning, color: '#E5484D', soft: '#FFEDED', tag: 'Weather'},
  CROP_RISK: {icon: ShieldAlert, color: '#D97706', soft: '#FFF4E0', tag: 'Risk'},
  MONITORING: {icon: ScanSearch, color: '#7C3AED', soft: '#F1EBFF', tag: 'Scout'},
  CARBON_TRACKING: {icon: Leaf, color: '#059669', soft: '#E2F7EF', tag: 'Carbon'},
};

export const FALLBACK_ACTIVITY_UI = {
  icon: Leaf,
  color: '#64748B',
  soft: '#F1F5F9',
  tag: 'Task',
};

export const PROGRESS_STEPS = [
  {key: 'started', label: 'Start'},
  {key: 'in_progress', label: 'Doing'},
  {key: 'completed', label: 'Done'},
];

const formatProduct = product => {
  if (!product || typeof product !== 'object') {
    return typeof product === 'string' || typeof product === 'number'
      ? String(product).trim()
      : '';
  }

  const parts = [];

  if (product.name) parts.push(product.name);

  if (product.quantityKgPerAcre != null) {
    parts.push(`${product.quantityKgPerAcre} kg/acre`);
  } else if (product.quantityKgPerHa != null) {
    parts.push(`${product.quantityKgPerHa} kg/ha`);
  } else if (product.dose) {
    parts.push(product.dose);
  } else if (product.totalKgFarm != null) {
    parts.push(`${product.totalKgFarm} kg`);
  }

  return parts.join(' · ');
};

const toLabels = value => {
  if (value == null || value === false) return [];

  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim();

    return text ? [text] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toLabels);
  }

  if (typeof value === 'object') {
    const text = formatProduct(value);

    return text ? [text] : [];
  }

  return [];
};

const humanizeKey = key =>
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, c => c.toUpperCase());

/** Products shown as a list; everything else becomes labelled detail rows. */
export const splitActivityDetails = (details = {}) => {
  if (!details || typeof details !== 'object') {
    return {products: [], rows: []};
  }

  const products = Array.isArray(details.products)
    ? details.products.filter(Boolean)
    : [];

  const rows = Object.entries(details)
    .filter(([key]) => key !== 'products' && !/Key$/.test(key))
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      values: toLabels(value),
    }))
    .filter(row => row.values.length);

  return {products, rows};
};

export const describeProduct = formatProduct;

/*
|--------------------------------------------------------------------------
| NPK → FERTILIZER
|--------------------------------------------------------------------------
|
| Ported from CropGen's soil card. Indian bag basis: N via urea (46%),
| P as P2O5 via DAP (46% P2O5, 18% N), K as K2O via MOP (60%).
| DAP goes first so its nitrogen reduces the urea needed.
|
*/

const round1 = kg => (Number.isFinite(kg) && kg > 0 ? Math.round(kg * 10) / 10 : 0);

export const computeFertilizerKgPerHa = (available = {}, required = {}) => {
  const gap = key =>
    Math.max(0, (Number(required[key]) || 0) - (Number(available[key]) || 0));

  const deficitN = gap('nitrogenKgPerHa');
  const deficitP = gap('phosphorousKgPerHa');
  const deficitK = gap('potassiumKgPerHa');

  const dapKg = deficitP > 0 ? deficitP / 0.46 : 0;
  const nStillNeeded = Math.max(0, deficitN - dapKg * 0.18);
  const ureaKg = nStillNeeded > 0 ? nStillNeeded / 0.46 : 0;
  const mopKg = deficitK > 0 ? deficitK / 0.6 : 0;

  return {
    ureaKg: round1(ureaKg),
    dapKg: round1(dapKg),
    mopKg: round1(mopKg),
    deficitN,
    deficitP,
    deficitK,
  };
};

export const FERTILIZERS = [
  {
    key: 'ureaKg',
    deficitKey: 'deficitN',
    name: 'Urea',
    grade: 'Nitrogen · 46% N',
    nutrient: 'N',
    color: '#E8A80C',
  },
  {
    key: 'dapKg',
    deficitKey: 'deficitP',
    name: 'DAP',
    grade: 'Phosphorus · 46% P₂O₅, 18% N',
    nutrient: 'P₂O₅',
    color: '#DC4A3D',
  },
  {
    key: 'mopKg',
    deficitKey: 'deficitK',
    name: 'MOP',
    grade: 'Potassium · 60% K₂O',
    nutrient: 'K₂O',
    color: '#2F9E44',
  },
];

/** True when any N/P/K value is non-zero (CropGen hides the card otherwise). */
export const hasMeaningfulNpk = npk => {
  if (!npk) return false;

  const {available = {}, required = {}} = npk;

  return ['nitrogenKgPerHa', 'phosphorousKgPerHa', 'potassiumKgPerHa'].some(
    key => Number(available[key]) > 0 || Number(required[key]) > 0,
  );
};

/*
|--------------------------------------------------------------------------
| MISC
|--------------------------------------------------------------------------
*/

export const formatRelativeTime = iso => {
  if (!iso) return '';

  const diffMs = Date.now() - new Date(iso).getTime();

  if (!Number.isFinite(diffMs)) return '';

  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);

  if (hours < 24) return `${hours} h ago`;

  const days = Math.round(hours / 24);

  return `${days} day${days === 1 ? '' : 's'} ago`;
};
