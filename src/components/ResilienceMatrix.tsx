import {useMemo,useState} from 'react';
import {useWorkbench} from '../app/workbench';
import {diffTraces,exportResilienceMatrix,runResilienceMatrix,type ResilienceMatrixResult} from '../core';

const save=(name:string,text:string)=>{const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url)};

export default function ResilienceMatrix(){
 const work=useWorkbench();
 const [matrix,setMatrix]=useState<ResilienceMatrixResult|null>(null);
 const [leftId,setLeftId]=useState('baseline');
 const [rightId,setRightId]=useState('permission-denied');
 const run=()=>{const next=runResilienceMatrix(work.plan,work.config);setMatrix(next);setLeftId('baseline');setRightId(next.scenarios.find(item=>item.id==='permission-denied')?.id??next.scenarios[1]?.id??'baseline')};
 const left=matrix?.scenarios.find(item=>item.id===leftId)??null;
 const right=matrix?.scenarios.find(item=>item.id===rightId)??null;
 const diff=useMemo(()=>left&&right?diffTraces(left.run,right.run):[],[left,right]);
 return <section className="resilience-lab" aria-labelledby="resilience-title">
  <header className="resilience-head">
   <div><p className="eyebrow">FAULT MATRIX / SAME PLAN · SAME SEED</p><h2 id="resilience-title">Break it on purpose.<br/><em>See exactly where it changes.</em></h2></div>
   <div><p>OpenLens runs the active experience through eight declared conditions without changing the compiled plan or random draw. This is fault isolation, not a synthetic compatibility score.</p><div className="button-row"><button className="button primary" onClick={run}>Run resilience matrix</button>{matrix&&<button className="button" onClick={()=>save(`${matrix.id}.json`,exportResilienceMatrix(matrix))}>Export matrix JSON</button>}</div></div>
  </header>
  {!matrix?<div className="resilience-empty"><span>8 CONDITIONS</span><strong>One plan. One seed. Eight ways the environment can behave.</strong><p>Run the matrix to compare the nominal path with degraded network, permission denial, critical battery, network loss, timeout, disconnect, and model unavailability.</p></div>:<>
   <div className="resilience-summary" aria-label="Resilience matrix summary"><div><span>SEED</span><strong>{matrix.seed}</strong></div><div><span>SUCCESS</span><strong>{matrix.successes}/{matrix.scenarios.length}</strong></div><div><span>FAILED</span><strong>{matrix.failures}</strong></div><div><span>BLOCKED</span><strong>{matrix.blocked}</strong></div><div><span>PLAN</span><strong>{matrix.planFingerprint}</strong></div></div>
   <div className="resilience-grid">{matrix.scenarios.map(item=><button type="button" className={`resilience-card ${item.run.status} ${rightId===item.id?'selected':''}`} key={item.id} onClick={()=>setRightId(item.id)} aria-pressed={rightId===item.id}>
    <div><span>{item.label}</span><b>{item.run.status}</b></div><strong>{item.run.totalMs}<small> simulated ms</small></strong><p>{item.failure?`${item.failure.stage.toUpperCase()} · ${item.failure.message}`:'Completed without an injected failure.'}</p><i>{item.run.trace.length} trace spans</i>
   </button>)}</div>
   <section className="trace-diff" aria-labelledby="trace-diff-title">
    <header><div><p className="eyebrow">TRACE DIFF / EVENT BY EVENT</p><h3 id="trace-diff-title">Compare two conditions.</h3></div><div className="trace-diff-selects"><label>A<select value={leftId} onChange={event=>setLeftId(event.target.value)}>{matrix.scenarios.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label><span>↔</span><label>B<select value={rightId} onChange={event=>setRightId(event.target.value)}>{matrix.scenarios.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label></div></header>
    <div className="trace-diff-meta"><span>A <b>{left?.run.status}</b> · {left?.run.totalMs} ms</span><span>B <b>{right?.run.status}</b> · {right?.run.totalMs} ms</span><span>{diff.filter(row=>row.changed).length} CHANGED EVENTS</span></div>
    <div className="trace-diff-table" role="table" aria-label="Trace differences">
     <div className="trace-diff-row heading" role="row"><span>#</span><span>RUN A</span><span>Δ</span><span>RUN B</span></div>
     {diff.map(row=><div className={`trace-diff-row ${row.changed?'changed':'same'}`} role="row" key={row.index}>
      <span>{String(row.index+1).padStart(2,'0')}</span>
      <div>{row.left?<><b>{row.left.stage} · {row.left.status}</b><small>{row.left.message}</small><i>{row.left.durationMs} ms</i></>:<em>no event</em>}</div>
      <span>{row.durationDeltaMs===null?'—':`${row.durationDeltaMs>=0?'+':''}${row.durationDeltaMs}`}</span>
      <div>{row.right?<><b>{row.right.stage} · {row.right.status}</b><small>{row.right.message}</small><i>{row.right.durationMs} ms</i></>:<em>no event</em>}</div>
     </div>)}
    </div>
   </section>
   <p className="resilience-method">{matrix.methodology}</p>
  </>}
 </section>
}
