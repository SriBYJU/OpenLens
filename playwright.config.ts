import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'e2e.spec.ts',
  fullyParallel:true,
  retries:1,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:4174',trace:'retain-on-failure'},
  webServer:{command:'npm run dev -- --port 4174',url:'http://127.0.0.1:4174',reuseExistingServer:true,timeout:120000},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],browserName:'chromium',channel:process.env.CI?undefined:'msedge'}},
    {name:'small-phone',use:{...devices['iPhone 13 Mini'],browserName:'chromium',channel:process.env.CI?undefined:'msedge'}},
  ],
});
