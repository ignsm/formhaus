import type { FieldType, FormAnalyticsEvent, FormSchema, ValidatorFn } from '@formhaus/core';
import type { ComponentType } from 'react';

export interface FieldComponentProps {
  field: import('@formhaus/core').FormField;
  value: unknown;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

export type FieldComponentMap = Partial<Record<FieldType, ComponentType<FieldComponentProps>>>;

export interface FormRendererProps {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel?: () => void;
  onStepChange?: (stepId: string, direction: 'next' | 'back') => void;
  onFieldChange?: (key: string, value: unknown, allValues: Record<string, unknown>) => void;
  validators?: Record<string, ValidatorFn>;
  errors?: Record<string, string>;
  loading?: boolean;
  components?: FieldComponentMap;
  onAnalyticsEvent?: (event: FormAnalyticsEvent) => void;
}
