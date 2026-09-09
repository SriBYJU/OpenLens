# Benchmark methodology

Benchmark Lab measures the deterministic simulator, not physical glasses.

- A suite freezes the compiled plan, simulator configuration, catalog version, engine version, methodology version, and schema version.
- Trial `n` uses `seed + n`, wrapping at the unsigned 32-bit boundary.
- Failed trials remain in the suite and success-rate denominator.
- Latency statistics use successful trials because a failed pipeline may stop before later stages.
- Dispersion is sample standard deviation with `n - 1` in the denominator.
- Exported runs contain enough state for deterministic replay. Imports are rejected when their embedded result does not match replay.

Browser timing and device timing are deliberately excluded from simulator values. A later hardware methodology must separately record device, firmware, temperature, network, sample count, warm-up, and raw observations.

