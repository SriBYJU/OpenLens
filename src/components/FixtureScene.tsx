import type {CSSProperties} from 'react';
import type {EnvironmentConfig,SimulationConfig} from '../core';

/** A diagram of the selected authored fixture, never presented as a camera feed. */
export default function FixtureScene({fixture,environment}:{fixture:SimulationConfig['fixture'];environment:EnvironmentConfig}){
 const conversation=fixture==='conversation';
 const museum=fixture==='museum-label';
 const light=Math.max(.23,Math.min(1,.32+Math.log10(environment.illuminationLux+1)/6));
 return <div className={`fixture-scene ${conversation?'fixture-audio':'fixture-vision'}`} data-fixture={fixture} style={{'--scene-light':light,'--scene-blur':`${Math.min(2,environment.headMotionDps/80)}px`} as CSSProperties}>
  <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label={conversation?'Synthetic conversation waveform':museum?'Synthetic museum room with an exhibit label':'Synthetic corridor with a SALIDA exit sign'}>
   <defs>
    <linearGradient id="scene-wall" x2="0" y2="1"><stop stopColor="#60716c"/><stop offset="1" stopColor="#273733"/></linearGradient>
    <linearGradient id="scene-floor" x2="0" y2="1"><stop stopColor="#41504a"/><stop offset="1" stopColor="#101c1a"/></linearGradient>
    <radialGradient id="scene-light"><stop stopColor="#d9e7d9" stopOpacity=".32"/><stop offset="1" stopColor="#d9e7d9" stopOpacity="0"/></radialGradient>
   </defs>
   {conversation?<>
    <rect width="1000" height="600" fill="#182a2a"/>
    {Array.from({length:9},(_,i)=><path key={i} d={`M0 ${100+i*50}H1000`} stroke="#55736b" strokeOpacity=".18"/>)}
    <path d="M500 100V450" stroke="#91b6a9" strokeDasharray="3 8"/>
    {Array.from({length:83},(_,i)=>{const h=12+Math.abs(Math.sin(i*2.7)*Math.cos(i*.18))*150;return <rect key={i} x={90+i*10} y={280-h/2} width="3" height={h} rx="1.5" fill={i<42?'#c9e5d6':'#78988d'}/>})}
    <text x="90" y="170" fill="#c2d7ce" fontSize="16" fontFamily="monospace">AUTHORED AUDIO / 01</text>
    <text x="500" y="410" textAnchor="middle" fill="#edf0e2" fontSize="30" fontFamily="sans-serif">Conversation phrase</text>
   </>:<>
    <rect width="1000" height="600" fill="url(#scene-wall)"/>
    <path d="M0 0L320 110V410L0 600Z" fill="#1b2b29"/><path d="M1000 0L720 110V410L1000 600Z" fill="#354740"/>
    <path d="M0 600L320 410H720L1000 600Z" fill="url(#scene-floor)"/>
    <path d="M0 0L320 110H720L1000 0Z" fill="#182723"/>
    <path d="M520 410V600M320 410L130 600M720 410L900 600M0 540H1000M180 465H820" stroke="#a1b1a3" strokeOpacity=".18"/>
    <path d="M170 0L382 111M810 0L650 111" stroke="#d4e2c7" strokeWidth="5"/>
    <ellipse cx="520" cy="210" rx="410" ry="250" fill="url(#scene-light)"/>
    {museum?<>
     <rect x="400" y="155" width="155" height="180" fill="#202d29" stroke="#bcae8d" strokeWidth="7"/>
     <path d="M420 310L470 183L535 310Z" fill="#b29d70"/><circle cx="480" cy="244" r="29" fill="#637c68"/>
     <rect x="578" y="246" width="116" height="78" rx="2" fill="#e7e1ca"/>
     <text x="589" y="268" fontSize="12" fill="#24332d" fontFamily="sans-serif">MUSEUM LABEL</text>
     <path d="M589 282H680M589 291H671M589 300H666" stroke="#8a917a" strokeWidth="3"/>
    </>:<>
     <rect x="448" y="236" width="153" height="174" fill="#152925" stroke="#839b89" strokeWidth="2"/><path d="M524 236V410" stroke="#668472"/>
     <rect x="372" y="152" width="298" height="75" rx="4" fill="#143f30" stroke="#a0c9aa" strokeWidth="2"/>
     <path d="M402 190H447M416 176L402 190L416 204" fill="none" stroke="#e0efd4" strokeWidth="5"/>
     <text x="474" y="204" fill="#e0efd4" fontSize="39" letterSpacing="4" fontFamily="sans-serif">SALIDA</text>
     <path d="M900 180V450M870 200V428M140 170V445" stroke="#748b78" strokeOpacity=".5" strokeWidth="2"/>
    </>}
   </>}
  </svg>
  <div className="scene-vignette"/>
  <span className="fixture-caption">{conversation?'02 / AUDIO FIXTURE':museum?'03 / MUSEUM FIXTURE':'01 / WAYFINDING FIXTURE'}</span>
 </div>;
}
