import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { validateSubmission } from '../../src/server';
import type { FormDefinition } from '../../src';

interface SubmissionFixture {
  name: string;
  definition: FormDefinition;
  input: { values: Record<string, unknown>; skippedSteps: string[] };
  expected: { values: Record<string, unknown>; errors: Record<string, string> };
}

const fixturesDir = join(__dirname, '../../fixtures/submissions');
const iifePath = join(__dirname, '../../dist/server.iife.js');
const fixtures: SubmissionFixture[] = readdirSync(fixturesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(join(fixturesDir, file), 'utf8')));

describe('validateSubmission fixtures', () => {
  it.each(fixtures.map((fixture) => [fixture.name, fixture] as const))('%s', (_, { definition, input, expected }) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(validateSubmission(definition, input.values, { skippedSteps: input.skippedSteps })).toEqual(expected);
  });
});

describe('validateSubmission', () => {
  it('does not mutate the input values', () => {
    const { definition, input } = fixtures.find((fixture) => fixture.name === 'skip-allowed')!;
    const values = structuredClone(input.values);
    validateSubmission(definition, values, { skippedSteps: input.skippedSteps });
    expect(values).toEqual(input.values);
  });

  it('treats non-object values and skippedSteps as empty', () => {
    const { definition } = fixtures.find((fixture) => fixture.name === 'skip-allowed')!;
    const result = validateSubmission(definition, null as never, { skippedSteps: 'extras' as never });
    expect(result.values).toEqual({ tier: 'basic' });
    expect(Object.keys(result.errors)).toEqual(['name', 'phone', 'terms']);
  });
});

describe.skipIf(!existsSync(iifePath))('server IIFE build', () => {
  it('runs every fixture without a console global', () => {
    const context: { Formhaus?: { validateSubmission: typeof validateSubmission } } = {};
    runInNewContext(readFileSync(iifePath, 'utf8'), context);
    for (const { definition, input, expected } of fixtures) {
      const result = context.Formhaus!.validateSubmission(definition, input.values, { skippedSteps: input.skippedSteps });
      expect(JSON.parse(JSON.stringify(result))).toEqual(expected);
    }
  });
});
