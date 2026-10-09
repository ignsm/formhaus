import type { FormDefinition, FormField, ShowCondition } from '@formhaus/core';

interface Conditional {
  show?: ShowCondition[];
  showAny?: ShowCondition[];
}

function allFields(draft: FormDefinition): FormField[] {
  return [...(draft.fields ?? []), ...(draft.steps ?? []).flatMap((step) => step.fields)];
}

function conditions(draft: FormDefinition): ShowCondition[] {
  const owners: Conditional[] = [
    ...allFields(draft),
    ...(draft.steps ?? []),
    ...(draft.steps ?? []).flatMap((step) => step.routes ?? []),
  ];
  return owners.flatMap((owner) => [...(owner.show ?? []), ...(owner.showAny ?? [])]);
}

export function referencedKeys(draft: FormDefinition): Set<string> {
  const keys = new Set(conditions(draft).map((condition) => condition.field));
  for (const field of allFields(draft)) {
    if (field.validation?.matchField) keys.add(field.validation.matchField);
    for (const key of field.optionsDependsOn ?? []) keys.add(key);
  }
  return keys;
}

export function referencedValues(draft: FormDefinition, key: string): Set<string> {
  const values = new Set<string>();
  for (const condition of conditions(draft).filter((item) => item.field === key)) {
    for (const value of [condition.eq, condition.neq, ...(condition.in ?? []), ...(condition.notIn ?? [])]) {
      if (value !== undefined) values.add(String(value));
    }
  }
  const field = allFields(draft).find((item) => item.key === key);
  if (field?.defaultValue !== undefined) values.add(String(field.defaultValue));
  return values;
}

export function referencedSteps(draft: FormDefinition): Set<string> {
  return new Set((draft.steps ?? []).flatMap((step) => step.routes ?? []).map((route) => route.to).filter((to): to is string => Boolean(to)));
}
