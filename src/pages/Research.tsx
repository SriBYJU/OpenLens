import {useEffect,useState} from 'react';
import FeatureGuide from '../components/FeatureGuide';
import Page from '../components/Page';
import {capabilityKeys} from '../core';
import {devices} from '../data/devices';

const requestedDevice=()=>{try{const id=new URLSearchParams(location.hash.split('?')[1]??'').get('device');return devices.some(device=>device.id===id&&device.sources.length)?id!:devices.find(device=>device.sources.length)!.id}catch{return devices.find(device=>device.sources.length)!.id}};

export default function Research(){
 const [open,setOpen]=useState(requestedDevice);
 useEffect(()=>{const sync=()=>setOpen(requestedDevice());addEventListener('hashchange',sync);return()=>removeEventListener('hashchange',sync)},[]);
 return <Page index="05" eyebrow="RESEARCH / EVIDENCE LEDGER" title={<>Unknown stays<br/><em>unknown.</em></>} lead="For researchers and builders verifying what each pair of glasses can do. Every claim stays attached to a publisher, access date, confidence, and integration boundary.">
  <FeatureGuide title="Read a device claim correctly" intro="The ledger prevents three different facts—physical hardware, a maker's developer access, and working OpenLens code—from being collapsed into one support badge." steps={[
   {number:'1',title:'Open a device',body:'The selected record expands to show each capability and its documented access path.'},
   {number:'2',title:'Inspect the source',body:'Follow the original manufacturer or developer page and review the attached note.'},
   {number:'3',title:'Challenge the record',body:'Submit a stronger source or conflict; unknown values remain unknown until evidence resolves them.'}
  ]}/>
  <div className="research-principles"><div><span>01</span><h3>Separate</h3><p>Physical hardware, manufacturer APIs and OpenLens integration are three different claims.</p></div><div><span>02</span><h3>Label</h3><p>Manufacturer claim, estimated, simulated and OpenLens measured states never collapse together.</p></div><div><span>03</span><h3>Preserve</h3><p>Conflicts and gaps stay in the record until evidence resolves them.</p></div></div>
  <section className="evidence-ledger">{devices.filter(d=>d.sources.length).map((device,index)=><article className={open===device.id?'open':''} key={device.id}><button className="evidence-summary" onClick={()=>setOpen(open===device.id?'':device.id)} aria-expanded={open===device.id}><span>{String(index+1).padStart(2,'0')}</span><div><small>{device.manufacturer}</small><strong>{device.name}</strong></div><div><small>INTEGRATION</small><strong>{device.integrationStatus}</strong></div><div><small>SOURCES</small><strong>{device.sources.length}</strong></div><b>{open===device.id?'−':'+'}</b></button>{open===device.id&&<div className="evidence-body"><div className="claim-list"><h3>Capability assertions</h3>{capabilityKeys.map(key=><div key={key}><span>{key}</span><strong>{device.capabilities[key].physical}</strong><small>{device.capabilities[key].manufacturerAccess}</small><p>{device.capabilities[key].note}</p></div>)}</div><div className="source-list"><h3>Primary source record</h3>{device.sources.map(source=><a href={source.url} target="_blank" rel="noreferrer" key={source.id}><span>{source.publisher}</span><strong>{source.title}</strong><p>{source.note}</p><small>{source.confidence.toUpperCase()} CONFIDENCE · ACCESSED {source.accessed} ↗</small></a>)}</div></div>}</article>)}</section>
  <div className="correction-callout"><span>EVIDENCE CORRECTIONS</span><p>Found a stronger primary source or a conflicting specification? Open a repository issue with the exact claim, source URL, publisher, and date.</p><a className="button" href="https://github.com/SriBYJU/OpenLens/issues" target="_blank" rel="noreferrer">Submit evidence</a></div>
 </Page>
}
