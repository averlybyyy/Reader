import {get,put,storageError} from './db.js';
import {escapeHTML as esc} from './core.js';
import {modal,toast} from './ui.js';

export function editBookNote(book,onSaved){
 const m=modal('Описание и отзыв',`<p class="note-book-title">${esc(book.title)}</p><label class="note-label" for="book-note">Личная заметка к книге</label><textarea id="book-note" rows="12" aria-label="Описание или отзыв о книге" placeholder="Описание, впечатления, цитаты…">${esc(book.note||'')}</textarea><p class="note-hint">Заметка сохраняется вместе с книгой и входит в резервную копию.</p><div class="modal-actions"><button class="secondary" id="cancel-note">Отмена</button><button class="primary" id="save-note">Сохранить</button></div>`);
 m.body.closest('.modal').classList.add('note-modal');
 m.body.querySelector('#cancel-note').onclick=m.close;
 m.body.querySelector('#save-note').onclick=async()=>{const button=m.body.querySelector('#save-note');button.disabled=true;try{const current=await get('books',book.id);if(!current)throw Error('Книга уже удалена из библиотеки.');const updated={...current,note:m.body.querySelector('#book-note').value,noteUpdatedAt:Date.now()};await put('books',updated);Object.assign(book,updated);m.close();onSaved?.();toast('Заметка сохранена.');}catch(e){button.disabled=false;toast(storageError(e));}};
}
