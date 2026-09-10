import {describe,expect,it} from 'vitest';
import {assessEnvironment,compileExperience,defaultEnvironment,defaultSimulationConfig,experiencePresets,getDevice,simulate,validateSimulationConfig} from '../src/core';

const plan=compileExperience(experiencePresets[0],getDevice('openlens-twin'));

describe('synthetic environment model',()=>{
 it('keeps nominal conditions clear and makes stress increase timing',()=>{
  expect(assessEnvironment('camera','display',defaultEnvironment)).toMatchObject({score:100,grade:'clear'});
  const baseline=simulate(plan,defaultSimulationConfig);
  const stressed=simulate(plan,{...defaultSimulationConfig,environment:{illuminationLux:8,headMotionDps:70,ambientNoiseDb:45}});
  expect(stressed.status).toBe('success');
  expect(stressed.totalMs).toBeGreaterThan(baseline.totalMs);
  expect(stressed.trace[0].metadata.signalQuality).toBeLessThan(70);
 });
 it('fails acquisition when declared conditions cross the synthetic threshold',()=>{
  const run=simulate(plan,{...defaultSimulationConfig,environment:{illuminationLux:0,headMotionDps:160,ambientNoiseDb:45}});
  expect(run.status).toBe('failed');
  expect(run.trace.at(-1)).toMatchObject({stage:'input',status:'failure'});
  expect(run.trace.at(-1)?.message).toMatch(/environment model/i);
 });
 it('applies noise to microphone input and validates physical ranges',()=>{
  const quiet=assessEnvironment('microphone','display',defaultEnvironment);
  const noisy=assessEnvironment('microphone','display',{...defaultEnvironment,ambientNoiseDb:90});
  expect(noisy.score).toBeLessThan(quiet.score);
  expect(()=>validateSimulationConfig({...defaultSimulationConfig,environment:{...defaultEnvironment,ambientNoiseDb:141}})).toThrow(/bounds/);
 });
});
