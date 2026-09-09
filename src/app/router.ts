export const routes=['home','lab','devices','compiler','benchmarks','research','developers','methodology','about'] as const;
export type Route=typeof routes[number];
export interface RouteState{route:Route;query:URLSearchParams}
export const routeLabels:Record<Route,string>={home:'Explore',lab:'Lens Lab',devices:'Device Universe',compiler:'Compiler',benchmarks:'Benchmarks',research:'Research',developers:'Developers',methodology:'Methodology',about:'About'};
export function parseHash(hash:string):RouteState{const raw=hash.replace(/^#\/?/,'');const q=raw.indexOf('?');const path=(q<0?raw:raw.slice(0,q)).split('/')[0];let query=new URLSearchParams();try{query=new URLSearchParams(q<0?'':raw.slice(q+1))}catch{/* malformed values are ignored */}return{route:(routes as readonly string[]).includes(path)?path as Route:'home',query}}
