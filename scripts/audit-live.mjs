import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root=(process.env.OPENLENS_LIVE_URL??'https://sribyju.github.io/OpenLens/').replace(/\/?$/,'/');
const routes=['','lab','devices','compiler','benchmarks','research','developers','methodology','about'];
const failures=[];
const report=(condition,message)=>{if(!condition)failures.push(message)};
const url=route=>`${root}#/${route}`;
const browser=await chromium.launch(process.platform==='win32'?{channel:'msedge'}:{});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const badResponses=[];
const consoleErrors=[];
page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(root))badResponses.push(`${response.status()} ${response.url()}`)});
page.on('pageerror',error=>consoleErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});

for(const route of routes){
 await page.goto(url(route),{waitUntil:'domcontentloaded'});
 await page.locator('main').waitFor({state:'visible'});
 await page.waitForTimeout(850);
 report((await page.title()).includes('OpenLens'),`${route||'home'}: document title is missing OpenLens`);
 report(await page.locator('body').getAttribute('data-route')===(route||'home'),`${route||'home'}: route identity did not update`);
 report(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route||'home'}: desktop horizontal overflow`);
 if(route)report(await page.locator('.page-hero-scene').count()===1,`${route}: route optical scene is missing`);
 const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 const serious=accessibility.violations.filter(item=>item.impact==='critical'||item.impact==='serious');
 report(serious.length===0,`${route||'home'}: accessibility ${serious.map(item=>item.id).join(', ')}`);
}

await page.goto(url('lab'));
await page.getByRole('button',{name:/Run this scenario/i}).click();
report(await page.locator('.outcome-card').count()===1,'lab: scenario did not produce an outcome');

await page.goto(url('compiler'));
await page.getByLabel(/Describe the experience/i).fill('When I hear a conversation, caption it in French on the display.');
report(await page.getByLabel('Task',{exact:true}).inputValue()==='caption','compiler: authored text did not update task');
report(await page.getByLabel('Language',{exact:true}).inputValue()==='French','compiler: authored text did not update language');

await page.goto(url('benchmarks'));
await page.getByLabel('Benchmark trial count').fill('5');
await page.getByRole('button',{name:'Run 5 trials',exact:true}).click();
report(await page.getByLabel('Benchmark trial outcomes').getByRole('button').count()===5,'benchmarks: trial suite did not render five outcomes');

await page.goto(url('devices'));
report(await page.locator('.matrix-device').count()===8,'devices: capability matrix does not contain eight profiles');
await page.locator('.catalog-tools .search-input').fill('Rokid');
report(await page.locator('.device-catalog .device-record').count()===1,'devices: catalog search did not filter to one profile');

await page.goto(url('developers'));
await page.getByLabel('Device name').fill('Aurora One');
report((await page.locator('.code-stage pre').first().textContent())?.includes('Aurora One adapter'),'developers: generated adapter did not update');
report(await page.getByLabel('Generated adapter files').getByRole('button').count()===4,'developers: four-file starter is incomplete');

await page.goto(url('research'));
report(await page.locator('.evidence-ledger article').count()===7,'research: evidence ledger does not contain seven sourced hardware records');

await page.setViewportSize({width:390,height:844});
for(const route of routes){
 await page.goto(url(route),{waitUntil:'domcontentloaded'});
 await page.locator('main').waitFor({state:'visible'});
 await page.waitForTimeout(250);
 report(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route||'home'}: phone horizontal overflow`);
}
await page.goto(url('lab'));
report((await page.locator('.virtual-world-scene').boundingBox())?.y<480,'lab: virtual world is below the first phone viewport');
await page.goto(url('compiler'));
report((await page.getByLabel(/Describe the experience/i).boundingBox())?.y<480,'compiler: authoring field is below the first phone viewport');

await page.setViewportSize({width:1280,height:900});
await page.emulateMedia({reducedMotion:'no-preference'});
await page.goto(url(''));
await page.getByRole('link',{name:'Lens Lab',exact:true}).first().click();
await page.locator('.route-curtain').waitFor({state:'visible',timeout:1000});
await page.locator('.route-curtain').waitFor({state:'detached',timeout:1800});
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto(url('compiler'));
await page.goto(url('benchmarks'));
report(await page.locator('.route-curtain').count()===0,'reduced motion: navigation curtain remained active');

await browser.close();
report(badResponses.length===0,`HTTP failures: ${[...new Set(badResponses)].join(', ')}`);
report(consoleErrors.length===0,`browser errors: ${[...new Set(consoleErrors)].join(' | ')}`);
if(failures.length){
 console.error(`OpenLens live audit failed (${root})`);
 for(const failure of failures)console.error(`- ${failure}`);
 process.exitCode=1;
}else console.log(`OpenLens live audit passed: ${routes.length} routes, desktop + phone, interaction + accessibility + motion (${root})`);
