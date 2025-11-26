---
$path: "example.com/⚖/atomic-containment.md"
---
# Principle: Atomic Containment & Non-Redundant Naming

**Core Idea:** The identity of an "atom" is defined by its containing folder. The files within that folder should describe aspects of the atom, not repeat its name. This maximizes signal and adheres to the principle of Information Density.

---

## The Rule

If a directory represents a conceptual atom and is named with a unique identifier (especially a glyph, e.g., `🆔`), then the files it contains must have generic, functional names.

**INCORRECT (Redundant):**
```
/🆔
  ├─ 🆔.seed.yaml
  └─ 🆔.schema.yaml
```
*Reasoning: The `🆔` prefix is noise. We already know we are inside the `🆔` atom.*

**CORRECT (Dense & Functional):**
```
/🆔
  ├─ seed.yaml
  ├─ schema.yaml
  └─ README.md
```
*Reasoning: The folder `🆔` provides the context. The files `seed.yaml`, `schema.yaml`, and `README.md` clearly describe their function within that context.*

## Implications

1.  **Clarity:** The role of each file is immediately obvious from its name.
2.  **Scalability:** This pattern is fractal and can be repeated for any atom (`agent`, `morphism`, `repo`) without modification.
3.  **Reduced Noise:** It eliminates redundant prefixes, making paths cleaner and easier to read for both humans and LLMs.

---

## Implementations & Examples

### 1. Refactoring of the Identity (🆔) Morphism

-   **Decision:** The initial file structure for the `identity` morphism will be refactored to follow this principle.
-   **Refactoring Steps:**
    -   `.../🆔/🆔.seed.yaml` → `.../🆔/seed.yaml`
    -   `.../🆔/🆔.schema.yaml` → `.../🆔/schema.yaml`
    -   `.../🆔/🆔.md` → `.../🆔/README.md`
-   **Implementation:**
    -   See commit history related to the refactoring of the `🆔` atom.
    -   Internal file contents (e.g., `$path` fields) must be updated to reflect these new canonical paths.