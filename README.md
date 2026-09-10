# OpenLens

**The open development, simulation, AI, research, and benchmarking layer for smart glasses.**

[Open the live workbench](https://sribyju.github.io/OpenLens/) · [Read the architecture](ARCHITECTURE.md) · [Build an adapter](DEVICE-ADAPTERS.md) · [Review methodology](BENCHMARK-METHODOLOGY.md)

OpenLens turns fragmented smart-glasses hardware into an inspectable development environment. A visitor can describe an experience, compile it into an explicit capability plan, run it against a deterministic Optical Twin, inject failures, inspect every trace boundary, benchmark repeated trials, and compare the requirements with sourced hardware profiles. The public baseline needs no account, device, API key, paid AI, or backend.

## What works

- **Cinematic optical entry:** a dark, physical-feeling smart-glasses opening moves through the lens into the platform, with responsive and reduced-motion behavior.
- **Live homepage proof:** the real compiler + deterministic Optical Twin can run directly from the homepage, including explicit permission, disconnect, and timeout failure injection.
- **Lens Lab:** normal, denied-permission, degraded-network, critical-battery, network-loss, timeout, disconnect, and model-unavailable scenarios produce different results and replayable traces.
- **Experience Compiler:** supported plain language updates a structured input/process/output contract live, evaluates execution across the device catalog, and persists executable plans into Lens Lab.
- **Device Fit Engine:** choose required/preferred capabilities, developer-access rules, companion fallback policy, and whether the target must execute in OpenLens today. Results explain blockers and caveats instead of inventing compatibility percentages.
- **Device Doctor:** inspects a profile subsystem by subsystem while keeping physical hardware, manufacturer API access, and actual OpenLens execution visibly separate.
- **Device Universe:** eight sourced profiles—OpenLens Twin, Brilliant Frame, XREAL Air 2, Ray-Ban Meta, Snap Spectacles, Even Realities G1, Rokid Glasses, and Vuzix Z100—with typed physical specifications, explicit unknowns, source conflicts, search, and three-device comparison.
- **Benchmark Lab:** deterministic trial suites, visible failures, sample statistics, raw-run selection, JSON/CSV export, and replay verification.
- **Local AI:** real English OCR runs in a same-origin Web Worker without uploading the image, then an optional deterministic sign phrasebook translates recognized text across five languages with exact coverage, unchanged-token disclosure, pipeline timing, speech, and JSON export.
- **Command Palette:** `Ctrl/Cmd + K` searches tools, device evidence, experiences, and current workbench state; experience actions load directly into Lens Lab.
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

Playwright browser binaries are required for the end-to-end suite. CI installs Chromium before running it. Pull requests run the same verification gate before merge; production deployment remains restricted to `main`. Targeted visual QA also checks tablet, ultrawide, and reduced-motion states and retains screenshots as short-lived CI artifacts.

## Architecture and trust

The app is a static React/TypeScript deployment. Core contracts, compiler, simulator, benchmark engine, Device Fit rules, and artifact exchange are framework-independent. Browser local storage keeps the current experience and target. There is no application database, account, analytics service, or hidden cloud AI route.

Device evidence keeps physical capability, manufacturer API access, and OpenLens integration as separate claims. Simulation values are labeled simulated; missing hardware facts remain unknown. See [AI Architecture](AI-ARCHITECTURE.md), [Research Methodology](RESEARCH-METHODOLOGY.md), [Privacy](PRIVACY.md), [Security](SECURITY.md), [Flagship Interaction Pass](docs/FLAGSHIP-INTERACTION-PASS.md), and [Zero-Cost Architecture](ZERO-COST-ARCHITECTURE.md).

## Deployment

`main` is production. Pull requests run lint, unit tests, browser/accessibility tests, and the production build without deployment. Every verified push to `main` repeats the gate, stamps `dist/release.json` with the exact commit, and publishes the compiled build to GitHub Pages.

## Contributing

Evidence corrections and adapter work are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. Hardware supplied for development must be disclosed and never changes benchmark methodology or conclusions.
