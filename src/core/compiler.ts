import {getAdapter} from '../adapters/registry';
import type {Capability,CompiledPlan,DeviceProfile,ExperienceDefinition,OutputMode,PlanStep} from './types';
import {validateExperience} from './experience';
const hash=(value:string)=>{let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
export function compileExperience(definition:ExperienceDefinition,device:DeviceProfile):CompiledPlan{
 const experience=validateExperience(definition); const adapter=getAdapter(device.id); const warnings:string[]=[];
 const route=(capability:Capability,stage:'input'|'output',fallback=false):PlanStep=>{
  const adapterCan=Boolean(adapter?.capabilities.includes(capability));
  const chosen=adapterCan?(adapter!.mode==='simulation'?'twin':'adapter'):experience.allowCompanionFallback?'companion':'blocked';
  const reason=adapterCan?`${adapter!.name} exposes ${capability} in ${adapter!.mode} mode.`:`${device.name} has no executable ${capability} capability.${chosen==='companion'?' Route through the explicit companion fallback.':' This experience is blocked.'}`;
  return{id:`${stage}-${capability}`,stage,capability,label:stage==='input'?`Acquire ${capability}`:`Present via ${capability}`,route:chosen,reason,fallback};
 };
 const input=experience.input==='manual'?{id:'input-manual',stage:'input' as const,capability:null,label:'Receive manual trigger',route:(adapter?'twin':'companion') as 'twin'|'companion',reason:adapter?'A local manual trigger enters the registered OpenLens adapter.':'A manual trigger needs no sensor, but this research profile still has no executable OpenLens adapter.'}:route(experience.input,'input');
 let output:PlanStep|undefined; for(const [index,mode] of experience.preferredOutputs.entries()){const candidate=route(mode as OutputMode,'output',index>0);if(candidate.route!=='blocked'&&!(candidate.route==='companion'&&index+1<experience.preferredOutputs.length)){output=candidate;break}output=candidate}
 const process:PlanStep={id:'process',stage:'process',capability:null,label:`${experience.task} · ${experience.language}`,route:'companion',reason:experience.privacy==='local-only'?'Deterministic local fixture. Optional OCR runs on-device in the browser.':'Provider route allowed but no provider is configured.'};
 const steps=[input,process,output!]; const blocked=steps.some(s=>s.route==='blocked'); const twin=steps.some(s=>s.route==='twin'); const adapted=steps.some(s=>s.route==='companion');
 if(device.kind==='research')warnings.push('Research profile only. No physical connection or verified OpenLens hardware adapter exists; execution is blocked even when a conceptual companion fallback can be described.');
 if(adapter)warnings.push(adapter.disclosure);
 const compatibility:CompiledPlan['compatibility']=!adapter||blocked?'blocked':adapter.mode==='simulation'?'simulation-only':adapted?'adapted':twin?'simulation-only':'native';
 const base={version:2 as const,deviceId:device.id,deviceRevision:device.revision,deviceName:device.name,adapterId:adapter?.id??null,experience,compatibility,steps,warnings,mode:'simulation' as const}; return{...base,fingerprint:hash(JSON.stringify(base))};
}
