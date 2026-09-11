import {useEffect,useRef,useState} from 'react';
import {routeLabels,type Route} from '../app/router';

const revealSelector='.page-hero,.page>section,.page>div,.page>details,.manifesto>*,.visitor-pathfinder>*,.signal-demo-head>*,.signal-console,.device-switchboard>header>*,.device-selector,.device-stage,.system-atlas-head>*,.chapter,.home-closing>*';

export default function ExperienceLayer({route}:{route:Route}){
 const firstRoute=useRef(true);
 const [curtain,setCurtain]=useState(0);

 useEffect(()=>{
  document.body.dataset.route=route;
  if(firstRoute.current){firstRoute.current=false;return}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  setCurtain(value=>value+1);
  const timer=window.setTimeout(()=>setCurtain(0),760);
  return()=>clearTimeout(timer);
 },[route]);

 useEffect(()=>{
  const root=document.documentElement;
  let frame=0;
  const setProgress=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    root.style.setProperty('--page-progress',String(Math.min(1,Math.max(0,scrollY/max))));
   });
  };
  const setPointer=(event:PointerEvent)=>{
   if(event.pointerType==='touch')return;
   const x=event.clientX/Math.max(1,innerWidth);
   const y=event.clientY/Math.max(1,innerHeight);
   root.style.setProperty('--pointer-x',`${(x*100).toFixed(2)}%`);
   root.style.setProperty('--pointer-y',`${(y*100).toFixed(2)}%`);
   root.style.setProperty('--parallax-x',`${((x-.5)*12).toFixed(2)}px`);
   root.style.setProperty('--parallax-y',`${((y-.5)*10).toFixed(2)}px`);
  };
  const seen=new WeakSet<Element>();
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('ol-seen');observer?.unobserve(entry.target)}
  },{rootMargin:'0px 0px -4% 0px',threshold:.025}):null;
  const scan=(scope:ParentNode=document)=>{
   scope.querySelectorAll(revealSelector).forEach((node,index)=>{
    if(seen.has(node))return;
    seen.add(node);
    node.classList.add('ol-reveal');
    (node as HTMLElement).style.setProperty('--reveal-order',String(index%5));
    if(observer)observer.observe(node);else node.classList.add('ol-seen');
   });
  };
  document.body.classList.add('motion-ready');
  scan();
  const appRoot=document.getElementById('root');
  const mutations=appRoot?new MutationObserver(()=>scan(appRoot)):null;
  mutations?.observe(appRoot!,{childList:true,subtree:true});
  addEventListener('scroll',setProgress,{passive:true});
  addEventListener('resize',setProgress,{passive:true});
  addEventListener('pointermove',setPointer,{passive:true});
  setProgress();
  return()=>{
   cancelAnimationFrame(frame);
   observer?.disconnect();
   mutations?.disconnect();
   removeEventListener('scroll',setProgress);
   removeEventListener('resize',setProgress);
   removeEventListener('pointermove',setPointer);
   document.body.classList.remove('motion-ready');
  };
 },[]);

 return <div className="experience-layer" aria-hidden="true"><i className="pointer-glow"/><i className="scroll-beam"/>{curtain>0&&<div className="route-curtain" key={curtain}><span>{routeLabels[route]}</span><b>OPENLENS / {route.toUpperCase()}</b><i/><i/></div>}</div>
}
