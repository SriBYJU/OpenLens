import {useWorkbench} from '../app/workbench';
import {assessEnvironment,defaultEnvironment,environmentPresets,type EnvironmentConfig,type SimulationConfig} from '../core';
import ScenarioCapsulePanel from './ScenarioCapsulePanel';

export default function SimulationControls(){
 const work=useWorkbench();
 const environment=work.config.environment??defaultEnvironment;
 const assessment=assessEnvironment(work.experience.input,work.plan.steps.at(-1)?.capability,environment);
 const change=<K extends keyof SimulationConfig>(key:K,value:SimulationConfig[K])=>work.setConfig({...work.config,[key]:value});
 const changeEnvironment=<K extends keyof EnvironmentConfig>(key:K,value:EnvironmentConfig[K])=>change('environment',{...environment,[key]:value});
 return <>
  <section className="environment-lab" aria-labelledby="environment-heading">
   <header><div><p className="eyebrow">SYNTHETIC ENVIRONMENT / LIVE MODEL</p><h2 id="environment-heading">Make the world push back.</h2></div><p>Light, head motion and noise change acquisition quality, latency, trace metadata and failure behavior. These are transparent assumptions for product testing, not measurements of a physical pair of glasses.</p></header>
   <div className="environment-presets">{environmentPresets.map(preset=><button key={preset.id} className={JSON.stringify(environment)===JSON.stringify(preset.environment)?'active':''} onClick={()=>change('environment',{...preset.environment})}><strong>{preset.label}</strong><span>{preset.description}</span></button>)}</div>
   <div className="environment-console">
    <div className={`signal-score ${assessment.grade}`}><span>MODELED SIGNAL QUALITY · {work.experience.input.toUpperCase()} → {(work.plan.steps.at(-1)?.capability??'OUTPUT').toUpperCase()}</span><strong>{assessment.score}<small>/100</small></strong><i><b style={{width:`${assessment.score}%`}}/></i><em>{assessment.grade}</em></div>
    <div className="environment-controls">
     <label>Illumination <b>{environment.illuminationLux.toLocaleString()} lux</b><input aria-label="Illumination in lux" type="range" min="0" max="50000" step="10" value={environment.illuminationLux} onChange={event=>changeEnvironment('illuminationLux',Number(event.target.value))}/></label>
     <label>Head motion <b>{environment.headMotionDps}°/s</b><input aria-label="Head motion in degrees per second" type="range" min="0" max="160" step="1" value={environment.headMotionDps} onChange={event=>changeEnvironment('headMotionDps',Number(event.target.value))}/></label>
     <label>Ambient noise <b>{environment.ambientNoiseDb} dB</b><input aria-label="Ambient noise in decibels" type="range" min="20" max="100" step="1" value={environment.ambientNoiseDb} onChange={event=>changeEnvironment('ambientNoiseDb',Number(event.target.value))}/></label>
    </div>
    <div className="environment-effects"><span>ACTIVE EFFECTS</span>{assessment.factors.map(factor=><b key={factor}>{factor}</b>)}<small>+{assessment.inputPenaltyMs} ms input · +{assessment.processPenaltyMs} ms process · +{assessment.outputPenaltyMs} ms output before seeded jitter</small></div>
   </div>
  </section>
  <details className="simulation-controls panel-dark"><summary>Advanced timing and reliability</summary><p>Set expected pipeline timings and reliability. These explicit assumptions feed every later run and benchmark.</p><div className="structured-controls">
   {(['inputMs','processMs','outputMs','bridgeMs'] as const).map((key,index)=><label key={key}>{['Input latency (ms)','Processing latency (ms)','Output latency (ms)','Bridge overhead (ms)'][index]}<input type="number" min="0" max="60000" value={work.config[key]} onChange={event=>change(key,Math.max(0,Math.min(60000,Number(event.target.value)||0)))}/></label>)}
   <label>Timing jitter (%)<input type="number" min="0" max="100" value={Math.round(work.config.jitter*100)} onChange={event=>change('jitter',Math.max(0,Math.min(100,Number(event.target.value)||0))/100)}/></label>
   <label>Processing failure probability (%)<input type="number" min="0" max="100" value={Math.round(work.config.failureRate*100)} onChange={event=>change('failureRate',Math.max(0,Math.min(100,Number(event.target.value)||0))/100)}/></label>
   <label>Network<select value={work.config.network} onChange={event=>change('network',event.target.value as SimulationConfig['network'])}><option value="online">Online</option><option value="degraded">Degraded</option><option value="offline">Offline</option></select></label>
   <label>Sensor permission<select value={work.config.permission} onChange={event=>change('permission',event.target.value as SimulationConfig['permission'])}><option value="granted">Granted</option><option value="denied">Denied</option></select></label>
   <label>Missing capability policy<select value={work.experience.allowCompanionFallback?'allow':'block'} onChange={event=>work.setExperience({...work.experience,allowCompanionFallback:event.target.value==='allow'})}><option value="allow">Allow explicit companion fallback</option><option value="block">Block unsupported experiences</option></select></label>
  </div><p>Translation uses authored fixtures in English, Spanish, French, German, and Italian. It is not a general translation model.</p></details>
  <ScenarioCapsulePanel/>
 </>;
}
