import {useRef} from 'react';
import {motion,useReducedMotion,useScroll,useTransform} from 'motion/react';

const chapters=[
 ['01','SENSE','See every input.','Camera, microphone, motion and manual triggers enter one explicit capability model.','lab'],
 ['02','UNDERSTAND','Compile the intent.','Turn constrained language into a reviewable graph with routes, fallbacks and privacy boundaries.','compiler'],
 ['03','RESPOND','Adapt across hardware.','Compare what a device claims with what an OpenLens adapter can actually execute.','devices'],
 ['04','MEASURE','Keep the whole trace.','Replay seeded runs, inspect failure spans and export the artifact behind every number.','benchmarks'],
 ['05','BUILD','Make the layer open.','Typed contracts, local-first tools and research methods that stay readable end to end.','developers']
];
export default function Home(){
 const ref=useRef<HTMLElement>(null); const reduce=useReducedMotion(); const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
 const scale=useTransform(scrollYProgress,[0,.12,.34,.56,.76],[.72,.92,1.45,3.8,7]);
 const x=useTransform(scrollYProgress,[0,.2,.45,.72],['6%','0%','-9%','-39%']);
 const rotate=useTransform(scrollYProgress,[0,.2,.5],[5,0,-2]);
 const copyOpacity=useTransform(scrollYProgress,[0,.13,.28],[1,.85,0]);
 const hudOpacity=useTransform(scrollYProgress,[.42,.58,.78],[0,1,0]);
 const worldOpacity=useTransform(scrollYProgress,[.67,.8,1],[0,1,1]);
 return <main id="main">
  <section ref={ref} className="cinematic">
   <div className="cinematic-sticky">
    <div className="ambient ambient-a"/><div className="ambient ambient-b"/><div className="grain"/>
    <motion.div className="hero-type" style={reduce?{}:{opacity:copyOpacity}}><p className="eyebrow">OPEN DEVELOPMENT / SIMULATION / RESEARCH</p><h1>See the<br/><em>system.</em></h1><p>Build for smart glasses without hiding the differences.</p><div className="button-row"><a className="button primary" href="#/lab">Enter Lens Lab</a><a className="text-link" href="#/devices">Explore the field</a></div></motion.div>
    <motion.div className="glasses-stage" style={reduce?{}:{scale,x,rotate}}><img src={`${import.meta.env.BASE_URL}assets/openlens-glasses-hero-v2.png`} alt="Detailed graphite OpenLens smart glasses with smoked optical lenses" draggable={false}/><div className="glass-caustic" aria-hidden="true"/></motion.div>
    <div className="optic-callout callout-camera"><i/>01 / CAMERA ARRAY</div><div className="optic-callout callout-display"><i/>02 / WAVEGUIDE</div><div className="optic-callout callout-hinge"><i/>03 / COMPUTE HINGE</div>
    <motion.div className="lens-hud" style={reduce?{}:{opacity:hudOpacity}}><span>OPTICAL TWIN / ACTIVE</span><strong>ENTERING<br/>PERCEPTION LAYER</strong><div className="hud-reticle"/><small>SIMULATION VIEWPORT · NOT A DEVICE MEASUREMENT</small></motion.div>
    <motion.div className="perception-world" style={reduce?{}:{opacity:worldOpacity}}><div className="world-grid"/><p className="eyebrow">YOU ARE THROUGH THE LENS</p><h2>Every signal becomes<br/><em>inspectable.</em></h2><a href="#/lab" className="button primary">Start a live simulation</a></motion.div>
    <div className="cinematic-progress"><span>APPROACH</span><i/><span>ENTER</span><i/><span>PERCEIVE</span></div>
   </div>
  </section>
  <section className="manifesto"><p className="eyebrow">THE OPEN OPTICAL LAYER</p><div><h2>Glasses are becoming computers.<br/><em>Their differences should be visible.</em></h2><p>OpenLens turns a fragmented hardware landscape into an environment you can inspect, simulate, compile, trace, and benchmark. Every boundary stays attached to the work.</p></div></section>
  <section className="chapter-field">{chapters.map(([n,label,title,body,route],index)=><a href={`#/${route}`} className={`chapter chapter-${index+1}`} key={n}><div className="chapter-number">{n}</div><div className="chapter-copy"><p className="eyebrow">{label}</p><h3>{title}</h3><p>{body}</p><span>OPEN SYSTEM <b>↗</b></span></div><div className="chapter-lens" aria-hidden="true"><i/><i/></div></a>)}</section>
  <section className="proof-strip"><span>NO ACCOUNT</span><span>LOCAL-FIRST</span><span>ZERO-COST CORE</span><span>VERSIONED ARTIFACTS</span><span>SOURCED CLAIMS</span></section>
  <section className="home-closing"><p className="eyebrow">OPENLENS / 0.2</p><h2>Don’t just imagine<br/>the next interface.<br/><em>Run it.</em></h2><a className="button primary" href="#/lab">Open the workbench</a><img src={`${import.meta.env.BASE_URL}assets/openlens-glasses-hero-v2.png`} alt="" aria-hidden="true"/></section>
 </main>
}
