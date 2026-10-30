/*
  HL7 v2 to FHIR R4 JSON
  Transformer script for Open Integration Engine (OIE) or Mirth Connect.

  Where it runs: the JavaScript step "HL7 v2 to FHIR JSON" in the destination
  transformer of channels/Infogleam_HL7_to_FHIR.xml. The channel file holds an
  exact copy of this script. If you change one, change the other.

  What it does:
  - Checks that MSH-10 (message control ID) and PID-3 (patient ID) are present.
    If one is missing, the script throws an error. The message gets the status
    ERROR and the sender gets a negative ACK (MSA-1 = AE).
  - ADT messages become one FHIR Patient.
  - ORU messages become a FHIR Bundle (type "collection") with one Observation
    for each OBX segment.
  - Other message types become a FHIR Basic resource that records the type.

  The engine gives this script the parsed HL7 message as `msg` (E4X XML).
  At the end the script replaces `msg` with a JSON string. The HTTP Sender
  posts that string to the receiver.

  This is demo code for learning. Check the mappings against the HL7 v2-to-FHIR
  guide (https://hl7.org/fhir/uv/v2mappings/) before you use it with real data.
*/

// --- Helpers ---

// Text of the first matching element, or "" when the element is missing.
function text(node) {
  if (node === undefined || node === null) return "";
  var first = node[0];
  if (first === undefined || first === null) return "";
  return String(first).trim();
}

// HL7 v2 timestamp: YYYY[MM[DD[HH[MM[SS[.S...]]]]]][+/-ZZZZ]
var HL7_TS = /^(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\.\d{1,4})?([+-]\d{4})?$/;

// HL7 date or timestamp -> FHIR date (YYYY, YYYY-MM or YYYY-MM-DD).
function toFhirDate(value) {
  var m = HL7_TS.exec(value);
  if (!m) return undefined;
  var out = m[1];
  if (m[2]) out += "-" + m[2];
  if (m[3]) out += "-" + m[3];
  return out;
}

// HL7 timestamp -> FHIR dateTime.
// FHIR needs a time zone when a time is given. If the HL7 value has no zone
// (+/-ZZZZ), only the date is kept. Add your site's zone here if you need it.
function toFhirDateTime(value) {
  var m = HL7_TS.exec(value);
  if (!m) return undefined;
  if (!m[4] || !m[8]) return toFhirDate(value);
  return m[1] + "-" + m[2] + "-" + m[3] +
    "T" + m[4] + ":" + (m[5] || "00") + ":" + (m[6] || "00") + (m[7] || "") +
    m[8].substring(0, 3) + ":" + m[8].substring(3);
}

// PID-8 administrative sex (HL7 table 0001) -> FHIR gender.
function toFhirGender(sex) {
  switch (sex.toUpperCase()) {
    case "M": return "male";
    case "F": return "female";
    case "A":
    case "O": return "other";
    default: return "unknown";
  }
}

// OBX-11 result status -> FHIR Observation.status.
var RESULT_STATUS = {
  F: "final",
  C: "corrected",
  P: "preliminary",
  X: "cancelled",
  W: "entered-in-error"
};

// OBX-3 -> CodeableConcept. Coding system "LN" means LOINC.
function observationCode(obx) {
  var code = text(obx['OBX.3']['OBX.3.1']);
  var display = text(obx['OBX.3']['OBX.3.2']);
  var system = text(obx['OBX.3']['OBX.3.3']);
  var concept = {};
  if (code) {
    var coding = {};
    if (system === "LN") coding.system = "http://loinc.org";
    coding.code = code;
    if (display) coding.display = display;
    concept.coding = [coding];
  }
  concept.text = display || code || "Lab result";
  return concept;
}

// OBX-2 / OBX-5 / OBX-6 -> Observation value.
// NM (numeric) becomes valueQuantity with the unit from OBX-6.
// Every other value type is kept as text in valueString.
function setObservationValue(observation, obx) {
  var valueType = text(obx['OBX.2']['OBX.2.1']).toUpperCase();
  var raw = text(obx['OBX.5']['OBX.5.1']);
  if (!raw) return;
  if (valueType === "NM" && !isNaN(Number(raw))) {
    observation.valueQuantity = { value: Number(raw) };
    var unit = text(obx['OBX.6']['OBX.6.1']);
    if (unit) observation.valueQuantity.unit = unit;
    return;
  }
  observation.valueString = raw;
}

// Every resource is tagged as demo data.
var META = { tag: [{ system: "http://example.org/tags", code: "demo" }] };

// --- 1) Read the header and check the required fields ---

var msgType = text(msg['MSH']['MSH.9']['MSH.9.1']);   // ADT, ORU, ORM, ...
var trigger = text(msg['MSH']['MSH.9']['MSH.9.2']);   // A01, R01, O01, ...
var controlId = text(msg['MSH']['MSH.10']['MSH.10.1']);
if (!controlId) {
  throw "VALIDATION ERROR: Missing MSH-10 (message control ID)";
}

var patientId = text(msg['PID']['PID.3']['PID.3.1']);
if (!patientId) {
  throw "VALIDATION ERROR: Missing PID-3 (patient ID / MRN)";
}

// --- 2) Map to FHIR R4 JSON ---

var out;

if (msgType === "ADT") {
  out = {
    resourceType: "Patient",
    id: patientId,
    meta: META,
    identifier: [{ system: "http://hospital.example.org/mrn", value: patientId }]
  };

  var family = text(msg['PID']['PID.5']['PID.5.1']);
  var given = text(msg['PID']['PID.5']['PID.5.2']);
  if (family || given) {
    var name = { use: "official" };
    if (family) name.family = family;
    if (given) name.given = [given];
    out.name = [name];
  }

  out.gender = toFhirGender(text(msg['PID']['PID.8']['PID.8.1']));

  var birthDate = toFhirDate(text(msg['PID']['PID.7']['PID.7.1']));
  if (birthDate) out.birthDate = birthDate;

} else if (msgType === "ORU") {
  // OBR-7 (observation date/time) is the fallback when an OBX has no OBX-14.
  // This demo reads the first OBR only.
  var obrTime = text(msg['OBR']['OBR.7']['OBR.7.1']);
  var entries = [];
  var obxList = msg['OBX'];

  for (var i = 0; i < obxList.length(); i++) {
    var obx = obxList[i];
    var observation = {
      resourceType: "Observation",
      meta: META,
      status: RESULT_STATUS[text(obx['OBX.11']['OBX.11.1']).toUpperCase()] || "unknown",
      code: observationCode(obx),
      subject: { reference: "Patient/" + patientId }
    };

    var effective = toFhirDateTime(text(obx['OBX.14']['OBX.14.1']) || obrTime);
    if (effective) observation.effectiveDateTime = effective;

    setObservationValue(observation, obx);
    entries.push({ resource: observation });
  }

  out = { resourceType: "Bundle", type: "collection" };
  if (entries.length) out.entry = entries;

} else {
  out = {
    resourceType: "Basic",
    id: controlId,
    meta: META,
    code: { text: "Unhandled HL7 message type" },
    extension: [{ url: "http://example.org/hl7/msgType", valueString: msgType || "unknown" }]
  };
  if (trigger) {
    out.extension.push({ url: "http://example.org/hl7/trigger", valueString: trigger });
  }
}

// --- 3) Hand the JSON to the HTTP Sender ---

msg = JSON.stringify(out);
