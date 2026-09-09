import {describe,it,expect} from 'vitest';
import { benchmark,calculateStatistics,compileExperience,defaultSimulationConfig,DigitalTwinAdapter,experiencePresets,exportExperiment,getDevice,importExperiment,parseExperience,simulate,validateExperience,validateSimulationConfig } from '../src/core';

const twin=getDevice('openlens-twin');
const experience=experiencePresets[0];
const plan=compileExperience(experience,twin);

describe('constrained authoring',()=>{
  it('recognizes input, task, target language and spoken output',()=>{
    expect(parseExperience('Translate speech from the microphone into French and speak aloud').experience).toMatchObject({task:'translate',input:'microphone',language:'French',output:'audio'});
  });
  it('rejects ambiguous, unsupported and negated instructions instead of inventing a draft',()=>{
    for (const prompt of ['Make something amazing','Translate and describe a sign','Do not use the camera to describe a scene','']) expect(parseExperience(prompt).experience).toBeNull();
    expect(parseExperience('Caption speech and show it').parser).toBe('rules-based');
  });
  it('validates structured task dependencies',()=>{
    expect(()=>validateExperience({...experience,task:'caption',input:'camera'})).toThrow('microphone');
    expect(()=>validateExperience({...experience,allowFallback:'true'})).toThrow();
  });
});

describe('capability-aware compilation',()=>{
  it('distinguishes absent hardware, bridge access, unknown access, and fallback policy',()=>{
    const adapted=compileExperience(experience,getDevice('xreal-air-2'));
    expect(adapted.compatibility).toBe('adapted');
    expect(adapted.steps[0]).toMatchObject({route:'companion'});
    expect(adapted.steps[0].reason).toContain('physically absent');
    expect(adapted.steps[2].route).toBe('bridge');
    const blocked=compileExperience({...experience,allowFallback:false},getDevice('xreal-air-2'));
    expect(blocked.compatibility).toBe('blocked');
    expect(simulate(blocked).status).toBe('blocked');
    expect(simulate(blocked).totalMs).toBe(0);
  });
  it('never turns present hardware with unknown access into native access',()=>{
    const caption={...experiencePresets[1],allowFallback:false};
    expect(compileExperience(caption,getDevice('xreal-air-2')).steps[0].route).toBe('blocked');
    expect(compileExperience(caption,getDevice('ray-ban-meta')).steps[0].route).toBe('bridge');
  });
});

describe('deterministic simulation and faults',()=>{
  it('replays identical seeds and timestamps without wall-clock dependencies',()=>{
    expect(simulate(plan)).toEqual(simulate(plan));
    const run=simulate(plan,{...defaultSimulationConfig,jitter:0});
    expect(run.totalMs).toBe(370);
    expect(run.trace.at(-1)?.timestamp).toBe('2026-09-08T12:00:00.370Z');
    expect(run.output).toContain('Fixture');
    expect(simulate(plan,{...defaultSimulationConfig,seed:43}).totalMs).not.toEqual(simulate(plan).totalMs);
  });
  it.each([['permission','input'],['timeout','process'],['disconnect','output']] as const)('injects %s failure in %s and stops downstream execution',(failureMode,stage)=>{
    const run=simulate(plan,{...defaultSimulationConfig,failureMode});
    expect(run.status).toBe('failed'); expect(run.output).toBeNull();
    expect(run.trace.at(-1)).toMatchObject({stage,status:'failure'});
    expect(run.trace.filter(e=>e.status==='failure')).toHaveLength(1);
  });
  it('validates every external simulation parameter',()=>{
    for (const config of [{jitter:NaN},{failureRate:2},{seed:-1},{inputMs:Infinity},{processMs:-1},{startTime:'yesterday'},{failureMode:'fake'}]) expect(()=>validateSimulationConfig({...defaultSimulationConfig,...config})).toThrow();
  });
  it('enforces adapter lifecycle and device match',async()=>{
    const adapter=new DigitalTwinAdapter(twin);
    await expect(adapter.execute(plan,defaultSimulationConfig)).rejects.toThrow('not connected');
    await adapter.connect(); await expect(adapter.execute(plan,defaultSimulationConfig)).resolves.toMatchObject({status:'success'});
    await expect(adapter.execute(compileExperience(experience,getDevice('brilliant-frame')),defaultSimulationConfig)).rejects.toThrow('does not match');
    await adapter.disconnect(); await expect(adapter.execute(plan,defaultSimulationConfig)).rejects.toThrow();
  });
});

describe('research statistics and artifacts',()=>{
  it('computes sample SD with n−1 and preserves raw sample order',()=>{
    const s=calculateStatistics([4,1,3,2]); expect(s).toMatchObject({n:4,mean:2.5,median:2.5,min:1,max:4,samples:[4,1,3,2]}); expect(s.sampleSd).toBeCloseTo(Math.sqrt(5/3));
    expect(calculateStatistics([7]).sampleSd).toBeNull(); expect(calculateStatistics([]).mean).toBeNull();
  });
  it('reports failures without pretending failed executions are successful latency samples',()=>{
    const result=benchmark(plan,{...defaultSimulationConfig,failureRate:1},5);
    expect(result).toMatchObject({successes:0,failures:5,successRate:0,statistics:{n:0,mean:null}}); expect(result.runs).toHaveLength(5);
  });
  it('runs independent reproducible trials and wraps 32-bit seeds',()=>{
    const result=benchmark(plan,{...defaultSimulationConfig,seed:4294967295},2);
    expect(result.runs.map(r=>r.seed)).toEqual([4294967295,0]);
    expect(result).toEqual(benchmark(plan,{...defaultSimulationConfig,seed:4294967295},2));
    expect(()=>benchmark(plan,defaultSimulationConfig,0)).toThrow();
    expect(()=>benchmark(plan,defaultSimulationConfig,501)).toThrow();
  });
  it('round-trips raw runs and rejects forged or unsupported imports',()=>{
    const result=benchmark(plan,defaultSimulationConfig,3);
    expect(importExperiment(exportExperiment(result)).result).toEqual(result);
    const edited=JSON.parse(exportExperiment(result)); edited.result.statistics.mean=1;
    expect(()=>importExperiment(JSON.stringify(edited))).toThrow('replay');
    edited.version=2; expect(()=>importExperiment(JSON.stringify(edited))).toThrow('Unsupported');
    expect(()=>importExperiment('{')).toThrow('JSON');
    expect(()=>importExperiment(' '.repeat(5_000_001))).toThrow('limit');
  });
});
