import {useState} from 'react';
import {evaluateAdapterBundle,type AdapterStarterFile,type AdapterStarterInput,type ConformanceProbe,type ConformanceReport} from '../core';

const probes:Array<{id:ConformanceProbe;label:string;detail:string}>=[
 {id:'clean',label:'Untouched starter',detail:'Validate the bundle exactly as generated.'},
 {id:'promoted-status',label:'False verified status',detail:'Prove the validator rejects hardware verification without evidence.'},
 {id:'identity-drift',label:'Adapter ID drift',detail:'Prove cross-file identity changes are caught.'},
 {id:'missing-failure-case',label:'Missing transport test',detail:'Prove an incomplete failure matrix is caught.'},
];

export default function AdapterConformanceLab({files,input}:{files:AdapterStarterFile[];input:AdapterStarterInput}){
 const [probe,setProbe]=useState<ConformanceProbe>('clean');
 const [report,setReport]=useState<ConformanceReport|null>(null);
 const run=()=>setReport(evaluateAdapterBundle(files,input,probe));
 return <section className="conformance-lab" aria-labelledby="conformance-heading">
  <header><div><p className="eyebrow">ADAPTER CONFORMANCE LAB / LIVE VALIDATOR</p><h2 id="conformance-heading">Break the bundle before hardware does.</h2><p>This browser validator inspects the generated source, contract test, verification JSON, paths, identities, and failure matrix. It does not compile vendor code or claim a device connection.</p></div><div className="conformance-orb" data-state={report?report.passed===report.total?'pass':'caught':'idle'}><span>{report?`${report.passed}/${report.total}`:'00'}</span><small>{report?report.passed===report.total?'CHECKS PASS':'FAULT CAUGHT':'READY'}</small></div></header>
  <div className="conformance-console"><div className="probe-picker"><label>Probe the validator<select value={probe} onChange={event=>{setProbe(event.target.value as ConformanceProbe);setReport(null)}}>{probes.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label><p>{probes.find(item=>item.id===probe)?.detail}</p><button className="button primary" disabled={!files.length} onClick={run}>Run {files.length?'8 checks':'after valid input'} ↗</button></div><div className="check-stack" aria-live="polite">{report?report.checks.map((check,index)=><article className={check.passed?'pass':'fail'} key={check.id}><span>{(index+1).toString().padStart(2,'0')}</span><i aria-hidden="true">{check.passed?'✓':'×'}</i><div><strong>{check.label}</strong><p>{check.detail}</p></div></article>):<div className="conformance-empty"><span>CONTRACT WAITING</span><p>Select a clean or intentionally damaged bundle, then execute the checks. A damaged probe should produce one precise failure.</p></div>}</div></div>
 </section>;
}
