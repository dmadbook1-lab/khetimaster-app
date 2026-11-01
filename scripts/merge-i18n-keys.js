/**
 * Merges a batch of keys into en/hi/mr. Batch file shape:
 *   { "namespace": { "key": { "en": "...", "hi": "...", "mr": "..." } } }
 * Nested namespaces are fine ("a.b" style objects). Existing keys are overwritten.
 * Run: node scripts/merge-i18n-keys.js path/to/batch.json [...more]
 */
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/translation/locales');
const LANGS = ['en', 'hi', 'mr'];

const isLeaf = v => v && typeof v === 'object' && typeof v.en === 'string';

const locales = Object.fromEntries(
  LANGS.map(lang => [
    lang,
    JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${lang}.json`), 'utf8')),
  ]),
);

let count = 0;
const merge = (batch, targets, trail) => {
  for (const [key, value] of Object.entries(batch)) {
    const at = [...trail, key].join('.');
    if (isLeaf(value)) {
      for (const lang of LANGS) {
        if (typeof value[lang] !== 'string' || !value[lang].trim()) {
          throw new Error(`${at}: missing ${lang}`);
        }
        targets[lang][key] = value[lang];
      }
      count += 1;
    } else if (value && typeof value === 'object') {
      const next = {};
      for (const lang of LANGS) {
        if (typeof targets[lang][key] !== 'object' || targets[lang][key] === null) {
          targets[lang][key] = {};
        }
        next[lang] = targets[lang][key];
      }
      merge(value, next, [...trail, key]);
    } else {
      throw new Error(`${at}: expected {en, hi, mr} or a namespace`);
    }
  }
};

for (const file of process.argv.slice(2)) {
  merge(JSON.parse(fs.readFileSync(file, 'utf8')), locales, []);
}

for (const lang of LANGS) {
  fs.writeFileSync(
    path.join(LOCALES_DIR, `${lang}.json`),
    `${JSON.stringify(locales[lang], null, 2)}\n`,
  );
}
console.log(`Merged ${count} keys into ${LANGS.join(', ')}.`);
