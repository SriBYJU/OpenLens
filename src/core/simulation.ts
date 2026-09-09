import type { CompiledPlan, DeviceAdapter, DeviceProfile, RunResult, SimulationConfig, TraceEvent } from './types';

export const defaultSimulationConfig: SimulationConfig = { seed:42, startTime:'2026-09-08T12:00:00.000Z', inputMs:90, processMs:240, outputMs:40, bridgeMs:80, jitter:0.15, failureRate:0, failureMode:'none' };
export function validateSimulationConfig(value: unknown): SimulationConfig {
  if (!value || typeof value !== 'object') throw new Error('Simulation configuration must be an object.');
  const c = value as Record<string, unknown>;
  if (!Number.isSafeInteger(c.seed) || Number(c.seed)<0 || Number(c.seed)>4294967295) throw new Error('Seed must be an unsigned 32-bit integer.');
  if (typeof c.startTime !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(c.startTime) || !Number.isFinite(Date.parse(c.startTime))) throw new Error('Start time must be an ISO UTC timestamp.');
  for (const key of ['inputMs','processMs','outputMs','bridgeMs']) if (typeof c[key] !== 'number' || !Number.isFinite(c[key]) || c[key]<0 || c[key]>60000) throw new Error(`${key} must be between 0 and 60,000 ms.`);
  for (const key of ['jitter','failureRate']) if (typeof c[key] !== 'number' || !Number.isFinite(c[key]) || c[key]<0 || c[key]>1) throw new Error(`${key} must be between 0 and 1.`);
  if (!['none','permission','disconnect','timeout'].includes(String(c.failureMode))) throw new Error('Unknown failure mode.');
  return { seed:c.seed as number, startTime:c.startTime, inputMs:c.inputMs as number, processMs:c.processMs as number, outputMs:c.outputMs as number, bridgeMs:c.bridgeMs as number, jitter:c.jitter as number, failureRate:c.failureRate as number, failureMode:c.failureMode as SimulationConfig['failureMode'] };
}

/** Mulberry32: seeded deterministic draws, intentionally unrelated to real device speed. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (state + 0x6d2b79f5) >>> 0; let t = Math.imul(state ^ state >>> 15, 1 | state); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function fixtureOutput(plan: CompiledPlan): string {
  const { task,language } = plan.experience;
  if (task === 'translate') return language === 'Spanish' ? 'Fixture · “Salida a la izquierda” — Exit to the left.' : `Fixture · Translation placeholder (${language}): Exit to the left. No translation model was called.`;
  if (task === 'describe') return 'Fixture · A sunlit street with a café on the left. No camera image was analyzed.';
  if (task === 'caption') return 'Fixture · “Let’s meet at the café at three.” No microphone was recorded.';
  return 'Fixture · Your reminder is ready. No external reminder was scheduled.';
}
export function simulate(plan: CompiledPlan, configuration: SimulationConfig = defaultSimulationConfig): RunResult {
  const config = validateSimulationConfig(configuration);
  const random = seededRandom(config.seed);
  const trace: TraceEvent[] = [];
  let elapsed = 0;
  const append = (stage: TraceEvent['stage'],status: TraceEvent['status'],message: string,durationMs = 0) => { elapsed += durationMs; trace.push({ id:`event-${trace.length+1}`, timestamp:new Date(Date.parse(config.startTime)+elapsed).toISOString(), elapsedMs:elapsed, stage,status,message,durationMs }); };
  const finish = (status: RunResult['status']): RunResult => ({version:1,id:`sim-${plan.deviceId}-${config.seed}-${config.startTime}`,mode:'simulation',deviceId:plan.deviceId,seed:config.seed,status,totalMs:elapsed,output:status==='success'?fixtureOutput(plan):null,trace,config:{...config},plan:structuredClone(plan)});
  append('session','info',`Digital twin initialized with seed ${config.seed}. All durations are illustrative, not measured hardware latency.`);
  if (plan.compatibility === 'blocked' || plan.steps.some(s=>s.route==='blocked')) { append('session','failure','Plan blocked by capability constraints.'); return finish('blocked'); }
  for (const step of plan.steps) {
    const base = step.stage === 'input' ? config.inputMs : step.stage === 'process' ? config.processMs : config.outputMs;
    const overhead = step.route === 'bridge' || step.route === 'companion' && step.stage !== 'process' ? config.bridgeMs : 0;
    const duration = Math.round((base+overhead)*(1+(random()*2-1)*config.jitter));
    const sampledFailure = random() < config.failureRate;
    const injectedFailure = (config.failureMode==='permission' && step.stage==='input') || (config.failureMode==='disconnect' && step.stage==='output') || (config.failureMode==='timeout' && step.stage==='process');
    if (injectedFailure || sampledFailure) { append(step.stage,'failure',`${step.label}: ${injectedFailure ? config.failureMode : 'seeded transient failure'}. Run stopped; subsequent stages were not executed.`,duration); return finish('failed'); }
    append(step.stage,'success',`${step.label} · ${step.route} (simulated)`,duration);
  }
  append('session','success','Simulation complete. Fixture output produced.');
  return finish('success');
}

export class DigitalTwinAdapter implements DeviceAdapter {
  readonly mode = 'simulation' as const;
  readonly id: string;
  private connected = false;
  constructor(private readonly device: DeviceProfile) { this.id = `twin:${device.id}`; }
  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  getCapabilities() { return structuredClone(this.device.capabilities); }
  async execute(plan: CompiledPlan, config: SimulationConfig): Promise<RunResult> {
    if (!this.connected) throw new Error('Digital twin is not connected.');
    if (plan.deviceId !== this.device.id) throw new Error('Plan device does not match adapter.');
    return simulate(plan, config);
  }
}
