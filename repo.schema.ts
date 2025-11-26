import { z } from "zod";
import {
  SigmaSeedSchema,
  SigmaIntentSchema,
  SigmaStateSchema,
  SigmaLinkSchema,
  SigmaSpecSchema,
} from "./🧠/🧬/seed.schema.ts";

/**
 * Specialized schema for the repository's intent.
 * The goal and role are more specific for a repo.
 */
const RepoIntentSchema = SigmaIntentSchema.extend({
  goal: z.literal("To contain and evolve a self-describing digital organism."),
  role: z.literal("The root cell and container for the entire system."),
});

/**
 * The specific schema for the Repository Seed.
 * It extends the base SigmaSeedSchema with stricter types and default values.
 */
export const RepoSeedSchema = SigmaSeedSchema.extend({
  kind: z.literal("repo"),
  intent: RepoIntentSchema,
  
  // A repo itself doesn't have direct I/O, so we can make this more specific.
  io: z.object({
    input: z.array(z.any()).length(0), // No inputs
    output: z.array(z.any()).length(0), // No outputs
  }),

  // Links might point to core modules or concepts it's built upon.
  links: z.array(SigmaLinkSchema).optional(),

  // The spec for a repo points to its own schema.
  spec: SigmaSpecSchema.extend({
    schema: z.literal("repo.schema.ts"),
  }),
});

// We can also infer the TypeScript type from the schema.
export type RepoSeed = z.infer<typeof RepoSeedSchema>;
