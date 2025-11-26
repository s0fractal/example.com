---
$path: "example.com/README2.md"
---
# Σ-Calculus v0.2 — Formal + Live Runtime (Combined)

> This document is Σ-Calculus v0.2 — a small, self-describing formalism that
> includes both a **minimal formal language** (signatures, rules, derivations,
> operators) and a **practical runtime model** you can implement to observe
> emergence. It keeps the simplicity of the Σ approach while embedding
> Claude/Gemini/Kairos concepts as _rules and fields_ within the calculus.

---

## 0. Design goals (short)

- **Single ontology**: everything is a Signature.
- **Rules-as-physics**: behavior emerges from simple, composable Rules.
- **Self-description**: Σ can describe itself (Signatures & Rules are
  Signatures).
- **Executable**: include an opinionated runtime model (operators) to run Rules
  deterministically.
- **Practical**: minimal TypeScript/Deno prototype-ready semantics included.

---

## 1. Core concepts (recap, formal)

### 1.1 Signature (Σ)

A named typed record describing a kind of entity.

```yaml
sig: Name
fields:
  k1: Type1
  k2: Type2
```

`Type` may be primitive or a reference to another `sig` (by name). Signatures
are first-class values.

### 1.2 Rule (ρ)

A pure transformation: inputs → outputs.

```yaml
rule: Name
input:
  - SigA
  - SigB?
output:
  - SigC
transform:
  fieldExpr: expression
constraints:
  - condition
```

A Rule has an identifier and deterministic semantics. Rules can be composed.

### 1.3 Derivation (δ)

A recorded application of a Rule to concrete Signature instances.

```yaml
derive:
  rule: RuleName
  using:
    - SigInstanceA
    - SigInstanceB
  result: SigInstanceC
  meta: { timestamp, actor }
```

Derivations are persisted (immutable). They form the execution trace.

### 1.4 Operator (Ω)

A runtime primitive that applies Rules across a Graph of Signatures. Operators
are procedural but deterministic; examples: `ApplyRule`, `Monitor`, `Prune`.

```yaml
operator: ApplyRule
params:
  rule: RuleName
  inputs: [refs]
```

Operators can be implemented by a small runtime.

---

## 2. Language: minimal formal grammar (informal BNF)

```
<document> ::= <definition>*
<definition> ::= <sig_def> | <rule_def> | <derive_def>
<sig_def> ::= 'sig:' <IDENT> '
' 'fields:' <field_list>
<rule_def> ::= 'rule:' <IDENT> '
' 'input:' <sig_list> '
' 'output:' <sig_list> '
' 'transform:' <expr_map>
<derive_def> ::= 'derive:' <mapping>
```

Expressions in `transform` are simple functional expressions referencing input
fields and helper primitives. (v0.2 uses a small expression language — see
appendix.)

---

## 3. Built-in primitive Signatures (v0.2)

These provide the runtime substrate mapping to Git concepts.

```yaml
sig: File
fields:
  path: String
  content: Blob
  meta: Map<String,Any>

sig: Commit
fields:
  sha: String
  parent: Commit?
  tree: Map<String,String> # path -> blob-hash
  meta: Map<String,Any>

sig: Branch
fields:
  name: String
  head: Commit

sig: Rule
fields:
  name: String
  input: List<String> # sig names
  output: List<String>
  transform: Any # serialized expression
```

All signatures themselves can be represented with `sig: Signature` and stored as
data.

---

## 4. Example rule: BranchPerFile (formal)

```yaml
rule: BranchPerFile
input:
  - File
output:
  - Branch
transform:
  name: concat("file/", normalize(File.path))
  head:
    sig: Commit
    parent: null
    tree: { File.path: storeBlob(File.content) }
    meta: { created_by: "BranchPerFile" }
constraints:
  - unique_by: File.path
```

Semantics: given a `File` instance, produce a `Branch` instance with a `Commit`
whose `tree` contains the file. The runtime must ensure `unique_by: File.path`
across repository branches; if violation, apply configured enforcement
(warn/create/refuse).

---

## 5. Operators and runtime model (v0.2 opinionated)

This section defines a tiny runtime you can implement in Deno/TS to execute the
calculus deterministically.

### 5.1 Runtime invariants

- Single-writer per derivation (atomic commit of a derivation record).
- Operators are deterministic functions of inputs + rule + runtime state.
- All state changes are recorded as Derivations (immutable).

### 5.2 Primitive Operators (Ω)

- `ApplyRule(ruleName, inputs, ctx)`: evaluates `transform` expression and emits
  a Derivation + persistent output signatures.
- `EnforceConstraint(ruleName, derivation, ctx)`: checks constraints and yields
  enforcement actions.
- `Monitor(predicate, action)`: event-based operator (e.g., harvest pain
  accumulation triggers spawn).
