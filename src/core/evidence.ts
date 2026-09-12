import {getDevice} from '../data/devices';
import type {Confidence} from './types';

export const EVIDENCE_SCHEMA_VERSION=1;
export const evidenceSourceClasses=['manufacturer','developer-documentation','regulatory','openlens-measurement','independent-research','archive'] as const;
export type EvidenceSourceClass=typeof evidenceSourceClasses[number];

export interface EvidenceDraftInput{
 deviceId:string;
 sourceClass:EvidenceSourceClass;
 sourceTitle:string;
 sourceUrl:string;
 publisher:string;
 publishedDate:string|null;
 accessedDate:string;
 claim:string;
 confidence:Confidence;
 notes:string;
 correctionReason?:string;
}
export interface EvidenceDraftRecord{
 kind:'openlens-research-evidence';
 schemaVersion:1;
 id:string;
 revision:number;
 createdAt:string;
 status:'draft-review';
 device:{id:string;revision:number;name:string};
 source:{class:EvidenceSourceClass;title:string;url:string;publisher:string;publishedDate:string|null;accessedDate:string};
 claim:string;
 confidence:Confidence;
 notes:string;
 correction:null|{supersedesId:string;reason:string};
 checks:['known-device','complete-provenance','https-source','human-review-required'];
 fingerprint:string;
}
export interface EvidencePack{
 kind:'openlens-research-evidence-pack';
 schemaVersion:1;
 createdAt:string;
 status:'draft-review';
 records:EvidenceDraftRecord[];
 fingerprint:string;
}

const hash=(value:string)=>{let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
const clean=(value:unknown,label:string,min:number,max:number)=>{if(typeof value!=='string')throw new Error(`${label} is required.`);const result=value.trim();if(result.length<min||result.length>max)throw new Error(`${label} must be ${min}–${max} characters.`);return result};
const date=(value:unknown,label:string,optional=false)=>{if(optional&&(value===null||value===''))return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error(`${label} must be a valid YYYY-MM-DD date.`);const parsed=new Date(`${value}T00:00:00Z`);if(Number.isNaN(parsed.valueOf())||parsed.toISOString().slice(0,10)!==value)throw new Error(`${label} must be a valid YYYY-MM-DD date.`);return value};
const timestamp=(value:unknown,label:string)=>{if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))throw new Error(`${label} is invalid.`);return value};
const url=(value:unknown)=>{const text=clean(value,'Source URL',8,2048);let parsed:URL;try{parsed=new URL(text)}catch{throw new Error('Source URL is invalid.')}if(parsed.protocol!=='https:'||parsed.username||parsed.password||!parsed.hostname)throw new Error('Source URL must be a public HTTPS address.');return parsed.href};
const oneOf=<T extends readonly string[]>(value:unknown,values:T,label:string):T[number]=>{if(typeof value!=='string'||!values.includes(value as T[number]))throw new Error(`${label} is unsupported.`);return value as T[number]};
const recordBase=(record:Omit<EvidenceDraftRecord,'id'|'fingerprint'>)=>JSON.stringify(record);
const packBase=(pack:Omit<EvidencePack,'fingerprint'>)=>JSON.stringify(pack);

export function createEvidenceDraft(input:EvidenceDraftInput,previous?:EvidenceDraftRecord,createdAt=new Date().toISOString()):EvidenceDraftRecord{
 const prior=previous?validateEvidenceRecord(previous):undefined;
 const deviceId=clean(input.deviceId,'Device ID',2,80);const device=getDevice(deviceId);
 if(device.id!==deviceId)throw new Error('Evidence device is not in the current catalog.');
 const correction=prior?{supersedesId:prior.id,reason:clean(input.correctionReason,'Correction reason',8,500)}:null;
 if(prior&&prior.device.id!==device.id)throw new Error('A correction must remain attached to the original device.');
 const base:Omit<EvidenceDraftRecord,'id'|'fingerprint'>={
  kind:'openlens-research-evidence',schemaVersion:EVIDENCE_SCHEMA_VERSION,revision:prior?prior.revision+1:1,createdAt:timestamp(createdAt,'Creation timestamp'),status:'draft-review',
  device:{id:device.id,revision:device.revision,name:device.name},
  source:{class:oneOf(input.sourceClass,evidenceSourceClasses,'Source class'),title:clean(input.sourceTitle,'Source title',3,180),url:url(input.sourceUrl),publisher:clean(input.publisher,'Publisher',2,120),publishedDate:date(input.publishedDate,'Published date',true),accessedDate:date(input.accessedDate,'Accessed date')!},
  claim:clean(input.claim,'Claim',5,500),confidence:oneOf(input.confidence,['high','medium','low'] as const,'Confidence'),notes:clean(input.notes,'Notes',3,1000),correction,
  checks:['known-device','complete-provenance','https-source','human-review-required'],
 };
 const id=`ol-evidence-${hash(recordBase(base))}`;
 return {...base,id,fingerprint:`ev-${hash(JSON.stringify({...base,id}))}`};
}

