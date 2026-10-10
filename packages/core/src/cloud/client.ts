import type { FormDefinition } from '../types';
import { isStepVisible } from '../visibility';
import { toCloudError } from './error';

export const DEFAULT_API_BASE = 'https://api.formhaus.dev';

export interface CloudSubmission {
  id: string;
  values: Record<string, unknown>;
}

export interface CloudClientOptions {
  id: string;
  apiBase?: string;
}

function endpoint({ id, apiBase = DEFAULT_API_BASE }: CloudClientOptions): string {
  return `${apiBase.replace(/\/+$/, '')}/f/${encodeURIComponent(id)}`;
}

export async function fetchDefinition(options: CloudClientOptions, signal?: unknown): Promise<FormDefinition> {
  const response = await fetch(`${endpoint(options)}/definition`, { signal });
  if (!response.ok) throw await toCloudError(response);
  return await response.json() as FormDefinition;
}

export function findSkippedSteps(definition: FormDefinition, values: Record<string, unknown>): string[] {
  return (definition.steps ?? [])
    .filter((step) => step.skip && step.fields.length > 0 && isStepVisible(step, values))
    .filter((step) => step.fields.every(({ key }) => !(key in values)))
    .map(({ id }) => id);
}

export function createSubmitter(options: CloudClientOptions) {
  let pending: { body: string; key: string } | null = null;

  return async (definition: FormDefinition, values: Record<string, unknown>): Promise<CloudSubmission> => {
    const body = JSON.stringify({ values, skippedSteps: findSkippedSteps(definition, values) });
    if (pending?.body !== body) pending = { body, key: crypto.randomUUID() };
    const response = await fetch(endpoint(options), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': pending.key },
      body,
    });
    if (!response.ok) throw await toCloudError(response);
    pending = null;
    return await response.json() as CloudSubmission;
  };
}
