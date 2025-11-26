---
$path: "example.com/⚖/information-density.md"
---
# Principle: Information Density & Signal-to-Noise Ratio

**Core Idea:** Every "token" — be it a filename, a line of code, or a configuration value — must carry the maximum possible semantic weight. We must ruthlessly minimize syntactic and conceptual noise.

## Statement

1.  **Prefer dense formats.** Choose formats that express structure with minimal boilerplate. The signal (the user's intent) must dominate the noise (the syntax).
2.  **Symbols over words.** A single, well-defined glyph (e.g., `🧠`) is superior to a long descriptive name (`nucleus_directory`) when the context is established. It compresses meaning.
3.  **Structure is meaning.** Indentation, co-location, and links are part of the information. A flat list of files is less meaningful than a structured, folded topology.
4.  **No redundant information.** Don't state the obvious. If a file's type is clear from its schema or location, its name doesn't need to repeat it.

---

## Implementations & Examples

### 1. YAML over JSON for Seed Files

-   **Decision:** We use YAML for all `.seed` files.
-   **Reasoning:**
    -   **Density:** YAML's indentation-based structure eliminates the noisy brackets `{}` and commas `,` of JSON.
    -   **Signal/Noise:** The absence of mandatory quotes `"` for keys enhances readability for both humans and LLMs. The data itself becomes the primary signal.
    -   **In-band Documentation:** YAML's support for comments (`#`) allows for metadata and thoughts to co-exist with the data without polluting the parsable structure.
-   **Implementation:**
    -   See: `deno.json` for the YAML parsing dependency.
    -   See: `repo.seed.yaml` for an example instance.