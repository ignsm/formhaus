import type { FormField } from '@formhaus/core';
import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FieldShellProps {
  field: FormField;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ field, error, children }: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : field.helperText ? (
        <p className="text-sm text-muted-foreground">{field.helperText}</p>
      ) : null}
    </div>
  );
}
