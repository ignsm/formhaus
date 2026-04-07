import { FormEngine, type FormEngineOptions, type FormSchema } from '@formhaus/core';
import { useRef, useSyncExternalStore } from 'react';

export function useFormEngine(
  schema: FormSchema,
  initialValues?: Record<string, unknown>,
  options?: FormEngineOptions,
): FormEngine {
  const engineRef = useRef<FormEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new FormEngine(schema, initialValues, options);
  }
  const engine = engineRef.current;

  // Subscribe to engine changes via useSyncExternalStore
  useSyncExternalStore(engine.subscribe.bind(engine), engine.getSnapshot.bind(engine));

  return engine;
}
