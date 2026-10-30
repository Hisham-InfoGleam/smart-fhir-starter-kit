// Public, safe defaults. This file is committed.
// Override any setting in `config.local.js` (gitignored).
//
// Note: This repo intentionally does NOT ship any private sandbox URLs.

(function () {
  window.INFOGLEAM_CONFIG = Object.assign(
    {
      // SMART on FHIR (OAuth) settings. "my_web_app" works with the public SMART launcher.
      smartClientId: "my_web_app",

      // Ask for openid + fhirUser (who the signed-in user is).
      // Set to false in config.local.js if your sandbox shows a login page
      // because its data has no Practitioner (user) records.
      includeUserContext: true,

      // Optional: a full scope string. It replaces the scopes built in launch.html.
      // Example for a SMART v2 server: "launch openid fhirUser patient/*.rs"
      // smartScopes: "",

      // Standalone mode (no SMART) default server
      standaloneServerUrl: "https://hapi.fhir.org/baseR4",

      // Shown in the launch.html help text when the page is opened without `iss`
      recommendedLauncherUrl: "https://launch.smarthealthit.org/"
    },
    window.INFOGLEAM_CONFIG || {}
  );
})();
