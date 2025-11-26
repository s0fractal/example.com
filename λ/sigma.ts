/**
 * @file sigma.ts
 * @description The formal type definitions for Σ-🧬 v1.
 * These types define the "DNA" of the living code organism.
 */

export interface Sigma🧬 {
  id: string; // 🧬://...
  kind: SigmaKind; // 😇|morphism|module|...
  intent: SigmaIntent;
  state: SigmaState;
  links: SigmaLink[];
  io: SigmaIO;
  spec: SigmaSpec;
}

export type SigmaKind =
  | "😇"
  | "morphism"
  | "module"
  | "directory"
  | "repo"
  | "glyph"
  | "pattern"
  | "🧬"
  | "intent"
  | "sim";

export interface SigmaIntent {
  goal: string;
  role: string;
  conditions: string[];
  provides: string[];
  requires: string[];
}

export interface SigmaState {
  energy: number;
  trust: number;
  health: number;
  last_updated: number;
  metrics: Record<string, number>;
}

export interface SigmaLink {
  rel: string;
  ref: string; // 🧬://...
}

export interface SigmaIO {
  input: SigmaIOField[];
  output: SigmaIOField[];
}

export interface SigmaIOField {
  name: string;
  type: string;
}

export interface SigmaSpec {
  schema: string;
  types: Record<string, any>;
  constraints: string[];
  vars?: Record<string, any>;
}
