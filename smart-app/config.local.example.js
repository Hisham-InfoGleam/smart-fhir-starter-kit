// PRIVATE CONFIG TEMPLATE
//
// Copy this file to `config.local.js` to use your own private SMART sandbox.
// `config.local.js` is intentionally gitignored so you can publish this repo safely.
//
// IMPORTANT: Do not commit your real domains, IPs, usernames, or passwords.

(function () {
  window.INFOGLEAM_CONFIG = Object.assign(window.INFOGLEAM_CONFIG || {}, {
    // Example: point standalone mode to YOUR FHIR base URL
    // standaloneServerUrl: "https://your-fhir.example.com/fhir",

    // Example: if your sandbox requires a different client id
    // smartClientId: "replace_me",

    // Example: enable user context only if your dataset supports it
    // includeUserContext: true,

    // Optional: completely override SMART scopes
    // smartScopes: "launch/patient patient/*.read openid fhirUser"

    // Optional: only used for documentation/help text
    // recommendedLauncherUrl: "https://your-launcher.example.com/"
  });
})();
