# Architecture

This kit has two separate parts. They do not call each other.

1. A SMART on FHIR web app that reads data from a FHIR server.
2. An HL7 v2 to FHIR channel for OIE / Mirth that turns HL7 v2 messages into
   FHIR JSON.

## 1. SMART on FHIR app

```text
SMART launcher or EHR
   |
   |  opens launch.html?iss=<FHIR server>&launch=<id>
   v
launch.html  --(redirect: client_id, scope, redirect_uri, state, PKCE)-->  authorization server
                                                                                |
index.html  <--(redirect: ?code=...&state=...)----------------------------------+
   |
   |  token request, then FHIR REST calls with the access token
   v
FHIR R4 server: Patient, Encounter, MedicationRequest, Observation
```

Steps:

1. The launcher (or an EHR) opens `launch.html` with `iss` and, for an EHR
   launch, `launch`.
2. `launch.html` builds the scopes (`launch` for an EHR launch,
   `launch/patient` for a standalone launch, plus `openid fhirUser
   patient/*.read`) and calls `FHIR.oauth2.authorize()`.
3. fhirclient finds the authorization endpoints in the server's
   `.well-known/smart-configuration` and sends the browser there.
4. After approval, the browser comes back to `index.html` with a `code`.
5. `index.html` calls `FHIR.oauth2.ready()`. fhirclient gets the access token
   and the patient ID from the token response.
6. The dashboard runs four FHIR searches. Each card loads and fails on its own.

If `index.html` is opened without a launch, it does not call
`FHIR.oauth2.ready()`. It shows standalone mode instead, which reads an open
FHIR server with `FHIR.client({ serverUrl })` and no login.

## 2. HL7 v2 to FHIR channel

```text
HL7 v2 sender (mirth/send-hl7.js)
   |
   |  MLLP over TCP, port 6661
   v
OIE / Mirth channel "Infogleam_HL7_to_FHIR"
   source:       TCP Listener (MLLP)
   transformer:  JavaScript step = mirth/channel-logic.js
   destination:  HTTP Sender, POST application/fhir+json
   |
   |  HTTP POST http://localhost:3000/fhir
   v
Mock receiver (mirth/mock-server) prints the JSON
```

Steps:

1. The sender sends one HL7 v2 message in an MLLP frame.
2. The TCP Listener receives it. The HL7 v2 data type parses it into XML
   (the `msg` variable).
3. The destination transformer checks MSH-10 and PID-3. If one is missing,
   it throws an error and the message gets the status ERROR.
4. The transformer maps the message: ADT to `Patient`, ORU to a `Bundle` of
   `Observation` resources (one per OBX), other types to `Basic`.
5. The HTTP Sender posts the JSON to the receiver.
6. The engine builds the ACK after the destination is done: `AA` when the
   post worked, `AE` when the check failed or the post failed.

The field mapping is in the main [README](../README.md#hl7-v2-to-fhir-with-oie--mirth).

## Files

| Path | Role |
|---|---|
| `smart-app/launch.html` | Starts the SMART authorization |
| `smart-app/index.html` | Finishes the authorization and shows the dashboard; standalone mode |
| `smart-app/config.js` | Default settings; `config.local.js` overrides them |
| `mirth/channels/Infogleam_HL7_to_FHIR.xml` | Channel exported from OIE 4.7.0 |
| `mirth/channel-logic.js` | The transformer script (same code as in the channel) |
| `mirth/send-hl7.js` | Sends an HL7 file over MLLP and prints the ACK |
| `mirth/mock-server/server.js` | Receives and prints the FHIR JSON |
| `mirth/messages/*.hl7` | Synthetic HL7 v2 samples |

## Security notes

- This is a local demo. The MLLP listener has no TLS, and the mock receiver
  has no login. Keep both on your own computer.
- The SMART app is a public client with no client secret. It relies on the
  redirect URI, and on PKCE when the server supports it. fhirclient keeps the
  token in sessionStorage.
- FHIR data is shown with `textContent` only, so server text cannot run as
  HTML or script in the page.
- Use HTTPS for anything beyond a local test.
- Never commit real credentials or real patient data.

## Ways to extend it

- Show more FHIR resources (AllergyIntolerance, Condition) in `index.html`.
- Map more HL7 v2 messages in `channel-logic.js`, then paste the same script
  into the channel and export it again.
- Point the HTTP Sender at a real FHIR server. For a real server, post a
  `transaction` Bundle or each resource to its own endpoint.
