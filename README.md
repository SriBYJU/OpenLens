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

The current foundation is static and works without a build step:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

For the Motion dependency used by the future bundled build:

```bash
npm install
```

## Status
Early production foundation. The cinematic shell is real; device data, Lens Lab execution, Digital Twins and benchmark systems are the next functional layers.
