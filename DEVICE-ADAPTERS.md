# Device adapters

A device profile describes researched hardware. An adapter is executable code. OpenLens keeps them separate so a documented manufacturer feature cannot accidentally become a claim of working integration.

## Implement an adapter

1. Add a sourced `DeviceProfile` in `src/data/devices.ts`.
2. Create an `AdapterManifest` with a stable device ID, exposed capabilities, mode, status, and disclosure.
3. Implement `connect`, `disconnect`, and `execute` against the `DeviceAdapter` interface.
4. Return the canonical version-2 `RunResult`; include permission, transport, processing, and output failures in trace spans.
5. Register the adapter in `src/adapters/registry.ts` only after its code exists.
6. Test disconnects, denied permissions, timeouts, unsupported capabilities, and replay behavior.

Use `implemented-untested` while code exists without recorded hardware verification. Use `verified-hardware` only with a reproducible record naming device, firmware, environment, and test procedure. Do not silently route unsupported capabilities through a companion service.

The Build With Us page generates a five-file ZIP with a typed transport boundary, guarded adapter lifecycle, Vitest contract test, runnable SDK reference-twin example, verification record and integration guide. Its browser-side Conformance Lab checks topology, honest status, cross-file identity, declared capabilities, lifecycle, routing guards, test coverage, the working SDK example and the failure-evidence matrix. Deliberate mutation probes prove that false verification, identity drift, and missing failure coverage are rejected. The bundle remains executable scaffolding; transport-specific vendor calls and physical verification still require the target hardware and vendor SDK.

## Source SDK

`src/sdk/index.ts` is the real in-repository SDK surface used by the Developers console and automated tests. `createOpenLens(adapter)` exposes:

- `openlens.device` for guarded connection, disconnection and plan execution;
- `openlens.ai` for the shared, evidence-bounded AI capability router;
- `openlens.camera`, `openlens.audio`, `openlens.display` and `openlens.sensors` for manifest-derived capability gates;
- `openlens.benchmark` for asynchronous adapter trials that retain successful, failed and rejected outcomes.

`src/examples/openlens-sdk-example.ts` runs without a network, account or hardware by connecting the SDK to the deterministic Optical Twin. It is compiled and exercised in the release suite. The SDK is currently source-only and has not been published to a package registry.
