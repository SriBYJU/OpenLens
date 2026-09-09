import type { ExperienceDefinition, ParseResult } from './types';

export const experiencePresets: ExperienceDefinition[] = [
  { version: 1, name: 'Translate the world', prompt: 'Translate a sign from the camera into Spanish and show it on the display', input: 'camera', task: 'translate', output: 'display', language: 'Spanish', allowFallback: true },
  { version: 1, name: 'Live conversation captions', prompt: 'Caption speech from the microphone and show it on the display', input: 'microphone', task: 'caption', output: 'display', language: 'English', allowFallback: true },
  { version: 1, name: 'Describe a scene', prompt: 'Describe the camera scene and speak the result aloud', input: 'camera', task: 'describe', output: 'audio', language: 'English', allowFallback: true },
  { version: 1, name: 'Quiet reminder', prompt: 'Show a reminder on the display', input: 'manual', task: 'notify', output: 'display', language: 'English', allowFallback: true },
];

/** A constrained keyword grammar, not an LLM. Unrecognized intent fails visibly. */
export function parseExperience(text: string): ParseResult {
  const result: ParseResult = { parser: 'rules-based', experience: null, warnings: [], errors: [] };
  if (!text.trim() || text.length > 2000) { result.errors.push('Enter a description between 1 and 2,000 characters.'); return result; }
  const prompt = text.trim();
  if (/\b(don't|do not|never|without|not)\b/i.test(prompt)) { result.errors.push('Negation is outside this grammar. Use the structured controls to specify an experience.'); return result; }
  const tasks = (['translate', 'describe', 'caption', 'notify'] as const).filter((task) => ({translate: /\btranslat\w*\b/i, describe: /\b(describ\w*|identify|recogniz\w*)\b/i, caption: /\b(caption\w*|transcrib\w*)\b/i, notify: /\b(remind\w*|notif\w*|alert)\b/i}[task]).test(prompt));
  if (tasks.length !== 1) { result.errors.push(tasks.length ? 'Use one task per experience: translate, describe, caption, or remind.' : 'No supported task found. Try translate, describe, caption, or remind.'); return result; }
  const task = tasks[0];
  const input = /\b(microphone|speech|conversation|listen|voice)\b/i.test(prompt) ? 'microphone' : /\b(camera|scene|sign|photo|look)\b/i.test(prompt) ? 'camera' : task === 'caption' ? 'microphone' : task === 'notify' ? 'manual' : 'camera';
  const audio = /\b(speak|aloud|audio|read out)\b/i.test(prompt);
  const visual = /\b(display|show|overlay|screen)\b/i.test(prompt);
  if (audio && visual) { result.errors.push('Choose one output: display or audio.'); return result; }
  const languages = prompt.match(/\b(English|Spanish|French|German|Italian|Japanese|Hindi|Portuguese|Chinese|Korean|Arabic)\b/gi);
  const language = languages?.at(-1) ?? 'English';
  result.warnings.push('Rules-based draft. Only task, input, output, and listed languages are recognized; review the structured fields.');
  if (!languages && task === 'translate') result.warnings.push('No supported target language found; defaulted to English.');
  result.experience = { version: 1, name: task === 'translate' ? 'Translate the world' : task === 'describe' ? 'Describe a scene' : task === 'caption' ? 'Live captions' : 'Quiet reminder', prompt, input, task, output: audio ? 'audio' : 'display', language: language[0].toUpperCase() + language.slice(1).toLowerCase(), allowFallback: true };
  return result;
}

export function validateExperience(value: unknown): ExperienceDefinition {
  if (!value || typeof value !== 'object') throw new Error('Experience must be an object.');
  const e = value as Record<string, unknown>;
  if (e.version !== 1 || typeof e.name !== 'string' || !e.name.trim() || e.name.length > 100 || typeof e.prompt !== 'string' || e.prompt.length > 2000 || !['camera','microphone','manual'].includes(String(e.input)) || !['translate','describe','caption','notify'].includes(String(e.task)) || !['display','audio'].includes(String(e.output)) || typeof e.language !== 'string' || !e.language.trim() || e.language.length > 40 || typeof e.allowFallback !== 'boolean') throw new Error('Invalid experience schema.');
  if (e.task === 'caption' && e.input !== 'microphone') throw new Error('Caption requires microphone input.');
  if (e.task === 'describe' && e.input !== 'camera') throw new Error('Describe requires camera input.');
  return { version: 1, name: e.name, prompt: e.prompt, input: e.input as ExperienceDefinition['input'], task: e.task as ExperienceDefinition['task'], output: e.output as ExperienceDefinition['output'], language: e.language, allowFallback: e.allowFallback };
}
