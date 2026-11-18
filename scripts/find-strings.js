// broad scan: any string literal / template with >=2 words of letters (excluding imports, requires, console, style, t())
const fs=require('fs'),path=require('path');const parser=require('@babel/parser');const traverse=require('@babel/traverse').default;
const files=[];const walk=p=>{fs.statSync(p).isDirectory()?fs.readdirSync(p).forEach(f=>walk(path.join(p,f))):/\.jsx?$/.test(p)&&files.push(p)};
(process.argv.slice(2).length?process.argv.slice(2):['src']).forEach(walk);
let tot=0;
for(const f of files){ if(/translation\/|theme\.js|Theme\.js|\/data\/|\/api\//.test(f))continue;
 let ast;try{ast=parser.parse(fs.readFileSync(f,'utf8'),{sourceType:'module',plugins:['jsx']})}catch(e){continue}
 const hits=[];
 const check=(p,v,line)=>{ if(!/[A-Za-z]{3,}[ ,.'!?-]+[A-Za-z]{2,}/.test(v))return; if(/^(https?:|\/|\.|@|[a-z]+:)/.test(v))return; if(/^[A-Za-z0-9_.\/-]+$/.test(v))return;
   const par=p.parent; if(par.type==='ImportDeclaration'||par.type==='ExportNamedDeclaration'||par.type==='ExportAllDeclaration')return;
   if(par.type==='CallExpression'&&/^(require|t|console|i18n|log|warn|error)$/.test(par.callee.name||par.callee.property&&par.callee.property.name||par.callee.object&&par.callee.object.name||''))return;
   if(par.type==='MemberExpression'||par.type==='BinaryExpression'&&/^(===|!==|==)$/.test(par.operator))return;
   if(p.findParent(x=>x.isJSXAttribute()&&/^(style|name|key|testID|source|resizeMode|animation|type|keyboardType|mode)$/.test(x.node.name.name)))return;
   if(par.type==='ObjectProperty'&&/^(fontFamily|color|id|key|type|icon|image|url|route|screen|status|kind|testID|animation)$/.test(par.key.name||''))return;
   if(par.type==='JSXAttribute'&&/^(title|label|placeholder|subtitle)$/.test(par.name.name))return;
   if(/^[A-Z][A-Z_ ]+$/.test(v)&&!/ /.test(v))return;
   hits.push(line+': '+v.replace(/\s+/g,' ').slice(0,70));};
 traverse(ast,{StringLiteral(p){check(p,p.node.value,p.node.loc.start.line)},TemplateLiteral(p){const v=p.node.quasis.map(q=>q.value.cooked).join('{}');check(p,v,p.node.loc.start.line)}});
 if(hits.length){tot+=hits.length;console.log('\n## '+f+' ('+hits.length+')');hits.forEach(h=>console.log('  '+h))}}
console.error('Total',tot);
