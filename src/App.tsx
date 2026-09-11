import {lazy,Suspense,useEffect,useState} from 'react';
import {Shell} from './app/Shell';
import {parseHash,type RouteState} from './app/router';
import {WorkbenchProvider} from './app/workbench';

const loadingCopy={home:'Aligning the optical opening…',lab:'Focusing the virtual optics…',devices:'Loading the device field…',compiler:'Preparing the experience contract…',benchmarks:'Preparing the measurement workspace…',research:'Opening the evidence ledger…',developers:'Preparing the adapter workbench…',methodology:'Opening the methodology record…',about:'Opening the OpenLens story…'};
const Home=lazy(()=>import('./components/Home'));
const Lab=lazy(()=>import('./pages/Lab'));
const Devices=lazy(()=>import('./pages/Devices'));
const Compiler=lazy(()=>import('./pages/Compiler'));
const Benchmarks=lazy(()=>import('./pages/Benchmarks'));
const Research=lazy(()=>import('./pages/Research'));
const Developers=lazy(()=>import('./pages/Developers'));
const Methodology=lazy(()=>import('./pages/Methodology'));
const About=lazy(()=>import('./pages/About'));
const view={home:<Home/>,lab:<Lab/>,devices:<Devices/>,compiler:<Compiler/>,benchmarks:<Benchmarks/>,research:<Research/>,developers:<Developers/>,methodology:<Methodology/>,about:<About/>};

export default function App(){
 const [state,setState]=useState<RouteState>(()=>parseHash(location.hash));
 useEffect(()=>{
  const previous=history.scrollRestoration;
  history.scrollRestoration='manual';
  scrollTo({top:0,behavior:'instant'});
  const update=()=>{setState(parseHash(location.hash));scrollTo({top:0,behavior:'instant'})};
  addEventListener('hashchange',update);
  return()=>{history.scrollRestoration=previous;removeEventListener('hashchange',update)};
 },[]);
 const requestedDevice=state.route==='lab'?state.query.get('device'):null;
 return <WorkbenchProvider initialDevice={requestedDevice}>
  <Shell route={state.route}>
   <Suspense fallback={<div className="route-loading" role="status" aria-live="polite"><span aria-hidden="true" style={{borderRadius:'50%'}}/>{loadingCopy[state.route]}</div>}>
    {view[state.route]}
   </Suspense>
  </Shell>
 </WorkbenchProvider>
}
