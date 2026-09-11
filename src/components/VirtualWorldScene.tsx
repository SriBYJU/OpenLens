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
 identify:'Hold the object inside the brackets, then run identification.',
 assist:'Ask where the closest exit is, then run the voice route.',
 debug:'Run the authored transport events to isolate the first fault.',
};

const targetCopy:Record<SimulationConfig['fixture'],{title:string;detail:string;scene:string}>={
 'street-sign':{title:'SORTIE',detail:'FRENCH · WAYFINDING',scene:'RIVER WALK'},
 conversation:{title:'2 SPEAKERS',detail:'LIVE AUDIO TARGET',scene:'CLASSROOM WALK'},
 'museum-label':{title:'JARDIN / 1847',detail:'HISTORIC LABEL',scene:'GARDEN ARCHIVE'},
 'menu-board':{title:'TARTE AUX POMMES',detail:'CAFÉ MENU · FRENCH',scene:'RIVERSIDE CAFÉ'},
 'document-page':{title:'PRIVACY NOTE / 04',detail:'DOCUMENT · 68 WORDS',scene:'READING TERRACE'},
 'object-shelf':{title:'CITY BICYCLE',detail:'OBJECT · TRACK 03',scene:'MOBILITY STAND'},
 'debug-console':{title:'OUTPUT.WRITE',detail:'ADAPTER TRACE · 06 EVENTS',scene:'TRANSPORT OVERLAY'},
};

export default function VirtualWorldScene({fixture,environment,task,output,status,failureMode,canRun,onRun}:VirtualWorldSceneProps){
 const light=Math.max(.28,Math.min(1.12,.3+Math.log10(environment.illuminationLux+1)/5.7));
 const blur=Math.min(3.2,environment.headMotionDps/55);
 const shift=Math.min(12,environment.headMotionDps/18);
 const noise=Math.max(0,Math.min(1,(environment.ambientNoiseDb-30)/70));
 const style={'--world-light':light,'--world-blur':`${blur}px`,'--world-shift':`${shift}px`,'--world-noise':noise} as CSSProperties;
 const target=targetCopy[fixture];
 const message=status==='failed'||status==='blocked'?'The virtual view stopped at the failed stage.':output??prompts[task];
 return <div className={`virtual-world-scene ${status??'ready'}`} data-fixture={fixture} data-task={task} style={style}>
  <img src={`${import.meta.env.BASE_URL}assets/openlens-virtual-park-v1.jpg`} alt="Photorealistic virtual park used as a simulated smart-glasses environment" draggable={false}/>
  <div className="world-exposure"/><div className="world-edge"/>
  <div className="world-origin"><span>VIRTUAL PARK / {Object.keys(targetCopy).indexOf(fixture).toString().padStart(2,'0')}</span><strong>PRAGUE · {target.scene}</strong><small>GENERATED TEST ENVIRONMENT</small></div>
  {fixture!=='conversation'&&<button type="button" disabled={!canRun} onClick={onRun} className={`world-sign world-target-${fixture}`} aria-label={`Focus ${target.title}${fixture==='street-sign'||fixture==='museum-label'?' sign':''} and run ${task}`}><small>SELECT TARGET</small><strong>{target.title}</strong><span>{target.detail} · TAP TO RUN</span>{fixture==='document-page'&&<i>Frames stay transient. Save only with explicit action.</i>}{fixture==='debug-console'&&<i>04 input.ok<br/>05 output.write<br/>06 transport.disconnect</i>}</button>}
  {fixture==='conversation'&&<button type="button" disabled={!canRun} onClick={onRun} className="world-speaker-target" aria-label={`Focus detected speakers and run ${task}`}><i/><span>2 SPEAKERS</span><strong>TAP TO {task==='caption'?'CAPTION':'RUN'}</strong></button>}
  <div className={`world-caption ${task==='caption'?'speaker-caption':''}`}><span>{status?'SIMULATED OUTPUT':'BEFORE RUN'}</span><strong>{message}</strong></div>
  <div className="world-gaze" aria-hidden="true"><i/><i/><span>{task==='caption'?'VOICE':task==='notify'?'TIME':'GAZE'}</span></div>
  <div className="world-audio" aria-hidden="true"><span>AMBIENT {environment.ambientNoiseDb} dB</span><i/><i/><i/><i/><i/></div>
  {failureMode!=='none'&&!status&&<div className="world-armed">FAILURE ARMED · {failureMode.replaceAll('-',' ')}</div>}
  {(status==='failed'||status==='blocked')&&<div className="world-failure">SIGNAL INTERRUPTED</div>}
 </div>;
}
