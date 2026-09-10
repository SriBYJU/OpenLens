import {useState} from 'react';
import {capabilityKeys,type Capability, type DeviceProfile} from '../core';

type MatrixMode='physical'|'access'|'execution';
const modeCopy:Record<MatrixMode,string>={physical:'What exists in the hardware.',access:'What the maker exposes to developers.',execution:'What OpenLens can execute today.'};
const state=(device:DeviceProfile,key:Capability,mode:MatrixMode)=>{
 if(mode==='physical')return {label:device.capabilities[key].physical,detail:'hardware state'};
 if(mode==='access')return {label:device.capabilities[key].manufacturerAccess,detail:'maker boundary'};
 return device.kind==='digital-twin'?{label:'simulated',detail:'runnable twin'}:{label:'not connected',detail:'research only'};
};

export default function DeviceCapabilityMatrix({devices,selected,onToggle,onInspect}:{devices:DeviceProfile[];selected:string[];onToggle:(id:string)=>void;onInspect:(id:string)=>void}){
 const [mode,setMode]=useState<MatrixMode>('physical');
 return <section className="capability-matrix" aria-labelledby="matrix-title">
  <header><div><p className="eyebrow">INTERACTIVE HARDWARE MATRIX</p><h2 id="matrix-title">See the boundary<br/>in one glance.</h2></div><div><div className="matrix-modes" role="group" aria-label="Matrix layer">{(['physical','access','execution'] as MatrixMode[]).map(item=><button aria-pressed={mode===item} onClick={()=>setMode(item)} key={item}>{item==='access'?'Developer access':item}</button>)}</div><p>{modeCopy[mode]} Select a device heading to compare it, or a cell to open its evidence-aware diagnosis.</p></div></header>
  <div className="matrix-scroll"><div className="matrix-grid" style={{'--matrix-columns':devices.length} as React.CSSProperties}>
   <div className="matrix-corner"><span>LAYER</span><strong>{mode}</strong></div>{devices.map(device=><button className={`matrix-device ${selected.includes(device.id)?'selected':''}`} aria-pressed={selected.includes(device.id)} onClick={()=>onToggle(device.id)} key={device.id}><small>{device.manufacturer}</small><strong>{device.name}</strong><span>{selected.includes(device.id)?'COMPARING':'ADD TO COMPARE'}</span></button>)}
   {capabilityKeys.map(key=><div className="matrix-row" key={key}><div className="matrix-label"><span>{key}</span><small>{key==='imu'?'motion':key}</small></div>{devices.map(device=>{const value=state(device,key,mode);return <button className={`matrix-cell state-${value.label.replaceAll(' ','-')}`} onClick={()=>onInspect(device.id)} aria-label={`${device.name}, ${key}: ${value.label}. Open Device Doctor`} title={device.capabilities[key].note} key={device.id}><i/><strong>{value.label.replaceAll('-',' ')}</strong><small>{value.detail}</small></button>})}</div>)}
  </div></div>
  <footer><span><i className="matrix-good"/> available or runnable</span><span><i className="matrix-caution"/> companion or unknown</span><span><i className="matrix-stop"/> absent, unsupported, or disconnected</span></footer>
 </section>;
}
