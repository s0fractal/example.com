// benchmark.ts
// Compares the "cost" of λ⁷ execution vs. native V8 execution.

import { λ7Runtime } from "./runtime.ts";
import { generateFactorialDerivation } from "./factorial.ts";
import { Derivation } from "./runtime.ts";

function print_header(title: string) {
    console.log("\n" + "=".repeat(60));
    console.log(`🚀 ${title}`);
    console.log("=".repeat(60));
}

// --- Traditional Implementation ---
function nativeFactorial(n: number): number {
    if (n < 1) {
        return 1;
    }
    return n * nativeFactorial(n - 1);
}

// --- Main Benchmark ---
async function main() {
    const N = 10; // The number to calculate factorial for.
    print_header(`Benchmark: Factorial of ${N}`);

    // --- λ⁷ Execution ---
    console.log("\n--- 1. λ⁷ Execution ---");
    const runtime = new λ7Runtime();
    const derivation = generateFactorialDerivation(N);
    
    const λ7_startTime = performance.now();
    const λ7_result = await runtime.eval(derivation);
    const λ7_endTime = performance.now();

    // --- Native Execution ---
    console.log("\n--- 2. Native TypeScript Execution ---");
    const native_startTime = performance.now();
    const native_result = nativeFactorial(N);
    const native_endTime = performance.now();

    // --- Cost Analysis ---
    print_header("Cost Analysis");
    
    // a) Time Cost
    const λ7_time = (λ7_endTime - λ7_startTime).toFixed(4);
    const native_time = (native_endTime - native_startTime).toFixed(4);
    
    // b) "Instruction" Cost
    // @ts-ignore: Accessing private property for benchmark analysis
    const λ7_steps = runtime.eval_steps; 
    // For native, we can count recursive calls.
    const native_steps = N > 0 ? N : 1; 

    // c) Storage Cost
    const λ7_storage_cost = JSON.stringify(derivation).length;
    const native_storage_cost = nativeFactorial.toString().length;

    console.table({
        "λ⁷ (Sigma Calculus)": {
            "Result": λ7_result,
            "Time (ms)": λ7_time,
            "Execution Steps": `${λ7_steps} (stack operations)`,
            "Storage (bytes)": λ7_storage_cost,
        },
        "Native (TypeScript/V8)": {
            "Result": native_result,
            "Time (ms)": native_time,
            "Execution Steps": `${native_steps} (recursive calls)`,
            "Storage (bytes)": native_storage_cost,
        },
    });

    console.log("\nAnalysis:");
    console.log(`- Time: Native execution is significantly faster for this simple task, as expected.`);
    console.log(`- Storage: The λ⁷ derivation is a pure data structure. Note its size compared to the function's source code.`);
    console.log(`- Steps: λ⁷ requires more low-level steps, but these steps are uniform and simple (push/pop/apply), which is ideal for a specialized processor (or GPU).`);
}

if (import.meta.main) {
    await main();
}
