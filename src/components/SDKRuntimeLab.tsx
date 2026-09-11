import {useMemo,useState} from 'react';
import {compileExperience,defaultSimulationConfig,DigitalTwinAdapter,experiencePresets,getDevice} from '../core';
import {createOpenLens,OPENLENS_SDK_VERSION,type OpenLensSDK} from '../sdk';

type Command='capabilities'|'ai'|'execute'|'benchmark'|'failure';
type ConsoleResult={label:string;value:unknown};
const snippets:Record<Command,string>={
 capabilities:`const openlens = createOpenLens(adapter)\n\nawait openlens.device.connect()\nopenlens.camera.require()\nconsole.log(openlens.device.state)\nawait openlens.device.disconnect()`,
 ai:`const decision = openlens.ai.route({\n  task: 'ocr', privacy: 'local-only',\n  priority: 'latency', cost: 'zero-only'\n}, browserRuntime)`,
 execute:`await openlens.device.connect()\nconst run = await openlens.device.execute(\n  compiledPlan, simulationConfig\n)\nawait openlens.device.disconnect()`,
 benchmark:`await openlens.device.connect()\nconst report = await openlens.benchmark.run(\n  compiledPlan, simulationConfig, 5\n)\nawait openlens.device.disconnect()`,
 failure:`await openlens.device.connect()\nconst run = await openlens.device.execute(\n  compiledPlan, {...config, failureMode: 'timeout'}\n)\nawait openlens.device.disconnect()`,
};
const labels:Record<Command,string>={capabilities:'Inspect capability gates',ai:'Route a local AI task',execute:'Execute one plan',benchmark:'Benchmark five trials',failure:'Inject a timeout'};
const save=(value:ConsoleResult)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='openlens-sdk-console.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

const browserRuntime=()=>({localOcr:typeof Worker!=='undefined'&&typeof WebAssembly!=='undefined',localVoice:'speechSynthesis'in window,browserSpeechRecognition:'SpeechRecognition'in window||'webkitSpeechRecognition'in window,webGpu:'gpu'in navigator,localVisionModel:false,advancedProvider:false});

export default function SDKRuntimeLab(){
 const [command,setCommand]=useState<Command>('capabilities');
 const [phase,setPhase]=useState<'ready'|'running'|'complete'|'error'>('ready');
 const [events,setEvents]=useState<string[]>(['Runtime loaded. No adapter connection is open.']);
 const [result,setResult]=useState<ConsoleResult|null>(null);
 const device=useMemo(()=>getDevice('openlens-twin'),[]);
 const plan=useMemo(()=>compileExperience(experiencePresets[0],device),[device]);
 const run=async()=>{
  setPhase('running');setResult(null);setEvents(['Created a fresh SDK runtime.']);
  const openlens=createOpenLens(new DigitalTwinAdapter(device));
  const push=(entry:string)=>setEvents(current=>[...current,entry]);
  try{
   let next:ConsoleResult;
   if(command==='ai'){
    const decision=openlens.ai.route({task:'ocr',privacy:'local-only',priority:'latency',cost:'zero-only'},browserRuntime());
    push(`AI router returned ${decision.status}: ${decision.route}.`);next={label:'AI route decision',value:decision};
   }else{
    await openlens.device.connect();push(`Connected ${openlens.device.manifest.name}.`);
    if(command==='capabilities'){
     openlens.camera.require();push('Camera gate passed from the adapter manifest.');
     next={label:'Capability surface',value:surfaceSnapshot(openlens)};
    }else if(command==='benchmark'){
     const report=await openlens.benchmark.run(plan,defaultSimulationConfig,5);push(`Retained ${report.trials} trial outcomes; ${report.successes} succeeded.`);
     next={label:'Adapter benchmark',value:{kind:report.kind,boundary:report.boundary,trials:report.trials,successes:report.successes,failures:report.failures,successRate:report.successRate,meanMs:report.statistics.mean,seeds:report.results.map(item=>item.seed),disclosure:report.disclosure}};
    }else{
     const config=command==='failure'?{...defaultSimulationConfig,failureMode:'timeout' as const}:defaultSimulationConfig;
     const executed=await openlens.device.execute(plan,config);push(`Execution completed with ${executed.status}; ${executed.trace.length} trace events retained.`);
     next={label:command==='failure'?'Injected failure result':'Execution result',value:{status:executed.status,totalMs:executed.totalMs,output:executed.output,trace:executed.trace.map(event=>({stage:event.stage,status:event.status,message:event.message,durationMs:event.durationMs}))}};
    }
    await openlens.device.disconnect();push('Disconnected cleanly.');
   }
   setResult(next);setPhase('complete');
  }catch(error){setResult({label:'SDK error',value:{error:error instanceof Error?error.message:String(error)}});setPhase('error');}
 };
 return <section className="sdk-lab" aria-labelledby="sdk-heading">
  <header><div><p className="eyebrow">OPENLENS SDK / EXECUTABLE SOURCE RUNTIME</p><h2 id="sdk-heading">One boundary.<br/><em>Seven working surfaces.</em></h2></div><div className="sdk-version builder-state"><span>SDK</span><strong>v{OPENLENS_SDK_VERSION}</strong><span>IN-REPOSITORY · UNPUBLISHED</span></div></header>
  <div className="sdk-console">
   <nav aria-label="OpenLens SDK surfaces">{['device','ai','camera','audio','display','sensors','benchmark'].map((name,index)=><div key={name}><b>{String(index+1).padStart(2,'0')}</b><code>openlens.{name}</code><i>{name==='device'?'LIFECYCLE':name==='benchmark'?'ASYNC RUNNER':'CAPABILITY GATE'}</i></div>)}</nav>
   <div className="sdk-code"><label>Executable example<select aria-label="SDK command" value={command} onChange={event=>{setCommand(event.target.value as Command);setPhase('ready');setResult(null);setEvents(['Command changed. Runtime is ready.'])}}>{Object.entries(labels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><pre tabIndex={0}><code>{snippets[command]}</code></pre><div className="sdk-actions"><button className="button primary" onClick={()=>void run()} disabled={phase==='running'}>{phase==='running'?'Running…':'Run SDK example ↗'}</button>{result&&<button className="button" onClick={()=>save(result)}>Download result JSON</button>}</div></div>
   <div className="sdk-output"><div className="sdk-output-head"><span>RUNTIME TRACE</span><b data-phase={phase}>{phase}</b></div><ol aria-live="polite">{events.map((event,index)=><li key={`${index}-${event}`}><span>{String(index+1).padStart(2,'0')}</span>{event}</li>)}</ol><pre tabIndex={0}>{result?JSON.stringify(result.value,null,2):'// Execute the selected command.\n// Results stay in this browser.'}</pre></div>
  </div>
  <footer className="api-strip"><div><p><strong>What this proves · </strong>The SDK is compiled with the site and the console calls its real methods. The adapter is the deterministic Optical Twin; this is not a physical-device session.</p></div><a className="button" href="https://github.com/SriBYJU/OpenLens/blob/main/src/sdk/index.ts" target="_blank" rel="noreferrer">Inspect SDK source ↗</a></footer>
 </section>;
}

function surfaceSnapshot(openlens:OpenLensSDK){return{state:openlens.device.state,adapter:openlens.device.manifest.id,camera:openlens.camera.available,audioInput:openlens.audio.input.available,audioOutput:openlens.audio.output.available,display:openlens.display.available,imu:openlens.sensors.imu.available,source:'adapter-manifest'}}
