# OpenLens

**The open development, simulation, AI, research, and benchmarking layer for smart glasses.**

[Open the live workbench](https://sribyju.github.io/OpenLens/) · [Read the architecture](ARCHITECTURE.md) · [Build an adapter](DEVICE-ADAPTERS.md) · [Review methodology](BENCHMARK-METHODOLOGY.md)

OpenLens lets a visitor describe an experience, compile it into an explicit capability plan, run it against a deterministic Optical Twin, inspect every trace boundary, benchmark repeated trials, and compare the plan with sourced hardware profiles. The public baseline needs no account, device, API key, paid AI, or backend.

## What works

- **Lens Lab:** normal, denied-permission, degraded-network, critical-battery, network-loss, timeout, disconnect, and model-unavailable scenarios produce different results and traces.
- **Experience Compiler:** supported plain language updates a structured input/process/output contract live and persists it into Lens Lab.
- **Device Universe:** eight sourced profiles—OpenLens Twin, Brilliant Frame, XREAL Air 2, Ray-Ban Meta, Snap Spectacles, Even Realities G1, Rokid Glasses, and Vuzix Z100—with search and three-device comparison.
- **Benchmark Lab:** deterministic trial suites, visible failures, sample statistics, raw-run selection, JSON/CSV export, and replay verification.
- **Local AI:** real English OCR runs in a same-origin Web Worker without uploading the image.
- **Build With Us:** configure and download a typed adapter-manifest starter.

The reference Optical Twin and seven capability models execute locally. A model tests documented capability boundaries and explicit companion fallback; it is not a physical-device connection or hardware performance measurement. Manufacturer hardware profiles remain research records.

## Run locally

Use Node.js 24:

```bash
npm ci
npm run dev -- --port 4173
```

The complete release gate is:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Playwright browser binaries are required for the end-to-end suite. CI installs Chromium before running it.

## Architecture and trust

The app is a static React/TypeScript deployment. Core contracts, compiler, simulator, benchmark engine, and artifact exchange are framework-independent. Browser local storage keeps the current experience and target. There is no application database, account, analytics service, or hidden cloud AI route.

Device evidence keeps physical capability, manufacturer API access, and OpenLens integration as separate claims. Simulation values are labeled simulated; missing hardware facts remain unknown. See [Research Methodology](RESEARCH-METHODOLOGY.md), [Privacy](PRIVACY.md), [Security](SECURITY.md), and [Zero-Cost Architecture](ZERO-COST-ARCHITECTURE.md).

## Deployment

`main` is production. Every push runs `.github/workflows/pages.yml`, stamps `dist/release.json` with the exact commit, and publishes the compiled build to GitHub Pages. `feat/openlens-platform` and `sol/cinematic-glasses-foundation` are historical checkpoints and do not control the live site.

## Contributing

Evidence corrections and adapter work are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. Hardware supplied for development must be disclosed and never changes benchmark methodology or conclusions.
