// Helpers for the Ekosight report shape.

export const MICRO_KEYS = ['calcium', 'magnesium', 'sulphur', 'zinc', 'iron', 'boron', 'copper'];

// Localised text from {english, hindi, telugu, ...}. Marathi falls back to
// English because the partner does not send it.
export const pickText = (obj, lang) => {
  if (!obj) {
    return '';
  }
  if (typeof obj === 'string') {
    return obj;
  }
  const code = String(lang || 'en').slice(0, 2);
  const key = code === 'hi' ? 'hindi' : code === 'mr' ? 'marathi' : 'english';
  return obj[key] || obj.english || Object.values(obj).find(Boolean) || '';
};

const num = v => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

export const phBand = v => {
  const n = num(v);
  if (n === null) {
    return null;
  }
  if (n < 6.5) {
    return 'phAcidic';
  }
  return n <= 7.5 ? 'phNeutral' : 'phAlkaline';
};

// Micronutrients present in the report (the API strips them when all zero).
export const microsOf = report =>
  MICRO_KEYS.filter(k => report?.[k] !== undefined && report?.[k] !== null && report?.[k] !== '');

export const planOf = report => {
  const rec = report?.recommendation;
  const list = Array.isArray(rec?.recommendations) ? rec.recommendations : [];
  return {
    crop: rec?.crop || '',
    stages: [...list].sort((a, b) => (a.order || 0) - (b.order || 0)),
  };
};
