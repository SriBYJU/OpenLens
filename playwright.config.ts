import {defineConfig,devices} from '@playwright/test';
const testPort=process.env.OPENLENS_TEST_PORT??'4174';

export default defineConfig({
  testDir:'./tests',
  testMatch:['e2e.spec.ts','resilience.e2e.ts','scenario.e2e.ts'],
  fullyParallel:true,
  workers:process.env.CI?1:4,
  retries:1,
  reporter:'line',
  use:{baseURL:`http://127.0.0.1:${testPort}`,trace:'retain-on-failure'},
  webServer:{command:`npm run dev -- --port ${testPort}`,url:`http://127.0.0.1:${testPort}`,reuseExistingServer:true,timeout:120000},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],browserName:'chromium',channel:process.env.CI?undefined:'msedge'}},
    {name:'small-phone',use:{...devices['iPhone 13 Mini'],browserName:'chromium',channel:process.env.CI?undefined:'msedge'}},
  ],
});
