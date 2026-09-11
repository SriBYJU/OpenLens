# atlas: OpenLens (4689 LOC, 88 files) | budget 3600 | rendered 3393 tok | public API only, parameter names omitted to fit budget — raise --budget

## src/core/types.ts (#1 — imported by 15 file(s))
    export interface EvidenceSource { id:string; title:string; url:string; publisher:string; accessed:string; confidence:Confidence; note:string }
    export interface DeviceProfile { id:string; revision:number; name:string; manufacturer:string; kind:'digital-twin'|'research'; summary:string; integrationStatus:IntegrationStatus; capabilities:Record<Capability,CapabilityInfo>; optics:OpticalProfile; specifications:DeviceSpecifications; sources:EvidenceSource[] }
    export interface PlanStep { id:string; label:string; stage:'input'|'process'|'output'; capability:Capability|null; route:PlanRoute; reason:string; fallback?:boolean }
    export interface RunResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; deviceSnapshot:Pick<DeviceProfile,'id'|'revision'|'name'|'manufacturer'|'integrationStatus'|'optics'>; adapterSnapshot:AdapterManifest|null; seed:number; status:'success'|'failed'|'blocked'; totalMs:number; output:string|null; trace:TraceEvent[]; config:SimulationConfig; plan:CompiledPlan }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
… (177 more symbol(s))
used by: src/adapters/registry.ts, src/core/adapter-starter.ts, src/core/benchmark-facets.ts, src/core/benchmark.ts, src/core/compiler.ts, src/core/environment.ts, src/core/exchange.ts, src/core/experience.ts

