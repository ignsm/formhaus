import type { FieldComponentProps } from '@formhaus/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldShell } from './FieldShell';

export function SelectField({ field, value, error, loading, disabled, onChange }: FieldComponentProps) {
  const options = field.options ?? [];

  return (
    <FieldShell field={field} error={error}>
      <Select
        items={options}
        value={typeof value === 'string' && value !== '' ? value : null}
        disabled={disabled || loading}
        onValueChange={(next) => onChange(next ?? '')}
      >
        <SelectTrigger id={field.key} className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder={field.placeholder ?? 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}
