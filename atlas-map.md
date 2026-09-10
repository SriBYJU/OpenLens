# atlas: src (1944 LOC, 52 files) | budget 3000 | rendered 2472 tok | public API only, parameter names omitted to fit budget — raise --budget

## core/types.ts (#1 — imported by 14 file(s))
    export interface EvidenceSource { id:string; title:string; url:string; publisher:string; accessed:string; confidence:Confidence; note:string }
    export interface DeviceProfile { id:string; revision:number; name:string; manufacturer:string; kind:'digital-twin'|'research'; summary:string; integrationStatus:IntegrationStatus; capabilities:Record<Capability,CapabilityInfo>; optics:OpticalProfile; specifications:DeviceSpecifications; sources:EvidenceSource[] }
    export interface AdapterManifest { id:string; deviceId:string; name:string; status:IntegrationStatus; mode:'simulation'|'hardware'; capabilities:Capability[]; disclosure:string }
    export interface ExperienceDefinition { version:2; id:string; name:string; prompt:string; input:InputMode; task:TaskKind; preferredOutputs:OutputMode[]; language:string; allowCompanionFallback:boolean; privacy:'local-only'|'provider-allowed' }
    export interface SimulationConfig { seed:number; startTime:string; inputMs:number; processMs:number; outputMs:number; bridgeMs:number; jitter:number; failureRate:number; failureMode:FailureMode; battery:number; network:'online'|'offline'|'degraded'; permission:'granted'|'denied'; fixture:'street-sign'|'conversation'|'museum-label'; environment?:EnvironmentConfig }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
… (176 more symbol(s))
used by: adapters/registry.ts, core/adapter-starter.ts, core/benchmark.ts, core/compiler.ts, core/environment.ts, core/exchange.ts, core/experience.ts, core/fit.ts

## core/simulation.ts (#3, 14 symbol(s) — collapsed to fit)

## app/workbench.tsx (#4 — imported by 9 file(s))
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
const setDeviceId=(string)=>{const safe=validateDeviceId(id);setDeviceState(safe);writeStorage('openlens.device',safe);setRun(null);setBenchmark(null)}
const setExperience=(ExperienceDefinition)=>{setExperienceState(value);writeStorage('openlens.experience',JSON.stringify(value));setConfigState(current=>({...current,fixture:value.input==='microphone'?'conversation':value.task==='describe'?'museum-label':'street-sign'}));setRun(null);setBenchmark(null)}
const setConfig=(SimulationConfig)=>{setConfigState(value);setRun(null);setBenchmark(null)}
const runCurrent=()=>{const next=simulate(plan,config);setRun(next);setRunHistory(current=>[next,...current.filter(item=>JSON.stringify(item)!==JSON.stringify(next))].slice(0,8));return next}
… (16 more symbol(s))
imports: core/index.ts, data/devices.ts
used by: App.tsx, components/CommandPalette.tsx, components/HomeSignalDemo.tsx, components/ResilienceMatrix.tsx, components/ScenarioCapsulePanel.tsx, components/SimulationControls.tsx, pages/Benchmarks.tsx, pages/Compiler.tsx

