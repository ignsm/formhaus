import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';
import { SCHEMA_OUTPUTS, buildSchema, serializeSchema } from '../../scripts/schema.mjs';

const repoRoot = resolve(__dirname, '../../../..');
const jsonFiles = (dir: string) =>
  readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => resolve(dir, name));
const examples = [
  ...jsonFiles(resolve(repoRoot, 'examples/definitions')),
  ...jsonFiles(resolve(repoRoot, 'packages/core/fixtures')),
  resolve(repoRoot, 'examples/react-quiz/src/quiz.json'),
];

const committed = readFileSync(SCHEMA_OUTPUTS[0], 'utf8');
const validate = new Ajv({ allErrors: true, allowUnionTypes: true }).compile(JSON.parse(committed));

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

const validDefinition = () => ({
  id: 'form',
  title: 'Form',
  submit: { label: 'Submit' },
  steps: [
    {
      id: 'one',
      title: 'One',
      fields: [{ key: 'name', type: 'text', label: 'Name' }],
      routes: [{ to: null }],
    },
  ],
});

describe('form definition JSON Schema', () => {
  it('matches the TypeScript types', () => {
    const expected = serializeSchema(buildSchema());
    for (const output of SCHEMA_OUTPUTS) {
      expect(readFileSync(output, 'utf8'), `${output} is stale, run pnpm --filter @formhaus/core schema`).toBe(expected);
    }
  }, 60_000);

  it.each(examples.map((path) => [relative(repoRoot, path), path]))('accepts %s', (_name, path) => {
    expect(validate(readJson(path)), JSON.stringify(validate.errors)).toBe(true);
  });

  it('accepts a minimal definition', () => {
    expect(validate(validDefinition())).toBe(true);
  });

  it('accepts a $schema reference', () => {
    expect(validate({ $schema: 'https://formhaus.dev/schema/form-definition.json', ...validDefinition() })).toBe(true);
  });

  it('rejects a definition without id', () => {
    const { id: _id, ...definition } = validDefinition();
    expect(validate(definition)).toBe(false);
  });

  it('rejects an unknown field type', () => {
    const definition = validDefinition();
    definition.steps[0].fields[0].type = 'colorpicker';
    expect(validate(definition)).toBe(false);
  });

  it('rejects a route without to', () => {
    const definition = validDefinition();
    definition.steps[0].routes = [{} as { to: null }];
    expect(validate(definition)).toBe(false);
  });

  it('rejects unknown properties', () => {
    expect(validate({ ...validDefinition(), layout: 'grid' })).toBe(false);
  });
});
