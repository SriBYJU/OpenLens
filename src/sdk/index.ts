import {planAIRoute,type AIRouteDecision,type AIRouteRequest,type AIRuntimeCapabilities} from '../core/ai-router';
import {statistics} from '../core/benchmark';
import type {AdapterManifest,Capability,CompiledPlan,DeviceAdapter,RunResult,SimulationConfig,Statistics} from '../core/types';

export const OPENLENS_SDK_VERSION='0.1.0';
export type SDKConnectionState='disconnected'|'connecting'|'connected'|'disconnecting';

export interface CapabilitySurface {
 capability:Capability;
 available:boolean;
 source:'adapter-manifest';
 require():void;
}
export interface SDKBenchmarkTrial {index:number;seed:number;outcome:RunResult['status']|'error';durationMs:number|null;error:string|null;run:RunResult|null}
export interface SDKBenchmarkReport {
 kind:'openlens-sdk-benchmark';
 sdkVersion:string;
 createdAt:string;
 boundary:'adapter-runtime';
 adapter:AdapterManifest;
 trials:number;
 successes:number;
 failures:number;
 successRate:number;
 statistics:Statistics;
 results:SDKBenchmarkTrial[];
 disclosure:string;
}
export interface OpenLensSDK {
 version:string;
 device:{readonly manifest:AdapterManifest;readonly state:SDKConnectionState;connect():Promise<void>;disconnect():Promise<void>;execute(plan:CompiledPlan,config:SimulationConfig):Promise<RunResult>};
 ai:{route(request:AIRouteRequest,runtime:AIRuntimeCapabilities):AIRouteDecision};
 camera:CapabilitySurface;
 audio:{input:CapabilitySurface;output:CapabilitySurface};
 display:CapabilitySurface;
 sensors:{imu:CapabilitySurface};
 benchmark:{run(plan:CompiledPlan,config:SimulationConfig,trials?:number):Promise<SDKBenchmarkReport>};
}

const message=(error:unknown)=>error instanceof Error?error.message:String(error);

export function createOpenLens(adapter:DeviceAdapter):OpenLensSDK{
 let state:SDKConnectionState='disconnected';
 const surface=(capability:Capability):CapabilitySurface=>({
  capability,
  available:adapter.manifest.capabilities.includes(capability),
  source:'adapter-manifest',
  require(){if(!adapter.manifest.capabilities.includes(capability))throw new Error(`${adapter.manifest.name} does not expose ${capability}.`);},
 });
 const connect=async()=>{if(state==='connected')return;if(state!=='disconnected')throw new Error(`Cannot connect while the adapter is ${state}.`);state='connecting';try{await adapter.connect();state='connected'}catch(error){state='disconnected';throw error}};
 const disconnect=async()=>{if(state==='disconnected')return;if(state!=='connected')throw new Error(`Cannot disconnect while the adapter is ${state}.`);state='disconnecting';try{await adapter.disconnect()}finally{state='disconnected'}};
 const execute=async(plan:CompiledPlan,config:SimulationConfig)=>{if(state!=='connected')throw new Error('OpenLens SDK device is not connected.');return adapter.execute(plan,config)};
 const runBenchmark=async(plan:CompiledPlan,config:SimulationConfig,trials=5):Promise<SDKBenchmarkReport>=>{
  if(!Number.isSafeInteger(trials)||trials<1||trials>100)throw new Error('SDK benchmark trials must be between 1 and 100.');
  if(state!=='connected')throw new Error('OpenLens SDK device is not connected.');
  const results:SDKBenchmarkTrial[]=[];
  for(let index=0;index<trials;index++){
   const seeded={...config,seed:(config.seed+index)>>>0};
   try{const run=await execute(plan,seeded);results.push({index:index+1,seed:seeded.seed,outcome:run.status,durationMs:run.totalMs,error:null,run})}
   catch(error){results.push({index:index+1,seed:seeded.seed,outcome:'error',durationMs:null,error:message(error),run:null})}
  }
  const successful=results.filter(result=>result.outcome==='success');
  return{kind:'openlens-sdk-benchmark',sdkVersion:OPENLENS_SDK_VERSION,createdAt:new Date().toISOString(),boundary:'adapter-runtime',adapter:{...adapter.manifest,capabilities:[...adapter.manifest.capabilities]},trials,successes:successful.length,failures:trials-successful.length,successRate:successful.length/trials,statistics:statistics(successful.flatMap(result=>result.durationMs===null?[]:[result.durationMs])),results,disclosure:`Executed through ${adapter.manifest.name}. ${adapter.manifest.disclosure}`};
 };
 return{
  version:OPENLENS_SDK_VERSION,
  device:{manifest:adapter.manifest,get state(){return state},connect,disconnect,execute},
  ai:{route:planAIRoute},
  camera:surface('camera'),
  audio:{input:surface('microphone'),output:surface('audio')},
  display:surface('display'),
  sensors:{imu:surface('imu')},
  benchmark:{run:runBenchmark},
 };
}
