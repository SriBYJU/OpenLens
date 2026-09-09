# OpenLens

**The open development, simulation, AI, research and benchmarking layer for smart glasses.**

OpenLens is being built to make a fragmented smart-glasses ecosystem easier to understand, simulate, compare, benchmark and build across.

## Current foundation

The first implementation establishes the visual and interaction language:

- procedural dark smart-glasses hero
- scroll-driven “enter the lens” transition
- optical atmosphere and field-of-view geometry
- responsive/mobile-specific behavior
- reduced-motion fallback
- Motion 13.2.0 progressive enhancement
- first Lens Lab / Digital Twin / Trace / Benchmark narrative

## Run locally

Use Node.js 24 and install the locked dependencies:

```bash
npm ci
npm run dev -- --port 4173
```

Then open `http://localhost:4173`.

Build and verify the production application:

```bash
npm run lint
npm test
npm run build
```

## Status
Public preview: the Optical Twin, experience compiler, device comparison, trace inspection, simulation benchmarks and local OCR are implemented. Physical hardware adapters remain unavailable and research profiles cannot execute.

## Deployment

The public site is https://sribyju.github.io/OpenLens/.

`main` is the production source. Every push to `main` runs `.github/workflows/pages.yml`: install locked dependencies, lint, test, build, and publish `dist` to GitHub Pages. Pages must use **GitHub Actions** as its source. Do not publish the repository root: it contains TypeScript source rather than a browser-ready build.

`feat/openlens-platform` is a development checkpoint branch. `sol/cinematic-glasses-foundation` preserves the earlier foundation. Neither branch controls the live site. A feature-branch push saves work but does not deploy it until the work reaches `main`.

The deployed `release.json` identifies the exact source commit.
