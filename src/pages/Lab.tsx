import {lazy,Suspense,useState} from 'react';
import {useWorkbench} from '../app/workbench';
import FeatureGuide from '../components/FeatureGuide';
import Glasses from '../components/Glasses';
import Page from '../components/Page';
import TraceViewer from '../components/TraceViewer';
import {experiencePresets,getDevice,type FailureMode,type SimulationConfig} from '../core';
import {devices} from '../data/devices';
const LocalAI=lazy(()=>import('../components/LocalAI'));

const scenarios:Array<{id:string;name:string;description:string;change:Partial<SimulationConfig>}>= [
 {id:'clean',name:'Clean street run',description:'Healthy battery, granted camera permission, normal local processing.',change:{fixture:'street-sign',failureMode:'none',battery:84,network:'online',permission:'granted'}},
 {id:'denied',name:'Permission denied',description:'Camera access fails before any image leaves the input stage.',change:{fixture:'street-sign',failureMode:'permission',permission:'denied'}},
 {id:'train',name:'Degraded commute',description:'A noisy connection adds bridge overhead while local stages remain available.',change:{fixture:'conversation',failureMode:'none',network:'degraded',permission:'granted'}},
 {id:'power',name:'Critical battery',description:'The twin stops at its safety threshold before starting the experience.',change:{fixture:'museum-label',failureMode:'low-battery',battery:3,permission:'granted'}},
 {id:'offline',name:'Network loss',description:'Inject a lost route and verify the failure appears in the canonical trace.',change:{fixture:'museum-label',failureMode:'network-loss',network:'offline',permission:'granted'}},
];

