// λ/lambda-7-tensor-processor/factorial.ts (New λ7Processor-compatible)
import { Morphism, MORPHISM_NAMES } from "./basis.ts";
import { λ7Processor, Derivation, Field } from "./runtime.ts";

/**
 * Represents a highly simplified "factorial" derivation for the λ7Processor.
 * This derivation illustrates conditional logic, but does not perform
 * full arithmetic factorial calculation due to the current prototype limitations
 * and the abstract nature of T_3D interactions for number representation.
 *
 * Concept: if N is 0, the derivation leads to I (representing 1).
 * Otherwise, if N > 0, the derivation implies a more complex composition
 * for recursive calls or multiplication.
 */
const factorialDerivation: (n: number) => Derivation = (n: number) => {
    if (n === 0) {
        // If n is 0, the derivation should primarily resolve to Identity (representing 1)
        // This is a simplified path.
        return [Morphism.Cond, Morphism.I, Morphism.I, Morphism.I]; // Cond (true) then I, else I -> I
    } else {
        // If n > 0, for illustration, we'll return a sequence that
        // implies a recursive call or multiplication, using Pair and Apply.
        // This is not a mathematically correct factorial but shows composition.
        return [
            Morphism.Cond, // Conditional for the base case
            Morphism.Not,  // Represents the condition N > 0 (not N=0)
            Morphism.Pair, // To hold (n, factorial(n-1)) conceptually
            Morphism.Apply, // To apply multiplication or function application
            Morphism.Lambda, // To represent the recursive function itself
        ];
    }
};

// Example usage
if (import.meta.main) {
    const n_zero = 0; // Test with N=0
    const derivation_zero = factorialDerivation(n_zero);
    
    console.log(`\n--- Running simplified factorial for N = ${n_zero} ---`);
    console.log("Derivation:", derivation_zero.map(m => MORPHISM_NAMES[m]).join(', '));

    const processor_zero = new λ7Processor();
    processor_zero.eval(derivation_zero)
        .then(finalField => {
            console.log("\n--- Factorial Evaluation Result ---");
            console.log("Final Field:", finalField);
            const dominantMorphism = finalField.indexOf(Math.max(...finalField));
            console.log("Dominant Morphism:", MORPHISM_NAMES[dominantMorphism as Morphism]);
        })
        .catch(error => console.error("Factorial Processor error:", error));

    const n_one = 1; // Test with N=1
    const derivation_one = factorialDerivation(n_one);
    
    console.log(`\n--- Running simplified factorial for N = ${n_one} ---`);
    console.log("Derivation:", derivation_one.map(m => MORPHISM_NAMES[m]).join(', '));

    const processor_one = new λ7Processor();
    processor_one.eval(derivation_one)
        .then(finalField => {
            console.log("\n--- Factorial Evaluation Result ---");
            console.log("Final Field:", finalField);
            const dominantMorphism = finalField.indexOf(Math.max(...finalField));
            console.log("Dominant Morphism:", MORPHISM_NAMES[dominantMorphism as Morphism]);
        })
        .catch(error => console.error("Factorial Processor error:", error));
}