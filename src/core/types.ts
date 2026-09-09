export const capabilityKeys = ['camera', 'microphone', 'display', 'audio', 'imu'] as const;
export type Capability = typeof capabilityKeys[number];
export type Access = 'native' | 'bridge' | 'unsupported' | 'unknown';
export interface EvidenceSource { id: string; title: string; url: string; accessed: string; confidence: 'high' | 'medium' | 'low'; note: string }
export interface CapabilityInfo { physical: 'present' | 'absent' | 'unknown'; access: Access; note: string; sourceIds: string[] }
export interface DeviceProfile { id: string; name: string; manufacturer: string; kind: 'digital-twin' | 'research'; summary: string; tested: false; capabilities: Record<Capability, CapabilityInfo>; sources: EvidenceSource[] }
export type InputMode = 'camera' | 'microphone' | 'manual';
export type TaskKind = 'translate' | 'describe' | 'caption' | 'notify';
export type OutputMode = 'display' | 'audio';
export interface ExperienceDefinition { version: 1; name: string; prompt: string; input: InputMode; task: TaskKind; output: OutputMode; language: string; allowFallback: boolean }
export interface ParseResult { parser: 'rules-based'; experience: ExperienceDefinition | null; warnings: string[]; errors: string[] }
export interface PlanStep { id: string; label: string; stage: 'input' | 'process' | 'output'; capability: Capability | null; route: 'native' | 'bridge' | 'companion' | 'blocked'; reason: string }
export interface CompiledPlan { version: 1; deviceId: string; deviceName: string; experience: ExperienceDefinition; compatibility: 'compatible' | 'adapted' | 'blocked'; steps: PlanStep[]; warnings: string[]; mode: 'simulation' }
export interface SimulationConfig { seed: number; startTime: string; inputMs: number; processMs: number; outputMs: number; bridgeMs: number; jitter: number; failureRate: number; failureMode: 'none' | 'permission' | 'disconnect' | 'timeout' }
export interface TraceEvent { id: string; timestamp: string; elapsedMs: number; stage: 'session' | 'input' | 'process' | 'output'; status: 'info' | 'success' | 'failure'; message: string; durationMs: number }
export interface RunResult { version: 1; id: string; mode: 'simulation'; deviceId: string; seed: number; status: 'success' | 'failed' | 'blocked'; totalMs: number; output: string | null; trace: TraceEvent[]; config: SimulationConfig; plan: CompiledPlan }
export interface Statistics { n: number; mean: number | null; median: number | null; sampleSd: number | null; min: number | null; max: number | null; samples: number[] }
export interface BenchmarkResult { version: 1; mode: 'simulation'; plan: CompiledPlan; config: SimulationConfig; trials: number; successes: number; failures: number; successRate: number; statistics: Statistics; runs: RunResult[]; methodology: string }
export interface DeviceAdapter { readonly id: string; readonly mode: 'simulation' | 'hardware'; connect(): Promise<void>; disconnect(): Promise<void>; getCapabilities(): Record<Capability, CapabilityInfo>; execute(plan: CompiledPlan, config: SimulationConfig): Promise<RunResult> }
