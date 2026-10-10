import { CloudError, createSubmitter, fetchDefinition, type CloudSubmission } from '@formhaus/core/cloud';
import type { FormDefinition } from '@formhaus/core';
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue';

interface CloudFormOptions {
  id: () => string;
  apiBase: () => string | undefined;
  onSuccess: (submission: CloudSubmission) => void;
  onError: () => ((error: unknown) => void) | undefined;
}

export function useCloudForm(options: CloudFormOptions) {
  const definition = shallowRef<FormDefinition | null>(null);
  const loadError = ref<Error | null>(null);
  const errors = ref<Record<string, string>>({});
  const done = ref(false);
  const submitter = computed(() => createSubmitter({ id: options.id(), apiBase: options.apiBase() }));
  let controller: AbortController | undefined;

  watch([options.id, options.apiBase], ([id, apiBase]) => {
    controller?.abort();
    const current = new AbortController();
    controller = current;
    definition.value = null;
    loadError.value = null;
    errors.value = {};
    done.value = false;
    fetchDefinition({ id, apiBase }, current.signal).then((loaded) => { definition.value = loaded; }, (error: Error) => {
      if (current.signal.aborted) return;
      loadError.value = error;
      options.onError()?.(error);
    });
  }, { immediate: true });
  onScopeDispose(() => controller?.abort());

  async function submit(values: Record<string, unknown>) {
    try {
      const submission = await submitter.value(definition.value!, values);
      done.value = true;
      options.onSuccess(submission);
    } catch (error) {
      if (error instanceof CloudError && error.errors) errors.value = error.errors;
      throw error;
    }
  }

  return { definition, loadError, errors, done, submit };
}