- `GarbageCollect(policy, ctx)`: prunes objects per policy (moves to Graveyard
  signature).

### 5.3 Execution loop (simplified)

1. Scheduler picks pending `ApplyRule` tasks (e.g., Files changed).
2. Load input Signature instances (from index/store).
3. Execute `transform` to produce output instances.
4. Validate constraints.
5. Persist Derivation record (immutable).
6. Optionally run Monitor rules (spawn agents, update karma/fuel).

The runtime uses a small persistent store (LevelDB/IndexedDB/Git objects) to
save instances and derivations.

---

## 6. Integrating Claude/Gemini/Kairos ideas as Rules and Fields

v0.2 shows how the prior triad maps into Σ:

- **Compression (Claude)** → `rule: CompressToDerivation` and `sig: Derivation`
  (field `derivation_chain`).
- **Execution (Gemini)** → `operator: BetaReduce` and rules: `Application`,
  `Abstraction`, `Variable` (mapped to Commits).
- **Metabolism (Kairos)** → fields on Signatures: `mass`, `fuel`, `karma`; plus
  rules: `DeductFuel`, `Harvest`, `PruneDead`.

All are ordinary Rules/Fields in Σ. They interact by composition.

---

## 7. Concrete executable example: BranchPerFile operator (prototype semantics)

This is a minimal TypeScript/Deno sketch showing how `BranchPerFile` becomes an
`ApplyRule` operation that writes Git state.

**Behavior:** when a File instance with `meta.enforcement = "strict"` is
applied, runtime creates branch `file/<normalized-path>` if absent and writes a
commit whose tree contains the file blob.

**Pseudo-TS contract (runtime):**

```ts
// Apply BranchPerFile - high level
async function applyBranchPerFile(file: File, ctx) {
  const branchName = `file/${normalize(file.path)}`;
  if (await branchExists(branchName)) {
    // constraint: unique_by -> if branch exists, either reuse head or raise
    if (ctx.enforcement === "strict") throw new Error("branch exists");
    if (ctx.enforcement === "suggest") {
      return { action: "warn", branch: branchName };
    }
  }
  const blobHash = await storeBlob(file.content);
  const commitSha = await createCommit({
    tree: { [file.path]: blobHash },
    meta: { created_by: "BranchPerFile" },
  });
  await createBranch(branchName, commitSha);
  return { branch: branchName, head: commitSha };
}
```

This function is an `ApplyRule` for `BranchPerFile`. It persists a Derivation
record and writes Git objects via plumbing.

---

## 8. Rule composition & higher-order rules

Rules can be combined to produce new Rules. Example:
`GuardedBranchPerFile = Compose(ValidatePath, BranchPerFile)` where
`ValidatePath` ensures path isn't in `.gitignore` and `Compose` ensures
atomicity.

Higher-order rules are first-class and may be stored as `sig: Rule` instances.

---

## 9. Emergence experiments (recipes)

Start with a small rule set (10–20 rules) and run the runtime; instrument
metrics:

- spawn_rate (new branches per minute)
- average_rule_application_time
- fuel_balance over epoch
- entropy of signature distribution

Example experiments: repeated errors → spawn Angel rule when count > threshold;
density folding rule: if files in dir > N, create Folder-Branch rule.

---

## 10. Appendix: expression language for `transform` (v0.2)

A very small expression DSL to compute fields in `transform`:

- `literal` (strings/numbers)
- `+` concatenation
- `normalize(x)` path normalization
- `storeBlob(content)` returns blob-hash
- `ref(name)` reference lookup
- `if(cond, a, b)` conditional

This DSL is intentionally tiny to keep runtime simple and auditable.

---

## 11. Migration path & practical notes

- Start by implementing the runtime that executes `BranchPerFile` +
  `ApplyRule` + `Monitor`.
- Use Git plumbing for persistence (commits as derivation records).
- Keep a separate metadata store for Signatures index (LevelDB/IndexedDB).
- After stability, add Claude-style `CompressToDerivation` rule and a
  `Regenerate` operator.

---

## 12. Next actions (I can do for you)

- Generate a Deno/TS micro-prototype: `runtime.ts`, `store.ts`,
  `rules/branch-per-file.yaml` + tests.
- Implement `applyBranchPerFile` as real code that uses `git` plumbing.
- Add a small CLI to feed File instances and observe created Branch derivations.

---

If you want, I will now add the minimal Deno/TS prototype files into this canvas
(`runtime.ts`, `store.ts`, `rules/branch-per-file.yaml`, `test/*.ts`) and
prepare a ZIP you can run locally.

Which next action do you prefer?

- **A**: Generate Deno/TS micro-prototype files now.
- **B**: Expand formalism (type system, proofs, rule algebra).
- **C**: Add glyph compression mapping (map signatures→glyphs).

(Choose A/B/C or ask to modify.)