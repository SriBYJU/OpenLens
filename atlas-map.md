# atlas: OpenLens (4892 LOC, 92 files) | budget 3600 | rendered 3450 tok | public API only, parameter names omitted to fit budget — raise --budget

## src/core/types.ts (#1 — imported by 15 file(s))
    export interface EvidenceSource { id:string; title:string; url:string; publisher:string; accessed:string; confidence:Confidence; note:string }
    export interface PlanStep { id:string; label:string; stage:'input'|'process'|'output'; capability:Capability|null; route:PlanRoute; reason:string; fallback?:boolean }
    export interface ArtifactVersions { release:string; engine:string; catalog:string; methodology:string; schema:number }
    export interface RunResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; deviceSnapshot:Pick<DeviceProfile,'id'|'revision'|'name'|'manufacturer'|'integrationStatus'|'optics'>; adapterSnapshot:AdapterManifest|null; seed:number; status:'success'|'failed'|'blocked'; totalMs:number; output:string|null; trace:TraceEvent[]; config:SimulationConfig; plan:CompiledPlan }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
… (177 more symbol(s))
used by: src/adapters/registry.ts, src/core/adapter-starter.ts, src/core/benchmark-facets.ts, src/core/benchmark.ts, src/core/compiler.ts, src/core/environment.ts, src/core/exchange.ts, src/core/experience.ts

## src/components/FieldSessionRecorder.tsx (#3 — imported by 1 file(s))
type Phase='ready'|'recording'|'stopped'
interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
    interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
type LayoutShiftEntry=PerformanceEntry&{value:number;hadRecentInput:boolean}
const empty=():FieldMetrics=>({elapsedMs:0,lcpMs:null,cls:0,longTasks:0,longestLongTaskMs:0,longestInteractionMs:null,responseProbesMs:[],domContentLoadedMs:null,loadMs:null})
const round=(number, digits=1)=>Number(value.toFixed(digits))
export default function FieldSessionRecorder()
const snapshot=()=>{if(started.current)live.current.elapsedMs=round(performance.now()-started.current);setMetrics({...live.current,responseProbesMs:[...live.current.responseProbesMs]})}
const release=()=>{observers.current.forEach(observer=>observer.disconnect());observers.current=[];if(timer.current)clearInterval(timer.current);timer.current=null}
const observe=(string, (entry:PerformanceEntry)=>void, buffered=false)=>{if(!PerformanceObserver.supportedEntryTypes.includes(type))return;const observer=new PerformanceObserver(list=>{list.getEntries().forEach(read)});observer.observe({type,buffered});observers.current.push(observer)}
const start=()=>
const stop=()=>{snapshot();release();started.current=0;setPhase('stopped');setMessage('Recording stopped. Review or download this local artifact, then clear it.');}
const probe=()=>{const probeStarted=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>{live.current.responseProbesMs.push(round(performance.now()-probeStarted));snapshot()}))}
const clear=()=>{release();started.current=0;live.current=empty();setMetrics(empty());setPhase('ready');setMessage('Session cleared from memory. No browser measurements are being collected.');}
const download=()=>
imports: src/core/index.ts
used by: src/pages/Benchmarks.tsx

## src/core/simulation.ts (#4, 14 symbol(s) — collapsed to fit)

