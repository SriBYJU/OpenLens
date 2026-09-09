# OpenLens — Continue

## Current branch target
`sol/cinematic-glasses-foundation` is the first real UI implementation created from an almost-empty repository.

## What exists now
- Cinematic dark smart-glasses hero built as editable SVG.
- Ambient reflection/highlight system.
- Pointer parallax on desktop.
- Scroll-driven camera move into the **right lens**.
- Optical transition atmosphere and reticle.
- First perception-layer narrative after entering the lens.
- Systems rail for Lens Lab, Digital Twins, Trace Viewer and Benchmarks.
- Visual Lens Lab preview.
- Dedicated mobile CSS.
- Reduced-motion fallback.
- Motion 13.2.0 progressive enhancement for in-view reveals.

## Important design decision
Do **not** replace the glasses with a generic PNG. The procedural lens/frame layers are the bridge to future WebGL/3D. If moving to Three.js/R3F, preserve the current composition, right-lens camera target and scroll narrative.

## Immediate next tasks for Astra
1. Run visual QA at desktop, phone and tablet sizes.
2. Replace CDN Motion import with the installed/bundled Motion package when the final build tool is established.
3. Convert the SVG glasses into a higher-fidelity WebGL/R3F model only if the result is materially better and stays performant.
4. Add real route/page architecture without breaking the cinematic home sequence.
5. Build the real Device Universe data model.
6. Build the first functional Lens Lab Digital Twin flow.
7. Add performance instrumentation and a lightweight fallback for low-power devices.
8. Keep `design-system.md` and this file current.

## Visual direction
Dark graphite hardware on a near-black optical environment. Highlights should look like reflected light on physical materials, not neon cyberpunk. The opening should feel enormous and cinematic: scroll physically approaches the glasses and passes through a lens.

## Non-negotiables
- Honest labels: SIMULATED / UNTESTED / MANUFACTURER CLAIM / OPENLENS MEASURED.
- No fake device connection or benchmark data.
- No generic SaaS card-wall redesign.
- Preserve accessibility and reduced-motion behavior.
