import type { FormEngine } from '../../src/engine';
import type { validateField, validateStep } from '../../src/validation';
import type { FormDefinition, FormField } from '../../src/types';
import type { ModelCommand } from './model.fixtures';

export interface EngineApi {
  FormEngine: new (definition: FormDefinition, values?: Record<string, unknown>, options?: object) => FormEngine;
  validateField: typeof validateField;
  validateStep: typeof validateStep;
}

interface Pending {
  resolve: (allowed: boolean) => void;
  reject: (error: Error) => void;
}

const stepIds = (engine: FormEngine) => engine.visibleSteps.map((step) => step.id).join('>');

async function flush(): Promise<void> {
  for (let index = 0; index < 12; index++) await Promise.resolve();
}

export async function runModel(
  api: EngineApi,
  definition: FormDefinition,
  initialValues: Record<string, unknown>,
  commands: ModelCommand[],
): Promise<void> {
  const pending: Pending[] = [];
  let generation = 0;
  const hook = (kind: 'validate' | 'guard') => () => new Promise<unknown>((resolve, reject) => {
    pending.push({ resolve: (allowed) => resolve(kind === 'validate' ? null : allowed), reject });
  });
  const engine = new api.FormEngine(definition, initialValues, {
    onStepValidate: hook('validate'),
    onBeforeStepChange: hook('guard'),
    onBeforeSubmit: hook('guard'),
  });
  const fields = new Map<string, FormField>(
    (definition.steps ?? []).flatMap((step) => step.fields).map((field) => [field.key, field]),
  );
  const fail = (message: string): never => {
    throw new Error(`${message}\nvalues=${JSON.stringify(engine.values)} errors=${JSON.stringify(engine.errors)} step=${engine.currentStep?.id} path=${stepIds(engine)}`);
  };

  const check = () => {
    const current = engine.currentStep;
    if (!current || !engine.visibleSteps.includes(current)) fail('current step is not on the active path');
    if (engine.stepValidating && engine.submitting) fail('navigation and submission pending at once');
    const pathFields = new Set(engine.visibleSteps.flatMap((step) => step.fields.map((field) => field.key)));
    const active = engine.getSubmitValues();
    for (const [key, message] of Object.entries(engine.errors)) {
      if (!pathFields.has(key)) fail(`error on off-path field ${key}`);
      const field = fields.get(key)!;
      if (!api.validateField(field, engine.values[key], active, {})) fail(`stale error on ${key}: ${message}`);
    }
  };

  const submit = () => {
    const startGeneration = generation;
    const startPath = stepIds(engine);
    return engine.submitAsync((payload) => {
      if (generation !== startGeneration) fail('submission dispatched after reset or cancel');
      if (stepIds(engine) !== startPath) fail('submission dispatched after the path changed');
      for (const step of engine.visibleSteps) {
        const errors = api.validateStep(step, payload, {});
        if (Object.keys(errors).length > 0) fail(`invalid payload dispatched: ${JSON.stringify(errors)}`);
      }
    });
  };

  const run = (action: Promise<unknown>) => { action.catch(() => {}); };

  for (const command of commands) {
    if (command.type === 'set') {
      const before = engine.currentStep?.id;
      engine.setValue(command.key, command.value);
      const stillActive = engine.visibleSteps.some((step) => step.id === before);
      if (stillActive && engine.currentStep?.id !== before) fail(`setValue moved the user off active step ${before}`);
    }
    if (command.type === 'next') run(engine.nextStepAsync());
    if (command.type === 'back') run(engine.prevStepAsync());
    if (command.type === 'submit') run(submit());
    if (command.type === 'syncNext') engine.nextStep();
    if (command.type === 'syncBack') engine.prevStep();
    if (command.type === 'reset') { generation++; engine.reset(); }
    if (command.type === 'cancel') { generation++; engine.cancelPendingActions(); }
    if (command.type === 'settle' && pending.length > 0) {
      const [entry] = pending.splice(command.index % pending.length, 1);
      if (command.outcome === 'fail') entry.reject(new Error('hook failed'));
      else entry.resolve(command.outcome === 'allow');
    }
    await flush();
    check();
  }

  while (pending.length > 0) {
    pending.shift()!.resolve(true);
    await flush();
  }
  check();
  if (engine.stepValidating || engine.submitting) fail('engine still busy after every hook settled');
}
