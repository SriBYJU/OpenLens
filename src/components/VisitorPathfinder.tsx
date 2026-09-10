import {useState} from 'react';

const paths={
 explore:{label:'I’m curious',title:'Try smart glasses without owning a pair.',body:'Enter the virtual park, focus the French sign, and watch the selected glasses route the result.',steps:['Open the first-person park','Select SORTIE to run translation','Change the device or environment'],route:'lab',action:'Enter the virtual park'},
 build:{label:'I want to build',title:'Turn an idea into an inspectable plan.',body:'Write one supported behavior, review its routes across every profile, then run it in the Optical Twin.',steps:['Describe the experience','Review the detected contract','Run a compatible device model'],route:'compiler',action:'Open the Experience Compiler'},
 compare:{label:'I’m choosing glasses',title:'Find the hardware boundary that matters.',body:'Switch among physical, developer-access, and OpenLens layers before comparing the finalists.',steps:['Scan the capability matrix','Mark required features','Open Device Doctor on a finalist'],route:'devices',action:'Compare the device field'},
 verify:{label:'I need evidence',title:'Follow every claim back to its source.',body:'Search the ledger, inspect conflicts and unknowns, then keep simulated results separate from hardware evidence.',steps:['Search a device or capability','Open the claim and source record','Inspect benchmark methodology'],route:'research',action:'Open the evidence ledger'},
} as const;
type PathId=keyof typeof paths;

export default function VisitorPathfinder(){
 const [active,setActive]=useState<PathId>('explore');const path=paths[active];
 return <section className="visitor-pathfinder" aria-labelledby="pathfinder-title"><aside><p className="eyebrow">START WITH YOUR QUESTION</p><h2 id="pathfinder-title">Choose a way<br/>into OpenLens.</h2><p>Every path starts with something you can use now.</p><div className="path-options">{(Object.entries(paths) as [PathId,typeof paths[PathId]][]).map(([id,item],index)=><button onClick={()=>setActive(id)} aria-pressed={active===id} key={id}><span>0{index+1}</span><strong>{item.label}</strong><i>↗</i></button>)}</div></aside><div className={`path-map path-${active}`} aria-live="polite"><header><span>YOUR ROUTE / {active.toUpperCase()}</span><small>3 STEPS · NO ACCOUNT</small></header><div><p className="eyebrow">RECOMMENDED PATH</p><h3>{path.title}</h3><p>{path.body}</p><ol>{path.steps.map((step,index)=><li key={step}><span>0{index+1}</span><strong>{step}</strong></li>)}</ol><a className="button primary" href={`#/${path.route}`}>{path.action} ↗</a></div><div className="path-optic" aria-hidden="true"><i/><i/><i/><span>{active.toUpperCase()}</span></div></div></section>;
}
