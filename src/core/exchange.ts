import type { BenchmarkResult, ExperienceDefinition, SimulationConfig } from './types';
import { validateExperience } from './experience';
import { validateSimulationConfig } from './simulation';
import { compileExperience } from './compiler';
import { benchmark } from './benchmark';
import { getDevice } from '../data/devices';

export interface ExperimentFile { format:'openlens-experiment'; version:1; engineVersion:'1.0.0'; mode:'simulation'; deviceId:string; experience:ExperienceDefinition; config:SimulationConfig; trials:number; result:BenchmarkResult }
export function exportExperiment(result: BenchmarkResult): string {
  const data: ExperimentFile = {format:'openlens-experiment',version:1,engineVersion:'1.0.0',mode:'simulation',deviceId:result.plan.deviceId,experience:result.plan.experience,config:result.config,trials:result.trials,result};
  return JSON.stringify(data,null,2);
}
/** Import only validated local simulation artifacts. Recompute every raw run to reject altered claims. */
export function importExperiment(json: string): ExperimentFile {
  if (json.length>5_000_000) throw new Error('Experiment exceeds the 5 MB import limit.');
  let value: unknown;
  try { value=JSON.parse(json); } catch { throw new Error('File is not valid JSON.'); }
  if (!value || typeof value!=='object') throw new Error('Experiment must be an object.');
  const d = value as Record<string,unknown>;
  if (d.format!=='openlens-experiment' || d.version!==1 || d.engineVersion!=='1.0.0' || d.mode!=='simulation' || typeof d.deviceId!=='string') throw new Error('Unsupported experiment format or engine version.');
  const experience=validateExperience(d.experience);
  const config=validateSimulationConfig(d.config);
  if (typeof d.trials!=='number') throw new Error('Missing trial count.');
  const plan=compileExperience(experience,getDevice(d.deviceId));
  const result=benchmark(plan,config,d.trials);
  // Property order is irrelevant, but all keys, types and values must match the deterministic replay.
  const canonical=(x:unknown):string => {
    if (Array.isArray(x)) return `[${x.map(canonical).join(',')}]`;
    if (x && typeof x==='object') return `{${Object.keys(x).sort().map(k=>`${JSON.stringify(k)}:${canonical((x as Record<string,unknown>)[k])}`).join(',')}}`;
    return JSON.stringify(x);
  };
  if (canonical(d.result)!==canonical(result)) throw new Error('Result does not match deterministic replay. The file was modified or uses a different device catalog.');
  return {format:'openlens-experiment',version:1,engineVersion:'1.0.0',mode:'simulation',deviceId:d.deviceId,experience,config,trials:d.trials,result};
}

export function exportRunsCsv(result: BenchmarkResult): string {
  return ['trial,device_id,seed,status,simulated_total_ms',...result.runs.map((run,i)=>`${i+1},${run.deviceId},${run.seed},${run.status},${run.totalMs}`)].join('\n');
}
