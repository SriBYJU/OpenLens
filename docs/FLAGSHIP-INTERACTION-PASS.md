# Flagship interaction pass

This pass continues the existing OpenLens platform rather than replacing Astra's simulation, evidence, compiler, benchmark, OCR, or adapter work.

## Product intent

The first two minutes should now move through three layers:

1. **Cinematic optics** — the glasses remain the visual anchor and the camera enters the lens.
2. **Live proof** — the homepage runs the real deterministic OpenLens compiler/simulator rather than a decorative demo.
3. **Decision tools** — Device Fit and Device Doctor turn the research catalog into an explainable hardware-selection workflow.

## Integrity boundaries

- Device Fit never emits an arbitrary percentage.
- Physical capability does not imply developer access.
- Manufacturer API access does not imply an OpenLens adapter exists.
- Research devices remain non-executable until an adapter is implemented and verified.
- Optical Twin latency remains simulated and is labeled accordingly.
- Command palette actions reuse existing workbench state instead of inventing a second state model.

## New surfaces

- `src/core/fit.ts` — deterministic, explainable device-fit rules.
- `src/components/DeviceFitEngine.tsx` — capability requirement builder and ranked explanations.
- `src/components/DeviceDoctor.tsx` — subsystem-level hardware/API/OpenLens diagnosis.
- `src/components/HomeSignalDemo.tsx` — homepage access to the existing compiler and deterministic simulator.
- `src/components/CommandPalette.tsx` — keyboard-first navigation across tools, devices, experiences, and recent workbench state.
- `src/flagship.css` — final optical interaction layer loaded after the established design system.

The original source-of-truth systems remain in `src/core`, `src/data`, and `src/app`.
