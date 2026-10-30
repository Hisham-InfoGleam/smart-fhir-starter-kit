/*
  Mock FHIR receiver
  Receives the JSON that the OIE / Mirth HTTP Sender posts, prints it, and
  answers 200. It proves that the transform and the delivery work.
  It does not store or validate anything. Local demo only.

  Run:
    npm start                (listens on 127.0.0.1:3000)

  Settings (environment variables):
    PORT   default 3000
    HOST   default 127.0.0.1. Use 0.0.0.0 only when the engine runs in a
           container that cannot reach 127.0.0.1 on this computer.

  Endpoints:
    POST /fhir     print the JSON body
    GET  /health   {"status":"ok"}
*/

const http = require("http");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString("utf8");
      if (body.length > 2_000_000) { // 2 MB safety limit
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "POST" && req.url === "/fhir") {
    try {
      const raw = await readBody(req);
      const json = JSON.parse(raw);

      console.log(`\n--- RECEIVED ${req.headers["content-type"] || "(no content type)"} ---`);
      console.log(JSON.stringify(json, null, 2));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "received", resourceType: json.resourceType, id: json.id || "N/A" }));
    } catch (err) {
      console.error("\n--- BAD REQUEST ---");
      console.error(err.message);

      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON or request" }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = process.env.HOST || "127.0.0.1";

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("Stop the process using that port, or run with a different port:");
    console.error("  PowerShell: $env:PORT=3001; npm start");
    console.error("  bash:       PORT=3001 npm start");
    process.exit(1);
  }

  console.error(err);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Mock receiver listening on http://${host}:${port}`);
  console.log("- POST /fhir");
  console.log("- GET  /health");
});
