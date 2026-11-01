/**
 * Checks every locale has exactly the keys en.json has, and keeps its
 * {{placeholders}}. Run: npm run i18n:check
 */
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/translation/locales');
const SOURCE = 'en.json';

const flatten = (obj, prefix = '') =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      Object.assign(acc, flatten(value, full));
    } else {
      acc[full] = String(value);
    }
    return acc;
  }, {});

const placeholders = text => (text.match(/{{\s*\w+\s*}}/g) || []).sort().join();

const read = file =>
  flatten(JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8')));

const source = read(SOURCE);
const sourceKeys = Object.keys(source);
let failed = false;

for (const file of fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'))) {
  if (file === SOURCE) {
    continue;
  }
  const locale = read(file);
  const missing = sourceKeys.filter(key => !(key in locale));
  const extra = Object.keys(locale).filter(key => !(key in source));
  const badPlaceholders = sourceKeys.filter(
    key => key in locale && placeholders(locale[key]) !== placeholders(source[key]),
  );
  const empty = sourceKeys.filter(key => key in locale && !locale[key].trim());

  if (missing.length || extra.length || badPlaceholders.length || empty.length) {
    failed = true;
    console.log(`\n${file}`);
    missing.length && console.log('  missing:', missing.join(', '));
    extra.length && console.log('  extra:', extra.join(', '));
    badPlaceholders.length &&
      console.log('  placeholder mismatch:', badPlaceholders.join(', '));
    empty.length && console.log('  empty:', empty.join(', '));
  }
}

if (failed) {
  process.exit(1);
}
console.log(`All locales match ${SOURCE} (${sourceKeys.length} keys).`);
