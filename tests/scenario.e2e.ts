import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.clear())});

test('scenario capsule seals and reopens the exact verified workbench state',async({page})=>{
 await page.goto('/#/lab');
 await page.getByLabel('Repeatable seed').fill('777');
 await page.getByLabel('Battery %').fill('61');
 await page.locator('.simulation-controls summary').click();
 await page.locator('.simulation-controls').getByLabel('Network').selectOption('degraded');
 await page.getByLabel('Snapshot name').fill('Commute regression · exact replay');
 await page.getByRole('button',{name:'Seal current scenario'}).click();
 const capsule=page.locator('.scenario-capsule');
 await expect(capsule.getByText(/Snapshot sealed/)).toBeVisible();
 const href=await capsule.getByRole('link',{name:'Open verified link'}).getAttribute('href');
 expect(href).toContain('scenario=');
 await page.getByLabel('Repeatable seed').fill('1');
 await page.goto(href!);
 await expect(capsule.getByText(/Shared scenario verified/)).toBeVisible();
 await expect(page.getByLabel('Repeatable seed')).toHaveValue('777');
 await expect(page.getByLabel('Battery %')).toHaveValue('61');
 if(!(await page.locator('.simulation-controls').getAttribute('open')))await page.locator('.simulation-controls summary').click();
 await expect(page.locator('.simulation-controls').getByLabel('Network')).toHaveValue('degraded');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).include('.scenario-capsule').analyze();
 expect(results.violations.filter(item=>item.impact==='critical'||item.impact==='serious'),results.violations.map(item=>item.id).join(', ')).toEqual([]);
});
