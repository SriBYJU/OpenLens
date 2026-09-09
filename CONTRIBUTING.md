# Contributing

OpenLens welcomes focused changes to device evidence, adapters, simulation, accessibility, testing, and documentation.

1. Create a branch from `main` and keep the change scoped.
2. For device data, cite the original source and label the claim type and confidence.
3. For adapters, follow `DEVICE-ADAPTERS.md` and do not claim verification without a hardware record.
4. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
5. Describe the user-visible behavior, evidence, validation, and known limits in the pull request.

Generated artifacts, dependencies, and research claims must be legally redistributable and compatible with the zero-cost baseline. Never commit credentials, personal camera/audio inputs, or proprietary SDK files.

