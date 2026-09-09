import {useState} from 'react';

interface Check {name:string;status:'pass'|'limited'|'fail';detail:string}
export default function BrowserReadiness(){
 const [checks,setChecks]=useState<Check[]>([]);
 const [running,setRunning]=useState(false);
 const inspect=async()=>{
  setRunning(true);
  const results:Check[]=[];
  const add=(name:string,ok:boolean,detail:string)=>results.push({name,status:ok?'pass':'limited',detail});
  add('Secure browser context',window.isSecureContext,window.isSecureContext?'Camera access can be requested over this secure connection.':'Open HTTPS or localhost before requesting a camera.');
  add('Camera API',Boolean(navigator.mediaDevices?.getUserMedia),'API availability only; permission and physical camera access have not been requested.');
  add('WebAssembly',typeof WebAssembly!=='undefined','Required by the local OCR engine.');
  add('Web Workers',typeof Worker!=='undefined','Keeps OCR inference off the interface thread.');
  add('Speech output','speechSynthesis' in window,'Local voices are selected by the OCR tool; voice availability varies by browser.');
  try{const key='openlens.doctor.probe';localStorage.setItem(key,'1');const ok=localStorage.getItem(key)==='1';localStorage.removeItem(key);add('Local persistence',ok,'Experience drafts can be retained in this browser.')}catch{add('Local persistence',false,'Storage is unavailable. The workbench continues in memory.');}
  for(const file of ['ocr/worker.min.js','ocr/lang/eng.traineddata.gz']){
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
   try{const response=await fetch(new URL(file,new URL(import.meta.env.BASE_URL,location.href)),{method:'HEAD',signal:controller.signal});results.push({name:file,status:response.ok?'pass':'fail',detail:response.ok?'Same-origin OCR asset is reachable.':`Asset request returned HTTP ${response.status}.`})}
   catch{results.push({name:file,status:'fail',detail:'Asset could not be reached within five seconds. Check connectivity or deployment.'})}
   finally{clearTimeout(timer)}
  }
  setChecks(results);setRunning(false);
 };
 const download=()=>{const blob=new Blob([JSON.stringify({createdAt:new Date().toISOString(),scope:'browser-readiness',checks},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='openlens-browser-diagnostics.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <section className="browser-readiness panel-dark"><p className="eyebrow">DEVICE DOCTOR / BROWSER READINESS</p><h2>Find what is blocking your prototype.</h2><p>For developers checking this browser before running a local experiment. These checks inspect browser APIs, draft storage, and OCR assets. They do not connect to glasses or request camera permission.</p><div className="button-row"><button className="button primary" onClick={()=>void inspect()} disabled={running}>{running?'Checking browser…':'Run readiness checks'}</button>{checks.length>0&&<button className="button" onClick={download}>Download diagnostic report</button>}</div><div aria-live="polite">{checks.map(check=><article className="doctor-check" key={check.name}><strong>{check.name}</strong><span className={`truth-label ${check.status==='pass'?'simulated':'unavailable'}`}>{check.status}</span><p>{check.detail}</p></article>)}</div></section>;
}
