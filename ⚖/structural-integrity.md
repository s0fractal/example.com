---
$path: "example.com/⚖/structural-integrity.md"
---
# Principle: Structural Integrity & Layout Specification

**Core Idea:** An atom's schema should not only define the structure of its data but also the structure of its physical environment (the directory that contains it). This makes the system's topology self-validating.

---

## The Rule

A `🧬.yaml` file for an atom that is also a directory (e.g., `kind: repo`, `kind: morphism`, `kind: 😇`) can contain an optional `layout` property within its `spec` block.

This `layout` object defines the expected file and directory structure within the atom's containing folder.

### `spec.layout` Structure:

```yaml
spec:
  # ... other spec properties
  layout:
    # An array of glob patterns for allowed files.
    files:
      - "🧬.yaml"
      - "📓.yaml"
      - "README.md"
      - "*.ts" # Allows for any TypeScript files
    
    # An array of glob patterns for allowed directories.
    dirs:
      - "sub-folder/"
      - "another-sub-folder/**" # Allows recursive content
      
    # If true, no other files or directories are allowed besides
    # those matching the 'files' and 'dirs' patterns.
    strict: true
```

## Enforcement (The Topology 😇)

This principle is to be enforced by a dedicated 😇, the **"Topology Guardian"** (or a similar name).

**Algorithm:**

1. The 😇 finds all `🧬.yaml` files in the repository.
2.  For each seed that has a `spec.layout` property, it performs a check on its containing directory.
3.  It lists the actual files and sub-directories.
4.  It compares the actual contents against the `files` and `dirs` glob patterns.
5.  If `strict: true` is set, it flags any non-matching entries as "structural errors" or "rogue files".
6.  These errors can trigger a "pain signal", leading to either automated cleanup or a notification.

## Implications

-   **Self-Validating Structure:** The repository's structure is no longer just a convention; it's a testable and enforceable rule.
-   **Prevents "Stray Files":** Prevents temporary or auto-generated files from polluting the clean, atomic structure of the system.
-   **Clearer Intent:** The `layout` property explicitly declares how an atom is expected to be composed, making the system easier to understand.