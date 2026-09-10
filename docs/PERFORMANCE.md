# Production performance budget

OpenLens checks the built GitHub Pages artifact on every deployment. The check fails when the initial document and its direct imports, total application JavaScript, initial CSS, total application CSS, largest lazy route, glasses hero, or virtual park scene exceed their declared ceilings. Route-specific styles remain separate from the first-load stylesheet.

The local OCR engine is intentionally separate. Its English model and WebAssembly variants make the deployed artifact large, but they are not referenced by the initial HTML and load only after a visitor opens the OCR drawer. The budget fails if an OCR worker, OCR engine path, or the Local AI route becomes an initial import.

Run the same release check locally:

```sh
npm run build
npm run budget
```

Current ceilings are recorded in `scripts/check-performance-budget.mjs`. They are regression limits based on the current production architecture, not claims about field Core Web Vitals. Browser responsiveness and cinematic frame pacing still require runtime profiling on representative hardware.

The ImageGen park source is preserved outside the repository. Its production JPEG is 595 KiB, down from the 2.98 MiB generated PNG, and loads only with the lazy Lens Lab route. CI holds that scene below 700 KiB. The dedicated 1200×630 social card is 102 KiB and has its own 150 KiB release ceiling.

For a repeatable local stress profile, start the production preview on port 4176 and run `npm run profile:cinematic`. The script uses a 4× CPU slowdown and a 1.6 Mbps, 150 ms round-trip network model. It reports navigation timing, lab-observed LCP and CLS, and frame intervals while traversing the full lens sequence. These are development diagnostics from the current machine, not field measurements.

The initial 2026-09-10 local release profile reported a 5.64 second throttled LCP with the 809 KiB hero. After serving the visually inspected 110 KiB transparent WebP, the same profile reported 2.33 seconds. The optimized run retained 0 cumulative layout shift, a 16.7 ms median and 16.8 ms p95 across 120 cinematic frames, and no interval above 50 ms. The original PNG remains a compatibility fallback. These are local stress diagnostics, not field percentiles.
