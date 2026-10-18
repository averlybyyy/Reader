import {baseWord} from './core.js';

export function wordSpans(text,language='en'){
 const re=language==='ru'?/[А-Яа-яЁё]+(?:[-’'][А-Яа-яЁё]+)*/g:/[A-Za-z]+(?:['’][A-Za-z]+)*(?:['’])?/g;
 return [...text.matchAll(re)].map((m,index)=>({text:m[0],start:m.index,end:m.index+m[0].length,index}));
}
function sentences(text,language){
 if(Intl.Segmenter)return [...new Intl.Segmenter(language,{granularity:'sentence'}).segment(text)].map(s=>({start:s.index,end:s.index+s.segment.length}));
 return [...text.matchAll(/[^.!?]+[.!?]*\s*/g)].map(m=>({start:m.index,end:m.index+m[0].length}));
}
export const russianStem=s=>s.toLowerCase().replace(/ё/g,'е').replace(/(?:иями|ями|ами|ого|его|ому|ему|ыми|ими|ах|ях|ой|ей|ый|ий|ая|яя|ое|ее|ую|юю|ам|ям|ом|ем|ов|ев|ы|и|а|я|у|ю|е|о)$/,'');

// Restrict matching to the corresponding sentence, then prefer a lexical match.
// When no match exists, always return a word near the proportional position.
export function alignWord(source,target,sourceIndex,terms=[],sourceLanguage='en',targetLanguage='ru'){
 const from=wordSpans(source,sourceLanguage),to=wordSpans(target,targetLanguage);
 if(!from.length||!to.length)return null;
 const selected=from[Math.min(Math.max(0,sourceIndex),from.length-1)];
 const ss=sentences(source,sourceLanguage),ts=sentences(target,targetLanguage);
 const si=Math.max(0,ss.findIndex(s=>selected.start>=s.start&&selected.start<s.end));
 const ti=ss.length===ts.length?si:Math.round(si/Math.max(1,ss.length-1)*Math.max(0,ts.length-1));
 const sr=ss[si]||{start:0,end:source.length},tr=ts[ti]||{start:0,end:target.length};
 const sourceWords=from.filter(w=>w.start>=sr.start&&w.start<sr.end);
 const targetWords=to.filter(w=>w.start>=tr.start&&w.start<tr.end);
 const candidates=targetWords.length?targetWords:to;
 const ratio=sourceWords.length>1?sourceWords.findIndex(w=>w.index===selected.index)/(sourceWords.length-1):.5;
 const expected=ratio*Math.max(0,candidates.length-1);
 const norm=s=>targetLanguage==='ru'?s.toLowerCase().replace(/ё/g,'е'):baseWord(s);
 const words=terms.flatMap(t=>wordSpans(String(t),targetLanguage)).map(w=>norm(w.text));
 let best=null;
 candidates.forEach((candidate,position)=>{
  const value=norm(candidate.text);let strength=0;
  for(const term of words){if(term===value)strength=3;else if(targetLanguage==='ru'&&russianStem(term).length>=4&&russianStem(term)===russianStem(value))strength=Math.max(strength,2);}
  if(!strength)return;const score=strength-Math.abs(position-expected)/Math.max(1,candidates.length);
  if(!best||score>best.score)best={...candidate,score,approximate:false};
 });
 return best||{...candidates[Math.max(0,Math.min(candidates.length-1,Math.round(expected)))],approximate:true};
}
