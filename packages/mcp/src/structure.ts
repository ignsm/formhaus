import { isRecord } from './definition-input';
import { CONDITION_OPERATORS, FIELD_TYPES, OPTION_FIELD_TYPES } from './vocabulary';

export interface Findings {
  errors: string[];
  warnings: string[];
}

const KNOWN_TYPES = new Set<string>(FIELD_TYPES);
const OPTION_TYPES = new Set<string>(OPTION_FIELD_TYPES);

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function checkAction(value: unknown, path: string, findings: Findings, optional: boolean): void {
  if (value === undefined && optional) return;
  if (!isRecord(value) || !isText(value.label)) findings.errors.push(`${path} must be an object with a non-empty "label".`);
}

function checkConditions(owner: Record<string, unknown>, path: string, findings: Findings): void {
  for (const key of ['show', 'showAny'] as const) {
    const conditions = owner[key];
    if (conditions === undefined) continue;
    if (!Array.isArray(conditions)) {
      findings.errors.push(`${path}.${key} must be an array of conditions.`);
      continue;
    }
    conditions.forEach((condition, index) => {
      const at = `${path}.${key}[${index}]`;
      if (!isRecord(condition) || !isText(condition.field)) {
        findings.errors.push(`${at} must have a "field".`);
        return;
      }
      const operators = CONDITION_OPERATORS.filter((operator) => condition[operator] !== undefined);
      if (operators.length !== 1) {
        findings.warnings.push(`${at} should use exactly one operator of ${CONDITION_OPERATORS.join(', ')}; found ${operators.length}.`);
      }
    });
  }
}

function checkField(field: unknown, path: string, findings: Findings): void {
  if (!isRecord(field)) {
    findings.errors.push(`${path} must be an object.`);
    return;
  }
  for (const key of ['key', 'type', 'label'] as const) {
    if (!isText(field[key])) findings.errors.push(`${path} is missing "${key}".`);
  }
  const type = field.type;
  if (isText(type) && !KNOWN_TYPES.has(type)) {
    findings.warnings.push(`${path} uses custom type "${type}"; adapters need a component registered for it.`);
  }
  if (isText(type) && OPTION_TYPES.has(type) && !Array.isArray(field.options) && !isText(field.optionsFrom)) {
    findings.warnings.push(`${path} of type "${type}" has no "options" or "optionsFrom".`);
  }
  if (field.autoAdvance === true && type !== 'radio') {
    findings.warnings.push(`${path} has autoAdvance but only radio fields advance automatically.`);
  }
  checkConditions(field, path, findings);
}

function checkFields(fields: unknown, path: string, findings: Findings): void {
  if (!Array.isArray(fields)) {
    findings.errors.push(`${path} must be an array.`);
    return;
  }
  fields.forEach((field, index) => checkField(field, `${path}[${index}]`, findings));
}

function checkStep(step: unknown, path: string, findings: Findings): void {
  if (!isRecord(step)) {
    findings.errors.push(`${path} must be an object.`);
    return;
  }
  if (!isText(step.id)) findings.errors.push(`${path} is missing "id".`);
  if (!isText(step.title)) findings.errors.push(`${path} is missing "title".`);
  checkFields(step.fields, `${path}.fields`, findings);
  checkConditions(step, path, findings);
  if (step.next !== false) checkAction(step.next, `${path}.next`, findings, true);
  if (step.back !== false) checkAction(step.back, `${path}.back`, findings, true);
  checkAction(step.skip, `${path}.skip`, findings, true);
  if (step.routes === undefined) return;
  if (!Array.isArray(step.routes)) {
    findings.errors.push(`${path}.routes must be an array.`);
    return;
  }
  step.routes.forEach((route, index) => {
    const at = `${path}.routes[${index}]`;
    if (!isRecord(route) || !(route.to === null || isText(route.to))) {
      findings.errors.push(`${at} must have "to" set to a step id or null.`);
      return;
    }
    checkConditions(route, at, findings);
  });
}

export function checkStructure(definition: Record<string, unknown>): Findings {
  const findings: Findings = { errors: [], warnings: [] };
  if (!isText(definition.id)) findings.errors.push('Definition is missing "id".');
  if (!isText(definition.title)) findings.errors.push('Definition is missing "title".');
  checkAction(definition.submit, 'submit', findings, false);
  checkAction(definition.cancel, 'cancel', findings, true);
  const { fields, steps } = definition;
  const hasFields = Array.isArray(fields) && fields.length > 0;
  const hasSteps = Array.isArray(steps) && steps.length > 0;
  if (hasFields && hasSteps) findings.errors.push('Definition cannot have both non-empty "fields" and "steps".');
  if (!hasFields && !hasSteps) findings.warnings.push('Definition has no fields and no steps.');
  if (fields !== undefined) checkFields(fields, 'fields', findings);
  if (steps === undefined) return findings;
  if (!Array.isArray(steps)) findings.errors.push('"steps" must be an array.');
  else steps.forEach((step, index) => checkStep(step, `steps[${index}]`, findings));
  return findings;
}
