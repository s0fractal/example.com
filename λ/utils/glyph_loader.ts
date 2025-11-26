import { parse } from "std/yaml/parse.ts";
import { readAll } from "std/io/read_all.ts";

// Define interfaces for our glyph structures for better type safety
interface GlyphAtomicType {
  description: string;
  glyph: string;
}

interface GlyphConceptual {
  description: string;
  suggested_type: string; // Refers to an atomic glyph string (e.g., "𝕊")
}

interface GlyphSchemaField {
  [key: string]: string; // Key is glyph, value is type (e.g., "🜁": "𝕊")
}

interface GlyphStructural {
  description: string;
  schema: GlyphSchemaField;
}

interface SigmaCore {
  types: { [key: string]: GlyphAtomicType };
  // StructureDefinitionPrinciple is conceptual, not parsed directly
}

interface GlyphSet {
  "🜁": GlyphConceptual;
  "⚘": GlyphConceptual;
  "⟁": GlyphConceptual;
  "✦": GlyphConceptual;
  "🜄": GlyphConceptual;
  "↦": GlyphConceptual;
  "⇾": GlyphConceptual;
  "🧬": GlyphStructural; // Agent DNA
  "👼": GlyphStructural; // Angel / Ability
  "⟡": GlyphStructural; // Interaction Morphism
  // Add other conceptual/structural glyphs as defined in glyph-set.yml
}

type GlyphData = SigmaCore | GlyphSet | any; // 'any' for agent/ability instances initially

/**
 * Loads and parses a YAML file into a JavaScript object.
 * @param filePath The path to the YAML file.
 * @returns The parsed YAML content.
 */
async function loadGlyphYaml(filePath: string): Promise<GlyphData> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    return parse(fileContent);
  } catch (error) {
    console.error(`Failed to load or parse YAML file at ${filePath}:`, error);
    throw error;
  }
}

/**
 * Loads all core glyph definitions and instances.
 * @returns An object containing all loaded glyph data.
 */
export async function loadAllGlyphs() {
  const glyphs: {
    sigmaCore?: SigmaCore;
    glyphSet?: GlyphSet;
    agents: { [id: string]: any };
    abilities: { [id: string]: any };
    [key: string]: any; // For other specific glyphs or instances
  } = {
    agents: {},
    abilities: {},
  };

  // Load Sigma Core definitions
  glyphs.sigmaCore = await loadGlyphYaml("🧬/sigma-core.yml");
  console.log("Loaded 🧬/sigma-core.yml");

  // Load Glyph Set definitions
  glyphs.glyphSet = await loadGlyphYaml("🧬/glyph-set.yml");
  console.log("Loaded 🧬/glyph-set.yml");

  // Load agent instances from 🧬/🆔/
  for await (const dirEntry of Deno.readDir("🧬/🆔/")) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".🧬.yaml")) {
      const filePath = `🧬/🆔/${dirEntry.name}`;
      const agentData = await loadGlyphYaml(filePath);
      const agentId = (agentData['🧬'] && agentData['🧬']['🜁']) || dirEntry.name;
      glyphs.agents[agentId] = agentData;
      console.log(`Loaded agent: ${filePath}`);
    }
  }

  // Load ability instances from 🧬/👼/
  for await (const dirEntry of Deno.readDir("🧬/👼/")) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".👼.yaml")) {
      const filePath = `🧬/👼/${dirEntry.name}`;
      const abilityData = await loadGlyphYaml(filePath);
      const abilityId = (abilityData['👼'] && abilityData['👼']['🜁']) || dirEntry.name;
      glyphs.abilities[abilityId] = abilityData;
      console.log(`Loaded ability: ${filePath}`);
    }
  }

  return glyphs;
}

// Example usage (for testing, will be removed or moved later)
if (import.meta.main) {
  loadAllGlyphs()
    .then((data) => {
      console.log("\n--- All Glyphs Loaded ---");
      console.log("Sigma Core Types:", Object.keys(data.sigmaCore?.types || {}));
      console.log(
        "Glyph Set Conceptuals:",
        Object.keys(data.glyphSet || {}).filter((key) =>
          (data.glyphSet as any)[key] && (data.glyphSet as any)[key].hasOwnProperty('suggested_type')
        ).join(', ')
      );
      console.log(
        "Glyph Set Structurals:",
        Object.keys(data.glyphSet || {}).filter((key) =>
          (data.glyphSet as any)[key] && (data.glyphSet as any)[key].hasOwnProperty('schema')
        ).join(', ')
      );
      console.log("Loaded Agents:", Object.keys(data.agents));
      console.log("Loaded Abilities:", Object.keys(data.abilities));
    })
    .catch((error) => console.error("Error loading glyphs:", error));
}
