/**
 * Replaces hardcoded UI strings with t('ns.key') via text splicing (formatting preserved)
 * and records {key: english} to the extraction file.
 *   node scripts/i18n-codemod.js --ns market --out extract.json file1 file2 ...   (per-file ns: --ns auto)
 * Module-scope strings / unsupported shapes are listed as MANUAL.
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const NS = opt('--ns');
const OUT = opt('--out');
const ALLMODE = args.includes('--all') && args.splice(args.indexOf('--all'), 1);
const ANYKEY = args.includes('--anykey') && args.splice(args.indexOf('--anykey'), 1);
const DRY = args.includes('--dry') && args.splice(args.indexOf('--dry'), 1);
const files = args;

const enJson = JSON.parse(fs.readFileSync('src/translation/locales/en.json', 'utf8'));
const commonRev = {};
Object.entries(enJson.common || {}).forEach(([k, v]) => { if (typeof v === 'string') commonRev[v] = `common.${k}`; });

const PROPS = new Set(['title','subtitle','label','placeholder','description','hint','text','message','heading','caption','cta','buttonText','emptyText','accessibilityLabel','headerTitle','helper','error','sub','note','tagline','badge','tag','confirmText','cancelText','confirmLabel','cancelLabel','submitLabel','primaryLabel','secondaryLabel','actionLabel','ctaLabel','emptyTitle','emptySubtitle','loadingText','eyebrow','kicker','sectionTitle','buttonLabel','primaryLabel','secondaryLabel','okText','searchPlaceholder','helperText','errorText','info']);
const OBJ_KEYS = new Set(['confirmLabel','cancelLabel','submitLabel','primaryLabel','secondaryLabel','actionLabel','title','subtitle','label','description','hint','message','heading','text','caption','cta','placeholder','sub','note','tagline','badge','helper','body','question','eyebrow','kicker','desc','detail','summary','cta','buttonText','subtitle']);
const CALLS = /^(toast|Toast|showToast)$/;
const isText = s => /[A-Za-z]{2,}/.test(s) && !/^(https?:|#|\/|[\w.-]+\.(png|jpg|jpeg|json)$)/.test(s) && !/^[a-z_]+$/.test(s) && !/^[a-z]+[A-Z]\w*$/.test(s);

const camel = text => {
  const w = text.replace(/['’]/g, '').replace(/\{\{.*?\}\}/g, ' ').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (!w.length) return 'text';
  return w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase())).join('');
};
const nsAuto = f => {
  let b = path.basename(f).replace(/\.jsx?$/, '').replace(/Screen$/, '').replace(/[^A-Za-z0-9]/g, '');
  return b[0].toLowerCase() + b.slice(1);
};

const extract = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const report = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let ast;
  try { ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] }); } catch (e) { console.log(`!! parse ${file}`); continue; }
  const ns = NS && NS !== 'auto' ? NS : nsAuto(file);
  const used = {}; // text -> key (within this file)
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, p ? p + '.' + k : k) : [p ? p + '.' + k : k]));
  const taken = new Set([...Object.keys(extract), ...flat(enJson)].filter(k => k.startsWith(ns + '.')));
  const edits = [];
  const manual = [];
  const compsNeedingHook = new Map(); // function node -> true
  const depEdits = new Map();

  const keyFor = text => {
    if (commonRev[text]) return commonRev[text];
    if (used[text]) return used[text];
    let base = camel(text), k = `${ns}.${base}`, i = 2;
    while (taken.has(k) && extract[k] !== text) k = `${ns}.${base}${i++}`;
    taken.add(k); used[text] = k; extract[k] = text; return k;
  };

  const findComp = p => {
    let fn = p.findParent(x => x.isFunction());
    while (fn) {
      const n = fn.node;
      let name = n.id && n.id.name;
      if (!name && fn.parentPath.isVariableDeclarator()) name = fn.parentPath.node.id.name;
      if (!name && fn.parentPath.isCallExpression()) { // memo(() => ..) / forwardRef
        const vp = fn.parentPath.parentPath;
        if (vp.isVariableDeclarator()) name = vp.node.id.name;
        else if (vp.isCallExpression() && vp.parentPath.isVariableDeclarator()) name = vp.parentPath.node.id.name;
      }
      if (name && /^([A-Z]|use[A-Z])/.test(name)) return fn;
      fn = fn.findParent(x => x.isFunction());
    }
    return null;
  };
  const useDeps = p => {
    // add t to useMemo/useCallback deps when string lives inside one
    let c = p.findParent(x => x.isCallExpression() && x.node.callee.name && /^(useMemo|useCallback)$/.test(x.node.callee.name));
    while (c) {
      const deps = c.node.arguments[1];
      if (deps && deps.type === 'ArrayExpression') {
        const has = deps.elements.some(e => e && e.type === 'Identifier' && e.name === 't');
        if (!has && !depEdits.has(deps)) {
          const pos = deps.elements.length ? deps.elements[deps.elements.length - 1].end : deps.start + 1;
          depEdits.set(deps, { start: pos, end: pos, text: deps.elements.length ? ', t' : 't' });
        }
      }
      c = c.findParent(x => x.isCallExpression() && x.node.callee.name && /^(useMemo|useCallback)$/.test(x.node.callee.name));
    }
  };

  const build = (text, interps) => {
    const key = keyFor(text);
    return interps.length ? `t('${key}', {${interps.map(([n, e]) => (n === e ? n : `${n}: ${e}`)).join(', ')}})` : `t('${key}')`;
  };
  const q = s => s; // marker
  // template literal -> {text, interps}
  const fromTemplate = node => {
    let text = '', interps = [], names = {};
    node.quasis.forEach((qq, i) => {
      text += qq.value.cooked;
      if (i < node.expressions.length) {
        const e = node.expressions[i];
        let n = e.type === 'Identifier' ? e.name : e.type === 'MemberExpression' && !e.computed && e.property.name ? e.property.name : `v${i + 1}`;
        if (names[n]) n = `${n}${i + 1}`; names[n] = 1;
        interps.push([n, src.slice(e.start, e.end)]);
        text += `{{${n}}}`;
      }
    });
    return { text, interps };
  };

  let needI18n = false;
  const apply = (p, node, replacement, kind, propNode) => {
    if (edits.some(e => e.text !== '' && e.start < node.end && node.start < e.end && !(e.start === e.end))) return false;
    if (p.findParent(x => x.isAssignmentPattern() && x.listKey === 'params') || (p.parentPath.isAssignmentPattern() && p.parentPath.listKey === 'params')) { manual.push(`${node.loc.start.line}: default-param string: ${src.slice(node.start, node.end).slice(0, 50)}`); return false; }
    const comp = findComp(p);
    if (!comp && propNode && !propNode.computed && !propNode.shorthand && (propNode.key.type === 'Identifier' || propNode.key.type === 'StringLiteral') && (p.isObjectProperty() ? p.parentPath : p.parentPath.parentPath).isObjectExpression() && p.findParent(x => x.isFunction()) == null) {
      const kn = propNode.key.type === 'Identifier' ? propNode.key.name : JSON.stringify(propNode.key.value);
      needI18n = true;
      edits.push({ start: propNode.start, end: propNode.end, text: `get ${kn}() {\n    return ${replacement.replace(/^t\(/, 'i18n.t(')};\n  }` });
      return true;
    }
    if (!comp && p.findParent(x => x.isFunction()) && kind !== 'jsx-text' && kind !== 'jsx-mixed' && !kind.startsWith('prop')) {
      needI18n = true;
      edits.push({ start: node.start, end: node.end, text: replacement.replace(/^t\(/, 'i18n.t(') });
      return true;
    }
    if (!comp) { manual.push(`${node.loc.start.line}: module-scope ${kind}: ${src.slice(node.start, node.end).slice(0, 60)}`); return false; }
    compsNeedingHook.set(comp.node, comp);
    useDeps(p);
    edits.push({ start: node.start, end: node.end, text: replacement });
    return true;
  };

  traverse(ast, {
    JSXElement(p) {
      const kids = p.node.children;
      const hasExpr = kids.some(c => c.type === 'JSXExpressionContainer' && c.expression.type !== 'JSXEmptyExpression');
      const hasElem = kids.some(c => c.type === 'JSXElement' || c.type === 'JSXFragment');
      const texts = kids.filter(c => c.type === 'JSXText' && /[A-Za-z]{2,}/.test(c.value));
      if (!texts.length) return;
      if (hasExpr && !hasElem) {
        // merge text + expressions into one string if every expression is simple
        const simple = kids.every(c => c.type === 'JSXText' || (c.type === 'JSXExpressionContainer' && ['Identifier','MemberExpression','NumericLiteral','CallExpression','LogicalExpression','ConditionalExpression','TemplateLiteral','BinaryExpression','OptionalMemberExpression'].includes(c.expression.type) && !(c.expression.type === 'ConditionalExpression' && false)));
        // skip if the expression itself yields JSX (ternary/logical with JSX)
        const yieldsJsx = kids.some(c => c.type === 'JSXExpressionContainer' && /JSX/.test(JSON.stringify(c.expression, (k, v) => (k === 'loc' || k === 'start' || k === 'end' ? undefined : v)).slice(0, 4000)));
        if (simple && !yieldsJsx) {
          let text = '', interps = [], names = {};
          kids.forEach((c, i) => {
            if (c.type === 'JSXText') text += c.value.replace(/\s+/g, ' ');
            else {
              const e = c.expression;
              let n = e.type === 'Identifier' ? e.name : (e.type === 'MemberExpression' || e.type === 'OptionalMemberExpression') && !e.computed && e.property.name ? e.property.name : `v${interps.length + 1}`;
              if (names[n]) n = `${n}${interps.length + 1}`; names[n] = 1;
              interps.push([n, src.slice(e.start, e.end)]);
              text += `{{${n}}}`;
            }
          });
          const trimmed = text.trim();
          if (/[A-Za-z]{2,}/.test(trimmed.replace(/\{\{.*?\}\}/g, ''))) {
            const first = kids[0], last = kids[kids.length - 1];
            const replacement = `{${build(trimmed, interps)}}`;
            // replace whole children range preserving surrounding whitespace-only edges
            const lead = first.type === 'JSXText' ? first.value.match(/^\s*/)[0] : '';
            const trail = last.type === 'JSXText' ? last.value.match(/\s*$/)[0] : '';
            const compOk = apply(p, { start: first.start, end: last.end, loc: first.loc }, lead + replacement + trail, 'jsx-mixed');
            if (compOk) p.skip();
            return;
          }
        }
      }
    },
    JSXText(p) {
      if (edits.some(e => e.start <= p.node.start && e.end >= p.node.end)) return;
      const v = p.node.value;
      const t = v.replace(/\s+/g, ' ').trim();
      if (!/[A-Za-z]{2,}/.test(t)) return;
      if (/^[{}]/.test(t)) return;
      const lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
      apply(p, p.node, `${lead}{${build(t, [])}}${trail}`, 'jsx-text');
    },
    JSXAttribute(p) {
      const n = p.node.name.name;
      if (!PROPS.has(n)) return;
      const v = p.node.value;
      if (!v) return;
      if (v.type === 'StringLiteral' && isText(v.value)) apply(p, v, `{${build(v.value, [])}}`, `prop ${n}`);
      else if (v.type === 'JSXExpressionContainer') {
        const e = v.expression;
        if (e.type === 'StringLiteral' && isText(e.value)) apply(p, e, build(e.value, []), `prop ${n}`);
        else if (e.type === 'TemplateLiteral' && e.expressions.length) { const r = fromTemplate(e); if (/[A-Za-z]{2,}/.test(r.text.replace(/\{\{.*?\}\}/g, ''))) apply(p, e, build(r.text, r.interps), `prop ${n}`); }
        else if (e.type === 'ConditionalExpression') [e.consequent, e.alternate].forEach(b => { if (b.type === 'StringLiteral' && isText(b.value)) apply(p, b, build(b.value, []), `cond ${n}`); });
      }
    },
    CallExpression(p) {
      const c = p.node.callee;
      const isAlert = c.type === 'MemberExpression' && c.object.name === 'Alert' && c.property.name === 'alert';
      const isToast = (c.type === 'MemberExpression' && CALLS.test(c.object.name || '') && /^(show|success|error|info)$/.test(c.property.name)) || (c.type === 'Identifier' && CALLS.test(c.name));
      if (!isAlert && !isToast) return;
      p.node.arguments.slice(0, 2).forEach(a => {
        if (a.type === 'StringLiteral' && isText(a.value)) apply(p, a, build(a.value, []), 'call');
        else if (a.type === 'TemplateLiteral') { const r = fromTemplate(a); if (/[A-Za-z]{2,}/.test(r.text.replace(/\{\{.*?\}\}/g, ''))) apply(p, a, build(r.text, r.interps), 'call-tpl'); }
      });
      if (isAlert && p.node.arguments[2] && p.node.arguments[2].type === 'ArrayExpression') {
        p.node.arguments[2].elements.forEach(el => {
          if (el.type !== 'ObjectExpression') return;
          el.properties.forEach(pr => { if (pr.key && pr.key.name === 'text' && pr.value.type === 'StringLiteral' && isText(pr.value.value)) apply(p, pr.value, build(pr.value.value, []), 'alert-btn'); });
        });
      }
    },
    ObjectProperty(p) {
      const k = p.node.key.name || p.node.key.value;
      const v = p.node.value;
      if (!OBJ_KEYS.has(k) && !(ANYKEY && !/^(id|key|type|color|bg|icon|image|route|screen|name|uri|url|status|kind|unit|code|value|fontFamily|testID)$/.test(k))) return;
      if (p.parentPath.parentPath.isJSXExpressionContainer && p.findParent(x => x.isJSXAttribute() && x.node.name.name === 'style')) return;
      if (v.type === 'StringLiteral' && isText(v.value) && /^[A-Z0-9]/.test(v.value)) apply(p, v, build(v.value, []), `obj ${k}`, p.node);
      else if (v.type === 'TemplateLiteral' && v.expressions.length) { const r = fromTemplate(v); if (/[A-Za-z]{3,}/.test(r.text.replace(/\{\{.*?\}\}/g, ''))) apply(p, v, build(r.text, r.interps), `obj-tpl ${k}`, p.node); }
    },
    TemplateLiteral(p) {
      if (!p.node.expressions.length) return;
      if (edits.some(e => e.start <= p.node.start && e.end >= p.node.end)) return;
      let c = p, ok = false;
      while (c.parentPath) {
        const par = c.parentPath;
        if (par.isConditionalExpression() || par.isLogicalExpression()) { c = par; continue; }
        ok = par.isJSXExpressionContainer() && par.parentPath.isJSXElement();
        break;
      }
      if (!ok) return;
      const r = fromTemplate(p.node);
      if (/[A-Za-z]{3,}/.test(r.text.replace(/\{\{.*?\}\}/g, '')) && /[A-Za-z]{3,}/.test(r.text.replace(/\{\{.*?\}\}/g, '').trim().split(' ').pop())) apply(p, p.node, build(r.text, r.interps), 'tpl-child');
    },
    ConditionalExpression(p) {
      const arms = [p.node.consequent, p.node.alternate];
      const txt = b => b.type === 'StringLiteral' && isText(b.value) && /^[A-Z]/.test(b.value) && /[a-z]{2,}/.test(b.value);
      if (!arms.every(b => txt(b) || b.type === 'NullLiteral' || b.type === 'Identifier' || b.type === 'MemberExpression' || b.type === 'TemplateLiteral' || b.type === 'CallExpression' || b.type === 'ConditionalExpression' || b.type === 'JSXElement' || b.type === 'StringLiteral') ) return;
      if (!arms.some(txt)) return;
      if (p.findParent(x => x.isJSXAttribute() && ['style','source','name','key','testID'].includes(x.node.name.name))) return;
      if (p.findParent(x => x.isMemberExpression() && x.node.computed && x.node.property === p.node)) return;
      arms.forEach(b => { if (txt(b)) apply(p, b, build(b.value, []), 'cond'); });
    },
  });

  if (ALLMODE) traverse(ast, {
    StringLiteral(p) {
      if (!ALLMODE) return;
      const v = p.node.value, par = p.parent;
      if (!/[A-Za-z]{3,}[ ,.'!?-]+[A-Za-z]{2,}/.test(v) || /^(https?:|\/|\.|@|[a-z]+:)/.test(v) || /^[A-Za-z0-9_.\/-]+$/.test(v)) return;
      if (['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration','MemberExpression','JSXAttribute'].includes(par.type) && par.type !== 'JSXAttribute') return;
      if (par.type === 'BinaryExpression' && /^(===|!==|==|!=)$/.test(par.operator)) return;
      if (par.type === 'SwitchCase') return;
      if (par.type === 'ObjectProperty' && par.key === p.node) return;
      if (par.type === 'ObjectProperty' && /^(fontFamily|color|id|key|type|icon|image|url|route|screen|status|kind|testID|animation|name|uri|source)$/.test(par.key.name || par.key.value || '')) return;
      if (par.type === 'JSXAttribute') { if (/^(style|name|key|testID|source|resizeMode|animation|type|keyboardType|mode|color|uri|id)$/.test(par.name.name)) return; }
      if (par.type === 'CallExpression' && /^(require|t|console|i18n|log|warn|error|Linking|fetch|getItem|setItem|removeItem|post|get|put|delete|patch|navigate|replace|push|dispatch|StyleSheet|Platform|addEventListener|emit|on|off|createAsyncThunk|createSlice)$/.test(par.callee.name || (par.callee.property && par.callee.property.name) || '')) return;
      if (par.type === 'NewExpression' && /^(RegExp|Date|URL)$/.test(par.callee.name)) return;
      if (p.findParent(x => x.isJSXAttribute() && /^(style|name|key|testID|source)$/.test(x.node.name.name))) return;
      if (p.findParent(x => x.isCallExpression() && x.node.callee.type === 'MemberExpression' && x.node.callee.object.name === 'StyleSheet')) return;
      const rep = par.type === 'JSXAttribute' ? `{${build(v, [])}}` : build(v, []);
      apply(p, p.node, rep, par.type === 'JSXAttribute' ? 'prop-all' : 'all', par.type === 'ObjectProperty' ? par : undefined);
    },
    TemplateLiteral(p) {
      if (!ALLMODE || !p.node.expressions.length) return;
      if (edits.some(e => e.start <= p.node.start && e.end >= p.node.end)) return;
      const par = p.parent;
      if (['TaggedTemplateExpression'].includes(par.type)) return;
      const r = fromTemplate(p.node);
      const plain = r.text.replace(/\{\{.*?\}\}/g, '');
      if (!/[A-Za-z]{3,}[ ,.'!?-]+[A-Za-z]{2,}/.test(plain) || !/ /.test(plain.trim()) || /^(https?:|\/|[a-z]+:)/.test(plain.trim()) || /<[a-z]/i.test(plain)) return;
      if (par.type === 'CallExpression' && /^(require|console|log|warn|fetch|get|post|put|delete|patch|createAsyncThunk|Linking|openURL|navigate)$/.test(par.callee.name || (par.callee.property && par.callee.property.name) || '')) return;
      if (par.type === 'ObjectProperty' && /^(uri|url|source|style|testID|key|id|name)$/.test(par.key.name || '')) return;
      if (p.findParent(x => x.isJSXAttribute() && /^(style|source|testID|key|uri)$/.test(x.node.name.name))) return;
      apply(p, p.node, build(r.text, r.interps), 'tpl-all');
    },
  });

  // hook injection
  const hasUseT = /useTranslation/.test(src);
  const injected = [];
  for (const [node, path_] of compsNeedingHook) {
    const body = node.body;
    if (body.type !== 'BlockStatement') { manual.push(`${node.loc.start.line}: arrow-expression body needs conversion for hook`); continue; }
    const already = body.body.some(s => s.type === 'VariableDeclaration' && s.declarations.some(d => d.id.type === 'ObjectPattern' && d.id.properties.some(pp => pp.key && pp.key.name === 't') && d.init && d.init.callee && d.init.callee.name === 'useTranslation'));
    if (!already) {
      const first = body.body[0];
      const indent = first ? (src.slice(src.lastIndexOf('\n', first.start) + 1, first.start).match(/^\s*/)[0]) : '  ';
      edits.push({ start: body.start + 1, end: body.start + 1, text: `\n${indent}const {t} = useTranslation();` });
    }
  }
  if (!edits.length && !manual.length) continue;
  if (needI18n && !/from 'i18next'/.test(src) && !/import i18n\b/.test(src)) {
    let pos = 0;
    ast.program.body.forEach(s => { if (s.type === 'ImportDeclaration') pos = s.end; });
    edits.push({ start: pos, end: pos, text: `\nimport i18n from 'i18next';` });
  }
  if (edits.some(e => /useTranslation|\bt\(/.test(e.text) && !/i18n\.t\(/.test(e.text) ) && !hasUseT) {
    const imps = [...src.matchAll(/^import .*?;?$/gm)];
    const last = imps[imps.length - 1];
    // handle multi-line imports: find end of last import statement via AST
    let pos = 0;
    ast.program.body.forEach(s => { if (s.type === 'ImportDeclaration') pos = s.end; });
    edits.push({ start: pos, end: pos, text: `\nimport {useTranslation} from 'react-i18next';` });
  }
  depEdits.forEach(e => edits.push(e));
  // apply from the end
  let out = src;
  edits.sort((a, b) => b.start - a.start || b.end - a.end).forEach(e => { out = out.slice(0, e.start) + e.text + out.slice(e.end); });
  if (!DRY && edits.length) fs.writeFileSync(file, out);
  console.log(`${file}: ${edits.length} edits, ns=${ns}`);
  manual.forEach(m => console.log('   MANUAL ' + m));
}
if (OUT && !DRY) fs.writeFileSync(OUT, JSON.stringify(extract, null, 1));
