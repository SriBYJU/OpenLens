# Privacy

OpenLens 0.3 has no account, analytics, advertising, database, or application server. Experience drafts are stored in browser local storage. Simulations run locally. OCR images and camera frames remain in the browser and are not uploaded by OpenLens.

Camera use is initiated by the user and uses the browser permission prompt. Stopping or closing the local AI panel releases active media tracks. Uploaded images are validated before recognition and are not persisted by the application.

Export buttons create local files containing the visible plan, configuration, device snapshot, trace, and simulated result. Review these artifacts before sharing them because a custom experience prompt may contain text you entered.

The Browser Field Recorder starts only after an explicit button press. It keeps aggregate page loading, layout shift, event timing, long-task, and user-invoked response-probe values in memory until clear, refresh, or navigation removes the component. It sends no network request, sets no cookie, uses no account or persistent identifier, omits the user-agent string, and exports only when the visitor requests a local JSON file. These values describe the browser page, not smart-glasses hardware.
