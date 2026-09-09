import {describe,expect,it} from 'vitest';
import {compileExperience,defaultSimulationConfig,diffTraces,experiencePresets,getDevice,runResilienceMatrix} from '../src/core';

const twinPlan=compileExperience(experiencePresets[0],getDevice('openlens-twin'));

describe('resilience matrix',()=>{
 it('holds the plan and seed constant while changing only declared conditions',()=>{
  const matrix=runResilienceMatrix(twinPlan,defaultSimulationConfig);
  expect(matrix.scenarios).toHaveLength(8);
  expect(new Set(matrix.scenarios.map(item=>item.run.seed))).toEqual(new Set([defaultSimulationConfig.seed]));
  expect(new Set(matrix.scenarios.map(item=>item.run.plan.fingerprint))).toEqual(new Set([twinPlan.fingerprint]));
  expect(matrix.scenarios.find(item=>item.id==='baseline')?.run.status).toBe('success');
 });

 it('exposes the expected deterministic failure boundaries',()=>{
  const matrix=runResilienceMatrix(twinPlan,defaultSimulationConfig);
  const permission=matrix.scenarios.find(item=>item.id==='permission-denied')!;
  const timeout=matrix.scenarios.find(item=>item.id==='timeout')!;
  const disconnect=matrix.scenarios.find(item=>item.id==='disconnect')!;
  expect(permission.failure?.stage).toBe('input');
  expect(timeout.failure?.stage).toBe('process');
  expect(disconnect.failure?.stage).toBe('output');
 });

 it('shows degraded-link overhead without inventing a failure',()=>{
  const matrix=runResilienceMatrix(twinPlan,defaultSimulationConfig);
  const baseline=matrix.scenarios.find(item=>item.id==='baseline')!.run;
  const degraded=matrix.scenarios.find(item=>item.id==='degraded-network')!.run;
  expect(degraded.status).toBe('success');
  expect(degraded.totalMs).toBeGreaterThan(baseline.totalMs);
 });

 it('diffs event sequences without hiding early termination',()=>{
  const matrix=runResilienceMatrix(twinPlan,defaultSimulationConfig);
  const baseline=matrix.scenarios.find(item=>item.id==='baseline')!.run;
  const permission=matrix.scenarios.find(item=>item.id==='permission-denied')!.run;
  const diff=diffTraces(baseline,permission);
  expect(diff.some(row=>row.changed)).toBe(true);
  expect(diff.some(row=>row.left!==null&&row.right===null)).toBe(true);
 });

 it('keeps research-only devices blocked across every fault condition',()=>{
  const researchPlan=compileExperience(experiencePresets[0],getDevice('brilliant-frame'));
  const matrix=runResilienceMatrix(researchPlan,defaultSimulationConfig);
  expect(matrix.blocked).toBe(8);
  expect(matrix.scenarios.every(item=>item.run.status==='blocked')).toBe(true);
 });
});
