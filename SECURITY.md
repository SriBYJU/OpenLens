# Security

Report vulnerabilities privately through the repository owner's GitHub security contact rather than a public issue.

The current release is static and has no privileged server operation. Its main boundaries are untrusted imported JSON, local uploads, camera permission, generated downloads, external research links, and same-origin Web Worker assets.

Run artifacts are schema-checked and replay-verified before use. OCR accepts only non-empty PNG, JPEG, or WebP images up to 8 MB and 16 megapixels and resolves executable/model assets from the deployment origin. The opt-in field recorder retains aggregate page values only in memory and never transmits them. External links use `noreferrer` and the document uses a strict-origin referrer policy. A browser-delivered content policy limits scripts, workers, connections, images, media, frames, objects, base URLs, and forms; worker-compatible exceptions are limited to same-origin code and blob workers. No secrets belong in source, build output, or GitHub Pages configuration.

This GitHub Pages deployment does not include repository-controlled response headers. The document policy is defense in depth for this static release and does not replace host-level headers such as `frame-ancestors`, HSTS, COOP, COEP, or CORP when OpenLens moves to a configurable host.

The deployment workflow pins each GitHub-maintained action to the immutable commit behind its documented stable release tag. This avoids executing a later retagged action without repository review.

Before adding accounts or an admin console, require server-side authorization, CSRF protection where cookies are used, rate limits, input validation, audit logging, secure headers, and least-privilege secrets. A visual admin page without those controls must not ship.
