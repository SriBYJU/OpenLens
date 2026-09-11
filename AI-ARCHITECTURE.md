# OpenLens AI architecture

OpenLens has one real browser pipeline and one separate deterministic simulation pipeline. They share user-facing concepts, but their results and timing never mix.

## Real local pipeline

1. **Acquire:** the user chooses the generated demo, uploads a bounded PNG/JPEG/WebP, or explicitly starts and captures the browser camera.
2. **Validate:** encoded type, file size, decoded dimensions, side length, and total pixels are checked before OCR.
3. **Preflight:** a bounded canvas sample measures actual luminance, tonal contrast, strong-edge density, and a versioned OCR-readiness heuristic. These are pixel statistics, not semantic scene understanding.
4. **Perceive:** a same-origin Web Worker runs Tesseract.js with the bundled English model and returns text, engine confidence, and inference duration.
5. **Transform (optional):** `openlens-sign-phrasebook-v1` maps recognized navigation, safety, transit, and access phrases across English, Spanish, French, German, and Italian. It reports word coverage and preserves every unmatched segment unchanged.
6. **Output:** the visitor may copy the text, export the complete result as JSON, or use a matching browser-local speech voice when one exists.

Images and results remain in page memory. Camera tracks stop after capture, when the page is hidden, when the browser ends the track, or when the tool unmounts. No request sends image content to an OpenLens server because the baseline application has no application server.

## Simulation pipeline

Lens Lab uses authored fixtures and deterministic rules to exercise capability routing, environment stress, fallback logic, latency, and failures. Its translation fixtures cover only the named fixture text. These outputs are `SIMULATED`; they are not OCR inference, a general translation model, or measurements of a physical device.

## Provider boundary

The live AI Router evaluates task, privacy, latency priority, cost policy, and browser capability. It selects the current local OCR, bounded translation, or matching local-voice path when available; it visibly refuses semantic vision and local-only captioning when no defensible runtime exists. No external AI provider is configured. There is no hidden cloud fallback, API key, quota, account, or billing dependency. A future provider adapter must declare its identity, network behavior, data retention, capabilities, costs, and failure mode, and it must remain optional. Provider results must remain distinguishable from local and simulated results in artifacts and the interface.

## Current limits

- OCR recognizes English text and may be wrong; confidence is an engine signal rather than proof.
- The sign phrasebook is curated deterministic lookup. It cannot translate arbitrary sentences or infer meaning.
- Browser speech depends on installed local voices and varies by operating system.
- Scene understanding, executed speech recognition, general translation, local model installation, and provider execution are not implemented. The router exposes these boundaries instead of manufacturing a result.

These boundaries are intentional: unsupported input produces a visible limitation instead of a fabricated AI result.
