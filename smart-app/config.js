// Public, safe defaults. This file is committed.
// Override locally with `config.local.js` (gitignored).
//
// Note: This repo intentionally does NOT ship any private sandbox URLs.

(function () {
  window.INFOGLEAM_CONFIG = Object.assign(
    {
      // SMART on FHIR (OAuth) settings
      smartClientId: "my_web_app",
      // If you need user context (openid/fhirUser), set includeUserContext=true in config.local.js
      includeUserContext: false,

      // Optional: provide a full scope string to override the default scope builder.
      // smartScopes: "launch/patient patient/*.read",

      // Standalone mode (no SMART) default server
      standaloneServerUrl: "https://hapi.fhir.org/baseR4",

      // Optional: used only for docs/help text
      recommendedLauncherUrl: "https://launch.smarthealthit.org/"
    },
    window.INFOGLEAM_CONFIG || {}
  );
})();
