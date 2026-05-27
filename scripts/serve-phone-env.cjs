const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");

function parseEnv(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    result[key] = value;
  }
  return result;
}

function buildEmbedConfig(env, slot) {
  const useAlt = String(slot || "1") === "2";
  const username = useAlt ? (env.SIPUSER1 || env.SIPUSER || "") : (env.SIPUSER || "");
  const password = useAlt ? (env.SIPPASSWORD1 || env.SIPPASSWORD || "") : (env.SIPPASSWORD || "");
  return {
    wssServer: env.WSSSERVER || "",
    WebSocketPort: Number(env.WSSPORT || 0) || null,
    ServerPath: env.WSSPATH || "/ws",
    SipDomain: env.DOMAIN || "",
    SipUsername: username,
    SipPassword: password,
    Language: "en",
    EnableVideoCalling: true
  };
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".png") return "image/png";
  if (ext === ".mp3") return "audio/mpeg";
  return "application/octet-stream";
}

const envRaw = fs.readFileSync(envPath, "utf8");
const env = parseEnv(envRaw);
const slot = String(process.env.VPHONE_SIP_SLOT || "1");
const embedConfig = buildEmbedConfig(env, slot);
const injectScript = `<script>window.__VPhoneEmbedConfig=${JSON.stringify(embedConfig)};</script>`;

const port = Number(process.env.VPHONE_TEST_PORT || 9011);
const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const normalizedRel = (reqPath === "/" ? "/src/ui/index.html" : reqPath).replace(/^\/+/, "");
  const filePath = path.normalize(path.join(projectRoot, normalizedRel));
  if (!filePath.startsWith(projectRoot)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  let body = fs.readFileSync(filePath);
  if (filePath.endsWith(path.join("src", "ui", "index.html"))) {
    const html = body.toString("utf8");
    body = Buffer.from(html.replace("<head>", `<head>\n${injectScript}\n`), "utf8");
  }
  res.setHeader("Content-Type", contentTypeFor(filePath));
  res.statusCode = 200;
  res.end(body);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`VPhone env test server running at http://127.0.0.1:${port} (slot ${slot})`);
});
