import {get,put} from './db.js';
import {segments,baseWord} from './core.js';
const pending=new Map(),lookups=new Map();let queue=[],running=false,ipaPromise;
const seed={
 dog:{translation:'собака',terms:['собака','пёс'],groups:[{part:'существительное',terms:['собака','пёс']},{part:'глагол',terms:['преследовать по пятам']}]},
 book:{translation:'книга',terms:['книга'],groups:[{part:'существительное',terms:['книга']},{part:'глагол',terms:['бронировать','заказывать']}]},
 rabbit:{translation:'кролик',terms:['кролик'],groups:[]},daisy:{translation:'маргаритка',terms:['маргаритка','ромашка'],groups:[]},conversation:{translation:'разговор',terms:['разговор','беседа'],groups:[]},
 wand:{translation:'палочка, жезл, волшебная палочка',terms:['палочка','жезл','волшебная палочка','прут'],groups:[{part:'существительное',terms:['палочка','жезл','волшебная палочка','прут']}]},
 wizard:{translation:'волшебник, чародей',terms:['волшебник','чародей','маг'],groups:[{part:'существительное',terms:['волшебник','чародей','маг']}]},
 be:{translation:'быть',terms:['быть','являться','существовать'],groups:[{part:'глагол',terms:['быть','являться','существовать']}]}
};
async function json(url,timeout=8000){const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{signal:c.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok){const error=new Error(`Сервис перевода: ${r.status}`);error.status=r.status;throw error;}return await r.json();}finally{clearTimeout(timer);}}
function enqueue(key,task,priority){if(pending.has(key)){const i=queue.findIndex(j=>j.key===key);if(priority&&i>0)queue.unshift(...queue.splice(i,1));return pending.get(key);}let resolve,reject;const p=new Promise((r,j)=>{resolve=r;reject=j;});pending.set(key,p);const job={key,task,resolve,reject};priority?queue.unshift(job):queue.push(job);run();return p;}
async function run(){if(running)return;running=true;while(queue.length){const j=queue.shift();try{j.resolve(await j.task());}catch(e){j.reject(e);}pending.delete(j.key);await new Promise(r=>setTimeout(r,220));}running=false;}
function googleUrl(text,dict,from='en',to='ru',host='translate.googleapis.com'){const p=new URLSearchParams({client:'gtx',sl:from,tl:to,dt:'t',q:text});if(dict)p.append('dt','bd');return `https://${host}/translate_a/single?`+p;}
async function google(text,dict,from='en',to='ru'){
 try{return await json(googleUrl(text,dict,from,to));}catch(e){
  // Same service, alternate public endpoint for transport/server failures only.
  // Never switch hosts to get around a rate limit or an access denial.
  if(!navigator.onLine||[401,403,429].includes(e.status))throw e;
  return await json(googleUrl(text,dict,from,to,'clients5.google.com'),6000);
 }
}
async function memory(text){const pieces=segments(text,160);let used;try{used=JSON.parse(localStorage.getItem('reader-fallback-usage')||'{}');}catch{used={};}const day=new Date().toISOString().slice(0,10);if(used.day!==day)used={day,chars:0};if((used.chars||0)+text.length>4800)throw new Error('Основной переводчик недоступен. Дневной лимит резервного сервиса исчерпан.');const parts=[];for(const p of pieces){used.chars+=p.length;try{localStorage.setItem('reader-fallback-usage',JSON.stringify(used));}catch{}const result=await json('https://api.mymemory.translated.net/get?'+new URLSearchParams({q:p,langpair:'en|ru'}));if(Number(result.responseStatus)!==200||!result.responseData?.translatedText||result.quotaFinished)throw new Error('Переводчик временно недоступен.');parts.push(result.responseData.translatedText);}return {text:parts.join(' '),provider:'MyMemory'};}
export async function translate(text,priority=false){const key='text-v2:'+text;const cached=await get('translations',key);if(cached?.value)return cached.value;return enqueue(key,async()=>{let value;try{const data=await google(text,false);const result=data[0]?.map(p=>p[0]||'').join('');if(!result)throw Error();value={text:result,provider:'Google'};}catch{if(!navigator.onLine)throw new Error('Для нового перевода нужен интернет. Сохранённые переводы доступны офлайн.');value=await memory(text);}await put('translations',{key,value});return value;},priority);}
export function pronunciation(word){ipaPromise ||= fetch(new URL('../vendor/en_US.txt',import.meta.url)).then(r=>{if(!r.ok)throw Error();return r.text();}).then(t=>new Map(t.split('\n').map(line=>{const i=line.indexOf('\t');return [line.slice(0,i),line.slice(i+1).trim()];}))).catch(()=>{ipaPromise=null;return new Map();});return ipaPromise.then(dict=>dict.get(word.toLowerCase())||dict.get(baseWord(word))||'');}
const partNames={noun:'существительное',verb:'глагол',adjective:'прилагательное',adverb:'наречие',pronoun:'местоимение',preposition:'предлог',conjunction:'союз',interjection:'междометие',abbreviation:'сокращение','auxiliary verb':'вспомогательный глагол'};
function parseDictionary(data){const groups=(data[1]||[]).filter(Array.isArray).map(g=>({part:partNames[g[0]]||g[0],terms:(g[1]||[]).filter(t=>typeof t==='string'),examples:(g[2]||[]).slice(0,4).map(e=>({translation:e[0],back:e[1]||[]}))}));const plain=data[0]?.map(p=>p[0]||'').join('');if(!plain)throw Error('Пустой ответ словаря');return {translation:groups[0]?.terms.length?groups[0].terms.slice(0,3).join(', '):plain,terms:[plain,...groups.flatMap(g=>g.terms)],groups,provider:'Google',fetchedAt:Date.now()};}
async function lookup(word,from,to,force=false){
 const key=`word-v3:${from}:${to}:`+word,cached=await get('translations',key);
 if(!force&&cached?.value&&(!navigator.onLine||Date.now()-cached.value.fetchedAt<30*86400000))return cached.value;
 if(lookups.has(key))return lookups.get(key);
 const task=Promise.resolve().then(async()=>{try{
  if(!navigator.onLine)throw Error('offline');
  const value=parseDictionary(await google(word,true,from,to));await put('translations',{key,value});return value;
 }catch(error){
  if(cached?.value)return cached.value;
  const old=from==='en'&&to==='ru'?await get('translations','word-v2:'+word):null;
  // Legacy MyMemory word answers were not reliable lexical translations.
  if(old?.value?.provider==='Google')return old.value;
  if(from==='en'&&to==='ru'&&seed[word])return {...seed[word],provider:'Встроенный словарь'};
  throw new Error(!navigator.onLine?'Для перевода этого слова нужен интернет.':error.status===429?'Достигнут лимит словаря. Повторить попытку позже.':'Словарь временно недоступен. Перевод можно запросить повторно.');
 }finally{lookups.delete(key);}});lookups.set(key,task);return task;
}
export const dictionary=(word,options={})=>lookup(word,'en','ru',options.force);
export const reverseDictionary=word=>lookup(word.toLowerCase(),'ru','en');
export async function definitions(word){const key='definitions:'+word;const cached=await get('translations',key);if(cached)return cached.value;try{const d=await json('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(word));const value=(d[0]?.meanings||[]).slice(0,4).map(m=>({part:partNames[m.partOfSpeech]||m.partOfSpeech,definitions:m.definitions.slice(0,2)}));if(value.length)await put('translations',{key,value});return value;}catch{return [];}}
