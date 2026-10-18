# Источники Reader

Reader бесплатно работает как статическое приложение на GitHub Pages. Пользовательские книги и слова хранятся в IndexedDB на устройстве.

- JSZip 3.10.1 — MIT, https://github.com/Stuk/jszip. Лицензия: `vendor/JSZIP-LICENSE.md`.
- Mozilla PDF.js 5.6.205 — Apache-2.0, https://github.com/mozilla/pdf.js. Лицензия: `vendor/PDFJS-LICENSE.txt`. Используется только извлечение текста, без OCR.
- Compromise 14.14.4 — MIT, https://github.com/spencermountain/compromise. Лицензия: `vendor/COMPROMISE-LICENSE.txt`. Формы английских слов. Автоматическое определение без контекста может ошибаться.
- ipa-dict, en_US — MIT, https://github.com/open-dict-data/ipa-dict и https://github.com/open-dict-data/ipa-dict/blob/master/data/en_US.txt. Только американский набор. Лицензии исходных наборов: `vendor/IPA-LICENSE.txt`. Данные загружены 18 октября 2026 года. В словаре 125 927 записей, включая варианты и имена.
- Демонстрационный английский отрывок: Lewis Carroll, Alice’s Adventures in Wonderland (1865), public domain. Русский демонстрационный перевод и учебный раздел подготовлены для Reader; это короткий образец, не полная книга.

## Онлайн-сервисы

- Google Translate: публичный неофициальный `translate.googleapis.com/translate_a/single` без ключа. Это не официальный бесплатный безлимитный Cloud API. Доступность и формат ответа не гарантированы. Переводятся отдельные слова и небольшие фрагменты; ответ кэшируется в IndexedDB.
- MyMemory: https://mymemory.translated.net/doc/spec.php и https://mymemory.translated.net/doc/usagelimits.php. Резервный перевод: анонимно до 5 000 символов в день, запрос до 500 байт. Приложение дополнительно ограничивает резервное использование до 4 800 символов в сутки; сервис может применять общие лимиты по IP.
- Free Dictionary API: https://dictionaryapi.dev/ — дополнительные английские определения и примеры по запросу. Сервис может быть недоступен. API не нужен для локальной транскрипции.

## Что использовала 2books

Яндекс.Словарь: подтверждено кодом https://2books.su/reader/reader.min.js?v=21 и карточкой https://2books.su/dictionary/translate?word=smile. Старое приложение использовало собственный сервер. Reader не заимствует этот сервер и не использует чужие ключи. В подробной карточке доступны обычные ссылки на Яндекс, Reverso и Мультитран.
