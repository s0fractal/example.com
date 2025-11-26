// λ/lambda-7-tensor-processor/runtime.ts (Revised applyTensor for single Morphism output from T_3D)
import { Morphism, BASIS_SIZE, MORPHISM_NAMES } from "./basis.ts";
import { T_3D } from "./tensor.ts"; // Import the 3D tensor

// The state of the computational field as a 7D vector.
export type Field = Float32Array;

/**
 * A derivation is a sequence of morphisms.
 * This is simplified for the initial tensor processor.
 */
export type Derivation = Morphism[]; 

export class λ7Processor {
  public field: Field;
  private eval_steps = 0;
  
  // To provide context for 3D tensor, we keep a history of the last two applied morphisms.
  // history[0] is m1 (previous-previous), history[1] is m2 (previous)
  private history: Morphism[] = [Morphism.I, Morphism.I]; 

  constructor() {
    this.field = new Float32Array(BASIS_SIZE);
    // Initialize field to represent a "pure Identity" state
    this.field[Morphism.I] = 1.0; 
  }

  /**
   * Applies the tensor interaction to the current field based on an incoming morphism.
   * This updates the field according to T_3D rules.
   * @param incomingMorphism The morphism currently being processed from the derivation.
   */
  private applyTensor(incomingMorphism: Morphism): void {
    // Extract two context morphisms from history for the 3D tensor lookup
    // m1 = context / previous-previous, m2 = operator / previous
    const m1 = this.history[0]; 
    const m2 = this.history[1]; 

    console.log(`  Applying T_3D[${MORPHISM_NAMES[m1]}][${MORPHISM_NAMES[m2]}][${MORPHISM_NAMES[incomingMorphism]}]...`);

    const resultantMorphism = T_3D[m1][m2][incomingMorphism];

    if (resultantMorphism !== null) {
      // If a specific rule is found, update the field.
      // For a prototype, we'll reset the field and set the dominant resultant morphism.
      this.field.fill(0); // Clear current field to represent new dominant state
      this.field[resultantMorphism] = 1.0; // Set dominant resultant morphism
      console.log(`    Resultant Field (simplified): [${this.field.join(', ')}] (Dominant: ${MORPHISM_NAMES[resultantMorphism]})`);
    } else {
      // If no specific rule, the incoming morphism might just influence the field's weights.
      // For now, if no rule, we'll add the incoming morphism's weight to the field.
      // This means the field accumulates 'energy' from unreduced morphisms.
      this.field[incomingMorphism]++;
      console.log(`    No specific T_3D rule, adding ${MORPHISM_NAMES[incomingMorphism]} to field. Field: [${this.field.join(', ')}]`);
    }

    // Update history for the next tensor application
    this.history[0] = this.history[1]; // Shift m2 to m1 position
    this.history[1] = incomingMorphism; // Set incoming as new m2
  }

  /**
   * Evaluates a derivation sequence by transforming the computational field.
   * This implements Task 6.
   * @param derivation The sequence of morphisms to evaluate.
   * @returns The final state of the computational field.
   */
  async eval(derivation: Derivation): Promise<Field> {
    this.eval_steps = 0;
    console.log(`[Processor] Evaluating derivation...`);
    console.log(`[Processor] Initial Field: [${this.field.join(', ')}]`);
    console.log(`[Processor] Initial History: [${this.history.map(m => MORPHISM_NAMES[m]).join(', ')}]`);

    for (const item of derivation) {
        this.eval_steps++;
        if (typeof item !== 'number' || item >= BASIS_SIZE || item < 0) {
            throw new Error(`Invalid item in derivation: ${item}. Expected a Morphism.`);
        }
        console.log(`[Processor] Step ${this.eval_steps}: Processing Morphism: ${MORPHISM_NAMES[item]}`);
        this.applyTensor(item);
    }
    
    console.log(`[Processor] Evaluation finished in ${this.eval_steps} steps.`);
    return this.field;
  }
}

// Example usage (for testing, will be moved later)
if (import.meta.main) {
    // Example Derivation: (λx.x)(I) -> I
    // Represented as a sequence: [Lambda, I, Apply]
    const derivation: Derivation = [
        Morphism.Lambda,
        Morphism.I,
        Morphism.Apply
    ];

    const processor = new λ7Processor();
    processor.eval(derivation)
        .then(finalField => {
            console.log("\n--- Evaluation Result ---");
            console.log("Final Field:", finalField);
            const dominantMorphism = finalField.indexOf(Math.max(...finalField));
            console.log("Dominant Morphism:", MORPHISM_NAMES[dominantMorphism as Morphism]);
        })
        .catch(error => console.error("Processor error:", error));

    // Optional: print the tensor for inspection
    // printTensor(T_3D); // This is large, only enable for specific debugging
}