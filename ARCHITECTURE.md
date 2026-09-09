# OpenLens architecture

OpenLens 0.2 is a static, local-first React application. GitHub Pages serves the compiled files; the browser owns all current execution and persistence.

## Runtime flow

1. The Experience Compiler converts supported plain language into a versioned `ExperienceDefinition`.
2. The capability compiler combines that definition with a sourced `DeviceProfile` and creates a `CompiledPlan`.
3. Only a registered `DeviceAdapter` may execute a plan. OpenLens ships the deterministic reference Optical Twin and seven capability-model adapters. These model documented capability presence and companion fallback, not vendor SDK behavior or physical-device performance.
4. Each simulation produces a `RunResult` with device and adapter snapshots, seed, configuration, output, and canonical trace spans.
5. Benchmark Lab repeats the same plan with sequential 32-bit seeds and computes statistics from successful trials while retaining failures.

## Boundaries

- `src/data`: sourced device records; a manufacturer API claim is never treated as an installed adapter.
- `src/core`: framework-independent contracts, compilation, simulation, statistics, and artifact validation.
- `src/adapters`: the executable integration registry.
- `src/ai`: browser-only OCR worker and input checks.
- `src/app`: routing, global workbench state, and local persistence.
- `src/pages` and `src/components`: interaction and presentation.

There is no database, account, cloud AI, or hidden API in this release. Those systems should be added only when persistence or remote execution creates clear value.

