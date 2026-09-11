import {useMemo,useState} from 'react';
import {strToU8,zipSync} from 'fflate';
import BrowserReadiness from '../components/BrowserReadiness';
import FeatureGuide from '../components/FeatureGuide';
import Page from '../components/Page';
import {buildAdapterStarter,capabilityKeys,validateAdapterStarter,type AdapterStarterFile,type Capability} from '../core';

const save=(name:string,data:BlobPart,type:string)=>{const url=URL.createObjectURL(new Blob([data],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

export default function Developers(){
 const [name,setName]=useState('My Glasses');
 const [id,setId]=useState('my-glasses');
 const [caps,setCaps]=useState<Record<Capability,boolean>>({camera:true,microphone:true,display:true,audio:false,imu:true});
 const [active,setActive]=useState(0);
 const [copied,setCopied]=useState(false);
 const [copyError,setCopyError]=useState('');
 const input=useMemo(()=>({deviceName:name,deviceId:id,capabilities:capabilityKeys.filter(key=>caps[key])}),[name,id,caps]);
 const errors=validateAdapterStarter(input);
 const files=useMemo(()=>errors.length?[]:buildAdapterStarter(input),[input,errors.length]);
 const file=files[Math.min(active,files.length-1)] as AdapterStarterFile|undefined;
 const toggle=(key:Capability)=>setCaps(current=>({...current,[key]:!current[key]}));
 const bundle=()=>{const entries=Object.fromEntries(files.map(item=>[`${id}-openlens-adapter/${item.path}`,strToU8(item.content)]));save(`${id}-openlens-adapter.zip`,zipSync(entries,{level:6}),'application/zip')};
 const guide=<FeatureGuide title="Connect hardware without overstating support" intro="OpenLens separates documented device features, executable adapter code, and physical verification. The generated bundle keeps each stage explicit." steps={[
   {number:'1',title:'Describe the target',body:'Name the device and select only capabilities the transport will expose.'},
   {number:'2',title:'Download four usable files',body:'Receive the adapter, contract test, verification record and exact integration steps.'},
   {number:'3',title:'Implement, test, verify',body:'Wire the vendor transport, exercise failure cases, then record physical-device evidence.'},
  ]}/>;
 return <Page className="instrument-page developers-page" index="06" eyebrow="DEVELOPERS / ADAPTER WORKSHOP" title={<>Shape the <em>adapter.</em></>} lead="Describe a transport boundary and leave with code, tests, verification structure, and an implementation path." actions={<div className={`builder-state ${errors.length?'invalid':'ready'}`}><span>{errors.length?'NEEDS INPUT':'STARTER VALID'}</span><strong>{files.length}/4 files</strong></div>}>
  <div className="adapter-builder">
   <section className="adapter-form panel-dark"><div className="panel-title"><span>ADAPTER GENERATOR</span><b>4-FILE BUNDLE</b></div><label>Device name<input value={name} onChange={event=>setName(event.target.value)}/></label><label>Stable device ID<input value={id} onChange={event=>setId(event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,''))}/></label><fieldset><legend>Capabilities exposed by your transport</legend>{capabilityKeys.map(key=><label className="cap-check" key={key}><input type="checkbox" checked={caps[key]} onChange={()=>toggle(key)}/><span>{key}</span></label>)}</fieldset><p className="builder-note">The starter enforces connection state, device identity and capability requirements before delegating to vendor code. It remains <b>unavailable</b> until that transport exists.</p>{errors.length>0&&<ul className="builder-errors" role="alert">{errors.map(error=><li key={error}>{error}</li>)}</ul>}</section>
   <section className="code-stage"><header><span>{file?.path??'Complete the form'}</span><i>{file?.language.toUpperCase()??'WAITING'}</i></header>{files.length>0&&<nav className="file-tabs" aria-label="Generated adapter files">{files.map((item,index)=><button className={index===active?'active':''} onClick={()=>{setActive(index);setCopied(false)}} key={item.path}>{item.path.split('/').at(-1)}</button>)}</nav>}<pre tabIndex={0}>{file?.content??errors.join('\n')}</pre><footer><button className="button primary" disabled={!file} onClick={async()=>{if(!file)return;try{await navigator.clipboard.writeText(file.content);setCopied(true);setCopyError('')}catch{setCopyError('Clipboard unavailable. Download the file instead.')}}}>{copied?'Copied ✓':'Copy current file'}</button><button className="button" disabled={!file} onClick={()=>file&&save(file.path.split('/').at(-1)??'adapter.txt',file.content,'text/plain')}>Download current</button><button className="button" disabled={!files.length} onClick={bundle}>Download ZIP · {files.length} files</button></footer>{copyError&&<p role="status">{copyError}</p>}</section>
  </div>
  <section className="starter-proof"><div><p className="eyebrow">WHAT THE BUNDLE ALREADY ENFORCES</p><h2>A boundary you can test before hardware arrives.</h2></div><ol><li><b>01</b><span><strong>Lifecycle</strong>Repeated connect/disconnect calls remain safe.</span></li><li><b>02</b><span><strong>Identity</strong>A plan for another device is rejected.</span></li><li><b>03</b><span><strong>Capabilities</strong>Unsupported camera, audio, display, microphone, or IMU steps stop explicitly.</span></li><li><b>04</b><span><strong>Evidence</strong>Verification status starts unverified with required failure cases visible.</span></li></ol></section>
  <BrowserReadiness/>
  <div className="contract-grid"><article><span>01</span><h3>Device profile</h3><p>Sourced physical capabilities and manufacturer access claims.</p></article><article><span>02</span><h3>Adapter manifest</h3><p>The code’s real integration state and exposed capabilities.</p></article><article><span>03</span><h3>Execution contract</h3><p>Connect, disconnect, plan validation, errors and canonical output.</p></article><article><span>04</span><h3>Verification record</h3><p>Device, firmware, environment, raw observations and reproducible tests.</p></article></div>
  <section className="api-strip"><div><p className="eyebrow">IMPLEMENTATION GUIDE</p><h2>Follow the registration boundary.</h2><p>The repository guide explains status changes, trace requirements, hardware cases, and review order.</p></div><a className="button" href="https://github.com/SriBYJU/OpenLens/blob/main/DEVICE-ADAPTERS.md" target="_blank" rel="noreferrer">Read adapter guide ↗</a></section>
  <details className="lab-guide"><summary>How to take a starter from generated to verified</summary>{guide}</details>
 </Page>;
}
