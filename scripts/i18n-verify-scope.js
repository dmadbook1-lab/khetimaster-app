// verifies every t(...) call resolves to a useTranslation() binding (catches shadowed `t`)
const fs=require('fs'),path=require('path');const parser=require('@babel/parser');const traverse=require('@babel/traverse').default;
const files=[];const walk=p=>{fs.statSync(p).isDirectory()?fs.readdirSync(p).forEach(f=>walk(path.join(p,f))):/\.jsx?$/.test(p)&&files.push(p)};walk('src');
let bad=0;
for(const f of files){let ast;try{ast=parser.parse(fs.readFileSync(f,'utf8'),{sourceType:'module',plugins:['jsx']})}catch(e){console.log('PARSE',f);continue}
 traverse(ast,{CallExpression(p){const c=p.node.callee;if(c.type!=='Identifier'||c.name!=='t')return;
  const b=p.scope.getBinding('t');
  const ok=b&&b.path.isVariableDeclarator()&&b.path.node.init&&b.path.node.init.callee&&b.path.node.init.callee.name==='useTranslation';
  if(!ok){bad++;console.log(f+':'+p.node.loc.start.line+' t() not bound to useTranslation'+(b?' (shadowed by '+b.kind+')':' (undeclared)'))}}})}
console.log('bad',bad);
