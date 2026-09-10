import {chromium} from '@playwright/test';

const url=process.env.OPENLENS_PROFILE_URL??'http://127.0.0.1:4176/';
const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
const page=await context.newPage();
await page.addInitScript(()=>{
 window.__openLensProfile={cls:0,lcp:0};
 new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__openLensProfile.cls+=entry.value}).observe({type:'layout-shift',buffered:true});
 new PerformanceObserver(list=>{window.__openLensProfile.lcp=list.getEntries().at(-1)?.startTime??0}).observe({type:'largest-contentful-paint',buffered:true});
});
const session=await context.newCDPSession(page);
await session.send('Emulation.setCPUThrottlingRate',{rate:4});
await session.send('Network.enable');
await session.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8,connectionType:'cellular3g'});
await page.goto(url,{waitUntil:'domcontentloaded'});
await page.locator('.glasses-stage img').evaluate(image=>image.complete?undefined:new Promise(resolve=>image.addEventListener('load',resolve,{once:true})));
await page.waitForTimeout(500);
const loading=await page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0];return {domContentLoadedMs:Math.round(nav.domContentLoadedEventEnd),loadMs:Math.round(nav.loadEventEnd),lcpMs:Math.round(window.__openLensProfile.lcp),cls:Number(window.__openLensProfile.cls.toFixed(4))}});
const frames=await page.locator('.cinematic').evaluate(async element=>{
 const distance=Math.max(1,element.scrollHeight-innerHeight);const deltas=[];let previous=performance.now();
 for(let index=0;index<=120;index++)await new Promise(resolve=>requestAnimationFrame(now=>{scrollTo(0,distance*(index/120));deltas.push(now-previous);previous=now;resolve()}));
 deltas.shift();const sorted=[...deltas].sort((a,b)=>a-b);return {samples:deltas.length,medianFrameMs:Number(sorted[Math.floor(sorted.length*.5)].toFixed(1)),p95FrameMs:Number(sorted[Math.floor(sorted.length*.95)].toFixed(1)),framesOver50ms:deltas.filter(delta=>delta>50).length};
});
console.log(JSON.stringify({profile:'4× CPU / 1.6 Mbps / 150 ms RTT',loading,cinematic:frames},null,2));
await browser.close();
