# Tooling audit

Audit updated: **2026-09-09**. Status distinguishes a downloaded source, a working local command, and a tool connected to the running Codex client. These are not interchangeable.

## Inventory and evidence

| Required tool | Verified identity/version | Observed status and evidence |
| --- | --- | --- |
| ECC | [affaan-m/ECC](https://github.com/affaan-m/ECC), package 2.2.1, checkout `5064474d4d762dc9640234a41617cccb79185cec` | Official source in the session's `work/tools/ECC`; engineering guidance is being used by the implementation/review work. This is not proof of native plugin installation. Record actual review outcomes with the application verification evidence. |
| UI/UX Pro Max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), CLI package 2.5.0, checkout `4aad0584d92131626b16d4ff4d77f0455385013c` | Official source available in `work/tools/ui-ux-pro-max`; design guidance/search is being used in the design work. Final decisions belong in `design-system.md`. Native plugin installation was not verified. |
| Motion | [Motion for React](https://motion.dev/docs/react), application dependency 13.2.0 at audit time | Free `motion` package selected, no Motion+ dependency. Application lockfile and browser tests establish the final installed version/behavior. |
| Serena | [oraios/serena](https://github.com/oraios/serena), version 1.7.0 | Project-local runtime is installed in `work/tools/serena-runtime`. `serena project index` successfully indexed 41 TypeScript files in the current checkout on 2026-09-09. The runtime is actively usable from the shell; it is not exposed as a native callable MCP tool in this Codex task. |
| Atlas | [fkenmar/atlas](https://github.com/fkenmar/atlas), version 0.2.1-alpha | Project-local Windows binary is installed in `work/tools/atlas`. It regenerated `atlas-map.md` from the current checkout on 2026-09-11 with a 3,600-token public-surface budget. This is an alpha release because the upstream project has no stable compatible release; its map is navigation help and source remains authoritative. |
| Capsule | [hakiyaka/capsule](https://github.com/hakiyaka/capsule), tagged 1.0.7, commit `07c31699c98082dfc22a6d18ae7d754ca35cc713` | Source installed only in `work/tools/capsule`. Six storage/portable-state tests passed. Direct stdio MCP `doctor` returned `ok: true`; actual hook activity/interception was false. A local survey/load/expand smoke test recovered all 15,217 characters of its README exactly, using a 1,202-character summary. This is a measured fixture, not a billing claim. Native client plugin is not connected. |
| RTK | [rtk-ai/rtk](https://github.com/rtk-ai/rtk), latest official release v0.48.0 | Project-local Windows binary reports `rtk 0.48.0`; `gain` works with local database override and `rtk test` successfully wrapped the six Capsule tests. No global hook installed. Release ZIP SHA-256 verified against GitHub's asset digest: `8c9ae56bacde865112777a9fe9791b449186d8b2a081c32c0772ef773f284f93`. |
| Token Saviour | [vagkaratzas/token-saviour](https://github.com/vagkaratzas/token-saviour), release 1.0.0, commit `8fe77b754c0a5e67eaf5ba5f374db95238d65b22` | Official skill read from `work/tools/token-saviour/skills/token-saviour/SKILL.md`. Applied as guidance: targeted searches, direct RTK for noisy output, transparent plain-tool fallback, retain exact evidence. No savings percentage claimed and no native plugin installed. |

The active callable-tool registry contains none of Serena, Atlas, Capsule or RTK. Local CLI/library invocation described above is explicit tool use outside that registry. Serena and Atlas are now installed and tested as local project tools; this does not imply a native Codex connector.

## Current official setup routes

- ECC's current README supports `codex plugin marketplace add affaan-m/ECC` followed by `codex plugin add ecc@ecc`. It explicitly warns against layering Codex sync and marketplace installations. Current source usage here does not imply those commands ran.
- UI/UX Pro Max now publishes **`ui-ux-pro-max-cli`**, which provides `uipro`; its README labels older `uipro-cli` releases stale. Project initialization is `uipro init --ai codex` or the universal `.agents/skills` route. Use a single installation route and inspect a dry run before changing an existing setup.
- Serena's README now prescribes `uv tool install -p 3.13 serena-agent`, then `serena init`. Its [current Codex integration guide](https://oraios.github.io/serena/02-usage/030_clients.html#codex-cli-and-app) uses `serena setup codex`, or a `serena start-mcp-server --project-from-cwd --context=codex` entry. Confirm connection and activate the actual OpenLens checkout before claiming semantic navigation. Missing runtime/client connection is the present blocker.
- Atlas's README documents Windows release ZIPs and `atlas . -o atlas-map.md`, but marks the project alpha. A stable-version requirement cannot currently be fulfilled by this candidate. A map is a navigation index; source code remains authoritative.
- Capsule is clone/release based and its package is private; do not install the unrelated npm package named `capsule`. Its README calls for adding the repo as a local Codex plugin, explicitly trusting hooks, restarting, then checking `doctor`. None of the global hook install scripts were run in this audit. Explicit local calls remain usable.
- RTK's Codex integration in its current support matrix is instruction based (`AGENTS.md` plus `RTK.md`). Do not claim automatic interception merely because its executable runs. Direct calls are sufficient for this session.
- Token Saviour can be read as a skill without a native installation. Its benchmark results are workload-specific and do not establish OpenLens token savings. Its guidance never overrides reasoning, security, sufficient context or verification.

## Reproduce the local smoke checks

From the **session directory containing `work/OpenLens` and `work/tools`**, in PowerShell:

```powershell
$env:RTK_DB_PATH = Join-Path $PWD 'work/tools/rtk/history.db'
$env:RTK_TEE_DIR = Join-Path $PWD 'work/tools/rtk/tee'
$env:CLAUDE_CONFIG_DIR = Join-Path $PWD 'work/tools/rtk/claude-context'
$env:CAPSULE_STATE = Join-Path $PWD 'work/tools/capsule-state'
& work/tools/rtk/rtk.exe --version
& work/tools/rtk/rtk.exe gain
& work/tools/rtk/rtk.exe test node --test work/tools/capsule/tests/storage.test.cjs work/tools/capsule/tests/portable-state.test.cjs
node work/tools/capsule-smoke.cjs
```

The environment overrides are process-local and put runtime state under `work/tools`; they do not change the user's home/configuration. Without the overrides RTK's tracking database is inaccessible to the sandbox, and its test wrapper needs a resolvable Claude config directory even when called from Codex. The wrapper reported zero test failures; its generic output summary omitted the pass total, so the six-case count was also checked against the two test files.

Capsule's doctor emitted a Node `DEP0190` shell-argument warning during runtime probing. The executed inputs were fixed audit commands. Avoid passing untrusted strings to a generic command wrapper; use structured arguments for application code. Full Capsule test-suite/native-hook verification has not been performed. These development utilities are not bundled into the OpenLens website.
