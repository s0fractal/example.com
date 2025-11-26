// λ/lambda-7-tensor-processor/tensor.ts (Simplified T_3D output and rules)
import { Morphism, BASIS_SIZE } from "./basis.ts";

/**
 * The 3D tensor T[i][j][k] defines the dominant resulting morphism
 * when three morphisms interact.
 * T : M x M x M -> M (or null if undefined for this combination).
 *
 * Interpretation: The effect of 'k' on the interaction of 'i' and 'j'.
 * This is a simplification for the prototype.
 */
export const T_3D: (Morphism | null)[][][] = Array(BASIS_SIZE).fill(null).map(() =>
  Array(BASIS_SIZE).fill(null).map(() => Array(BASIS_SIZE).fill(null))
);

// --- Define specific tensor interactions ---

// Default (often implicit): If no specific rule, null.

// Identity (I) interactions:
// Identity is the neutral element.
// T_3D[I][j][k] -> k (I followed by j then k, results in k effectively)
// T_3D[i][I][k] -> k (i followed by I then k, results in k effectively)
// T_3D[i][j][I] -> i (i followed by j then I, means i is dominant in (i.j) interaction)
for (let i = 0; i < BASIS_SIZE; i++) {
  for (let j = 0; j < BASIS_SIZE; j++) {
    T_3D[Morphism.I][i][j] = j as Morphism;
    T_3D[i][Morphism.I][j] = j as Morphism;
    T_3D[i][j][Morphism.I] = i as Morphism;
  }
}

// Logical Operations:
// Double Negation: ¬(¬X) -> X
// T_3D[I][Not][Not] -> I
T_3D[Morphism.I][Morphism.Not][Morphism.Not] = Morphism.I;

// Simplified Beta-reduction: (λx.x)(I) -> I
// This represents: context Lambda, operator I, operand Apply results in I.
// This is the core beta-reduction rule for an identity function application.
T_3D[Morphism.Lambda][Morphism.I][Morphism.Apply] = Morphism.I;


// Helper function (update for 3D)
export function printTensor(tensor: (Morphism | null)[][][]) {
  console.log("--- 3D Interaction Tensor T_3D ---");
  const names = ["I", "@", "λ", "∧", "¬", "?", "⊗"];

  tensor.forEach((plane, i) => {
    console.log(`\nPlane ${names[i]} (first morphism):`);
    let header = "      ";
    for (const name of names) {
      header += `${name}`.padEnd(10); // Adjust padding for array output
    }
    console.log(header);
    console.log("    " + "—".repeat(BASIS_SIZE * 10));

    plane.forEach((row, j) => {
      let rowStr = `  ${names[j]} | `;
      row.forEach(val => {
        rowStr += `${val === null ? "." : names[val]}`.padEnd(10);
      });
      console.log(rowStr);
    });
  });
}