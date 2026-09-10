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
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
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
  await page.keyboard.press('Control+K');
  const input=page.getByPlaceholder(/Search devices, experiences, tools, evidence/i);
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
 await page.getByRole('button',{name:'Try demo image'}).click();
 await expect(page.getByRole('button',{name:'Read text locally'})).toBeEnabled();
 await page.getByRole('button',{name:'Read text locally'}).click();
 await expect(page.locator('.ocr-result, .local-ai [role="alert"]')).toBeVisible({timeout:120000});
 await expect(page.locator('.local-ai [role="alert"]')).toHaveCount(0);
 await expect(page.locator('.ocr-text')).toContainText(/RIVERSIDE LIBRARY/i);
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
 await expect(page.getByRole('status')).toContainText('Verified suite: 12 samples');
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
 await page.screenshot({path:testInfo.outputPath('optical-01-approach.png')});
 for(const [name,progress] of [['lens',.4],['world',.82]] as const){
  await page.locator('.cinematic').evaluate((element,p)=>window.scrollTo({top:element.getBoundingClientRect().top+window.scrollY+(element.clientHeight-window.innerHeight)*p,behavior:'instant'}),progress);
  await expect(page.locator('.hero-type')).toHaveJSProperty('inert',true);
  if(progress>.7)await expect(page.locator('.perception-world')).toHaveJSProperty('inert',false);
  await page.screenshot({path:testInfo.outputPath(`optical-${name}.png`)});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
 }
 await page.getByRole('link',{name:'Start a live simulation',exact:true}).click();
 await expect(page).toHaveURL(/#\/lab/);
});

