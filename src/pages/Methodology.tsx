import Page from '../components/Page';

const sections=[
 ['scope','01 / Scope'],['environment','02 / Environment'],['labels','03 / Truth labels'],
 ['stats','04 / Statistics'],['replay','05 / Reproducibility'],['limits','06 / Limits'],
];

export default function Methodology(){
 const jump=(id:string)=>{const section=document.getElementById(id);section?.focus({preventScroll:true});section?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
 return <Page className="instrument-page methodology-page" index="07" eyebrow="METHODOLOGY / VERSION 1.2.0" title={<>The boundary is <em>part of the result.</em></>} lead="What OpenLens simulates, what it measures, and what the evidence can support." actions={<div className="method-stamp"><span>PUBLIC METHOD</span><strong>1.2.0</strong></div>}>
  <article className="methodology"><aside aria-label="Methodology sections"><span>IN THIS METHOD</span>{sections.map(([id,label])=><button key={id} onClick={()=>jump(id)}>{label}</button>)}</aside><div>
   <section id="scope" tabIndex={-1}><span>01 / SCOPE</span><h2>Use the twin to test decisions.</h2><p>The public workbench runs a deterministic Digital Twin. It helps developers test capability routing, fallback behavior and failure handling before hardware exists. These durations are controlled simulation values, not physical measurements.</p></section>
   <section id="environment" tabIndex={-1}><span>02 / ENVIRONMENT</span><h2>Stress the authored world.</h2><p>The synthetic score starts at 100. Camera routes lose quality below 50 lux, above 20,000 lux and above 30 degrees per second of head motion. Microphone routes lose quality above 55 dB; display and audio outputs add their own high-light or high-noise penalties. Each penalty and added duration is visible before the run and stored in its trace. A score below 25 deterministically stops acquisition. These thresholds are product-testing assumptions, not calibration data from a device.</p></section>
   <section id="labels" tabIndex={-1}><span>03 / TRUTH LABELS</span><h2>Name the kind of evidence.</h2><p><b>MANUFACTURER CLAIM</b> means a value comes from the named vendor source. <b>SIMULATED</b> describes a configured Digital Twin value. <b>OPENLENS MEASURED</b> is reserved for a recorded physical test. <b>UNKNOWN</b> remains visible when evidence is insufficient.</p></section>
   <section id="stats" tabIndex={-1}><span>04 / STATISTICS</span><h2>Keep failures in the denominator.</h2><p>Repeated successful samples report n, mean, median, sample standard deviation using n − 1, minimum and maximum. Failed trials remain in the raw artifact and affect success rate; they do not silently become latency values.</p></section>
   <section id="replay" tabIndex={-1}><span>05 / REPRODUCIBILITY</span><h2>Carry the full experiment.</h2><p>Every run stores the exact plan, device snapshot, adapter disclosure, UTC start time, seed, scenario inputs, versions and trace. Imports replay the deterministic result and reject a mismatched artifact.</p></section>
   <section id="limits" tabIndex={-1}><span>06 / LIMITS</span><h2>Stop where the evidence stops.</h2><p>Local OCR is real browser inference, but OCR confidence is not truth. Browser performance depends on the visitor’s machine. Research profiles are source records until an explicit adapter reaches verified hardware status.</p></section>
  </div></article>
 </Page>;
}
