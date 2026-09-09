import {useId} from 'react';

export default function Glasses({compact=false}:{compact?:boolean}){
 const id=useId().replace(/:/g,'');
 return <svg className={compact?'glasses compact':'glasses'} viewBox="0 0 1200 650" role="img" aria-label="Detailed graphite smart glasses with smoked optical lenses">
  <defs>
   <linearGradient id={`${id}metal`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#07090b"/><stop offset=".18" stopColor="#5c6268"/><stop offset=".25" stopColor="#14181d"/><stop offset=".66" stopColor="#020405"/><stop offset=".84" stopColor="#384148"/><stop offset="1" stopColor="#080a0d"/></linearGradient>
   <linearGradient id={`${id}edge`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#a8b6c0" stopOpacity=".1"/><stop offset=".42" stopColor="#eaf8ff" stopOpacity=".9"/><stop offset=".49" stopColor="#53626b" stopOpacity=".2"/><stop offset=".76" stopColor="#99f1ff" stopOpacity=".55"/><stop offset="1" stopColor="#020405" stopOpacity="0"/></linearGradient>
   <radialGradient id={`${id}lens`} cx="38%" cy="27%" r="89%"><stop stopColor="#94c8ce" stopOpacity=".33"/><stop offset=".22" stopColor="#27454d" stopOpacity=".48"/><stop offset=".58" stopColor="#111a20" stopOpacity=".86"/><stop offset="1" stopColor="#030608" stopOpacity=".97"/></radialGradient>
   <linearGradient id={`${id}flare`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dffaff" stopOpacity="0"/><stop offset=".47" stopColor="#dffaff" stopOpacity=".7"/><stop offset=".53" stopColor="#91eafa" stopOpacity=".15"/><stop offset="1" stopColor="#dffaff" stopOpacity="0"/></linearGradient>
   <filter id={`${id}shadow`} x="-40%" y="-100%" width="180%" height="300%"><feGaussianBlur stdDeviation="26"/></filter>
   <filter id={`${id}glow`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
   <clipPath id={`${id}left`}><path d="M166 282Q181 214 264 191Q377 162 484 195Q533 210 540 254L523 367Q512 420 450 438Q322 472 220 410Q165 377 166 282Z"/></clipPath>
   <clipPath id={`${id}right`}><path d="M655 248Q664 204 716 197Q833 185 967 231Q1026 252 1021 313L1007 377Q997 423 942 442Q824 471 713 413Q664 387 655 328Z"/></clipPath>
  </defs>
  <ellipse className="glasses-shadow" cx="598" cy="554" rx="420" ry="30" fill="#000" opacity=".72" filter={`url(#${id}shadow)`}/>
  <g className="rear-temples">
   <path d="M146 271 58 205Q31 184 45 157l13-18q13-18 37-4l238 101Z" fill={`url(#${id}metal)`}/><path d="M65 149 331 239" stroke={`url(#${id}edge)`} strokeWidth="5"/>
   <path d="m1007 256 128-107q23-17 40 4l13 18q17 24-9 43l-160 121Z" fill={`url(#${id}metal)`}/><path d="m1020 258 149-102" stroke={`url(#${id}edge)`} strokeWidth="5"/>
  </g>
  <g className="frame-depth" transform="translate(0 16)"><path d="M139 278Q152 200 250 174Q376 140 500 180Q541 194 562 230Q603 202 645 225Q671 190 716 181Q850 163 995 217Q1051 238 1053 300L1028 390Q1016 448 953 471Q818 506 691 443Q644 420 626 358Q579 333 542 356Q525 423 467 448Q322 488 203 419Q133 379 139 278Z" fill="#000" opacity=".88"/></g>
  <path className="frame-rim" d="M134 260Q148 182 248 157Q376 125 501 165Q544 178 564 216Q606 186 650 211Q675 175 721 167Q858 151 1002 205Q1061 227 1064 290L1041 379Q1028 439 964 461Q825 495 695 430Q648 407 628 344Q579 317 540 342Q523 410 464 434Q316 474 198 404Q128 362 134 260Z" fill={`url(#${id}metal)`} stroke="#68757d" strokeWidth="3"/>
  <path className="left-lens" d="M166 282Q181 214 264 191Q377 162 484 195Q533 210 540 254L523 367Q512 420 450 438Q322 472 220 410Q165 377 166 282Z" fill={`url(#${id}lens)`} stroke="#93a4ad" strokeOpacity=".55" strokeWidth="3"/>
  <path className="right-lens" d="M655 248Q664 204 716 197Q833 185 967 231Q1026 252 1021 313L1007 377Q997 423 942 442Q824 471 713 413Q664 387 655 328Z" fill={`url(#${id}lens)`} stroke="#93a4ad" strokeOpacity=".55" strokeWidth="3"/>
  <g clipPath={`url(#${id}left)`}><path className="lens-flare" d="m61 385 425-270 92 75-431 278Z" fill={`url(#${id}flare)`}/><path d="M143 344Q350 229 560 276" fill="none" stroke="#b7f5ff" strokeOpacity=".18" strokeWidth="2"/></g>
  <g clipPath={`url(#${id}right)`}><path className="lens-flare flare-two" d="m616 432 306-277 147 71-334 284Z" fill={`url(#${id}flare)`}/><path d="M638 348Q824 234 1032 305" fill="none" stroke="#b7f5ff" strokeOpacity=".18" strokeWidth="2"/></g>
  <path className="brow-highlight" d="M146 244Q178 179 272 158Q395 131 496 169M675 198Q711 166 784 163Q914 162 1021 214" fill="none" stroke={`url(#${id}edge)`} strokeWidth="6" strokeLinecap="round"/>
  <path d="M540 264Q581 233 625 256L632 306Q584 285 536 315Z" fill={`url(#${id}metal)`} stroke="#56636b" strokeWidth="2"/>
  <path d="m510 362 19 52q8 25 30 9l15-18M642 362l-16 51q-7 25-29 10l-14-17" fill="none" stroke="#32393f" strokeWidth="12" strokeLinecap="round"/>
  <g className="hinge left-hinge"><rect x="139" y="244" width="54" height="70" rx="17" fill="#090c0f" stroke="#65727a"/><circle cx="165" cy="276" r="13" fill="#030506" stroke="#96a7b0" strokeWidth="3"/><circle cx="165" cy="276" r="4" fill="#9defff" filter={`url(#${id}glow)`}/></g>
  <g className="hinge right-hinge"><rect x="1005" y="244" width="50" height="69" rx="17" fill="#090c0f" stroke="#65727a"/><path d="M1023 265h15M1023 275h15M1023 285h15" stroke="#93a1aa" strokeWidth="3"/></g>
  <g className="camera"><circle cx="213" cy="213" r="20" fill="#050708" stroke="#82939c" strokeWidth="4"/><circle cx="213" cy="213" r="11" fill="#0e232b" stroke="#6bd4ea" strokeOpacity=".7"/><circle cx="209" cy="208" r="3" fill="#d9fbff"/></g>
  <g className="projector"><rect x="935" y="229" width="40" height="18" rx="7" fill="#050708" stroke="#77848b"/><rect x="943" y="235" width="24" height="5" rx="2" fill="#9defff" opacity=".65"/></g>
  <g className="micro-details" fill="#99a5aa"><circle cx="252" cy="180" r="2"/><circle cx="260" cy="178" r="2"/><circle cx="268" cy="176" r="2"/><circle cx="933" cy="207" r="2"/><circle cx="941" cy="210" r="2"/><circle cx="949" cy="213" r="2"/></g>
 </svg>
}
