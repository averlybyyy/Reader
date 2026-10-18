import {escapeHTML as esc} from './core.js';
import {icon} from './icons.js';
import {modal,toast} from './ui.js';
import {write,storageError} from './db.js';

export const TAG_COLORS=['#a1b99b','#cb8981','#c5b07a','#95afc0','#b5a0c4','#c09e83','#87b6ad','#b2b5ab'];
const cleanName=name=>String(name||'').trim().replace(/\s+/g,' ').slice(0,40);
const validColor=color=>/^#[0-9a-f]{6}$/i.test(color||'')?color:TAG_COLORS[0];
export function mergeTags(saved=[],books=[]){
 const result=[],seen=new Set();
 for(const item of [...(Array.isArray(saved)?saved:[]),...books.flatMap(b=>(b.tags||[]).map(name=>({name})))]){
  if(!item||typeof item.name!=='string')continue;
  const name=cleanName(item.name),key=name.toLocaleLowerCase('ru');if(!name||seen.has(key))continue;
  seen.add(key);result.push({name,color:validColor(item.color||TAG_COLORS[result.length%TAG_COLORS.length])});
 }
 return result;
}
export function tagStyle(name,catalog){const color=validColor(catalog.find(t=>t.name.toLowerCase()===name.toLowerCase())?.color);const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)).join(',');return `--tag-color:${color};--tag-bg:rgba(${rgb},.12);--tag-border:rgba(${rgb},.28)`;}

export function editBookTags(book,catalog,onSaved){
 let draft=catalog.map(t=>({...t})),selected=new Set((book.tags||[]).map(n=>n.toLocaleLowerCase('ru'))),color=TAG_COLORS[0],editing=null;
 const m=modal('Теги книги',`<p>${esc(book.title)}</p><p>Можно выбрать несколько тегов. Список и цвета общие для всех книг.</p><div class="tag-options" id="tag-options"></div><div class="tag-editor"><label for="new-tag-name">Новый тег</label><div class="tag-create-row"><input type="text" id="new-tag-name" maxlength="40" aria-label="Название тега"><button class="secondary" id="create-tag">${icon('plus')} Добавить</button></div><div class="tag-palette" id="tag-palette" aria-label="Цвет тега"></div></div><div class="modal-actions"><button class="secondary" id="cancel-tags">Отмена</button><button class="primary" id="save-tags">Сохранить</button></div>`);
 m.body.closest('.modal').classList.add('tags-modal');
 const options=m.body.querySelector('#tag-options'),palette=m.body.querySelector('#tag-palette'),input=m.body.querySelector('#new-tag-name');
 function draw(){options.innerHTML=draft.length?draft.map((tag,i)=>`<div class="tag-option"><label><input type="checkbox" data-tag-index="${i}" ${selected.has(tag.name.toLocaleLowerCase('ru'))?'checked':''}><span class="tag" style="${tagStyle(tag.name,draft)}">${esc(tag.name)}</span></label><button class="tag-color-button" data-color-index="${i}" style="--tag-color:${tag.color}" aria-label="Цвет тега ${esc(tag.name)}" title="Изменить цвет"><span></span>${icon('chevron')}</button></div>`).join(''):'<p class="tag-empty">Список тегов пуст.</p>';
  options.querySelectorAll('[data-tag-index]').forEach(el=>el.onchange=()=>{const key=draft[Number(el.dataset.tagIndex)].name.toLocaleLowerCase('ru');el.checked?selected.add(key):selected.delete(key);});
  options.querySelectorAll('[data-color-index]').forEach(el=>el.onclick=()=>{editing=Number(el.dataset.colorIndex);color=draft[editing].color;drawPalette();});
 }
 function drawPalette(){palette.innerHTML=`<span class="palette-label">${editing===null?'Цвет нового тега':esc(draft[editing].name)}</span>${TAG_COLORS.map((c,i)=>`<button class="color-swatch ${color===c?'selected':''}" data-swatch="${c}" style="--swatch:${c}" aria-label="${['Зелёный','Красный','Жёлтый','Синий','Сиреневый','Коричневый','Бирюзовый','Серый'][i]}" aria-pressed="${color===c}">${color===c?icon('check'):''}</button>`).join('')}<label class="custom-color">Свой цвет<input type="color" id="custom-tag-color" value="${color}" aria-label="Свой цвет тега"></label>${editing!==null?'<button class="text-btn" id="finish-tag-color">Готово</button>':''}`;
  const setColor=c=>{color=validColor(c);if(editing!==null){draft[editing].color=color;draw();}drawPalette();};
  palette.querySelectorAll('[data-swatch]').forEach(b=>b.onclick=()=>setColor(b.dataset.swatch));palette.querySelector('input').onchange=e=>setColor(e.target.value);palette.querySelector('#finish-tag-color')?.addEventListener('click',()=>{editing=null;drawPalette();});
 }
 function add(){const name=cleanName(input.value);if(!name){input.focus();return;}const key=name.toLocaleLowerCase('ru');const found=draft.find(t=>t.name.toLocaleLowerCase('ru')===key);if(!found)draft.push({name,color});selected.add(key);input.value='';editing=null;draw();drawPalette();input.focus();}
 input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add();}};input.onfocus=()=>{if(editing!==null){editing=null;drawPalette();}};
 m.body.querySelector('#create-tag').onclick=add;m.body.querySelector('#cancel-tags').onclick=m.close;
 m.body.querySelector('#save-tags').onclick=async()=>{if(input.value.trim())add();const tags=draft.filter(t=>selected.has(t.name.toLocaleLowerCase('ru'))).map(t=>t.name);try{await write([{store:'books',value:{...book,tags}},{store:'settings',value:{key:'tagCatalog',value:draft}}]);book.tags=tags;m.close();onSaved(draft);}catch(e){toast(storageError(e));}};
 draw();drawPalette();
}
