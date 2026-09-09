import {capabilityKeys,type DeviceProfile} from '../core';

const accessText={
 'documented-api':'DOCUMENTED API',
 'companion-only':'COMPANION ONLY',
 unsupported:'UNSUPPORTED',
 unknown:'UNKNOWN',
} as const;

export default function DeviceDoctor({device,onClose}:{device:DeviceProfile;onClose:()=>void}){
 const integration=device.kind==='digital-twin'?'LEVEL S / SIMULATION':'LEVEL 0 / RESEARCH';
 return <section className="device-doctor" aria-labelledby="device-doctor-title">
  <header><div><p className="eyebrow">OPENLENS DEVICE DOCTOR</p><h2 id="device-doctor-title">{device.name}</h2><p>{device.manufacturer} · revision {device.revision}</p></div><div className="doctor-status"><span>{integration}</span><button className="icon-button" type="button" onClick={onClose} aria-label="Close Device Doctor">×</button></div></header>
  <div className="doctor-grid">
   <div className="doctor-overview">
    <div><span>PROFILE MODE</span><strong>{device.kind==='digital-twin'?'SIMULATED':'RESEARCH ONLY'}</strong><small>{device.kind==='digital-twin'?'Executable deterministic reference twin.':'No physical connection or executable OpenLens adapter.'}</small></div>
    <div><span>DISPLAY FIELD</span><strong>{device.capabilities.display.physical==='present'?(device.optics.horizontalFovDegrees?.value?`${device.optics.horizontalFovDegrees.value}°`:'UNKNOWN'):'NONE'}</strong><small>{device.optics.horizontalFovDegrees?.status?.replaceAll('-',' ')??'No display claim recorded.'}</small></div>
    <div><span>EVIDENCE</span><strong>{device.sources.length}</strong><small>{device.sources.length?'Attached profile sources.':'Synthetic OpenLens reference profile.'}</small></div>
   </div>
   <div className="doctor-capabilities"><div className="doctor-row doctor-head"><span>Subsystem</span><span>Hardware</span><span>Maker access</span><span>OpenLens execution</span></div>{capabilityKeys.map(capability=>{const info=device.capabilities[capability];const executable=device.kind==='digital-twin'&&info.physical==='present';return <div className="doctor-row" key={capability}><strong>{capability}</strong><span className={`doctor-state ${info.physical}`}>{info.physical}</span><span className={`doctor-state ${info.manufacturerAccess}`}>{accessText[info.manufacturerAccess]}</span><span className={`doctor-state ${executable?'simulated':'unavailable'}`}>{executable?'SIMULATED':'NOT IMPLEMENTED'}</span><p>{info.note}</p></div>})}</div>
  </div>
  <footer><div><span className="doctor-light"/><p><strong>Integrity rule:</strong> physical capability, manufacturer API access, and OpenLens integration are separate states. This panel never upgrades one because another exists.</p></div><div className="button-row"><a className="button primary" href={device.kind==='digital-twin'?`#/lab?device=${device.id}`:`#/research?device=${device.id}`}>{device.kind==='digital-twin'?'Open in Lens Lab':'Open evidence ledger'}</a><button className="button" type="button" onClick={onClose}>Close diagnosis</button></div></footer>
 </section>
}
