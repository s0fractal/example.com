// runtime.ts
import { Morphism, BASIS_SIZE, MORPHISM_NAMES } from "./basis.ts";

// --- Core Types ---

/**
 * A SigmaMorphism can be a base morphism, a primitive value,
 * or a nested derivation (representing a function body or block).
 */
export type SigmaMorphism =
  | Morphism
  | { op: "PRIM"; val: unknown }
  | { op: "DERIV"; val: Derivation };

export type Derivation = SigmaMorphism[];

// The state of the computational field.
export type Field = Float32Array;

// --- Primitive Functions (Recognized by the Runtime) ---
// These are the "CPU instructions" our λ⁷ machine understands.
const PRIMITIVE_FNS: Record<string, (...args: any[]) => any> = {
    "isZero": (n: number) => n === 0,
    "subtract": (a: number, b: number) => a - b,
    "multiply": (a: number, b: number) => a * b,
};

/**
 * The λ⁷ Tensor Processor.
 */
export class λ7Runtime {
  public field: Field;
  private eval_steps = 0;
  
  constructor() {
    this.field = new Float32Array(BASIS_SIZE);
    this.field[Morphism.I] = 1.0;
  }

  /**
   * Evaluates a derivation sequence.
   * This is a stack-based interpreter for our λ⁷ calculus.
   */
  async eval(derivation: Derivation): Promise<any> {
    this.eval_steps = 0;
    console.log(`[Runtime] Evaluating derivation...`);
    
    const stack: any[] = [];

    for (const item of derivation) {
        this.eval_steps++;
        if (typeof item === 'object' && item.op === "PRIM") {
            stack.push(item.val);
        } else if (item === Morphism.Apply) {
            const fnIdentifier = stack.pop();
            if (typeof fnIdentifier !== 'string' || !PRIMITIVE_FNS[fnIdentifier]) {
                throw new Error(`Expected a primitive function identifier on the stack for Apply, but got ${fnIdentifier}`);
            }

            const fn = PRIMITIVE_FNS[fnIdentifier];
            const argCount = fn.length;

            if (stack.length < argCount) {
                throw new Error(`Apply (@) for '${fnIdentifier}' requires ${argCount} arguments on the stack, but found ${stack.length}.`);
            }
            
            const args = stack.splice(stack.length - argCount, argCount);
            
            const result = fn(...args);
            stack.push(result);

        } else if (item === Morphism.Cond) {
            if (stack.length < 3) throw new Error("Cond (?) requires 3 arguments on the stack.");
            const elseBranch = stack.pop();
            const thenBranch = stack.pop();
            const condition = stack.pop();
            
            const branchToExecute = condition ? thenBranch : elseBranch;
            if (branchToExecute.op === "DERIV") {
                const result = await this.eval(branchToExecute.val);
                stack.push(result);
            } else {
                stack.push(branchToExecute);
            }
        }
        else {
             stack.push(item); // Push morphisms or unhandled items to the stack
        }
    }

    if (stack.length !== 1) {
        console.warn(`[Runtime] Warning: Stack did not end with a single value. Final stack:`, stack);
    }
    
    console.log(`[Runtime] Evaluation finished in ${this.eval_steps} steps.`);
    return stack[0];
  }
}