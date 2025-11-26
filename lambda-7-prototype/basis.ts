// basis.ts
// Defines the 7 fundamental morphisms of the λ⁷ calculus.

export enum Morphism {
  I,      // 0: Identity - The neutral element, represents data or a no-op.
  Apply,  // 1: @ - Application, applies a function to an argument.
  Lambda, // 2: λ - Abstraction, creates a function.
  And,    // 3: ∧ - Conjunction, boolean AND.
  Not,    // 4: ¬ - Negation, boolean NOT.
  Cond,   // 5: ? - Conditional, ternary if/else.
  Pair,   // 6: ⊗ - Pairing/Tensor, creates a data structure (tuple/pair).
}

export const BASIS_SIZE = 7;

// For debugging and visualization
export const MORPHISM_NAMES: Record<Morphism, string> = {
  [Morphism.I]: "I",
  [Morphism.Apply]: "@",
  [Morphism.Lambda]: "λ",
  [Morphism.And]: "∧",
  [Morphism.Not]: "¬",
  [Morphism.Cond]: "?",
  [Morphism.Pair]: "⊗",
};
