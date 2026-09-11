import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {Buffer} from 'node:buffer';
import {readFileSync} from 'node:fs';
import {strFromU8,unzipSync} from 'fflate';
import {benchmark,compileExperience,defaultSimulationConfig,experiencePresets,getDevice} from '../src/core';

test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.clear())});

test('homepage renders the optical opening without page overflow',async({page})=>{
  await page.goto('/#/');
  await expect(page.getByRole('heading',{name:/See the system/})).toBeVisible();
  await expect(page.getByAltText(/Detailed graphite OpenLens/)).toBeVisible();
  const atlas=page.getByRole('region',{name:/Follow one signal through the stack/i});
  await expect(atlas.getByRole('link')).toHaveCount(5);
  await expect(atlas.getByRole('link',{name:/Compile the intent/i})).toHaveAttribute('href','#/compiler');
  const pathfinder=page.getByRole('region',{name:/Choose a way into OpenLens/i});
  await pathfinder.getByRole('button',{name:/I want to build/i}).click();
  await expect(pathfinder.getByRole('link',{name:/Open the Experience Compiler/i})).toHaveAttribute('href','#/compiler');
  const field=page.getByRole('region',{name:/Seven pairs.*Seven different realities/i});
  await field.getByRole('button',{name:/Meta.*Ray-Ban Meta/i}).click();
  await expect(field.getByText('NO VISUAL DISPLAY',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
  await field.getByRole('button',{name:/Try its capability model/i}).click();
  await expect(page).toHaveURL(/#\/lab\?device=model-ray-ban-meta/);
  await expect(page.locator('.workbench-rail select').first()).toHaveValue('model-ray-ban-meta');
});

test('homepage live proof runs the same deterministic workbench',async({page})=>{
  await page.goto('/#/');
  await page.locator('#home-live-proof').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading',{name:/Don’t read the pitch.*Run the signal/i})).toBeVisible();
  await page.getByRole('button',{name:/Run deterministic scenario/i}).click();
  await expect(page.locator('.signal-artifact').getByText('SUCCESS')).toBeVisible();
  await expect(page.locator('.signal-plan article.success')).toHaveCount(3);
  await page.getByRole('button',{name:'Permission denied'}).click();
  await page.getByRole('button',{name:/Run deterministic scenario/i}).click();
  await expect(page.locator('.signal-artifact').getByText('FAILED')).toBeVisible();
  await expect(page.locator('.signal-plan article.failure')).toHaveCount(1);
});

test('command palette carries workbench state into Lens Lab',async({page})=>{
  await page.goto('/#/');
  const trigger=page.getByRole('button',{name:/Command/i});
  const opener=await trigger.isVisible()?trigger:page.getByRole('button',{name:'Menu',exact:true});
  await opener.focus();
  if(await trigger.isVisible())await trigger.click();else await page.keyboard.press('Control+K');
  const input=page.getByPlaceholder(/Search devices, experiences, tools, evidence/i);
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  if(await trigger.isVisible())await trigger.click();else await page.keyboard.press('Control+K');
  await expect(input).toBeFocused();
  await input.fill('Translate the world');
  await page.getByRole('button',{name:/Run: Translate the world/i}).click();
  await expect(page).toHaveURL(/#\/lab/);
  await expect(page.locator('.workbench-rail select').nth(1)).toHaveValue('translate-sign');
});

test('Lens Lab changes state and exposes a failed trace',async({page})=>{
  await page.goto('/#/lab');
  await page.getByRole('button',{name:/Permission denied/}).click();
  await page.getByRole('button',{name:/Run this scenario/i}).click();
  await expect(page.getByRole('heading',{name:'The scenario exposed a failure.'})).toBeVisible();
  await expect(page.getByText(/camera permission denied/i).first()).toBeVisible();
  await expect(page.getByText(/CANONICAL TRACE/)).toBeVisible();
  await page.getByRole('button',{name:/Critical battery/}).click();
  await page.getByRole('button',{name:/Degraded commute/}).click();
  await page.getByRole('button',{name:/Run this scenario/i}).click();
  await expect(page.getByRole('heading',{name:'The experience completed.'})).toBeVisible();
  await page.getByRole('button',{name:'Next stage'}).click();
  await expect(page.getByLabel('Trace position')).not.toHaveValue('0');
});

test('compiled text becomes the active simulated experience',async({page})=>{
  await page.goto('/#/compiler');
  await page.getByLabel(/Describe the experience/i).fill('When I hear a conversation, caption it in French on the display.');
  await expect(page.getByLabel('TASK')).toHaveValue('caption');
  await expect(page.getByLabel('LANGUAGE')).toHaveValue('French');
  await page.getByRole('button',{name:/Use this in Lens Lab/i}).click();
  await page.getByRole('link',{name:/Open Lens Lab/i}).click();
  await expect(page.locator('.workbench-rail select').nth(1)).toHaveValue(/custom-/);
  await expect(page.locator('.workbench-rail select').nth(2)).toHaveValue('conversation');
  await page.getByRole('button',{name:/Run this scenario/i}).click();
  await expect(page.getByText(/The next turn is on your left/).first()).toBeVisible();
});

test('device fit and doctor preserve the hardware access boundary',async({page})=>{
  await page.goto('/#/devices');
  await expect(page).toHaveTitle('Device Universe — OpenLens');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/Compare sourced smart-glasses hardware/);
  const matrix=page.getByRole('region',{name:/See the boundary in one glance/i});
  await expect(matrix.locator('.matrix-device')).toHaveCount(8);
  await matrix.getByRole('button',{name:'Developer access',exact:true}).click();
  await expect(matrix.getByRole('button',{name:/Frame, camera: documented-api/i})).toContainText('documented api');
  await matrix.getByRole('button',{name:/Frame, camera: documented-api/i}).click();
  await expect(page.locator('.device-doctor').getByRole('heading',{name:'Frame',exact:true})).toBeVisible();
  await page.locator('.device-doctor').getByRole('button',{name:'Close Device Doctor',exact:true}).click();
  await expect(page.getByRole('heading',{name:/Describe the hardware.*your idea actually needs/i})).toBeVisible();
  await expect(page.getByText(/PROFILES CHECKED/)).toBeVisible();
  await page.locator('.catalog-tools .search-input').fill('Rokid');
  const record=page.locator('.device-record').filter({hasText:'Rokid Glasses'});
  await expect(record).toBeVisible();
  await record.getByRole('button',{name:'Device Doctor'}).click();
  const doctor=page.locator('.device-doctor');
  await expect(doctor.getByRole('heading',{name:'Rokid Glasses'})).toBeVisible();
  await expect(doctor.getByText('RESEARCH ONLY')).toBeVisible();
  await expect(doctor.getByText('NOT IMPLEMENTED').first()).toBeVisible();
});

test('device research, benchmark, and adapter generator are interactive',async({page})=>{
  await page.goto('/#/devices');
  await expect(page.getByText('8 OF 8 PROFILES')).toBeVisible();
  await page.locator('.catalog-tools .search-input').fill('Rokid');
  const record=page.locator('.device-catalog .device-record').filter({hasText:'Rokid Glasses'});
  await expect(record.getByRole('heading',{name:'Rokid Glasses'})).toBeVisible();
  await expect(record.getByText('49 G',{exact:true})).toBeVisible();
  await expect(record.getByText('480×400',{exact:true})).toBeVisible();
  await expect(page.getByText('1 OF 8 PROFILES')).toBeVisible();
  await record.getByRole('link',{name:/Inspect evidence/i}).click();
  const evidence=page.locator('.evidence-ledger article.open');
  await expect(evidence.getByText('Rokid Glasses',{exact:true})).toBeVisible();
  await expect(evidence.getByText('1500 nits',{exact:true})).toBeVisible();
  await expect(evidence.getByText(/CONFLICTING VALUE · 480×640 per eye/)).toBeVisible();
  await expect(evidence.getByRole('link',{name:/Rokid ↗/}).first()).toHaveAttribute('href','https://global.rokid.com/products/rokid-glasses');
  await page.goto('/#/benchmarks');
  await page.getByLabel('Benchmark trial count').fill('12');
  await page.getByRole('button',{name:/Run 12 trials/i}).click();
  await expect(page.getByText('12/12')).toBeVisible();
  await expect(page.getByLabel('Benchmark trial outcomes').getByRole('button')).toHaveCount(12);
  await page.goto('/#/developers');
  await page.getByLabel('DEVICE NAME').fill('Aurora One');
  const audioCapability=page.getByRole('checkbox',{name:'Audio'});
  await audioCapability.focus();
  await page.keyboard.press('Space');
  await expect(audioCapability).toBeChecked();
  await expect(page.locator('.code-stage pre')).toContainText('name: "Aurora One adapter"');
  await expect(page.locator('.code-stage pre')).toContainText('"audio"');
  await expect(page.getByLabel('Generated adapter files').getByRole('button')).toHaveCount(4);
  await page.getByRole('button',{name:/\.test\.ts$/}).click();
  await expect(page.locator('.code-stage pre')).toContainText('enforces connection and delegates a matching plan');
  const pendingDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:/Download ZIP/}).click();
  const archiveDownload=await pendingDownload;
  expect(archiveDownload.suggestedFilename()).toBe('my-glasses-openlens-adapter.zip');
  const archivePath=await archiveDownload.path();
  expect(archivePath).not.toBeNull();
  const archive=unzipSync(readFileSync(archivePath!));
  expect(Object.keys(archive).sort()).toEqual([
   'my-glasses-openlens-adapter/README.md',
   'my-glasses-openlens-adapter/src/adapters/my-glasses.test.ts',
   'my-glasses-openlens-adapter/src/adapters/my-glasses.ts',
   'my-glasses-openlens-adapter/verification-record.json',
  ]);
  expect(strFromU8(archive['my-glasses-openlens-adapter/verification-record.json'])).toContain('"status": "unverified"');
  await page.getByRole('button',{name:'Run readiness checks'}).click();
  await expect(page.locator('.doctor-check')).toHaveCount(8);
  await expect(page.locator('.doctor-check').filter({hasText:'ocr/lang/eng.traineddata.gz'})).toContainText('pass');
});

test('core workbench pages have no serious automated accessibility violations',async({page})=>{
  for(const route of ['','lab','devices','compiler','benchmarks']){
    await page.goto(`/#/${route}`);
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.filter(item=>item.impact==='critical'||item.impact==='serious'),`${route||'home'}: ${results.violations.map(item=>item.id).join(', ')}`).toEqual([]);
  }
});

