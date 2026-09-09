# atlas: OpenLens (2005 LOC, 31 files) | budget 4096 | rendered 2790 tok | private symbols + parameter names omitted to fit budget — raise --budget

## src/core/types.ts (#1 — imported by 6 file(s))
    export interface ExperienceDefinition { version: 1; name: string; prompt: string; input: InputMode; task: TaskKind; output: OutputMode; language: string; allowFallback: boolean }
    export interface PlanStep { id: string; label: string; stage: 'input' | 'process' | 'output'; capability: Capability | null; route: 'native' | 'bridge' | 'companion' | 'blocked'; reason: string }
    export interface PlanStep { id: string; label: string; stage: 'input' | 'process' | 'output'; capability: Capability | null; route: 'native' | 'bridge' | 'companion' | 'blocked'; reason: string }
    export interface RunResult { version: 1; id: string; mode: 'simulation'; deviceId: string; seed: number; status: 'success' | 'failed' | 'blocked'; totalMs: number; output: string | null; trace: TraceEvent[]; config: SimulationConfig; plan: CompiledPlan }
    export interface Statistics { n: number; mean: number | null; median: number | null; sampleSd: number | null; min: number | null; max: number | null; samples: number[] }
    export interface Statistics { n: number; mean: number | null; median: number | null; sampleSd: number | null; min: number | null; max: number | null; samples: number[] }
    export interface Statistics { n: number; mean: number | null; median: number | null; sampleSd: number | null; min: number | null; max: number | null; samples: number[] }
    export interface BenchmarkResult { version: 1; mode: 'simulation'; plan: CompiledPlan; config: SimulationConfig; trials: number; successes: number; failures: number; successRate: number; statistics: Statistics; runs: RunResult[]; methodology: string }
… (101 more symbol(s))
used by: src/core/benchmark.ts, src/core/compiler.ts, src/core/exchange.ts, src/core/experience.ts, src/core/simulation.ts, src/data/devices.ts

## src/ai/images.ts (#2 — imported by 2 file(s))
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

## src/components/LocalAI.tsx (#3 — imported by 2 file(s))
export default function LocalAI()
function stopWorker()
function stopCamera()
const updateVoices = () => setLocalVoice(synthesis?.getVoices().find(voice => voice.localService && voice.lang.startsWith('en')) ?? null)
const onHidden = () => { if (document.hidden) stopCamera(); }
function setPreparedImage(Blob, string)
async function prepare('demo' | File)
function readImage()
const failed = (string) =>
async function startCamera()
async function capture()
function speak()
imports: src/ai/images.ts, src/ai/types.ts
used by: src/App.tsx, src/ai/check.tsx

## src/ai/types.ts (#4 — imported by 2 file(s))
export type OcrResult = { text: string; confidence: number; inferenceMs: number }
export type OcrMessage =
export type OcrRequest = { image: Blob; assetBase: string }
used by: src/ai/ocr.worker.ts, src/components/LocalAI.tsx

## src/core/simulation.ts (#5 — imported by 2 file(s))
export function validateSimulationConfig(unknown): SimulationConfig
export function seededRandom(number): () => number
function fixtureOutput(CompiledPlan): string
export function simulate(CompiledPlan, SimulationConfig = defaultSimulationConfig): RunResult
const append = (TraceEvent['stage'], TraceEvent['status'], string, durationMs = 0) => { elapsed += durationMs; trace.push({ id:`event-${trace.length+1}`, timestamp:new Date(Date.parse(config.startTime)+elapsed).toISOString(), elapsedMs:elapsed, stage,status,message,durationMs }); }
const finish = (RunResult['status']): RunResult => ({version:1,id:`sim-${plan.deviceId}-${config.seed}-${config.startTime}`,mode:'simulation',deviceId:plan.deviceId,seed:config.seed,status,totalMs:elapsed,output:status==='success'?fixtureOutput(plan):null,trace,config:{...config},plan:structuredClone(plan)})
export class DigitalTwinAdapter implements DeviceAdapter
    readonly mode = 'simulation' as const
    readonly id: string
    constructor(DeviceProfile) { this.id = `twin:${device.id}`; }
    async connect(): Promise<void> { this.connected = true; }
    async disconnect(): Promise<void> { this.connected = false; }
    getCapabilities() { return structuredClone(this.device.capabilities); }
    async execute(CompiledPlan, SimulationConfig): Promise<RunResult>
imports: src/core/types.ts
used by: src/core/benchmark.ts, src/core/exchange.ts

