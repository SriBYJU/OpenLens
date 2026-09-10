export const phrasebookLanguages=['English','Spanish','French','German','Italian'] as const;
export type PhrasebookLanguage=typeof phrasebookLanguages[number];

type Entry={concept:string;terms:Record<PhrasebookLanguage,string>};
const entry=(concept:string,english:string,spanish:string,french:string,german:string,italian:string):Entry=>({concept,terms:{English:english,Spanish:spanish,French:french,German:german,Italian:italian}});

export const signPhrasebook:Entry[]=[
 entry('exit','EXIT','SALIDA','SORTIE','AUSGANG','USCITA'),
 entry('entrance','ENTRANCE','ENTRADA','ENTRÉE','EINGANG','ENTRATA'),
 entry('stop','STOP','ALTO','ARRÊT','HALT','STOP'),
 entry('danger','DANGER','PELIGRO','DANGER','GEFAHR','PERICOLO'),
 entry('caution','CAUTION','PRECAUCIÓN','ATTENTION','VORSICHT','ATTENZIONE'),
 entry('open','OPEN','ABIERTO','OUVERT','GEÖFFNET','APERTO'),
 entry('closed','CLOSED','CERRADO','FERMÉ','GESCHLOSSEN','CHIUSO'),
 entry('no-entry','NO ENTRY','PROHIBIDO EL PASO','SENS INTERDIT','KEIN ZUTRITT','DIVIETO DI ACCESSO'),
 entry('way-out','WAY OUT','SALIDA','SORTIE','AUSGANG','USCITA'),
 entry('restroom','RESTROOM','BAÑO','TOILETTES','TOILETTE','BAGNO'),
 entry('hospital','HOSPITAL','HOSPITAL','HÔPITAL','KRANKENHAUS','OSPEDALE'),
 entry('emergency','EMERGENCY','EMERGENCIA','URGENCE','NOTFALL','EMERGENZA'),
 entry('information','INFORMATION','INFORMACIÓN','INFORMATION','INFORMATION','INFORMAZIONI'),
 entry('help','HELP','AYUDA','AIDE','HILFE','AIUTO'),
 entry('left','LEFT','IZQUIERDA','GAUCHE','LINKS','SINISTRA'),
 entry('right','RIGHT','DERECHA','DROITE','RECHTS','DESTRA'),
 entry('straight-ahead','STRAIGHT AHEAD','TODO RECTO','TOUT DROIT','GERADEAUS','SEMPRE DRITTO'),
 entry('platform','PLATFORM','ANDÉN','QUAI','BAHNSTEIG','BINARIO'),
 entry('gate','GATE','PUERTA','PORTE','FLUGSTEIG','USCITA'),
 entry('departures','DEPARTURES','SALIDAS','DÉPARTS','ABFLÜGE','PARTENZE'),
 entry('arrivals','ARRIVALS','LLEGADAS','ARRIVÉES','ANKÜNFTE','ARRIVI'),
 entry('train','TRAIN','TREN','TRAIN','ZUG','TRENO'),
 entry('airport','AIRPORT','AEROPUERTO','AÉROPORT','FLUGHAFEN','AEROPORTO'),
 entry('ticket','TICKET','BILLETE','BILLET','FAHRKARTE','BIGLIETTO'),
 entry('do-not-touch','DO NOT TOUCH','NO TOCAR','NE PAS TOUCHER','NICHT BERÜHREN','NON TOCCARE'),
];

export interface PhrasebookTranslation {
 provider:'openlens-sign-phrasebook-v1';
 input:string;
 output:string;
 targetLanguage:PhrasebookLanguage;
 sourceLanguage:PhrasebookLanguage;
 matchedConcepts:string[];
 unknownSegments:string[];
 coverage:number;
 disclosure:string;
}

const normalize=(value:string)=>value.normalize('NFC').toUpperCase();

export function translateSignText(input:string,targetLanguage:PhrasebookLanguage,sourceLanguage:PhrasebookLanguage='English'):PhrasebookTranslation{
 if(typeof input!=='string'||input.length>20000)throw new Error('Phrasebook input must contain at most 20,000 characters.');
 if(!phrasebookLanguages.includes(sourceLanguage)||!phrasebookLanguages.includes(targetLanguage))throw new Error('Unsupported phrasebook language.');
 const tokens=[...input.matchAll(/[\p{L}\p{M}\p{N}]+(?:['’’-][\p{L}\p{M}\p{N}]+)*/gu)];
 const candidates=signPhrasebook.map(item=>({item,words:normalize(item.terms[sourceLanguage]).split(' ')})).sort((a,b)=>b.words.length-a.words.length);
 const unknownSegments:string[]=[];const matchedConcepts:string[]=[];let matchedWords=0;let output='';let cursor=0;
 for(let index=0;index<tokens.length;){
  const matches=candidates.filter(candidate=>candidate.words.every((word,offset)=>{
   const token=tokens[index+offset];if(!token||normalize(token[0])!==word)return false;
   const previous=tokens[index+offset-1];return offset===0||/^[ \t]+$/.test(input.slice(previous.index!+previous[0].length,token.index));
  }));
  const longest=matches[0]?.words.length??0;
  const alternatives=matches.filter(candidate=>candidate.words.length===longest);
  // Do not silently resolve a source phrase that maps to different target meanings.
  const found=new Set(alternatives.map(candidate=>candidate.item.terms[targetLanguage])).size===1?alternatives[0]:undefined;
  const token=tokens[index];output+=input.slice(cursor,token.index);
  if(found){const last=tokens[index+found.words.length-1];output+=found.item.terms[targetLanguage];matchedWords+=found.words.length;matchedConcepts.push(found.item.concept);cursor=last.index!+last[0].length;index+=found.words.length}
  else{output+=token[0];unknownSegments.push(token[0]);cursor=token.index!+token[0].length;index++}
 }
 output+=input.slice(cursor);
 const coverage=tokens.length?Math.round(matchedWords/tokens.length*100):0;
 return{provider:'openlens-sign-phrasebook-v1',input,output,targetLanguage,sourceLanguage,matchedConcepts:[...new Set(matchedConcepts)],unknownSegments:[...new Set(unknownSegments)],coverage,disclosure:coverage===100?'Every word matched the curated sign phrasebook. Coverage measures lookup matches, not translation accuracy. This tool does not understand sentences.':'Unmatched or ambiguous words were preserved exactly. Coverage measures lookup matches, not translation accuracy. This tool does not understand sentences.'};
}
