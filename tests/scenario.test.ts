import {describe,expect,it} from 'vitest';
import {compileExperience,createScenarioCapsule,decodeScenarioCapsule,defaultSimulationConfig,encodeScenarioCapsule,experiencePresets,exportScenarioCapsule,getDevice,importScenarioCapsule} from '../src/core';

const plan=compileExperience(experiencePresets[0],getDevice('openlens-twin'));

describe('scenario capsules',()=>{
 it('round-trips an exact simulator snapshot through JSON',()=>{
  const capsule=createScenarioCapsule('Street translation QA',plan,{...defaultSimulationConfig,seed:912,network:'degraded'});
  const imported=importScenarioCapsule(exportScenarioCapsule(capsule));
  expect(imported.capsule).toEqual(capsule);
  expect(imported.plan.fingerprint).toBe(plan.fingerprint);
  expect(imported.capsule.config).toMatchObject({seed:912,network:'degraded'});
 });

 it('round-trips Unicode safely through the share-token encoding',()=>{
  const capsule=createScenarioCapsule('Musée · 日本語 · Ñ',plan,defaultSimulationConfig);
  const token=encodeScenarioCapsule(capsule);
  expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(decodeScenarioCapsule(token).capsule.title).toBe('Musée · 日本語 · Ñ');
 });

 it('rejects edited conditions even when the surrounding JSON remains valid',()=>{
  const capsule=createScenarioCapsule('Tamper test',plan,defaultSimulationConfig);
  const edited=JSON.parse(exportScenarioCapsule(capsule));
  edited.config.battery=2;
  expect(()=>importScenarioCapsule(JSON.stringify(edited))).toThrow('fingerprint');
 });

 it('rejects stale device revisions instead of silently replaying against changed evidence',()=>{
  const capsule=createScenarioCapsule('Revision test',plan,defaultSimulationConfig);
  const edited={...capsule,deviceRevision:capsule.deviceRevision+1};
  expect(()=>importScenarioCapsule(JSON.stringify(edited))).toThrow('Device profile revision changed');
 });

 it('rejects malformed and oversized URL tokens',()=>{
  expect(()=>decodeScenarioCapsule('%%%')).toThrow('decoded');
  expect(()=>decodeScenarioCapsule('A'.repeat(16001))).toThrow('decoded');
 });
});
