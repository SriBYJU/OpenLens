import type {Capability,DeviceProfile,ManufacturerAccess} from './types';

export type CapabilityPriority='off'|'preferred'|'required';
export type DeveloperAccessRequirement='ignore'|'preferred'|'required';
export type ExecutionRequirement='research-ok'|'openlens-runnable';
export type FitVerdict='strong-fit'|'fit-with-caveats'|'not-a-fit';

export interface FitRequirements{
 capabilities:Record<Capability,CapabilityPriority>;
 developerAccess:DeveloperAccessRequirement;
 allowCompanion:boolean;
 execution:ExecutionRequirement;
}

export interface DeviceFitResult{
 device:DeviceProfile;
 verdict:FitVerdict;
 requiredMatches:Capability[];
 preferredMatches:Capability[];
 documentedAccess:number;
 blockers:string[];
 caveats:string[];
 strengths:string[];
}

const accessLabel:Record<ManufacturerAccess,string>={
 'documented-api':'documented developer API',
 'companion-only':'companion-only access',
 unsupported:'no supported developer access',
 unknown:'developer access not verified',
};

export const defaultFitRequirements:FitRequirements={
 capabilities:{camera:'required',microphone:'off',display:'preferred',audio:'preferred',imu:'off'},
 developerAccess:'preferred',
 allowCompanion:true,
 execution:'research-ok',
};

function assessCapability(device:DeviceProfile,capability:Capability,priority:CapabilityPriority,requirements:FitRequirements,result:DeviceFitResult){
 if(priority==='off')return;
 const info=device.capabilities[capability];
 const title=capability[0].toUpperCase()+capability.slice(1);
 if(info.physical==='present'){
  if(priority==='required')result.requiredMatches.push(capability);else result.preferredMatches.push(capability);
  result.strengths.push(`${title} hardware is documented as present.`);
 }else if(priority==='required'){
  result.blockers.push(info.physical==='absent'?`${title} is not present on this profile.`:`${title} hardware is not verified.`);
 }else{
  result.caveats.push(info.physical==='absent'?`${title} is a preferred capability but is absent.`:`${title} is preferred but its hardware state is unknown.`);
 }
 if(info.physical!=='present'||requirements.developerAccess==='ignore')return;
 if(info.manufacturerAccess==='documented-api'){
  result.documentedAccess+=1;
  result.strengths.push(`${title} has a documented developer API.`);
  return;
 }
 if(requirements.developerAccess==='required'){
  if(info.manufacturerAccess==='companion-only'&&requirements.allowCompanion){
   result.caveats.push(`${title} is available only through a companion path, not a direct device API.`);
  }else{
   result.blockers.push(`${title}: ${accessLabel[info.manufacturerAccess]}.`);
  }
 }else if(requirements.developerAccess==='preferred'){
  if(info.manufacturerAccess==='companion-only'&&requirements.allowCompanion)result.caveats.push(`${title} would require a companion path.`);
  else result.caveats.push(`${title}: ${accessLabel[info.manufacturerAccess]}.`);
 }
}

export function evaluateDeviceFit(device:DeviceProfile,requirements:FitRequirements):DeviceFitResult{
 const result:DeviceFitResult={device,verdict:'strong-fit',requiredMatches:[],preferredMatches:[],documentedAccess:0,blockers:[],caveats:[],strengths:[]};
 (Object.keys(requirements.capabilities) as Capability[]).forEach(capability=>assessCapability(device,capability,requirements.capabilities[capability],requirements,result));
 if(requirements.execution==='openlens-runnable'&&device.kind!=='digital-twin')result.blockers.push('No executable OpenLens adapter exists for this hardware profile.');
 else if(device.kind==='research')result.caveats.push('This is a sourced research profile; OpenLens cannot execute it yet.');
 else result.strengths.push('The OpenLens Optical Twin is executable now.');
 if(device.sources.length)result.strengths.push(`${device.sources.length} source${device.sources.length===1?'':'s'} attached to this profile.`);
 result.verdict=result.blockers.length?'not-a-fit':result.caveats.length?'fit-with-caveats':'strong-fit';
 return result;
}

const verdictRank:Record<FitVerdict,number>={'strong-fit':3,'fit-with-caveats':2,'not-a-fit':1};
export function fitDevices(devices:DeviceProfile[],requirements:FitRequirements){
 return devices.map(device=>evaluateDeviceFit(device,requirements)).sort((a,b)=>
  verdictRank[b.verdict]-verdictRank[a.verdict]||
  b.preferredMatches.length-a.preferredMatches.length||
  b.documentedAccess-a.documentedAccess||
  b.device.sources.length-a.device.sources.length||
  a.device.name.localeCompare(b.device.name)
 );
}