test('flagship layout survives tablet, ultrawide, and reduced-motion states',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='desktop','One targeted responsive sweep is sufficient.');
  test.setTimeout(60000);
  const states=[
    {name:'tablet',width:820,height:1180,reduced:false},
    {name:'ultrawide',width:1920,height:900,reduced:false},
    {name:'reduced-motion',width:1440,height:900,reduced:true},
  ];
  for(const state of states){
    await page.setViewportSize({width:state.width,height:state.height});
    await page.emulateMedia({reducedMotion:state.reduced?'reduce':'no-preference'});
    // Re-enter the route so each viewport is measured from a fresh Home mount.
    // A same-URL goto preserves the previous iteration's scroll position.
    await page.goto('/#/about');
    await page.goto('/#/');
    await expect(page.locator('.cinematic')).toHaveAttribute('data-phase','0');
    await expect(page.getByRole('heading',{name:/See the system/})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`${state.name} overflow`).toBe(true);
    await page.locator('#home-live-proof').scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`${state.name} live-proof overflow`).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`openlens-${state.name}.png`),fullPage:false,animations:'disabled'});
  }
});

test('local OCR recognizes the supplied image in a browser worker',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Run one real OCR worker to avoid duplicate model downloads competing in CI.');
 test.setTimeout(150000);
 await page.goto('/#/lab');
 await page.getByRole('button',{name:/Try real local OCR/}).click();
 const router=page.locator('.ai-router');
 await expect(router).toContainText(/local-browser/i);
 await router.getByLabel('Task').selectOption('scene-understanding');
 await expect(router).toContainText(/No local vision model/i);
 await expect(router.locator('header>span')).toHaveText('unavailable');
 await router.getByLabel('Task').selectOption('translation');
 await expect(router).toContainText(/OpenLens sign phrasebook/i);
 await expect(router.locator('header>span')).toHaveText('limited');
 await page.getByRole('button',{name:'Try demo image'}).click();
 await expect(page.locator('.visual-signal')).toContainText(/REAL PIXEL ANALYSIS/i);
 await expect(page.locator('.visual-signal')).toContainText(/OCR READINESS/i);
 await expect(page.getByRole('button',{name:'Read text locally'})).toBeEnabled();
 await page.getByRole('button',{name:'Read text locally'}).click();
 await expect(page.locator('.ocr-result, .local-ai [role="alert"]')).toBeVisible({timeout:120000});
 await expect(page.locator('.local-ai [role="alert"]')).toHaveCount(0);
 await expect(page.locator('.ocr-text')).toContainText(/RIVERSIDE LIBRARY/i);
 await page.getByLabel('Translation target language').selectOption('Spanish');
 await page.getByRole('button',{name:'Translate locally'}).click();
 await expect(page.locator('.translated-text')).toContainText(/SALIDA IZQUIERDA/i);
 await expect(page.locator('.ai-pipeline')).toContainText(/PHRASEBOOK MATCHED/i);
 await expect(page.locator('.translation-warning')).toContainText(/RIVERSIDE/i);
 const resultDownload=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download result JSON'}).click();
 const downloaded=await resultDownload;
 expect(downloaded.suggestedFilename()).toBe('openlens-local-ai-result.json');
 const saved=JSON.parse(readFileSync((await downloaded.path())!,'utf8'));
 expect(saved).toMatchObject({version:2,mode:'local-browser',visionSignal:{width:1200,height:650,exposure:'balanced'},translation:{sourceLanguage:'English',targetLanguage:'Spanish',provider:'openlens-sign-phrasebook-v1'}});
 expect(saved.translation.output).toMatch(/SALIDA IZQUIERDA/);
 expect(saved.translationMs).toBeGreaterThan(0);
 const accessibility=await new AxeBuilder({page}).include('.ai-drawer').analyze();
 expect(accessibility.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([]);
 for(const viewport of [{width:1280,height:900},{width:768,height:1024},{width:375,height:812}]){
  await page.setViewportSize(viewport);
  await page.locator('.translation-result').evaluate(element=>window.scrollTo(0,element.getBoundingClientRect().top+window.scrollY-100));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`openlens-local-ai-${viewport.width}.png`),animations:'disabled'});
 }
 await page.getByLabel('Translation target language').selectOption('French');
 await expect(page.locator('.translation-result')).toHaveCount(0);
 await page.getByRole('button',{name:'Clear image',exact:true}).click();
 await expect(page.locator('.ocr-result')).toHaveCount(0);
});

