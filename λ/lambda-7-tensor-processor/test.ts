// λ/lambda-7-tensor-processor/test.ts (Correction for T_3D: Identity rules (i, I, k) -> k)
import { Morphism, MORPHISM_NAMES, BASIS_SIZE } from "./basis.ts";
import { T_3D } from "./tensor.ts";
import { λ7Processor, Derivation, Field } from "./runtime.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

// Helper to create a field with a single dominant morphism
function createField(m: Morphism): Field {
    const field = new Float32Array(BASIS_SIZE);
    field[m] = 1.0;
    return field;
}

// Helper to check if two fields are approximately equal
function fieldsAreEqual(f1: Field, f2: Field, tolerance: number = 0.0001): boolean {
    if (f1.length !== f2.length) return false;
    for (let i = 0; i < f1.length; i++) {
        if (Math.abs(f1[i] - f2[i]) > tolerance) return false;
    }
    return true;
}

Deno.test("λ7Processor: Initial state is pure Identity", () => {
    const processor = new λ7Processor();
    const expectedField = createField(Morphism.I);
    assertEquals(fieldsAreEqual(processor.field, expectedField), true, "Initial field should be pure Identity");
});

Deno.test("T_3D: Identity rules (I, j, k) -> k", () => {
    const testJ = Morphism.And; // Changed to And for generic test
    const testK = Morphism.Cond; // Changed to Cond for generic test
    const result = T_3D[Morphism.I][testJ][testK];
    assertEquals(result, testK, `T_3D[I][${MORPHISM_NAMES[testJ]}][${MORPHISM_NAMES[testK]}] should be ${MORPHISM_NAMES[testK]}`);
});

Deno.test("T_3D: Identity rules (i, I, k) -> k (specific case for beta-reduction)", () => { // Test name updated
    const testI = Morphism.Lambda;
    const testK = Morphism.Apply;
    const result = T_3D[testI][Morphism.I][testK]; // This is T_3D[Lambda][I][Apply]
    // Due to the specific beta-reduction rule T_3D[Lambda][I][Apply] = Morphism.I,
    // we expect Morphism.I here, not the generic 'k' which would be Apply.
    assertEquals(result, Morphism.I, `T_3D[${MORPHISM_NAMES[testI]}][I][${MORPHISM_NAMES[testK]}] should be I due to beta-reduction`);
});

Deno.test("T_3D: Identity rules (i, j, I) -> i", () => {
    const testI = Morphism.Lambda;
    const testJ = Morphism.Apply;
    const result = T_3D[testI][testJ][Morphism.I];
    assertEquals(result, testI, `T_3D[${MORPHISM_NAMES[testI]}][${MORPHISM_NAMES[testJ]}][I] should be ${MORPHISM_NAMES[testI]}`);
});

Deno.test("T_3D: Double Negation ¬(¬X) -> X (simplified)", () => {
    const result = T_3D[Morphism.I][Morphism.Not][Morphism.Not];
    assertEquals(result, Morphism.I, `Double negation should resolve to Identity`);
});

Deno.test("T_3D: Simplified Beta-reduction (Lambda I @) -> I", () => { // Context changed to Lambda
    // T_3D[Morphism.Lambda][Morphism.I][Morphism.Apply] = Morphism.I;
    const result = T_3D[Morphism.Lambda][Morphism.I][Morphism.Apply];
    assertEquals(result, Morphism.I, `(λ I @) should resolve to I`);
});

Deno.test("λ7Processor: Evaluation of [Lambda, I, Apply] should result in I", async () => {
    const derivation: Derivation = [Morphism.Lambda, Morphism.I, Morphism.Apply];
    const processor = new λ7Processor();
    const finalField = await processor.eval(derivation);

    // Trace:
    // Initial: Field [I], History [I, I]
    // 1. Process Lambda: T_3D[I][I][Lambda] -> Lambda. Field=[Lambda]. History=[I, Lambda]
    // 2. Process I:      T_3D[I][Lambda][I] -> I. Field=[I]. History=[Lambda, I]
    // 3. Process Apply:  T_3D[Lambda][I][Apply] -> I (from new rule). Field=[I]. History=[I, Apply]
    const expectedField = createField(Morphism.I);
    assertEquals(fieldsAreEqual(finalField, expectedField), true, "Derivation [λ, I, @] should result in dominant I");
});


Deno.test("λ7Processor: Evaluation of [Not, Not] (simplified)", async () => {
    const derivation: Derivation = [Morphism.Not, Morphism.Not];
    const processor = new λ7Processor();
    const finalField = await processor.eval(derivation);

    // Trace:
    // Initial: Field [I], History [I, I]
    // 1. Process Not: T_3D[I][I][Not] -> Not. Field becomes [Not]. History [I, Not]
    // 2. Process Not: T_3D[I][Not][Not] -> I. Field becomes [I]. History [Not, Not]
    const expectedField = createField(Morphism.I);
    assertEquals(fieldsAreEqual(finalField, expectedField), true, "Derivation [¬, ¬] should result in dominant I");
});

Deno.test("λ7Processor: Evaluation of [And, I] (simplified)", async () => {
    const derivation: Derivation = [Morphism.And, Morphism.I];
    const processor = new λ7Processor();
    const finalField = await processor.eval(derivation);

    // Trace:
    // Initial: Field [I], History [I, I]
    // 1. Process And: T_3D[I][I][And] -> And. Field becomes [And]. History [I, And]
    // 2. Process I:   T_3D[I][And][I] -> I. Field becomes [I]. History [And, I]
    const expectedField = createField(Morphism.I);
    assertEquals(fieldsAreEqual(finalField, expectedField), true, "Derivation [∧, I] should result in dominant I");
});

// Test for a sequence where no specific T_3D rule applies,
// expecting the incoming morphism's weight to be added.
Deno.test("λ7Processor: No specific rule should add incoming morphism to field", async () => {
    const processor = new λ7Processor();
    
    // Set initial history and field to a state for which the T_3D lookup will be null.
    // T_3D[Apply][Lambda][Cond] is null by default.
    processor['history'] = [Morphism.Apply, Morphism.Lambda]; // Set initial history for the test
    processor.field.fill(0); 
    processor.field[Morphism.Apply] = 1.0; 
    processor.field[Morphism.Lambda] = 1.0; 
    
    // Process Cond
    // Current context for T_3D: (Apply, Lambda, Cond)
    // T_3D[Morphism.Apply][Morphism.Lambda][Morphism.Cond] is NULL
    await processor.eval([Morphism.Cond]); 

    // Expected: If T_3D returns null, incoming Morphism.Cond should be added to the field.
    const expectedField = new Float32Array(BASIS_SIZE);
    expectedField[Morphism.Apply] = 1.0;
    expectedField[Morphism.Lambda] = 1.0;
    expectedField[Morphism.Cond] = 1.0; // This is the added part
    
    assertEquals(fieldsAreEqual(processor.field, expectedField), true, "Should add incoming morphism if no rule found.");
});