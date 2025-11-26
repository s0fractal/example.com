// factorial.ts
import { Morphism } from "./basis.ts";
import { Derivation } from "./runtime.ts";

/**
 * This file defines the factorial algorithm as a pure λ⁷ derivation.
 * It's a static data structure that represents the program.
 * 
 * We need to represent:
 * function factorial(n) {
 *   if (isZero(n)) {
 *     return 1;
 *   } else {
 *     return multiply(n, factorial(subtract(n, 1)));
 *   }
 * }
 * 
 * This is a recursive definition, which is tricky. For this prototype,
 * we will "unroll" the recursion manually for a fixed number to create
 * a non-recursive derivation. A true λ⁷ would use a Y-combinator,
 * which is too complex for this step.
 */

// Let's create a derivation for factorial(3)
// 3! = 3 * (2 * (1 * 1))

// The structure will be a sequence of operations in Reverse Polish Notation (stack-based).

// Represents: multiply(3, multiply(2, multiply(1, 1)))
export const factorialOf3_derivation: Derivation = [
    // Innermost call: multiply(1, 1)
    { op: "PRIM", val: 1 },
    { op: "PRIM", val: 1 },
    { op: "PRIM", val: "multiply" },
    Morphism.Apply,

    // Middle call: multiply(2, ...)
    { op: "PRIM", val: 2 },
    Morphism.Apply, // Applies multiply to 2 and the result of the previous operation

    // Outermost call: multiply(3, ...)
    { op: "PRIM", val: 3 },
    Morphism.Apply, // Applies multiply to 3 and the result
];

// This is a more complex, but still unrolled, version for factorial(4)
// to show the pattern.
export const factorialOf4_derivation: Derivation = [
    { op: "PRIM", val: 1 },
    { op: "PRIM", val: 1 },
    { op: "PRIM", val: "multiply" },
    Morphism.Apply,

    { op: "PRIM", val: 2 },
    Morphism.Apply,

    { op: "PRIM", val: 3 },
    Morphism.Apply,

    { op: "PRIM", val: 4 },
    Morphism.Apply,
];

/**
 * A more programmatic way to generate the unrolled derivation.
 * This is a "compiler" from a number to a λ⁷ derivation.
 */
export function generateFactorialDerivation(n: number): Derivation {
    if (n < 1) {
        return [{ op: "PRIM", val: 1 }];
    }
    
    let derivation: Derivation = [
        { op: "PRIM", val: 1 }, // Base case
    ];

    for (let i = 1; i <= n; i++) {
        derivation.push({ op: "PRIM", val: i });
        derivation.push(Morphism.Apply);
    }
    // We also need to push the multiply function itself onto the stack repeatedly.
    // The stack machine is a bit tricky. Let's rethink the structure for our simple machine.

    // A simpler RPN for `(1 * 2) * 3` is `1 2 * 3 *`
    
    if (n < 1) return [{ op: "PRIM", val: 1 }];

    let rpn_derivation: Derivation = [{ op: "PRIM", val: 1 }];

    for (let i = 2; i <= n; i++) {
        rpn_derivation.push({ op: "PRIM", val: i });
        rpn_derivation.push({ op: "PRIM", val: "multiply" });
        rpn_derivation.push(Morphism.Apply);
    }
    
    return rpn_derivation;
}
