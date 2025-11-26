/**
 * @file cmd/create-certs.ts
 * @description Automates the creation of self-signed SSL certificates for local development.
 */

const certsDir = "🧠/certs";
const keyPath = `${certsDir}/example.com.key`;
const certPath = `${certsDir}/example.com.crt`;

async function runCommand(cmd: string, args: string[]): Promise<void> {
  console.log(`\n▶️  Running: ${cmd} ${args.join(" ")}`);
  const command = new Deno.Command(cmd, {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    const errorText = new TextDecoder().decode(stderr);
    console.error(`❌  Error: ${errorText}`);
    Deno.exit(1);
  } else {
    const outputText = new TextDecoder().decode(stdout);
    console.log(`✅  Success!`);
    if (outputText) {
        console.log(outputText);
    }
  }
}

console.log("🔐 Generating self-signed certificates for example.com...");

// 1. Create the certificates directory
await runCommand("mkdir", ["-p", certsDir]);

// 2. Generate the private key
await runCommand("openssl", ["genrsa", "-out", keyPath, "2048"]);

// 3. Generate the self-signed certificate
await runCommand("openssl", [
  "req",
  "-new",
  "-x509",
  "-key",
  keyPath,
  "-out",
  certPath,
  "-days",
  "365",
  "-subj",
  "/CN=example.com",
]);

console.log(`\n✨ Certificates created successfully in ${certsDir}`);
