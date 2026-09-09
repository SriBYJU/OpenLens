import {describe,expect,it} from 'vitest';
import {defaultFitRequirements,evaluateDeviceFit,fitDevices,getDevice,type FitRequirements} from '../src/core';
import {devices} from '../src/data/devices';

describe('device fit engine',()=>{
 it('marks the executable Optical Twin as a strong fit for the default translation requirements',()=>{
  const result=evaluateDeviceFit(getDevice('openlens-twin'),defaultFitRequirements);
  expect(result.verdict).toBe('strong-fit');
  expect(result.requiredMatches).toContain('camera');
  expect(result.preferredMatches).toEqual(expect.arrayContaining(['display','audio']));
  expect(result.blockers).toHaveLength(0);
 });

 it('does not treat physical hardware as developer access',()=>{
  const strict:FitRequirements={
   capabilities:{camera:'required',microphone:'off',display:'required',audio:'off',imu:'off'},
   developerAccess:'required',allowCompanion:false,execution:'research-ok',
  };
  const result=evaluateDeviceFit(getDevice('ray-ban-meta'),strict);
  expect(result.verdict).toBe('not-a-fit');
  expect(result.blockers.some(item=>item.includes('Display is not present'))).toBe(true);
  expect(result.blockers.some(item=>item.includes('Camera'))).toBe(true);
 });

 it('keeps preferred capabilities non-blocking even under strict developer-access policy',()=>{
  const strictWithOptionalAudio:FitRequirements={
   capabilities:{camera:'required',microphone:'off',display:'off',audio:'preferred',imu:'off'},
   developerAccess:'required',allowCompanion:false,execution:'research-ok',
  };
  const result=evaluateDeviceFit(getDevice('ray-ban-meta'),strictWithOptionalAudio);
  expect(result.blockers.some(item=>item.startsWith('Audio:'))).toBe(false);
  expect(result.caveats.some(item=>item.startsWith('Audio:'))).toBe(true);
 });

 it('requires an executable adapter when requested',()=>{
  const runnable:FitRequirements={...defaultFitRequirements,execution:'openlens-runnable'};
  const ranked=fitDevices(devices,runnable);
  expect(ranked[0].device.id).toBe('openlens-twin');
  expect(ranked[0].verdict).toBe('strong-fit');
  expect(ranked.filter(item=>item.device.kind==='research').every(item=>item.verdict==='not-a-fit')).toBe(true);
 });
});
