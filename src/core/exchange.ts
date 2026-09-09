import type {BenchmarkResult,RunResult} from './types';
import {simulate} from './simulation';
import {compileExperience} from './compiler';
import {getDevice} from '../data/devices';

export function exportArtifact(value:RunResult|BenchmarkResult){return JSON.stringify(value,null,2)}
// Compare JSON values independent of object key ordering, while preserving arrays.
const canonical=(value:unknown):string=>{
 if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
 if(value&&typeof value==='object')return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
 return JSON.stringify(value);
};
export function importRun(text:string):RunResult{
 if(text.length>2_000_000)throw new Error('Run artifact exceeds the 2 MB limit.');
 const value=JSON.parse(text) as RunResult;
 if(!value||value.version!==2||value.versions?.schema!==2||!value.deviceSnapshot||!value.plan||!Array.isArray(value.trace))throw new Error('Unsupported or invalid OpenLens run artifact.');
 const plan=compileExperience(value.plan.experience,getDevice(value.plan.deviceId));
 if(canonical(plan)!==canonical(value.plan))throw new Error('Artifact plan does not match the current compiler and catalog.');
 const replay=simulate(plan,value.config);
 if(canonical(replay)!==canonical(value))throw new Error('Artifact replay does not match its recorded result, trace, snapshots, or versions.');
 return replay;
}
export function benchmarkToCsv(result:BenchmarkResult){return ['trial,run_id,status,total_ms,seed',...result.runs.map((run,index)=>`${index+1},${run.id},${run.status},${run.totalMs},${run.seed}`)].join('\n')}
