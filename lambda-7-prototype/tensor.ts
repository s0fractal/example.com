// tensor.ts
import { Morphism, BASIS_SIZE } from "./basis.ts";

/**
 * This represents a simplified 2D slice of the full Tᵢⱼₖ tensor.
 * It defines the resulting morphism when `Morphism[row]` is followed by `Morphism[col]`.
 * This is a "transition matrix" for our derivation sequence.
 * 
 * T[current_state][next_morphism_in_sequence] -> resulting_state
 */
export const T: (Morphism | null)[][] = Array(BASIS_SIZE).fill(null).map(() => Array(BASIS_SIZE).fill(null));

// --- Define the "physics" (interaction rules) ---

// Rule 1: Identity is the neutral element.
// I -> X = X
// X -> I = X
for (let i = 0; i < BASIS_SIZE; i++) {
    T[Morphism.I][i] = i as Morphism;
    T[i][Morphism.I] = i as Morphism;
}

// Rule 2: Double negation: ¬(¬X) -> X
// Not -> Not = I
T[Morphism.Not][Morphism.Not] = Morphism.I;

// Rule 3: Identity Application: (λx.x)(A) -> A.
// The sequence [Lambda, Apply] resolves to Identity.
// Lambda -> Apply = I
T[Morphism.Lambda][Morphism.Apply] = Morphism.I;

// Rule 4: Conditional logic. Applying a condition resolves to the Cond state.
// This is a simplification. A real system would be more complex.
// For now, applying anything to Cond just keeps it in the Cond state, waiting for arguments.
T[Morphism.I][Morphism.Cond] = Morphism.Cond;
T[Morphism.Cond][Morphism.I] = Morphism.Cond; // Applying identity doesn't change it
T[Morphism.Cond][Morphism.Apply] = Morphism.Cond; // Applying args keeps it in Cond state until resolved


// Rule 5: Pairing logic.
// Applying Pair creates a Pair state.
T[Morphism.I][Morphism.Pair] = Morphism.Pair;


// --- Helper function to print the matrix for debugging ---
export function printTensor(tensor: (Morphism | null)[][]) {
    console.log("--- Interaction Tensor T (Transition Matrix) ---");
    let header = "      ";
    // Headers from MORPHISM_NAMES for readability
    const names = ["I", "@", "λ", "∧", "¬", "?", "⊗"];
    for (const name of names) {
        header += `${name}`.padEnd(5);
    }
    console.log(header);
    console.log("    " + "—".repeat(BASIS_SIZE * 5));
    
    tensor.forEach((row, i) => {
        let rowStr = `  ${names[i]} | `;
        row.forEach(val => {
            rowStr += `${val === null ? "." : names[val]}`.padEnd(5);
        });
        console.log(rowStr);
    });
    console.log("-".repeat(header.length));
}