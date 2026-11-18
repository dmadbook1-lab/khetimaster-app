// flags English strings that were extracted but still appear quoted elsewhere (possible logic comparisons)
const fs=require('fs'),path=require('path');
const ex=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const files=[];const walk=p=>{fs.statSync(p).isDirectory()?fs.readdirSync(p).forEach(f=>walk(path.join(p,f))):/\.jsx?$/.test(p)&&files.push(p)};walk('src');
const texts=[...new Set(Object.values(ex))].filter(t=>!t.includes('{{'));
for(const f of files){const s=fs.readFileSync(f,'utf8');
 for(const t of texts){ if(t.length<3)continue; const re=new RegExp("(===|!==|==|case|includes\\()\\s*['\"]"+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"['\"]");
  if(re.test(s)) console.log(f,'compares with',JSON.stringify(t)); }}
