/*
  INFOGLEAM INTEROP POC
  Context: Mirth Connect - Destination Transformer (JavaScript)

  Goal:
  - Validate essential HL7 v2 fields for reliability
  - Map HL7 v2 messages (ADT/ORU) to FHIR-like JSON
  - Serialize JSON for HTTP Sender destination

  Notes:
  - This file is meant to be reviewable on GitHub (unlike binary XML exports).
  - In Mirth, the parsed HL7 object is available as `msg`.
*/

// --- Helpers ---
function mustGet(value, label) {
  if (!value) throw "VALIDATION ERROR: Missing " + label;
  return value;
}

function toStringSafe(v) {
  return (v === null || v === undefined) ? "" : String(v);
}

function convertHL7Date(hl7Date) {
  // Supports YYYYMMDD and returns YYYY-MM-DD
  var d = toStringSafe(hl7Date);
  if (d.length >= 8) return d.substring(0,4) + "-" + d.substring(4,6) + "-" + d.substring(6,8);
  return null;
}

function mapGender(hl7Sex) {
  var s = toStringSafe(hl7Sex).toUpperCase();
  if (s === "M") return "male";
  if (s === "F") return "female";
  return "unknown";
}

// --- 1) Extract headers / routing info ---
var msgType = toStringSafe(msg['MSH']['MSH.9']['MSH.9.1']);   // ADT / ORU / ORM
var trigger = toStringSafe(msg['MSH']['MSH.9']['MSH.9.2']);   // A01 / R01 / ...
var controlId = toStringSafe(msg['MSH']['MSH.10']['MSH.10.1']);

mustGet(controlId, "MSH-10 (Message Control ID)");

// Most message types should carry patient identity in PID
var patientId = toStringSafe(msg['PID']['PID.3']['PID.3.1']);
if (!patientId) {
  throw "VALIDATION ERROR: Missing PID-3 (MRN / Patient ID)";
}

// --- 2) Map to FHIR-like JSON ---
var out = {};

if (msgType === "ADT") {
  var family = toStringSafe(msg['PID']['PID.5']['PID.5.1']);
  var given = toStringSafe(msg['PID']['PID.5']['PID.5.2']);
  var dob = convertHL7Date(toStringSafe(msg['PID']['PID.7']['PID.7.1']));
  var sex = mapGender(toStringSafe(msg['PID']['PID.8']['PID.8.1']));

  out = {
    resourceType: "Patient",
    id: patientId,
    identifier: [{ system: "http://hospital.example.org/mrn", value: patientId }],
    name: [{ use: "official", family: family || undefined, given: given ? [given] : undefined }],
    gender: sex,
    birthDate: dob,
    meta: {
      source: "InfoGleam-Mirth",
      tag: [{ system: "http://example.org/tags", code: "poc" }]
    }
  };

} else if (msgType === "ORU") {
  var testName = toStringSafe(msg['OBR']['OBR.4']['OBR.4.2']) || toStringSafe(msg['OBR']['OBR.4']['OBR.4.1']);
  var value = toStringSafe(msg['OBX']['OBX.5']['OBX.5.1']);

  out = {
    resourceType: "Observation",
    status: "final",
    subject: { reference: "Patient/" + patientId },
    code: { text: testName || "Lab Result" },
    valueString: value || undefined,
    meta: {
      source: "InfoGleam-Mirth",
      tag: [{ system: "http://example.org/tags", code: "poc" }]
    }
  };

} else {
  out = {
    resourceType: "Basic",
    id: controlId,
    code: { text: "Unhandled HL7 message type" },
    extension: [
      { url: "http://example.org/hl7/msgType", valueString: msgType },
      { url: "http://example.org/hl7/trigger", valueString: trigger }
    ]
  };
}

// --- 3) Serialize for HTTP Sender ---
msg = JSON.stringify(out);
