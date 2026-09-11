import type { ExperienceDefinition, ParseResult } from './types';
const define=(id:string,name:string,prompt:string,input:ExperienceDefinition['input'],task:ExperienceDefinition['task'],preferredOutputs:ExperienceDefinition['preferredOutputs'],language='English'):ExperienceDefinition=>({version:2,id,name,prompt,input,task,preferredOutputs,language,allowCompanionFallback:true,privacy:'local-only'});
export const experiencePresets:ExperienceDefinition[]=[
 define('translate-sign','Translate the world','When I see a sign, translate it into Spanish. Show it on the display; if there is no display, speak it aloud.','camera','translate',['display','audio'],'Spanish'),
 define('live-captions','Live conversation captions','Caption speech from the microphone and show it on the display.','microphone','caption',['display'],'English'),
 define('scene-guide','Describe a scene','Describe the camera scene and speak the result aloud.','camera','describe',['audio'],'English'),
 define('quiet-reminder','Quiet reminder','Show a reminder on the display; if there is no display, use audio.','manual','notify',['display','audio'],'English'),
 define('document-reader','Read a document','Read and summarize the document in view, then speak the result.','camera','describe',['audio','display'],'English'),
 define('object-finder','Identify an object','Identify the object inside the focus brackets and show its label.','camera','identify',['display','audio'],'English'),
 define('hands-free-assistant','Hands-free assistant','Listen for a question about the visible route and answer through audio.','microphone','assist',['audio','display'],'English'),
 define('adapter-debugger','Live adapter debugger','Inspect the adapter event stream and show the first failed transport stage.','manual','debug',['display','audio'],'English')
];
export function parseExperience(text:string):ParseResult{
 const result:ParseResult={parser:'rules-based-v2',experience:null,warnings:[],errors:[]};
 if(!text.trim()||text.length>2000){result.errors.push('Enter a description between 1 and 2,000 characters.');return result}
 const prompt=text.trim();
 const tasks=(['translate','describe','caption','notify','identify','assist','debug'] as const).filter(task=>({translate:/\btranslat\w*\b/i,describe:/\b(describ\w*|summari[sz]\w*|read\s+(?:this|the)\s+document)\b/i,caption:/\b(caption\w*|transcrib\w*)\b/i,notify:/\b(remind\w*|notif\w*|alert)\b/i,identify:/\b(identify|recogniz\w*|what\s+object)\b/i,assist:/\b(answer|assistant|question)\b/i,debug:/\b(debug\w*|inspect\s+(?:the\s+)?(?:adapter|transport)|trace\s+(?:the\s+)?(?:adapter|transport))\b/i}[task].test(prompt)));
 if(tasks.length!==1){result.errors.push(tasks.length?'Use one task per experience.':'No supported task found. Try translate, describe, caption, remind, identify, answer, or debug.');return result}
 const task=tasks[0];
 const input=/\b(microphone|speech|conversation|listen|voice)\b/i.test(prompt)?'microphone':/\b(camera|scene|sign|photo|look|see|visible|object|document)\b/i.test(prompt)?'camera':task==='notify'||task==='debug'?'manual':task==='caption'||task==='assist'?'microphone':'camera';
 const hasDisplay=/\b(display|show|overlay|screen)\b/i.test(prompt); const hasAudio=/\b(speak|aloud|audio|read out)\b/i.test(prompt);
 const fallbackAudio=/\b(if|when).{0,32}(no|without|unavailable).{0,20}display.{0,36}(speak|audio|read)/i.test(prompt);
 const preferredOutputs:ExperienceDefinition['preferredOutputs']=fallbackAudio?['display','audio']:hasAudio&&!hasDisplay?['audio']:['display'];
 const languages=prompt.match(/\b(English|Spanish|French|German|Italian|Japanese|Hindi|Portuguese|Chinese|Korean|Arabic)\b/gi); const language=languages?.at(-1)??'English';
 result.warnings.push('Rules-based draft. Review the structured plan before running it.');
 if(!languages&&task==='translate')result.warnings.push('No supported target language found; defaulted to English.');
 const names:Record<ExperienceDefinition['task'],string>={translate:'Translate the world',describe:'Describe a scene',caption:'Live captions',notify:'Quiet reminder',identify:'Identify an object',assist:'Hands-free assistant',debug:'Live adapter debugger'};
 result.experience=define(`draft-${task}`,names[task],prompt,input,task,preferredOutputs,language[0].toUpperCase()+language.slice(1).toLowerCase()); return result;
}
export function validateExperience(value:unknown):ExperienceDefinition{
 if(!value||typeof value!=='object')throw new Error('Experience must be an object.'); const e=value as Record<string,unknown>;
 if(e.version!==2||typeof e.id!=='string'||typeof e.name!=='string'||!e.name.trim()||typeof e.prompt!=='string'||e.prompt.length>2000||!['camera','microphone','manual'].includes(String(e.input))||!['translate','describe','caption','notify','identify','assist','debug'].includes(String(e.task))||!Array.isArray(e.preferredOutputs)||!e.preferredOutputs.length||e.preferredOutputs.some(v=>!['display','audio'].includes(String(v)))||typeof e.language!=='string'||!e.language.trim()||typeof e.allowCompanionFallback!=='boolean'||!['local-only','provider-allowed'].includes(String(e.privacy)))throw new Error('Invalid experience schema.');
 return e as unknown as ExperienceDefinition;
}
