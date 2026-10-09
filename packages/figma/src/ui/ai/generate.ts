import { FormEngine, validateDefinition, type FormDefinition } from '@formhaus/core';
import { firstJsonObject, repairMessage, requestMessage, SCHEMA_URL, SYSTEM_PROMPT, type ChatMessage } from './prompt';
import { complete, type ProviderId } from './providers';

export interface GenerateRequest {
  provider: ProviderId;
  key: string;
  description: string;
  current?: FormDefinition;
  signal?: AbortSignal;
}

export interface Checked {
  definition?: FormDefinition;
  errors: string[];
}

function shapeErrors(value: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const name of ['id', 'title'] as const) if (typeof value[name] !== 'string' || !value[name]) errors.push(`"${name}" must be a non-empty string.`);
  if (typeof (value.submit as { label?: unknown } | undefined)?.label !== 'string') errors.push('"submit" must be an object with a "label".');
  if (!Array.isArray(value.fields) && !Array.isArray(value.steps)) errors.push('Add "fields" or "steps".');
  return errors;
}

function engineError(definition: FormDefinition): string | null {
  try {
    new FormEngine(definition);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function checkReply(text: string): Checked {
  let value: unknown;
  try {
    value = firstJsonObject(text);
  } catch (error) {
    return { errors: [error instanceof Error ? error.message : String(error)] };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { errors: ['The reply must be a JSON object.'] };
  const record = value as Record<string, unknown>;
  const errors = shapeErrors(record);
  if (errors.length) return { errors };
  const definition = { $schema: SCHEMA_URL, ...record } as unknown as FormDefinition;
  const failure = engineError(definition);
  return { definition, errors: failure ? [failure] : validateDefinition(definition) };
}

export interface Generated {
  definition: FormDefinition;
  warnings: string[];
}

export async function generateDefinition(request: GenerateRequest): Promise<Generated> {
  const messages: ChatMessage[] = [requestMessage(request.description, request.current)];
  let result: Checked = { errors: [] };
  for (let round = 0; round < 2; round++) {
    const reply = await complete(request.provider, request.key, SYSTEM_PROMPT, messages, request.signal);
    result = checkReply(reply);
    if (!result.errors.length) break;
    messages.push({ role: 'assistant', content: reply }, repairMessage(result.errors));
  }
  const { definition } = result;
  if (!definition || engineError(definition)) throw new Error(`The generated form is not valid: ${result.errors.join(' ')}`);
  if (request.current) definition.id = request.current.id;
  return { definition, warnings: result.errors };
}
