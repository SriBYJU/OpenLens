import type { Capability, CompiledPlan, DeviceProfile, ExperienceDefinition, PlanStep } from './types';
import { validateExperience } from './experience';

export function compileExperience(definition: ExperienceDefinition, device: DeviceProfile): CompiledPlan {
  const experience = validateExperience(definition);
  const warnings: string[] = ['Execution uses a digital twin. No hardware connection or live AI inference is performed.'];
  const route = (capability: Capability, stage: 'input' | 'output'): PlanStep => {
    const info = device.capabilities[capability];
    const supported = info.physical === 'present' && (info.access === 'native' || info.access === 'bridge');
    const chosen = supported ? info.access as 'native' | 'bridge' : experience.allowFallback ? 'companion' : 'blocked';
    const reason = supported ? `${capability}: ${info.note}` : `${capability} ${info.physical === 'absent' ? 'is physically absent' : info.access === 'unknown' || info.physical === 'unknown' ? 'has unverified access' : 'is not developer-accessible'}. ${chosen === 'companion' ? 'Use the simulated companion instead.' : 'Fallback disabled; execution blocked.'}`;
    if (chosen !== 'native') warnings.push(reason);
    return { id: stage, stage, capability, label: stage === 'input' ? `Acquire ${capability} input` : `Present via ${capability}`, route: chosen, reason };
  };
  const steps: PlanStep[] = [experience.input === 'manual' ? { id:'input', stage:'input', capability:null, label:'Receive manual trigger', route:'native', reason:'Local button trigger; no device sensor required.' } : route(experience.input, 'input'), { id:'process', stage:'process', capability:null, label:`${experience.task[0].toUpperCase()}${experience.task.slice(1)} · ${experience.language}`, route:'companion', reason:'Deterministic fixture response; model inference is not integrated.' }, route(experience.output, 'output')];
  return { version:1, deviceId:device.id, deviceName:device.name, experience, mode:'simulation', steps, warnings, compatibility:steps.some(s=>s.route==='blocked') ? 'blocked' : steps.some(s=>s.stage!=='process' && (s.route==='companion'||s.route==='bridge')) ? 'adapted' : 'compatible' };
}
