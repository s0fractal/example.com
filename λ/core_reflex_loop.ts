import { loadAllGlyphs } from "./utils/glyph_loader.ts";
import { recordPainAbility } from "./abilities/record_pain.ts";
import { λ7Processor, Derivation, Field } from "./lambda-7-tensor-processor/runtime.ts"; // Import λ7Processor and Derivation
import { Morphism, MORPHISM_NAMES } from "./lambda-7-tensor-processor/basis.ts";


// Define an interface for the loaded glyph data to improve type safety
interface LoadedGlyphs {
  sigmaCore: any; // Placeholder for actual type
  glyphSet: any; // Placeholder for actual type
  agents: { [id: string]: any };
  abilities: { [id: string]: any };
}

// Interface for a Pain Signal (from ⚡.json)
interface PainSignal {
  id: string;
  description: string;
  count: number;
  last_occurrence: string;
  details?: Record<string, unknown>;
}

export class CoreReflexLoop {
  private loadedGlyphs: LoadedGlyphs | null = null;
  private activeAgentId: string | null = null; 
  private tensorProcessor: λ7Processor; // Instance of the λ7Processor

  constructor(activeAgentId: string) {
    this.activeAgentId = activeAgentId;
    this.tensorProcessor = new λ7Processor(); // Initialize the tensor processor
  }

  /**
   * Initializes the reflex loop by loading all glyph definitions and instances.
   */
  async initialize(): Promise<void> {
    console.log("CoreReflexLoop: Initializing...");
    this.loadedGlyphs = await loadAllGlyphs();
    console.log("CoreReflexLoop: Glyphs loaded.");
  }

  /**
   * Represents the "Observe" phase of the reflex loop.
   * In a basic implementation, this could involve checking for new pain signals,
   * or external triggers.
   * @returns A context object representing observations, potentially including a Derivation.
   */
  private async observe(): Promise<any> {
    console.log("CoreReflexLoop: Observing...");
    const potentialError = Math.random() < 0.5; // 50% chance of an error for demonstration
    if (potentialError) {
        // If error, generate a derivation that records pain
        // A real derivation would be generated based on the specific error context.
        // For now, a dummy derivation that would eventually resolve to some form of 'record'
        const recordPainDerivation: Derivation = [Morphism.Apply, Morphism.Not, Morphism.Cond]; 
        return {
            type: "potential_pain",
            data: { id: "simulated-error", description: "A random simulated error occurred." },
            derivation: recordPainDerivation 
        };
    }
    // If no error, maybe a derivation for idle state
    return { type: "no_event", derivation: [Morphism.I] }; // Idle derivation: pure Identity
  }

  /**
   * Represents the "Evaluate" phase of the reflex loop.
   * The system uses its loaded glyphs to make sense of observations.
   * @param observation The data returned from the observe phase.
   * @returns An object describing the evaluation, e.g., what action to take.
   */
  private async evaluate(observation: any): Promise<any> {
    console.log("CoreReflexLoop: Evaluating...");
    if (observation.derivation) {
        // If an observation yields a derivation, we process it.
        return { action: "process_derivation", derivation: observation.derivation, observationData: observation.data };
    }
    // Fallback if no derivation from observation
    return { action: "idle" };
  }

  /**
   * Represents the "Act" phase of the reflex loop.
   * The system executes a chosen action, typically by processing a Derivation with λ7Processor.
   * @param evaluation The result from the evaluate phase, dictating the action.
   * @returns The result of the action (e.g., final Field state from λ7Processor).
   */
  private async act(evaluation: any): Promise<any> {
    console.log("CoreReflexLoop: Acting...");
    if (evaluation.action === "process_derivation" && evaluation.derivation) {
        console.log(`CoreReflexLoop: Processing Derivation: ${evaluation.derivation.map(m => MORPHISM_NAMES[m]).join(', ')}`);
        const finalField = await this.tensorProcessor.eval(evaluation.derivation);
        
        // If the derivation was for pain, also record the pain using the old ability
        if (evaluation.observationData?.id === "simulated-error") {
            const painRecordResult = await recordPainAbility(evaluation.observationData);
            console.log(`  Pain record result: ${painRecordResult.success}`);
        }

        return { type: "processor_result", finalField: finalField };
    }
    return { type: "no_action" };
  }

  /**
   * Represents the "Learn/Evolve" phase of the reflex loop.
   * The system updates its state or "learns" from the outcome of its actions.
   * @param actionResult The result from the act phase.
   */
  private async learnAndEvolve(actionResult: any): Promise<void> {
    console.log("CoreReflexLoop: Learning and Evolving...");
    // Update agent's state (🜄) based on the final field from the tensor processor.
    if (this.activeAgentId && this.loadedGlyphs?.agents[this.activeAgentId]) {
        const agent = this.loadedGlyphs.agents[this.activeAgentId];
        if (!agent['🧬']['🜄']) {
            agent['🧬']['🜄'] = {};
        }
        agent['🧬']['🜄'].lastReflexTime = new Date().toISOString();
        
        if (actionResult.type === "processor_result" && actionResult.finalField) {
            // Integrate the 7D field state into the agent's glyphic state.
            const dominantMorphism = actionResult.finalField.indexOf(Math.max(...actionResult.finalField));
            agent['🧬']['🜄'].lastComputedDominantMorphism = MORPHISM_NAMES[dominantMorphism as Morphism];
            agent['🧬']['🜄'].tensorFieldState = Array.from(actionResult.finalField); // Store a copy of the field
            console.log(`Agent ${this.activeAgentId} state updated with Tensor Field result:`, agent['🧬']['🜄']);
        }
    }
  }

  /**
   * Runs one iteration of the core reflex loop.
   */
  async runOneIteration(): Promise<void> {
    if (!this.loadedGlyphs) {
      await this.initialize();
    }
    const observation = await this.observe();
    const evaluation = await this.evaluate(observation);
    const actionResult = await this.act(evaluation);
    await this.learnAndEvolve(actionResult);
    console.log("CoreReflexLoop: Iteration complete.");
  }
}

// Example usage (for testing)
if (import.meta.main) {
  const myAgentId = "agent://my-first-agent"; // Use the ID we defined in my-first-agent.🧬.yaml
  const loop = new CoreReflexLoop(myAgentId);
  loop.runOneIteration()
    .then(() => console.log("Core Reflex Loop finished one iteration."))
    .catch((error) => console.error("Core Reflex Loop error:", error));
}