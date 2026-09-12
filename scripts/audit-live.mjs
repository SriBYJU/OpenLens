import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root=(process.env.OPENLENS_LIVE_URL??'https://sribyju.github.io/OpenLens/').replace(/\/?$/,'/');
const routes=['','lab','devices','compiler','benchmarks','research','developers','methodology','about'];
const failures=[];
const report=(condition,message)=>{if(!condition)failures.push(message)};
const url=route=>`${root}#/${route}`;
const browser=await chromium.launch(process.platform==='win32'?{channel:'msedge'}:{});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const page=await context.newPage();
const badResponses=[];
const consoleErrors=[];
page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(root))badResponses.push(`${response.status()} ${response.url()}`)});
page.on('pageerror',error=>consoleErrors.push(error.message));
page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
const visit=async route=>{
 const expected=route||'home';
 for(let attempt=1;attempt<=2;attempt++){
  await page.goto(url(route),{waitUntil:'domcontentloaded'});
  try{await page.waitForFunction(value=>document.body.dataset.route===value&&document.querySelectorAll('main#main').length===1&&!document.querySelector('.route-loading'),expected,{timeout:30000});return}
  catch(error){if(attempt===2)throw new Error(`${expected}: application did not become ready after two navigations`,{cause:error})}
 }
};

for(const route of routes){
 await visit(route);
 await page.waitForTimeout(850);
 report((await page.title()).includes('OpenLens'),`${route||'home'}: document title is missing OpenLens`);
 report(await page.locator('body').getAttribute('data-route')===(route||'home'),`${route||'home'}: route identity did not update`);
 report(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route||'home'}: desktop horizontal overflow`);
 if(route)report(await page.locator('.page-hero-scene').count()===1,`${route}: route optical scene is missing`);
 const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 const serious=accessibility.violations.filter(item=>item.impact==='critical'||item.impact==='serious');
 const details=serious.flatMap(item=>item.nodes.slice(0,5).map(node=>`${item.id} ${node.target.join(' > ')}${node.any[0]?.data?.contrastRatio?` (${node.any[0].data.contrastRatio}:1)`:''}`));
 report(serious.length===0,`${route||'home'}: accessibility ${details.join('; ')}`);
}

await page.goto(url('lab'));
await page.getByRole('button',{name:/Run this scenario/i}).click();
report(await page.locator('.outcome-card').count()===1,'lab: scenario did not produce an outcome');

await page.goto(url('compiler'));
await page.getByLabel(/Describe the experience/i).fill('When I hear a conversation, caption it in French on the display.');
await page.waitForFunction(()=>document.querySelectorAll('.structured-controls select')[1]?.value==='caption'&&document.querySelector('.structured-controls input')?.value==='French');
report(await page.locator('.structured-controls select').nth(1).inputValue()==='caption','compiler: authored text did not update task');
report(await page.locator('.structured-controls input').inputValue()==='French','compiler: authored text did not update language');

await page.goto(url('benchmarks'));
await page.getByLabel('Benchmark trial count').fill('5');
await page.getByRole('button',{name:'Run 5 trials',exact:true}).click();
report(await page.getByLabel('Benchmark trial outcomes').getByRole('button').count()===5,'benchmarks: trial suite did not render five outcomes');

await page.goto(url('devices'));
report(await page.locator('.matrix-device').count()===8,'devices: capability matrix does not contain eight profiles');
await page.locator('.catalog-tools .search-input').fill('Rokid');
report(await page.locator('.device-catalog .device-record').count()===1,'devices: catalog search did not filter to one profile');

await page.goto(url('developers'));
const sdk=page.locator('.sdk-lab');
await sdk.getByLabel('SDK command').selectOption('execute');
await sdk.getByRole('button',{name:'Run SDK example ↗'}).click();
report((await sdk.locator('.sdk-output>pre').textContent())?.includes('SALIDA'),'developers: SDK execution did not return the reference-twin output');
await sdk.getByLabel('SDK command').selectOption('benchmark');
await sdk.getByRole('button',{name:'Run SDK example ↗'}).click();
report((await sdk.locator('.sdk-output>pre').textContent())?.includes('"trials": 5'),'developers: SDK benchmark did not retain five trials');
await page.getByLabel('Device name').fill('Aurora One');
report((await page.locator('.code-stage pre').first().textContent())?.includes('Aurora One adapter'),'developers: generated adapter did not update');
report(await page.getByLabel('Generated adapter files').getByRole('button').count()===5,'developers: five-file starter is incomplete');

await page.goto(url('research'));
report(await page.locator('.evidence-ledger article').count()===7,'research: evidence ledger does not contain seven sourced hardware records');
await page.getByLabel('Technical claim').fill('The product page lists a display brightness of 1,500 nits.');
await page.getByLabel('Evidence device').selectOption('rokid-glasses');
await page.getByLabel('Publisher').fill('Rokid');
await page.getByLabel('Source title').fill('Rokid Glasses product page');
await page.getByLabel('Public HTTPS source').fill('https://global.rokid.com/products/rokid-glasses');
await page.getByLabel('Evidence notes').fill('Manufacturer specification; test conditions are not stated.');
await page.getByRole('button',{name:/Add to review queue/i}).click();
report(await page.getByLabel('Local evidence drafts').getByText(/display brightness of 1,500 nits/i).count()===1,'research: structured evidence did not enter the local review queue');

await page.setViewportSize({width:390,height:844});
for(const route of routes){
 await visit(route);
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
