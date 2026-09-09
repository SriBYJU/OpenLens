# atlas: OpenLens (2125 LOC, 48 files) | budget 4096 | rendered 3021 tok | private symbols + parameter names omitted to fit budget — raise --budget

## src/core/types.ts (#1 — imported by 7 file(s))
    export interface PlanStep { id:string; label:string; stage:'input'|'process'|'output'; capability:Capability|null; route:PlanRoute; reason:string; fallback?:boolean }
    export interface SimulationConfig { seed:number; startTime:string; inputMs:number; processMs:number; outputMs:number; bridgeMs:number; jitter:number; failureRate:number; failureMode:FailureMode; battery:number; network:'online'|'offline'|'degraded'; permission:'granted'|'denied'; fixture:'street-sign'|'conversation'|'museum-label' }
    export interface TraceEvent { id:string; parentId:string|null; timestamp:string; elapsedMs:number; stage:'session'|'input'|'process'|'output'|'system'; status:'info'|'success'|'failure'|'skipped'; message:string; durationMs:number; route:PlanRoute|'system'; metadata:Record<string,string|number|boolean|null> }
    export interface RunResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; deviceSnapshot:Pick<DeviceProfile,'id'|'revision'|'name'|'manufacturer'|'integrationStatus'|'optics'>; adapterSnapshot:AdapterManifest|null; seed:number; status:'success'|'failed'|'blocked'; totalMs:number; output:string|null; trace:TraceEvent[]; config:SimulationConfig; plan:CompiledPlan }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface Statistics { n:number; mean:number|null; median:number|null; sampleSd:number|null; min:number|null; max:number|null; samples:number[] }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
    export interface BenchmarkResult { version:2; versions:ArtifactVersions; id:string; createdAt:string; mode:'simulation'; plan:CompiledPlan; config:SimulationConfig; trials:number; successes:number; failures:number; successRate:number; statistics:Statistics; runs:RunResult[]; methodology:string }
… (155 more symbol(s))
used by: src/adapters/registry.ts, src/core/benchmark.ts, src/core/compiler.ts, src/core/exchange.ts, src/core/experience.ts, src/core/simulation.ts, src/data/devices.ts

