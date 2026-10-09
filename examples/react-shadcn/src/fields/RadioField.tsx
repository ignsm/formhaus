import type { FieldComponentProps } from '@formhaus/react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldShell } from './FieldShell';

export function RadioField({ field, value, error, loading, disabled, onChange }: FieldComponentProps) {
  return (
    <FieldShell field={field} error={error}>
      <RadioGroup
        id={field.key}
        value={typeof value === 'string' ? value : null}
        disabled={disabled || loading}
        aria-invalid={!!error}
        onValueChange={(next) => onChange(next)}
      >
        {(field.options ?? []).map((option) => (
          <Label key={option.value} className="font-normal">
            <RadioGroupItem value={option.value} />
            {option.label}
          </Label>
        ))}
      </RadioGroup>
    </FieldShell>
  );
}
