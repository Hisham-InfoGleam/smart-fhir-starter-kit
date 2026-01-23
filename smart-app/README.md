# SMART on FHIR Web App

A browser-based SMART on FHIR application that demonstrates:
- OAuth2 launch flow
- FHIR R4 API queries
- Patient data visualization

---

## Running the App

### Option 1: Python

```bash
cd smart-app
python -m http.server 8000
```

### Option 2: Node.js

```bash
npx http-server smart-app -p 8000 -c-1
```

The app will be available at `http://localhost:8000`

---

## Using the App

### With a SMART Launcher (OAuth2 Flow)

1. Go to https://launch.smarthealthit.org/
2. Set **Launch URL**: `http://localhost:8000/launch.html`
3. Click **Launch** and select a patient
4. The dashboard will display patient data

### Standalone Mode (No OAuth)

1. Open `http://localhost:8000/index.html` directly
2. Click **Connect** in the Standalone Mode panel
3. Select a patient from the list

---

## Configuration

### Default Settings

The app uses public FHIR servers by default (configured in `config.js`).

### Custom FHIR Server

To use your own FHIR server:

1. Copy `config.local.example.js` to `config.local.js`
2. Edit with your settings:

```js
window.INFOGLEAM_CONFIG = Object.assign(window.INFOGLEAM_CONFIG || {}, {
  standaloneServerUrl: "https://your-server.com/fhir",
  smartClientId: "your_client_id",
  includeUserContext: false
});
```

`config.local.js` is gitignored - your settings stay private.

---

## Files

| File | Description |
|------|-------------|
| `launch.html` | OAuth2 authorization entry point |
| `index.html` | Main dashboard with patient data |
| `config.js` | Default configuration (committed) |
| `config.local.js` | Local overrides (gitignored) |
| `config.local.example.js` | Template for local config |

---

## FHIR Resources Displayed

- **Patient** - Name, DOB, gender, ID
- **Encounter** - Recent visits with dates and types
- **MedicationRequest** - Active medications
- **Observation** - Recent lab results and vitals

---

## Troubleshooting

**"Practitioner Login / No Providers Found"**
- Click **Continue without a user**
- This appears when the sandbox has no Practitioner data

**Blank page after launch**
- Open browser DevTools (F12) and check Console for errors
- Verify you launched from a SMART Launcher, not directly

**CORS errors**
- The FHIR server must allow browser requests
- Try a different public sandbox

**502 Bad Gateway from launcher**
- The public launcher may be temporarily down
- Use Standalone Mode instead

---

## How SMART Launch Works

1. You open the SMART Launcher in your browser
2. You enter your app's Launch URL
3. The Launcher redirects YOUR BROWSER to your localhost URL
4. The redirect includes `iss` (FHIR server) and `launch` (context token)
5. Your app uses these to complete OAuth2 authorization

The launcher doesn't "call" your localhost - it's all browser redirects.

---

## Learn More

- [SMART on FHIR Documentation](https://docs.smarthealthit.org/)
- [fhir-client.js Library](https://github.com/smart-on-fhir/client-js)
- [FHIR R4 Patient Resource](https://hl7.org/fhir/R4/patient.html)
