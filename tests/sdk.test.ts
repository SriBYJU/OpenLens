import {describe,expect,it,vi} from 'vitest';
import {compileExperience,defaultSimulationConfig,DigitalTwinAdapter,experiencePresets,getDevice,type DeviceAdapter} from '../src/core';
import {runOpenLensSDKExample} from '../src/examples/openlens-sdk-example';
import {createOpenLens} from '../src/sdk';

const twin=getDevice('openlens-twin');
const plan=compileExperience(experiencePresets[0],twin);

describe('OpenLens SDK',()=>{
 it('exposes capability gates and enforces lifecycle state',async()=>{
  const sdk=createOpenLens(new DigitalTwinAdapter(twin));
  expect(sdk.device.state).toBe('disconnected');
  expect(()=>sdk.camera.require()).not.toThrow();
  expect(sdk.audio.input.available).toBe(true);
  await expect(sdk.device.execute(plan,defaultSimulationConfig)).rejects.toThrow('not connected');
  await sdk.device.connect();
  expect(sdk.device.state).toBe('connected');
  await expect(sdk.device.execute(plan,defaultSimulationConfig)).resolves.toMatchObject({status:'success',output:'SALIDA'});
  await sdk.device.disconnect();
  expect(sdk.device.state).toBe('disconnected');
 });

 it('retains successful, failed, and rejected adapter benchmark outcomes',async()=>{
  const base=new DigitalTwinAdapter(twin);
  const execute=vi.fn(async(...args:Parameters<DeviceAdapter['execute']>)=>{
   if(args[1].seed===43)throw new Error('transport rejected seed');
   return base.execute(...args);
  });
  const sdk=createOpenLens({manifest:base.manifest,connect:()=>base.connect(),disconnect:()=>base.disconnect(),execute});
  await sdk.device.connect();
  const report=await sdk.benchmark.run(plan,defaultSimulationConfig,3);
  expect(report).toMatchObject({boundary:'adapter-runtime',trials:3,successes:2,failures:1,successRate:2/3});
  expect(report.results.map(result=>result.outcome)).toEqual(['success','error','success']);
  expect(report.statistics.n).toBe(2);
  await sdk.device.disconnect();
 });

 it('routes AI through the shared capability planner and runs the source example',async()=>{
  const sdk=createOpenLens(new DigitalTwinAdapter(twin));
  expect(sdk.ai.route({task:'ocr',privacy:'local-only',priority:'latency',cost:'zero-only'},{localOcr:true,localVoice:false,browserSpeechRecognition:false,webGpu:false,localVisionModel:false,advancedProvider:false})).toMatchObject({status:'ready',route:'local-browser'});
  await expect(runOpenLensSDKExample()).resolves.toMatchObject({status:'success'});
 });

 it('rejects unavailable capability gates and unsafe benchmark sizes',async()=>{
  const restricted:DeviceAdapter={manifest:{...new DigitalTwinAdapter(twin).manifest,capabilities:['display']},connect:async()=>{},disconnect:async()=>{},execute:async()=>{throw new Error('unused')}};
  const sdk=createOpenLens(restricted);
  expect(()=>sdk.camera.require()).toThrow('does not expose camera');
  await sdk.device.connect();
  await expect(sdk.benchmark.run(plan,defaultSimulationConfig,101)).rejects.toThrow('between 1 and 100');
 });
});
