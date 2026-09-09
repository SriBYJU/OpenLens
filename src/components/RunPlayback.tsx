import {useEffect,useState} from 'react';
import type {RunResult} from '../core';

export default function RunPlayback({run}:{run:RunResult}){
 const [position,setPosition]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [speed,setSpeed]=useState(1);
 const ended=position>=run.totalMs;
 useEffect(()=>{
  if(!playing||ended)return;
  const timer=setInterval(()=>setPosition(current=>Math.min(run.totalMs,current+25*speed)),25);
  return()=>clearInterval(timer);
 },[playing,ended,run.totalMs,speed]);
 const current=run.trace.find(event=>event.elapsedMs+event.durationMs>position)??run.trace.at(-1)!;
 const play=()=>{if(ended)setPosition(0);setPlaying(value=>!value||ended)};
 return <section className="run-playback panel-dark" aria-label="Simulation trace playback">
  <header><div><p className="eyebrow">PIPELINE REPLAY</p><h2>Follow the signal.</h2></div><span>{Math.round(position)} / {run.totalMs} simulated ms</span></header>
  <p>Replay the recorded spans. Playback speed changes the presentation; it does not change benchmark timing.</p>
  <div className="playback-stages">{run.trace.filter(event=>event.stage!=='session').map(event=><article key={event.id} className={`${current.id===event.id?'active':''} ${position>=event.elapsedMs+event.durationMs?event.status:''}`}><span>{event.stage}</span><strong>{event.message}</strong><small>{event.durationMs} ms · {event.route}</small></article>)}</div>
  <div className="button-row"><button className="button primary" onClick={play} disabled={run.totalMs===0}>{playing&&!ended?'Pause replay':ended?'Replay again':'Play trace'}</button><button className="button" onClick={()=>{setPlaying(false);const next=run.trace.find(event=>event.elapsedMs>position);setPosition(next?.elapsedMs??run.totalMs)}} disabled={ended}>Next stage</button><label>Playback speed<select value={speed} onChange={event=>setSpeed(Number(event.target.value))}><option value="0.1">0.1× slow inspection</option><option value="0.5">0.5×</option><option value="1">1×</option></select></label></div>
  <label>Trace position<input type="range" min="0" max={Math.max(1,run.totalMs)} value={position} onChange={event=>{setPlaying(false);setPosition(Number(event.target.value))}}/></label>
  <p role="status">{ended?`${run.status.toUpperCase()}: ${run.output??current.message}`:current.message}</p>
 </section>;
}
