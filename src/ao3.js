import {modal} from './ui.js';
import {icon} from './icons.js';

export function ao3Help(){
 const m=modal('Фанфики с AO3',`<p>Поиск, закладки и вход в аккаунт доступны на самом AO3. Сайт открывается отдельно от читалки.</p><a class="secondary ao3-open" href="https://archiveofourown.org/" target="_blank" rel="noopener noreferrer">Открыть AO3 ↗</a><ol class="import-steps"><li>Открыть нужный фанфик на AO3.</li><li>Нажать <b>Download → EPUB</b> и сохранить файл на устройство.</li><li>Вернуться в Reader и выбрать скачанный EPUB.</li></ol><p>EPUB содержит все опубликованные главы на момент скачивания. После добавления доступны перевод, общий словарь, теги и личный отзыв.</p><button class="primary" id="ao3-select-file">${icon('plus')} Выбрать скачанный EPUB</button>`);
 m.body.querySelector('#ao3-select-file').onclick=()=>{m.close();document.getElementById('book-files').click();};
}
