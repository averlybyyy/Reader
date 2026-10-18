export const demo={id:'reader-demo-alice',title:'Alice’s Adventures in Wonderland',author:'Lewis Carroll',format:'ДЕМО',tags:['Для знакомства'],addedAt:Date.now(),lastOpened:null,lastChapter:0,lastScroll:0,chapterProgress:0,demo:true,chapters:[{title:'Down the Rabbit-Hole',paragraphs:[
 'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”',
 'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
 'There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!”',
 'But when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it.',
 'In another moment down went Alice after it, never once considering how in the world she was to get out again.',
 'The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.'
 ],translations:[
 'Алисе уже порядком надоело сидеть рядом с сестрой на берегу и ничего не делать. Разок-другой она заглянула в книгу, которую читала сестра, но там не было ни картинок, ни разговоров. «И зачем нужна книга, — подумала Алиса, — если в ней нет ни картинок, ни разговоров?»',
 'Она размышляла — насколько могла размышлять в такой жаркий день, когда хотелось только спать, — стоит ли удовольствие сплести венок из маргариток того, чтобы вставать и собирать цветы. Вдруг совсем рядом пробежал Белый Кролик с розовыми глазами.',
 'В этом не было ничего особенно удивительного. Алисе даже не показалось странным, что Кролик сказал сам себе: «Ах, боже мой! Боже мой! Я опоздаю!»',
 'Но когда Кролик достал из жилетного кармана часы, посмотрел на них и поспешил дальше, Алиса вскочила. Она вдруг поняла, что никогда ещё не видела кролика с жилетным карманом, а тем более с часами. Сгорая от любопытства, она побежала за ним через поле.',
 'Через мгновение Алиса нырнула следом, даже не задумавшись, как же она будет выбираться обратно.',
 'Кроличья нора сперва шла прямо, словно туннель, а потом резко обрывалась вниз — так внезапно, что Алиса не успела и подумать, как остановиться, прежде чем полетела в очень глубокий колодец.'
 ]},{title:'A little practice',paragraphs:['I have a dog at home. My dog likes books, and sometimes sleeps beside me while I read.','The dogs are playing in the garden. My dog’s favourite toy is a little green ball. “Come here, doggy!” I say.','A tap on a word opens its translation. Green marks known words. Yellow marks words in practice. Red marks new words. Word colors apply to every book.'],translations:['У меня дома есть собака. Моя собака любит книги и иногда спит рядом, пока я читаю.','Собаки играют в саду. Любимая игрушка моей собаки — маленький зелёный мяч. «Иди сюда, собачка!» — говорю я.','Нажатие на слово открывает перевод. Зелёный — знакомые слова. Жёлтый — слова для изучения. Красный — новые слова. Цвета слов действуют во всех книгах.']}]};

export function refreshDemo(book){
 if(book.id!==demo.id||!book.demo)return book;
 const old="Try tapping a word. Green means you know it. Yellow means you are learning it. Red means it is a new word. Your words will follow you from book to book.";
 if(book.chapters[1]?.paragraphs[2]!==old)return book;
 const updated=structuredClone(book);updated.chapters[1].paragraphs[2]=demo.chapters[1].paragraphs[2];if(updated.chapters[1].translations)updated.chapters[1].translations[2]=demo.chapters[1].translations[2];return updated;
}
