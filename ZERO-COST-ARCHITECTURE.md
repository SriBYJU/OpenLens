# Zero-cost architecture

Verified against official documentation on **2026-09-08**. This is the cost model for the current public, browser-first application, not a claim that every system in the master directive is implemented or that unlimited operation is free.

## Baseline decision

Build a static React/TypeScript application, publish its generated files through GitHub Pages, and run simulation, compatibility checks, browser measurements, and OCR on the visitor's device. Public research data ships with the application. No paid inference, database, login provider, analytics service, or backend is required for this baseline. Development tools and test runners execute locally or on standard public-repository GitHub Actions runners.

Existing hardware, connectivity, electricity, and any subscription used to author code are not supplied by OpenLens. The application itself requires no API key or purchase. Use the supplied `github.io` project URL; purchasing a custom domain is optional.

## Service inventory

| Service/component | Purpose and current free provision | Limits and expected early use | Exhaustion/failure fallback | Lock-in and migration |
| --- | --- | --- | --- | --- |
| GitHub public repository | Source, reviews, issues, versioned research and release history | Keep source small; exclude local tool installations, dependency directories, test recordings and generated bundles from source control | Complete checkout remains usable locally | Low: ordinary Git; mirror to another Git host |
| GitHub Pages | Static public project hosting available with GitHub Free | Published site at most 1 GB; soft 100 GB/month bandwidth; deployment timeout 10 minutes. Soft 10 builds/hour does not apply to a custom Actions publishing workflow | Quota pressure can result in throttling or hosting intervention, not guaranteed continued service. Reduce transfers, retain a locally runnable release, or migrate static files | Low: static output; adjust Vite base path on another static host |
| GitHub Actions, standard hosted runner | Public-repository and Pages standard runner minutes are free | Use standard `ubuntu-latest`, bounded jobs and short artifact retention. GitHub Free includes 500 MB artifact storage shared with Packages and 10 GB cache per repository; account-wide use matters | Run build/tests locally; delete expired generated artifacts through normal retention. Do not select larger paid runners or enable paid overages | Low: scripts run outside Actions; replace workflow orchestration |
| Browser computation | Simulation, capability decisions, local benchmarks | CPU/memory/battery and browser support replace server quotas; measurements vary by device | Lower workload, lighter visual mode, understandable unavailable/error states | Low: JavaScript and browser APIs |
| Tesseract.js and local OCR assets | Open-source OCR without metered inference | Worker, WASM and language assets are configured to load from the application's own asset base. First load transfers these assets; local inference consumes visitor resources | Loading/inference failure must be explicit; other public tools remain usable. No silent paid/cloud inference substitution | Low: replace the OCR engine behind its worker interface |
| OpenLens sign phrasebook | Bounded deterministic translation of common signs in five languages | Ships as application code; has no request quota. Coverage is intentionally limited to curated phrases | Preserve unmatched words, report coverage, and never silently route to a paid translator | Low: replace behind the typed phrasebook result or add opt-in providers |
| Browser persistence | Local saved state, where implemented | Browser-specific storage limits; private mode, denied storage or clearing site data can remove state | Continue in memory; offer export for user data that matters | Low: ordinary JSON/state schema; add a storage adapter later |

Pages is suitable for a public open-source research/developer demonstration. Its rules prohibit using it to run an online business or a site primarily delivering commercial SaaS, and it is unsuitable for sensitive transactions. Reassess hosting before introducing those uses. Limits above come from [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). Actions allowances, paid larger-runner exceptions, and shared storage rules come from [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Capacity assumptions, not measured demand

An initial planning envelope is 1,000 fresh visits/month, a 2 MB normal application transfer, and 20 MB of optional OCR assets for 20% of visits: roughly 6 GB/month before repeat downloads and protocol overhead. At 10,000 such visits, the estimate is roughly 60 GB. These are budgeting assumptions; measure actual built asset sizes and traffic before relying on them. Browser caching can help but is not a capacity guarantee. If every visitor downloads all optional assets, consumption is higher.

Keep optional engines lazy loaded and avoid shipping videos or multiple language packs in the default route. Retain deployment artifacts for one day and avoid caching large browser binaries or model files in Actions unless the shared-storage budget has been checked. Do not switch on paid billing to fix a failed free-tier build.

## Privacy and service boundaries

Camera/image processing belongs in the browser. Loading code from the host still reveals ordinary HTTP request metadata to that host; local processing does not mean there are no network requests. A local OCR result is not an LLM answer, a simulated latency is not a hardware measurement, and browser feature detection does not prove manufacturer integration.

No cloud account persistence, authentication service, secure admin backend, shared research database, or manufacturer bridge has been provisioned by this architecture decision. Browser state and hidden UI controls are never authorization. If an admin/research service is implemented, it needs server-side authorization, validation, rate limits, abuse handling and a separately verified free-tier budget before release.

## Deferred services and migration gate

Cloudflare and Firebase are candidates, not baseline dependencies. No assumption is made here about their current card requirements or quotas because neither is needed for the static baseline. Before adopting one, record its exact plan, current official limits, account-level billing settings, expected requests/storage, hard-stop behavior, privacy consequences and export path in this file. Keep local-only operation available when a cloud service is down or its quota is exhausted.

The zero-cost release gate is: public repo, standard runner only, generated site under the host limit, retained artifacts within the account allowance, no required secret/API key, no paid inference fallback, and successful local build/run without a cloud account. Release test evidence belongs in the release/verification documents; this cost model alone does not establish deployment success or production readiness.