## src/components/Page.tsx (#2 — imported by 8 file(s))
export default function Page({index:string;eyebrow:string;title:ReactNode;lead:string;actions?:ReactNode;children:ReactNode}){return <main id="main" tabIndex={-1} className="page"><header className="page-hero"><div className="page-index">{index}</div><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-lead">{lead}</p></div>{actions&&<div className="page-actions">{actions}</div>}</header>{children}</main>}
used by: src/pages/About.tsx, src/pages/Benchmarks.tsx, src/pages/Compiler.tsx, src/pages/Developers.tsx, src/pages/Devices.tsx, src/pages/Lab.tsx, src/pages/Methodology.tsx, src/pages/Research.tsx

## src/data/devices.ts (#3 — imported by 6 file(s))
const cap=(CapabilityInfo['physical'], CapabilityInfo['manufacturerAccess'], string, string[]=[]):CapabilityInfo=>({physical,manufacturerAccess,note,sourceIds})
const source=(string, string, string, string, string, EvidenceSource['confidence']='high'):EvidenceSource=>({id,title,url,publisher,accessed:'2026-09-09',confidence,note})
export function getDevice(string){return devices.find(device=>device.id===id)??devices[0]}
export function validateDeviceId(string|null){return id&&devices.some(device=>device.id===id)?id:'openlens-twin'}
imports: src/core/types.ts
used by: src/app/Shell.tsx, src/app/workbench.tsx, src/core/simulation.ts, src/pages/Devices.tsx, src/pages/Lab.tsx, src/pages/Research.tsx

## src/ai/images.ts (#4 — imported by 2 file(s))
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_IMAGE_PIXELS = 16_000_000
export const MAX_IMAGE_SIDE = 8192
export function validateImageFile(Pick<File, 'size' | 'type'>): void
export function validateDimensions(number, number): void
export function inspectImageHeader(ArrayBuffer): { width: number; height: number }
const text = (number, number) => String.fromCharCode(...bytes.slice(start, start + length))
export function canvasBlob(HTMLCanvasElement): Promise<Blob>
export async function decodeImage(File): Promise<Blob>
export async function createDemoImage(): Promise<Blob>
used by: src/components/LocalAI.tsx, tests/ai.test.ts

## src/core/simulation.ts (#5, 15 symbol(s) — collapsed to fit)

## src/app/workbench.tsx (#7 — imported by 4 file(s))
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
    interface Workbench {deviceId:string;setDeviceId:(string)=>void;experience:ExperienceDefinition;setExperience:(value:ExperienceDefinition)=>void;config:SimulationConfig;setConfig:(value:SimulationConfig)=>void;plan:CompiledPlan;run:RunResult|null;runHistory:RunResult[];runCurrent:()=>RunResult;benchmarkResult:BenchmarkResult|null;benchmarkCurrent:(trials:number)=>BenchmarkResult;clearArtifact:()=>void}
const setExperience=(ExperienceDefinition)=>{setExperienceState(value);localStorage.setItem('openlens.experience',JSON.stringify(value));setConfigState(current=>({...current,fixture:value.input==='microphone'?'conversation':value.task==='describe'?'museum-label':'street-sign'}));setRun(null);setBenchmark(null)}
const benchmarkCurrent=(number)=>{const next=benchmark(plan,config,trials);setBenchmark(next);return next}
… (14 more symbol(s))
imports: src/core/index.ts, src/data/devices.ts
used by: src/App.tsx, src/pages/Benchmarks.tsx, src/pages/Compiler.tsx, src/pages/Lab.tsx

## src/ai/types.ts (#8 — imported by 2 file(s))
export type OcrResult = { text: string; confidence: number; inferenceMs: number }
export type OcrMessage =
export type OcrRequest = { image: Blob }
used by: src/ai/ocr.worker.ts, src/components/LocalAI.tsx

## src/App.tsx (#9 — imported by 1 file(s))
export default function App(){const [state,setState]=useState<RouteState>(()=>parseHash(location.hash));useEffect(()=>{const update=()=>{setState(parseHash(location.hash));scrollTo({top:0,behavior:'instant'})};addEventListener('hashchange',update);return()=>removeEventListener('hashchange',update)},[]);const requestedDevice=state.query.get('device');return <WorkbenchProvider initialDevice={requestedDevice}><Shell route={state.route}><Suspense fallback={<main id="main" className="route-loading"><span/>Loading optical system…</main>}>{view[state.route]}</Suspense></Shell></WorkbenchProvider>}
imports: src/app/Shell.tsx, src/app/router.ts, src/app/workbench.tsx
used by: src/main.tsx

## src/app/router.ts (#10 — imported by 3 file(s))
export type Route=typeof routes[number]
export interface RouteState{route:Route;query:URLSearchParams}
    export interface RouteState{route:Route;query:URLSearchParams}
    export interface RouteState{route:Route;query:URLSearchParams}
export function parseHash(string):RouteState{const raw=hash.replace(/^#\/?/,'');const q=raw.indexOf('?');const path=(q<0?raw:raw.slice(0,q)).split('/')[0];let query=new URLSearchParams();try{query=new URLSearchParams(q<0?'':raw.slice(q+1))}catch{/* malformed values are ignored */}return{route:(routes as readonly string[]).includes(path)?path as Route:'home',query}}
used by: src/App.tsx, src/app/Shell.tsx, tests/core.test.ts

## src/components/FeatureGuide.tsx (#11, 6 symbol(s) — collapsed to fit)

## src/components/LocalAI.tsx (#12, 12 symbol(s) — collapsed to fit)

## public/ocr/worker.min.js (#13, 66 symbol(s) — collapsed to fit)

## src/adapters/registry.ts (#14, 1 symbol(s) — collapsed to fit)

---
symbol index (other defined symbols — names only; read the listed file for full signatures):
src/core/types.ts: Capability, ClaimStatus, ManufacturerAccess, IntegrationStatus, Confidence, EvidenceSource, Claim, CapabilityInfo
src/core/simulation.ts: DigitalTwinAdapter
src/app/workbench.tsx: Workbench
src/components/FeatureGuide.tsx: GuideStep
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd-lstm.wasm.js: Aa, La, k
src/core/types.ts: RELEASE_VERSION, ENGINE_VERSION
src/core/simulation.ts: at, simulate
src/app/workbench.tsx: readExperience, WorkbenchProvider
src/components/FeatureGuide.tsx: FeatureGuide
src/components/LocalAI.tsx: LocalAI, stopWorker
public/ocr/worker.min.js: at, it
src/adapters/registry.ts: getAdapter
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: a, a
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: a, a
public/ocr/core/tesseract-core-simd.wasm.js: a, a
public/ocr/core/tesseract-core.wasm.js: a, a
public/ocr/core/tesseract-core-lstm.wasm.js: a, a
public/ocr/core/tesseract-core-simd-lstm.wasm.js: a, a
src/core/experience.ts: parseExperience, validateExperience
src/core/compiler.ts: hash, compileExperience
src/components/Glasses.tsx: Glasses
src/core/benchmark.ts: statistics, benchmark
src/app/Shell.tsx: Mark, f
src/components/TraceViewer.tsx: save, TraceViewer
src/pages/Developers.tsx: download, toggle
src/mobile.ts: update, useMobile
src/core/exchange.ts: exportArtifact, importRun
src/pages/Lab.tsx: Lab, update
src/pages/Compiler.tsx: Compiler, update
src/ai/ocr.worker.ts: report
src/components/Home.tsx: Home
src/pages/Benchmarks.tsx: save, Benchmarks
src/pages/Devices.tsx: toggle
src/pages/Research.tsx: requestedDevice

[35 low-rank file(s) collapsed: ./* (3), public/ocr/core/* (6), scripts/* (1), src/* (3), src/ai/* (2), src/app/* (1), src/components/* (3), src/core/* (5), src/pages/* (8), tests/* (3)]
