import {describe,expect,it} from 'vitest';
import {buildAdapterStarter,validateAdapterStarter} from '../src/core';

describe('adapter starter generator',()=>{
 it('creates an implementation, contract test, verification record and guide',()=>{
  const files=buildAdapterStarter({deviceName:'Aurora One',deviceId:'aurora-one',capabilities:['camera','display']});
  expect(files.map(file=>file.path)).toEqual(['src/adapters/aurora-one.ts','src/adapters/aurora-one.test.ts','verification-record.json','README.md']);
  expect(files[0].content).toContain('class AuroraOneAdapter implements DeviceAdapter');
  expect(files[0].content).toContain('capabilities: ["camera", "display"]');
  expect(files[1].content).toContain('rejects a plan for another device');
  expect(JSON.parse(files[2].content)).toMatchObject({status:'unverified',adapterId:'aurora-one-adapter'});
 });
 it('escapes names and rejects unsafe or empty contracts',()=>{
  const files=buildAdapterStarter({deviceName:"Lens'; throw new Error() //",deviceId:'safe-id',capabilities:['audio']});
  expect(files[0].content).toContain(JSON.stringify("Lens'; throw new Error() // adapter"));
  expect(validateAdapterStarter({deviceName:'',deviceId:'../unsafe',capabilities:[]})).toHaveLength(3);
 });
});
