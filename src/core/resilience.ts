import {simulate} from './simulation';
import type {CompiledPlan,RunResult,SimulationConfig,TraceEvent} from './types';

export type ResilienceScenarioId='baseline'|'degraded-network'|'permission-denied'|'critical-battery'|'network-loss'|'timeout'|'disconnect'|'model-unavailable';

export interface ResilienceScenarioResult{
 id:ResilienceScenarioId;
 label:string;
 condition:string;
 run:RunResult;
 failure:TraceEvent|null;
}

export interface ResilienceMatrixResult{
 version:1;
 id:string;
 createdAt:string;
 planFingerprint:string;
 seed:number;
 methodology:string;
 scenarios:ResilienceScenarioResult[];
 successes:number;
 failures:number;
 blocked:number;
}

export interface TraceDiffRow{
 index:number;
 left:TraceEvent|null;
 right:TraceEvent|null;
 changed:boolean;
 durationDeltaMs:number|null;
}

const scenarios:Array<{id:ResilienceScenarioId;label:string;condition:string;patch:Partial<SimulationConfig>}>= [
 {id:'baseline',label:'Baseline',condition:'Nominal battery, network, permissions, and no injected failure.',patch:{}},
 {id:'degraded-network',label:'Degraded link',condition:'Network stays available but bridge overhead is introduced.',patch:{network:'degraded'}},
 {id:'permission-denied',label:'Permission denied',condition:'The required sensor permission is denied before acquisition.',patch:{failureMode:'permission',permission:'denied'}},
 {id:'critical-battery',label:'Critical battery',condition:'The Optical Twin begins below the safe battery threshold.',patch:{failureMode:'low-battery',battery:3}},
 {id:'network-loss',label:'Network loss',condition:'The network route disappears during the scenario.',patch:{failureMode:'network-loss',network:'offline'}},
 {id:'timeout',label:'Processing timeout',condition:'The processing stage exceeds its deadline.',patch:{failureMode:'timeout'}},
 {id:'disconnect',label:'Output disconnect',condition:'The output bridge disconnects after processing.',patch:{failureMode:'disconnect'}},
 {id:'model-unavailable',label:'Model unavailable',condition:'The local processing model is unavailable.',patch:{failureMode:'model-unavailable'}},
];

function canonicalBase(base:SimulationConfig):SimulationConfig{
 return {...base,failureRate:0,failureMode:'none',battery:84,network:'online',permission:'granted'};
}

export function runResilienceMatrix(plan:CompiledPlan,base:SimulationConfig):ResilienceMatrixResult{
 const normalized=canonicalBase(base);
 const results=scenarios.map(scenario=>{
  const config={...normalized,...scenario.patch};
  const run=simulate(plan,config);
  return {id:scenario.id,label:scenario.label,condition:scenario.condition,run,failure:run.trace.find(event=>event.status==='failure')??null};
 });
 return {
  version:1,
  id:`matrix-${plan.fingerprint}-${normalized.seed}`,
  createdAt:normalized.startTime,
  planFingerprint:plan.fingerprint,
  seed:normalized.seed,
  methodology:'All scenarios reuse one compiled plan and one deterministic seed. Only the declared condition changes. Failure-rate randomness is disabled so scenario differences are attributable to the injected condition.',
  scenarios:results,
  successes:results.filter(item=>item.run.status==='success').length,
  failures:results.filter(item=>item.run.status==='failed').length,
  blocked:results.filter(item=>item.run.status==='blocked').length,
 };
}

export function diffTraces(left:RunResult,right:RunResult):TraceDiffRow[]{
 const length=Math.max(left.trace.length,right.trace.length);
 return Array.from({length},(_,index)=>{
  const a=left.trace[index]??null;
  const b=right.trace[index]??null;
  const changed=!a||!b||a.stage!==b.stage||a.status!==b.status||a.message!==b.message||a.durationMs!==b.durationMs||a.route!==b.route;
  return {index,left:a,right:b,changed,durationDeltaMs:a&&b?b.durationMs-a.durationMs:null};
 });
}

export function exportResilienceMatrix(matrix:ResilienceMatrixResult){return JSON.stringify(matrix,null,2)}
