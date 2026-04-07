import { describe, expect, it } from 'vitest';

interface TestSchema {
  id?: string;
  title?: string;
  submit?: { label: string };
  fields?: { key: string; type: string; label: string }[];
  steps?: { id: string; title: string; fields: { key: string; type: string; label: string }[] }[];
}

function parseAndValidate(json: string): TestSchema {
  let parsed: TestSchema;
  try {
    parsed = JSON.parse(json);
  } catch (_e) {
    throw new Error('Invalid JSON. Check syntax and try again.');
  }
  if (!parsed.title) {
    throw new Error("Schema must have a 'title'.");
  }
  if (!parsed.fields && !parsed.steps) {
    throw new Error("Schema must have 'fields' (single-step) or 'steps' (multi-step).");
  }
  if (!parsed.submit) {
    throw new Error("Schema must have a 'submit' action.");
  }
  return parsed;
}

function countFields(schema: TestSchema): number {
  if (schema.fields) return schema.fields.length;
  return (schema.steps || []).reduce(
    (sum: number, s: { fields: unknown[] }) => sum + s.fields.length,
    0,
  );
}

function getSteps(schema: TestSchema) {
  if (schema.steps && schema.steps.length > 0) return schema.steps;
  return [{ title: schema.title, fields: schema.fields || [] }];
}

describe('parseAndValidate', () => {
  const valid = (overrides = {}) =>
    JSON.stringify({
      id: 'test',
      title: 'Test',
      submit: { label: 'Go' },
      fields: [{ key: 'name', type: 'text', label: 'Name' }],
      ...overrides,
    });

  it('parses a valid single-step schema', () => {
    const schema = parseAndValidate(valid());
    expect(schema.title).toBe('Test');
    expect(schema.fields).toHaveLength(1);
  });

  it('parses a valid multi-step schema', () => {
    const schema = parseAndValidate(
      valid({
        fields: undefined,
        steps: [
          { id: 's1', title: 'Step 1', fields: [{ key: 'a', type: 'text', label: 'A' }] },
          { id: 's2', title: 'Step 2', fields: [{ key: 'b', type: 'email', label: 'B' }] },
        ],
      }),
    );
    expect(schema.steps).toHaveLength(2);
  });

  it('throws on malformed JSON', () => {
    expect(() => parseAndValidate('{bad}')).toThrow('Invalid JSON');
  });

  it('throws when title is missing', () => {
    expect(() => parseAndValidate(JSON.stringify({ submit: { label: 'Go' }, fields: [] }))).toThrow(
      "'title'",
    );
  });

  it('throws when both fields and steps are missing', () => {
    expect(() => parseAndValidate(JSON.stringify({ title: 'T', submit: { label: 'Go' } }))).toThrow(
      "'fields'",
    );
  });

  it('throws when submit is missing', () => {
    expect(() => parseAndValidate(JSON.stringify({ title: 'T', fields: [] }))).toThrow("'submit'");
  });
});

describe('countFields', () => {
  it('counts single-step fields', () => {
    expect(countFields({ fields: [1, 2, 3] })).toBe(3);
  });

  it('counts multi-step fields', () => {
    expect(countFields({ steps: [{ fields: [1, 2] }, { fields: [3] }] })).toBe(3);
  });

  it('returns 0 for empty', () => {
    expect(countFields({ fields: [] })).toBe(0);
  });
});

describe('getSteps', () => {
  it('returns steps for multi-step schema', () => {
    const steps = getSteps({ steps: [{ title: 'A', fields: [] }] });
    expect(steps).toHaveLength(1);
    expect(steps[0].title).toBe('A');
  });

  it('wraps fields as single step for single-step schema', () => {
    const steps = getSteps({ title: 'Form', fields: [{ key: 'x' }] });
    expect(steps).toHaveLength(1);
    expect(steps[0].title).toBe('Form');
    expect(steps[0].fields).toHaveLength(1);
  });

  it('handles missing fields gracefully', () => {
    const steps = getSteps({ title: 'Empty' });
    expect(steps[0].fields).toEqual([]);
  });
});

describe('component mapping', () => {
  it('has entries for all core field types', () => {
    const map = require('../../src/component-map.example.json');
    const coreTypes = [
      'text',
      'email',
      'phone',
      'number',
      'password',
      'textarea',
      'select',
      'checkbox',
      'radio',
      'switch',
    ];
    for (const t of coreTypes) {
      expect(map.fields[t]).toBeDefined();
    }
  });

  it('Forms Constructor variants use valid type names', () => {
    const map = require('../../src/component-map.example.json');
    const validVariants = ['Input', 'Select', 'Textarea'];
    for (const [, cfg] of Object.entries(map.fields) as [string, Record<string, unknown>][]) {
      if (cfg.formsConstructorVariant) {
        expect(validVariants).toContain(cfg.formsConstructorVariant);
      }
    }
  });

  it('standalone fields have a standaloneKey or are marked missing', () => {
    const map = require('../../src/component-map.example.json');
    for (const [type, cfg] of Object.entries(map.fields) as [string, Record<string, unknown>][]) {
      if (cfg.standalone) {
        expect(cfg.standaloneKey || cfg.missing).toBeTruthy();
      }
    }
  });
});
