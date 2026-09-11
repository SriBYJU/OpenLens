import {describe,expect,it} from 'vitest';
import {benchmark,benchmarkFacets,buildAdapterStarter,compileExperience,defaultSimulationConfig,evaluateAdapterBundle,experiencePresets,getDevice,simulate} from '../src/core';

describe('expanded scenario engine',()=>{
 it.each([
  ['document-reader','document-page','A document states'],
  ['object-finder','object-shelf','Red city bicycle'],
  ['hands-free-assistant','street-sign','40 meters ahead'],
  ['adapter-debugger','debug-console','First fault'],
 ] as const)('executes %s against its authored fixture',(experienceId,fixture,expected)=>{
  const experience=experiencePresets.find(item=>item.id===experienceId)!;
  const run=simulate(compileExperience(experience,getDevice('openlens-twin')),{...defaultSimulationConfig,fixture});
  expect(run).toMatchObject({status:'success'});
  expect(run.output).toContain(expected);
 });
});

describe('transparent benchmark families',()=>{
 it('scores only evidence available in the suite',()=>{
  const plan=compileExperience(experiencePresets[0],getDevice('openlens-twin'));
  const facets=benchmarkFacets(benchmark(plan,defaultSimulationConfig,8));
  expect(facets).toHaveLength(7);
  expect(facets.find(item=>item.family==='AI pipeline')?.score).toBeTypeOf('number');
  expect(facets.find(item=>item.family==='Camera')?.score).toBeTypeOf('number');
  expect(facets.find(item=>item.family==='Microphone')?.score).toBeNull();
  expect(facets.find(item=>item.family==='Battery')?.score).toBeNull();
  expect(facets.find(item=>item.family==='Usability')?.kind).toBe('not collected');
 });
});

describe('adapter conformance probes',()=>{
 it('passes the generated bundle and catches every deliberate mutation',()=>{
  const input={deviceName:'Aurora One',deviceId:'aurora-one',capabilities:['camera','display'] as const};
  const normalized={...input,capabilities:[...input.capabilities]};
  const files=buildAdapterStarter(normalized);
  expect(evaluateAdapterBundle(files,normalized,'clean')).toMatchObject({passed:8,total:8});
  for(const probe of ['promoted-status','identity-drift','missing-failure-case'] as const){
   const report=evaluateAdapterBundle(files,normalized,probe);
   expect(report.passed,probe).toBeLessThan(report.total);
  }
 });
});