export default function Lab(){
 const work=useWorkbench();
 const [aiOpen,setAiOpen]=useState(false);
 const [scenarioId,setScenarioId]=useState('clean');
 const device=getDevice(work.deviceId);const plan=work.plan;const fov=device.optics.horizontalFovDegrees;
 const update=<K extends keyof SimulationConfig>(key:K,value:SimulationConfig[K])=>work.setConfig({...work.config,[key]:value});
 const chooseScenario=(id:string)=>{const scenario=scenarios.find(item=>item.id===id)!;setScenarioId(id);work.setConfig({...work.config,...scenario.change})};
 const runScenario=()=>{if(device.kind==='research'){work.setDeviceId('openlens-twin');setTimeout(work.runCurrent,0);return}work.runCurrent()};
 return <Page index="01" eyebrow="LENS LAB / INTERACTIVE DIGITAL TWIN" title={<>Change a condition.<br/><em>See the system react.</em></>} lead="For product teams and developers testing a smart-glasses idea before hardware is available. Pick an experience and real-world condition, run it, then inspect exactly where it succeeded or failed." actions={<span className="truth-label simulated">RUNS IN THIS BROWSER</span>}>
  <FeatureGuide title="From idea to evidence in three steps" intro="This is a deterministic simulator: identical settings and seed create the identical result. Its purpose is testing product logic and failure handling, not claiming physical-device performance." steps={[
   {number:'1',title:'Choose what the glasses should do',body:'Select a prepared experience or create your own in the Compiler.'},
   {number:'2',title:'Choose the world around it',body:'Apply a normal, denied-permission, degraded-network, low-battery, or offline scenario.'},
   {number:'3',title:'Run and inspect',body:'The optical output, outcome summary, and trace update from the same versioned artifact.'},
  ]}/>
  <section className="scenario-picker" aria-labelledby="scenario-heading"><header><div><p className="eyebrow">SCENARIO LIBRARY</p><h2 id="scenario-heading">What should the twin encounter?</h2></div><p>Click a card, then run it. Every card changes actual simulator inputs.</p></header><div>{scenarios.map(s=><button className={scenarioId===s.id?'active':''} onClick={()=>chooseScenario(s.id)} key={s.id}><span>{scenarioId===s.id?'SELECTED':'TRY'}</span><strong>{s.name}</strong><small>{s.description}</small></button>)}</div></section>
  <nav className="workspace-tabs"><a className="active" href="#/lab">1. Run</a><a href="#/compiler">2. Create experience</a><a href="#/benchmarks">3. Benchmark</a><a href="#/research">4. Verify claims</a></nav>
  <div className="workbench-grid">
   <aside className="workbench-rail panel-dark"><div className="panel-title"><span>YOUR TEST</span><b>EDITABLE</b></div>
    <label>Simulated device<select value={work.deviceId} onChange={e=>work.setDeviceId(e.target.value)}>{devices.map(d=><option value={d.id} key={d.id}>{d.name}{d.kind==='research'?' — research only':''}</option>)}</select><small className="field-help">Only the OpenLens Optical Twin executes. Hardware profiles are evidence records.</small></label>
    {device.kind==='research'&&<div className="integrity-callout"><strong>THIS PROFILE CANNOT RUN</strong><p>No OpenLens hardware adapter exists. Switch to the Optical Twin while retaining this experience.</p><button onClick={()=>work.setDeviceId('openlens-twin')}>Use Optical Twin now</button></div>}
    <label>Experience<select value={work.experience.id} onChange={e=>work.setExperience(experiencePresets.find(p=>p.id===e.target.value)??work.experience)}>{experiencePresets.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}{!experiencePresets.some(p=>p.id===work.experience.id)&&<option value={work.experience.id}>{work.experience.name} — custom</option>}</select><small className="field-help">{work.experience.prompt}</small></label>
    <div className="control-pair"><label>Repeatable seed<input type="number" value={work.config.seed} min="0" onChange={e=>update('seed',Number(e.target.value))}/></label><label>Battery %<input type="number" value={work.config.battery} min="0" max="100" onChange={e=>update('battery',Number(e.target.value))}/></label></div>
    <label>Input fixture<select value={work.config.fixture} onChange={e=>update('fixture',e.target.value as SimulationConfig['fixture'])}><option value="street-sign">Street sign: SALIDA</option><option value="conversation">Conversation phrase</option><option value="museum-label">Museum label</option></select></label>
    <label>Injected failure<select value={work.config.failureMode} onChange={e=>update('failureMode',e.target.value as FailureMode)}><option value="none">No injected failure</option><option value="permission">Permission denied</option><option value="disconnect">Output bridge disconnect</option><option value="timeout">Processing timeout</option><option value="low-battery">Critical battery</option><option value="network-loss">Network loss</option><option value="model-unavailable">Model unavailable</option></select></label>
    <button className="button primary full run-button" disabled={device.kind==='research'} onClick={runScenario}>{work.run?'Run again':'Run this scenario'} <span>→</span></button>
   </aside>
   <section className="optical-console"><header><div><span className="live-dot"/>LIVE TWIN VIEW / {device.name.toUpperCase()}</div><span>PLAN {plan.fingerprint}</span></header><div className={`optical-view ${work.run?.status??''}`}><div className="lab-glasses"><Glasses compact/></div>{fov&&device.capabilities.display.physical==='present'?<div className="fov-frame"><i/><span>{fov.value}° H-FOV</span><small>{fov.status.toUpperCase()}</small></div>:<div className="no-display">NO DISPLAY PLANE<br/><small>This profile would need audio or companion output.</small></div>}<div className="lab-hud"><span>{work.experience.task.toUpperCase()} / {work.config.fixture.replace('-',' ').toUpperCase()}</span><strong aria-live="polite">{work.run?.output??'Press “Run this scenario”'}</strong><small>{work.run?`${work.run.status.toUpperCase()} · ${work.run.totalMs} MS · SEED ${work.run.seed}`:'YOUR RESULT WILL APPEAR HERE'}</small></div><div className="view-meta"><span>{device.integrationStatus.toUpperCase()}</span><span>{work.experience.privacy.replace('-',' ').toUpperCase()}</span></div></div><div className="compile-strip">{plan.steps.map((step,index)=><div key={step.id}><span>{index+1}. {step.stage}</span><strong>{step.route}</strong></div>)}<b className={`compatibility ${plan.compatibility}`}>{plan.compatibility}</b></div></section>
   <aside className="inspector panel-dark"><div className="panel-title"><span>WHAT WILL HAPPEN</span><b>PLAN</b></div>{plan.steps.map((step,index)=><div className="plain-step" key={step.id}><span>{index+1}</span><div><strong>{step.label}</strong><p>{step.reason}</p></div></div>)}<button className="button ghost full" onClick={()=>setAiOpen(v=>!v)}>{aiOpen?'Close local OCR':'Try real local OCR'}</button></aside>
  </div>
  {work.run&&<section className={`outcome-card ${work.run.status}`}><div><p className="eyebrow">RUN OUTCOME</p><h2>{work.run.status==='success'?'The experience completed.':work.run.status==='failed'?'The scenario exposed a failure.':'This device cannot execute the plan.'}</h2><p>{work.run.status==='success'?`The ${work.experience.task} flow produced “${work.run.output}” in ${work.run.totalMs} simulated milliseconds.`:`The run stopped at ${work.run.trace.at(-1)?.stage}: ${work.run.trace.at(-1)?.message}`}</p></div><div><span>{work.run.trace.length}</span><small>TRACE SPANS</small></div><div><span>{work.run.totalMs}</span><small>SIMULATED MS</small></div><a className="button" href="#/benchmarks">Benchmark this setup →</a></section>}
  {work.run?<TraceViewer run={work.run}/>:<section className="trace-empty"><span>AFTER YOU RUN</span><p>A trace will show input, processing, output, duration, route, metadata, and the exact failure point.</p></section>}
  {work.runHistory.length>1&&<section className="run-history"><header><p className="eyebrow">RECENT RUNS</p><h2>Compare what your changes caused.</h2></header>{work.runHistory.map(item=><div key={item.id}><span className={item.status}>{item.status}</span><strong>{item.config.fixture.replace('-',' ')} / {item.config.failureMode}</strong><small>{item.totalMs} ms · seed {item.seed}</small></div>)}</section>}
  {aiOpen&&<section className="ai-drawer"><header><div><p className="eyebrow">REAL LOCAL SIGNAL</p><h2>Read an image without uploading it.</h2><p>For prototypers checking a real camera or image input. OCR runs in your browser and remains separate from simulated timing.</p></div><button className="icon-button" onClick={()=>setAiOpen(false)}>×</button></header><Suspense fallback={<p>Loading the OCR tool…</p>}><LocalAI/></Suspense></section>}
 </Page>;
}
