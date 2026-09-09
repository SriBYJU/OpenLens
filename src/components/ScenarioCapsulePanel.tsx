import {useEffect,useRef,useState} from 'react';
import {useWorkbench} from '../app/workbench';
import {createScenarioCapsule,decodeScenarioCapsule,encodeScenarioCapsule,exportScenarioCapsule,importScenarioCapsule,type ImportedScenarioCapsule,type ScenarioCapsule} from '../core';

const download=(name:string,text:string)=>{const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url)};
const scenarioToken=()=>{try{const raw=location.hash.replace(/^#\/?/,'');const query=raw.includes('?')?raw.slice(raw.indexOf('?')+1):'';return new URLSearchParams(query).get('scenario')}catch{return null}};

export default function ScenarioCapsulePanel(){
 const work=useWorkbench();
 const fileInput=useRef<HTMLInputElement>(null);
 const [title,setTitle]=useState(`${work.experience.name} · test scenario`);
 const [capsule,setCapsule]=useState<ScenarioCapsule|null>(null);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const applyImported=(imported:ImportedScenarioCapsule,source:'file'|'link')=>{work.setDeviceId(imported.capsule.deviceId);work.setExperience(imported.capsule.experience);work.setConfig(imported.capsule.config);setTitle(imported.capsule.title);setCapsule(imported.capsule);setMessage(`${source==='link'?'Shared scenario verified':'Loaded verified capsule'} · ${imported.capsule.fingerprint}`);setError('')};
 const apply=(text:string)=>{try{applyImported(importScenarioCapsule(text),'file')}catch(reason){setError(reason instanceof Error?reason.message:'Scenario capsule could not be loaded.');setMessage('')}};
 useEffect(()=>{const fromHash=()=>{const token=scenarioToken();if(!token)return;try{applyImported(decodeScenarioCapsule(token),'link')}catch(reason){setError(reason instanceof Error?reason.message:'Shared scenario could not be verified.');setMessage('')}};fromHash();addEventListener('hashchange',fromHash);return()=>removeEventListener('hashchange',fromHash)},[]);
 const build=()=>{const next=createScenarioCapsule(title,work.plan,work.config);setCapsule(next);setTitle(next.title);setMessage(`Snapshot sealed · ${next.fingerprint}`);setError('')};
 const shareHref=capsule?(()=>{const url=new URL(location.href);url.hash=`/lab?scenario=${encodeScenarioCapsule(capsule)}`;return url.toString()})():'';
 const copy=async()=>{if(!shareHref)return;try{await navigator.clipboard.writeText(shareHref);setMessage(`Share link copied · ${capsule?.fingerprint}`);setError('')}catch{setError('Clipboard access was unavailable. Use “Open verified link” and copy the address from the browser.')}};
 const load=async(file:File)=>apply(await file.text());
 return <section className="scenario-capsule" aria-labelledby="capsule-title">
  <header><div><p className="eyebrow">SCENARIO CAPSULE / PORTABLE REPRODUCTION</p><h2 id="capsule-title">Seal the exact test.<br/><em>Open it somewhere else.</em></h2></div><p>A capsule snapshots the current device, experience, seed, timing, network, permissions and failure injection. OpenLens verifies its fingerprint and current device revision before applying it.</p></header>
  <div className="capsule-workspace">
   <label>Snapshot name<input value={title} maxLength={80} onChange={event=>{setTitle(event.target.value);setCapsule(null);setMessage('')}}/></label>
   <div className="capsule-actions"><button className="button primary" onClick={build}>Seal current scenario</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={event=>event.target.files?.[0]&&void load(event.target.files[0])}/><button className="button" onClick={()=>fileInput.current?.click()}>Import capsule JSON</button></div>
   {capsule&&<div className="capsule-sealed"><div><span>FINGERPRINT</span><strong>{capsule.fingerprint}</strong></div><div><span>PLAN</span><strong>{capsule.planFingerprint}</strong></div><div><span>DEVICE REV</span><strong>{capsule.deviceRevision}</strong></div><div><span>SEED</span><strong>{capsule.config.seed}</strong></div><div className="capsule-share"><a className="button" href={shareHref}>Open verified link</a><button className="button" onClick={copy}>Copy share link</button><button className="button" onClick={()=>download(`${capsule.fingerprint}-scenario.json`,exportScenarioCapsule(capsule))}>Download JSON</button></div></div>}
  </div>
  {message&&<p className="capsule-status" role="status">{message}</p>}{error&&<p className="capsule-error" role="alert">{error}</p>}
 </section>
}
