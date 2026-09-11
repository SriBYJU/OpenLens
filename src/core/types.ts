export const RELEASE_VERSION = '0.3.0';
export const ENGINE_VERSION = '0.4.0';
export const CATALOG_VERSION = '2026.09.10';
export const METHODOLOGY_VERSION = '1.3.0';
export const ARTIFACT_SCHEMA_VERSION = 2;

export const capabilityKeys = ['camera','microphone','display','audio','imu'] as const;
export type Capability = typeof capabilityKeys[number];
export type ClaimStatus = 'manufacturer-claim'|'openlens-measured'|'estimated'|'simulated'|'unknown';
export type ManufacturerAccess = 'documented-api'|'companion-only'|'unsupported'|'unknown';
export type IntegrationStatus = 'unavailable'|'simulated'|'implemented-untested'|'verified-hardware';
export type Confidence = 'high'|'medium'|'low';
export interface EvidenceSource { id:string; title:string; url:string; publisher:string; accessed:string; confidence:Confidence; note:string }
export interface ClaimConflict<T> { value:T; sourceIds:string[]; note:string }
export interface Claim<T> { value:T|null; status:ClaimStatus; sourceIds:string[]; confidence:Confidence; note?:string; conflicts?:ClaimConflict<T>[] }
export interface CapabilityInfo { physical:'present'|'absent'|'unknown'; manufacturerAccess:ManufacturerAccess; note:string; sourceIds:string[] }
export interface OpticalProfile { horizontalFovDegrees:Claim<number>|null; fovAxis?:'horizontal'|'diagonal'|'unknown' }
export const specificationKeys = ['massGrams','displayTechnology','displayResolution','brightnessNits','refreshRateHz','enduranceHours','batteryCapacityMah','cameraResolution'] as const;
export type SpecificationKey = typeof specificationKeys[number];
export interface DeviceSpecifications {
 massGrams:Claim<number>;
 displayTechnology:Claim<string>;
 displayResolution:Claim<string>;
 brightnessNits:Claim<number>;
 refreshRateHz:Claim<number>;
 enduranceHours:Claim<number>;
 batteryCapacityMah:Claim<number>;
 cameraResolution:Claim<string>;
}
export interface DeviceProfile { id:string; revision:number; name:string; manufacturer:string; kind:'digital-twin'|'research'; summary:string; integrationStatus:IntegrationStatus; capabilities:Record<Capability,CapabilityInfo>; optics:OpticalProfile; specifications:DeviceSpecifications; sources:EvidenceSource[] }
export interface AdapterManifest { id:string; deviceId:string; name:string; status:IntegrationStatus; mode:'simulation'|'hardware'; capabilities:Capability[]; disclosure:string }
export type InputMode = 'camera'|'microphone'|'manual';
export type TaskKind = 'translate'|'describe'|'caption'|'notify'|'identify'|'assist'|'debug';
export type OutputMode = 'display'|'audio';
export interface ExperienceDefinition { version:2; id:string; name:string; prompt:string; input:InputMode; task:TaskKind; preferredOutputs:OutputMode[]; language:string; allowCompanionFallback:boolean; privacy:'local-only'|'provider-allowed' }
export interface ParseResult { parser:'rules-based-v2'; experience:ExperienceDefinition|null; warnings:string[]; errors:string[] }
export type PlanRoute = 'twin'|'adapter'|'companion'|'blocked';
export interface PlanStep { id:string; label:string; stage:'input'|'process'|'output'; capability:Capability|null; route:PlanRoute; reason:string; fallback?:boolean }
export interface CompiledPlan { version:2; deviceId:string; deviceRevision:number; deviceName:string; adapterId:string|null; experience:ExperienceDefinition; compatibility:'native'|'adapted'|'simulation-only'|'blocked'; steps:PlanStep[]; warnings:string[]; mode:'simulation'; fingerprint:string }
export type FailureMode = 'none'|'permission'|'disconnect'|'timeout'|'low-battery'|'network-loss'|'model-unavailable';
export interface EnvironmentConfig { illuminationLux:number; headMotionDps:number; ambientNoiseDb:number }
export type SimulationFixture='street-sign'|'conversation'|'museum-label'|'menu-board'|'document-page'|'object-shelf'|'debug-console';
export interface SimulationConfig { seed:number; startTime:string; inputMs:number; processMs:number; outputMs:number; bridgeMs:number; jitter:number; failureRate:number; failureMode:FailureMode; battery:number; network:'online'|'offline'|'degraded'; permission:'granted'|'denied'; fixture:SimulationFixture; environment?:EnvironmentConfig }
export interface TraceEvent { id:string; parentId:string|null; timestamp:string; elapsedMs:number; stage:'session'|'input'|'process'|'output'|'system'; status:'info'|'success'|'failure'|'skipped'; message:string; durationMs:number; route:PlanRoute|'system'; metadata:Record<string,string|number|boolean|null> }
export interface ArtifactVersions { release:string; engine:string; catalog:string; methodology:string; schema:number }
export interface RunResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; deviceSnapshot:Pick<DeviceProfile,'id'|'revision'|'name'|'manufacturer'|'integrationStatus'|'optics'>; adapterSnapshot:AdapterManifest|null; seed:number; status:'success'|'failed'|'blocked'; totalMs:number; output:string|null; trace:TraceEvent[]; config:SimulationConfig; plan:CompiledPlan }
export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
export interface DeviceAdapter { readonly manifest:AdapterManifest; connect():Promise<void>; disconnect():Promise<void>; execute(plan:CompiledPlan,config:SimulationConfig):Promise<RunResult> }
