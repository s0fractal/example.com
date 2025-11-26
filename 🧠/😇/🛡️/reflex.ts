/**
 * @file reflex.ts
 * @description The core logic (reflex) for the Guardian (🛡️) 😇.
 * This script enforces the M0 Beacon (Holographic Identity) principle.
 */

import { expandGlob } from "std/fs/expand_glob.ts";
import { parse } from "std/yaml/parse.ts";
import { relative } from "std/path/mod.ts";

interface CheckResult {
  file: string;
  status: "ok" | "error";
  message: string;
}

/**
 * Extracts the value of the $path property from a file's content.
 * This version first attempts to parse YAML frontmatter, then falls back
 * to parsing the entire file.
 * @param content The string content of the file.
 * @returns The value of the $path property, or null if not found.
 */
function getEmbeddedPath(content: string): string | null {
  // 1. Try to parse as Markdown frontmatter first.
  const match = content.match(/^---\s*([\s\S]+?)\s*---/);
  if (match && match[1]) {
    try {
      const frontmatter = parse(match[1]) as Record<string, unknown>;
      if (frontmatter && typeof frontmatter === 'object' && '$path' in frontmatter) {
        return String(frontmatter['$path']);
      }
    } catch (fmError) {
      // It looked like frontmatter but wasn't valid YAML.
      // Fall through to a full-file parse just in case of weird formatting.
    }
  }

  // 2. If no valid frontmatter was found, try parsing the whole file as YAML.
  try {
    const data = parse(content) as Record<string, unknown>;
    if (data && typeof data === 'object' && '$path' in data) {
      return String(data['$path']);
    }
  } catch (e) {
    // If we get here, the file is neither valid YAML nor has valid frontmatter.
    return null;
  }

  return null;
}


async function checkM0Beacon(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const globPattern = "**/*.{🧬.yaml,📓.yaml,md}";
  const projectRoot = Deno.cwd();

  const globOptions = {
    root: projectRoot,
    globstar: true,
    exclude: [".git"],
  };

  for await (const entry of expandGlob(globPattern, globOptions)) {
    if (!entry.isFile) {
      continue;
    }

    const content = await Deno.readTextFile(entry.path);
    const projectRelativePath = "example.com/" + relative(projectRoot, entry.path).replaceAll('\\', '/');

    if (content.trim() === "") {
      continue;
    }

    const embeddedPath = getEmbeddedPath(content);

    if (embeddedPath === null) {
      results.push({
        file: projectRelativePath,
        status: "error",
        message: "M0 Beacon check failed: '$path' property not found.",
      });
    } else if (embeddedPath !== projectRelativePath) {
      results.push({
        file: projectRelativePath,
        status: "error",
        message: `M0 Beacon check failed: Path mismatch.
  - Expected: "${projectRelativePath}"
  - Found:    "${embeddedPath}"`,
      });
    } else {
      results.push({
        file: projectRelativePath,
        status: "ok",
        message: "M0 Beacon compliant.",
      });
    }
  }

  return results;
}

if (import.meta.main) {
  console.log("🛡️  Guardian 😇: Checking M0 Beacon compliance...");

  checkM0Beacon().then((results) => {
    const errors = results.filter((r) => r.status === "error");

    console.log("\n----------------------------------------");
    if (errors.length === 0) {
      console.log(`✅  Success! All ${results.length} checked files are M0 Beacon compliant.`);
    } else {
      console.error(`❌  Failure! Found ${errors.length} non-compliant file(s):\n`);
      for (const error of errors) {
        console.error(`FILE: ${error.file}`);
        console.error(`  └─ ${error.message.replace(/\n/g, "\n     ")}\n`);
      }
      Deno.exit(1);
    }
    console.log("----------------------------------------");
  }).catch(err => {
    console.error("A critical error occurred during the M0 Beacon check:", err);
    Deno.exit(1);
  });
}
