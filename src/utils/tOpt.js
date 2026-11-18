import i18n from 'i18next';

/**
 * Translates a data value (crop, category, work type, status…) for display only.
 * The stored/API value stays untouched; unknown values fall back to themselves.
 *   tOpt('Cash Crops')  -> i18n key  opt.cashCrops
 */
export const optKey = value =>
  String(value)
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, m => m.toLowerCase());

export const tOpt = value =>
  value === null || value === undefined || value === ''
    ? value
    : i18n.t(`opt.${optKey(value)}`, {defaultValue: String(value)});