test('compiler exposes all seven task families and hands off new tasks',async({page})=>{
 await page.goto('/#/compiler');
 const task=page.getByRole('combobox',{name:'Task',exact:true});
 await expect(task.locator('option')).toHaveCount(7);
 await page.getByRole('button',{name:/Debug an adapter/}).click();
 await expect(task).toHaveValue('debug');
 await page.getByRole('button',{name:'Use this in Lens Lab'}).click();
 await page.getByRole('link',{name:'Open Lens Lab'}).click();
 await expect(page.getByLabel('Virtual environment')).toHaveValue('debug-console');
 await page.getByRole('button',{name:/Run this scenario/i}).click();
 await expect(page.locator('.outcome-card')).toContainText(/First fault/i);
});

test('hardware capability models produce different routes',async({page})=>{
 await page.goto('/#/lab');
 await page.locator('.workbench-rail select').first().selectOption('model-ray-ban-meta');
 await page.getByRole('button',{name:/Run this scenario/i}).click();
 await expect(page.getByRole('button',{name:/Rendered audio response/})).toBeVisible();
 await page.locator('.workbench-rail select').first().selectOption('model-vuzix-z100');
 await page.getByText('Advanced timing and reliability',{exact:true}).click();
 await page.getByLabel('Missing capability policy').selectOption('block');
 await page.getByRole('button',{name:/Run this scenario/i}).click();
 await expect(page.getByRole('heading',{name:'This device cannot execute the plan.'})).toBeVisible();
});