## src/core/simulation.ts (#3 — imported by 4 file(s))
export function validateSimulationConfig(unknown):SimulationConfig
export function seededRandom(number){let state=seed>>>0;return()=>{state+=0x6d2b79f5;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
export function simulate(CompiledPlan, SimulationConfig):RunResult{const config=validateSimulationConfig(input);const device=getDevice(plan.deviceId);const adapter=getAdapter(device.id);const random=seededRandom(config.seed);const environment=config.environment??defaultEnvironment;const assessment=assessEnvironment(plan.experience.input,plan.steps.at(-1)?.capability,environment);let elapsed=0;const trace:TraceEvent[]=[];const at=(ms:number)=>new Date(Date.parse(config.startTime)+ms).toISOString();const add=(stage:TraceEvent['stage'],status:TraceEvent['status'],message:string,durationMs:number,route:TraceEvent['route'],metadata:TraceEvent['metadata']={})=>{const event={id:`span-${trace.length+1}`,parentId:stage==='session'?null:'span-1',timestamp:at(elapsed),elapsedMs:elapsed,stage,status,message,durationMs,route,metadata};trace.push(event);elapsed+=durationMs}
export function simulate(CompiledPlan, SimulationConfig):RunResult{const config=validateSimulationConfig(input);const device=getDevice(plan.deviceId);const adapter=getAdapter(device.id);const random=seededRandom(config.seed);const environment=config.environment??defaultEnvironment;const assessment=assessEnvironment(plan.experience.input,plan.steps.at(-1)?.capability,environment);let elapsed=0;const trace:TraceEvent[]=[];const at=(ms:number)=>new Date(Date.parse(config.startTime)+ms).toISOString();const add=(stage:TraceEvent['stage'],status:TraceEvent['status'],message:string,durationMs:number,route:TraceEvent['route'],metadata:TraceEvent['metadata']={})=>{const event={id:`span-${trace.length+1}`,parentId:stage==='session'?null:'span-1',timestamp:at(elapsed),elapsedMs:elapsed,stage,status,message,durationMs,route,metadata};trace.push(event);elapsed+=durationMs}
export function simulate(CompiledPlan, SimulationConfig):RunResult{const config=validateSimulationConfig(input);const device=getDevice(plan.deviceId);const adapter=getAdapter(device.id);const random=seededRandom(config.seed);const environment=config.environment??defaultEnvironment;const assessment=assessEnvironment(plan.experience.input,plan.steps.at(-1)?.capability,environment);let elapsed=0;const trace:TraceEvent[]=[];const at=(ms:number)=>new Date(Date.parse(config.startTime)+ms).toISOString();const add=(stage:TraceEvent['stage'],status:TraceEvent['status'],message:string,durationMs:number,route:TraceEvent['route'],metadata:TraceEvent['metadata']={})=>{const event={id:`span-${trace.length+1}`,parentId:stage==='session'?null:'span-1',timestamp:at(elapsed),elapsedMs:elapsed,stage,status,message,durationMs,route,metadata};trace.push(event);elapsed+=durationMs}
const jitter=(number)=>Math.round(base*(1+(random()*2-1)*config.jitter))
    export class DigitalTwinAdapter implements DeviceAdapter{readonly manifest;private connected=false;constructor(DeviceProfile){const manifest=getAdapter(profile.id);if(!manifest)throw new Error('Only a registered Digital Twin can be executed.');this.manifest=manifest}async connect(){this.connected=true}async disconnect(){this.connected=false}async execute(plan:CompiledPlan,config:SimulationConfig){if(!this.connected)throw new Error('Adapter is not connected.');if(plan.deviceId!==this.profile.id)throw new Error('Plan device does not match adapter.');return simulate(plan,config)}}
    export class DigitalTwinAdapter implements DeviceAdapter{readonly manifest;private connected=false;constructor(DeviceProfile){const manifest=getAdapter(profile.id);if(!manifest)throw new Error('Only a registered Digital Twin can be executed.');this.manifest=manifest}async connect(){this.connected=true}async disconnect(){this.connected=false}async execute(plan:CompiledPlan,config:SimulationConfig){if(!this.connected)throw new Error('Adapter is not connected.');if(plan.deviceId!==this.profile.id)throw new Error('Plan device does not match adapter.');return simulate(plan,config)}}
… (6 more symbol(s))
imports: src/adapters/registry.ts, src/core/environment.ts, src/core/fixtures.ts, src/core/types.ts, src/data/devices.ts
used by: src/core/benchmark.ts, src/core/exchange.ts, src/core/resilience.ts, src/core/scenario.ts

## src/data/devices.ts (#4 — imported by 12 file(s))
const cap=(CapabilityInfo['physical'], CapabilityInfo['manufacturerAccess'], string, string[]=[]):CapabilityInfo=>({physical,manufacturerAccess,note,sourceIds})
const source=(string, string, string, string, string, EvidenceSource['confidence']='high'):EvidenceSource=>({id,title,url,publisher,accessed:'2026-09-10',confidence,note})
const claim=<T,>(T|null, Claim<T>['status'], string[], string, Confidence='high', Claim<T>['conflicts']):Claim<T>=>({value,status,sourceIds,confidence,...(note?{note}:{}),...(conflicts?.length?{conflicts}:{})})
const unknown=<T,>(note='No current first-party value is recorded.'):Claim<T>=>claim<T>(null,'unknown',[],note,'low')
const specs=(Partial<DeviceSpecifications>={}):DeviceSpecifications=>(
export function getDevice(string){return [...devices,...modeledDevices].find(device=>device.id===id)??devices[0]}
export function validateDeviceId(string|null){return id&&[...devices,...modeledDevices].some(device=>device.id===id)?id:'openlens-twin'}
imports: src/core/types.ts
used by: src/adapters/registry.ts, src/app/workbench.tsx, src/components/CommandPalette.tsx, src/components/DeviceFitEngine.tsx, src/components/HomeDeviceSwitchboard.tsx, src/core/exchange.ts, src/core/scenario.ts, src/core/simulation.ts

## src/app/workbench.tsx (#5, 24 symbol(s) — collapsed to fit)

## public/ocr/worker.min.js (#6, 66 symbol(s) — collapsed to fit)

## src/components/Page.tsx (#7 — imported by 8 file(s))
export default function Page({index:string;eyebrow:string;title:ReactNode;lead:string;actions?:ReactNode;children:ReactNode;className?:string})
used by: src/pages/About.tsx, src/pages/Benchmarks.tsx, src/pages/Compiler.tsx, src/pages/Developers.tsx, src/pages/Devices.tsx, src/pages/Lab.tsx, src/pages/Methodology.tsx, src/pages/Research.tsx

## src/core/adapter-starter.ts (#8, 12 symbol(s) — collapsed to fit)

---
symbol index (other defined symbols — names only; read the listed file for full signatures):
src/core/types.ts: Capability, ClaimStatus, ManufacturerAccess, IntegrationStatus, Confidence, EvidenceSource, ClaimConflict, Claim
src/core/simulation.ts: DigitalTwinAdapter
src/app/workbench.tsx: Workbench
src/core/adapter-starter.ts: AdapterStarterInput, AdapterStarterFile
src/core/resilience.ts: ResilienceScenarioId, ResilienceScenarioResult, ResilienceMatrixResult, TraceDiffRow
src/core/adapter-conformance.ts: ConformanceProbe, ConformanceCheck, ConformanceReport
src/app/router.ts: Route, RouteState
src/core/scenario.ts: ScenarioCapsule, ImportedScenarioCapsule
src/core/benchmark-facets.ts: BenchmarkFamily, BenchmarkFacet
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd-lstm.wasm.js: Aa, La, k
src/core/environment.ts: EnvironmentAssessment
src/ai/types.ts: OcrResult, OcrMessage, OcrRequest
src/ai/phrasebook.ts: PhrasebookLanguage, Entry, PhrasebookTranslation
src/components/FeatureGuide.tsx: GuideStep
src/components/BrowserReadiness.tsx: Check
src/components/CommandPalette.tsx: PaletteEntry
src/components/VisitorPathfinder.tsx: PathId
src/core/fit.ts: CapabilityPriority, DeveloperAccessRequirement, ExecutionRequirement, FitVerdict, FitRequirements, DeviceFitResult
src/components/DeviceCapabilityMatrix.tsx: MatrixMode
src/pages/Lab.tsx: Scenario
src/components/VirtualWorldScene.tsx: VirtualWorldSceneProps
src/core/types.ts: RELEASE_VERSION, ENGINE_VERSION
src/core/simulation.ts: finish
src/app/workbench.tsx: setDeviceId, setExperience
public/ocr/worker.min.js: at, it
src/core/adapter-starter.ts: validateAdapterStarter, buildAdapterStarter
src/core/compiler.ts: hash, compileExperience
src/components/HomeDeviceSwitchboard.tsx: show, simulate
src/core/resilience.ts: runResilienceMatrix, diffTraces
src/ai/images.ts: validateDimensions, canvasBlob
src/App.tsx: update
src/core/adapter-conformance.ts: requiredPaths, evaluateAdapterBundle
src/components/LocalAI.tsx: LocalAI, stopWorker
src/app/router.ts: parseHash
src/core/scenario.ts: createScenarioCapsule, importScenarioCapsule
src/core/benchmark-facets.ts: clamp, benchmarkFacets
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: a, a
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: a, a
public/ocr/core/tesseract-core-simd.wasm.js: a, a
public/ocr/core/tesseract-core.wasm.js: a, a
public/ocr/core/tesseract-core-lstm.wasm.js: a, a
public/ocr/core/tesseract-core-simd-lstm.wasm.js: a, a
src/core/environment.ts: clamp, assessEnvironment
src/core/benchmark.ts: statistics, benchmark
src/core/experience.ts: parseExperience, validateExperience
src/ai/phrasebook.ts: entry, translateSignText
scripts/audit-live.mjs: report, url
src/adapters/registry.ts: getAdapter
src/components/FeatureGuide.tsx: FeatureGuide
src/components/BrowserReadiness.tsx: BrowserReadiness, add
src/components/CommandPalette.tsx: navigate, choose
src/components/HomeSignalDemo.tsx: HomeSignalDemo, choose
src/components/VisitorPathfinder.tsx: escape, trap
src/core/fit.ts: evaluateDeviceFit, fitDevices
src/components/ExperienceLayer.tsx: ExperienceLayer, setProgress
src/core/fixtures.ts: resolveFixture
src/app/Shell.tsx: Mark, handleKey
src/components/RunPlayback.tsx: RunPlayback, play
src/core/exchange.ts: importRun, importArtifact
src/components/TraceViewer.tsx: save, TraceViewer
src/components/ResilienceMatrix.tsx: save, run
src/components/AdapterConformanceLab.tsx: AdapterConformanceLab, run
src/components/ScenarioCapsulePanel.tsx: apply, load
src/core/specifications.ts: formatSpecification, sourcesForClaim
src/mobile.ts: update, useMobile
src/components/BenchmarkScorecard.tsx: BenchmarkScorecard
src/pages/Benchmarks.tsx: save, run
src/components/DeviceCapabilityMatrix.tsx: state
src/components/DeviceDoctor.tsx: DeviceDoctor
src/components/DeviceFitEngine.tsx: DeviceFitEngine, setPriority
src/pages/Lab.tsx: update, chooseScenario
src/components/FixtureScene.tsx: FixtureScene
src/components/SimulationControls.tsx: SimulationControls, change
src/components/VirtualWorldScene.tsx: VirtualWorldScene
src/pages/Developers.tsx: save, toggle
scripts/check-performance-budget.mjs: walk, size
src/ai/ocr.worker.ts: report
src/components/Glasses.tsx: Glasses
src/pages/Compiler.tsx: Compiler, update
src/pages/Devices.tsx: jumpTo, toggle
src/pages/Methodology.tsx: jump
src/pages/Research.tsx: requestedDevice, Research
tests/integrity.test.ts: run

[81 low-rank file(s) collapsed: ./* (3), public/ocr/core/* (6), scripts/* (4), src/* (4), src/adapters/* (1), src/ai/* (5), src/app/* (2), src/components/* (22), src/core/* (13), src/pages/* (8), tests/* (13)]
