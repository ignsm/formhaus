import type { FieldOption, FormDefinition, FormField, FormStep } from '@formhaus/core';

export const FIELD_TYPES = [
  'text', 'email', 'phone', 'number', 'password', 'textarea', 'select', 'autocomplete',
  'multiselect', 'radio', 'checkbox', 'switch', 'date', 'datetime', 'file',
] as const;

const OPTION_TYPES = new Set(['select', 'autocomplete', 'multiselect', 'radio']);

export function hasOptions(field: FormField): boolean {
  return OPTION_TYPES.has(field.type) || (field.type === 'checkbox' && Boolean(field.options?.length));
}

export function keyFromLabel(label: string, taken: Set<string>): string {
  const words = label.normalize('NFKD').replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const base = words.map((word, index) => (index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase())).join('') || 'field';
  const safe = /^\d/.test(base) ? `field${base}` : base;
  let key = safe;
  for (let index = 2; taken.has(key); index++) key = `${safe}${index}`;
  return key;
}

export function emptyForm(): FormDefinition {
  return { id: `form-${Date.now().toString(36)}`, title: 'New form', submit: { label: 'Submit' }, fields: [] };
}

export function steps(draft: FormDefinition): FormStep[] {
  if (draft.steps?.length) return draft.steps;
  return [{ id: 'main', title: draft.title, fields: draft.fields ?? [] }];
}

export function isMultiStep(draft: FormDefinition): boolean {
  return Boolean(draft.steps?.length);
}

function allKeys(draft: FormDefinition): Set<string> {
  return new Set(steps(draft).flatMap((step) => step.fields.map((field) => field.key)));
}

function isReferenced(draft: FormDefinition, token: string): boolean {
  return JSON.stringify(draft).split(`"${token}"`).length > 2;
}

function fieldsOf(draft: FormDefinition, stepIndex: number): FormField[] {
  if (!isMultiStep(draft)) {
    draft.fields ??= [];
    return draft.fields;
  }
  return draft.steps![stepIndex].fields;
}

export function addField(draft: FormDefinition, stepIndex: number, type: string): FormField {
  const label = 'New field';
  const field: FormField = { key: keyFromLabel(label, allKeys(draft)), type, label };
  if (OPTION_TYPES.has(type)) field.options = [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }];
  fieldsOf(draft, stepIndex).push(field);
  return field;
}

export function renameField(draft: FormDefinition, field: FormField, label: string): void {
  const autoKey = field.key === keyFromLabel(field.label, new Set());
  field.label = label;
  if (!autoKey || isReferenced(draft, field.key)) return;
  const taken = allKeys(draft);
  taken.delete(field.key);
  field.key = keyFromLabel(label, taken);
}

export function setRequired(field: FormField, required: boolean): void {
  const rest = { ...field.validation };
  delete rest.required;
  field.validation = required ? { ...rest, required: true } : rest;
  if (Object.keys(field.validation).length === 0) delete field.validation;
}

export function setType(field: FormField, type: string): void {
  field.type = type;
  if (OPTION_TYPES.has(type) && !field.options?.length) field.options = [{ value: 'option1', label: 'Option 1' }];
  if (!OPTION_TYPES.has(type) && type !== 'checkbox') delete field.options;
}

export function removeField(draft: FormDefinition, stepIndex: number, fieldIndex: number): void {
  fieldsOf(draft, stepIndex).splice(fieldIndex, 1);
}

export function moveField(draft: FormDefinition, from: [number, number], to: [number, number]): void {
  const [field] = fieldsOf(draft, from[0]).splice(from[1], 1);
  const target = fieldsOf(draft, to[0]);
  const index = from[0] === to[0] && to[1] > from[1] ? to[1] - 1 : to[1];
  target.splice(Math.min(index, target.length), 0, field);
}

export function addStep(draft: FormDefinition): void {
  if (!isMultiStep(draft)) {
    draft.steps = [{ id: 'step-1', title: 'Step 1', fields: draft.fields ?? [] }];
    delete draft.fields;
  }
  const ids = new Set(draft.steps!.map((step) => step.id));
  let index = draft.steps!.length + 1;
  while (ids.has(`step-${index}`)) index++;
  draft.steps!.push({ id: `step-${index}`, title: `Step ${index}`, fields: [] });
}

export function removeStep(draft: FormDefinition, stepIndex: number): void {
  if (!isMultiStep(draft)) return;
  const [removed] = draft.steps!.splice(stepIndex, 1);
  if (draft.steps!.length === 0) {
    draft.fields = removed.fields;
    delete draft.steps;
  }
}

export function addOption(field: FormField): void {
  const options = (field.options ??= []);
  const values = new Set(options.map((option) => option.value));
  const label = `Option ${options.length + 1}`;
  options.push({ value: keyFromLabel(label, values), label });
}

export function renameOption(draft: FormDefinition, field: FormField, option: FieldOption, label: string): void {
  const autoValue = option.value === keyFromLabel(option.label, new Set());
  option.label = label;
  if (!autoValue || isReferenced(draft, option.value)) return;
  const values = new Set((field.options ?? []).filter((item) => item !== option).map((item) => item.value));
  option.value = keyFromLabel(label, values);
}
