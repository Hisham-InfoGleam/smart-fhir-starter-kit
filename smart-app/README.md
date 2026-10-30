# SMART on FHIR Web App

A static browser app. It shows:

- the SMART on FHIR launch (EHR launch and standalone launch) with fhirclient.js
- FHIR R4 reads for the patient in context
- a simple patient dashboard

It has no build step and no server code. fhirclient.js 2.6.3 (the last 2.x
release) loads from the jsDelivr CDN with a Subresource Integrity (SRI) hash,
so the browser refuses the file if it changes.

## Run it

```bash
cd smart-app
python -m http.server 8000
```

Or: `npx http-server smart-app -p 8000 -c-1`

The app is then at http://localhost:8000

## Use it

### EHR launch

1. Open https://launch.smarthealthit.org/
2. Launch Type: **Provider EHR Launch**. FHIR version: **R4**.
3. App's Launch URL: `http://localhost:8000/launch.html`
4. Click **Launch**. Pick a patient (and a provider) if the launcher asks.

### Standalone launch (SMART, no EHR)

1. Open https://launch.smarthealthit.org/
2. Launch Type: **Patient Standalone Launch**. Copy the **Server's FHIR Base URL**.
3. Open `http://localhost:8000/launch.html?iss=<the URL you copied>`
4. Pick a patient and log in on the launcher's demo pages (any password works),
   or tick **Skip login screen** on the launcher first.

### Standalone mode (no SMART)

1. Open http://localhost:8000/index.html directly.
2. Click **Connect** (HAPI R4 by default) and pick a patient.

This mode reads an open FHIR server without any login. It is useful when the
SMART launcher is down.

## Settings

`config.js` holds the defaults. To change them, copy
`config.local.example.js` to `config.local.js` (gitignored) and edit it.

| Setting | Default | What it does |
|---|---|---|
| `smartClientId` | `my_web_app` | OAuth client ID sent to the authorization server |
| `includeUserContext` | `true` | Adds `openid fhirUser` to the scopes. Set `false` if your sandbox has no user (Practitioner) records. |
| `smartScopes` | not set | A full scope string that replaces the built scopes, for example SMART v2: `launch openid fhirUser patient/*.rs` |
| `standaloneServerUrl` | `https://hapi.fhir.org/baseR4` | Server for standalone mode |
| `recommendedLauncherUrl` | `https://launch.smarthealthit.org/` | Shown in the help text when `launch.html` has no `iss` |

Scopes that `launch.html` builds when `smartScopes` is not set:

| Launch | Scopes |
|---|---|
| EHR launch (`iss` and `launch` in the URL) | `launch openid fhirUser patient/*.read` |
| Standalone launch (only `iss`) | `launch/patient openid fhirUser patient/*.read` |

See the main [README](../README.md) for what each scope means.

## Files

| File | What it is |
|---|---|
| `launch.html` | SMART launch page. Builds the scopes and calls `FHIR.oauth2.authorize()`. |
| `index.html` | Dashboard. Calls `FHIR.oauth2.ready()` after a launch, or runs standalone mode. |
| `config.js` | Default settings (committed) |
| `config.local.example.js` | Template for `config.local.js` |
| `config.local.js` | Your local settings (gitignored, optional) |

## What the dashboard shows

- **Patient**: name, birth date, gender, ID
- **Encounters**: the 5 most recent
- **Active medications**: MedicationRequest with status `active`. The name
  comes from `medicationCodeableConcept` or `medicationReference.display`.
- **Observations**: the 10 most recent. Panels such as blood pressure show
  their component values (systolic, diastolic).

Each card loads on its own. If one request fails, that card turns red and
shows the error. The other cards still load.

All server data is written with `textContent` or new DOM elements, never with
`innerHTML`. Text from a FHIR server cannot inject HTML or script into the page.

## Troubleshooting

**"No SMART launch found" on index.html**
- This is normal when you open the page directly. Use standalone mode, or
  start from a SMART launcher.

**"No FHIR server given" on launch.html**
- The page was opened without `?iss=`. Start from a SMART launcher.

**"SMART launch failed"**
- The authorization did not finish, or the session expired. Launch again.
- Open the browser DevTools (F12) and check the Console for details.

**Login page or "No Providers Found" in the launcher**
- The app asks for `openid fhirUser`, so the launcher wants a user. Pick a
  provider, or set `includeUserContext: false` in `config.local.js`.

**CORS errors**
- The FHIR server must allow requests from a browser. Try another public
  test server.

**502 Bad Gateway from the launcher**
- The public launcher may be down for a while. Use standalone mode.

## Learn more

- [SMART App Launch specification](https://hl7.org/fhir/smart-app-launch/)
- [SMART on FHIR documentation](https://docs.smarthealthit.org/)
- [fhirclient.js](https://github.com/smart-on-fhir/client-js)
- [FHIR R4 Patient resource](https://hl7.org/fhir/R4/patient.html)
