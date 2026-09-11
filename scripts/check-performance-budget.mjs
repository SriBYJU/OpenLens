import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {basename,join,relative,sep} from 'node:path';
import {gzipSync} from 'node:zlib';

const root=new URL('../',import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1');
const dist=join(root,'dist');
if(!existsSync(join(dist,'index.html')))throw new Error('dist/index.html is missing. Run npm run build first.');

const walk=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(directory,entry.name)):[join(directory,entry.name)]);
const files=walk(dist);
const size=file=>statSync(file).size;
const gzip=file=>gzipSync(readFileSync(file),{level:9}).length;
const label=file=>relative(dist,file).split(sep).join('/');
const htmlFile=join(dist,'index.html');
const html=readFileSync(htmlFile,'utf8');
const initialPaths=[...html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map(match=>join(dist,match[1])).filter(existsSync);
const initial=[htmlFile,...new Set(initialPaths)];
const appJs=files.filter(file=>file.endsWith('.js')&&!label(file).startsWith('ocr/'));
const routeJs=appJs.filter(file=>!initial.includes(file)&&!basename(file).startsWith('ocr.worker-'));
const hero=join(dist,'assets','openlens-glasses-hero-v3.webp');
const heroFallback=join(dist,'assets','openlens-glasses-hero-v2.png');
const virtualScene=join(dist,'assets','openlens-virtual-park-v1.jpg');
const socialCard=join(dist,'assets','openlens-social-v1.jpg');
const css=files.filter(file=>file.endsWith('.css'));
const initialCss=initial.filter(file=>file.endsWith('.css'));
const initialRaw=initial.reduce((sum,file)=>sum+size(file),0);
const initialGzip=initial.reduce((sum,file)=>sum+gzip(file),0);
const appJsGzip=appJs.reduce((sum,file)=>sum+gzip(file),0);
const largestRoute=routeJs.sort((a,b)=>size(b)-size(a))[0];
const cssRaw=css.reduce((sum,file)=>sum+size(file),0);
const initialCssRaw=initialCss.reduce((sum,file)=>sum+size(file),0);
const limits={initialRaw:430*1024,initialGzip:120*1024,appJsGzip:210*1024,routeChunkRaw:170*1024,initialCssRaw:168*1024,appCssRaw:196*1024,heroRaw:150*1024,heroFallbackRaw:900*1024,virtualSceneRaw:700*1024,socialCardRaw:150*1024};
const rows=[
 ['Initial document + imports',initialRaw,limits.initialRaw],
 ['Initial document + imports (gzip)',initialGzip,limits.initialGzip],
 ['All app JavaScript (gzip)',appJsGzip,limits.appJsGzip],
 [`Largest lazy route (${largestRoute?basename(largestRoute):'none'})`,largestRoute?size(largestRoute):0,limits.routeChunkRaw],
 ['Initial CSS',initialCssRaw,limits.initialCssRaw],
 ['All application CSS',cssRaw,limits.appCssRaw],
 ['Glasses hero WebP',size(hero),limits.heroRaw],
 ['Glasses hero PNG fallback',size(heroFallback),limits.heroFallbackRaw],
 ['Virtual park scene',size(virtualScene),limits.virtualSceneRaw],
 ['Social preview image',size(socialCard),limits.socialCardRaw],
];
const format=bytes=>`${(bytes/1024).toFixed(1)} KiB`;
console.log('OpenLens production performance budget');
for(const [name,actual,limit] of rows)console.log(`${actual<=limit?'PASS':'FAIL'}  ${name}: ${format(actual)} / ${format(limit)}`);
const eagerOcr=initial.some(file=>label(file).startsWith('ocr/')||basename(file).startsWith('LocalAI-')||basename(file).startsWith('ocr.worker-'));
console.log(`${eagerOcr?'FAIL':'PASS'}  OCR engine absent from initial HTML imports`);
const failures=rows.filter(([,actual,limit])=>actual>limit);
if(eagerOcr||failures.length)process.exitCode=1;
