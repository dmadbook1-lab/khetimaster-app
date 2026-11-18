const fs=require('fs'),path=require('path');const parser=require('@babel/parser');const traverse=require('@babel/traverse').default;
const files=[];const walk=p=>{fs.statSync(p).isDirectory()?fs.readdirSync(p).forEach(f=>walk(path.join(p,f))):/\.jsx?$/.test(p)&&files.push(p)};walk('src');
for(const f of files){ if(/translation\/|\/data\/|\/api\/|voiceCommandResolver|languageUtils/.test(f))continue;
 let ast;try{ast=parser.parse(fs.readFileSync(f,'utf8'),{sourceType:'module',plugins:['jsx']})}catch(e){continue}
 const out=[];
 traverse(ast,{ArrayExpression(p){const els=p.node.elements;
   if(els.length>=2&&els.every(e=>e&&e.type==='StringLiteral'&&/^[A-Z][A-Za-z0-9 &'/.-]+$/.test(e.value))) out.push(p.node.loc.start.line+': ['+els.map(e=>e.value).join(' | ').slice(0,110)+']');
   if(els.length>=2&&els.every(e=>e&&e.type==='ObjectExpression')){ // objects with string values capitalised under unknown keys
     const keys=new Set();els.forEach(e=>e.properties.forEach(pr=>{ if(pr.value&&pr.value.type==='StringLiteral'&&/^[A-Z][a-z]+( [A-Za-z&]+)*$/.test(pr.value.value)&&!/^(id|key|type|color|bg|icon|image|route|screen)$/.test(pr.key.name||''))keys.add(pr.key.name+'='+pr.value.value)}));
     if(keys.size) out.push(p.node.loc.start.line+': objs '+[...keys].slice(0,6).join(' | '));}
 }});
 if(out.length){console.log('## '+f);out.forEach(o=>console.log('  '+o))}}
