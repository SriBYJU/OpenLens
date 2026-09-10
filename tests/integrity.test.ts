import {expect,it} from 'vitest';
import {benchmark,compileExperience,defaultSimulationConfig,experiencePresets,getDevice,importArtifact,importRun,simulate} from '../src/core';
const run=()=>simulate(compileExperience(experiencePresets[0],getDevice('openlens-twin')),defaultSimulationConfig);
it.each(['trace','deviceSnapshot','versions','plan'] as const)('rejects modified %s even when totals are unchanged',field=>{
 const artifact=run();
 if(field==='trace')artifact.trace[0].message='Forged';
 if(field==='deviceSnapshot')artifact.deviceSnapshot.name='Forged';
 if(field==='versions')artifact.versions={...artifact.versions,engine:'99'};
 if(field==='plan')artifact.plan.steps[0].route='adapter';
 expect(()=>importRun(JSON.stringify(artifact))).toThrow();
});
it('accepts reordered top-level JSON keys',()=>{const artifact=run();expect(importRun(JSON.stringify(Object.fromEntries(Object.entries(artifact).reverse())))).toEqual(artifact)});
it('translates each fixture rather than returning one canned word',()=>{
 const plan=compileExperience({...experiencePresets[0],language:'French'},getDevice('openlens-twin'));
 expect(simulate(plan,defaultSimulationConfig).output).toBe('SORTIE');
 expect(simulate(plan,{...defaultSimulationConfig,fixture:'museum-label'}).output).toBe('Instruments optiques, 1847');
});
it('fails explicitly when a requested fixture translation is unavailable',()=>{
 const plan=compileExperience({...experiencePresets[0],language:'Japanese'},getDevice('openlens-twin'));
 expect(simulate(plan,defaultSimulationConfig)).toMatchObject({status:'failed',output:null});
});
it('reopens a full benchmark including failed samples',()=>{
 const suite=benchmark(run().plan,{...defaultSimulationConfig,failureRate:.5},20);
 expect(suite.failures).toBeGreaterThan(0);
 expect(importArtifact(JSON.stringify(suite))).toEqual(suite);
});
it.each(['statistics','sample','trials'] as const)('rejects a forged benchmark %s',field=>{
 const suite=benchmark(run().plan,defaultSimulationConfig,3);
 if(field==='statistics')suite.statistics.mean=0;
 if(field==='sample')suite.runs[1].trace[0].message='Forged';
 if(field==='trials')suite.trials=501;
 expect(()=>importArtifact(JSON.stringify(suite))).toThrow();
});