## components/Page.tsx (#5 — imported by 8 file(s))
export default function Page({index:string;eyebrow:string;title:ReactNode;lead:string;actions?:ReactNode;children:ReactNode;className?:string}){return <main id="main" tabIndex={-1} className={`page ${className}`}><header className="page-hero"><div className="page-index">{index}</div><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-lead">{lead}</p></div>{actions&&<div className="page-actions">{actions}</div>}</header>{children}</main>}
used by: pages/About.tsx, pages/Benchmarks.tsx, pages/Compiler.tsx, pages/Developers.tsx, pages/Devices.tsx, pages/Lab.tsx, pages/Methodology.tsx, pages/Research.tsx

## data/devices.ts (#6 — imported by 10 file(s))
const cap=(CapabilityInfo['physical'], CapabilityInfo['manufacturerAccess'], string, string[]=[]):CapabilityInfo=>({physical,manufacturerAccess,note,sourceIds})
const source=(string, string, string, string, string, EvidenceSource['confidence']='high'):EvidenceSource=>({id,title,url,publisher,accessed:'2026-09-10',confidence,note})
const claim=<T,>(T|null, Claim<T>['status'], string[], string, Confidence='high', Claim<T>['conflicts']):Claim<T>=>({value,status,sourceIds,confidence,...(note?{note}:{}),...(conflicts?.length?{conflicts}:{})})
const unknown=<T,>(note='No current first-party value is recorded.'):Claim<T>=>claim<T>(null,'unknown',[],note,'low')
const specs=(Partial<DeviceSpecifications>={}):DeviceSpecifications=>(
export function getDevice(string){return [...devices,...modeledDevices].find(device=>device.id===id)??devices[0]}
export function validateDeviceId(string|null){return id&&[...devices,...modeledDevices].some(device=>device.id===id)?id:'openlens-twin'}
imports: core/types.ts
used by: adapters/registry.ts, app/workbench.tsx, components/CommandPalette.tsx, components/DeviceFitEngine.tsx, core/exchange.ts, core/scenario.ts, core/simulation.ts, pages/Devices.tsx

## app/router.ts (#7, 5 symbol(s) — collapsed to fit)

## ai/types.ts (#8 — imported by 2 file(s))
export type OcrResult = { text: string; confidence: number; inferenceMs: number }
export type OcrMessage =
export type OcrRequest = { image: Blob }
used by: ai/ocr.worker.ts, components/LocalAI.tsx

---
symbol index (other defined symbols — names only; read the listed file for full signatures):
core/types.ts: Capability, ClaimStatus, ManufacturerAccess, IntegrationStatus, Confidence, EvidenceSource, ClaimConflict, Claim
core/simulation.ts: DigitalTwinAdapter
app/workbench.tsx: Workbench
app/router.ts: Route, RouteState
components/CommandPalette.tsx: PaletteEntry
components/FeatureGuide.tsx: GuideStep
core/resilience.ts: ResilienceScenarioId, ResilienceScenarioResult, ResilienceMatrixResult, TraceDiffRow
core/environment.ts: EnvironmentAssessment
ai/phrasebook.ts: PhrasebookLanguage, Entry, PhrasebookTranslation
components/BrowserReadiness.tsx: Check
core/scenario.ts: ScenarioCapsule, ImportedScenarioCapsule
core/adapter-starter.ts: AdapterStarterInput, AdapterStarterFile
core/fit.ts: CapabilityPriority, DeveloperAccessRequirement, ExecutionRequirement, FitVerdict, FitRequirements, DeviceFitResult
core/types.ts: RELEASE_VERSION, ENGINE_VERSION
core/simulation.ts: add, at
app/workbench.tsx: readStorage, benchmarkCurrent
app/router.ts: parseHash
App.tsx: update
components/HomeSignalDemo.tsx: HomeSignalDemo, choose
components/LocalAI.tsx: LocalAI, stopWorker
components/CommandPalette.tsx: navigate, choose
core/compiler.ts: hash, compileExperience
core/experience.ts: parseExperience, validateExperience
components/FeatureGuide.tsx: FeatureGuide
ai/images.ts: validateDimensions, canvasBlob
app/Shell.tsx: Mark, f
adapters/registry.ts: getAdapter
core/resilience.ts: runResilienceMatrix, diffTraces
core/benchmark.ts: statistics, benchmark
core/environment.ts: clamp, assessEnvironment
ai/phrasebook.ts: entry, translateSignText
core/fixtures.ts: resolveFixture
core/specifications.ts: formatSpecification, sourcesForClaim
components/BrowserReadiness.tsx: BrowserReadiness, add
components/TraceViewer.tsx: save, TraceViewer
components/RunPlayback.tsx: RunPlayback, play
components/ScenarioCapsulePanel.tsx: download, load
components/ResilienceMatrix.tsx: save, ResilienceMatrix
components/DeviceDoctor.tsx: DeviceDoctor
components/DeviceFitEngine.tsx: DeviceFitEngine, setPriority
components/FixtureScene.tsx: FixtureScene
components/SimulationControls.tsx: SimulationControls, change
core/scenario.ts: hash, createScenarioCapsule
mobile.ts: update, useMobile
ai/ocr.worker.ts: report
components/Glasses.tsx: Glasses
core/adapter-starter.ts: validateAdapterStarter, buildAdapterStarter
core/exchange.ts: exportArtifact, importArtifact
core/fit.ts: assessCapability, fitDevices
pages/Benchmarks.tsx: save, Benchmarks
pages/Compiler.tsx: Compiler, update
pages/Developers.tsx: save, toggle
pages/Devices.tsx: jumpTo, toggle
pages/Lab.tsx: update, chooseScenario
pages/Methodology.tsx: jump
pages/Research.tsx: requestedDevice, Research

[45 low-rank file(s) collapsed: ./* (4), adapters/* (1), ai/* (4), app/* (1), components/* (15), core/* (12), pages/* (8)]
