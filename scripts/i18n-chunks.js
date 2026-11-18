/**
 * Unique-English-string translation workflow.
 *   node scripts/i18n-chunks.js build <keys.json> <workdir>   keys.json = {dotted.key: english}
 *       -> workdir/unique.txt  (lines "i|english"), workdir/keymap.json ({i: [keys]})
 *   node scripts/i18n-chunks.js show <workdir> <from> <count>
 *   node scripts/i18n-chunks.js apply <workdir> <lang> <file.txt>   file lines "i|translation"
 */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '../src/translation/locales');
const [cmd, a, b, c] = process.argv.slice(2);
const esc = s => s.replace(/\n/g, '\\n');
const unesc = s => s.replace(/\\n/g, '\n');
const setDeep = (o, k, v) => {
  const parts = k.split('.');
  parts.slice(0, -1).forEach(p => (o = typeof o[p] === 'object' && o[p] ? o[p] : (o[p] = {})));
  o[parts[parts.length - 1]] = v;
};
if (cmd === 'build') {
  const keys = JSON.parse(fs.readFileSync(a, 'utf8'));
  const uniq = [], idx = {}, map = {};
  for (const [k, v] of Object.entries(keys)) {
    if (!(v in idx)) { idx[v] = uniq.length; uniq.push(v); map[idx[v]] = []; }
    map[idx[v]].push(k);
  }
  fs.mkdirSync(b, { recursive: true });
  fs.writeFileSync(path.join(b, 'unique.txt'), uniq.map((v, i) => `${i}|${esc(v)}`).join('\n') + '\n');
  fs.writeFileSync(path.join(b, 'keymap.json'), JSON.stringify(map));
  console.log('unique', uniq.length);
} else if (cmd === 'show') {
  const lines = fs.readFileSync(path.join(a, 'unique.txt'), 'utf8').split('\n').filter(Boolean);
  console.log(lines.slice(+b, +b + +c).join('\n'));
} else if (cmd === 'apply') {
  const map = JSON.parse(fs.readFileSync(path.join(a, 'keymap.json'), 'utf8'));
  const file = path.join(DIR, `${b}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const src = fs.readFileSync(path.join(a, 'unique.txt'), 'utf8').split('\n').filter(Boolean).map(l => l.slice(l.indexOf('|') + 1));
  let n = 0, bad = 0;
  for (const line of fs.readFileSync(c, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const p = line.indexOf('|');
    const i = line.slice(0, p);
    const t = unesc(line.slice(p + 1));
    if (!map[i] || !t.trim()) { bad++; console.log('skip', line.slice(0, 50)); continue; }
    const ph = x => (x.match(/\{\{\s*\w+\s*\}\}/g) || []).sort().join();
    if (ph(unesc(src[i])) !== ph(t)) { bad++; console.log('PLACEHOLDER MISMATCH', i, src[i], '=>', t); continue; }
    map[i].forEach(k => setDeep(data, k, t));
    n++;
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`${b}: applied ${n} strings, ${bad} skipped`);
}
