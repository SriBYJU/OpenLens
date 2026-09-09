import type {CompiledPlan,SimulationConfig} from './types';

export const fixtures={
 'street-sign':{text:'SALIDA',scene:'A high-contrast exit sign is centered ahead.',translations:{english:'EXIT',spanish:'SALIDA',french:'SORTIE',german:'AUSGANG',italian:'USCITA'}},
 conversation:{text:'The next turn is on your left.',scene:'Two speakers are detected in a conversation.',translations:{english:'The next turn is on your left.',spanish:'El siguiente giro es a la izquierda.',french:'Le prochain virage est à gauche.',german:'Die nächste Abzweigung ist links.',italian:'La prossima svolta è a sinistra.'}},
 'museum-label':{text:'Optical instruments, 1847',scene:'A framed nineteenth-century optical label is centered in view.',translations:{english:'Optical instruments, 1847',spanish:'Instrumentos ópticos, 1847',french:'Instruments optiques, 1847',german:'Optische Instrumente, 1847',italian:'Strumenti ottici, 1847'}},
} as const;

export function resolveFixture(plan:CompiledPlan,config:SimulationConfig):string|null{
 const fixture=fixtures[config.fixture];
 if(plan.experience.task==='translate'){
  const key=plan.experience.language.trim().toLowerCase();
  return Object.entries(fixture.translations).find(([language])=>language===key)?.[1]??null;
 }
 if(plan.experience.task==='caption')return `“${fixture.text}”`;
 if(plan.experience.task==='describe')return fixture.scene;
 return `Reminder: ${plan.experience.prompt}`;
}
