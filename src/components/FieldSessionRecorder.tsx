import {useEffect,useRef,useState} from 'react';
import {RELEASE_VERSION} from '../core';

type Phase='ready'|'recording'|'stopped';
interface FieldMetrics{elapsedMs:number;lcpMs:number|null;cls:number;longTasks:number;longestLongTaskMs:number;longestInteractionMs:number|null;responseProbesMs:number[];domContentLoadedMs:number|null;loadMs:number|null}
type LayoutShiftEntry=PerformanceEntry&{value:number;hadRecentInput:boolean};
const empty=():FieldMetrics=>({elapsedMs:0,lcpMs:null,cls:0,longTasks:0,longestLongTaskMs:0,longestInteractionMs:null,responseProbesMs:[],domContentLoadedMs:null,loadMs:null});
const round=(value:number,digits=1)=>Number(value.toFixed(digits));
const supportedTypes=()=>typeof PerformanceObserver==='undefined'?[]:PerformanceObserver.supportedEntryTypes??[];

export default function FieldSessionRecorder(){
 const [phase,setPhase]=useState<Phase>('ready');const [metrics,setMetrics]=useState<FieldMetrics>(empty);const [message,setMessage]=useState('No browser measurements are being collected.');
 const started=useRef(0);const live=useRef<FieldMetrics>(empty());const observers=useRef<PerformanceObserver[]>([]);const timer=useRef<ReturnType<typeof setInterval>|null>(null);
 const snapshot=()=>{if(started.current)live.current.elapsedMs=round(performance.now()-started.current);setMetrics({...live.current,responseProbesMs:[...live.current.responseProbesMs]})};
 const release=()=>{observers.current.forEach(observer=>observer.disconnect());observers.current=[];if(timer.current)clearInterval(timer.current);timer.current=null};
 useEffect(()=>release,[]);
 const observe=(type:string,read:(entry:PerformanceEntry)=>void,buffered=false)=>{if(!supportedTypes().includes(type))return;const observer=new PerformanceObserver(list=>{list.getEntries().forEach(read)});observer.observe({type,buffered});observers.current.push(observer)};
 const start=()=>{
  release();const next=empty();const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;const lcp=performance.getEntriesByType('largest-contentful-paint').at(-1);
  next.lcpMs=lcp?round(lcp.startTime):null;next.domContentLoadedMs=navigation?.domContentLoadedEventEnd?round(navigation.domContentLoadedEventEnd):null;next.loadMs=navigation?.loadEventEnd?round(navigation.loadEventEnd):null;live.current=next;started.current=performance.now();
  observe('largest-contentful-paint',entry=>{live.current.lcpMs=round(entry.startTime)},true);
  observe('layout-shift',entry=>{const shift=entry as LayoutShiftEntry;if(!shift.hadRecentInput)live.current.cls=round(live.current.cls+shift.value,4)});
  observe('longtask',entry=>{live.current.longTasks++;live.current.longestLongTaskMs=Math.max(live.current.longestLongTaskMs,round(entry.duration))});
  observe('event',entry=>{if(entry.duration>=(live.current.longestInteractionMs??0))live.current.longestInteractionMs=round(entry.duration)});
  setMetrics(next);setPhase('recording');setMessage('Recording aggregate page performance in memory. Nothing is uploaded or persisted.');timer.current=setInterval(snapshot,500);
 };
 const stop=()=>{snapshot();release();started.current=0;setPhase('stopped');setMessage('Recording stopped. Review or download this local artifact, then clear it.');};
 const probe=()=>{const probeStarted=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>{live.current.responseProbesMs.push(round(performance.now()-probeStarted));snapshot()}))};
 const clear=()=>{release();started.current=0;live.current=empty();setMetrics(empty());setPhase('ready');setMessage('Session cleared from memory. No browser measurements are being collected.');};
 const download=()=>{
  const width=innerWidth;const viewport=width<600?'small-phone':width<900?'large-phone-or-tablet':width<1440?'desktop':'large-desktop';
  const artifact={version:1,openLensRelease:RELEASE_VERSION,kind:'browser-field-session',measurementBoundary:'browser-page-only',consent:'explicit-start-button',storage:'memory-until-clear-or-refresh',route:location.hash||'#/',viewport,createdAt:new Date().toISOString(),supportedEntryTypes:supportedTypes().filter(type=>['event','layout-shift','largest-contentful-paint','longtask','navigation'].includes(type)),metrics};
  const url=URL.createObjectURL(new Blob([JSON.stringify(artifact,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='openlens-browser-field-session.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);setMessage('Local browser field-session artifact downloaded.');
 };
 const latest=metrics.responseProbesMs.at(-1);
 return <section className="field-recorder" aria-labelledby="field-recorder-title"><header><div><p className="eyebrow">REAL BROWSER MEASUREMENT / EXPLICIT OPT-IN</p><h2 id="field-recorder-title">Measure this session. Keep it yours.</h2><p>Collect aggregate page responsiveness, stability, loading, and long-task signals in memory. This does not measure glasses hardware and has no analytics endpoint.</p></div><div className={`recorder-state ${phase}`}><i aria-hidden="true"/><span>{phase}</span></div></header><div className="recorder-console"><div className="recorder-actions"><p role="status" aria-live="polite">{message}</p><div className="button-row">{phase==='ready'&&<button className="button primary" onClick={start}>Start private recording</button>}{phase==='recording'&&<><button className="button primary" onClick={probe}>Run two-frame response probe</button><button className="button" onClick={stop}>Stop recording</button></>}{phase==='stopped'&&<><button className="button primary" onClick={download}>Download local JSON</button><button className="button" onClick={start}>Start new session</button><button className="button" onClick={clear}>Clear session</button></>}</div><small>No cookies · no account · no network request · no user agent · no persistent ID</small></div><div className="field-metrics"><div><span>SESSION</span><strong>{metrics.elapsedMs.toLocaleString()}</strong><small>MS RECORDED</small></div><div><span>PAGE LCP</span><strong>{metrics.lcpMs??'—'}</strong><small>MS / LIFECYCLE</small></div><div><span>CLS</span><strong>{metrics.cls}</strong><small>SINCE START</small></div><div><span>LONG TASKS</span><strong>{metrics.longTasks}</strong><small>MAX {metrics.longestLongTaskMs} MS</small></div><div><span>INTERACTION</span><strong>{metrics.longestInteractionMs??'—'}</strong><small>MAX EVENT MS</small></div><div><span>RESPONSE PROBE</span><strong>{latest??'—'}</strong><small>{metrics.responseProbesMs.length} SAMPLE{metrics.responseProbesMs.length===1?'':'S'}</small></div></div></div><footer><span>BROWSER PAGE BOUNDARY</span><p>DOMContentLoaded {metrics.domContentLoadedMs??'—'} ms · load {metrics.loadMs??'—'} ms. LCP is the current page-lifecycle reading; CLS, long tasks, interactions, and probes accumulate only after Start.</p></footer></section>;
}
