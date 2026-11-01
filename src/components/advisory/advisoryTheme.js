import i18n from '../../translation/i18n';
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
      label: i18n.t('advisory.health_awaiting'),
      color: '#9AA5A0',
      soft: '#F1F4F2',
    };
  }

  if (value >= 85) {
    return {key: 'excellent', label: i18n.t('advisory.health_excellent'), color: '#0FA958', soft: '#E3F9EC'};
  }

  if (value >= 70) {
    return {key: 'good', label: i18n.t('advisory.health_good'), color: '#4CB944', soft: '#EAF7E6'};
  }

  if (value >= 50) {
    return {key: 'moderate', label: i18n.t('advisory.health_moderate'), color: '#E3A21A', soft: '#FFF6E0'};
  }

  if (value >= 30) {
    return {key: 'poor', label: i18n.t('advisory.health_poor'), color: '#EA6A2F', soft: '#FFEDE4'};
  }

  return {key: 'critical', label: i18n.t('advisory.health_critical'), color: '#D93636', soft: '#FFE9E9'};
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
  {
    key: 'sowing',
    get label() {
      return i18n.t('advisory.step_sowing');
    },
    emoji: '🌱',
    fromBbch: 0,
  },
  {
    key: 'growth',
    get label() {
      return i18n.t('advisory.step_growth');
    },
    emoji: '🌿',
    fromBbch: 10,
  },
  {
    key: 'flower',
    get label() {
      return i18n.t('advisory.step_flower');
    },
    emoji: '🌼',
    fromBbch: 40,
  },
  {
    key: 'fruit',
    get label() {
      return i18n.t('advisory.step_fruit');
    },
    emoji: '🌾',
    fromBbch: 70,
  },
  {
    key: 'harvest',
    get label() {
      return i18n.t('advisory.step_harvest');
    },
    emoji: '🧺',
    fromBbch: 90,
  },
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
  get gdd() {
    return i18n.t('advisory.signal_gdd');
  },
  get calendar() {
    return i18n.t('advisory.signal_calendar');
  },
  get ndvi() {
    return i18n.t('advisory.signal_ndvi');
  },
};

/*
|--------------------------------------------------------------------------
| ACTIVITIES
|--------------------------------------------------------------------------
*/

export const ACTIVITY_UI = {
  SPRAY: {
    icon: SprayCan,
    color: '#2563EB',
    soft: '#EAF1FF',
    get tag() {
      return i18n.t('advisory.tag_spray');
    },
  },
  FERTIGATION: {
    icon: FlaskConical,
    color: '#16883E',
    soft: '#E8F7EE',
    get tag() {
      return i18n.t('advisory.tag_fertigation');
    },
  },
  IRRIGATION: {
    icon: Droplets,
    color: '#0891B2',
    soft: '#E3F6FA',
    get tag() {
      return i18n.t('advisory.tag_irrigation');
    },
  },
  WEATHER: {
    icon: CloudLightning,
    color: '#E5484D',
    soft: '#FFEDED',
    get tag() {
      return i18n.t('advisory.tag_weather');
    },
  },
  CROP_RISK: {
    icon: ShieldAlert,
    color: '#D97706',
    soft: '#FFF4E0',
    get tag() {
      return i18n.t('advisory.tag_crop_risk');
    },
  },
  MONITORING: {
    icon: ScanSearch,
    color: '#7C3AED',
    soft: '#F1EBFF',
    get tag() {
      return i18n.t('advisory.tag_monitoring');
    },
  },
  CARBON_TRACKING: {
    icon: Leaf,
    color: '#059669',
    soft: '#E2F7EF',
    get tag() {
      return i18n.t('advisory.tag_carbon_tracking');
    },
  },
};

export const FALLBACK_ACTIVITY_UI = {
  icon: Leaf,
  color: '#64748B',
  soft: '#F1F5F9',
  get tag() {
    return i18n.t('advisory.tag_task');
  },
};

export const PROGRESS_STEPS = [
  {
    key: 'started',
    get label() {
      return i18n.t('advisory.progress_started');
    },
  },
  {
    key: 'in_progress',
    get label() {
      return i18n.t('advisory.progress_in_progress');
    },
  },
  {
    key: 'completed',
    get label() {
      return i18n.t('advisory.progress_completed');
    },
  },
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
    parts.push(i18n.t('units.kg_per_acre_value', {n: product.quantityKgPerAcre}));
  } else if (product.quantityKgPerHa != null) {
    parts.push(i18n.t('units.kg_per_ha_value', {n: product.quantityKgPerHa}));
  } else if (product.dose) {
    parts.push(product.dose);
  } else if (product.totalKgFarm != null) {
    parts.push(i18n.t('units.kg_value', {n: product.totalKgFarm}));
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
      label: i18n.exists(`advisory.detail_${key}`)
        ? i18n.t(`advisory.detail_${key}`)
        : humanizeKey(key),
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
    get grade() {
      return i18n.t('advisory.grade_urea');
    },
    nutrient: 'N',
    color: '#E8A80C',
  },
  {
    key: 'dapKg',
    deficitKey: 'deficitP',
    name: 'DAP',
    get grade() {
      return i18n.t('advisory.grade_dap');
    },
    nutrient: 'P₂O₅',
    color: '#DC4A3D',
  },
  {
    key: 'mopKg',
    deficitKey: 'deficitK',
    name: 'MOP',
    get grade() {
      return i18n.t('advisory.grade_mop');
    },
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

  if (minutes < 1) return i18n.t('common.just_now');
  if (minutes < 60) return i18n.t('time.minutes_ago', {n: minutes});

  const hours = Math.round(minutes / 60);

  if (hours < 24) return i18n.t('time.hours_ago', {n: hours});

  const days = Math.round(hours / 24);

  return i18n.t(days === 1 ? 'time.day_ago' : 'time.days_ago', {n: days});
};
