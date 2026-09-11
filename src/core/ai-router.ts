export type AITask='ocr'|'translation'|'scene-understanding'|'object-identification'|'captioning'|'speech-output';
export interface AIRuntimeCapabilities{localOcr:boolean;localVoice:boolean;browserSpeechRecognition:boolean;webGpu:boolean;localVisionModel:boolean;advancedProvider:boolean}
export interface AIRouteRequest{task:AITask;privacy:'local-only'|'provider-allowed';priority:'latency'|'quality';cost:'zero-only'|'paid-allowed'}
export interface AIRouteDecision{status:'ready'|'limited'|'unavailable';route:string;provider:string;reason:string;stages:string[];disclosure:string}

export function planAIRoute(request:AIRouteRequest,runtime:AIRuntimeCapabilities):AIRouteDecision{
 const local=(status:AIRouteDecision['status'],route:string,provider:string,reason:string,stages:string[],disclosure:string):AIRouteDecision=>({status,route,provider,reason,stages,disclosure});
 if(request.task==='ocr')return runtime.localOcr
  ?local('ready','local-browser','Tesseract.js / local WASM','The browser can run the installed English OCR bundle without sending the image to an API.',['IMAGE MEMORY','PIXEL PREFLIGHT','LOCAL OCR','TEXT OUTPUT'],'Recognition quality depends on the image and English model; confidence is reported with the result.')
  :local('unavailable','none','none','This browser does not expose the Worker and WebAssembly capabilities required by the local OCR bundle.',[],'Choose a current browser with Web Workers and WebAssembly.');
 if(request.task==='translation')return runtime.localOcr
  ?local('limited','local-browser','OpenLens sign phrasebook','The zero-cost route can transform recognized sign terms across five languages.',['OCR TEXT','BOUNDED MATCH','UNKNOWN PRESERVATION','TEXT / VOICE'],'This route is a finite phrasebook. It preserves unknown text and does not claim general sentence translation.')
  :local('unavailable','none','none','Translation needs recognized text, and local OCR is unavailable in this browser.',[],'No remote translation provider is configured.');
 if(request.task==='speech-output')return runtime.localVoice
  ?local('ready','local-browser','Browser local voice','A matching voice installed on this device can speak the selected output.',['TEXT OUTPUT','LOCAL VOICE MATCH','SPEECH SYNTHESIS'],'Voice quality and language inventory come from the browser and operating system.')
  :local('unavailable','none','none','No matching local speech voice is currently available.',[],'OpenLens does not send text to a remote speech provider.');
 if(request.task==='captioning'&&request.privacy==='provider-allowed'&&runtime.browserSpeechRecognition)return local('limited','browser-mediated','Browser speech recognition','The browser exposes speech recognition, but its processing location cannot be verified by OpenLens.',['MICROPHONE PERMISSION','BROWSER RECOGNITION','CAPTION OUTPUT'],'This is a capability route only. OpenLens does not label browser speech recognition as local and does not start it from this tool.');
 if(['scene-understanding','object-identification'].includes(request.task)&&runtime.localVisionModel&&runtime.webGpu)return local('ready','local-browser','Configured local vision model',`A local model can run through WebGPU with the requested ${request.priority} priority.`,['IMAGE MEMORY','LOCAL MODEL','BOUNDED RESULT','OUTPUT'],'OpenLens would report the exact model and version here; no model is bundled in the public baseline.');
 if(request.privacy==='provider-allowed'&&request.cost==='paid-allowed'&&runtime.advancedProvider)return local('ready','optional-provider','Configured advanced provider','The task can use the explicitly configured provider route.',['CONSENT','MINIMIZE INPUT','PROVIDER','OUTPUT'],'Provider name, model, cost, retention, and network timing must be attached to every trace.');
 const semantic=['scene-understanding','object-identification'].includes(request.task);
 return local('unavailable','none','none',semantic?'No local vision model or optional advanced provider is configured.':'Verified local captioning is not available in this browser.',[],semantic?'Use the deterministic Scenario Studio for authored semantic cases, or add a real model adapter before claiming live understanding.':'Browser speech recognition may use a remote service, so local-only privacy blocks this route.');
}
