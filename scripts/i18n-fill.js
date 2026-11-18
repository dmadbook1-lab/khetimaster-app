/**
 * Fills non-English locales with missing keys.
 *   node scripts/i18n-fill.js missing <lang>   -> prints {key: english} still missing in <lang>
 *   node scripts/i18n-fill.js import <lang> file.json -> merges {key: translated} into <lang>
 */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '../src/translation/locales');
const flatten = (o, p = '') =>
  Object.entries(o).reduce((a, [k, v]) => {
    const f = p ? `${p}.${k}` : k;
    return v && typeof v === 'object' ? Object.assign(a, flatten(v, f)) : ((a[f] = String(v)), a);
  }, {});
const load = l => JSON.parse(fs.readFileSync(path.join(DIR, `${l}.json`), 'utf8'));
const [cmd, lang, file] = process.argv.slice(2);
if (cmd === 'missing') {
  const en = flatten(load('en'));
  const have = flatten(load(lang));
  const out = {};
  for (const k of Object.keys(en)) if (!(k in have)) out[k] = en[k];
  console.log(JSON.stringify(out, null, 1));
} else if (cmd === 'import') {
  const data = load(lang);
  const add = JSON.parse(fs.readFileSync(file, 'utf8'));
  let n = 0;
  for (const [k, v] of Object.entries(add)) {
    const parts = k.split('.');
    let o = data;
    parts.slice(0, -1).forEach(p => (o = typeof o[p] === 'object' && o[p] ? o[p] : (o[p] = {})));
    o[parts[parts.length - 1]] = v;
    n++;
  }
  fs.writeFileSync(path.join(DIR, `${lang}.json`), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Imported ${n} keys into ${lang}`);
}
