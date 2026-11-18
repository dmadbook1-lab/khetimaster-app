/**
 * Lists user-visible hardcoded strings: JSX text, text-like JSX props,
 * Alert.alert/toast.show args, and Latin-text strings in label/title/etc. object props.
 * Usage: node scripts/find-hardcoded.js [path...]   (default: src)
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const PROPS = new Set(['title','subtitle','label','placeholder','description','hint','text','message','heading','name','caption','cta','buttonText','emptyText','accessibilityLabel','headerTitle','header','body','helper','error','sub','note','tagline','badge','tag','unit','value']);
const OBJ_KEYS = new Set(['title','subtitle','label','description','hint','message','heading','text','caption','cta','placeholder','sub','note','tagline','badge','helper','body','question','name']);
const looksText = s => /[A-Za-z]{3,}/.test(s) && /\s|^[A-Z]/.test(s) && !/^(https?:|#|\/|[a-z]+[A-Z]\w*$|[a-z_]+$)/.test(s) && !/^[\w.-]+\.(png|jpg|jpeg)$/.test(s);
const files = [];
const walk = p => {
  if (fs.statSync(p).isDirectory()) fs.readdirSync(p).forEach(f => walk(path.join(p, f)));
  else if (/\.jsx?$/.test(p)) files.push(p);
};
(process.argv.slice(2).length ? process.argv.slice(2) : ['src']).forEach(walk);
let total = 0;
for (const f of files) {
  if (/theme\.js$|Theme\.js$/.test(f)) {}
  let ast;
  try {
    ast = parser.parse(fs.readFileSync(f, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  } catch (e) { console.log(`!! parse fail ${f}`); continue; }
  const hits = [];
  const add = (node, s) => hits.push(`${node.loc.start.line}: ${s.replace(/\s+/g, ' ').trim().slice(0, 70)}`);
  traverse(ast, {
    JSXText(p) { const s = p.node.value.trim(); if (/[A-Za-z]{2,}/.test(s)) add(p.node, s); },
    JSXAttribute(p) {
      const n = p.node.name.name;
      if (!PROPS.has(n) || n === 'name' || n === 'value') return;
      const v = p.node.value;
      if (v && v.type === 'StringLiteral' && looksText(v.value)) add(v, `${n}="${v.value}"`);
    },
    CallExpression(p) {
      const c = p.node.callee;
      const isAlert = c.type === 'MemberExpression' && c.object.name === 'Alert' && c.property.name === 'alert';
      const isToast = c.type === 'MemberExpression' && /toast|Toast/.test(c.object.name || '') ;
      if (isAlert || isToast) p.node.arguments.forEach(a => { if (a.type === 'StringLiteral' && looksText(a.value)) add(a, `call("${a.value}")`); if (a.type === 'TemplateLiteral') add(a, 'call(`tpl`)'); });
    },
    ObjectProperty(p) {
      const k = p.node.key.name || p.node.key.value;
      const v = p.node.value;
      if (OBJ_KEYS.has(k) && v.type === 'StringLiteral' && looksText(v.value) && /[ ]/.test(v.value) || (OBJ_KEYS.has(k) && v.type === 'StringLiteral' && /^[A-Z][a-z]{2,}/.test(v.value) && k !== 'name')) add(v, `${k}: "${v.value}"`);
    },
    ConditionalExpression(p) { [p.node.consequent, p.node.alternate].forEach(v => { if (v.type === 'StringLiteral' && /^[A-Z][a-z]+( [A-Za-z]+)*$/.test(v.value) && /[a-z]{3,}/.test(v.value) && p.parent.type !== 'MemberExpression') add(v, `cond "${v.value}"`); }); },
  });
  if (hits.length) { total += hits.length; console.log(`\n## ${f} (${hits.length})`); hits.forEach(h => console.log('  ' + h)); }
}
console.error(`\nTotal: ${total}`);
