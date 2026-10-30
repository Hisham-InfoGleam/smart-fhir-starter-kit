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

    // Example: turn off openid + fhirUser if your sandbox has no user records
    // includeUserContext: false,

    // Optional: completely override SMART scopes (SMART v2 syntax shown)
    // smartScopes: "launch openid fhirUser patient/*.rs"

    // Optional: only used for the launch.html help text
    // recommendedLauncherUrl: "https://your-launcher.example.com/"
  });
})();
