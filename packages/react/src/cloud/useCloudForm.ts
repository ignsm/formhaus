import { CloudError, createSubmitter, fetchDefinition, type CloudSubmission } from '@formhaus/core/cloud';
import type { FormDefinition } from '@formhaus/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CloudFormOptions {
  id: string;
  apiBase?: string;
  onSuccess?: (submission: CloudSubmission) => void;
  onError?: (error: unknown) => void;
}

export function useCloudForm({ id, apiBase, onSuccess, onError }: CloudFormOptions) {
  const [definition, setDefinition] = useState<FormDefinition | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const callbacks = useRef({ onSuccess, onError });
  callbacks.current = { onSuccess, onError };
  const submitter = useMemo(() => createSubmitter({ id, apiBase }), [id, apiBase]);

  useEffect(() => {
    const controller = new AbortController();
    setDefinition(null);
    setLoadError(null);
    setErrors({});
    setDone(false);
    fetchDefinition({ id, apiBase }, controller.signal).then(setDefinition, (error: Error) => {
      if (controller.signal.aborted) return;
      setLoadError(error);
      callbacks.current.onError?.(error);
    });
    return () => controller.abort();
  }, [id, apiBase]);

  const submit = useCallback(async (values: Record<string, unknown>) => {
    try {
      const submission = await submitter(definition!, values);
      setDone(true);
      callbacks.current.onSuccess?.(submission);
    } catch (error) {
      if (error instanceof CloudError && error.errors) setErrors(error.errors);
      throw error;
    }
  }, [submitter, definition]);

  return { definition, loadError, errors, done, submit };
}
