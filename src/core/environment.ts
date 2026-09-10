import type {Capability,EnvironmentConfig,InputMode} from './types';

export interface EnvironmentAssessment{
 score:number;
 grade:'clear'|'strained'|'unusable';
 inputPenaltyMs:number;
 processPenaltyMs:number;
 outputPenaltyMs:number;
 factors:string[];
}

export const defaultEnvironment:EnvironmentConfig={illuminationLux:500,headMotionDps:5,ambientNoiseDb:35};
export const environmentPresets=[
 {id:'studio',label:'Studio',description:'500 lux · 5°/s · 35 dB',environment:defaultEnvironment},
 {id:'night',label:'Night walk',description:'8 lux · 70°/s · 45 dB',environment:{illuminationLux:8,headMotionDps:70,ambientNoiseDb:45}},
 {id:'transit',label:'Crowded transit',description:'180 lux · 35°/s · 82 dB',environment:{illuminationLux:180,headMotionDps:35,ambientNoiseDb:82}},
 {id:'sun',label:'Direct sun',description:'45k lux · 12°/s · 58 dB',environment:{illuminationLux:45000,headMotionDps:12,ambientNoiseDb:58}},
] as const;

const clamp=(value:number,min=0,max=100)=>Math.min(max,Math.max(min,value));

export function assessEnvironment(input:InputMode,output:Capability|null|undefined,environment:EnvironmentConfig):EnvironmentAssessment{
 let score=100;let inputPenaltyMs=0;let outputPenaltyMs=0;const factors:string[]=[];
 if(input==='camera'){
  if(environment.illuminationLux<50){const penalty=(50-environment.illuminationLux)/50*48;score-=penalty;inputPenaltyMs+=Math.round(penalty*2.2);factors.push('low-light camera stress')}
  if(environment.illuminationLux>20000){const penalty=Math.min(30,(environment.illuminationLux-20000)/25000*30);score-=penalty;inputPenaltyMs+=Math.round(penalty*1.4);factors.push('bright-scene glare stress')}
  if(environment.headMotionDps>30){const penalty=Math.min(38,(environment.headMotionDps-30)/90*38);score-=penalty;inputPenaltyMs+=Math.round(penalty*2);factors.push('motion-blur stress')}
 }
 if(input==='microphone'&&environment.ambientNoiseDb>55){const penalty=Math.min(58,(environment.ambientNoiseDb-55)/35*58);score-=penalty;inputPenaltyMs+=Math.round(penalty*2);factors.push('speech masking stress')}
 if(output==='display'&&environment.illuminationLux>10000){const penalty=Math.min(32,(environment.illuminationLux-10000)/35000*32);score-=penalty;outputPenaltyMs+=Math.round(penalty);factors.push('display contrast stress')}
 if(output==='audio'&&environment.ambientNoiseDb>60){const penalty=Math.min(35,(environment.ambientNoiseDb-60)/30*35);score-=penalty;outputPenaltyMs+=Math.round(penalty);factors.push('audio masking stress')}
 score=Math.round(clamp(score));
 const processPenaltyMs=Math.round((100-score)*.7);
 if(!factors.length){const changed=environment.illuminationLux!==defaultEnvironment.illuminationLux||environment.headMotionDps!==defaultEnvironment.headMotionDps||environment.ambientNoiseDb!==defaultEnvironment.ambientNoiseDb;factors.push(changed?'declared conditions do not stress the active route':'nominal synthetic conditions')}
 return{score,grade:score<25?'unusable':score<70?'strained':'clear',inputPenaltyMs,processPenaltyMs,outputPenaltyMs,factors};
}
