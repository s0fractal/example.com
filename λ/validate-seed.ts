
import { parse } from "std/yaml/mod.ts";
import { SigmaSeed } from "./sigma.ts";

const seedContent = await Deno.readTextFile("🧬.yaml");
const seed = parse(seedContent) as { seed: SigmaSeed };

console.log("🔍 Validating Σ-Seed...");

if (!seed.seed) {
  console.error("❌ Error: Root 'seed' key missing.");
  Deno.exit(1);
}

const s = seed.seed;

// Basic structural checks
const checks = [
  { name: "ID format", valid: s.id.startsWith("seed://") },
  { name: "Kind", valid: ["repo", "agent", "module"].includes(s.kind) },
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

console.log("✨ Σ-Seed is valid and resonant.");
