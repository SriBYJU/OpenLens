import {useState,type CSSProperties} from 'react';
import {capabilityKeys} from '../core';
import {devices} from '../data/devices';
import {useWorkbench} from '../app/workbench';

const field=devices.filter(device=>device.kind==='research');
const show=(value:string|number|null,suffix='')=>value===null?'Unknown':`${value}${suffix}`;

export default function HomeDeviceSwitchboard(){
 const [selected,setSelected]=useState(field[0].id);
 const work=useWorkbench();
 const device=field.find(item=>item.id===selected)??field[0];
 const fov=device.optics.horizontalFovDegrees?.value??0;
 const style={'--device-fov':`${Math.max(18,Math.min(100,fov/50*100))}%`} as CSSProperties;
 const simulate=()=>{const modelId=`model-${device.id}`;work.setDeviceId(modelId);location.hash=`#/lab?device=${modelId}`};
 return <section className="device-switchboard" aria-labelledby="device-switchboard-title">
  <header><div><p className="eyebrow">DEVICE FIELD / LIVE EXPLORER</p><h2 id="device-switchboard-title">Seven pairs.<br/><em>Seven different realities.</em></h2></div><p>Choose a profile and watch its physical boundary change. Every value shown comes from the linked maker record; the runnable version is a capability model, not the physical device.</p></header>
  <div className="device-selector" aria-label="Choose a smart-glasses profile">{field.map((item,index)=><button aria-pressed={device.id===item.id} onClick={()=>setSelected(item.id)} key={item.id}><span style={{color:'#aab5b6'}}>{String(index+1).padStart(2,'0')}</span><small style={{color:'#aab5b6'}}>{item.manufacturer}</small><strong>{item.name}</strong></button>)}</div>
  <div className={`device-stage ${device.capabilities.display.physical==='absent'?'no-device-display':''}`} style={style} aria-live="polite">
   <div className="device-aperture" aria-hidden="true"><div className="aperture-frame"><i/><i/><b/></div><span>{device.capabilities.display.physical==='absent'?'NO VISUAL DISPLAY':fov?`${fov}° ${device.optics.fovAxis??'unknown'} field`:'FOV NOT PUBLISHED'}</span></div>
   <div className="device-brief"><div className="device-brief-index">{String(field.indexOf(device)+1).padStart(2,'0')} / {String(field.length).padStart(2,'0')}</div><p className="eyebrow">{device.manufacturer}</p><h3>{device.name}</h3><p>{device.summary}</p><dl><div><dt>Field</dt><dd>{device.capabilities.display.physical==='absent'?'No display':show(device.optics.horizontalFovDegrees?.value??null,'°')}</dd></div><div><dt>Mass</dt><dd>{show(device.specifications.massGrams.value,' g')}</dd></div><div><dt>Display</dt><dd>{show(device.specifications.displayTechnology.value)}</dd></div><div><dt>Sources</dt><dd>{device.sources.length} primary</dd></div></dl><div className="button-row"><button className="button primary" type="button" onClick={simulate}>Try its capability model ↗</button><a className="text-link" href={`#/research?device=${device.id}`}>Inspect evidence</a></div></div>
   <div className="capability-pulse"><header><span>PHYSICAL SIGNAL MAP</span><small>PRESENT / ABSENT / UNKNOWN</small></header>{capabilityKeys.map(key=>{const value=device.capabilities[key];return <div className={`pulse-${value.physical}`} key={key}><i/><span>{key==='imu'?'motion':key}</span><strong>{value.physical}</strong><small>{value.manufacturerAccess.replaceAll('-',' ')}</small></div>})}</div>
  </div>
 </section>;
}
