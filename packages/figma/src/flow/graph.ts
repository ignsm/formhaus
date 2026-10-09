import type { FormDefinition, FormField, FormStep, ShowCondition } from '@formhaus/core';

export interface FlowEdge {
  from: string;
  to: string | null;
  label: string;
}

export interface FlowGraph {
  branching: boolean;
  depth: Map<string, number>;
  edges: FlowEdge[];
}

function fieldsByKey(steps: FormStep[]): Map<string, FormField> {
  return new Map(steps.flatMap((step) => step.fields.map((field) => [field.key, field] as const)));
}

function valueText(field: FormField | undefined, value: unknown): string {
  return field?.options?.find((option) => option.value === String(value))?.label ?? String(value);
}

export function describeCondition(condition: ShowCondition, fields: Map<string, FormField>): string {
  const field = fields.get(condition.field);
  const name = field?.label ?? condition.field;
  const list = (values: (string | number)[]) => values.map((value) => valueText(field, value)).join(' or ');
  if (condition.notEmpty) return `${name} is filled`;
  if (condition.eq !== undefined) return `${name} is ${valueText(field, condition.eq)}`;
  if (condition.neq !== undefined) return `${name} is not ${valueText(field, condition.neq)}`;
  if (condition.in) return `${name} is ${list(condition.in)}`;
  if (condition.notIn) return `${name} is not ${list(condition.notIn)}`;
  return name;
}

export function describeConditions(owner: { show?: ShowCondition[]; showAny?: ShowCondition[] }, fields: Map<string, FormField>): string {
  const all = (owner.show ?? []).map((condition) => describeCondition(condition, fields)).join(' and ');
  const any = (owner.showAny ?? []).map((condition) => describeCondition(condition, fields)).join(' or ');
  return [all, any].filter(Boolean).join(' and ');
}

function stepEdges(steps: FormStep[], index: number, fields: Map<string, FormField>): FlowEdge[] {
  const step = steps[index];
  const routes = step.routes ?? [];
  const edges = routes.map((route, order) => ({ from: step.id, to: route.to, label: describeConditions(route, fields) || (order > 0 ? 'Otherwise' : '') }));
  if (routes.some((route) => !route.show?.length && !route.showAny?.length)) return edges;
  const next = steps[index + 1];
  return [...edges, { from: step.id, to: next?.id ?? null, label: routes.length > 0 ? 'Otherwise' : '' }];
}

function merged(edges: FlowEdge[]): FlowEdge[] {
  const result: FlowEdge[] = [];
  for (const edge of edges) {
    const same = result.find((item) => item.from === edge.from && item.to === edge.to);
    if (same) same.label = [same.label, edge.label.toLowerCase()].filter(Boolean).join(' or ');
    else result.push({ ...edge });
  }
  return result;
}

export function buildGraph(definition: FormDefinition): FlowGraph {
  const steps = definition.steps ?? [];
  const fields = fieldsByKey(steps);
  const edges = merged(steps.flatMap((_, index) => stepEdges(steps, index, fields)));
  const depth = new Map<string, number>(steps.length ? [[steps[0].id, 0]] : []);
  for (const step of steps) {
    const own = depth.get(step.id) ?? 0;
    depth.set(step.id, own);
    for (const edge of edges.filter((item) => item.from === step.id && item.to)) {
      depth.set(edge.to!, Math.max(depth.get(edge.to!) ?? 0, own + 1));
    }
  }
  return { branching: steps.some((step) => step.routes?.length), depth, edges };
}
