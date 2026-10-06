import type { FormRendererEmits, FormRendererProps } from '../types';
import type { UseFormEngineReturn } from './useFormEngine';

export function useRendererActions(form: UseFormEngineReturn, props: FormRendererProps, emit: FormRendererEmits) {
  async function run(action: () => Promise<boolean>) {
    if (props.loading) return;
    try { await action(); }
    catch (error) {
      if (props.onError) props.onError(error);
      else form.engine.setErrors({ _form: error instanceof Error ? error.message : 'Form action failed' });
    }
  }
  const next = () => run(() => form.engine.nextStepAsync());
  const prev = () => run(() => form.engine.prevStepAsync());
  function update(key: string, value: unknown) {
    if (props.loading || form.engine.stepValidating || form.engine.submitting) return;
    form.engine.setValue(key, value);
    emit('fieldChange', key, value, form.engine.values);
  }
  function commit(key: string, value: unknown) {
    const engine = form.engine;
    if (props.loading || engine.stepValidating || engine.submitting) return;
    const step = engine.currentStep;
    const field = engine.visibleFields.find((field) => field.key === key);
    if (!field) return;
    update(key, value);
    if (field.autoAdvance && engine.currentStep?.id === step?.id && !engine.isLastStep) void run(() => engine.nextStepAsync('autoAdvance'));
  }
  const submit = () => run(async () => {
    const engine = form.engine;
    const result = await engine.submitAsync(async (values) => {
      emit('analyticsEvent', { type: 'form_submitted', fieldCount: Object.keys(values).length });
      if (props.submitHandler) await props.submitHandler(values);
      emit('submit', values);
    });
    if (!result) {
      for (const [fieldKey, error] of Object.entries(engine.errors)) {
        emit('analyticsEvent', { type: 'field_error', fieldKey, error });
      }
    }
    return result;
  });
  return { update, commit, next, prev, submit };
}
