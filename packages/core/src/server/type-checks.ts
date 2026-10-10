import type { FormField } from '../types';
import { isBlank } from '../visibility';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRING_TYPES = new Set(['text', 'email', 'phone', 'password', 'textarea', 'date', 'datetime', 'autocomplete', 'select', 'radio']);
const CHOICE_TYPES = new Set(['select', 'radio']);
const BOOLEAN_TYPES = new Set(['checkbox', 'switch']);

const TYPE_MESSAGES = {
  email: 'Enter a valid email',
  number: 'Enter a number',
  boolean: 'Must be true or false',
  option: 'Select one of the available options',
  string: 'Must be text',
};

export function normalizeValue(field: FormField, value: unknown): unknown {
  if (field.type !== 'number' || typeof value !== 'string' || value.trim() === '') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

function isOption(field: FormField, value: unknown): boolean {
  return !field.options || field.options.some((option) => option.value === value);
}

function multiselectError(field: FormField, value: unknown): string | null {
  const valid = Array.isArray(value) && value.every((item) => typeof item === 'string' && isOption(field, item));
  return valid ? null : TYPE_MESSAGES.option;
}

export function typeError(field: FormField, value: unknown): string | null {
  if (isBlank(value)) return null;
  if (BOOLEAN_TYPES.has(field.type)) return typeof value === 'boolean' ? null : TYPE_MESSAGES.boolean;
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value) ? null : TYPE_MESSAGES.number;
  if (field.type === 'multiselect') return multiselectError(field, value);
  if (!STRING_TYPES.has(field.type)) return null;
  if (typeof value !== 'string') return TYPE_MESSAGES.string;
  if (field.type === 'email' && !EMAIL.test(value)) return TYPE_MESSAGES.email;
  return CHOICE_TYPES.has(field.type) && !isOption(field, value) ? TYPE_MESSAGES.option : null;
}
