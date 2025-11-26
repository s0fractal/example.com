import { join } from "std/path/mod.ts";
const REPO_ROOT = Deno.cwd();

export async function reflex(): Promise<void> {
  console.log("📜 Schema Guardian 😇: Reflex started at", new Date().toISOString(), "from", REPO_ROOT);
  await Deno.writeTextFile("./debug_reflex_minimal.log", `Minimal script started at ${new Date().toISOString()} from ${REPO_ROOT}\n`, { append: true });
  await Deno.writeTextFile("./debug_reflex_minimal.log", `Minimal script finished.\n`, { append: true });
}

reflex();