export function validateEvidenceRecord(value:unknown):EvidenceDraftRecord{
 if(!value||typeof value!=='object')throw new Error('Evidence record must be an object.');
 const raw=value as Partial<EvidenceDraftRecord>;
 if(raw.kind!=='openlens-research-evidence'||raw.schemaVersion!==EVIDENCE_SCHEMA_VERSION||raw.status!=='draft-review')throw new Error('Unsupported evidence record.');
 if(!raw.device||typeof raw.device!=='object')throw new Error('Evidence device snapshot is missing.');
 const deviceId=clean(raw.device.id,'Device ID',2,80);const device=getDevice(deviceId);
 if(device.id!==deviceId)throw new Error('Evidence device is not in the current catalog.');
 if(!Number.isSafeInteger(raw.device.revision)||raw.device.revision!<1)throw new Error('Evidence device snapshot is invalid.');
 const deviceName=clean(raw.device.name,'Device name',2,120);
 if(!raw.source||typeof raw.source!=='object')throw new Error('Evidence source is missing.');
 const correction=raw.correction===null?null:raw.correction&&typeof raw.correction==='object'?{supersedesId:clean(raw.correction.supersedesId,'Superseded record ID',8,100),reason:clean(raw.correction.reason,'Correction reason',8,500)}:(()=>{throw new Error('Evidence correction metadata is invalid.')})();
 const base:Omit<EvidenceDraftRecord,'id'|'fingerprint'>={
  kind:'openlens-research-evidence',schemaVersion:EVIDENCE_SCHEMA_VERSION,revision:Number(raw.revision),createdAt:timestamp(raw.createdAt,'Creation timestamp'),status:'draft-review',
  device:{id:device.id,revision:Number(raw.device.revision),name:deviceName},
  source:{class:oneOf(raw.source.class,evidenceSourceClasses,'Source class'),title:clean(raw.source.title,'Source title',3,180),url:url(raw.source.url),publisher:clean(raw.source.publisher,'Publisher',2,120),publishedDate:date(raw.source.publishedDate,'Published date',true),accessedDate:date(raw.source.accessedDate,'Accessed date')!},
  claim:clean(raw.claim,'Claim',5,500),confidence:oneOf(raw.confidence,['high','medium','low'] as const,'Confidence'),notes:clean(raw.notes,'Notes',3,1000),correction,
  checks:['known-device','complete-provenance','https-source','human-review-required'],
 };
 if(JSON.stringify(raw.checks)!==JSON.stringify(base.checks))throw new Error('Evidence validation checks are invalid.');
 if(!Number.isSafeInteger(base.revision)||base.revision<1)throw new Error('Evidence revision is invalid.');
 const id=clean(raw.id,'Evidence record ID',8,100);
 const fingerprint=clean(raw.fingerprint,'Evidence fingerprint',8,100);
 if(id!==`ol-evidence-${hash(recordBase(base))}`||fingerprint!==`ev-${hash(JSON.stringify({...base,id}))}`)throw new Error('Evidence fingerprint failed. The draft may have been edited.');
 return {...base,id,fingerprint};
}

export function createEvidencePack(records:EvidenceDraftRecord[],createdAt=new Date().toISOString()):EvidencePack{
 const validated=records.map(validateEvidenceRecord);
 if(validated.length<1||validated.length>100)throw new Error('Evidence pack must contain 1–100 records.');
 validateCorrectionChain(validated);
 const base:Omit<EvidencePack,'fingerprint'>={kind:'openlens-research-evidence-pack',schemaVersion:EVIDENCE_SCHEMA_VERSION,createdAt:timestamp(createdAt,'Pack timestamp'),status:'draft-review',records:validated};
 return {...base,fingerprint:`pack-${hash(packBase(base))}`};
}

function validateCorrectionChain(records:EvidenceDraftRecord[]){
 const known=new Map<string,EvidenceDraftRecord>();
 for(const record of records){
  if(known.has(record.id))throw new Error(`Duplicate evidence record ${record.id}.`);
  if(record.correction){const previous=known.get(record.correction.supersedesId);if(!previous)throw new Error(`Correction ${record.id} does not include its original record first.`);if(record.device.id!==previous.device.id||record.revision!==previous.revision+1)throw new Error(`Correction ${record.id} has an invalid revision chain.`)}
  else if(record.revision!==1)throw new Error(`Original record ${record.id} must start at revision 1.`);
  known.set(record.id,record);
 }
}

export function validateEvidencePack(value:unknown):EvidencePack{
 if(!value||typeof value!=='object')throw new Error('Evidence pack must be an object.');
 const raw=value as Partial<EvidencePack>;
 if(raw.kind!=='openlens-research-evidence-pack'||raw.schemaVersion!==EVIDENCE_SCHEMA_VERSION||raw.status!=='draft-review'||!Array.isArray(raw.records))throw new Error('Unsupported evidence pack.');
 const base:Omit<EvidencePack,'fingerprint'>={kind:'openlens-research-evidence-pack',schemaVersion:EVIDENCE_SCHEMA_VERSION,createdAt:timestamp(raw.createdAt,'Pack timestamp'),status:'draft-review',records:raw.records.map(validateEvidenceRecord)};
 if(base.records.length<1||base.records.length>100)throw new Error('Evidence pack must contain 1–100 records.');
 validateCorrectionChain(base.records);
 const fingerprint=clean(raw.fingerprint,'Pack fingerprint',8,100);
 if(fingerprint!==`pack-${hash(packBase(base))}`)throw new Error('Evidence pack fingerprint failed. The pack may have been edited.');
 return {...base,fingerprint};
}

export function exportEvidencePack(pack:EvidencePack){return JSON.stringify(validateEvidencePack(pack),null,2)}
export function importEvidencePack(text:string){if(text.length>524_288)throw new Error('Evidence pack exceeds the 512 KB limit.');let parsed:unknown;try{parsed=JSON.parse(text)}catch{throw new Error('Evidence pack is not valid JSON.')}return validateEvidencePack(parsed)}
