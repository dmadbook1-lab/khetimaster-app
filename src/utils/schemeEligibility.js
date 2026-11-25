import {GOV_SCHEMES} from '../data/govSchemes';

export const EMPTY_PROFILE = {
  state: '',
  landHa: null,
  landStatus: '', // owner | tenant | none
  age: null,
  gender: '',
  caste: '',
  incomeTaxPayer: null,
  govtJob: null,
  activities: [],
};

export const ACRE_TO_HA = 0.404686;

const known = v => v !== undefined && v !== null && v !== '';

// Evaluates one declarative rule -> true | false | null (unknown).
const evalRule = (rule, p) => {
  const v = p[rule.field];
  switch (rule.op) {
    case 'eq':
      return known(v) ? v === rule.value : null;
    case 'in':
      return known(v) ? (rule.values || []).includes(v) : null;
    case 'range':
      if (!known(v)) {
        return null;
      }
      return (
        (rule.min === undefined || v >= rule.min) &&
        (rule.max === undefined || v <= rule.max)
      );
    case 'isFalse':
      return known(v) ? !v : null;
    case 'includes': {
      const list = Array.isArray(v) ? v : [];
      if (!list.length && rule.unknownIfEmpty !== false) {
        return null;
      }
      return list.includes(rule.value);
    }
    case 'any': {
      const rs = (rule.conditions || []).map(c => evalRule(c, p));
      if (rs.includes(true)) {
        return true;
      }
      return rs.includes(null) ? null : false;
    }
    default:
      return null;
  }
};

/*
 * Returns { status, checks } where status is:
 *   'eligible' | 'maybe' | 'not_eligible'
 * 'maybe' means nothing disqualifies the user but some answers are missing.
 */
export const checkScheme = (scheme, profile) => {
  const checks = (scheme.rules || []).map(rule => ({
    label: rule.label,
    result: evalRule(rule, profile),
  }));
  let status = 'eligible';
  if (checks.some(c => c.result === false)) {
    status = 'not_eligible';
  } else if (checks.some(c => c.result === null)) {
    status = 'maybe';
  }
  return {status, checks};
};

export const checkAllSchemes = profile =>
  GOV_SCHEMES.map(scheme => ({scheme, ...checkScheme(scheme, profile)}));

// A profile with no answers yet should not claim anything.
export const isProfileEmpty = p =>
  !p ||
  (p.landStatus === '' &&
    (p.age === null || p.age === undefined) &&
    !(p.activities || []).length);

const ORDER = {eligible: 0, maybe: 1, not_eligible: 2};
export const sortByEligibility = results =>
  [...results].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
