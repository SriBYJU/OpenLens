import {expect,it} from 'vitest';
import {compileExperience,defaultSimulationConfig,experiencePresets,getDevice,simulate} from '../src/core';

it('routes a display-first experience to audio on the Meta capability model',()=>{
 const plan=compileExperience(experiencePresets[0],getDevice('model-ray-ban-meta'));
 expect(plan.steps.at(-1)).toMatchObject({capability:'audio',route:'twin',fallback:true});
 expect(simulate(plan,defaultSimulationConfig).status).toBe('success');
});
it('blocks a camera experience on a display-only model when fallback is forbidden',()=>{
 const plan=compileExperience({...experiencePresets[0],allowCompanionFallback:false},getDevice('model-vuzix-z100'));
 expect(plan.compatibility).toBe('blocked');
 expect(simulate(plan,defaultSimulationConfig).status).toBe('blocked');
});
it('records companion acquisition for a display-only model with fallback enabled',()=>{
 const plan=compileExperience(experiencePresets[0],getDevice('model-vuzix-z100'));
 const run=simulate(plan,defaultSimulationConfig);
 expect(run.trace.find(event=>event.stage==='input')?.route).toBe('companion');
 expect(run.totalMs).toBeGreaterThan(simulate(compileExperience(experiencePresets[0],getDevice('openlens-twin')),defaultSimulationConfig).totalMs);
});
