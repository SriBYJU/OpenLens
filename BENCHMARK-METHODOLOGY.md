# Benchmark methodology

Benchmark Lab measures the deterministic simulator, not physical glasses.

- A suite freezes the compiled plan, simulator configuration, catalog version, engine version, methodology version, and schema version.
- Trial `n` uses `seed + n`, wrapping at the unsigned 32-bit boundary.
- Failed trials remain in the suite and success-rate denominator.
- Latency statistics use successful trials because a failed pipeline may stop before later stages.
- Dispersion is sample standard deviation with `n - 1` in the denominator.
- Exported runs contain enough state for deterministic replay. Imports are rejected when their embedded result does not match replay.

## Family score layers

Benchmark Methodology 1.3 adds an inspectable family view without producing an overall score.

- **AI pipeline:** the raw successful-run median is normalized linearly. A median from 0–250 simulated milliseconds maps to 100; 1,200 milliseconds or more maps to 0. Failures remain outside latency and inside reliability.
- **Camera or microphone:** only the active input family receives the published synthetic environment score derived from illumination, head motion, ambient noise, and route output. This is not an image-quality or acoustic hardware measurement.
- **Connectivity:** completed runs divided by all trials, including injected and stochastic failures.
- **Battery:** shows starting charge and the simulator's 5% safety threshold without inventing endurance.
- **Developer experience and usability:** remain unscored until a structured sourced review or wearer-study protocol is attached.

The interface exposes raw observation → normalization → category result for every family. Missing evidence produces `NOT SCORED`, never a guessed value.

Browser timing and device timing are deliberately excluded from simulator values. A later hardware methodology must separately record device, firmware, temperature, network, sample count, warm-up, and raw observations.
