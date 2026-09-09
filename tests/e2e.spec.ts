import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  await expect(page.getByRole('heading',{name:'Rokid Glasses'})).toBeVisible();
  await expect(page.getByText('1 OF 8 PROFILES')).toBeVisible();
  await page.getByRole('link',{name:/Inspect evidence/i}).last().click();
  await expect(page.locator('.evidence-ledger article.open').getByText('Rokid Glasses',{exact:true})).toBeVisible();
  await page.goto('/#/benchmarks');
  await page.getByLabel('Benchmark trial count').fill('12');
  await page.getByRole('button',{name:/Run 12 trials/i}).click();
  await expect(page.getByText('12/12')).toBeVisible();
  await expect(page.getByLabel('Benchmark trial outcomes').getByRole('button')).toHaveCount(12);
  await page.goto('/#/developers');
  await page.getByLabel('DEVICE NAME').fill('Aurora One');
  await page.getByRole('checkbox',{name:'Audio'}).check();
  await expect(page.locator('.code-stage pre')).toContainText('name: "Aurora One adapter"');
  await expect(page.locator('.code-stage pre')).toContainText("'audio'");
});

test('core workbench pages have no serious automated accessibility violations',async({page})=>{
  for(const route of ['','lab','devices','compiler','benchmarks']){
    await page.goto(`/#/${route}`);
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.filter(item=>item.impact==='critical'||item.impact==='serious'),`${route||'home'}: ${results.violations.map(item=>item.id).join(', ')}`).toEqual([]);
  }
});

test('local OCR recognizes the supplied image in a browser worker',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/#/lab');
 await page.getByRole('button',{name:/Try real local OCR/}).click();
 await page.getByRole('button',{name:'Try demo image'}).click();
 await page.getByRole('button',{name:'Read text locally'}).click();
 await expect(page.locator('.ocr-result, .local-ai [role="alert"]')).toBeVisible({timeout:100000});
 await expect(page.locator('.local-ai [role="alert"]')).toHaveCount(0);
 await expect(page.locator('.ocr-text')).toContainText(/RIVERSIDE LIBRARY/i);
});
