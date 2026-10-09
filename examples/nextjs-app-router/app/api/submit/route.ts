import { FormEngine } from '@formhaus/core';
import { definition } from '@/form/definition';
import { serverValidators } from '@/form/validators';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json({ errors: {} }, { status: 400 });
  }

  const engine = new FormEngine(definition, body as Record<string, unknown>, { validators: serverValidators });
  const errors = engine.validate();
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 422 });
  }

  return Response.json({ values: engine.getSubmitValues() });
}
