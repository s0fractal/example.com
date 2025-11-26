/**
 * @file ⚙️.ts
 * @description The core logic (reflex) for the Server (🌐) 😇.
 * This script serves the project repository over HTTPS.
 */

import { serveDir } from "std/http/file_server.ts";
import { fromFileUrl, join } from "std/path/mod.ts";
import { parse } from "std/yaml/mod.ts";
import { SigmaSeed } from "../../../λ/sigma.ts";

// The root of the repository to be served.
const REPO_ROOT = fromFileUrl(new URL("../../..", import.meta.url));

// Read the DNA to get configuration
const seedContent = await Deno.readTextFile(join(REPO_ROOT, "🧬.yaml"));
const seed = parse(seedContent) as { seed: SigmaSeed };
const { domain: HOSTNAME, port: PORT } = seed.seed.spec.vars!;

const keyFile = join(REPO_ROOT, "🧠/certs/example.com.key");
const certFile = join(REPO_ROOT, "🧠/certs/example.com.crt");

console.log(`🌐 Server 😇: Preparing to serve repository over HTTPS...`);
console.log(`   Root: ${REPO_ROOT}`);
console.log(`   URL: https://${HOSTNAME}:${PORT}`);
console.log(`   Key file: ${keyFile}`);
console.log(`   Cert file: ${certFile}`);

Deno.serve({
  port: PORT,
  hostname: HOSTNAME,
  cert: await Deno.readTextFile(certFile),
  key: await Deno.readTextFile(keyFile),
}, (req) => {
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] Request: ${req.method} ${url.pathname}`);

  return serveDir(req, {
    fsRoot: REPO_ROOT,
    urlRoot: "",
    quiet: true,
  });
});