import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.clear())});

test('resilience matrix isolates faults and exposes an event-level trace diff',async({page})=>{
 await page.goto('/#/benchmarks');
 await page.getByRole('button',{name:'Run resilience matrix'}).click();
 const matrix=page.locator('.resilience-lab');
 await expect(matrix.locator('.resilience-card')).toHaveCount(8);
 await expect(matrix.locator('.resilience-card').filter({hasText:'Baseline'})).toContainText('success');
 await expect(matrix.locator('.resilience-card').filter({hasText:'Permission denied'})).toContainText('failed');
 await matrix.locator('.resilience-card').filter({hasText:'Processing timeout'}).click();
 await expect(matrix.locator('.trace-diff-meta')).toContainText('CHANGED EVENTS');
 await expect(matrix.locator('.trace-diff-row.changed').first()).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).include('.resilience-lab').analyze();
 expect(results.violations.filter(item=>item.impact==='critical'||item.impact==='serious'),results.violations.map(item=>item.id).join(', ')).toEqual([]);
});
