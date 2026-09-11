import {assessEnvironment,defaultEnvironment} from './environment';
import type {BenchmarkResult} from './types';

export type BenchmarkFamily='AI pipeline'|'Camera'|'Microphone'|'Battery'|'Connectivity'|'Developer experience'|'Usability';
export interface BenchmarkFacet{family:BenchmarkFamily;kind:'objective simulation'|'declared condition'|'not collected';raw:string;normalization:string;score:number|null;detail:string}

const clamp=(value:number)=>Math.max(0,Math.min(100,Math.round(value)));

export function benchmarkFacets(result:BenchmarkResult):BenchmarkFacet[]{
 const median=result.statistics.median;
 const environment=result.config.environment??defaultEnvironment;
 const output=result.plan.steps.at(-1)?.capability;
 const signal=assessEnvironment(result.plan.experience.input,output,environment);
 const signalFacet=(family:'Camera'|'Microphone',input:'camera'|'microphone'):BenchmarkFacet=>result.plan.experience.input===input?{
  family,kind:'objective simulation',raw:`${signal.score}/100 modeled signal · ${signal.factors.join(', ')}`,normalization:'The published synthetic environment model produces this value directly from light, motion, noise, input, and output.',score:signal.score,detail:'This is a simulator stress score. It is not camera-image or microphone-acoustic hardware measurement.'
 }:{family,kind:'not collected',raw:`Active experience uses ${result.plan.experience.input} input`,normalization:'No score is calculated for an unused sensor.',score:null,detail:`Run a ${input}-input experience to populate this family.`};
 return[
  {family:'AI pipeline',kind:'objective simulation',raw:median===null?'No successful latency samples':`${median} ms median across ${result.statistics.n} successful runs`,normalization:'0–250 ms = 100. 1,200 ms or more = 0. Values between use a linear scale.',score:median===null?null:clamp((1200-median)/9.5),detail:'Measures end-to-end simulator response time. Failed runs stay in reliability and are excluded from latency.'},
  signalFacet('Camera','camera'),
  signalFacet('Microphone','microphone'),
  {family:'Battery',kind:'declared condition',raw:`${result.config.battery}% start · 5% safety threshold`,normalization:'No endurance score. A starting condition and stop threshold cannot establish battery life.',score:null,detail:'Physical idle, camera, AI, and mixed-use drain require a measured hardware protocol.'},
  {family:'Connectivity',kind:'objective simulation',raw:`${result.successes}/${result.trials} completed · network ${result.config.network}`,normalization:'Score = completed runs ÷ all trials × 100. Injected and stochastic failures remain in the denominator.',score:clamp(result.successRate*100),detail:'Measures this simulated route under the declared link and failure settings.'},
  {family:'Developer experience',kind:'not collected',raw:'No structured developer observation in this artifact',normalization:'No score is calculated without protocol answers and evidence.',score:null,detail:'SDK access, documentation, examples, debugging, and platform support need a sourced review.'},
  {family:'Usability',kind:'not collected',raw:'No wearer study in this artifact',normalization:'No score is calculated from simulator behavior.',score:null,detail:'Comfort, controls, setup, and readability require a declared subjective study protocol.'},
 ];
}
