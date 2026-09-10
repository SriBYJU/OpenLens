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
const hero=join(dist,'assets','openlens-glasses-hero-v2.png');
const css=files.filter(file=>file.endsWith('.css'));
const initialRaw=initial.reduce((sum,file)=>sum+size(file),0);
const initialGzip=initial.reduce((sum,file)=>sum+gzip(file),0);
const appJsGzip=appJs.reduce((sum,file)=>sum+gzip(file),0);
const largestRoute=routeJs.sort((a,b)=>size(b)-size(a))[0];
const cssRaw=css.reduce((sum,file)=>sum+size(file),0);
const limits={initialRaw:430*1024,initialGzip:120*1024,appJsGzip:210*1024,routeChunkRaw:170*1024,cssRaw:150*1024,heroRaw:900*1024};
const rows=[
 ['Initial document + imports',initialRaw,limits.initialRaw],
 ['Initial document + imports (gzip)',initialGzip,limits.initialGzip],
 ['All app JavaScript (gzip)',appJsGzip,limits.appJsGzip],
 [`Largest lazy route (${largestRoute?basename(largestRoute):'none'})`,largestRoute?size(largestRoute):0,limits.routeChunkRaw],
 ['Application CSS',cssRaw,limits.cssRaw],
 ['Glasses hero image',size(hero),limits.heroRaw],
];
const format=bytes=>`${(bytes/1024).toFixed(1)} KiB`;
console.log('OpenLens production performance budget');
for(const [name,actual,limit] of rows)console.log(`${actual<=limit?'PASS':'FAIL'}  ${name}: ${format(actual)} / ${format(limit)}`);
const eagerOcr=initial.some(file=>label(file).startsWith('ocr/')||basename(file).startsWith('LocalAI-')||basename(file).startsWith('ocr.worker-'));
console.log(`${eagerOcr?'FAIL':'PASS'}  OCR engine absent from initial HTML imports`);
const failures=rows.filter(([,actual,limit])=>actual>limit);
if(eagerOcr||failures.length)process.exitCode=1;
