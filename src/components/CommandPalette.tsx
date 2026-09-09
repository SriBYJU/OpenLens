import {useEffect,useMemo,useState,type RefObject} from 'react';
import {devices} from '../data/devices';
import {experiencePresets} from '../core';
import {routeLabels,type Route} from '../app/router';
import {useWorkbench} from '../app/workbench';

type PaletteEntry={id:string;title:string;meta:string;keywords:string;action:()=>void};

export default function CommandPalette({close,inputRef}:{close:()=>void;inputRef:RefObject<HTMLInputElement|null>}){
 const [query,setQuery]=useState('');
 const [active,setActive]=useState(0);
 const work=useWorkbench();
 const navigate=(hash:string)=>{close();location.hash=hash};
 const entries=useMemo<PaletteEntry[]>(()=>{
  const sections=(Object.entries(routeLabels) as [Route,string][]).map(([route,label])=>({id:`route-${route}`,title:label,meta:'OPENLENS SECTION',keywords:`${label} ${route}`,action:()=>navigate(route==='home'?'#/':`#/${route}`)}));
  const deviceEntries=devices.map(device=>({id:`device-${device.id}`,title:device.name,meta:`${device.manufacturer} · ${device.integrationStatus.replaceAll('-',' ')}`,keywords:`${device.name} ${device.manufacturer} ${device.summary} ${Object.keys(device.capabilities).join(' ')}`,action:()=>{if(device.kind==='digital-twin'){work.setDeviceId(device.id);navigate(`#/lab?device=${device.id}`)}else navigate(`#/research?device=${device.id}`)}}));
  const experiences=experiencePresets.map(experience=>({id:`experience-${experience.id}`,title:`Run: ${experience.name}`,meta:`${experience.task.toUpperCase()} · ${experience.input.toUpperCase()} → ${experience.preferredOutputs.join(' / ').toUpperCase()}`,keywords:`${experience.name} ${experience.prompt} ${experience.task} ${experience.input}`,action:()=>{work.setDeviceId('openlens-twin');work.setExperience(experience);navigate('#/lab')}}));
  const quick:PaletteEntry[]=[
   {id:'quick-fit',title:'Find the right glasses',meta:'DEVICE FIT ENGINE',keywords:'recommend choose requirements compatibility hardware fit',action:()=>navigate('#/devices')},
   {id:'quick-compile',title:'Turn an idea into a plan',meta:'EXPERIENCE COMPILER',keywords:'plain english idea prompt compiler build',action:()=>navigate('#/compiler')},
   {id:'quick-method',title:'What counts as measured?',meta:'METHODOLOGY',keywords:'truth measured simulated manufacturer claim evidence',action:()=>navigate('#/methodology')},
  ];
  if(work.run)quick.unshift({id:'quick-last-run',title:`Inspect last run · ${work.run.status}`,meta:`${work.run.totalMs} SIMULATED MS · ${work.run.trace.length} TRACE SPANS`,keywords:'last run trace replay simulation artifact',action:()=>navigate('#/lab')});
  return [...quick,...sections,...experiences,...deviceEntries];
 },[work.run,work.deviceId,work.experience.id]);
 const filtered=entries.filter(entry=>`${entry.title} ${entry.meta} ${entry.keywords}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,14);
 useEffect(()=>setActive(0),[query]);
 useEffect(()=>{if(active>=filtered.length)setActive(Math.max(0,filtered.length-1))},[active,filtered.length]);
 const choose=(entry:PaletteEntry|undefined)=>entry?.action();
 return <div className="overlay command-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}>
  <div className="search-dialog command-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
   <header><div><p className="eyebrow">OPENLENS COMMAND PALETTE</p><h2 id="search-title">Jump anywhere.<br/><em>Carry the workbench with you.</em></h2></div><button className="icon-button" onClick={close} aria-label="Close search">×</button></header>
   <div className="command-input-wrap"><span aria-hidden="true">⌕</span><input ref={inputRef} className="search-input" placeholder="Search devices, experiences, tools, evidence…" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setActive(value=>Math.min(filtered.length-1,value+1))}if(event.key==='ArrowUp'){event.preventDefault();setActive(value=>Math.max(0,value-1))}if(event.key==='Enter'){event.preventDefault();choose(filtered[active])}}}/><kbd>ESC</kbd></div>
   <div className="command-context"><span>CURRENT DEVICE <b>{work.deviceId.replaceAll('-',' ')}</b></span><span>EXPERIENCE <b>{work.experience.name}</b></span><span>ARTIFACT <b>{work.run?work.run.status:'none'}</b></span></div>
   <div className="search-results command-results">{filtered.length?filtered.map((entry,index)=><button type="button" className={index===active?'active':''} onMouseEnter={()=>setActive(index)} onClick={()=>choose(entry)} key={entry.id}><span><strong>{entry.title}</strong><small>{entry.meta}</small></span><i aria-hidden="true">↗</i></button>):<div className="command-empty"><strong>No matching system.</strong><p>Try a device name, capability, experience, or section.</p></div>}</div>
   <footer className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> MOVE</span><span><kbd>ENTER</kbd> OPEN</span><span><kbd>⌘ K</kbd> TOGGLE</span></footer>
  </div>
 </div>
}
