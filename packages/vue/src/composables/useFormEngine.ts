import {
  FormEngine,
  type FormEngineOptions,
  type FormField,
  type FormSchema,
  type FormStep,
} from '@formhaus/core';
import { type ComputedRef, computed, ref } from 'vue';

export interface UseFormEngineReturn {
  engine: FormEngine;
  values: ComputedRef<Record<string, unknown>>;
  errors: ComputedRef<Record<string, string>>;
  topLevelErrors: ComputedRef<string[]>;
  fieldLoading: ComputedRef<Record<string, boolean>>;
  visibleFields: ComputedRef<FormField[]>;
  visibleSteps: ComputedRef<FormStep[]>;
  currentStep: ComputedRef<FormStep | null>;
  isFirstStep: ComputedRef<boolean>;
  isLastStep: ComputedRef<boolean>;
  canGoNext: ComputedRef<boolean>;
  progress: ComputedRef<{ current: number; total: number }>;
  isMultiStep: ComputedRef<boolean>;
}

export function useFormEngine(
  schema: FormSchema,
  initialValues?: Record<string, unknown>,
  options?: FormEngineOptions,
): UseFormEngineReturn {
  const engine = new FormEngine(schema, initialValues, options);
  const version = ref(0);

  engine.subscribe(() => {
    version.value++;
  });

  return {
    engine,
    values: computed(() => {
      version.value;
      return engine.values;
    }),
    errors: computed(() => {
      version.value;
      return engine.errors;
    }),
    topLevelErrors: computed(() => {
      version.value;
      return engine.topLevelErrors;
    }),
    fieldLoading: computed(() => {
      version.value;
      return engine.fieldLoading;
    }),
    visibleFields: computed(() => {
      version.value;
      return engine.visibleFields;
    }),
    visibleSteps: computed(() => {
      version.value;
      return engine.visibleSteps;
    }),
    currentStep: computed(() => {
      version.value;
      return engine.currentStep;
    }),
    isFirstStep: computed(() => {
      version.value;
      return engine.isFirstStep;
    }),
    isLastStep: computed(() => {
      version.value;
      return engine.isLastStep;
    }),
    canGoNext: computed(() => {
      version.value;
      return engine.canGoNext;
    }),
    progress: computed(() => {
      version.value;
      return engine.progress;
    }),
    isMultiStep: computed(() => {
      version.value;
      return engine.isMultiStep;
    }),
  };
}
