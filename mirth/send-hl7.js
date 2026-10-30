/*
  Send one HL7 v2 message file to an MLLP listener and print the ACK.

  Usage:
    node mirth/send-hl7.js mirth/messages/ADT_A01.hl7
    node mirth/send-hl7.js mirth/messages/ORU_R01.hl7 --host 127.0.0.1 --port 6661

  MLLP framing: 0x0B (VT), the message, then 0x1C 0x0D (FS CR).
  HL7 segments must end with CR, so Windows and Unix line ends in the file
  are changed to CR before sending.

  Exit code: 0 when the ACK says AA or CA, 1 for any other ACK, 2 for errors.
  No dependencies. Needs Node.js 18 or newer.
*/

const fs = require("fs");
const net = require("net");

function parseArgs(argv) {
  const opts = { host: "127.0.0.1", port: 6661, timeoutMs: 10000, file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--host") opts.host = argv[++i];
    else if (a === "--port") opts.port = Number(argv[++i]);
    else if (a === "--timeout") opts.timeoutMs = Number(argv[++i]);
    else if (!opts.file) opts.file = a;
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.file || !Number.isInteger(opts.port)) {
  console.error("Usage: node mirth/send-hl7.js <file.hl7> [--host 127.0.0.1] [--port 6661] [--timeout 10000]");
  process.exit(2);
}

const text = fs.readFileSync(opts.file, "utf8").replace(/\r\n|\n/g, "\r").replace(/\r+$/, "") + "\r";
const frame = Buffer.concat([Buffer.from([0x0b]), Buffer.from(text, "utf8"), Buffer.from([0x1c, 0x0d])]);

console.log(`Sending ${opts.file} to ${opts.host}:${opts.port}`);

const chunks = [];
const socket = net.createConnection({ host: opts.host, port: opts.port }, () => socket.write(frame));
socket.setTimeout(opts.timeoutMs);

socket.on("data", (data) => {
  chunks.push(data);
  if (data.includes(0x1c)) socket.end();
});

socket.on("timeout", () => {
  console.error(`No ACK within ${opts.timeoutMs} ms.`);
  socket.destroy();
  process.exitCode = 2;
});

socket.on("error", (err) => {
  console.error(`Connection failed: ${err.message}`);
  console.error("Is the channel deployed and listening on that host and port?");
  process.exitCode = 2;
});

socket.on("close", () => {
  if (!chunks.length) return;
  const ack = Buffer.concat(chunks).toString("utf8").replace(/[\x0b\x1c]/g, "").trim();
  const segments = ack.split("\r").filter(Boolean);
  console.log("ACK received:");
  segments.forEach((s) => console.log("  " + s));

  const msa = segments.find((s) => s.startsWith("MSA|"));
  const code = msa ? msa.split("|")[1] : "";
  process.exitCode = code === "AA" || code === "CA" ? 0 : 1;
});
