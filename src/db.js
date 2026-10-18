let opening;
// App updates never delete this database. Schema versions only add stores.
export function database(){return opening ||= new Promise((resolve,reject)=>{
 const req=indexedDB.open('ReaderAppDB',3);
 req.onupgradeneeded=()=>{const db=req.result;for(const [name,keyPath] of [['books','id'],['translations','key'],['phonetics','word'],['vocab','word'],['settings','key']])if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath});};
 req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();location.reload();};resolve(req.result);};req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Для обновления базы необходимо закрыть другие вкладки Reader.'));
});}
export async function get(store,key){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function all(store){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function write(entries){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction([...new Set(entries.map(e=>e.store))],'readwrite');for(const e of entries)e.remove?tx.objectStore(e.store).delete(e.key):tx.objectStore(e.store).put(e.value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Сохранение прервано'));});}
export const put=(store,value)=>write([{store,value}]);export const remove=(store,key)=>write([{store,key,remove:true}]);
export async function setting(key,fallback){return (await get('settings',key))?.value??fallback;}export async function setSetting(key,value){return put('settings',{key,value});}
export async function migrate(){if(await setting('migrated-v3',false))return;let old={};try{old=JSON.parse(localStorage.getItem('dict_v1')||'{}');}catch{}const current=new Set((await all('vocab')).map(w=>w.word));const entries=Object.entries(old).filter(([word,status])=>!current.has(word)&&['known','unsure','unknown'].includes(status)).map(([word,status])=>({store:'vocab',value:{word,status:status==='unsure'?'learning':status,updatedAt:Date.now()}}));entries.push({store:'settings',value:{key:'migrated-v3',value:true}});await write(entries);}
export function storageError(error){return error?.name==='QuotaExceededError'?'На устройстве закончилось место. Необходимо сохранить резервную копию и освободить место. Изменение не сохранено.':(error?.message||'Не получилось сохранить данные.');}
