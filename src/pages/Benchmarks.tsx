import {useRef,useState} from 'react';
import {useWorkbench} from '../app/workbench';
import FeatureGuide from '../components/FeatureGuide';
import Page from '../components/Page';
import TraceViewer from '../components/TraceViewer';
import {benchmarkToCsv,exportArtifact,importRun} from '../core';
import type {RunResult} from '../core';

const save=(name:string,text:string,type:string)=>{const url=URL.createObjectURL(new Blob([text],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url)};

export default function Benchmarks(){
  const work=useWorkbench();
  const [trials,setTrials]=useState(24);
  const [selected,setSelected]=useState<RunResult|null>(null);
  const [importMessage,setImportMessage]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const result=work.benchmarkResult;
  const run=()=>{const next=work.benchmarkCurrent(trials);setSelected(next.runs[0]??null)};
  const load=async(file:File)=>{try{const parsed=importRun(await file.text());setSelected(parsed);setImportMessage(`Verified ${parsed.id} against its embedded plan and deterministic replay.`)}catch(error){setImportMessage(error instanceof Error?error.message:'Artifact rejected.')}};
  return <Page index="04" eyebrow="BENCHMARK LAB / REPRODUCIBLE ARTIFACTS" title={<>Measure the<br/><em>whole system.</em></>} lead="For engineers comparing repeatability and failure handling. Run the active Lens Lab plan many times, inspect every sample, and export the evidence behind the summary." actions={<div className="benchmark-action"><label>Trials<input aria-label="Benchmark trial count" type="number" min="1" max="500" value={trials} onChange={e=>setTrials(Math.max(1,Math.min(500,Math.trunc(Number(e.target.value)||1))))}/></label><button className="button primary" onClick={run}>Run {trials} trials</button></div>}>
    <FeatureGuide title="A benchmark you can audit" intro="Each bar is one deterministic simulator run. The suite counts failures, calculates latency only from completed runs, and keeps every trace available for inspection." steps={[
      {number:'1',title:'Configure in Lens Lab',body:`The active plan is ${work.plan.experience.name} with seed ${work.config.seed}.`},
      {number:'2',title:'Run a trial set',body:'The seed advances once per trial, producing reproducible jitter and failure draws.'},
      {number:'3',title:'Inspect or exchange',body:'Select any bar for its trace. Export JSON for replay or CSV for analysis.'}
    ]}/>
    <div className="stats-ribbon"><div><span>STATUS</span><strong>{result?'READY':'IDLE'}</strong><small>SIMULATION</small></div><div><span>SUCCESS</span><strong>{result?`${Math.round(result.successRate*100)}%`:'—'}</strong><small>{result?`${result.successes}/${result.trials}`:'NO SUITE'}</small></div><div><span>MEDIAN</span><strong>{result?.statistics.median??'—'}</strong><small>MS / SUCCESS</small></div><div><span>SAMPLE SD</span><strong>{result?.statistics.sampleSd?.toFixed(1)??'—'}</strong><small>N − 1</small></div><div><span>ENGINE</span><strong>0.2.0</strong><small>SCHEMA 2</small></div></div>
    {result?<div className="benchmark-workspace"><section className="distribution-panel"><header><div><p className="eyebrow">TRIAL DISTRIBUTION</p><h2>Raw samples remain selectable.</h2></div><div className="button-row"><button className="button small" onClick={()=>save(`${result.id}.json`,exportArtifact(result),'application/json')}>JSON</button><button className="button small" onClick={()=>save(`${result.id}.csv`,benchmarkToCsv(result),'text/csv')}>CSV</button></div></header><div className="distribution" aria-label="Benchmark trial outcomes">{result.runs.map((sample,index)=><button onClick={()=>setSelected(sample)} className={`${sample.status} ${selected?.id===sample.id?'selected':''}`} key={`${sample.id}-${index}`} style={{height:`${Math.max(12,(sample.totalMs/(result.statistics.max??1))*100)}%`}} aria-label={`Trial ${index+1}: ${sample.status}, ${sample.totalMs} milliseconds`}><span>{index+1}</span></button>)}</div><div className="axis"><span>TRIAL 01</span><span>{result.trials.toString().padStart(2,'0')}</span></div></section><aside className="method-card panel-dark"><p className="eyebrow">METHOD / {result.versions.methodology}</p><h2>Simulation, declared.</h2><p>{result.methodology}</p><dl><div><dt>Plan</dt><dd>{result.plan.fingerprint}</dd></div><div><dt>Catalog</dt><dd>{result.versions.catalog}</dd></div><div><dt>Seed</dt><dd>{result.config.seed}</dd></div><div><dt>Failures</dt><dd>{result.failures}</dd></div></dl></aside></div>:<section className="benchmark-empty"><div><span>00</span><h2>Ready for a real run.</h2><p>Choose a trial count and run the suite. The distribution, failures, trace identity, and export controls will appear here.</p></div></section>}
    <section className="import-strip"><div><p className="eyebrow">ARTIFACT EXCHANGE</p><h2>Verify a saved run.</h2><p>OpenLens replays the embedded plan and rejects edited totals or outputs.</p></div><input ref={input} type="file" accept="application/json,.json" hidden onChange={e=>e.target.files?.[0]&&void load(e.target.files[0])}/><button className="button" onClick={()=>input.current?.click()}>Import run JSON</button>{importMessage&&<p role="status">{importMessage}</p>}</section>
    {selected&&<TraceViewer run={selected}/>}
  </Page>
}
