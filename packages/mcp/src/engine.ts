import { FormEngine, type FormDefinition } from '@formhaus/core';

export type EngineResult =
  | { ok: true; engine: FormEngine }
  | { ok: false; errors: string[] };

export function createEngine(definition: FormDefinition, values?: Record<string, unknown>): EngineResult {
  const warn = console.warn;
  console.warn = () => {};
  try {
    return { ok: true, engine: new FormEngine(definition, values) };
  } catch (error) {
    return { ok: false, errors: String((error as Error).message ?? error).split('\n') };
  } finally {
    console.warn = warn;
  }
}
