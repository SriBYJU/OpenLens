import {describe,expect,it} from 'vitest';
import {benchmark,benchmarkFacets,buildAdapterStarter,compileExperience,createEvidenceDraft,defaultSimulationConfig,evaluateAdapterBundle,experiencePresets,getDevice,planAIRoute,simulate} from '../src/core';

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

describe('AI capability router',()=>{
 it('keeps the zero-cost OCR path local and bounded',()=>{
  const decision=planAIRoute({task:'ocr',privacy:'local-only',priority:'latency',cost:'zero-only'},{localOcr:true,localVoice:false,browserSpeechRecognition:true,webGpu:true,localVisionModel:false,advancedProvider:false});
  expect(decision).toMatchObject({status:'ready',route:'local-browser',provider:'Tesseract.js / local WASM'});
 });
 it('refuses semantic and speech routes when their evidence boundary is missing',()=>{
  const runtime={localOcr:true,localVoice:false,browserSpeechRecognition:true,webGpu:true,localVisionModel:false,advancedProvider:false};
  expect(planAIRoute({task:'scene-understanding',privacy:'local-only',priority:'quality',cost:'zero-only'},runtime).status).toBe('unavailable');
  expect(planAIRoute({task:'captioning',privacy:'local-only',priority:'latency',cost:'zero-only'},runtime)).toMatchObject({status:'unavailable',route:'none'});
  expect(planAIRoute({task:'captioning',privacy:'provider-allowed',priority:'latency',cost:'zero-only'},runtime)).toMatchObject({status:'limited',route:'browser-mediated'});
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
  expect(evaluateAdapterBundle(files,normalized,'clean')).toMatchObject({passed:9,total:9});
  for(const probe of ['promoted-status','identity-drift','missing-failure-case'] as const){
   const report=evaluateAdapterBundle(files,normalized,probe);
   expect(report.passed,probe).toBeLessThan(report.total);
  }
 });
});

describe('research intake boundary',()=>{
 it('keeps structured evidence in draft review',()=>{
  const record=createEvidenceDraft({deviceId:'brilliant-frame',sourceClass:'developer-documentation',sourceTitle:'Frame documentation',sourceUrl:'https://docs.brilliant.xyz/frame/frame.html',publisher:'Brilliant Labs',publishedDate:null,accessedDate:'2026-09-11',claim:'The developer documentation describes a camera interface.',confidence:'high',notes:'Capability claim requires human review before catalog inclusion.'},undefined,'2026-09-11T20:00:00.000Z');
  expect(record.status).toBe('draft-review');
  expect(record.checks).toContain('human-review-required');
 });
});
