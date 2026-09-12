import {useRef,useState} from 'react';
import {createEvidenceDraft,createEvidencePack,evidenceSourceClasses,exportEvidencePack,importEvidencePack,validateEvidenceRecord,type EvidenceDraftInput,type EvidenceDraftRecord} from '../core';
import {devices} from '../data/devices';

const storageKey='openlens-evidence-review-queue-v1';
const today=()=>new Date().toISOString().slice(0,10);
const initialInput=():EvidenceDraftInput=>({deviceId:devices.find(device=>device.kind==='research')?.id??devices[0].id,sourceClass:'manufacturer',sourceTitle:'',sourceUrl:'https://',publisher:'',publishedDate:null,accessedDate:today(),claim:'',confidence:'medium',notes:''});
const readQueue=()=>{try{const value=JSON.parse(localStorage.getItem(storageKey)??'[]');if(!Array.isArray(value))return[];const records=value.map(validateEvidenceRecord);if(records.length)createEvidencePack(records);return records}catch{return []}};
const storeQueue=(records:EvidenceDraftRecord[])=>localStorage.setItem(storageKey,JSON.stringify(records));
const save=(name:string,text:string)=>{const href=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=href;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(href),1000)};
const sourceLabel=(value:string)=>value.replaceAll('-',' ');

