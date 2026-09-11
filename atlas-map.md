# atlas: OpenLens (5167 LOC, 96 files) | budget 3600 | rendered 3591 tok | public API only, parameter names omitted to fit budget — raise --budget

## src/core/types.ts (#1 — imported by 16 file(s))
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
export function simulate(CompiledPlan, SimulationConfig):RunResult{const config=validateSimulationConfig(input);const device=getDevice(plan.deviceId);const adapter=getAdapter(device.id);const random=seededRandom(config.seed);const environment=config.environment??defaultEnvironment;const assessment=assessEnvironment(plan.experience.input,plan.steps.at(-1)?.capability,environment);let elapsed=0;const trace:TraceEvent[]=[];const at=(ms:number)=>new Date(Date.parse(config.startTime)+ms).toISOString();const add=(stage:TraceEvent['stage'],status:TraceEvent['status'],message:string,durationMs:number,route:TraceEvent['route'],metadata:TraceEvent['metadata']={})=>{const event={id:`span-${trace.length+1}`,parentId:stage==='session'?null:'span-1',timestamp:at(elapsed),elapsedMs:elapsed,stage,status,message,durationMs,route,metadata};trace.push(event);elapsed+=durationMs}
export function simulate(CompiledPlan, SimulationConfig):RunResult{const config=validateSimulationConfig(input);const device=getDevice(plan.deviceId);const adapter=getAdapter(device.id);const random=seededRandom(config.seed);const environment=config.environment??defaultEnvironment;const assessment=assessEnvironment(plan.experience.input,plan.steps.at(-1)?.capability,environment);let elapsed=0;const trace:TraceEvent[]=[];const at=(ms:number)=>new Date(Date.parse(config.startTime)+ms).toISOString();const add=(stage:TraceEvent['stage'],status:TraceEvent['status'],message:string,durationMs:number,route:TraceEvent['route'],metadata:TraceEvent['metadata']={})=>{const event={id:`span-${trace.length+1}`,parentId:stage==='session'?null:'span-1',timestamp:at(elapsed),elapsedMs:elapsed,stage,status,message,durationMs,route,metadata};trace.push(event);elapsed+=durationMs}
export function simulate(CompiledPlan, SimulationConfig):RunResult{const config=validateSimulationConfig(input);const device=getDevice(plan.deviceId);const adapter=getAdapter(device.id);const random=seededRandom(config.seed);const environment=config.environment??defaultEnvironment;const assessment=assessEnvironment(plan.experience.input,plan.steps.at(-1)?.capability,environment);let elapsed=0;const trace:TraceEvent[]=[];const at=(ms:number)=>new Date(Date.parse(config.startTime)+ms).toISOString();const add=(stage:TraceEvent['stage'],status:TraceEvent['status'],message:string,durationMs:number,route:TraceEvent['route'],metadata:TraceEvent['metadata']={})=>{const event={id:`span-${trace.length+1}`,parentId:stage==='session'?null:'span-1',timestamp:at(elapsed),elapsedMs:elapsed,stage,status,message,durationMs,route,metadata};trace.push(event);elapsed+=durationMs}
const jitter=(number)=>Math.round(base*(1+(random()*2-1)*config.jitter))
    export class DigitalTwinAdapter implements DeviceAdapter{readonly manifest;private connected=false;constructor(DeviceProfile){const manifest=getAdapter(profile.id);if(!manifest)throw new Error('Only a registered Digital Twin can be executed.');this.manifest=manifest}async connect(){this.connected=true}async disconnect(){this.connected=false}async execute(plan:CompiledPlan,config:SimulationConfig){if(!this.connected)throw new Error('Adapter is not connected.');if(plan.deviceId!==this.profile.id)throw new Error('Plan device does not match adapter.');return simulate(plan,config)}}
    export class DigitalTwinAdapter implements DeviceAdapter{readonly manifest;private connected=false;constructor(DeviceProfile){const manifest=getAdapter(profile.id);if(!manifest)throw new Error('Only a registered Digital Twin can be executed.');this.manifest=manifest}async connect(){this.connected=true}async disconnect(){this.connected=false}async execute(plan:CompiledPlan,config:SimulationConfig){if(!this.connected)throw new Error('Adapter is not connected.');if(plan.deviceId!==this.profile.id)throw new Error('Plan device does not match adapter.');return simulate(plan,config)}}
    export class DigitalTwinAdapter implements DeviceAdapter{readonly manifest;private connected=false;constructor(DeviceProfile){const manifest=getAdapter(profile.id);if(!manifest)throw new Error('Only a registered Digital Twin can be executed.');this.manifest=manifest}async connect(){this.connected=true}async disconnect(){this.connected=false}async execute(plan:CompiledPlan,config:SimulationConfig){if(!this.connected)throw new Error('Adapter is not connected.');if(plan.deviceId!==this.profile.id)throw new Error('Plan device does not match adapter.');return simulate(plan,config)}}
… (6 more symbol(s))
imports: src/adapters/registry.ts, src/core/environment.ts, src/core/fixtures.ts, src/core/types.ts, src/data/devices.ts
used by: src/core/benchmark.ts, src/core/exchange.ts, src/core/resilience.ts, src/core/scenario.ts

## src/components/FieldSessionRecorder.tsx (#4 — imported by 1 file(s))
type Phase='ready'|'recording'|'stopped'
interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
const round=(number, digits=1)=>Number(value.toFixed(digits))
const release=()=>{observers.current.forEach(observer=>observer.disconnect());observers.current=[];if(timer.current)clearInterval(timer.current);timer.current=null}
const observe=(string, (entry:PerformanceEntry)=>void, buffered=false)=>{if(!supportedTypes().includes(type))return;const observer=new PerformanceObserver(list=>{list.getEntries().forEach(read)});observer.observe({type,buffered});observers.current.push(observer)}
const stop=()=>{snapshot();release();started.current=0;setPhase('stopped');setMessage('Recording stopped. Review or download this local artifact, then clear it.');}
const clear=()=>{release();started.current=0;live.current=empty();setMetrics(empty());setPhase('ready');setMessage('Session cleared from memory. No browser measurements are being collected.');}
… (16 more symbol(s))
imports: src/core/index.ts
used by: src/pages/Benchmarks.tsx

## src/components/SDKRuntimeLab.tsx (#5, 6 symbol(s) — collapsed to fit)

## src/sdk/index.ts (#6, 44 symbol(s) — collapsed to fit)

## src/data/devices.ts (#7, 7 symbol(s) — collapsed to fit)

## src/app/workbench.tsx (#8, 24 symbol(s) — collapsed to fit)

## public/ocr/worker.min.js (#9, 66 symbol(s) — collapsed to fit)

## src/components/Page.tsx (#10, 1 symbol(s) — collapsed to fit)

---
symbol index (other defined symbols — names only; read the listed file for full signatures):
src/core/types.ts: Capability, ClaimStatus, ManufacturerAccess, IntegrationStatus, Confidence, EvidenceSource, ClaimConflict, Claim
src/core/simulation.ts: DigitalTwinAdapter
src/components/FieldSessionRecorder.tsx: LayoutShiftEntry
src/components/SDKRuntimeLab.tsx: Command, ConsoleResult
src/sdk/index.ts: SDKConnectionState, CapabilitySurface, SDKBenchmarkTrial, SDKBenchmarkReport, OpenLensSDK
src/app/workbench.tsx: Workbench
src/core/adapter-starter.ts: AdapterStarterInput, AdapterStarterFile
src/core/resilience.ts: ResilienceScenarioId, ResilienceScenarioResult, ResilienceMatrixResult, TraceDiffRow
src/core/adapter-conformance.ts: ConformanceProbe, ConformanceCheck, ConformanceReport
src/app/router.ts: Route, RouteState
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd-lstm.wasm.js: Aa, La, k
src/core/scenario.ts: ScenarioCapsule, ImportedScenarioCapsule
src/core/benchmark-facets.ts: BenchmarkFamily, BenchmarkFacet
src/core/environment.ts: EnvironmentAssessment
src/ai/vision-signals.ts: VisualSignalProfile
src/core/ai-router.ts: AITask, AIRuntimeCapabilities, AIRouteRequest, AIRouteDecision
src/ai/types.ts: OcrResult, OcrMessage, OcrRequest
src/ai/phrasebook.ts: PhrasebookLanguage, Entry, PhrasebookTranslation
src/components/FeatureGuide.tsx: GuideStep
src/components/CommandPalette.tsx: PaletteEntry
src/components/VisitorPathfinder.tsx: PathId
src/core/fit.ts: CapabilityPriority, DeveloperAccessRequirement, ExecutionRequirement, FitVerdict, FitRequirements, DeviceFitResult
src/components/BrowserReadiness.tsx: Check
src/pages/Lab.tsx: Scenario
src/components/DeviceCapabilityMatrix.tsx: MatrixMode
src/components/VirtualWorldScene.tsx: VirtualWorldSceneProps
src/core/types.ts: RELEASE_VERSION, ENGINE_VERSION
src/core/simulation.ts: seededRandom, finish
src/components/FieldSessionRecorder.tsx: empty, supportedTypes
src/components/SDKRuntimeLab.tsx: run, push
src/sdk/index.ts: connect, disconnect
src/data/devices.ts: getDevice, validateDeviceId
src/app/workbench.tsx: setDeviceId, setExperience
public/ocr/worker.min.js: at, it
src/components/Page.tsx: Page
src/core/adapter-starter.ts: validateAdapterStarter, buildAdapterStarter
src/core/compiler.ts: hash, compileExperience
src/core/resilience.ts: runResilienceMatrix, diffTraces
src/components/HomeDeviceSwitchboard.tsx: show, simulate
src/App.tsx: update
src/core/adapter-conformance.ts: requiredPaths, evaluateAdapterBundle
src/components/LocalAI.tsx: stopWorker, stopCamera
src/app/router.ts: parseHash
src/ai/images.ts: validateDimensions, text
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: a, a
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: a, a
public/ocr/core/tesseract-core-simd.wasm.js: a, a
public/ocr/core/tesseract-core.wasm.js: a, a
public/ocr/core/tesseract-core-lstm.wasm.js: a, a
public/ocr/core/tesseract-core-simd-lstm.wasm.js: a, a
src/core/scenario.ts: createScenarioCapsule, importScenarioCapsule
src/core/benchmark.ts: statistics, benchmark
src/core/benchmark-facets.ts: clamp, benchmarkFacets
src/core/environment.ts: clamp, assessEnvironment
src/core/experience.ts: parseExperience, validateExperience
src/ai/vision-signals.ts: clamp, analyzeImageBlob
src/core/ai-router.ts: planAIRoute, local
src/ai/phrasebook.ts: entry, translateSignText
src/components/FeatureGuide.tsx: FeatureGuide
src/adapters/registry.ts: getAdapter
src/components/CommandPalette.tsx: navigate, choose
src/components/HomeSignalDemo.tsx: HomeSignalDemo, choose
src/components/VisitorPathfinder.tsx: escape, trap
src/core/fit.ts: evaluateDeviceFit, fitDevices
src/components/ExperienceLayer.tsx: ExperienceLayer, setProgress
scripts/audit-live.mjs: report, url
src/components/BrowserReadiness.tsx: BrowserReadiness, add
src/mobile.ts: update, useMobile
src/pages/Lab.tsx: update, chooseScenario
src/components/AIRouterLab.tsx: AIRouterLab, update
src/app/Shell.tsx: Mark, handleKey
src/components/ResilienceMatrix.tsx: save, run
src/pages/Compiler.tsx: Compiler, update
src/components/AdapterConformanceLab.tsx: AdapterConformanceLab, run
src/core/fixtures.ts: resolveFixture
src/components/TraceViewer.tsx: save, TraceViewer
src/pages/Benchmarks.tsx: save, run
src/core/exchange.ts: importRun, importArtifact
src/components/RunPlayback.tsx: RunPlayback, play
src/core/specifications.ts: formatSpecification, sourcesForClaim
src/components/ScenarioCapsulePanel.tsx: apply, load
src/components/BenchmarkScorecard.tsx: BenchmarkScorecard
src/components/DeviceCapabilityMatrix.tsx: state
src/components/DeviceDoctor.tsx: DeviceDoctor
src/components/DeviceFitEngine.tsx: DeviceFitEngine, setPriority
src/components/FixtureScene.tsx: FixtureScene
src/components/SimulationControls.tsx: SimulationControls, change
src/components/VirtualWorldScene.tsx: VirtualWorldScene
src/examples/openlens-sdk-example.ts: runOpenLensSDKExample
tests/integrity.test.ts: run
src/pages/Developers.tsx: save, toggle
scripts/check-performance-budget.mjs: walk, size
src/ai/ocr.worker.ts: report
src/components/Glasses.tsx: Glasses
src/pages/Devices.tsx: jumpTo, toggle
src/pages/Methodology.tsx: jump
src/pages/Research.tsx: requestedDevice, Research

[87 low-rank file(s) collapsed: ./* (3), public/ocr/core/* (6), scripts/* (4), src/* (4), src/adapters/* (1), src/ai/* (6), src/app/* (2), src/components/* (23), src/core/* (15), src/examples/* (1), src/pages/* (8), tests/* (14)]
