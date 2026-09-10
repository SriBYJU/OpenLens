import {useRef,useState} from 'react';
import {motion,useMotionValueEvent,useReducedMotion,useScroll,useTransform} from 'motion/react';
import HomeSignalDemo from './HomeSignalDemo';
import VisitorPathfinder from './VisitorPathfinder';
import HomeDeviceSwitchboard from './HomeDeviceSwitchboard';
import '../home-explorer.css';

const chapters=[
 {number:'01',label:'SENSE',title:'See every input.',body:'Camera, microphone, motion and manual triggers enter one explicit capability model.',route:'lab',metric:'3-stage route',proof:'INPUT · PROCESS · OUTPUT'},
 {number:'02',label:'UNDERSTAND',title:'Compile the intent.',body:'Turn constrained language into a reviewable graph with routes, fallbacks and privacy boundaries.',route:'compiler',metric:'4 authoring modes',proof:'TRANSLATE · CAPTION · DESCRIBE · NOTIFY'},
 {number:'03',label:'RESPOND',title:'Adapt across hardware.',body:'Compare what a device claims with what an OpenLens adapter can actually execute.',route:'devices',metric:'8 sourced profiles',proof:'PHYSICAL · ACCESS · INTEGRATION'},
 {number:'04',label:'MEASURE',title:'Keep the whole trace.',body:'Replay seeded runs, inspect failure spans and export the artifact behind every number.',route:'benchmarks',metric:'Seeded replay',proof:'RAW TRIALS · TRACE · EXPORT'},
 {number:'05',label:'BUILD',title:'Make the layer open.',body:'Generate a typed adapter boundary with lifecycle tests and an explicit verification record.',route:'developers',metric:'4-file starter',proof:'ADAPTER · TEST · README · RECORD'}
];
export default function Home(){
 const ref=useRef<HTMLElement>(null); const reduce=useReducedMotion(); const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 const [phase,setPhase]=useState(0);
 useMotionValueEvent(scrollYProgress,'change',value=>{const next=value<.22?0:value<.76?1:2;setPhase(current=>current===next?current:next)});
 const scale=useTransform(scrollYProgress,[0,.16,.4,.65,.82],[.88,1,2.1,5.5,7]);
 const y=useTransform(scrollYProgress,[0,.24,.5],['18vh','8vh','0vh']);
 const glassOpacity=useTransform(scrollYProgress,[0,.58,.76],[1,1,0]);
 const copyOpacity=useTransform(scrollYProgress,[0,.08,.22],[1,1,0]);
 const hudOpacity=useTransform(scrollYProgress,[.3,.43,.58],[0,1,0]);
 const worldOpacity=useTransform(scrollYProgress,[.57,.76,1],[0,1,1]);
 const ringScale=useTransform(scrollYProgress,[0,.42,.72],[.72,1.1,2.8]);
 const ringOpacity=useTransform(scrollYProgress,[0,.25,.65],[.25,.6,0]);
 return <main id="main" tabIndex={-1}>
  <section ref={ref} className="cinematic" data-phase={reduce?0:phase}>
   <div className="cinematic-sticky">
    <div className="ambient ambient-a"/><div className="ambient ambient-b"/><div className="grain"/>
    <motion.div className="hero-type" inert={!reduce&&phase!==0} style={reduce?{}:{opacity:copyOpacity}}><p className="eyebrow">AN OPEN WORLD. A DIFFERENT LENS.</p><h1>See the <em>system.</em></h1><p>The independent workbench for smart glasses.</p><div className="button-row"><a className="button primary" href="#/lab">Enter Lens Lab <span aria-hidden="true">↗</span></a><a className="text-link" href="#/devices">Explore the field</a></div></motion.div>
    <motion.div className="hero-depth-rings" aria-hidden="true" style={reduce?{}:{scale:ringScale,opacity:ringOpacity}}><i/><i/><i/><span/></motion.div>
    <motion.div className="glasses-stage" style={reduce?{}:{scale,y,opacity:glassOpacity}}><picture><source srcSet={`${import.meta.env.BASE_URL}assets/openlens-glasses-hero-v3.webp`} type="image/webp"/><img src={`${import.meta.env.BASE_URL}assets/openlens-glasses-hero-v2.png`} width="1774" height="887" fetchPriority="high" alt="Detailed graphite OpenLens smart glasses with smoked optical lenses" draggable={false}/></picture></motion.div>
    <motion.div className="studio-caption" style={reduce?{}:{opacity:copyOpacity}}><span>01 / THE OPTICAL TWIN</span><p>Graphite frame.<br/>Open possibilities.</p><small>CONCEPT VISUAL · SIMULATION WORKBENCH</small></motion.div>
    <motion.div className="hero-readout" style={reduce?{}:{opacity:copyOpacity}}><span>OPENLENS / PUBLIC PREVIEW</span><div><b>LOCAL-FIRST</b><b>SOURCED CLAIMS</b><b>REPLAYABLE RUNS</b></div><small>SCROLL TO ENTER THE RIGHT LENS ↓</small></motion.div>
    <motion.div className="lens-hud" aria-hidden="true" style={reduce?{}:{opacity:hudOpacity}}><span>OPTICAL TWIN / ACTIVE</span><strong>ENTERING<br/>PERCEPTION LAYER</strong><div className="hud-reticle"/><small>SIMULATION VIEWPORT · NOT A DEVICE MEASUREMENT</small></motion.div>
    <motion.div className="perception-world" inert={!!reduce||phase!==2} style={reduce?{}:{opacity:worldOpacity}}><div className="world-grid"/><div className="perception-orbit" aria-hidden="true"><span/><span/><span/><i/><i/></div><p className="eyebrow">YOU ARE THROUGH THE LENS</p><h2>Every signal becomes<br/><em>inspectable.</em></h2><div className="perception-actions"><a href="#/lab" className="button primary">Start a live simulation</a><a href="#home-live-proof" className="text-link">See it run below</a></div><div className="perception-telemetry"><span>INPUT</span><i/> <span>ROUTE</span><i/> <span>OUTPUT</span><i/> <span>EVIDENCE</span></div></motion.div>
    <div className="cinematic-progress"><span>01 / APPROACH</span><i><motion.b style={{scaleX:scrollYProgress}}/></i><span>02 / ENTER THE LENS</span><i/><span>03 / EXPLORE</span></div>
   </div>
  </section>
  <section className="manifesto"><p className="eyebrow">THE OPEN OPTICAL LAYER</p><div><h2>Glasses are becoming computers.<br/><em>Their differences should be visible.</em></h2><p>OpenLens turns a fragmented hardware landscape into an environment you can inspect, simulate, compile, trace, and benchmark. Every boundary stays attached to the work.</p></div></section>
  <VisitorPathfinder/>
  <div id="home-live-proof"><HomeSignalDemo/></div>
  <HomeDeviceSwitchboard/>
  <section className="system-atlas" aria-labelledby="system-atlas-title">
   <header className="system-atlas-head"><div><p className="eyebrow">THE SYSTEM / FIVE OPEN SURFACES</p><h2 id="system-atlas-title">Follow one signal<br/>through the stack.</h2></div><p>Each surface below opens a real tool. Move from intent to route, hardware boundary, repeatable evidence, and an adapter package you can inspect.</p></header>
   <div className="atlas-rail" aria-hidden="true"><span>INTENT</span><i/><span>ROUTE</span><i/><span>DEVICE</span><i/><span>TRACE</span><i/><span>ADAPTER</span></div>
   <div className="chapter-field">{chapters.map((chapter,index)=><a href={`#/${chapter.route}`} aria-label={`${chapter.title} Open ${chapter.label.toLowerCase()} tool`} className={`chapter chapter-${index+1} chapter-${chapter.route}`} key={chapter.number}><div className="chapter-number">{chapter.number}</div><div className="chapter-copy"><p className="eyebrow">{chapter.label}</p><h3>{chapter.title}</h3><p>{chapter.body}</p><span>OPEN {chapter.route==='lab'?'LENS LAB':chapter.route.toUpperCase()} <b>↗</b></span></div><div className="chapter-instrument" aria-hidden="true"><header><span>{chapter.route.toUpperCase()} / LIVE SURFACE</span><i>OPENLENS</i></header><div className="instrument-figure"><i/><i/><i/><b/><b/><b/><b/><b/></div><footer><strong>{chapter.metric}</strong><span>{chapter.proof}</span></footer></div></a>)}</div>
  </section>
  <section className="proof-strip"><span>NO ACCOUNT</span><span>LOCAL-FIRST</span><span>ZERO-COST CORE</span><span>VERSIONED ARTIFACTS</span><span>SOURCED CLAIMS</span></section>
  <section className="home-closing"><p className="eyebrow">OPENLENS / PUBLIC PREVIEW</p><h2>Don’t just imagine<br/>the next interface.<br/><em>Run it.</em></h2><div className="button-row"><a className="button primary" href="#/lab">Open the workbench</a><a className="text-link" href="#/compiler">Compile an idea</a></div><picture><source srcSet={`${import.meta.env.BASE_URL}assets/openlens-glasses-hero-v3.webp`} type="image/webp"/><img src={`${import.meta.env.BASE_URL}assets/openlens-glasses-hero-v2.png`} alt="" aria-hidden="true"/></picture></section>
 </main>
}
