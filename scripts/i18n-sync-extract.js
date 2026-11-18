// usage: node scripts/i18n-sync-extract.js extract.json  -> prints stats; writes <extract>.used.json with only keys referenced in src
const fs=require('fs'),path=require('path');
const ex=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const files=[];const walk=p=>{fs.statSync(p).isDirectory()?fs.readdirSync(p).forEach(f=>walk(path.join(p,f))):/\.jsx?$/.test(p)&&files.push(p)};walk('src');
const used=new Set();const re=/\b(?:i18n\.)?t\(\s*['"`]([A-Za-z0-9_.]+)['"`]/g;
const dyn=[];
for(const f of files){const s=fs.readFileSync(f,'utf8');let m;while((m=re.exec(s)))used.add(m[1]);}
const en=JSON.parse(fs.readFileSync('src/translation/locales/en.json','utf8'));
const flat=(o,p='')=>Object.entries(o).reduce((a,[k,v])=>v&&typeof v==='object'?Object.assign(a,flat(v,p+k+'.')):(a[p+k]=v,a),{});
const fe=flat(en);
const out={};let unused=0,missing=[];
for(const k of Object.keys(ex)){ if(used.has(k)) out[k]=ex[k]; else unused++; }
for(const k of used){ if(!(k in fe)&&!(k in ex)) missing.push(k); }
fs.writeFileSync(process.argv[2].replace('.json','.used.json'),JSON.stringify(out,null,1));
console.log('extract',Object.keys(ex).length,'used',Object.keys(out).length,'unused',unused,'unique-en',new Set(Object.values(out)).size);
console.log('keys used in src but in neither en.json nor extract:',missing.length, missing.slice(0,40));