export default function EvidenceIntake(){
 const [input,setInput]=useState<EvidenceDraftInput>(initialInput);
 const [records,setRecords]=useState<EvidenceDraftRecord[]>(readQueue);
 const [editing,setEditing]=useState<EvidenceDraftRecord|null>(null);
 const [message,setMessage]=useState('Drafts stay in this browser until you export them. Nothing is published automatically.');
 const fileInput=useRef<HTMLInputElement>(null);
 const update=<K extends keyof EvidenceDraftInput>(key:K,value:EvidenceDraftInput[K])=>setInput(current=>({...current,[key]:value}));
 const submit=(event:React.FormEvent)=>{
  event.preventDefault();
  try{
   const record=createEvidenceDraft(input,editing??undefined);
   const next=[...records,record];createEvidencePack(next);storeQueue(next);setRecords(next);setEditing(null);setInput(initialInput());
   setMessage(editing?`Revision ${record.revision} added. The original remains in the review chain.`:`Draft ${record.id} passed structural checks and entered local review.`);
  }catch(error){setMessage(error instanceof Error?error.message:'Evidence draft was rejected.')}
 };
 const revise=(record:EvidenceDraftRecord)=>{setEditing(record);setInput({deviceId:record.device.id,sourceClass:record.source.class,sourceTitle:record.source.title,sourceUrl:record.source.url,publisher:record.source.publisher,publishedDate:record.source.publishedDate,accessedDate:today(),claim:record.claim,confidence:record.confidence,notes:record.notes,correctionReason:''});setMessage(`Creating revision ${record.revision+1}. Explain why the claim or source changed.`)};
 const exportPack=()=>{try{const pack=createEvidencePack(records);save(`openlens-evidence-pack-${pack.createdAt.slice(0,10)}.json`,exportEvidencePack(pack));setMessage(`Exported ${records.length} fingerprinted draft record${records.length===1?'':'s'}.`)}catch(error){setMessage(error instanceof Error?error.message:'Evidence pack could not be exported.')}};
 const importPack=async(file:File)=>{try{if(file.size>524_288)throw new Error('Evidence pack exceeds the 512 KB limit.');const pack=importEvidencePack(await file.text());const known=new Map(records.map(record=>[record.id,record]));for(const record of pack.records){const current=known.get(record.id);if(current&&current.fingerprint!==record.fingerprint)throw new Error(`Local record ${record.id} conflicts with the imported pack.`);known.set(record.id,record)}const merged=[...known.values()];createEvidencePack(merged);storeQueue(merged);setRecords(merged);setMessage(`Validated and loaded ${pack.records.length} draft record${pack.records.length===1?'':'s'}; ${merged.length} now in the local queue.`)}catch(error){setMessage(error instanceof Error?error.message:'Evidence pack was rejected.')}finally{if(fileInput.current)fileInput.current.value=''}};
 return <section className="compiler-page" aria-labelledby="evidence-intake-heading">
  <div className="compiler-workspace">
   <form className="author-panel panel-dark" onSubmit={submit}>
    <div className="panel-title"><span>EVIDENCE INTAKE / LOCAL DRAFT</span><b>{editing?`REVISION ${editing.revision+1}`:'HUMAN REVIEW REQUIRED'}</b></div>
    <label>Technical claim<textarea value={input.claim} onChange={event=>update('claim',event.target.value)} placeholder="State one precise, testable device claim…"/><small className="field-help">One claim per record. OpenLens validates provenance and structure; it does not decide whether the claim is true.</small></label>
    <div className="structured-controls">
     <label>Device<select aria-label="Evidence device" value={input.deviceId} disabled={Boolean(editing)} onChange={event=>update('deviceId',event.target.value)}>{devices.map(device=><option value={device.id} key={device.id}>{device.name}</option>)}</select></label>
     <label>Source class<select value={input.sourceClass} onChange={event=>update('sourceClass',event.target.value as EvidenceDraftInput['sourceClass'])}>{evidenceSourceClasses.map(value=><option value={value} key={value}>{sourceLabel(value)}</option>)}</select></label>
     <label>Confidence<select value={input.confidence} onChange={event=>update('confidence',event.target.value as EvidenceDraftInput['confidence'])}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
     <label>Accessed date<input type="date" value={input.accessedDate} onChange={event=>update('accessedDate',event.target.value)}/></label>
     <label>Publisher<input value={input.publisher} onChange={event=>update('publisher',event.target.value)} placeholder="Publisher"/></label>
     <label>Source title<input value={input.sourceTitle} onChange={event=>update('sourceTitle',event.target.value)} placeholder="Document title"/></label>
     <label>Public HTTPS source<input type="url" value={input.sourceUrl} onChange={event=>update('sourceUrl',event.target.value)} placeholder="https://…"/></label>
     <label>Published date<input type="date" value={input.publishedDate??''} onChange={event=>update('publishedDate',event.target.value||null)}/></label>
     <label>Evidence notes<input value={input.notes} onChange={event=>update('notes',event.target.value)} placeholder="Scope, conditions, ambiguity…"/></label>
     {editing&&<label>Correction reason<input value={input.correctionReason??''} onChange={event=>update('correctionReason',event.target.value)} placeholder="Why this revision is needed"/></label>}
    </div>
    <div className="compiler-save"><button className="button primary" type="submit">{editing?'Create immutable revision':'Add to review queue'} →</button>{editing&&<button className="button" type="button" onClick={()=>{setEditing(null);setInput(initialInput());setMessage('Revision cancelled; the original draft is unchanged.')}}>Cancel revision</button>}<span>Browser drafts cannot be promoted; selecting a source class is not proof.</span></div>
   </form>
   <section className="ir-panel">
    <header><div><p className="eyebrow">FIND → VERIFY → CROSS-CHECK → EXTRACT → STRUCTURE → SOURCE → CONFIDENCE → REVIEW</p><h2 id="evidence-intake-heading">Local evidence review queue</h2></div><span className="truth-label simulated">{records.length} DRAFT{records.length===1?'':'S'}</span></header>
    <div className="pipeline-graph" role="region" aria-label="Evidence intake review stages" tabIndex={0}><div><span>01–02</span><strong>Find / verify</strong></div><i>→</i><div><span>03–04</span><strong>Cross-check / extract</strong></div><i>→</i><div><span>05–06</span><strong>Structure / source</strong></div><i>→</i><div><span>07–08</span><strong>Confidence / review</strong></div></div>
    {records.length?<div className="claim-list" aria-label="Local evidence drafts">{records.map(record=><div key={record.id}><span>{record.device.name}</span><strong>REV {record.revision} · {sourceLabel(record.source.class)}</strong><small>{record.confidence} · DRAFT REVIEW</small><p>{record.claim}<br/><a href={record.source.url} target="_blank" rel="noreferrer">{record.source.publisher} ↗</a> · <code>{record.fingerprint}</code>{record.correction&&<> · replaces <code>{record.correction.supersedesId}</code></>}</p><button className="button small" type="button" onClick={()=>revise(record)}>Create revision</button></div>)}</div>:<div className="empty-state">Complete one sourced claim to create a reviewable evidence record.</div>}
    <div className="compiler-save"><button className="button" type="button" disabled={!records.length} onClick={exportPack}>Export validated pack</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={event=>event.target.files?.[0]&&void importPack(event.target.files[0])}/><button className="button" type="button" onClick={()=>fileInput.current?.click()}>Import pack</button><span role="status">{message}</span></div>
   </section>
  </div>
 </section>;
}
