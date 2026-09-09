import {useWorkbench} from '../app/workbench';
import type {SimulationConfig} from '../core';

export default function SimulationControls(){
 const work=useWorkbench();
 const change=<K extends keyof SimulationConfig>(key:K,value:SimulationConfig[K])=>work.setConfig({...work.config,[key]:value});
 return <details className="simulation-controls panel-dark"><summary>Advanced simulation conditions</summary><p>Model your expected pipeline timings and reliability. These are explicit assumptions, used by every subsequent run and benchmark.</p><div className="structured-controls">
  {(['inputMs','processMs','outputMs','bridgeMs'] as const).map((key,index)=><label key={key}>{['Input latency (ms)','Processing latency (ms)','Output latency (ms)','Bridge overhead (ms)'][index]}<input type="number" min="0" max="60000" value={work.config[key]} onChange={e=>change(key,Math.max(0,Math.min(60000,Number(e.target.value)||0)))}/></label>)}
  <label>Timing jitter (%)<input type="number" min="0" max="100" value={Math.round(work.config.jitter*100)} onChange={e=>change('jitter',Math.max(0,Math.min(100,Number(e.target.value)||0))/100)}/></label>
  <label>Processing failure probability (%)<input type="number" min="0" max="100" value={Math.round(work.config.failureRate*100)} onChange={e=>change('failureRate',Math.max(0,Math.min(100,Number(e.target.value)||0))/100)}/></label>
  <label>Network<select value={work.config.network} onChange={e=>change('network',e.target.value as SimulationConfig['network'])}><option value="online">Online</option><option value="degraded">Degraded</option><option value="offline">Offline</option></select></label>
  <label>Sensor permission<select value={work.config.permission} onChange={e=>change('permission',e.target.value as SimulationConfig['permission'])}><option value="granted">Granted</option><option value="denied">Denied</option></select></label>
 </div><p>Translation uses authored fixtures in English, Spanish, French, German, and Italian. It is not a general translation model.</p></details>;
}
