# InfoGleam SMART on FHIR Starter Kit

An **open-source educational toolkit** for learning and building healthcare interoperability solutions.

This project provides working examples of:
- **SMART on FHIR** app development (OAuth2 launch + FHIR API)
- **HL7 v2 integration** with Mirth Connect (ingestion, validation, transformation)
- **Modern clinical UI** patterns for patient data visualization

**Free to use, modify, and learn from.** Built for the healthcare developer community.

---

## What You Can Learn

| Topic | What's Included |
|-------|-----------------|
| **SMART on FHIR** | Complete OAuth2 launch flow, patient-context reads, FHIR queries |
| **FHIR R4 API** | Patient, Encounter, MedicationRequest, Observation resources |
| **HL7 v2 Processing** | Mirth Connect channel with validation + transformation logic |
| **Clinical UX** | Dashboard layout, resource rendering, error handling |

---

## Quick Start

### 1. Serve the SMART App

```bash
cd smart-app
python -m http.server 8000
```

### 2. Launch with Any SMART Sandbox

- Open: https://launch.smarthealthit.org/
- Set **Launch URL**: `http://localhost:8000/launch.html`
- Click **Launch**, select a patient, see the dashboard

### 3. Or Use Standalone Mode (No OAuth)

- Open: `http://localhost:8000/index.html`
- Click **Connect** to browse patients from a public FHIR server

> Full setup guide: [QUICKSTART.md](QUICKSTART.md)

---

## Project Structure

```
smart-app/                     # SMART on FHIR web application
  launch.html                  # OAuth2 authorize entry point
  index.html                   # Patient dashboard + standalone mode
  config.js                    # Default configuration (public servers)
  README.md                    # App-specific documentation

mirth/                         # HL7 v2 integration examples
  channel-logic.js             # Transformer code (reviewable JS)
  channels/                    # Importable Mirth channel XML
  messages/                    # Sample HL7 v2 messages (synthetic)
  mock-server/                 # Simple HTTP receiver for testing

docs/
  ARCHITECTURE.md              # System design overview

QUICKSTART.md                  # Step-by-step setup instructions
```

---

## Use Your Own FHIR Server

This toolkit works with any FHIR R4 server. To use your own:

1. Copy `smart-app/config.local.example.js` to `smart-app/config.local.js`
2. Set your FHIR server URL and client ID
3. `config.local.js` is gitignored - your endpoints stay private

```js
// smart-app/config.local.js (example)
window.INFOGLEAM_CONFIG = Object.assign(window.INFOGLEAM_CONFIG || {}, {
  standaloneServerUrl: "https://your-fhir-server.com/fhir",
  smartClientId: "your_client_id"
});
```

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system diagram.

```
SMART App Launcher  -->  SMART Web App  -->  FHIR Server
                              |
                              +-- Patient / Encounter / Meds / Obs

HL7 Source  -->  Mirth Connect  -->  HTTP Receiver
                 (transform)         (verify output)
```

---

## Privacy and Safety

- All included HL7 samples are **synthetic** (no real patient data)
- Private server URLs belong in `config.local.js` (gitignored)
- Safe to fork, modify, and share

---

## Learn More

- [SMART on FHIR Documentation](https://docs.smarthealthit.org/)
- [HL7 FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Mirth Connect User Guide](https://www.nextgen.com/products-and-services/integration-engine)
- [fhir-client.js Library](https://github.com/smart-on-fhir/client-js)

---

## Contributing

Contributions are welcome! Feel free to:
- Report issues or suggest improvements
- Add new FHIR resource examples
- Improve documentation
- Share your learning experiences

---

## License

This project is provided as an **educational resource** for the healthcare developer community.

Use it freely to learn, build, and improve healthcare interoperability.

---

**Built with love for the healthcare community by [InfoGleam](https://infogleam.com)**
