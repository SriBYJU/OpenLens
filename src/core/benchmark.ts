import type { BenchmarkResult, CompiledPlan, SimulationConfig, Statistics } from './types';
import { defaultSimulationConfig, simulate, validateSimulationConfig } from './simulation';

export function calculateStatistics(samples: number[]): Statistics {
  if (samples.some(n=>!Number.isFinite(n)||n<0)) throw new Error('Samples must be finite, nonnegative durations.');
  const n = samples.length;
  if (!n) return {n:0,mean:null,median:null,sampleSd:null,min:null,max:null,samples:[]};
  const sorted = [...samples].sort((a,b)=>a-b);
  const mean = samples.reduce((a,b)=>a+b,0)/n;
  return { n,mean,median:n%2 ? sorted[Math.floor(n/2)] : (sorted[n/2-1]+sorted[n/2])/2,sampleSd:n>1 ? Math.sqrt(samples.reduce((sum,x)=>sum+(x-mean)**2,0)/(n-1)) : null,min:sorted[0],max:sorted[n-1],samples:[...samples] };
}

export function benchmark(plan: CompiledPlan, configuration: SimulationConfig = defaultSimulationConfig, trials = 20): BenchmarkResult {
  if (!Number.isInteger(trials) || trials<1 || trials>500) throw new Error('Trial count must be an integer between 1 and 500.');
  const config = validateSimulationConfig(configuration);
  const runs = Array.from({length:trials},(_,i)=>simulate(plan,{...config,seed:(config.seed+i)>>>0}));
  const successful = runs.filter(r=>r.status==='success');
  return {version:1,mode:'simulation',plan:structuredClone(plan),config,trials,successes:successful.length,failures:trials-successful.length,successRate:successful.length/trials,statistics:calculateStatistics(successful.map(r=>r.totalMs)),runs,methodology:'Synthetic serial pipeline; independent illustrative stage parameters, uniform multiplicative jitter, Mulberry32 PRNG. Trial i uses (base seed + i) modulo 2^32. Latency statistics include successful runs only; failures remain in raw runs and success rate. Sample SD uses n−1 and is undefined for n<2. No measurements from physical devices or live inference.'};
}
