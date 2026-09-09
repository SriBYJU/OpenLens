import {experiencePresets,type FailureMode} from '../core';
import {useWorkbench} from '../app/workbench';

const failures:{id:FailureMode;label:string}[]=[
 {id:'none',label:'Normal run'},
 {id:'permission',label:'Permission denied'},
 {id:'disconnect',label:'Bridge disconnect'},
 {id:'timeout',label:'Processing timeout'},
];

export default function HomeSignalDemo(){
 const work=useWorkbench();
 const selected=experiencePresets.find(item=>item.id===work.experience.id)??experiencePresets[0];
 const choose=(id:string)=>{const experience=experiencePresets.find(item=>item.id===id);if(!experience)return;work.setDeviceId('openlens-twin');work.setExperience(experience)};
 const setFailure=(failureMode:FailureMode)=>work.setConfig({...work.config,failureMode,permission:failureMode==='permission'?'denied':'granted',network:'online'});
 const trace=work.run?.trace.filter(event=>event.stage!=='session')??[];
 return <section className="signal-demo" aria-labelledby="signal-demo-title">
  <header className="signal-demo-head"><div><p className="eyebrow">LIVE PROOF / DETERMINISTIC OPTICAL TWIN</p><h2 id="signal-demo-title">Don’t read the pitch.<br/><em>Run the signal.</em></h2></div><p>This is the same compiler and simulator used in Lens Lab. Pick an experience, inject a failure, and inspect the route. No account, cloud AI, or fake hardware connection.</p></header>
  <div className="signal-console">
   <aside className="signal-config">
    <div className="panel-title"><span>01 / EXPERIENCE</span><b>LOCAL STATE</b></div>
    <div className="signal-presets">{experiencePresets.map(item=><button type="button" className={selected.id===item.id?'active':''} onClick={()=>choose(item.id)} key={item.id}><span>{item.task}</span><strong>{item.name}</strong><small>{item.input} → {item.preferredOutputs.join(' / ')}</small></button>)}</div>
    <div className="panel-title signal-failure-title"><span>02 / FAILURE INJECTION</span><b>OPTIONAL</b></div>
    <div className="failure-chips">{failures.map(item=><button type="button" className={work.config.failureMode===item.id?'active':''} onClick={()=>setFailure(item.id)} key={item.id}>{item.label}</button>)}</div>
    <button className="button primary full signal-run" type="button" onClick={()=>work.runCurrent()}><span className="live-dot"/>Run deterministic scenario</button>
   </aside>
   <div className="signal-stage">
    <div className="signal-stage-top"><span>OPTICAL TWIN</span><span>SEED {work.config.seed}</span><span>{work.plan.compatibility.replaceAll('-',' ')}</span></div>
    <div className="signal-viewport"><div className="signal-reticle"/><div className="signal-scan"/><span className="fixture-tag">INPUT / {work.config.fixture.replaceAll('-',' ')}</span><div className="signal-output"><small>{work.run?'LAST RUN OUTPUT':'COMPILED PLAN'}</small><strong>{work.run?(work.run.output??work.run.trace.at(-1)?.message):selected.prompt}</strong></div></div>
    <div className="signal-plan">{work.plan.steps.map((step,index)=><article className={trace[index]?.status??''} key={step.id}><span>{String(index+1).padStart(2,'0')}</span><div><small>{step.stage} / {step.route}</small><strong>{step.label}</strong><p>{trace[index]?.message??step.reason}</p></div><i aria-hidden="true"/></article>)}</div>
    <div className="signal-artifact"><div><span>PLAN FINGERPRINT</span><code>{work.plan.fingerprint.slice(0,18)}…</code></div><div><span>RUN STATUS</span><strong className={work.run?.status??''}>{work.run?work.run.status.toUpperCase():'NOT RUN'}</strong></div><div><span>SIMULATED TIME</span><strong>{work.run?`${work.run.totalMs} ms`:'—'}</strong></div></div>
   </div>
  </div>
  <footer className="signal-demo-foot"><p><strong>What is real here?</strong> Compilation, deterministic routing, failure handling, artifact state and trace structure. Timing is explicitly simulated—not a physical-device measurement.</p><div className="button-row"><a className="button" href="#/lab">Open full Lens Lab</a><a className="text-link" href="#/methodology">Read the methodology</a></div></footer>
 </section>
}
