import { describe, expect, it } from 'vitest';
import { validateDefinitionTool } from '../src/validate';
import { branching, linear } from './fixtures';

describe('validate_definition', () => {
  it('accepts a valid definition', async () => {
    const report = await validateDefinitionTool({ definition: branching });
    expect(report).toMatchObject({ valid: true, errors: [], warnings: [] });
  });

  it('accepts a JSON string', async () => {
    const report = await validateDefinitionTool({ definition: JSON.stringify(linear) });
    expect(report.valid).toBe(true);
  });

  it('reports malformed JSON', async () => {
    const report = await validateDefinitionTool({ definition: '{ "id": ' });
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toMatch(/not valid JSON/);
  });

  it('reports missing required props', async () => {
    const report = await validateDefinitionTool({ definition: { steps: [{ id: 's', fields: [{ key: 'a' }] }] } });
    expect(report.valid).toBe(false);
    expect(report.errors).toEqual(expect.arrayContaining([
      'Definition is missing "id".',
      'submit must be an object with a non-empty "label".',
      'steps[0] is missing "title".',
      'steps[0].fields[0] is missing "type".',
    ]));
  });

  it('reports route errors the engine rejects', async () => {
    const definition = { ...linear, steps: [{ ...linear.steps[0], routes: [{ to: 'missing' }] }, linear.steps[1]] };
    const report = await validateDefinitionTool({ definition });
    expect(report.valid).toBe(false);
    expect(report.errors.join('\n')).toMatch(/Invalid route from "name" to "missing"/);
  });

  it('rejects fields and steps together', async () => {
    const report = await validateDefinitionTool({ definition: { ...linear, fields: linear.steps[0].fields } });
    expect(report.errors).toContain('Definition cannot have both non-empty "fields" and "steps".');
  });

  it('returns core warnings for likely mistakes', async () => {
    const definition = {
      id: 'x', title: 'X', submit: { label: 'Send' },
      fields: [
        { key: 'a', type: 'text', label: 'A', show: [{ field: 'ghost', eq: 'yes' }] },
        { key: 'b', type: 'text', label: 'B', validation: { pattern: '[' } },
        { key: 'c', type: 'select', label: 'C' },
      ],
    };
    const report = await validateDefinitionTool({ definition });
    expect(report.valid).toBe(true);
    expect(report.warnings).toEqual(expect.arrayContaining([
      'Field "a" has show condition referencing non-existent field "ghost"',
      'Field "b" has invalid regex pattern: "["',
      'fields[2] of type "select" has no "options" or "optionsFrom".',
    ]));
  });
});
