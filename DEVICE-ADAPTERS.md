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

The Build With Us page generates a four-file ZIP with a typed transport boundary, guarded adapter lifecycle, Vitest contract test, verification record and integration guide. The bundle is executable scaffolding, while transport-specific vendor calls and physical verification still require the target hardware and SDK.
