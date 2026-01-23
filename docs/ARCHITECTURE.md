# Architecture Overview

This document explains how the components of the SMART on FHIR Starter Kit work together.

---

## System Diagram

```
                                SMART on FHIR Flow
                                ==================

+----------------------+     OAuth2 Redirect      +-------------------------+
|   SMART Launcher     |------------------------->|   SMART Web App         |
|   (EHR Simulator)    |   (iss + launch token)   |   (smart-app/)          |
+----------------------+                          +-----------+-------------+
                                                              |
                                                              | FHIR REST API
                                                              | (Patient, Encounter,
                                                              |  MedicationRequest,
                                                              |  Observation)
                                                              v
                                                  +-------------------------+
                                                  |     FHIR R4 Server      |
                                                  |   (Sandbox or Real)     |
                                                  +-------------------------+


                                HL7 v2 Integration Flow
                                =======================

+----------------------+      HL7 v2 (MLLP)       +-------------------------+
|   HL7 Source         |------------------------->|   Mirth Connect         |
|   (ADT, ORU, ORM)    |                          |   - Validate MSH/PID    |
+----------------------+                          |   - Transform to JSON   |
                                                  +-----------+-------------+
                                                              |
                                                              | HTTP POST
                                                              | (FHIR-like JSON)
                                                              v
                                                  +-------------------------+
                                                  |   HTTP Receiver         |
                                                  |   (mock-server/)        |
                                                  +-------------------------+
```

---

## Component Details

### SMART on FHIR Web App (`smart-app/`)

| File | Purpose |
|------|---------|
| `launch.html` | Initiates OAuth2 authorization flow using fhir-client.js |
| `index.html` | Main dashboard - displays patient data after authorization |
| `config.js` | Default configuration (public FHIR servers) |
| `config.local.js` | Optional local overrides (gitignored) |

**Key Libraries:**
- [fhir-client.js](https://github.com/smart-on-fhir/client-js) - Handles SMART OAuth2 and FHIR API calls

**FHIR Resources Queried:**
- `Patient` - Demographics
- `Encounter` - Recent visits
- `MedicationRequest` - Active medications
- `Observation` - Lab results and vitals

### Mirth Connect Channel (`mirth/`)

| File | Purpose |
|------|---------|
| `channel-logic.js` | Transformer JavaScript (validation + mapping) |
| `channels/*.xml` | Importable channel configuration |
| `messages/*.hl7` | Sample HL7 v2 messages for testing |

**Validation Gates:**
- Checks for required `MSH-10` (Message Control ID)
- Checks for required `PID-3` (Patient Identifier)
- Rejects malformed messages before transformation

**Transformation Logic:**
- ADT messages -> Patient resource
- ORU messages -> Observation resource
- Other messages -> Basic resource wrapper

### Mock HTTP Receiver (`mirth/mock-server/`)

A minimal Node.js server that:
- Receives POST requests from Mirth
- Logs the transformed JSON payload
- Returns success/error responses

Useful for verifying that Mirth channels are working correctly.

---

## Data Flow Examples

### Example 1: SMART App Launch

```
1. User opens SMART Launcher
2. User enters app URL: http://localhost:8000/launch.html
3. Launcher redirects to launch.html with iss + launch parameters
4. launch.html calls FHIR.oauth2.authorize()
5. User authorizes and selects patient
6. Redirect to index.html with authorization code
7. index.html calls FHIR.oauth2.ready() to get access token
8. App queries FHIR server for patient data
9. Dashboard renders the results
```

### Example 2: HL7 v2 Processing

```
1. HL7 source sends ADT_A01 message to Mirth (port 6661)
2. Mirth channel receives and parses the message
3. Transformer validates MSH-10 and PID-3
4. If valid, maps HL7 fields to FHIR-like JSON
5. HTTP Sender POSTs JSON to mock receiver (port 3000)
6. Receiver logs the payload and returns 200 OK
7. Mirth marks message as processed
```

---

## Security Considerations

- **OAuth2**: SMART apps use standard OAuth2 for authorization
- **CORS**: FHIR servers must allow browser requests (Access-Control-Allow-Origin)
- **HTTPS**: Production deployments should use TLS encryption
- **Credentials**: Never commit real credentials or PHI to version control

---

## Extending This Architecture

**Add more FHIR resources:**
- Modify `index.html` to query additional resources (AllergyIntolerance, Condition, etc.)

**Support more HL7 message types:**
- Add new mapping logic in `channel-logic.js`
- Create sample messages in `mirth/messages/`

**Connect to a real FHIR server:**
- Update `config.local.js` with your server URL
- Ensure proper OAuth2 client registration

---

## References

- [SMART on FHIR Specification](https://docs.smarthealthit.org/)
- [HL7 FHIR R4](https://hl7.org/fhir/R4/)
- [HL7 v2 Message Structure](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185)
- [Mirth Connect Documentation](https://www.nextgen.com/products-and-services/integration-engine)
