/*
  InfoGleam Mock Receiver
  Purpose: Receive JSON from Mirth HTTP Sender to prove transformation + delivery.

  Run:
    npm start

  Endpoint:
    POST http://localhost:3000/fhir
*/

const http = require("http");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString("utf8");
      if (body.length > 2_000_000) { // 2MB safety
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

      console.log("\n--- RECEIVED FROM MIRTH ---");
      console.log(JSON.stringify(json, null, 2));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "received", resourceType: json.resourceType, id: json.id || "N/A" }));
    } catch (err) {
      console.error("\n--- BAD REQUEST ---");
      console.error(err);

      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON or request" }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("Stop the process using that port, or run with a different port:");
    console.error("  PowerShell: $env:PORT=3001; node server.js");
    process.exit(1);
  }

  console.error(err);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Mock receiver listening on http://localhost:${port}`);
  console.log(`- POST /fhir`);
  console.log(`- GET  /health`);
});
