import {describe,expect,it} from 'vitest';
import {createEvidenceDraft,createEvidencePack,exportEvidencePack,importEvidencePack,validateEvidenceRecord,type EvidenceDraftInput} from '../src/core';

const input:EvidenceDraftInput={deviceId:'rokid-glasses',sourceClass:'manufacturer',sourceTitle:'Rokid Glasses product page',sourceUrl:'https://global.rokid.com/products/rokid-glasses',publisher:'Rokid',publishedDate:null,accessedDate:'2026-09-11',claim:'The product page lists a 1,500 nit display brightness.',confidence:'high',notes:'Manufacturer specification; test conditions are not stated.'};

describe('research evidence packs',()=>{
 it('creates a fingerprinted draft and round-trips a self-contained pack',()=>{
  const record=createEvidenceDraft(input,undefined,'2026-09-11T19:00:00.000Z');
  expect(record).toMatchObject({revision:1,status:'draft-review',device:{id:'rokid-glasses'},checks:['known-device','complete-provenance','https-source','human-review-required']});
  const pack=createEvidencePack([record],'2026-09-11T19:01:00.000Z');
  expect(importEvidencePack(exportEvidencePack(pack))).toEqual(pack);
 });

 it('preserves the original while creating a linked correction revision',()=>{
  const original=createEvidenceDraft(input,undefined,'2026-09-11T19:00:00.000Z');
  const revised=createEvidenceDraft({...input,claim:'The product page lists brightness up to 1,500 nits.',correctionReason:'Preserve the manufacturer qualification “up to”.'},original,'2026-09-11T19:05:00.000Z');
  const pack=createEvidencePack([original,revised],'2026-09-11T19:06:00.000Z');
  expect(pack.records).toHaveLength(2);
  expect(pack.records[0]).toEqual(original);
  expect(revised).toMatchObject({revision:2,correction:{supersedesId:original.id}});
 });

 it('rejects untrusted URLs and incomplete correction chains',()=>{
  expect(()=>createEvidenceDraft({...input,sourceUrl:'http://example.com/spec'})).toThrow('public HTTPS');
  expect(()=>createEvidenceDraft({...input,deviceId:'not-in-the-catalog'})).toThrow('not in the current catalog');
  expect(()=>createEvidenceDraft({...input,accessedDate:'2026-02-31'})).toThrow('valid YYYY-MM-DD');
  const original=createEvidenceDraft(input,undefined,'2026-09-11T19:00:00.000Z');
  const revised=createEvidenceDraft({...input,correctionReason:'Clarify the stated measurement conditions.'},original,'2026-09-11T19:05:00.000Z');
  expect(()=>createEvidencePack([revised])).toThrow('does not include its original record first');
 });

 it('detects edited record and pack content',()=>{
  const record=createEvidenceDraft(input,undefined,'2026-09-11T19:00:00.000Z');
  expect(()=>validateEvidenceRecord({...record,claim:'Edited without a new revision.'})).toThrow('fingerprint failed');
  expect(()=>validateEvidenceRecord({...record,checks:['human-review-required']})).toThrow('validation checks are invalid');
  const pack=createEvidencePack([record],'2026-09-11T19:01:00.000Z');
  expect(()=>importEvidencePack(JSON.stringify({...pack,createdAt:'2026-09-12T00:00:00.000Z'}))).toThrow('fingerprint failed');
 });
});
