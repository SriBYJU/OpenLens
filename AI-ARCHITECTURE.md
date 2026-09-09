# AI architecture

The free baseline contains one real AI path: English OCR with Tesseract.js in a Web Worker. Images stay in the browser, model assets are served from the same deployment, and terminating the controller worker also cancels recognition.

Uploads are limited to image MIME types and 20 MB. Camera access requires a secure context and an explicit browser permission. Frames are transient unless a user explicitly downloads an artifact. OpenLens does not send camera or microphone content to a server.

The Experience Compiler is rules-based and labels itself that way. The Digital Twin uses deterministic fixtures; it does not claim generative model inference or physical-device performance.

Future providers should implement explicit adapters with provider identity, model version, cost mode, privacy route, timeout, and error metadata. Local execution remains the default. Cloud processing must be opt-in and must degrade to a useful local path.

