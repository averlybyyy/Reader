const path=require('node:path');const assert=require('node:assert/strict');const {chromium}=require(path.join(process.env.READER_DEPENDENCIES,'playwright'));
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const context=await browser.newContext({serviceWorkers:'block'});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/Reader/');await page.waitForSelector('#add-books');
 const results=await page.evaluate(async()=>{
  const {dictionary,translate}=await import('./src/translate.js');const {put,remove}=await import('./src/db.js');const native=window.fetch;let mode='server',calls=[],release,startedResolve;const started=new Promise(r=>startedResolve=r);
  window.fetch=async(input,options)=>{const url=new URL(input,location.href);if(!/google|mymemory/.test(url.hostname))return native(input,options);calls.push(url.hostname+':'+url.searchParams.get('q'));
   if(url.hostname.includes('mymemory'))throw Error('MyMemory must never translate a single word');
   if(mode==='queue'&&url.searchParams.get('q')==='A delayed paragraph.'){startedResolve();return new Promise(resolve=>release=()=>resolve(new Response(JSON.stringify([[['Задержанный абзац.']]]),{status:200})));}
   if(mode==='rate')return new Response('',{status:429});if(mode==='broken')throw TypeError('Failed to fetch');if(mode==='server'&&url.hostname==='translate.googleapis.com')return new Response('',{status:503});
   return new Response(JSON.stringify([[['палочка']],mode==='plain'?null:[['noun',['палочка','жезл','волшебная палочка']]]]),{status:200});
  };
  try{
   await put('translations',{key:'word-v2:wand',value:{provider:'MyMemory',translation:'ручной портативный металлодетектор',terms:[],groups:[]}});const wand=await dictionary('wand',{force:true});const alternate=calls.slice();
   mode='rate';calls=[];let rateError='';try{await dictionary('qazrate');}catch(e){rateError=e.message;}const rateCalls=calls.slice();
   mode='broken';calls=[];await remove('translations','word-v3:en:ru:wand');const offlineWand=await dictionary('wand',{force:true});let firstError=false;try{await dictionary('qazretry');}catch{firstError=true;}
   mode='plain';const retry=await dictionary('qazretry',{force:true});
   mode='queue';calls=[];let textDone=false;const text=translate('A delayed paragraph.').then(v=>{textDone=true;return v;});await started;const word=await dictionary('qazpriority');const separate=!textDone;release();await text;
   return {wand,alternate,rateError,rateCalls,offlineWand,firstError,retry,separate,word};
  }finally{window.fetch=native;}
 });
 assert.equal(results.wand.provider,'Google');assert.match(results.wand.translation,/палочка/);assert.ok(results.alternate.some(s=>s.startsWith('clients5.google.com')));assert.equal(results.rateCalls.length,1);assert.match(results.rateError,/лимит/);assert.equal(results.offlineWand.provider,'Встроенный словарь');assert.ok(!/металлодетектор/.test(results.offlineWand.translation));assert.equal(results.firstError,true);assert.equal(results.retry.provider,'Google');assert.deepEqual(results.retry.groups,[]);assert.equal(results.separate,true);console.log('PASS: server fallback, 429 respected, old MyMemory cache ignored, local safe fallback, retry after failure, empty meanings and independent word lookup queue');
 const live=await browser.newContext({serviceWorkers:'block'});const actual=await live.newPage();await actual.goto('http://127.0.0.1:4173/Reader/');await actual.waitForSelector('#add-books');const result=await actual.evaluate(async()=>{const {dictionary,reverseDictionary}=await import('./src/translate.js');return {wand:await dictionary('wand',{force:true}),wizard:await reverseDictionary('волшебником')};});assert.equal(result.wand.provider,'Google');assert.ok(result.wand.terms.includes('волшебная палочка'));assert.ok(result.wizard.terms.some(w=>w.includes('wizard')));console.log('PASS: live Google wand and Russian → English wizard responses');await live.close();await context.close();
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
