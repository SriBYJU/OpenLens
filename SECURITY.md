# Security

Report vulnerabilities privately through the repository owner's GitHub security contact rather than a public issue.

The current release is static and has no privileged server operation. Its main boundaries are untrusted imported JSON, local uploads, camera permission, generated downloads, external research links, and same-origin Web Worker assets.

Run artifacts are schema-checked and replay-verified before use. OCR accepts only non-empty image blobs up to 20 MB and resolves executable/model assets from the deployment origin. External links use `noreferrer`. No secrets belong in source, build output, or GitHub Pages configuration.

Before adding accounts or an admin console, require server-side authorization, CSRF protection where cookies are used, rate limits, input validation, audit logging, secure headers, and least-privilege secrets. A visual admin page without those controls must not ship.

