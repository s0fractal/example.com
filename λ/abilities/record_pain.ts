import { readJson, writeJson } from "std/jsonc/mod.ts";

// Define the structure for a single pain signal for type safety
interface PainSignal {
  id: string;
  description: string;
  count: number;
  last_occurrence: string; // ISO 8601 string
  details?: Record<string, unknown>; // Use Record<string, unknown> for flexible details object
}

// Define the structure for the ⚡.json file
interface PainFile {
  pain_signals: PainSignal[];
}

/**
 * Implements the 'ability://record-pain' logic.
 * Reads the ⚡.json file, updates pain signals, and writes back.
 * @param input The input arguments for the ability (id, description, details).
 * @returns An object indicating success.
 */
export async function recordPainAbility(input: {
  id: string;
  description: string;
  details?: Record<string, unknown>;
}): Promise<{ success: boolean }> {
  const PAIN_FILE_PATH = "⚡.json";
  let painData: PainFile = { pain_signals: [] };

  try {
    // Attempt to read the existing ⚡.json file
    // Deno.readTextFile and JSON.parse are used as readJson from std/jsonc expects specific format and might fail on empty/malformed
    const fileContent = await Deno.readTextFile(PAIN_FILE_PATH);
    painData = JSON.parse(fileContent) as PainFile;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.warn(`⚡.json not found, creating a new one.`);
      // File not found, use initial empty painData
    } else {
      console.error(`Error reading ⚡.json: ${error.message}`);
      return { success: false };
    }
  }

  const { id, description, details } = input;
  const now = new Date().toISOString();

  const existingPainSignal = painData.pain_signals.find((signal) =>
    signal.id === id
  );

  if (existingPainSignal) {
    existingPainSignal.count++;
    existingPainSignal.last_occurrence = now;
    // Optionally merge or update details if needed, for now just replace
    if (details) {
        existingPainSignal.details = details;
    }
  } else {
    painData.pain_signals.push({
      id,
      description,
      count: 1,
      last_occurrence: now,
      details,
    });
  }

  try {
    // Write the updated pain data back to ⚡.json
    await Deno.writeTextFile(PAIN_FILE_PATH, JSON.stringify(painData, null, 2));
    return { success: true };
  } catch (error) {
    console.error(`Error writing to ⚡.json: ${error.message}`);
    return { success: false };
  }
}

// Example usage for testing (will be removed or moved later)
if (import.meta.main) {
  // Simulate recording some pain
  recordPainAbility({
    id: "test-error-1",
    description: "A simulated error for testing",
    details: {
      component: "CoreReflexLoop",
      severity: "low",
      timestamp: new Date().toISOString(),
    },
  }).then((result) => {
    console.log("Recorded pain (test-error-1):", result.success);
    // Simulate another occurrence of the same pain
    return recordPainAbility({
      id: "test-error-1",
      description: "Another simulated error occurrence",
      details: {
        component: "CoreReflexLoop",
        severity: "medium",
      },
    });
  }).then((result) => {
    console.log("Recorded pain (test-error-1, second time):", result.success);
    // Simulate a new type of pain
    return recordPainAbility({
      id: "new-feature-bug",
      description: "Bug found in a new feature",
      details: {
        module: "GlyphParser",
        version: "0.1",
      },
    });
  }).then((result) => {
    console.log("Recorded pain (new-feature-bug):", result.success);
  }).catch((error) => console.error("Testing recordPainAbility failed:", error));
}
