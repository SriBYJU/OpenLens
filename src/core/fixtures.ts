import type {CompiledPlan,SimulationConfig} from './types';

export const fixtures={
 'street-sign':{text:'SORTIE',scene:'A French exit sign is centered on a park wayfinding board.',translations:{english:'EXIT',spanish:'SALIDA',french:'SORTIE',german:'AUSGANG',italian:'USCITA'}},
 conversation:{text:'The next turn is on your left.',scene:'Two speakers are detected in a conversation.',translations:{english:'The next turn is on your left.',spanish:'El siguiente giro es a la izquierda.',french:'Le prochain virage est à gauche.',german:'Die nächste Abzweigung ist links.',italian:'La prossima svolta è a sinistra.'}},
 'museum-label':{text:'Optical instruments, 1847',scene:'A framed nineteenth-century optical label is centered in view.',translations:{english:'Optical instruments, 1847',spanish:'Instrumentos ópticos, 1847',french:'Instruments optiques, 1847',german:'Optische Instrumente, 1847',italian:'Strumenti ottici, 1847'}},
 'menu-board':{text:'Tarte aux pommes · soupe du jour',scene:'A café menu lists apple tart and the soup of the day.',translations:{english:'Apple tart · soup of the day',spanish:'Tarta de manzana · sopa del día',french:'Tarte aux pommes · soupe du jour',german:'Apfelkuchen · Tagessuppe',italian:'Crostata di mele · zuppa del giorno'}},
 'document-page':{text:'Platform note: keep camera frames transient and save only with explicit action.',scene:'A document states that camera frames stay transient and require an explicit save action.',translations:{english:'Platform note: keep camera frames transient and save only with explicit action.',spanish:'Nota de plataforma: mantén los fotogramas transitorios y guarda solo con una acción explícita.',french:'Note de plateforme : gardez les images transitoires et enregistrez uniquement par une action explicite.',german:'Plattformhinweis: Kamerabilder nur flüchtig halten und nur nach ausdrücklicher Aktion speichern.',italian:'Nota di piattaforma: mantieni i fotogrammi transitori e salva solo con un’azione esplicita.'}},
 'object-shelf':{text:'Red city bicycle',scene:'A red city bicycle is centered inside the object-recognition brackets.',translations:{english:'Red city bicycle',spanish:'Bicicleta urbana roja',french:'Vélo de ville rouge',german:'Rotes Stadtfahrrad',italian:'Bicicletta urbana rossa'}},
 'debug-console':{text:'transport.disconnected after output.write',scene:'The adapter event stream reports a transport disconnect after the output write begins.',translations:{english:'Transport disconnected after output.write',spanish:'El transporte se desconectó después de output.write',french:'Le transport s’est déconnecté après output.write',german:'Transport nach output.write getrennt',italian:'Trasporto disconnesso dopo output.write'}},
} as const;

export function resolveFixture(plan:CompiledPlan,config:SimulationConfig):string|null{
 const fixture=fixtures[config.fixture];
 if(plan.experience.task==='translate'){
  const key=plan.experience.language.trim().toLowerCase();
  return Object.entries(fixture.translations).find(([language])=>language===key)?.[1]??null;
 }
 if(plan.experience.task==='caption')return `“${fixture.text}”`;
 if(plan.experience.task==='describe')return fixture.scene;
 if(plan.experience.task==='identify')return fixture.text;
 if(plan.experience.task==='assist')return 'The riverside exit is 40 meters ahead on your left.';
 if(plan.experience.task==='debug')return 'First fault: output bridge disconnected after output.write.';
 return `Reminder: ${plan.experience.prompt}`;
}
