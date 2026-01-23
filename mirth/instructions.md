# 🧰 Mirth Setup Notes (InfoGleam PoC)

This PoC provides two artifacts:

- [mirth/channel-logic.js](channel-logic.js): Reviewable JS logic to paste into a Mirth transformer step.
- [mirth/channels/Infogleam_HL7_to_FHIR.xml](channels/Infogleam_HL7_to_FHIR.xml): A sanitized “starter” channel export.

> Note: Mirth channel XML formats can differ slightly by version. If import fails, create the channel manually and paste `channel-logic.js` into a JavaScript Transformer step.

---

## ✅ Goal

- Source: TCP Listener (MLLP/LLP)
- Transform: Validate + map HL7 v2 → FHIR-like JSON
- Destination: HTTP Sender POST to `http://localhost:3000/fhir`

---

## Option A — Import the XML Channel

1. Open **Mirth Connect Administrator**.
2. Go to **Channels** → **Import Channel**.
3. Select [mirth/channels/Infogleam_HL7_to_FHIR.xml](channels/Infogleam_HL7_to_FHIR.xml).
4. Deploy the channel.

If you imported successfully, continue to “Send HL7 Samples”.

---

## Option B — Build Manually (works on any version)

1. Create a new channel named: `Infogleam_HL7_to_FHIR`
2. **Source Connector**: TCP Listener
   - Port: `6661`
   - Enable MLLP framing (VT + FS/CR)
3. **Destination Connector**: HTTP Sender
   - URL: `http://localhost:3000/fhir`
   - Method: POST
   - Content-Type: `application/json`
4. **Destination Transformer**: Add a JavaScript step
   - Paste the contents of [mirth/channel-logic.js](channel-logic.js)

---

## Send HL7 Samples

Use Mirth “Send Message” (right-click channel) and paste contents from:
- [mirth/messages/ADT_A01.hl7](messages/ADT_A01.hl7)
- [mirth/messages/ORU_R01.hl7](messages/ORU_R01.hl7)

Then confirm the receiver printed the payload:
- Start the mock receiver from [mirth/mock-server/package.json](mock-server/package.json)

---

## Expected Outcome

- ADT messages become `Patient` JSON
- ORU messages become `Observation` JSON
- Receiver prints JSON and responds `200 OK`
