import { useId } from 'react';
export default function Glasses({compact=false}:{compact?:boolean}) {
 const id=useId().replace(/:/g,'');
 return <svg className={compact?'glasses compact':'glasses'} viewBox="0 0 1000 480" role="img" aria-label="Sculptural graphite smart glasses with green optical lenses"><defs>
 <linearGradient id={`${id}-metal`} x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#90998f"/><stop offset=".18" stopColor="#303b36"/><stop offset=".55" stopColor="#111b17"/><stop offset=".8" stopColor="#46524a"/><stop offset="1" stopColor="#0b1610"/></linearGradient>
 <linearGradient id={`${id}-lens`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#879d8c" stopOpacity=".72"/><stop offset=".38" stopColor="#c9e2c2" stopOpacity=".46"/><stop offset=".66" stopColor="#74987c" stopOpacity=".2"/><stop offset="1" stopColor="#f2f7dd" stopOpacity=".8"/></linearGradient>
 <linearGradient id={`${id}-shine`}><stop stopColor="#f8fff0" stopOpacity="0"/><stop offset=".5" stopColor="#f8fff0" stopOpacity=".7"/><stop offset="1" stopColor="#f8fff0" stopOpacity="0"/></linearGradient>
 <filter id={`${id}-shadow`} x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
 </defs>
 <ellipse cx="508" cy="406" rx="330" ry="21" fill="#263d2d" opacity=".2" filter={`url(#${id}-shadow)`}/>
 <g className="glasses-body" transform="rotate(-9 500 240)">
 <path d="M171 201 385 69 Q407 60 439 78 L520 115 508 136 423 106 252 243Z" fill={`url(#${id}-metal)`}/>
 <path d="m779 211 121-90q20-12 37 0l32 44q8 15-5 24l-23 11-5-24-21-29-105 112Z" fill={`url(#${id}-metal)`}/>
 <path d="m194 205 214-125 43 17" fill="none" stroke="#a9b4a4" strokeWidth="3" opacity=".65"/>
 <path d="M124 180 Q229 133 393 162 Q439 170 452 209 Q486 180 534 201 Q551 174 602 179 Q741 181 846 237 L826 272 805 270 Q797 348 738 367 Q661 378 590 340 Q554 324 548 268 Q500 239 460 256 Q445 327 396 337 Q274 360 184 296 Q152 274 148 222Z" fill="#101a14"/>
 <path d="M119 169 Q231 122 395 151 Q441 159 455 198 Q487 169 536 190 Q553 163 604 168 Q743 170 850 226 L831 258 808 257 Q800 335 739 355 Q663 367 592 328 Q557 313 550 257 Q501 228 461 245 Q447 315 397 325 Q276 348 185 284 Q153 262 150 210Z" fill={`url(#${id}-metal)`} stroke="#637368" strokeWidth="2"/>
 <path d="M171 184 Q270 148 390 176 Q425 183 431 214 L416 273 Q407 297 382 304 Q278 327 200 272 Q177 256 171 224Z" fill={`url(#${id}-lens)`} stroke="#8b9b87" strokeWidth="2"/>
 <path d="M573 211 Q582 189 615 193 Q715 197 802 237 L784 291 Q773 322 737 329 Q669 339 610 306 Q588 293 583 265Z" fill={`url(#${id}-lens)`} stroke="#8b9b87" strokeWidth="2"/>
 <path d="m198 197 155-22-114 118-22-15Z M601 213l103 0-71 105-23-13Z" fill={`url(#${id}-shine)`} opacity=".5"/>
 <path d="M135 169Q261 128 393 156M609 174q131 9 228 54" fill="none" stroke="#ced8c9" strokeWidth="3" opacity=".55"/>
 <path d="m471 232 2 30q-8 19-19 14l-7-5M542 250l10 25q6 15 16 8l8-9" fill="none" stroke="#7d897b" strokeWidth="7"/>
 <circle cx="157" cy="184" r="11" fill="#0a120d" stroke="#74876e" strokeWidth="3"/><circle cx="157" cy="184" r="4" fill="#9abd7b"/><path d="m817 235 16 6" stroke="#c5d2bd" strokeWidth="3"/>
 <g opacity=".4" stroke="#e7f9d1" fill="none"><path d="M623 242h95m-95 8h53m-53 8h70"/><rect x="613" y="228" width="130" height="46" rx="3"/></g>
 </g></svg>;
}
