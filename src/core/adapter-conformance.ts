import type {AdapterStarterFile,AdapterStarterInput} from './adapter-starter';

export type ConformanceProbe='clean'|'promoted-status'|'identity-drift'|'missing-failure-case';
export interface ConformanceCheck{id:string;label:string;detail:string;passed:boolean}
export interface ConformanceReport{probe:ConformanceProbe;passed:number;total:number;checks:ConformanceCheck[]}

const requiredPaths=(id:string)=>[`src/adapters/${id}.ts`,`src/adapters/${id}.test.ts`,'src/examples/openlens-sdk-example.ts','verification-record.json','README.md'];

export function evaluateAdapterBundle(files:AdapterStarterFile[],input:AdapterStarterInput,probe:ConformanceProbe='clean'):ConformanceReport{
 const bundle=files.map(file=>({...file}));
 const verificationFile=bundle.find(file=>file.path==='verification-record.json');
 if(verificationFile&&probe==='promoted-status')verificationFile.content=verificationFile.content.replace('"status": "unverified"','"status": "verified-hardware"');
 if(verificationFile&&probe==='identity-drift')verificationFile.content=verificationFile.content.replace(`${input.deviceId}-adapter`,`${input.deviceId}-other`);
 if(verificationFile&&probe==='missing-failure-case')verificationFile.content=verificationFile.content.replace(/\s*\{\s*"name": "transport-loss",[\s\S]*?\}\s*,?/,'');
 const source=bundle.find(file=>file.path===`src/adapters/${input.deviceId}.ts`)?.content??'';
 const test=bundle.find(file=>file.path===`src/adapters/${input.deviceId}.test.ts`)?.content??'';
 const example=bundle.find(file=>file.path==='src/examples/openlens-sdk-example.ts')?.content??'';
 let verification:Record<string,unknown>={};try{verification=JSON.parse(verificationFile?.content??'{}')}catch{/* A failed JSON check reports the malformed record. */}
 const cases=Array.isArray(verification.cases)?verification.cases as Array<{name?:string;result?:string}>:[];
 const selected=input.capabilities.every(capability=>source.includes(`"${capability}"`));
 const checks:ConformanceCheck[]=[
  {id:'shape',label:'Bundle topology',detail:'Adapter, contract test, runnable example, verification record, and guide are present at fixed paths.',passed:requiredPaths(input.deviceId).every(path=>bundle.some(file=>file.path===path))},
  {id:'status',label:'Honest initial status',detail:'Generated hardware code remains unavailable and the evidence record remains unverified.',passed:source.includes("status: 'unavailable'")&&verification.status==='unverified'},
  {id:'identity',label:'Identity continuity',detail:'Device ID and adapter ID agree across source and verification artifacts.',passed:source.includes(`deviceId: "${input.deviceId}"`)&&verification.adapterId===`${input.deviceId}-adapter`},
  {id:'capabilities',label:'Capability declaration',detail:'Every selected capability is present in the generated manifest.',passed:selected&&input.capabilities.length>0},
  {id:'lifecycle',label:'Lifecycle guard',detail:'Execution rejects a disconnected adapter before transport delegation.',passed:source.includes("if (!this.#connected) throw new Error('Adapter is not connected.')")},
  {id:'routing',label:'Plan and capability guards',detail:'Foreign device plans and unsupported capability steps stop explicitly.',passed:source.includes('Plan device does not match adapter.')&&source.includes('Plan requires unsupported capabilities')},
  {id:'tests',label:'Executable contract coverage',detail:'The test file exercises disconnected, connected, wrong-device, and disconnect behavior.',passed:['not connected','resolves.toBe(result)','another-device','adapter.disconnect()'].every(token=>test.includes(token))},
  {id:'example',label:'Runnable SDK example',detail:'The example uses the deterministic twin, connects, executes through the SDK, and disconnects in a finally block.',passed:["getDevice('openlens-twin')",'createOpenLens','openlens.device.connect()','openlens.device.execute','finally','openlens.device.disconnect()'].every(token=>example.includes(token))},
  {id:'evidence',label:'Failure evidence matrix',detail:'Permission, transport loss, unsupported capability, and lifecycle cases begin as not run.',passed:['connect-disconnect','permission-denied','transport-loss','unsupported-capability'].every(name=>cases.some(item=>item.name===name&&item.result==='not-run'))},
 ];
 return{probe,passed:checks.filter(check=>check.passed).length,total:checks.length,checks};
}
