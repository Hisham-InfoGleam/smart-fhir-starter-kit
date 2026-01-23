# Quick Start Guide

Get the SMART on FHIR Starter Kit running in minutes.

---

## Prerequisites

- **Python 3** or **Node.js** (for serving static files)
- **Node.js 18+** (for the mock receiver, optional)
- **Mirth Connect** (optional, for HL7 v2 integration)

---

## 1. Start the SMART App

Open a terminal and run:

```bash
cd smart-app
python -m http.server 8000
```

Or with Node.js:

```bash
npx http-server smart-app -p 8000 -c-1
```

The app is now available at `http://localhost:8000`

---

## 2. Launch with a SMART Sandbox

### Option A: Use the Public SMART Launcher

1. Go to: https://launch.smarthealthit.org/
2. Set **Launch URL**: `http://localhost:8000/launch.html`
3. Leave FHIR Version as **R4**
4. Click **Launch**
5. Select a test patient
6. The dashboard will display Patient, Encounters, Medications, and Observations

### Option B: Use Standalone Mode (No OAuth)

1. Open: `http://localhost:8000/index.html`
2. In **Standalone Mode**, click **Connect**
3. Select a patient from the list

This mode connects directly to a public FHIR server without OAuth.

---

## 3. Use Your Own FHIR Server (Optional)

To connect to your own FHIR server:

1. Copy `smart-app/config.local.example.js` to `smart-app/config.local.js`
2. Edit with your server details:

```js
window.INFOGLEAM_CONFIG = Object.assign(window.INFOGLEAM_CONFIG || {}, {
  standaloneServerUrl: "https://your-fhir-server.com/fhir",
  smartClientId: "your_client_id"
});
```

3. Refresh the app - it will use your server

Note: `config.local.js` is gitignored so your private URLs stay private.

---

## 4. Test HL7 v2 Integration (Optional)

If you have Mirth Connect installed:

### Start the Mock Receiver

```bash
cd mirth/mock-server
npm install
npm start
```

You should see:

```
Mock receiver listening on http://localhost:3000
- POST /fhir
- GET  /health
```

### Import and Test the Channel

1. Open Mirth Connect Administrator
2. Import `mirth/channels/Infogleam_HL7_to_FHIR.xml`
3. Deploy the channel
4. Send a test message using `mirth/messages/ADT_A01.hl7`
5. Check the mock receiver terminal for the transformed JSON output

---

## Verification

| Component | Test | Expected Result |
|-----------|------|-----------------|
| SMART App | Open `http://localhost:8000/index.html` | Dashboard loads |
| SMART Launch | Launch from https://launch.smarthealthit.org/ | Patient data displays |
| Mock Receiver | `curl http://localhost:3000/health` | `{"status":"ok"}` |
| Mirth Channel | Send ADT_A01.hl7 | Receiver prints JSON |

---

## Stopping Services

- Stop the SMART app: Press `Ctrl+C` in the Python/Node terminal
- Stop the mock receiver: Press `Ctrl+C` in the Node terminal

---

## Troubleshooting

**Port already in use?**

```bash
# Find what's using port 8000
lsof -i :8000        # macOS/Linux
netstat -ano | findstr :8000   # Windows

# Use a different port
python -m http.server 8080
```

**SMART Launcher shows "No Providers Found"?**

- Click **Continue without a user**
- This is normal when the sandbox has no Practitioner data

**SMART Launcher returns 502?**

- The public launcher may be temporarily down
- Use **Standalone Mode** instead (open index.html directly)

**Mirth can't connect to receiver?**

- Verify the receiver is running on port 3000
- Check the destination URL in Mirth is `http://localhost:3000/fhir`

---

## Next Steps

- Explore the code in `smart-app/` to understand SMART on FHIR
- Review `mirth/channel-logic.js` for HL7 transformation patterns
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design
- Try modifying the dashboard to display additional FHIR resources

---

**Questions or improvements?** Contributions are welcome!
