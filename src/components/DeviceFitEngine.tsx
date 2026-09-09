import {useMemo,useState} from 'react';
import {capabilityKeys,defaultFitRequirements,fitDevices,type Capability,type CapabilityPriority,type FitRequirements} from '../core';
import {devices} from '../data/devices';

const priorityLabel:Record<CapabilityPriority,string>={off:'Not needed',preferred:'Preferred',required:'Required'};
const nextPriority:Record<CapabilityPriority,CapabilityPriority>={off:'preferred',preferred:'required',required:'off'};

export default function DeviceFitEngine({onInspect}:{onInspect:(deviceId:string)=>void}){
 const [requirements,setRequirements]=useState<FitRequirements>(defaultFitRequirements);
 const results=useMemo(()=>fitDevices(devices,requirements),[requirements]);
 const setPriority=(capability:Capability)=>setRequirements(current=>({...current,capabilities:{...current.capabilities,[capability]:nextPriority[current.capabilities[capability]]}}));
 const viable=results.filter(result=>result.verdict!=='not-a-fit').length;
 return <section className="fit-engine" aria-labelledby="fit-engine-title">
  <header className="fit-engine-head"><div><p className="eyebrow">DEVICE FIT ENGINE / EXPLAINABLE RULES</p><h2 id="fit-engine-title">Describe the hardware<br/><em>your idea actually needs.</em></h2></div><p>No generated percentage. OpenLens checks physical capability, documented developer access, companion fallbacks and whether an executable adapter exists.</p></header>
  <div className="fit-workbench">
   <aside className="fit-controls panel-dark">
    <div className="panel-title"><span>01 / REQUIREMENTS</span><b>{viable} VIABLE</b></div>
    <p className="fit-help">Tap each capability to cycle from not needed → preferred → required.</p>
    <div className="fit-capability-grid">{capabilityKeys.map(capability=>{const priority=requirements.capabilities[capability];return <button type="button" className={`fit-capability ${priority}`} onClick={()=>setPriority(capability)} key={capability} aria-label={`${capability}: ${priorityLabel[priority]}`}><span>{capability}</span><strong>{priorityLabel[priority]}</strong><i aria-hidden="true"/></button>})}</div>
    <label>Developer access<select value={requirements.developerAccess} onChange={event=>setRequirements(current=>({...current,developerAccess:event.target.value as FitRequirements['developerAccess']}))}><option value="ignore">Hardware fit only</option><option value="preferred">Prefer documented APIs</option><option value="required">Require developer access</option></select></label>
    <label className="fit-check"><input type="checkbox" checked={requirements.allowCompanion} onChange={event=>setRequirements(current=>({...current,allowCompanion:event.target.checked}))}/><span>Allow companion-phone routes</span></label>
    <label className="fit-check"><input type="checkbox" checked={requirements.execution==='openlens-runnable'} onChange={event=>setRequirements(current=>({...current,execution:event.target.checked?'openlens-runnable':'research-ok'}))}/><span>Must run inside OpenLens today</span></label>
    <button className="button ghost full" type="button" onClick={()=>setRequirements(defaultFitRequirements)}>Reset to translation example</button>
   </aside>
   <div className="fit-results" aria-live="polite">
    <div className="fit-result-summary"><span>{results.length} PROFILES CHECKED</span><strong>{viable}</strong><small>{viable===1?'candidate clears':'candidates clear'} the required gates</small></div>
    {results.slice(0,5).map((result,index)=><article className={`fit-result ${result.verdict}`} key={result.device.id}>
     <div className="fit-rank"><span>{String(index+1).padStart(2,'0')}</span><i/></div>
     <div className="fit-result-main"><div className="fit-result-title"><div><p className="eyebrow">{result.device.manufacturer}</p><h3>{result.device.name}</h3></div><span className={`fit-verdict ${result.verdict}`}>{result.verdict.replaceAll('-',' ')}</span></div>
      <p>{result.device.summary}</p>
      <div className="fit-evidence-row"><span>{result.requiredMatches.length} required matched</span><span>{result.preferredMatches.length} preferred matched</span><span>{result.documentedAccess} documented API path{result.documentedAccess===1?'':'s'}</span><span>{result.device.sources.length} sources</span></div>
      <div className="fit-reasons">{result.blockers.slice(0,2).map(reason=><span className="blocker" key={reason}>× {reason}</span>)}{result.caveats.slice(0,2).map(reason=><span className="caveat" key={reason}>△ {reason}</span>)}{!result.blockers.length&&result.strengths.slice(0,2).map(reason=><span className="strength" key={reason}>✓ {reason}</span>)}</div>
      <div className="button-row"><button className="button small" type="button" onClick={()=>onInspect(result.device.id)}>Open Device Doctor</button><a className="text-link" href={result.device.kind==='digital-twin'?`#/lab?device=${result.device.id}`:`#/research?device=${result.device.id}`}>{result.device.kind==='digital-twin'?'Run profile':'Inspect evidence'}</a></div>
     </div>
    </article>)}
   </div>
  </div>
 </section>
}
