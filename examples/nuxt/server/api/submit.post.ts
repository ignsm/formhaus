import { FormEngine } from '@formhaus/core';
import { definition } from '~~/shared/definition';
import { serverValidators } from '../validators';

export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a JSON object' });
  }

  const engine = new FormEngine(definition, body as Record<string, unknown>, { validators: serverValidators });
  const errors = engine.validate();
  if (Object.keys(errors).length > 0) {
    setResponseStatus(event, 422);
    return { errors };
  }

  return { values: engine.getSubmitValues() };
});
