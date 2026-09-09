import {compileExperience} from './compiler';
import {validateExperience} from './experience';
import {validateSimulationConfig} from './simulation';
import type {CompiledPlan,ExperienceDefinition,SimulationConfig} from './types';
import {getDevice} from '../data/devices';

export interface ScenarioCapsule{
 version:1;
 title:string;
 createdAt:string;
 deviceId:string;
 deviceRevision:number;
 experience:ExperienceDefinition;
 config:SimulationConfig;
 planFingerprint:string;
 fingerprint:string;
}

export interface ImportedScenarioCapsule{capsule:ScenarioCapsule;plan:CompiledPlan}

const hash=(value:string)=>{let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function encodeBytes(bytes:Uint8Array){let out='';for(let i=0;i<bytes.length;i+=3){const a=bytes[i];const b=i+1<bytes.length?bytes[i+1]:0;const c=i+2<bytes.length?bytes[i+2]:0;const n=(a<<16)|(b<<8)|c;out+=alphabet[(n>>>18)&63]+alphabet[(n>>>12)&63];if(i+1<bytes.length)out+=alphabet[(n>>>6)&63];if(i+2<bytes.length)out+=alphabet[n&63]}return out}
function decodeBytes(value:string){if(!value||value.length>16000||!/^[A-Za-z0-9_-]+$/.test(value))throw new Error('Scenario link is malformed.');const bytes:number[]=[];let buffer=0,bits=0;for(const char of value){const index=alphabet.indexOf(char);if(index<0)throw new Error('Scenario link is malformed.');buffer=(buffer<<6)|index;bits+=6;if(bits>=8){bits-=8;bytes.push((buffer>>>bits)&255);buffer&=(1<<bits)-1}}return new Uint8Array(bytes)}
function withoutFingerprint(value:Omit<ScenarioCapsule,'fingerprint'>){return JSON.stringify(value)}

export function createScenarioCapsule(title:string,plan:CompiledPlan,config:SimulationConfig):ScenarioCapsule{
 const safeTitle=title.trim().slice(0,80)||`${plan.experience.name} · scenario`;
 const validatedConfig=validateSimulationConfig(config);
 const base:Omit<ScenarioCapsule,'fingerprint'>={version:1,title:safeTitle,createdAt:validatedConfig.startTime,deviceId:plan.deviceId,deviceRevision:plan.deviceRevision,experience:validateExperience(plan.experience),config:validatedConfig,planFingerprint:plan.fingerprint};
 return {...base,fingerprint:hash(withoutFingerprint(base))};
}

export function validateScenarioCapsule(value:unknown):ImportedScenarioCapsule{
 if(!value||typeof value!=='object')throw new Error('Scenario capsule must be an object.');
 const raw=value as Partial<ScenarioCapsule>;
 if(raw.version!==1)throw new Error('Unsupported scenario capsule version.');
 if(typeof raw.title!=='string'||!raw.title.trim()||raw.title.length>80)throw new Error('Scenario title is invalid.');
 if(typeof raw.createdAt!=='string'||!Number.isFinite(Date.parse(raw.createdAt)))throw new Error('Scenario timestamp is invalid.');
 if(typeof raw.deviceId!=='string'||!Number.isInteger(raw.deviceRevision)||typeof raw.planFingerprint!=='string'||typeof raw.fingerprint!=='string')throw new Error('Scenario identity is incomplete.');
 const experience=validateExperience(raw.experience);
 const config=validateSimulationConfig(raw.config);
 const device=getDevice(raw.deviceId);
 if(device.revision!==raw.deviceRevision)throw new Error(`Device profile revision changed from ${raw.deviceRevision} to ${device.revision}. Re-open the evidence before replaying this capsule.`);
 const plan=compileExperience(experience,device);
 if(plan.fingerprint!==raw.planFingerprint)throw new Error('Scenario plan fingerprint no longer matches the current compiler output.');
 const base:Omit<ScenarioCapsule,'fingerprint'>={version:1,title:raw.title,createdAt:raw.createdAt,deviceId:raw.deviceId,deviceRevision:raw.deviceRevision,experience,config,planFingerprint:raw.planFingerprint};
 if(hash(withoutFingerprint(base))!==raw.fingerprint)throw new Error('Scenario capsule fingerprint failed. The snapshot may have been edited.');
 return {capsule:{...base,fingerprint:raw.fingerprint},plan};
}

export function exportScenarioCapsule(capsule:ScenarioCapsule){return JSON.stringify(capsule,null,2)}
export function importScenarioCapsule(text:string){let parsed:unknown;try{parsed=JSON.parse(text)}catch{throw new Error('Scenario capsule is not valid JSON.')}return validateScenarioCapsule(parsed)}
export function encodeScenarioCapsule(capsule:ScenarioCapsule){return encodeBytes(new TextEncoder().encode(JSON.stringify(capsule)))}
export function decodeScenarioCapsule(token:string){let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(decodeBytes(token))}catch{throw new Error('Scenario link could not be decoded.')}return importScenarioCapsule(text)}