test('environment controls change timing, quality, and acquisition outcome',async({page})=>{
 await page.goto('/#/lab');
 const score=page.locator('.signal-score strong');
 await expect(score).toContainText('100');
 await page.getByRole('button',{name:/Night walk/}).click();
 await expect(score).toHaveText('43/100');
 await page.getByRole('button',{name:/Run this scenario/i}).click();
 await expect(page.getByRole('heading',{name:'The experience completed.'})).toBeVisible();
 await page.getByLabel('Illumination in lux').fill('0');
 await page.getByLabel('Head motion in degrees per second').fill('160');
 await expect(page.locator('.signal-score')).toHaveClass(/unusable/);
 await page.getByRole('button',{name:/Run this scenario/i}).click();
 await expect(page.getByRole('heading',{name:'The scenario exposed a failure.'})).toBeVisible();
 await expect(page.locator('.outcome-card').getByText(/environment model could not acquire/i)).toBeVisible();
});

test('exported benchmark suites reopen and help keeps keyboard focus',async({page})=>{
 const suite=benchmark(compileExperience(experiencePresets[0],getDevice('openlens-twin')),{...defaultSimulationConfig,failureRate:.5},12);
 await page.goto('/#/benchmarks');
 await page.locator('.import-strip input[type="file"]').setInputFiles({name:'benchmark.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(suite))});
 await expect(page.locator('.import-strip').getByRole('status')).toContainText('Verified suite: 12 samples');
 await expect(page.getByLabel('Benchmark trial outcomes').getByRole('button')).toHaveCount(12);
 await page.getByLabel('Benchmark trial outcomes').getByRole('button').first().click();
 if(!await page.getByRole('button',{name:'What is this?',exact:true}).isVisible())await page.getByRole('button',{name:'Menu',exact:true}).click();
 await page.getByRole('button',{name:'What is this?',exact:true}).click();
 const close=page.getByRole('button',{name:'Close guide'});
 await expect(close).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(page.getByRole('button',{name:'Start using this feature'})).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(close).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('cinematic lens entry preserves its axis and exposes only active actions',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/#/');
 await expect(page.getByRole('heading',{name:'See the system.',exact:true})).toBeVisible();
 await expect(page.locator('.glasses-stage img')).toHaveJSProperty('complete',true);
 expect(await page.locator('.glasses-stage img').evaluate(image=>(image as HTMLImageElement).currentSrc.endsWith('openlens-glasses-hero-v3.webp'))).toBe(true);
 await page.screenshot({path:testInfo.outputPath('optical-01-approach.png')});
 for(const [name,progress] of [['lens',.4],['transition',.7],['world',.82]] as const){
  await page.locator('.cinematic').evaluate((element,p)=>window.scrollTo({top:element.getBoundingClientRect().top+window.scrollY+(element.clientHeight-window.innerHeight)*p,behavior:'instant'}),progress);
  await expect(page.locator('.hero-type')).toHaveJSProperty('inert',true);
  if(progress===.7){await expect(page.locator('.glasses-stage')).toBeVisible();expect(await page.locator('.glasses-stage').evaluate(element=>Number(getComputedStyle(element).opacity))).toBeGreaterThan(0)}
  if(progress>.7)await expect(page.locator('.perception-world')).toHaveJSProperty('inert',false);
  await page.screenshot({path:testInfo.outputPath(`optical-${name}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
 }
 await page.getByRole('link',{name:'Start a live simulation',exact:true}).click();
 await expect(page).toHaveURL(/#\/lab/);
});


// First-screen layout and fixture feedback are product behavior, not just snapshots.
test('optical workbench shows the instrument first and updates its scene',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Desktop test explicitly covers all three widths.');
 for(const width of [1280,768,375]){
  await page.setViewportSize({width,height:900});
  await page.goto('/#/lab');
  await page.reload();
  const scene=page.locator('.virtual-world-scene');
  await expect(scene).toHaveAttribute('data-fixture','street-sign');
  await expect(scene.getByText('SORTIE',{exact:true})).toBeVisible();
  const box=await scene.boundingBox();
  expect(box!.y,`Instrument must appear in first viewport at ${width}`).toBeLessThan(480);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`instrument-${width}.png`)});
  await page.getByLabel('Virtual environment').selectOption('museum-label');
  await expect(scene.getByText('JARDIN / 1847',{exact:true})).toBeVisible();
  const before=await scene.getAttribute('style');
  await page.getByLabel('Illumination in lux').fill('0');
  expect(await scene.getAttribute('style')).not.toBe(before);
  await page.getByRole('button',{name:/Focus JARDIN \/ 1847 sign and run translate/i}).click();
  await expect(page.locator('.world-caption')).toContainText('Instrumentos ópticos, 1847');
  await page.getByRole('button',{name:'Diagnostic'}).click();
  await expect(page.locator('.fixture-scene').getByRole('img')).toHaveAccessibleName('Synthetic museum room with an exhibit label');
  await page.getByRole('button',{name:/Conversation captions/}).click();
  await expect(page.locator('.workbench-rail select').nth(1)).toHaveValue('live-captions');
  await expect(page.getByLabel('Virtual environment')).toHaveValue('conversation');
  await page.getByRole('button',{name:'Virtual world',exact:true}).click();
  await page.getByRole('button',{name:/Focus detected speakers and run caption/i}).click();
  await expect(page.locator('.world-caption')).toContainText('The next turn is on your left.');
  await page.goto('/#/devices');
  await expect(page.locator('.device-record')).toHaveCount(8);
  await page.screenshot({path:testInfo.outputPath(`field-guide-${width}.png`)});
  await page.getByRole('button',{name:'Find your fit ↗'}).click();
  await expect(page).toHaveURL(/#\/devices$/);
  await expect(page.locator('#device-fit')).toBeFocused();
 }
});

test('compiler route opens the current draft and evidence views stay usable',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Explicitly exercises desktop, tablet and phone widths.');
 await page.goto('/#/compiler');
 await page.getByLabel('Describe the experience').fill('When I hear a conversation, caption it in French on the display.');
 await expect(page.getByRole('combobox',{name:'Task',exact:true})).toHaveValue('caption');
 await expect(page.getByRole('textbox',{name:'Language',exact:true})).toHaveValue('French');
 await page.locator('.compile-row.runnable').first().click();
 await expect(page).toHaveURL(/#\/lab/);
 await expect(page.getByLabel('Virtual environment')).toHaveValue('conversation');
 await expect(page.locator('.workbench-rail')).toContainText('caption it in French');
 await page.getByRole('button',{name:/Run this scenario/i}).click();
 await expect(page.locator('.world-caption')).toContainText('The next turn is on your left.');
 for(const width of [1280,768,375]){
  await page.setViewportSize({width,height:900});
  await page.goto('/#/compiler');
  const input=page.getByLabel('Describe the experience');
  await expect(input).toBeVisible();
  const inputBox=(await input.boundingBox())!;
  expect(inputBox.y).toBeLessThan(480);
  expect(inputBox.x+inputBox.width).toBeLessThan(width-10);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(`author-${width}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.goto('/#/benchmarks');
  await page.getByRole('button',{name:'Run 24 trials',exact:true}).click();
  await expect(page.getByLabel('Benchmark trial outcomes').getByRole('button')).toHaveCount(24);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(`evidence-${width}.png`)});
  await page.locator('.distribution-panel').scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath(`evidence-chart-${width}.png`)});
  if(width===1280){const audit=await new AxeBuilder({page}).include('.benchmark-workspace').analyze();expect(audit.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([])}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test('benchmark chart preserves failed runs and contains large trial sets',async({page})=>{
 await page.goto('/#/lab');
 await page.getByLabel('Injected failure').selectOption('timeout');
 await page.goto('/#/benchmarks');
 await page.getByLabel('Benchmark trial count').fill('500');
 await page.getByRole('button',{name:'Run 500 trials',exact:true}).click();
 const chart=page.getByLabel('Benchmark trial outcomes');
 await expect(chart.getByRole('button')).toHaveCount(500);
 const heights=await chart.evaluate(element=>({height:element.clientHeight,max:Math.max(...[...element.children].map(child=>child.getBoundingClientRect().height))}));
 expect(heights.max).toBeLessThanOrEqual(heights.height+1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await chart.getByRole('button').last().click();
 await expect(chart.getByRole('button').last()).toHaveClass(/selected/);
 const exported=page.waitForEvent('download');
 await page.locator('.trace-workspace').getByRole('button',{name:'Export JSON',exact:true}).click();
 const artifact=JSON.parse(readFileSync((await (await exported).path())!,'utf8'));
 expect(artifact.seed).toBe(541);
 const inspector=page.locator('.trace-inspector');
 await expect(inspector).toContainText(artifact.trace[0].id);
 await expect(inspector.locator('pre')).toHaveText(JSON.stringify(artifact.trace[0].metadata,null,2));
});

test('optional visitor tour teaches the working loop and restores focus',async({page})=>{
 await page.goto('/#/');
 const opener=page.getByRole('button',{name:/Take the 2-minute tour/i});
 await opener.click();
 const dialog=page.getByRole('dialog',{name:'Explore the field.'});
 await expect(dialog.getByText('GUIDED TOUR · 1 / 8')).toBeVisible();
 await dialog.getByRole('button',{name:'Next step'}).click();
 await expect(page.getByRole('dialog',{name:'Choose a target.'})).toBeVisible();
 const accessibility=await new AxeBuilder({page}).include('.help-drawer').analyze();
 expect(accessibility.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([]);
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(opener).toBeFocused();
});

test('evidence index filters records and adapter workshop stays usable',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Explicitly exercises desktop, tablet and phone widths.');
 await page.goto('/#/research');
 await page.getByLabel('Search evidence').fill('Rokid');
 await expect(page.locator('.evidence-ledger article')).toHaveCount(1);
 await expect(page.locator('.evidence-ledger')).toContainText('Rokid Glasses');
 await page.getByLabel('Filter integration state').selectOption('simulated');
 await expect(page.getByText('No evidence record matches.')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('.evidence-ledger article')).toHaveCount(7);
 for(const width of [1280,768,375]){
  await page.setViewportSize({width,height:900});
  await page.goto('/#/research');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(`ledger-${width}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.goto('/#/developers');
  await expect(page.getByText('4/4 files')).toBeVisible();
  await page.getByLabel('Stable device ID').fill('');
  await expect(page.getByText('0/4 files')).toBeVisible();
  await expect(page.locator('.builder-errors')).toBeVisible();
  await page.getByLabel('Stable device ID').fill('aurora-one');
  await expect(page.getByText('4/4 files')).toBeVisible();
  await expect(page.getByLabel('Generated adapter files').getByRole('button')).toHaveCount(4);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(`adapter-${width}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test('methodology index and about story remain readable at every width',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Explicitly exercises desktop, tablet and phone widths.');
 for(const width of [1280,768,375]){
  await page.setViewportSize({width,height:900});
  await page.goto('/#/methodology');
  await page.getByRole('button',{name:'04 / Statistics'}).click();
  await expect(page.locator('#stats')).toBeInViewport();
  await expect(page).toHaveURL(/#\/methodology$/);
  await expect(page.locator('#stats')).toBeFocused();
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(`method-${width}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.goto('/#/about');
  await expect(page.getByAltText('Shriyan Avadhanula, founder and developer of OpenLens')).toHaveJSProperty('complete',true);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:testInfo.outputPath(`about-${width}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 const audit=await new AxeBuilder({page}).include('main').analyze();
 expect(audit.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([]);
});

test('route motion communicates place without blocking content or reduced-motion users',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','The motion contract only needs one browser pass.');
 await page.goto('/#/');
 await page.getByRole('link',{name:'Lens Lab',exact:true}).first().click();
 await expect(page.locator('main#main')).toHaveCount(1);
 await expect(page.locator('.route-curtain')).toBeVisible();
 await expect(page.locator('body')).toHaveAttribute('data-route','lab');
 await expect(page.locator('.page-hero-scene')).toHaveAttribute('aria-hidden','true');
 await expect(page.getByRole('heading',{name:/The optical workbench/i})).toBeVisible();
 await expect(page.locator('.route-curtain')).toHaveCount(0,{timeout:1500});
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.workbench-grid')).toHaveClass(/ol-seen/);
 await expect(page.locator('.optical-console')).toBeInViewport();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/#/compiler');
 await page.goto('/#/benchmarks');
 await expect(page.locator('.route-curtain')).toHaveCount(0);
 await expect(page.locator('.page-hero')).toBeVisible();
 await expect(page.getByRole('button',{name:'Run 24 trials',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('scenario studio executes distinct document, object, and debugging worlds',async({page})=>{
 await page.goto('/#/lab');
 await page.getByRole('button',{name:/03 · LOAD Document reading/}).click();
 await expect(page.getByLabel('Virtual environment')).toHaveValue('document-page');
 await expect(page.locator('.virtual-world-scene')).toHaveAttribute('data-task','describe');
 await page.getByRole('button',{name:/Focus PRIVACY NOTE \/ 04 and run describe/}).click();
 await expect(page.locator('.world-caption')).toContainText('camera frames stay transient');
 await page.getByRole('button',{name:/05 · LOAD Object recognition/}).click();
 await expect(page.getByLabel('Virtual environment')).toHaveValue('object-shelf');
 await page.getByRole('button',{name:/Focus CITY BICYCLE and run identify/}).click();
 await expect(page.locator('.world-caption')).toContainText('Red city bicycle');
 await page.getByRole('button',{name:/07 · LOAD Live developer debugging/}).click();
 await expect(page.getByLabel('Virtual environment')).toHaveValue('debug-console');
 await page.getByRole('button',{name:/Focus OUTPUT.WRITE and run debug/}).click();
 await expect(page.locator('.world-caption')).toContainText('First fault');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('adapter conformance lab proves clean and damaged bundles',async({page})=>{
 await page.goto('/#/developers');
 await page.getByRole('button',{name:'Run 8 checks ↗'}).click();
 await expect(page.locator('.conformance-orb')).toContainText('8/8');
 await expect(page.locator('.check-stack article.pass')).toHaveCount(8);
 await page.getByLabel('Probe the validator').selectOption('promoted-status');
 await page.getByRole('button',{name:'Run 8 checks ↗'}).click();
 await expect(page.locator('.conformance-orb')).toContainText('FAULT CAUGHT');
 await expect(page.locator('.check-stack article.fail')).toHaveCount(1);
 const audit=await new AxeBuilder({page}).include('.conformance-lab').analyze();
 expect(audit.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([]);
});

test('benchmark families expose formulas and withhold unsupported scores',async({page})=>{
 await page.goto('/#/benchmarks');
 await page.getByLabel('Benchmark trial count').fill('8');
 await page.getByRole('button',{name:'Run 8 trials',exact:true}).click();
 await page.getByRole('button',{name:/04 Battery NOT SCORED/}).click();
 const panel=page.locator('.benchmark-families article');
 await expect(panel).toContainText('No endurance score');
 await expect(panel).toContainText('Withheld until the required evidence exists.');
 await page.getByRole('button',{name:/05 Connectivity/}).click();
 await expect(panel).toContainText('Score = completed runs ÷ all trials × 100');
 const audit=await new AxeBuilder({page}).include('.benchmark-families').analyze();
 expect(audit.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([]);
});

test('browser field recorder requires opt-in and exports a local aggregate artifact',async({page})=>{
 await page.goto('/#/benchmarks');
 const recorder=page.locator('.field-recorder');
 await expect(recorder).toContainText('No browser measurements are being collected.');
 await recorder.getByRole('button',{name:'Start private recording'}).click();
 await expect(recorder.locator('.recorder-state')).toHaveText('recording');
 await recorder.getByRole('button',{name:'Run two-frame response probe'}).click();
 await expect(recorder).toContainText('1 SAMPLE');
 const audit=await new AxeBuilder({page}).include('.field-recorder').analyze();expect(audit.violations.filter(item=>['serious','critical'].includes(item.impact??''))).toEqual([]);
 await recorder.getByRole('button',{name:'Stop recording'}).click();
 const pending=page.waitForEvent('download');await recorder.getByRole('button',{name:'Download local JSON'}).click();const download=await pending;
 expect(download.suggestedFilename()).toBe('openlens-browser-field-session.json');const artifact=JSON.parse(readFileSync((await download.path())!,'utf8'));
 expect(artifact).toMatchObject({kind:'browser-field-session',measurementBoundary:'browser-page-only',consent:'explicit-start-button',storage:'memory-until-clear-or-refresh'});
 expect(artifact.metrics.responseProbesMs).toHaveLength(1);expect(artifact.userAgent).toBeUndefined();
 await recorder.getByRole('button',{name:'Clear session'}).click();await expect(recorder.locator('.recorder-state')).toHaveText('ready');
});
