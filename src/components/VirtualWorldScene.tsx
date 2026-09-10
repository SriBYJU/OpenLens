import type {CSSProperties} from 'react';
import type {EnvironmentConfig,FailureMode,SimulationConfig,TaskKind} from '../core';

type VirtualWorldSceneProps={
 fixture:SimulationConfig['fixture'];
 environment:EnvironmentConfig;
 task:TaskKind;
 output:string|null|undefined;
 status:'success'|'failed'|'blocked'|undefined;
 failureMode:FailureMode;
 canRun:boolean;
 onRun:()=>void;
};

const prompts:Record<TaskKind,string>={
 translate:'Aim at the French sign, then run to translate it.',
 caption:'Speech will appear beside the detected speakers.',
 describe:'Run to describe the visible path, people, and landmark.',
 notify:'The reminder will enter the wearer’s display plane.',
};

export default function VirtualWorldScene({fixture,environment,task,output,status,failureMode,canRun,onRun}:VirtualWorldSceneProps){
 const light=Math.max(.28,Math.min(1.12,.3+Math.log10(environment.illuminationLux+1)/5.7));
 const blur=Math.min(3.2,environment.headMotionDps/55);
 const shift=Math.min(12,environment.headMotionDps/18);
 const noise=Math.max(0,Math.min(1,(environment.ambientNoiseDb-30)/70));
 const style={'--world-light':light,'--world-blur':`${blur}px`,'--world-shift':`${shift}px`,'--world-noise':noise} as CSSProperties;
 const signText=fixture==='street-sign'?'SORTIE':fixture==='museum-label'?'JARDIN / 1847':'PARK / RIVER WALK';
 const message=status==='failed'||status==='blocked'?'The virtual view stopped at the failed stage.':output??prompts[task];
 return <div className={`virtual-world-scene ${status??'ready'}`} data-fixture={fixture} data-task={task} style={style}>
  <img src={`${import.meta.env.BASE_URL}assets/openlens-virtual-park-v1.jpg`} alt="Photorealistic virtual park used as a simulated smart-glasses environment" draggable={false}/>
  <div className="world-exposure"/><div className="world-edge"/>
  <div className="world-origin"><span>VIRTUAL PARK / 01</span><strong>PRAGUE · RIVER WALK</strong><small>GENERATED TEST ENVIRONMENT</small></div>
  {fixture!=='conversation'&&<button type="button" disabled={!canRun} onClick={onRun} className="world-sign" aria-label={`Focus ${signText} sign and run ${task}`}><small>SELECT TARGET</small><strong>{signText}</strong><span>{task==='translate'?'FRENCH · TAP TO TRANSLATE':'TAP TO RUN EXPERIENCE'}</span></button>}
  {fixture==='conversation'&&<button type="button" disabled={!canRun} onClick={onRun} className="world-speaker-target" aria-label={`Focus detected speakers and run ${task}`}><i/><span>2 SPEAKERS</span><strong>TAP TO {task==='caption'?'CAPTION':'RUN'}</strong></button>}
  <div className={`world-caption ${task==='caption'?'speaker-caption':''}`}><span>{status?'SIMULATED OUTPUT':'BEFORE RUN'}</span><strong>{message}</strong></div>
  <div className="world-gaze" aria-hidden="true"><i/><i/><span>{task==='caption'?'VOICE':task==='notify'?'TIME':'GAZE'}</span></div>
  <div className="world-audio" aria-hidden="true"><span>AMBIENT {environment.ambientNoiseDb} dB</span><i/><i/><i/><i/><i/></div>
  {failureMode!=='none'&&!status&&<div className="world-armed">FAILURE ARMED · {failureMode.replaceAll('-',' ')}</div>}
  {(status==='failed'||status==='blocked')&&<div className="world-failure">SIGNAL INTERRUPTED</div>}
 </div>;
}
