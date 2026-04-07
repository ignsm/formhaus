import type { ShowCondition } from './field';

export interface FormAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'text';
  action?: string;
  disabled?: ShowCondition[];
}