## src/data/devices.ts (#5 — imported by 12 file(s))
const cap=(CapabilityInfo['physical'], CapabilityInfo['manufacturerAccess'], string, string[]=[]):CapabilityInfo=>({physical,manufacturerAccess,note,sourceIds})
const source=(string, string, string, string, string, EvidenceSource['confidence']='high'):EvidenceSource=>({id,title,url,publisher,accessed:'2026-09-10',confidence,note})
const claim=<T,>(T|null, Claim<T>['status'], string[], string, Confidence='high', Claim<T>['conflicts']):Claim<T>=>({value,status,sourceIds,confidence,...(note?{note}:{}),...(conflicts?.length?{conflicts}:{})})
const unknown=<T,>(note='No current first-party value is recorded.'):Claim<T>=>claim<T>(null,'unknown',[],note,'low')
const specs=(Partial<DeviceSpecifications>={}):DeviceSpecifications=>(
export function getDevice(string){return [...devices,...modeledDevices].find(device=>device.id===id)??devices[0]}
export function validateDeviceId(string|null){return id&&[...devices,...modeledDevices].some(device=>device.id===id)?id:'openlens-twin'}
imports: src/core/types.ts
used by: src/adapters/registry.ts, src/app/workbench.tsx, src/components/CommandPalette.tsx, src/components/DeviceFitEngine.tsx, src/components/HomeDeviceSwitchboard.tsx, src/core/exchange.ts, src/core/scenario.ts, src/core/simulation.ts

## src/app/workbench.tsx (#6, 24 symbol(s) — collapsed to fit)

## public/ocr/worker.min.js (#7, 66 symbol(s) — collapsed to fit)

## src/components/Page.tsx (#8 — imported by 8 file(s))
export default function Page({index:string;eyebrow:string;title:ReactNode;lead:string;actions?:ReactNode;children:ReactNode;className?:string})
used by: src/pages/About.tsx, src/pages/Benchmarks.tsx, src/pages/Compiler.tsx, src/pages/Developers.tsx, src/pages/Devices.tsx, src/pages/Lab.tsx, src/pages/Methodology.tsx, src/pages/Research.tsx

## src/core/adapter-starter.ts (#9, 12 symbol(s) — collapsed to fit)

## src/components/HomeDeviceSwitchboard.tsx (#10 — imported by 1 file(s))
const show=(string|number|null, suffix='')=>value===null?'Unknown':`${value}${suffix}`
const simulate=()=>{const modelId=`model-${device.id}`;work.setDeviceId(modelId);location.hash=`#/lab?device=${modelId}`}
imports: src/app/workbench.tsx, src/core/index.ts, src/data/devices.ts
used by: src/components/Home.tsx

## src/core/compiler.ts (#11, 3 symbol(s) — collapsed to fit)

---
symbol index (other defined symbols — names only; read the listed file for full signatures):
src/core/types.ts: Capability, ClaimStatus, ManufacturerAccess, IntegrationStatus, Confidence, EvidenceSource, ClaimConflict, Claim
src/core/simulation.ts: DigitalTwinAdapter
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
src/ai/types.ts: OcrResult, OcrMessage, OcrRequest
src/ai/phrasebook.ts: PhrasebookLanguage, Entry, PhrasebookTranslation
src/components/FeatureGuide.tsx: GuideStep
src/components/CommandPalette.tsx: PaletteEntry
src/components/VisitorPathfinder.tsx: PathId
src/components/BrowserReadiness.tsx: Check
src/core/fit.ts: CapabilityPriority, DeveloperAccessRequirement, ExecutionRequirement, FitVerdict, FitRequirements, DeviceFitResult
src/core/ai-router.ts: AITask, AIRuntimeCapabilities, AIRouteRequest, AIRouteDecision
src/pages/Lab.tsx: Scenario
src/components/DeviceCapabilityMatrix.tsx: MatrixMode
src/components/VirtualWorldScene.tsx: VirtualWorldSceneProps
src/core/types.ts: RELEASE_VERSION, ENGINE_VERSION
src/core/simulation.ts: add, at
src/app/workbench.tsx: setDeviceId, setExperience
public/ocr/worker.min.js: at, it
src/core/adapter-starter.ts: validateAdapterStarter, buildAdapterStarter
src/core/compiler.ts: hash, compileExperience
src/core/resilience.ts: runResilienceMatrix, diffTraces
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
src/core/benchmark-facets.ts: clamp, benchmarkFacets
src/core/benchmark.ts: statistics, benchmark
src/core/environment.ts: clamp, assessEnvironment
src/core/experience.ts: parseExperience, validateExperience
src/ai/vision-signals.ts: clamp, analyzeImageBlob
src/ai/phrasebook.ts: entry, translateSignText
src/adapters/registry.ts: getAdapter
src/components/FeatureGuide.tsx: FeatureGuide
src/components/CommandPalette.tsx: navigate, choose
src/components/HomeSignalDemo.tsx: HomeSignalDemo, choose
src/components/VisitorPathfinder.tsx: escape, trap
src/components/BrowserReadiness.tsx: BrowserReadiness, add
src/core/fit.ts: evaluateDeviceFit, fitDevices
src/core/ai-router.ts: planAIRoute, local
src/components/ExperienceLayer.tsx: ExperienceLayer, setProgress
scripts/audit-live.mjs: report, url
src/mobile.ts: update, useMobile
src/pages/Lab.tsx: update, chooseScenario
src/components/AIRouterLab.tsx: AIRouterLab, update
src/app/Shell.tsx: Mark, handleKey
src/pages/Compiler.tsx: Compiler, update
src/core/fixtures.ts: resolveFixture
src/core/exchange.ts: importRun, importArtifact
src/components/TraceViewer.tsx: save, TraceViewer
src/components/ResilienceMatrix.tsx: save, run
src/components/RunPlayback.tsx: RunPlayback, play
src/components/AdapterConformanceLab.tsx: AdapterConformanceLab, run
src/core/specifications.ts: formatSpecification, sourcesForClaim
src/components/ScenarioCapsulePanel.tsx: apply, load
src/components/BenchmarkScorecard.tsx: BenchmarkScorecard
src/pages/Benchmarks.tsx: save, run
src/components/DeviceCapabilityMatrix.tsx: state
src/components/DeviceDoctor.tsx: DeviceDoctor
src/components/DeviceFitEngine.tsx: DeviceFitEngine, setPriority
src/components/FixtureScene.tsx: FixtureScene
src/components/SimulationControls.tsx: SimulationControls, change
src/components/VirtualWorldScene.tsx: VirtualWorldScene
src/pages/Developers.tsx: save, toggle
scripts/check-performance-budget.mjs: walk, size
src/ai/ocr.worker.ts: report
src/components/Glasses.tsx: Glasses
src/pages/Devices.tsx: jumpTo, toggle
src/pages/Methodology.tsx: jump
src/pages/Research.tsx: requestedDevice, Research
tests/integrity.test.ts: run

[82 low-rank file(s) collapsed: ./* (3), public/ocr/core/* (6), scripts/* (4), src/* (4), src/adapters/* (1), src/ai/* (6), src/app/* (2), src/components/* (22), src/core/* (13), src/pages/* (8), tests/* (13)]