## src/App.tsx (#6 — imported by 1 file(s))
type Route = 'home'|'lab'|'devices'|'compiler'|'benchmarks'|'research'|'developers'|'methodology'|'about'
const routeFromHash = (): Route => { const value = location.hash.replace(/^#\/?/,'').split('/')[0] as Route; return value && value in labels ? value : 'home'; }
function useRoute(){ const [route,setRoute]=useState<Route>(routeFromHash); useEffect(()=>{const f=()=>setRoute(routeFromHash());addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]); return route; }
function useRoute(){ const [route,setRoute]=useState<Route>(routeFromHash); useEffect(()=>{const f=()=>setRoute(routeFromHash());addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]); return route; }
function Header({route:Route;onSearch:()=>void}) { const [open,setOpen]=useState(false); const nav = (items:Route[]) => items.map(key=><a key={key} className={route===key?'active':''} href={key==='home'?'#/':'#/'+key} onClick={()=>setOpen(false)}>{labels[key]}</a>); return <>
function Header({route:Route;onSearch:()=>void}) { const [open,setOpen]=useState(false); const nav = (items:Route[]) => items.map(key=><a key={key} className={route===key?'active':''} href={key==='home'?'#/':'#/'+key} onClick={()=>setOpen(false)}>{labels[key]}</a>); return <>
export default function App(){const route=useRoute();const [search,setSearch]=useState(false);useEffect(()=>{const f=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearch(true)}if(e.key==='Escape')setSearch(false)};addEventListener('keydown',f);return()=>removeEventListener('keydown',f)},[]);const page=route==='home'?<Home/>:route==='lab'?<Lab/>:route==='devices'?<Devices/>:route==='compiler'?<Compiler/>:route==='benchmarks'?<Benchmarks/>:route==='research'?<Research/>:route==='developers'?<Developers/>:route==='methodology'?<Methodology/>:<About/>;return <><Header route={route} onSearch={()=>setSearch(true)}/>{page}<Footer/>{search&&<Search close={()=>setSearch(false)}/>}</>}
imports: src/components/Glasses.tsx, src/components/Home.tsx, src/components/LocalAI.tsx, src/core/index.ts
used by: src/main.tsx

## public/ocr/worker.min.js (#7, 66 symbol(s) — collapsed to fit)

## src/mobile.ts (#8 — imported by 1 file(s))
export function useMobile(){const [mobile,setMobile]=useState(()=>matchMedia('(max-width: 760px)').matches);useEffect(()=>{const m=matchMedia('(max-width: 760px)');const update=()=>setMobile(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);return mobile;}
export function useMobile(){const [mobile,setMobile]=useState(()=>matchMedia('(max-width: 760px)').matches);useEffect(()=>{const m=matchMedia('(max-width: 760px)');const update=()=>setMobile(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);return mobile;}
used by: src/components/Home.tsx

## src/core/experience.ts (#9 — imported by 2 file(s))
export function parseExperience(string): ParseResult
export function validateExperience(unknown): ExperienceDefinition
imports: src/core/types.ts
used by: src/core/compiler.ts, src/core/exchange.ts

## src/components/Glasses.tsx (#10 — imported by 2 file(s))
export default function Glasses({compact?:boolean})
used by: src/App.tsx, src/components/Home.tsx

## src/core/exchange.ts (#11, 14 symbol(s) — collapsed to fit)

## src/components/Home.tsx (#13 — imported by 1 file(s))
export default function Home(){const ref=useRef<HTMLElement>(null);const reduce=useReducedMotion();const mobile=useMobile();const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']});const scale=useTransform(scrollYProgress,[0,.65,1],[1,mobile?1.2:2.8,mobile?1.3:4]);const opacity=useTransform(scrollYProgress,[0,.5,.95],[1,1,0]);const y=useTransform(scrollYProgress,[0,1],[0,mobile?30:150]);return <>
imports: src/components/Glasses.tsx, src/mobile.ts
used by: src/App.tsx

## src/core/benchmark.ts (#14 — imported by 1 file(s))
export function calculateStatistics(number[]): Statistics
export function benchmark(CompiledPlan, SimulationConfig = defaultSimulationConfig, trials = 20): BenchmarkResult
imports: src/core/simulation.ts, src/core/types.ts
used by: src/core/exchange.ts

## src/core/compiler.ts (#15, 2 symbol(s) — collapsed to fit)

---
symbol index (other defined symbols — names only; read the listed file for full signatures):
src/core/types.ts: Capability, Access, EvidenceSource, CapabilityInfo, DeviceProfile, InputMode, TaskKind, OutputMode
src/core/exchange.ts: ExperimentFile
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd.wasm.js: Aa, La, k
public/ocr/core/tesseract-core.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-lstm.wasm.js: Aa, La, k
public/ocr/core/tesseract-core-simd-lstm.wasm.js: Aa, La, k
public/ocr/worker.min.js: at, it
src/core/exchange.ts: exportExperiment, importExperiment
src/core/compiler.ts: compileExperience, route
src/data/devices.ts: source, getDevice
public/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js: r, c
public/ocr/core/tesseract-core-relaxedsimd.wasm.js: r, c
public/ocr/core/tesseract-core-simd.wasm.js: r, c
public/ocr/core/tesseract-core.wasm.js: r, c
public/ocr/core/tesseract-core-lstm.wasm.js: r, c
public/ocr/core/tesseract-core-simd-lstm.wasm.js: r, c
src/ai/ocr.worker.ts: report

[17 low-rank file(s) collapsed: ./* (2), public/ocr/core/* (6), scripts/* (1), src/* (2), src/ai/* (2), src/core/* (1), src/data/* (1), tests/* (2)]
