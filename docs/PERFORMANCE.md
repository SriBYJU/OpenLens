# Production performance budget

OpenLens checks the built GitHub Pages artifact on every deployment. The check fails when the initial document and its direct imports, total application JavaScript, CSS, largest lazy route, or glasses hero exceed their declared ceilings.

The local OCR engine is intentionally separate. Its English model and WebAssembly variants make the deployed artifact large, but they are not referenced by the initial HTML and load only after a visitor opens the OCR drawer. The budget fails if an OCR worker, OCR engine path, or the Local AI route becomes an initial import.

Run the same release check locally:

```sh
npm run build
npm run budget
```

Current ceilings are recorded in `scripts/check-performance-budget.mjs`. They are regression limits based on the current production architecture, not claims about field Core Web Vitals. Browser responsiveness and cinematic frame pacing still require runtime profiling on representative hardware.

For a repeatable local stress profile, start the production preview on port 4176 and run `npm run profile:cinematic`. The script uses a 4× CPU slowdown and a 1.6 Mbps, 150 ms round-trip network model. It reports navigation timing, lab-observed LCP and CLS, and frame intervals while traversing the full lens sequence. These are development diagnostics from the current machine, not field measurements.

The 2026-09-10 local release profile reported 0 cumulative layout shift after reserving the full route-loading viewport, a 16.7 ms median and 16.8 ms p95 across 120 cinematic frames, and no frame interval above 50 ms. The throttled LCP was 5.64 seconds because the detailed 809 KiB glasses image remains the largest visual asset. That value is a local stress result, not a field percentile; reducing the hero transfer while preserving its detail remains an optimization target.
