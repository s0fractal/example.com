
import { parse } from "std/yaml/mod.ts";
import { Sigma🧬 } from "./sigma.ts";

const atomContent = await Deno.readTextFile("🧬.yaml");
const atom = parse(atomContent) as { 🧬: Sigma🧬 };

console.log("🔍 Validating Σ-🧬...");

if (!atom.🧬) {
  console.error("❌ Error: Root '🧬' key missing.");
  Deno.exit(1);
}

const s = atom.🧬;

// Basic structural checks
const checks = [
  { name: "ID format", valid: s.id.startsWith("🧬://") },
  { name: "Kind", valid: ["repo", "😇", "module"].includes(s.kind) },
  { name: "Intent", valid: !!s.intent.goal && !!s.intent.role },
  { name: "State", valid: typeof s.state.energy === "number" },
];

let failed = false;
for (const check of checks) {
  if (check.valid) {
    console.log(`✅ ${check.name}`);
  } else {
    console.error(`❌ ${check.name} failed`);
    failed = true;
  }
}

if (failed) {
  console.error("💥 Validation failed.");
  Deno.exit(1);
}

console.log("✨ Σ-🧬 is valid and resonant.");
