import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';
import { FormEngine, validateDefinition } from '../../src';
import { SCHEMA_OUTPUTS } from '../../scripts/schema.mjs';

const specPath = resolve(__dirname, '../../../../docs/spec.md');
const spec = readFileSync(specPath, 'utf8');
const blocks = [...spec.matchAll(/^```json\n([\s\S]*?)^```$/gm)].map((match) => match[1]);
const schema = JSON.parse(readFileSync(SCHEMA_OUTPUTS[0], 'utf8'));
const validate = new Ajv({ allErrors: true, allowUnionTypes: true }).compile(schema);

describe('specification examples', () => {
  it('contains json examples', () => {
    expect(blocks.length).toBeGreaterThanOrEqual(2);
  });

  it.each(blocks.map((block, index) => [index + 1, block]))('example %i is a valid definition', (_index, block) => {
    const definition = JSON.parse(block);
    expect(validate(definition), JSON.stringify(validate.errors)).toBe(true);
    expect(validateDefinition(definition)).toEqual([]);
    expect(() => new FormEngine(definition)).not.toThrow();
  });

  it('follows the routes described for the complete example', () => {
    const definition = JSON.parse(blocks[blocks.length - 1]);
    const engine = new FormEngine(definition, { accountType: 'personal', company: 'Acme' });
    expect(engine.visibleSteps.map((step) => step.id)).toEqual(['kind', 'personal', 'contact', 'newsletter']);
    expect(engine.getSubmitValues()).not.toHaveProperty('company');
    engine.setValue('accountType', 'waitlist');
    expect(engine.visibleSteps.map((step) => step.id)).toEqual(['kind']);
  });
});
