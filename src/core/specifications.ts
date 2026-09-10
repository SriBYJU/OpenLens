import type {Claim,DeviceProfile,SpecificationKey} from './types';

export const specificationLabels:Record<SpecificationKey,string>={
 massGrams:'Mass',displayTechnology:'Display technology',displayResolution:'Display resolution',brightnessNits:'Brightness',refreshRateHz:'Refresh rate',enduranceHours:'Endurance',batteryCapacityMah:'Battery capacity',cameraResolution:'Camera resolution',
};

export function formatSpecification(key:SpecificationKey,claim:Claim<string|number>){
 if(claim.value===null)return 'Unknown';
 if(key==='massGrams')return `${claim.value} g`;
 if(key==='brightnessNits')return `${claim.value} nits`;
 if(key==='refreshRateHz')return `${claim.value} Hz`;
 if(key==='enduranceHours')return `${claim.value} hr`;
 if(key==='batteryCapacityMah')return `${claim.value} mAh`;
 return String(claim.value);
}

export function sourcesForClaim(device:DeviceProfile,claim:Claim<unknown>){
 return claim.sourceIds.map(id=>device.sources.find(source=>source.id===id)).filter((source):source is NonNullable<typeof source>=>Boolean(source));
}
