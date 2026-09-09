import {useMemo,useState} from 'react';
import FeatureGuide from '../components/FeatureGuide';
import Page from '../components/Page';
import Glasses from '../components/Glasses';
import DeviceFitEngine from '../components/DeviceFitEngine';
import DeviceDoctor from '../components/DeviceDoctor';
import {capabilityKeys,getDevice} from '../core';
import {devices} from '../data/devices';

export default function Devices(){
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<string[]>(['openlens-twin','snap-spectacles-2024']);
 const [differences,setDifferences]=useState(false);
 const [doctorId,setDoctorId]=useState<string|null>(null);
 const filtered=devices.filter(d=>`${d.name} ${d.manufacturer} ${d.summary} ${Object.keys(d.capabilities).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
 const compare=devices.filter(d=>selected.includes(d.id));
 const rows=useMemo(()=>capabilityKeys.filter(key=>!differences||new Set(compare.map(d=>`${d.capabilities[key].physical}/${d.capabilities[key].manufacturerAccess}`)).size>1),[compare,differences]);
 const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(v=>v!==id):current.length<3?[...current,id]:[...current.slice(1),id]);
 return <Page index="02" eyebrow="DEVICE UNIVERSE / 8 SOURCED PROFILES" title={<>Compare the hardware.<br/><em>Keep claims honest.</em></>} lead="For builders choosing a target device. Search sourced profiles, ask the Fit Engine what actually satisfies your requirements, then inspect the evidence behind every state.">
  <FeatureGuide title="How to use the Device Universe" intro="A device listing answers three separate questions: does the hardware exist, does its maker expose an API, and has OpenLens implemented that API?" steps={[{number:'1',title:'Ask for what you need',body:'Use the Fit Engine to mark capabilities as preferred or required.'},{number:'2',title:'Diagnose the result',body:'Device Doctor separates hardware, maker access and OpenLens execution.'},{number:'3',title:'Compare the finalists',body:'Select up to three profiles and inspect only the differences that matter.'}]}/>
  <DeviceFitEngine onInspect={setDoctorId}/>
  {doctorId&&<DeviceDoctor device={getDevice(doctorId)} onClose={()=>setDoctorId(null)}/>} 
  <section className="catalog-section" aria-labelledby="catalog-title">
   <header className="catalog-section-head"><div><p className="eyebrow">DEVICE CATALOG</p><h2 id="catalog-title">Inspect the field directly.</h2></div><p>Eight initial profiles. Source depth will continue expanding; unknown stays unknown until evidence exists.</p></header>
   <div className="catalog-tools"><input className="search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search devices, makers, or capabilities…"/><span className="result-count">{filtered.length} OF {devices.length} PROFILES</span><label className="toggle"><input type="checkbox" checked={differences} onChange={e=>setDifferences(e.target.checked)}/><span/>Show differences only</label></div>
   <div className="device-catalog">{filtered.map((device,index)=><article className={`device-record ${selected.includes(device.id)?'selected':''} device-${index%4}`} key={device.id}>
    <button className="compare-toggle" onClick={()=>toggle(device.id)} aria-pressed={selected.includes(device.id)}>{selected.includes(device.id)?'✓ COMPARING':'＋ COMPARE'}</button>
    <div className="device-render"><span>{String(index+1).padStart(2,'0')}</span><Glasses compact={index%2===1}/><i className="device-variant"/></div>
    <div className="device-info"><div><p className="eyebrow">{device.manufacturer}</p><h2>{device.name}</h2></div><span className={`truth-label ${device.integrationStatus}`}>{device.integrationStatus.replaceAll('-',' ')}</span><p>{device.summary}</p><div className="device-meta"><span>{device.capabilities.display.physical==='present'?(device.optics.horizontalFovDegrees?.value?`${device.optics.horizontalFovDegrees.value}° ${device.optics.fovAxis??''} FOV`:'FOV UNKNOWN'):'NO DISPLAY'}</span><span>{device.sources.length} PRIMARY SOURCES</span><span>{Object.values(device.capabilities).filter(c=>c.physical==='present').length} CAPABILITIES</span></div><div className="button-row"><button className="button" type="button" onClick={()=>setDoctorId(device.id)}>Device Doctor</button><a className="text-link" href={device.kind==='digital-twin'?`#/lab?device=${device.id}`:`#/research?device=${device.id}`}>{device.kind==='digital-twin'?'Run this twin →':'Inspect evidence →'}</a></div></div>
   </article>)}</div>
  </section>
  <section className="compare-table"><header><div><p className="eyebrow">LIVE COMPARISON</p><h2>{compare.length} profiles selected</h2></div><span>Physical capability / maker API / OpenLens status</span></header>{compare.length?<div className="table-scroll"><table><thead><tr><th>Capability</th>{compare.map(d=><th key={d.id}>{d.name}<small>{d.integrationStatus}</small></th>)}</tr></thead><tbody>{rows.map(key=><tr key={key}><th>{key}</th>{compare.map(d=><td key={d.id}><b>{d.capabilities[key].physical}</b><small>{d.capabilities[key].manufacturerAccess}</small><p>{d.capabilities[key].note}</p></td>)}</tr>)}<tr><th>OpenLens execution</th>{compare.map(d=><td key={d.id}><b>{d.kind==='digital-twin'?'Runnable now':'Not connected'}</b><small>{d.kind==='research'?'research and comparison only':'registered deterministic twin'}</small></td>)}</tr></tbody></table></div>:<div className="empty-state">Select devices above to build a comparison.</div>}</section>
 </Page>
}
