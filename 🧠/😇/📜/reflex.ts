/**
 * @file reflex.ts
 * @description The core logic (reflex) for the Schema Guardian (📜) 😇.
 * This 😇 is responsible for ensuring the consistency and optimization of
 * all 📓.yaml (schema) files across the system, based on the glyph dictionary (🧬).
 */

import { parse, stringify } from "std/yaml/mod.ts";
import { join } from "std/path/mod.ts";
import { walk } from "std/fs/mod.ts";

// --- Type Definitions (moved from λ/sigma.ts as it was deleted) ---
export interface Sigma🧬 {
  id: string; // 🧬://...
  kind: SigmaKind; // 😇|morphism|module|...
  🧭: Sigma🧭;
  state: SigmaState;
  links: SigmaLink[];
  io: SigmaIO;
  spec: SigmaSpec;
}

export type SigmaKind =
  | "😇"
  | "morphism"
  | "module"
  | "directory"
  | "repo"
  | "glyph"
  | "pattern"
  | "🧬"
  | "🧭"
  | "sim";

export interface Sigma🧭 {
  goal: string;
  role: string;
  conditions: string[];
  provides: string[];
  requires: string[];
}

export interface SigmaState {
  energy: number;
  trust: number;
  health: number;
  last_updated: number;
  metrics: Record<string, number>;
}

export interface SigmaLink {
  rel: string;
  ref: string; // 🧬://...
}

export interface SigmaIO {
  input: SigmaIOField[];
  output: SigmaIOField[];
}

export interface SigmaIOField {
  name: string;
  type: string;
}

export interface SigmaSpec {
  schema: string;
  types: Record<string, any>;
  constraints: string[];
  vars?: Record<string, any>;
}
// --- End Type Definitions ---

const REPO_ROOT = Deno.cwd();

export async function reflex(angel🧬: Sigma🧬): Promise<void> {
  console.log(`📜 Schema Guardian 😇: Executing reflex for ${angel🧬.id}`);

  const glyphDictionary = await loadGlyphDictionary();
  const schemaFilePaths = await getAllSchemaFilePaths();

  for (const schemaFilePath of schemaFilePaths) {
    console.log(`📜 Schema Guardian 😇: Processing schema ${schemaFilePath}`);
    const currentSchemaContent = await Deno.readTextFile(schemaFilePath);
    let currentSchema: any;
    try {
      currentSchema = parse(currentSchemaContent);
    } catch (e) {
      console.error(`❌ Schema Guardian 😇: Failed to parse ${schemaFilePath}: ${e.message}`);
      continue;
    }

    const optimizedSchema = glyphifySchemaKeys(currentSchema, glyphDictionary);

    if (stringify(optimizedSchema) !== stringify(currentSchema)) {
      await Deno.writeTextFile(schemaFilePath, stringify(optimizedSchema));
      console.log(`✅ Schema Guardian 😇: Optimized ${schemaFilePath}`);
    } else {
      console.log(`⚪ Schema Guardian 😇: No changes for ${schemaFilePath}`);
    }
  }

  console.log(`📜 Schema Guardian 😇: Reflex execution complete.`);
}

/**
 * Loads all glyph definitions from the 🧬 directory and builds a map from
 * human-readable name to glyph symbol.
 * @returns {Map<string, string>} A map where key is glyph.name (e.g., "type") and value is glyph.symbol (e.g., "🗃️").
 */
async function loadGlyphDictionary(): Promise<Map<string, string>> {
  const glyphsMap = new Map<string, string>();
  const glyphsDirPath = join(REPO_ROOT, "🧬");

  for await (const entry of walk(glyphsDirPath, {
    maxDepth: 2, // 🧬/<glyph_symbol>/🧬.yaml
    includeDirs: false,
    exts: [".yaml"],
  })) {
    if (entry.name === "🧬.yaml" && entry.path.includes(glyphsDirPath)) {
      const glyphDefinitionContent = await Deno.readTextFile(entry.path);
      let glyphDefinition: any;
      try {
        glyphDefinition = parse(glyphDefinitionContent);
      } catch (e) {
        console.error(`❌ Schema Guardian 😇: Failed to parse glyph definition ${entry.path}: ${e.message}`);
        continue;
      }

      if (glyphDefinition && glyphDefinition.glyph && glyphDefinition.glyph.name && glyphDefinition.glyph.symbol) {
        glyphsMap.set(glyphDefinition.glyph.name, glyphDefinition.glyph.symbol);
      } else {
        console.warn(`⚠️ Schema Guardian 😇: Glyph definition ${entry.path} is missing 'glyph.name' or 'glyph.symbol'.`);
      }
    }
  }
  return glyphsMap;
}

/**
 * Finds all 📓.yaml files in the repository.
 * @returns {Promise<string[]>} An array of absolute paths to schema files.
 */
async function getAllSchemaFilePaths(): Promise<string[]> {
  const schemaFilePaths: string[] = [];
  for await (const entry of walk(REPO_ROOT, {
    includeDirs: false,
    exts: [".yaml"],
    match: [/📓\.yaml$/], // Match only files named 📓.yaml
  })) {
    schemaFilePaths.push(entry.path);
  }
  return schemaFilePaths;
}

/**
 * Recursively traverses a schema object and replaces ASCII keys with their glyph counterparts.
 * @param {any} schema The schema object to glyphify.
 * @param {Map<string, string>} glyphDictionary A map from human-readable name to glyph symbol.
 * @returns {any} The glyphified schema object.
 */
function glyphifySchemaKeys(schema: any, glyphDictionary: Map<string, string>): any {
  if (typeof schema !== "object" || schema === null) {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map(item => glyphifySchemaKeys(item, glyphDictionary));
  }

  const newSchema: any = {};
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      // Handle special meta-properties that start with $
      if (key.startsWith("$")) {
        newSchema[key] = glyphifySchemaKeys(schema[key], glyphDictionary);
      } else {
        const glyph = glyphDictionary.get(key);
        const newKey = glyph || key; // Use glyph if found, otherwise keep original key
        newSchema[newKey] = glyphifySchemaKeys(schema[key], glyphDictionary);
      }
    }
  }
  return newSchema;
}